package com.store.dto.checkout;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreDto {
    private Integer storeId;
    private String name;
    private String address;
    private String province;
    private String district;
    private String ward;
    private String phone;
    private String openHours;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
