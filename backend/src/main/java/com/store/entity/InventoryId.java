package com.store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Builder
public class InventoryId implements Serializable {

    @Column(name = "warehouse_id")
    private Integer warehouseId;

    @Column(name = "variant_id")
    private Long variantId;
}
