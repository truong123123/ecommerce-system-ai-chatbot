package com.store.dto.checkout;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodDto {
    private String code;
    private String name;
    private String icon;
    private String description;
    private boolean active;
    private int sortOrder;
}
