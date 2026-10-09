package com.store.dto.account;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerOrderDetailDto {
    private Long orderId;
    private String orderCode;
    private OffsetDateTime orderDate;
    private String status;
    private String statusLabel;
    private BigDecimal totalAmount;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private String paymentMethod;
    private String paymentStatus;

    // Delivery info
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String storeName;

    // Items
    private List<OrderItemSummaryDto> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemSummaryDto {
        private Long orderItemId;
        private Long productId;
        private Long variantId;
        private String productName;
        private String productImage;
        private String sku;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;
        private boolean canReview;
        private Long reviewId;
    }
}
