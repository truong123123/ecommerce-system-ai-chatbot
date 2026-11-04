package com.store.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPaymentDto {
    private Long id;
    private Long orderId;
    private String orderCode;
    private String customerName;
    private String customerEmail;
    private String paymentMethod;
    private String provider;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String providerTxnRef;
    private String providerTransactionNo;
    private OffsetDateTime createdAt;
    private OffsetDateTime paidAt;
}

