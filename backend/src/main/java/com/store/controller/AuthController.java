package com.store.controller;

import com.store.dto.AuthResponse;
import com.store.dto.LoginRequest;
import com.store.entity.Customer;
import com.store.entity.Staff;
import com.store.repository.CustomerRepository;
import com.store.repository.StaffRepository;
import com.store.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final StaffRepository staffRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String rawPassword = request.getPassword();

        // 1. Kiểm tra trong bảng Staff (Admin / Quản lý / Nhân viên)
        Optional<Staff> staffOpt = staffRepository.findByEmailIgnoreCase(email);
        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();

            if (!Boolean.TRUE.equals(staff.getIsActive())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Tài khoản nhân viên đã bị khóa"));
            }

            // Kiểm tra mật khẩu (hỗ trợ cả mật khẩu BCrypt mã hóa chuẩn và mật khẩu dev ban đầu nếu có)
            boolean isPasswordMatch = passwordEncoder.matches(rawPassword, staff.getPasswordHash())
                    || rawPassword.equals(staff.getPasswordHash());

            if (isPasswordMatch) {
                // Cập nhật thời điểm đăng nhập gần nhất
                staff.setLastLoginAt(OffsetDateTime.now());
                staffRepository.save(staff);

                String roleName = staff.getRole() != null ? staff.getRole().name() : "admin";
                String token = jwtTokenProvider.generateToken(staff.getEmail(), roleName, staff.getFullName());

                AuthResponse response = AuthResponse.builder()
                        .token(token)
                        .tokenType("Bearer")
                        .user(AuthResponse.UserInfo.builder()
                                .id(String.valueOf(staff.getStaffId()))
                                .name(staff.getFullName())
                                .email(staff.getEmail())
                                .role(roleName)
                                .userType("staff")
                                .build())
                        .build();

                return ResponseEntity.ok(response);
            }
        }

        // 2. Kiểm tra trong bảng Customers (Khách hàng)
        Optional<Customer> customerOpt = customerRepository.findByEmailIgnoreCase(email);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();

            if (!Boolean.TRUE.equals(customer.getIsActive())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Tài khoản khách hàng đã bị tạm khóa"));
            }

            boolean isPasswordMatch = passwordEncoder.matches(rawPassword, customer.getPasswordHash())
                    || rawPassword.equals(customer.getPasswordHash());

            if (isPasswordMatch) {
                String token = jwtTokenProvider.generateToken(customer.getEmail(), "customer", customer.getFullName());

                AuthResponse response = AuthResponse.builder()
                        .token(token)
                        .tokenType("Bearer")
                        .user(AuthResponse.UserInfo.builder()
                                .id(String.valueOf(customer.getCustomerId()))
                                .name(customer.getFullName())
                                .email(customer.getEmail())
                                .role("customer")
                                .userType("customer")
                                .build())
                        .build();

                return ResponseEntity.ok(response);
            }
        }

        // 3. Không tìm thấy hoặc sai mật khẩu
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Email hoặc mật khẩu không chính xác"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Chưa cung cấp token xác thực"));
        }

        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token không hợp lệ hoặc đã hết hạn"));
        }

        String email = jwtTokenProvider.getEmailFromJWT(token);

        Optional<Staff> staffOpt = staffRepository.findByEmailIgnoreCase(email);
        if (staffOpt.isPresent()) {
            Staff s = staffOpt.get();
            return ResponseEntity.ok(Map.of(
                    "id", s.getStaffId(),
                    "name", s.getFullName(),
                    "email", s.getEmail(),
                    "role", s.getRole().name(),
                    "userType", "staff"
            ));
        }

        Optional<Customer> customerOpt = customerRepository.findByEmailIgnoreCase(email);
        if (customerOpt.isPresent()) {
            Customer c = customerOpt.get();
            return ResponseEntity.ok(Map.of(
                    "id", c.getCustomerId(),
                    "name", c.getFullName(),
                    "email", c.getEmail(),
                    "role", "customer",
                    "userType", "customer"
            ));
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Không tìm thấy thông tin người dùng"));
    }
}
