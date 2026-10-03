package com.store.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Long orderItemId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 14, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "unit_cost", nullable = false, precision = 14, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "line_total", insertable = false, updatable = false, precision = 14, scale = 2)
    private BigDecimal lineTotal;

    @Column(name = "product_name_snapshot", length = 255)
    private String productNameSnapshot;

    @Column(name = "product_image_snapshot", length = 500)
    private String productImageSnapshot;

    @Column(name = "original_price", precision = 14, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "sale_price", precision = 14, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "flash_sale_item_id")
    private Long flashSaleItemId;
}
