package com.store.dto.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {
    private Long cartItemId; // mapping to variantId
    private Long variantId;
    private Long productId;
    private String name;
    private String sku;
    private String slug;
    private String imageUrl;
    private Object attributes;
    private BigDecimal price; // current sale price
    private BigDecimal originalPrice; // cost or regular price before discount
    private BigDecimal discountAmount;
    private Integer quantity;
    private Integer stockQuantity;
    private Boolean inStock;
    private Boolean isSelected;
    private BigDecimal lineTotal;
}
