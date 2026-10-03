package com.store.dto.flashsale;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFlashSaleItemRequest {
    private BigDecimal salePrice;

    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer totalStock;

    @Min(value = 1, message = "Giới hạn mua mỗi user phải lớn hơn 0")
    private Integer maxQuantityPerUser;

    private Long slotId;
}
