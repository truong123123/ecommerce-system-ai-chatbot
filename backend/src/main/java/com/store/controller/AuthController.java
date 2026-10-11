package com.store.controller;

import com.store.dto.AuthResponse;
import com.store.dto.LoginRequest;
import com.store.dto.RegisterRequest;
import com.store.entity.Customer;
import com.store.entity.Staff;
import com.store.repository.CustomerRepository;
import com.store.repository.StaffRepository;
import com.store.security.JwtTokenProvider;
import com.store.security.LoginRateLimiter;
import com.store.util.ClientIpUtil;
import jakarta.servlet.http.HttpServletRequest;
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

    private static final String DUMMY_BCRYPT_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

    private final StaffRepository staffRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final LoginRateLimiter loginRateLimiter;
    private final ClientIpUtil clientIpUtil;
    private final com.store.service.AccountValidationService accountValidationService;

    @org.springframework.beans.factory.annotation.Value("${app.auth.registration-enabled:false}")
    private boolean registrationEnabled;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String clientIp = clientIpUtil.extractClientIp(httpRequest);
        String email = request.getEmail().trim().toLowerCase();
        String rawPassword = request.getPassword();

        // Kiểm tra rate limit: 5 lần sai/phút theo cặp (IP + email) -> 429
        if (loginRateLimiter.isBlocked(clientIp, email)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                            "status", 429,
                            "message", "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 1 phút."
                    ));
        }

        // 1. Kiểm tra trong bảng Staff (Admin / Quản lý / Nhân viên)
        Optional<Staff> staffOpt = staffRepository.findByEmailIgnoreCase(email);
        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();

            if (!Boolean.TRUE.equals(staff.getIsActive())) {
                loginRateLimiter.recordFailedAttempt(clientIp, email);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Tài khoản nhân viên đã bị khóa"));
            }

            String staffHash = staff.getPasswordHash();
            if (staffHash == null || staffHash.isBlank() || staffHash.startsWith("!")) {
                // Chạy BCrypt giả để tránh lộ thời gian phản hồi (timing attack)
                passwordEncoder.matches(rawPassword, DUMMY_BCRYPT_HASH);
                loginRateLimiter.recordFailedAttempt(clientIp, email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Email hoặc mật khẩu không chính xác"));
            }

            boolean isPasswordMatch = passwordEncoder.matches(rawPassword, staffHash);

            if (isPasswordMatch) {
                loginRateLimiter.resetAttempts(clientIp, email);

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
            } else {
                loginRateLimiter.recordFailedAttempt(clientIp, email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Email hoặc mật khẩu không chính xác"));
            }
        }

        // 2. Kiểm tra trong bảng Customers (Khách hàng)
        Optional<Customer> customerOpt = customerRepository.findByEmailIgnoreCase(email);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();

            if (!Boolean.TRUE.equals(customer.getIsActive())) {
                loginRateLimiter.recordFailedAttempt(clientIp, email);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Tài khoản khách hàng đã bị tạm khóa"));
            }

            String customerHash = customer.getPasswordHash();
            if (customerHash == null || customerHash.isBlank() || customerHash.startsWith("!") || "GUEST_NO_PASSWORD".equals(customerHash)) {
                // Chạy BCrypt giả để tránh lộ thời gian phản hồi (timing attack)
                passwordEncoder.matches(rawPassword, DUMMY_BCRYPT_HASH);
                loginRateLimiter.recordFailedAttempt(clientIp, email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Email hoặc mật khẩu không chính xác"));
            }

            boolean isPasswordMatch = passwordEncoder.matches(rawPassword, customerHash);

            if (isPasswordMatch) {
                loginRateLimiter.resetAttempts(clientIp, email);

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
            } else {
                loginRateLimiter.recordFailedAttempt(clientIp, email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Email hoặc mật khẩu không chính xác"));
            }
        }

        // 3. Email không tồn tại: Chống dò tài khoản bằng cách chạy BCrypt với hash giả
        passwordEncoder.matches(rawPassword, DUMMY_BCRYPT_HASH);
        loginRateLimiter.recordFailedAttempt(clientIp, email);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Email hoặc mật khẩu không chính xác"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (!registrationEnabled) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Tính năng đăng ký tài khoản hiện không khả dụng."));
        }

        String email = request.getEmail().trim().toLowerCase();

        // Chặn trùng email giữa staff và customers (trả 400 chung để tránh rò rỉ tài khoản)
        if (accountValidationService.isEmailTaken(email)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Thông tin đăng ký không hợp lệ."));
        }

        Customer customer = Customer.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword().trim()))
                .fullName(request.getFullName().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .isActive(true)
                .createdAt(OffsetDateTime.now())
                .build();

        Customer saved = customerRepository.save(customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", saved.getCustomerId(),
                "email", saved.getEmail(),
                "name", saved.getFullName(),
                "message", "Đăng ký tài khoản thành công"
        ));
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
