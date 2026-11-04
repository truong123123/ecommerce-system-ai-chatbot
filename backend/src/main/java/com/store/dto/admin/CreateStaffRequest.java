package com.store.dto.admin;

import com.store.entity.StaffRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateStaffRequest {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 150, message = "Họ tên không vượt quá 150 ký tự")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotNull(message = "Vai trò không được để trống")
    private StaffRole role;

    @Size(max = 20, message = "Số điện thoại không vượt quá 20 ký tự")
    private String phone;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
    private String password;
}

