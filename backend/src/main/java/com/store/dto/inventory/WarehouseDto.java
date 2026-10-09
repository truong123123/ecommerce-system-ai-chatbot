package com.store.dto.inventory;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseDto {
    private Integer warehouseId;
    private String name;
    private String address;
    private String province;
    private String district;
    private String ward;
    private String phone;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String openHours;
    private Boolean isStore;
    private Boolean isActive;
}
