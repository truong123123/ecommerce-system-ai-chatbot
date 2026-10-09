package com.store.dto.inventory;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryMovementDto {
    private Long movementId;
    private Integer warehouseId;
    private String warehouseName;
    private Long variantId;
    private String sku;
    private String productName;
    private Integer changeQty;
    private String reason;
    private Long referenceId;
    private String staffName;
    private OffsetDateTime createdAt;
}
