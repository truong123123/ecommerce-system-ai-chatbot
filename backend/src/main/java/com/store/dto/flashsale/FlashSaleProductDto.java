package com.store.dto.flashsale;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSaleProductDto {

    @JsonProperty("product_id")
    private Long productId;

    private String name;

    private String image;

    @JsonProperty("sale_price")
    private Long salePrice;

    @JsonProperty("original_price")
    private Long originalPrice;

    private Integer quota;

    private Integer sold;

    private Integer remaining;

    private String slug;
}
