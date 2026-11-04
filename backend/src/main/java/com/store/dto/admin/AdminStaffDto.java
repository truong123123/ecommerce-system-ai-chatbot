package com.store.dto.admin;

import com.store.entity.StaffRole;
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
public class AdminStaffDto {
    private Integer staffId;
    private String fullName;
    private String email;
    private StaffRole role;
    private Boolean isActive;
    private LocalDate hiredAt;
    private String phone;
    private OffsetDateTime lastLoginAt;
}

