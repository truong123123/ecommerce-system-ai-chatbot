package com.store.dto.flashsale;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSaleCheckoutResponse {

    private String code; // SUCCESS, SOLD_OUT, SLOT_NOT_LIVE, ALREADY_PURCHASED

    private String message;

    @JsonProperty("purchase_id")
    private Long purchaseId;

    @JsonProperty("product_id")
    private Long productId;

    @JsonProperty("product_name")
    private String productName;

    @JsonProperty("sale_price")
    private Long salePrice;

    private Integer remaining;
}
