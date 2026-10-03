package com.store.dto.cart;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplyCouponRequest {
    @NotBlank(message = "Mã giảm giá không được để trống")
    private String couponCode;

    private List<Long> selectedVariantIds;
}
