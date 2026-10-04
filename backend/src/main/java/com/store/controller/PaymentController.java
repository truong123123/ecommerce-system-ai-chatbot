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
        log.info("Nhận VNPAY IPN Callback: {}", allParams);

        String secureHash = allParams.get("vnp_SecureHash");
        boolean validSignature = vnPayService.verifySignature(allParams, secureHash);
        if (!validSignature) {
            log.warn("VNPAY IPN chữ ký không hợp lệ!");
            return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid Checksum"));
        }

        String txnRef = allParams.get("vnp_TxnRef");
        if (txnRef == null || txnRef.isEmpty()) {
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
            long vnpAmount = Long.parseLong(vnpAmountStr);
            long expectedAmount = txn.getAmount().longValue() * 100;
            if (vnpAmount != expectedAmount) {
                log.warn("Số tiền không khớp: VNPAY = {}, Database = {}", vnpAmount, expectedAmount);
                return ResponseEntity.ok(Map.of("RspCode", "04", "Message", "Invalid Amount"));
            }
        }

        if ("SUCCESS".equalsIgnoreCase(txn.getStatus())) {
            return ResponseEntity.ok(Map.of("RspCode", "02", "Message", "Order already confirmed"));
        }

        String responseCode = allParams.get("vnp_ResponseCode");
        String transactionNo = allParams.get("vnp_TransactionNo");

        if ("00".equals(responseCode)) {
            checkoutService.handlePaymentSuccess(txnRef, transactionNo, allParams.toString());
            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
        } else {
            checkoutService.handlePaymentFailure(txnRef, allParams.toString());
            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
        }
    }

    /**
     * General Provider Webhook via POST
     */
    @PostMapping("/callback/{provider}")
    public ResponseEntity<Map<String, Object>> handleGenericCallback(
            @PathVariable String provider,
            @RequestBody Map<String, Object> body
    ) {
        log.info("Nhận callback từ cổng {}: {}", provider, body);
        String txnRef = (String) body.get("orderId");
        if (txnRef != null) {
            checkoutService.handlePaymentSuccess(txnRef, (String) body.get("transId"), body.toString());
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Callback processed"));
    }
}
