package com.store.dto.checkout;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutCalculateRequest {

    @NotEmpty(message = "Danh sách sản phẩm không được rỗng")
    private List<ItemRequest> items;

    private String receiveType; // STORE_PICKUP or HOME_DELIVERY
    private Integer storeId;
    private String couponCode;
    private String paymentMethod; // VNPAY, MOMO, COD, etc.

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemRequest {
        private Long variantId;
        private Integer quantity;
    }
}
