package com.store.dto.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
    private Long cartId;
    
    @Builder.Default
    private List<CartItemDto> items = new ArrayList<>();
    
    private CouponInfo appliedCoupon;
    private CartSummary summary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CouponInfo {
        private String code;
        private BigDecimal discount;
        private String type; // fixed or percent
        private BigDecimal value;
        private BigDecimal minOrderValue;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartSummary {
        private Integer totalItems;
        private Integer selectedItemsCount;
        private BigDecimal subtotal;
        private BigDecimal directDiscount;
        private BigDecimal couponDiscount;
        private BigDecimal shippingFee;
        private BigDecimal total;
        private BigDecimal totalSavings;
    }
}
