package com.store.dto.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdjustStockRequest {

    @NotNull(message = "Vui lòng chọn kho hàng")
    private Integer warehouseId;

    @NotNull(message = "Vui lòng chọn biến thể sản phẩm")
    private Long variantId;

    @NotBlank(message = "Vui lòng chỉ định loại thao tác (IMPORT, EXPORT, ADJUST)")
    private String type; // IMPORT, EXPORT, ADJUST

    @NotNull(message = "Số lượng thay đổi không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer changeQty;

    @NotBlank(message = "Lý do thay đổi tồn kho không được để trống")
    private String reason; // import, export, adjustment, damaged, purchase, return

    private String notes;
}
