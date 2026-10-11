package com.store.controller;

import com.store.entity.Order;
import com.store.entity.OrderStatus;
import com.store.entity.PaymentTransaction;
import com.store.payment.VNPayService;
import com.store.repository.OrderRepository;
import com.store.repository.PaymentTransactionRepository;
import com.store.service.CheckoutService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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

    @PostMapping("/vnpay")
    public ResponseEntity<?> createVNPayPayment(@RequestBody Map<String, Object> req, HttpServletRequest request) {
        String orderCode = (String) req.get("orderCode");
        if (orderCode == null || orderCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Mã đơn hàng (orderCode) không được để trống"));
        }

        Order order = orderRepository.findByOrderCode(orderCode.trim()).orElse(null);
        String txnRef;
        long serverSideAmount;

        if (order != null) {
            if (order.getStatus() == OrderStatus.paid || order.getStatus() == OrderStatus.completed) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Đơn hàng đã được thanh toán trước đó"));
            }
            serverSideAmount = order.getTotalAmount().longValue();
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
        } else {
            PaymentTransaction txn = paymentTransactionRepository.findByProviderTxnRef(orderCode.trim()).orElse(null);
            if (txn != null) {
                if ("SUCCESS".equalsIgnoreCase(txn.getStatus())) {
                    return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Giao dịch đã được thanh toán thành công trước đó"));
                }
                serverSideAmount = txn.getAmount().longValue();
                txnRef = txn.getProviderTxnRef();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Không tìm thấy đơn hàng hoặc giao dịch với mã: " + orderCode));
            }
        }

        String clientIp = extractClientIp(request);
        // Tuyệt đối không dùng amount do client gửi lên; chỉ dùng serverSideAmount từ DB
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
     * VNPAY Server-to-Server IPN Callback via HTTP GET
     */
    @GetMapping("/callback/vnpay")
    public ResponseEntity<Map<String, String>> handleVnPayIpn(@RequestParam Map<String, String> allParams) {
        String secureHash = allParams.get("vnp_SecureHash");
        boolean validSignature = vnPayService.verifySignature(allParams, secureHash);
        if (!validSignature) {
            log.warn("VNPAY IPN chữ ký không hợp lệ! txnRef: {}", allParams.get("vnp_TxnRef"));
            return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid Checksum"));
        }

        String txnRef = allParams.get("vnp_TxnRef");
        if (txnRef == null || txnRef.trim().isEmpty()) {
            return ResponseEntity.ok(Map.of("RspCode", "01", "Message", "Order not found"));
        }

        PaymentTransaction txn = paymentTransactionRepository.findByProviderTxnRef(txnRef).orElse(null);
        if (txn == null) {
            log.warn("Không tìm thấy giao dịch với txnRef = {}", txnRef);
            return ResponseEntity.ok(Map.of("RspCode", "01", "Message", "Order not found"));
        }

        // Kiểm tra số tiền: vnp_Amount = amount * 100
        String vnpAmountStr = allParams.get("vnp_Amount");
        if (vnpAmountStr == null || vnpAmountStr.trim().isEmpty()) {
            log.warn("Thiếu tham số vnp_Amount trong callback!");
            return ResponseEntity.ok(Map.of("RspCode", "04", "Message", "Invalid Amount"));
        }
        try {
            long vnpAmount = Long.parseLong(vnpAmountStr);
            long expectedAmount = txn.getAmount().longValue() * 100;
            if (vnpAmount != expectedAmount) {
                log.warn("Số tiền không khớp: VNPAY = {}, Database = {}", vnpAmount, expectedAmount);
                return ResponseEntity.ok(Map.of("RspCode", "04", "Message", "Invalid Amount"));
            }
        } catch (NumberFormatException e) {
            log.warn("Định dạng vnp_Amount không hợp lệ: {}", vnpAmountStr);
            return ResponseEntity.ok(Map.of("RspCode", "04", "Message", "Invalid Amount Format"));
        }

        // Idempotency: Kiểm tra nếu đơn hàng đã được xử lý (SUCCESS hoặc FAILED)
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
     * Reject all POST requests to payment callbacks (VNPay IPN requires GET only)
     */
    @PostMapping(value = {"/callback", "/callback/**"})
    public ResponseEntity<?> rejectPostCallback() {
        log.warn("Từ chối callback qua HTTP POST - Cổng thanh toán chỉ hỗ trợ GET IPN.");
        return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                .body(Map.of("RspCode", "99", "Message", "POST callback is forbidden. Only GET IPN callbacks are supported."));
    }
}
