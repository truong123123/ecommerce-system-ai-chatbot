package com.store.controller;

import com.store.dto.admin.AdminPaymentDto;
import com.store.entity.PaymentTransaction;
import com.store.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentTransactionRepository paymentTransactionRepository;

    @GetMapping
    public ResponseEntity<List<AdminPaymentDto>> getAllPayments() {
        List<PaymentTransaction> list = paymentTransactionRepository.findAllByOrderByCreatedAtDesc();
        List<AdminPaymentDto> dtos = list.stream().map(pt -> {
            String customerName = null;
            String customerEmail = null;
            String orderCode = null;
            Long orderId = null;
            if (pt.getOrder() != null) {
                orderId = pt.getOrder().getOrderId();
                orderCode = pt.getOrder().getOrderCode();
                customerName = pt.getOrder().getCustomerName();
                customerEmail = pt.getOrder().getCustomerEmail();
                if (customerName == null && pt.getOrder().getCustomer() != null) {
                    customerName = pt.getOrder().getCustomer().getFullName();
                }
                if (customerEmail == null && pt.getOrder().getCustomer() != null) {
                    customerEmail = pt.getOrder().getCustomer().getEmail();
                }
            }
            return AdminPaymentDto.builder()
                    .id(pt.getId())
                    .orderId(orderId)
                    .orderCode(orderCode)
                    .customerName(customerName)
                    .customerEmail(customerEmail)
                    .paymentMethod(pt.getPaymentMethod())
                    .provider(pt.getProvider())
                    .amount(pt.getAmount())
                    .currency(pt.getCurrency())
                    .status(pt.getStatus())
                    .providerTxnRef(pt.getProviderTxnRef())
                    .providerTransactionNo(pt.getProviderTransactionNo())
                    .createdAt(pt.getCreatedAt())
                    .paidAt(pt.getPaidAt())
                    .build();
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}

