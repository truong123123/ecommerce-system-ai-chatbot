package com.store.dto.flashsale;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSlotProductDto {
    private Long id;

    @JsonProperty("product_id")
    private Long productId;

    private String name;
    private String image;
    private String slug;

    @JsonProperty("sale_price")
    private Long salePrice;

    @JsonProperty("original_price")
    private Long originalPrice;

    private Integer quota;
    private Integer sold;

    @JsonProperty("sort_order")
    private Integer sortOrder;
}
