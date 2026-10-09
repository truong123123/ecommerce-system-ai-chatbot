package com.store.dto.account;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAddressRequest {
    @NotBlank(message = "Tên người nhận không được để trống")
    private String receiverName;

    @NotBlank(message = "Số điện thoại người nhận không được để trống")
    private String receiverPhone;

    @NotBlank(message = "Tỉnh / Thành phố không được để trống")
    private String province;

    @NotBlank(message = "Quận / Huyện không được để trống")
    private String district;

    private String ward;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    private String streetAddress;

    private Boolean isDefault;
}
