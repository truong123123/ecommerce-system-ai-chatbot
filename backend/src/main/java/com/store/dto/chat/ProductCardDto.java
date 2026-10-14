package com.store.dto.chat;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCardDto {
    private Long id;
    private String slug;
    private String name;
    private BigDecimal price;
    private BigDecimal salePrice;
    private String imageUrl;
    private boolean inStock;
}
