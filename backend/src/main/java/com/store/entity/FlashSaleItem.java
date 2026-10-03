package com.store.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "flash_sale_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSaleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    @JsonIgnore
    private FlashSaleCampaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id")
    @JsonIgnore
    private FlashSaleTimeSlot timeSlot;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false)
    private String name;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "original_price", precision = 14, scale = 2, nullable = false)
    private BigDecimal originalPrice;

    @Column(name = "sale_price", precision = 14, scale = 2, nullable = false)
    private BigDecimal salePrice;

    @Column(name = "discount_percent")
    @Builder.Default
    private Integer discountPercent = 0;

    @Column(name = "sold_count")
    @Builder.Default
    private Integer soldCount = 0;

    @Column(name = "total_stock", nullable = false)
    @Builder.Default
    private Integer totalStock = 10;

    @Column(name = "reserved_quantity", nullable = false)
    @Builder.Default
    private Integer reservedQuantity = 0;

    @Column(name = "max_quantity_per_user")
    @Builder.Default
    private Integer maxQuantityPerUser = 1;

    @Column(length = 50)
    @Builder.Default
    private String status = "AVAILABLE"; // AVAILABLE, SOLD_OUT
}
