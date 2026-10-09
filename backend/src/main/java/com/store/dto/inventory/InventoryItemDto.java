package com.store.dto.inventory;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemDto {
    private Integer warehouseId;
    private String warehouseName;
    private String warehouseAddress;
    private Long variantId;
    private Long productId;
    private String productName;
    private String sku;
    private String attributes;
    private Integer quantity;
    private Integer reservedQty;
    private Integer availableQty;
    private Integer reorderLevel;
    private String status; // IN_STOCK, LOW_STOCK, OUT_OF_STOCK
    private OffsetDateTime updatedAt;
}
