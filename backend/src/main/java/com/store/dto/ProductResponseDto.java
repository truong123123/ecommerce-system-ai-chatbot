package com.store.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponseDto {
    private Long id;
    private String name;
    private String slug;
    private Integer categoryId;
    private String categoryName;
    private String categorySlug;
    private Integer brandId;
    private String brandName;
    private String description;
    private String primaryImage;
    private BigDecimal price;
    private BigDecimal maxPrice;
    private Boolean isActive;
    private Boolean isHot;
    private Boolean isNew;
    private List<VariantDto> variants;
    private List<String> images;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VariantDto {
        private Long variantId;
        private String sku;
        private Object attributes;
        private BigDecimal costPrice;
        private BigDecimal salePrice;
        private Boolean isActive;
    }
}
