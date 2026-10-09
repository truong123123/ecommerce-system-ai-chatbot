package com.store.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemDto {
    private Long id;
    private Long productId;
    private String name;
    private String slug;
    private String primaryImage;
    private BigDecimal price;
    private BigDecimal maxPrice;
    private BigDecimal oldPrice;
    private Boolean isActive;
    private Boolean inStock;
    private String categoryName;
    private String brandName;
    private OffsetDateTime addedAt;
}
