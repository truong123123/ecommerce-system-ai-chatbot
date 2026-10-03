package com.store.dto.flashsale;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSaleCheckoutRequest {

    @JsonProperty("slot_id")
    @NotNull(message = "slot_id không được để trống")
    private Long slotId;

    @JsonProperty("product_id")
    @NotNull(message = "product_id không được để trống")
    private Long productId;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;
}
