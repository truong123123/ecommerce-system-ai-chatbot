package com.store.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "flash_sale_slot_products", uniqueConstraints = {
        @UniqueConstraint(name = "uq_slot_product", columnNames = {"slot_id", "product_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSaleSlotProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    @JsonIgnore
    private FlashSaleSlot slot;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "sale_price", nullable = false)
    private Long salePrice;

    @Column(name = "original_price", nullable = false)
    private Long originalPrice;

    @Column(nullable = false)
    private Integer quota;

    @Column(nullable = false)
    @Builder.Default
    private Integer sold = 0;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
