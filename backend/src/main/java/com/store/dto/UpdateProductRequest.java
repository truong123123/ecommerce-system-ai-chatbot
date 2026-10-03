package com.store.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {
    private String name;
    private Integer categoryId;
    private Integer brandId;
    private String description;
    private BigDecimal price;
    private BigDecimal costPrice;
    private String image;
    private Boolean isActive;
    private Boolean isHot;
    private Boolean isNew;
}
