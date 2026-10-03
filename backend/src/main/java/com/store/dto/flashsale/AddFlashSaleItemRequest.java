package com.store.dto.flashsale;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddFlashSaleItemRequest {

    @NotNull(message = "Product ID không được để trống")
    private Long productId;

    @NotNull(message = "Khung giờ (slotId) không được để trống")
    private Long slotId;

    @NotNull(message = "Giá Flash Sale không được để trống")
    private BigDecimal salePrice;

    @NotNull(message = "Số lượng Flash Sale không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer totalStock;

    @Builder.Default
    @Min(value = 1, message = "Giới hạn mua mỗi user phải lớn hơn 0")
    private Integer maxQuantityPerUser = 1;
}
