package com.store.dto.account;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressDto {
    private Long id;
    private String receiverName;
    private String receiverPhone;
    private String province;
    private String district;
    private String ward;
    private String streetAddress;
    private Boolean isDefault;
    private String fullAddress;
}
