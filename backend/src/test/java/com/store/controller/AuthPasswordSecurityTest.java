package com.store.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.config.SecurityConfig;
import com.store.dto.LoginRequest;
import com.store.dto.RegisterRequest;
import com.store.entity.Customer;
import com.store.entity.Staff;
import com.store.entity.StaffRole;
import com.store.exception.GlobalExceptionHandler;
import com.store.repository.CustomerRepository;
import com.store.repository.StaffRepository;
import com.store.security.JwtAuthenticationFilter;
import com.store.security.JwtTokenProvider;
import com.store.security.LoginRateLimiter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class, LoginRateLimiter.class, com.store.util.ClientIpUtil.class, com.store.service.AccountValidationService.class})
class AuthPasswordSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @SpyBean
    private PasswordEncoder passwordEncoder;

    @Autowired
    private LoginRateLimiter loginRateLimiter;

    @MockBean
    private StaffRepository staffRepository;

    @MockBean
    private CustomerRepository customerRepository;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() throws Exception {
        org.mockito.Mockito.doAnswer(invocation -> {
            jakarta.servlet.http.HttpServletRequest request = invocation.getArgument(0);
            jakarta.servlet.http.HttpServletResponse response = invocation.getArgument(1);
            jakarta.servlet.FilterChain chain = invocation.getArgument(2);
            chain.doFilter(request, response);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    @DisplayName("BƯỚC 8: Tài khoản guest với password_hash 'GUEST_NO_PASSWORD' bị từ chối đăng nhập (401)")
    void login_guestAccount_GUEST_NO_PASSWORD_rejected() throws Exception {
        Customer guest = Customer.builder()
                .customerId(101L)
                .email("guest@example.com")
                .fullName("Guest User")
                .passwordHash("GUEST_NO_PASSWORD")
                .isActive(true)
                .build();

        when(staffRepository.findByEmailIgnoreCase("guest@example.com")).thenReturn(Optional.empty());
        when(customerRepository.findByEmailIgnoreCase("guest@example.com")).thenReturn(Optional.of(guest));

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("guest@example.com");
        loginReq.setPassword("GUEST_NO_PASSWORD");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email hoặc mật khẩu không chính xác"));

        verify(jwtTokenProvider, never()).generateToken(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("BƯỚC 8: Tài khoản với password_hash bắt đầu bằng '!NO_LOGIN' bị từ chối đăng nhập (401)")
    void login_guestAccount_exclamationNoLogin_rejected() throws Exception {
        Customer lockedGuest = Customer.builder()
                .customerId(102L)
                .email("locked_guest@example.com")
                .fullName("Locked Guest")
                .passwordHash("!NO_LOGIN")
                .isActive(true)
                .build();

        when(staffRepository.findByEmailIgnoreCase("locked_guest@example.com")).thenReturn(Optional.empty());
        when(customerRepository.findByEmailIgnoreCase("locked_guest@example.com")).thenReturn(Optional.of(lockedGuest));

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("locked_guest@example.com");
        loginReq.setPassword("!NO_LOGIN");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email hoặc mật khẩu không chính xác"));

        verify(jwtTokenProvider, never()).generateToken(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("BƯỚC 8: Mật khẩu plaintext không băm không thể bypass đăng nhập nữa (401)")
    void login_plaintextPassword_cannotBypassBcrypt() throws Exception {
        Customer legacyPlaintextCustomer = Customer.builder()
                .customerId(103L)
                .email("legacy@example.com")
                .fullName("Legacy Plaintext")
                .passwordHash("myPlaintextSecret123") // Plaintext chưa băm
                .isActive(true)
                .build();

        when(staffRepository.findByEmailIgnoreCase("legacy@example.com")).thenReturn(Optional.empty());
        when(customerRepository.findByEmailIgnoreCase("legacy@example.com")).thenReturn(Optional.of(legacyPlaintextCustomer));

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("legacy@example.com");
        loginReq.setPassword("myPlaintextSecret123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email hoặc mật khẩu không chính xác"));

        verify(jwtTokenProvider, never()).generateToken(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("BƯỚC 8: Đăng nhập thành công khi mật khẩu khớp mã băm BCrypt hợp lệ (200 OK)")
    void login_validBcryptPassword_success() throws Exception {
        String rawPassword = "ValidPassword@123";
        String bcryptHash = passwordEncoder.encode(rawPassword);

        Customer validCustomer = Customer.builder()
                .customerId(104L)
                .email("valid@example.com")
                .fullName("Valid User")
                .passwordHash(bcryptHash)
                .isActive(true)
                .build();

        when(staffRepository.findByEmailIgnoreCase("valid@example.com")).thenReturn(Optional.empty());
        when(customerRepository.findByEmailIgnoreCase("valid@example.com")).thenReturn(Optional.of(validCustomer));
        when(jwtTokenProvider.generateToken("valid@example.com", "customer", "Valid User")).thenReturn("mock.jwt.token");

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("valid@example.com");
        loginReq.setPassword(rawPassword);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.user.email").value("valid@example.com"));

        verify(jwtTokenProvider, times(1)).generateToken("valid@example.com", "customer", "Valid User");
    }

    @Test
    @DisplayName("BƯỚC 8: Sai mật khẩu bị từ chối với 401 Unauthorized")
    void login_wrongPassword_rejected() throws Exception {
        String rawPassword = "CorrectPassword@123";
        String bcryptHash = passwordEncoder.encode(rawPassword);

        Customer customer = Customer.builder()
                .customerId(105L)
                .email("user@example.com")
                .fullName("Test User")
                .passwordHash(bcryptHash)
                .isActive(true)
                .build();

        when(staffRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.empty());
        when(customerRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(customer));

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("user@example.com");
        loginReq.setPassword("WrongPassword@456");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email hoặc mật khẩu không chính xác"));

        verify(jwtTokenProvider, never()).generateToken(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("BƯỚC 8.5: Rate limit đăng nhập - 5 lần sai/phút, lần thứ 6 bị trả 429 Too Many Requests")
    void login_rateLimit_exceedsFiveFailedAttempts_returns429TooManyRequests() throws Exception {
        String testEmail = "ratelimit_victim@example.com";
        when(staffRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.empty());
        when(customerRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.empty());

        LoginRequest req = new LoginRequest();
        req.setEmail(testEmail);
        req.setPassword("wrong_pass");

        // 5 lần sai đầu tiên -> 401 Unauthorized
        for (int i = 1; i <= 5; i++) {
            mockMvc.perform(post("/auth/login")
                            .header("X-Forwarded-For", "192.168.1.50")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value("Email hoặc mật khẩu không chính xác"));
        }

        // Lần thứ 6 -> Bị chặn 429 Too Many Requests
        mockMvc.perform(post("/auth/login")
                        .header("X-Forwarded-For", "192.168.1.50")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.message").value("Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 1 phút."));
    }

    @Test
    @DisplayName("BƯỚC 8.5: Đăng nhập thành công sẽ xóa bộ đếm thất bại của Rate Limiter")
    void login_successfulLogin_resetsRateLimiterFailedCount() throws Exception {
        String testEmail = "reset_counter@example.com";
        String rawPassword = "CorrectPass@123";
        String bcryptHash = passwordEncoder.encode(rawPassword);

        Customer customer = Customer.builder()
                .customerId(200L)
                .email(testEmail)
                .fullName("Reset Counter User")
                .passwordHash(bcryptHash)
                .isActive(true)
                .build();

        when(staffRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.empty());
        when(customerRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.of(customer));
        when(jwtTokenProvider.generateToken(testEmail, "customer", "Reset Counter User")).thenReturn("jwt.token");

        LoginRequest wrongReq = new LoginRequest();
        wrongReq.setEmail(testEmail);
        wrongReq.setPassword("WrongPassword");

        // Gặp lỗi 4 lần
        for (int i = 0; i < 4; i++) {
            mockMvc.perform(post("/auth/login")
                            .header("X-Forwarded-For", "10.0.0.1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(wrongReq)))
                    .andExpect(status().isUnauthorized());
        }

        // Lần thứ 5: Đăng nhập thành công -> reset bộ đếm
        LoginRequest correctReq = new LoginRequest();
        correctReq.setEmail(testEmail);
        correctReq.setPassword(rawPassword);

        mockMvc.perform(post("/auth/login")
                        .header("X-Forwarded-For", "10.0.0.1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(correctReq)))
                .andExpect(status().isOk());

        // Lần tiếp theo nếu gõ sai lại -> trả 401 chứ không phải 429 vì bộ đếm đã được reset
        mockMvc.perform(post("/auth/login")
                        .header("X-Forwarded-For", "10.0.0.1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("BƯỚC 8.5: Chống dò tài khoản - Email không tồn tại vẫn chạy BCrypt dummy hash và trả thông báo chung (401)")
    void login_nonExistentEmail_runsDummyBcryptAndReturnsGenericUnauthorized() throws Exception {
        String unknownEmail = "ghost_user@example.com";
        when(staffRepository.findByEmailIgnoreCase(unknownEmail)).thenReturn(Optional.empty());
        when(customerRepository.findByEmailIgnoreCase(unknownEmail)).thenReturn(Optional.empty());

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail(unknownEmail);
        loginReq.setPassword("random_password_123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email hoặc mật khẩu không chính xác"));

        // Xác nhận passwordEncoder.matches vẫn được gọi với hash giả để bảo vệ chống timing attack
        verify(passwordEncoder, atLeastOnce()).matches(eq("random_password_123"), anyString());
    }

    @Test
    @DisplayName("BƯỚC 8.6: POST /auth/register bị tắt mặc định và trả 404 Not Found")
    void register_whenDisabledByDefault_returns404NotFound() throws Exception {
        RegisterRequest regReq = RegisterRequest.builder()
                .email("new_user@store.com")
                .password("StrongPass@123")
                .fullName("Người dùng mới")
                .phone("0912345678")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Tính năng đăng ký tài khoản hiện không khả dụng."));

        verify(customerRepository, never()).save(any());
    }

    @Test
    @DisplayName("BƯỚC 8.6: Kẻ tấn công gửi X-Forwarded-For giả liên tục không qua mặt được giới hạn đăng nhập (429)")
    void login_spoofedXForwardedFor_cannotBypassRateLimit() throws Exception {
        String testEmail = "spoof_victim@example.com";
        when(staffRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.empty());
        when(customerRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.empty());

        LoginRequest req = new LoginRequest();
        req.setEmail(testEmail);
        req.setPassword("wrong_pass");

        // Gửi 5 lần sai từ cùng một remoteAddr (kết nối trực tiếp, không phải proxy tin cậy), giả mạo X-Forwarded-For xoay vòng
        for (int i = 1; i <= 5; i++) {
            mockMvc.perform(post("/auth/login")
                            .with(request -> {
                                request.setRemoteAddr("203.0.113.195"); // IP untrusted của kẻ tấn công
                                return request;
                            })
                            .header("X-Forwarded-For", "198.51.100." + i) // Giả mạo IP xoay vòng
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized());
        }

        // Lần thứ 6 gửi tiếp với IP giả mạo khác -> Vẫn bị chặn 429 Too Many Requests vì hệ thống sử dụng remoteAddr thật
        mockMvc.perform(post("/auth/login")
                        .with(request -> {
                            request.setRemoteAddr("203.0.113.195");
                            return request;
                        })
                        .header("X-Forwarded-For", "8.8.8.8")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429));
    }

    @Test
    @DisplayName("BƯỚC 8.6: Giới hạn riêng theo email - 20 lần sai trong 10 phút bị chặn 429 ngay cả khi đổi IP khác nhau")
    void login_emailRateLimit_exceedsTwentyAttempts_returns429TooManyRequests() throws Exception {
        String targetEmail = "distributed_bruteforce_target@example.com";
        when(staffRepository.findByEmailIgnoreCase(targetEmail)).thenReturn(Optional.empty());
        when(customerRepository.findByEmailIgnoreCase(targetEmail)).thenReturn(Optional.empty());

        LoginRequest req = new LoginRequest();
        req.setEmail(targetEmail);
        req.setPassword("wrong_password");

        // Giả lập botnet phân tán: 20 lần sai từ 20 IP remoteAddr hoàn toàn khác nhau
        for (int i = 1; i <= 20; i++) {
            final int ipSuffix = i;
            mockMvc.perform(post("/auth/login")
                            .with(request -> {
                                request.setRemoteAddr("100.64.0." + ipSuffix);
                                return request;
                            })
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized());
        }

        // Lần thứ 21 từ IP thứ 21 -> Bị chặn 429 theo giới hạn tài khoản email (20 lần / 10 phút)
        mockMvc.perform(post("/auth/login")
                        .with(request -> {
                            request.setRemoteAddr("100.64.0.99");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429));
    }
}
