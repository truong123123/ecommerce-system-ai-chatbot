package com.store.controller;

import com.store.entity.PaymentTransaction;
import com.store.payment.VNPayService;
import com.store.repository.PaymentTransactionRepository;
import com.store.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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

    @PostMapping("/vnpay")
    public ResponseEntity<Map<String, Object>> createVNPayPayment(@RequestBody Map<String, Object> req) {
        String orderCode = (String) req.getOrDefault("orderCode", "SK-" + System.currentTimeMillis());
        long amount = Number.class.cast(req.getOrDefault("amount", 29990000)).longValue();

        String paymentUrl = vnPayService.createPaymentUrl(orderCode, amount, "127.0.0.1");

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("paymentUrl", paymentUrl);
        response.put("orderCode", orderCode);
        return ResponseEntity.ok(response);
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
        if (vnpAmountStr != null) {
            try {
                long vnpAmount = Long.parseLong(vnpAmountStr);
                long expectedAmount = txn.getAmount().longValue() * 100;
                if (vnpAmount != expectedAmount) {
                    log.warn("Số tiền không khớp: VNPAY = {}, Database = {}", vnpAmount, expectedAmount);
                    return ResponseEntity.ok(Map.of("RspCode", "04", "Message", "Invalid Amount"));
                }
            } catch (NumberFormatException e) {
                return ResponseEntity.ok(Map.of("RspCode", "04", "Message", "Invalid Amount Format"));
            }
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
