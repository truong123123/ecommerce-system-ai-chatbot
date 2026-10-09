package com.store.dto.comparison;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComparisonResponseDto {

    private List<ProductComparisonItemDto> products;
    private List<ComparisonGroupDto> attributeGroups;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductComparisonItemDto {
        private Long productId;
        private String name;
        private String slug;
        private String brandName;
        private String categoryName;
        private String imageUrl;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private Boolean inStock;
        private Map<String, String> specs;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComparisonGroupDto {
        private String groupName;
        private List<ComparisonAttributeRowDto> attributes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComparisonAttributeRowDto {
        private String key;
        private String label;
        private Map<String, String> values; // productId as string -> value
        private Boolean isDifferent;
    }
}
