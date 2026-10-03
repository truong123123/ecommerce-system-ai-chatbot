package com.store.dto.flashsale;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleItemDto {
    private Long id;
    private Long campaignId;
    private Long slotId;
    private Long productId;
    private String productSlug;
    private String name;
    private String imageUrl;
    private BigDecimal originalPrice;
    private BigDecimal salePrice;
    private Integer discountPercent;
    private Integer soldCount;
    private Integer totalStock;
    private Integer maxQuantityPerUser;
    private String status; // AVAILABLE, SOLD_OUT
    private Double progressPercent;
}
