package com.store.dto.flashsale;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddSlotProductRequest {

    @NotNull(message = "product_id không được trống.")
    @JsonProperty("product_id")
    private Long productId;

    @NotNull(message = "sale_price không được trống.")
    @JsonProperty("sale_price")
    private Long salePrice;

    @NotNull(message = "original_price không được trống.")
    @JsonProperty("original_price")
    private Long originalPrice;

    @NotNull(message = "quota không được trống.")
    @Min(value = 1, message = "Số lượng tối thiểu là 1.")
    private Integer quota;

    @JsonProperty("sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
