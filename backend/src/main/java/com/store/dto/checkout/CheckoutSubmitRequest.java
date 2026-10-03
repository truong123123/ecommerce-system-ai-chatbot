package com.store.dto.checkout;

import jakarta.validation.constraints.NotBlank;
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
public class CheckoutSubmitRequest {

    @NotEmpty(message = "Danh sách sản phẩm không được rỗng")
    private List<ItemRequest> items;

    @NotBlank(message = "Hình thức nhận hàng không được để trống")
    private String receiveType; // STORE_PICKUP or HOME_DELIVERY

    private Integer storeId;

    private ShippingAddressRequest shippingAddress;

    @NotBlank(message = "Tên người nhận không được để trống")
    private String customerName;

    @NotBlank(message = "Số điện thoại người nhận không được để trống")
    private String customerPhone;

    private String customerEmail;

    private String note;

    private boolean needInvoice;

    private InvoiceRequest invoiceInfo;

    @NotBlank(message = "Vui lòng chọn phương thức thanh toán")
    private String paymentMethod; // STORE, VNPAY, BANK_QR, MOMO, ONEPAY_CARD

    private String couponCode;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemRequest {
        private Long variantId;
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShippingAddressRequest {
        private String province;
        private String district;
        private String ward;
        private String street;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvoiceRequest {
        private String taxCode;
        private String companyName;
        private String companyAddress;
        private String companyEmail;
    }
}
