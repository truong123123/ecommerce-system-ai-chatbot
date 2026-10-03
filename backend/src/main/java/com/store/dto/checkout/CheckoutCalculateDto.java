package com.store.dto.checkout;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutCalculateDto {
    private Integer totalItems;
    private BigDecimal subtotal;
    private BigDecimal directDiscount;
    private BigDecimal voucherDiscount;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;
    private BigDecimal totalSavings;
    private boolean isFreeShipping;
    private BigDecimal freeShippingThreshold;
    private AppliedVoucher appliedVoucher;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AppliedVoucher {
        private String code;
        private BigDecimal discount;
        private String description;
    }
}
