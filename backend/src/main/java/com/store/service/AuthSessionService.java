package com.store.service;

import com.store.dto.AuthResponse;
import com.store.entity.Customer;
import com.store.entity.Staff;
import com.store.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthSessionService {

    private final AuthCookieService authCookieService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Chỗ DUY NHẤT tạo phiên cho khách hàng (Customer), chuẩn bị cho việc gắn Google/Zalo sau này.
     * Phát hành HttpOnly cookie access_token và không trả token trong JSON body.
     */
    public AuthResponse createSession(Customer customer, HttpServletResponse response) {
        String token = jwtTokenProvider.generateToken(customer.getEmail(), "customer", customer.getFullName());
        authCookieService.issueAccessTokenCookie(response, token, jwtTokenProvider.getExpirationInSeconds());

        return AuthResponse.builder()
                .token(null) // Login KHÔNG trả token trong JSON body
                .tokenType("Bearer")
                .user(AuthResponse.UserInfo.builder()
                        .id(String.valueOf(customer.getCustomerId()))
                        .name(customer.getFullName())
                        .email(customer.getEmail())
                        .role("customer")
                        .userType("customer")
                        .build())
                .build();
    }

    /**
     * Chỗ DUY NHẤT tạo phiên cho nhân viên (Staff).
     * Nhân viên chỉ đăng nhập nội bộ bằng mật khẩu, tuyệt đối không dùng xác thực bên ngoài.
     */
    public AuthResponse createStaffSession(Staff staff, HttpServletResponse response) {
        String roleName = staff.getRole() != null ? staff.getRole().name() : "admin";
        String token = jwtTokenProvider.generateToken(staff.getEmail(), roleName, staff.getFullName());
        authCookieService.issueAccessTokenCookie(response, token, jwtTokenProvider.getExpirationInSeconds());

        return AuthResponse.builder()
                .token(null) // Login KHÔNG trả token trong JSON body
                .tokenType("Bearer")
                .user(AuthResponse.UserInfo.builder()
                        .id(String.valueOf(staff.getStaffId()))
                        .name(staff.getFullName())
                        .email(staff.getEmail())
                        .role(roleName)
                        .userType("staff")
                        .build())
                .build();
    }
}
