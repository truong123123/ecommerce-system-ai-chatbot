package com.store.controller;

import com.store.payment.VNPayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final VNPayService vnPayService;

    public PaymentController(VNPayService vnPayService) {
        this.vnPayService = vnPayService;
    }

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
}
