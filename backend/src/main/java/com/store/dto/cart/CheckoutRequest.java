package com.store.dto.cart;

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
public class CheckoutRequest {
    @NotEmpty(message = "Danh sách sản phẩm thanh toán không được rỗng")
    private List<Long> selectedVariantIds;

    private Long addressId;
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String couponCode;
    private String paymentMethod; // cod, vnpay, momo, bank_transfer
    private String note;
}
