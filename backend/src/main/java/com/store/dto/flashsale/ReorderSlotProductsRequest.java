package com.store.dto.flashsale;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReorderSlotProductsRequest {

    @NotEmpty(message = "Danh sách ID sản phẩm không được rỗng")
    private List<Long> itemIds; // Danh sách itemId theo thứ tự hiển thị mới
}
