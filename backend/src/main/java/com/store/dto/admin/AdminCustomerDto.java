package com.store.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCustomerDto {
    private Long customerId;
    private String fullName;
    private String email;
    private String phone;
    private String gender;
    private LocalDate birthDate;
    private Integer loyaltyPoints;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private Long totalOrders;
}

