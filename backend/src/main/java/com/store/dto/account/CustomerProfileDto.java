package com.store.dto.account;

import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProfileDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String gender;
    private LocalDate birthDate;
    private Integer loyaltyPoints;
    private String tierName;
    private Integer orderCount;
    private Integer wishlistCount;
    private OffsetDateTime createdAt;
}
