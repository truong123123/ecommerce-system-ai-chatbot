package com.store.dto.cart;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddToCartRequest {
    private Long variantId;
    private Long productId;
    
    @Builder.Default
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity = 1;
}
