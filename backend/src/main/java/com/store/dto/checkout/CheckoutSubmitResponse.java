package com.store.dto.checkout;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutSubmitResponse {
    private Long orderId;
    private String orderCode;
    private String status;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String paymentUrl;
    private String qrPayload;
    private OffsetDateTime expiresAt;
    private String message;
}
