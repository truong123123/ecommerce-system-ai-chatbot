package com.store.dto.checkout;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutPreviewDto {

    private CustomerInfo customer;
    private List<ItemPreview> items;
    private PricingSummary pricing;
    private AddressPreview defaultAddress;
    private BigDecimal freeShippingThreshold;
    private BigDecimal standardShippingFee;
    private String idempotencyKey;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerInfo {
        private Long customerId;
        private String fullName;
        private String email;
        private String phone;
        private String membershipTier; // e.g. "S-Student", "S-NULL"
        private Integer loyaltyPoints;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemPreview {
        private Long variantId;
        private Long productId;
        private String name;
        private String sku;
        private String imageUrl;
        private Integer quantity;
        private BigDecimal salePrice;
        private BigDecimal originalPrice;
        private BigDecimal discountAmount;
        private BigDecimal lineTotal;
        private boolean inStock;
        private boolean isFlashSale;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PricingSummary {
        private Integer totalItems;
        private BigDecimal subtotal;
        private BigDecimal directDiscount;
        private BigDecimal voucherDiscount;
        private BigDecimal shippingFee;
        private BigDecimal totalAmount;
        private BigDecimal totalSavings;
        private boolean isFreeShipping;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddressPreview {
        private Long addressId;
        private String receiverName;
        private String receiverPhone;
        private String province;
        private String district;
        private String ward;
        private String streetAddress;
    }
}
