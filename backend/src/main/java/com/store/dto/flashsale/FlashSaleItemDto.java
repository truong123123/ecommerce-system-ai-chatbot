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
    private String sku;
    private String imageUrl;
    private BigDecimal originalPrice;
    private BigDecimal salePrice;
    private Integer discountPercent;
    private Integer soldCount;
    private Integer totalStock;
    private Integer reservedQuantity;
    private Integer maxQuantityPerUser;
    private Integer displayOrder;
    private Integer availableInventory; // Tồn kho thực tế
    private String status; // AVAILABLE, SOLD_OUT, STOPPED
    private Double progressPercent;
    private Long version;

    public String getImage() {
        return imageUrl;
    }

    public Integer getSold() {
        return soldCount != null ? soldCount : 0;
    }

    public Integer getQuota() {
        return totalStock != null ? totalStock : 0;
    }
}
