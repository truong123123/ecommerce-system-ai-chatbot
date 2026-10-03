package com.store.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductRequest {
    private String name;
    private String slug;
    private Integer categoryId;
    private Integer brandId;
    private Integer seriesId;
    private String modelCode;
    private String description;
    private BigDecimal price;
    private BigDecimal costPrice;
    private String sku;
    private String image;
    private Object specs;
    private Boolean isHot;
    private Boolean isNew;
}

