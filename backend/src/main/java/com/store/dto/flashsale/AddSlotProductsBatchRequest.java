package com.store.dto.flashsale;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddSlotProductsBatchRequest {

    @NotEmpty(message = "Danh sách sản phẩm không được rỗng")
    private List<ProductItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductItemRequest {
        private Long productId;
        private BigDecimal salePrice;
        private BigDecimal originalPrice;
        private Integer discountPercent;
        private Integer totalStock; // Quota
        private Integer maxQuantityPerUser;
    }
}
