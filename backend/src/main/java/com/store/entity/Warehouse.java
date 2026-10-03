package com.store.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "warehouses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "warehouse_id")
    private Integer warehouseId;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "is_store", nullable = false)
    @Builder.Default
    private Boolean isStore = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "province", length = 100)
    private String province;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "ward", length = 100)
    private String ward;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "open_hours", length = 100)
    private String openHours;

    @Column(name = "is_regional_hub", nullable = false)
    @Builder.Default
    private Boolean isRegionalHub = false;

    @Column(name = "region", length = 20)
    private String region;
}
