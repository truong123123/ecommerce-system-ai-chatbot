package com.store.dto.account;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {
    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;
    private String phone;
    private String gender;
    private LocalDate birthDate;
}
