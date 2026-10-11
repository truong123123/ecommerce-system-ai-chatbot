package com.store.controller;

import com.store.entity.Customer;
import com.store.entity.Order;
import com.store.entity.OrderStatus;
import com.store.entity.PaymentTransaction;
import com.store.payment.VNPayService;
import com.store.repository.CustomerRepository;
import com.store.repository.OrderRepository;
import com.store.repository.PaymentTransactionRepository;
import com.store.service.CheckoutService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payment")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final VNPayService vnPayService;
    private final CheckoutService checkoutService;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    /**
     * BƯỚC 6: Khởi tạo thanh toán VNPay
     * Bắt buộc: (1) Đăng nhập (401), (2) Đơn thuộc chính khách (403), (3) status pending_payment, expiresAt, VNPAY method, (4) bỏ qua amount client.
     */
    @PostMapping("/vnpay")
    public ResponseEntity<?> createVNPayPayment(@RequestBody Map<String, Object> req, HttpServletRequest request) {
        // (1) Yêu cầu đăng nhập
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Vui lòng đăng nhập để thực hiện thanh toán."));
        }

        String orderCode = (String) req.get("orderCode");
        if (orderCode == null || orderCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Mã đơn hàng (orderCode) không được để trống"));
        }

        Customer currentCustomer = customerRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);

        Order order = orderRepository.findByOrderCode(orderCode.trim()).orElse(null);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Không tìm thấy đơn hàng với mã: " + orderCode));
        }

        // (2) Chỉ chấp nhận đơn thuộc về chính khách đang đăng nhập (chống IDOR)
        if (currentCustomer != null && order.getCustomer() != null
                && !order.getCustomer().getCustomerId().equals(currentCustomer.getCustomerId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Bạn không có quyền thanh toán cho đơn hàng của người khác."));
        }

        // (3) Kiểm tra trạng thái: chỉ cho status pending_payment
        if (order.getStatus() != OrderStatus.pending_payment) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Đơn hàng không ở trạng thái chờ thanh toán (hiện tại: " + order.getStatus() + ")."));
        }

        // (3) Kiểm tra phương thức thanh toán phải là VNPAY
        if (order.getPaymentMethod() == null || !"VNPAY".equalsIgnoreCase(order.getPaymentMethod().trim())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Phương thức thanh toán của đơn hàng không phải là VNPAY."));
        }

        // (3) Kiểm tra hết hạn expiresAt
        if (order.getExpiresAt() != null && order.getExpiresAt().isBefore(OffsetDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Đơn hàng đã hết thời gian chờ thanh toán."));
        }

        // (4) Bỏ qua hoàn toàn amount gửi từ client; lấy trực tiếp từ database
        long serverSideAmount = order.getTotalAmount().longValue();

        String txnRef;
        List<PaymentTransaction> txns = paymentTransactionRepository.findByOrderOrderIdOrderByCreatedAtDesc(order.getOrderId());
        if (!txns.isEmpty()) {
            txnRef = txns.get(0).getProviderTxnRef();
        } else {
            txnRef = "VNP_" + order.getOrderCode() + "_" + System.currentTimeMillis();
            PaymentTransaction newTxn = PaymentTransaction.builder()
                    .order(order)
                    .paymentMethod("VNPAY")
                    .provider("VNPAY")
                    .amount(order.getTotalAmount())
                    .currency("VND")
                    .status("INITIATED")
                    .providerTxnRef(txnRef)
                    .build();
            paymentTransactionRepository.save(newTxn);
        }

        String clientIp = extractClientIp(request);
        String paymentUrl = vnPayService.createPaymentUrl(txnRef, serverSideAmount, clientIp);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("paymentUrl", paymentUrl);
        response.put("orderCode", orderCode);
        response.put("txnRef", txnRef);
        response.put("amount", serverSideAmount);
        return ResponseEntity.ok(response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isBlank() || "unknown".equalsIgnoreCase(clientIp)) {
            clientIp = request.getHeader("X-Real-IP");
        }
        if (clientIp == null || clientIp.isBlank() || "unknown".equalsIgnoreCase(clientIp)) {
            clientIp = request.getRemoteAddr();
        }
        if (clientIp != null && clientIp.contains(",")) {
            clientIp = clientIp.split(",")[0].trim();
        }
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = "127.0.0.1";
        }
        return clientIp;
    }

    /**
     * BƯỚC 5: VNPAY Server-to-Server IPN Callback qua HTTP GET
     * Đảm bảo khóa bi quan dòng PaymentTransaction và kiểm tra vnp_TmnCode, vnp_Amount, idempotency
     */
    @GetMapping("/callback/vnpay")
    @Transactional
    public ResponseEntity<Map<String, String>> handleVnPayIpn(@RequestParam Map<String, String> allParams) {
        String secureHash = allParams.get("vnp_SecureHash");
        boolean validSignature = vnPayService.verifySignature(allParams, secureHash);
        if (!validSignature) {
            log.warn("VNPAY IPN chữ ký không hợp lệ! txnRef: {}", allParams.get("vnp_TxnRef"));
            return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid Checksum"));
        }

        // Kiểm tra vnp_TmnCode khớp cấu hình hệ thống (sai trả 97)
        String receivedTmn = allParams.get("vnp_TmnCode");
        String configuredTmn = vnPayService.getVnpTmnCode();
        if (receivedTmn == null || !receivedTmn.trim().equalsIgnoreCase(configuredTmn)) {
            log.warn("VNPAY IPN sai mã TMN Code! Nhận: {}, Cấu hình: {}", receivedTmn, configuredTmn);
            return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid TMN Code"));
        }

        String txnRef = allParams.get("vnp_TxnRef");
        if (txnRef == null || txnRef.trim().isEmpty()) {
            return ResponseEntity.ok(Map.of("RspCode", "01", "Message", "Order not found"));
        }

        // Khóa bi quan dòng PaymentTransaction (PESSIMISTIC_WRITE) để ngăn race-condition IPN
        PaymentTransaction txn = paymentTransactionRepository.findByProviderTxnRefForUpdate(txnRef.trim()).orElse(null);
        if (txn == null) {
            log.warn("Không tìm thấy giao dịch với txnRef = {}", txnRef);
            return ResponseEntity.ok(Map.of("RspCode", "01", "Message", "Order not found"));
        }

        // Kiểm tra bắt buộc tham số vnp_Amount
        String vnpAmountStr = allParams.get("vnp_Amount");
        if (vnpAmountStr == null || vnpAmountStr.trim().isEmpty()) {
            log.warn("Thiếu tham số vnp_Amount trong callback!");
            return ResponseEntity.ok(Map.of("RspCode", "04", "Message", "Invalid Amount"));
        }

        long vnpAmountLong;
        try {
            vnpAmountLong = Long.parseLong(vnpAmountStr.trim());
        } catch (NumberFormatException e) {
            log.warn("Định dạng vnp_Amount không phải là số hợp lệ: {}", vnpAmountStr);
            return ResponseEntity.ok(Map.of("RspCode", "99", "Message", "Invalid Number Format"));
        }

        // So sánh BigDecimal với txn.amount * 100
        BigDecimal vnpAmount = BigDecimal.valueOf(vnpAmountLong);
        BigDecimal expectedAmount = txn.getAmount().multiply(BigDecimal.valueOf(100));
        if (vnpAmount.compareTo(expectedAmount) != 0) {
            log.warn("Số tiền không khớp: VNPAY = {}, Database txn = {}", vnpAmount, expectedAmount);
            return ResponseEntity.ok(Map.of("RspCode", "04", "Message", "Invalid Amount"));
        }

        // Idempotency: Kiểm tra nếu giao dịch đã được xử lý (SUCCESS hoặc FAILED)
        if ("SUCCESS".equalsIgnoreCase(txn.getStatus()) || "FAILED".equalsIgnoreCase(txn.getStatus())) {
            log.info("Giao dịch VNPay IPN #{} đã xử lý trước đó với trạng thái: {}. Trả về RspCode 02 (Idempotent).", txnRef, txn.getStatus());
            return ResponseEntity.ok(Map.of("RspCode", "02", "Message", "Order already confirmed"));
        }

        String responseCode = allParams.get("vnp_ResponseCode");
        String transactionNo = allParams.get("vnp_TransactionNo");

        log.info("Xử lý VNPay IPN hợp lệ - txnRef: {}, transactionNo: {}, responseCode: {}, vnpAmount: {}",
                txnRef, transactionNo, responseCode, vnpAmountStr);

        if ("00".equals(responseCode)) {
            checkoutService.handlePaymentSuccess(txnRef, transactionNo, "VNPAY_SUCCESS");
            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
        } else {
            checkoutService.handlePaymentFailure(txnRef, "VNPAY_FAILED_" + responseCode);
            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
        }
    }

    /**
     * Tra cứu trạng thái đơn hàng thật từ backend (dùng cho frontend /checkout/success)
     */
    @GetMapping("/order-status/{orderCode}")
    public ResponseEntity<?> getOrderStatus(@PathVariable String orderCode) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để xem trạng thái đơn hàng."));
        }

        Order order = orderRepository.findByOrderCode(orderCode.trim()).orElse(null);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy đơn hàng"));
        }

        Customer currentCustomer = customerRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
        if (currentCustomer != null && order.getCustomer() != null
                && !order.getCustomer().getCustomerId().equals(currentCustomer.getCustomerId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Không có quyền xem đơn hàng của người khác"));
        }

        Map<String, Object> res = new HashMap<>();
        res.put("orderCode", order.getOrderCode());
        res.put("status", order.getStatus().name());
        res.put("totalAmount", order.getTotalAmount());
        res.put("paymentMethod", order.getPaymentMethod());
        return ResponseEntity.ok(res);
    }

    /**
     * Từ chối toàn bộ request POST tới callback
     */
    @PostMapping(value = {"/callback", "/callback/**"})
    public ResponseEntity<?> rejectPostCallback() {
        log.warn("Từ chối callback qua HTTP POST - Cổng thanh toán chỉ hỗ trợ GET IPN.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("RspCode", "99", "Message", "POST callback is forbidden. Only GET IPN callbacks are supported."));
    }
}
