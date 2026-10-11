package com.store.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.config.SecurityConfig;
import com.store.dto.LoginRequest;
import com.store.entity.Customer;
import com.store.entity.Staff;
import com.store.entity.StaffRole;
import com.store.exception.GlobalExceptionHandler;
import com.store.repository.CustomerRepository;
import com.store.repository.StaffRepository;
import com.store.security.JwtAuthenticationFilter;
import com.store.security.JwtTokenProvider;
import com.store.security.LoginRateLimiter;
import com.store.service.AccountValidationService;
import com.store.service.AuthCookieService;
import com.store.service.AuthSessionService;
import com.store.util.ClientIpUtil;
import jakarta.servlet.http.Cookie;
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

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({
        SecurityConfig.class,
        GlobalExceptionHandler.class,
        LoginRateLimiter.class,
        ClientIpUtil.class,
        AccountValidationService.class,
        AuthSessionService.class,
        AuthCookieService.class,
        JwtAuthenticationFilter.class
})
class AuthSessionSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @SpyBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private StaffRepository staffRepository;

    @MockBean
    private CustomerRepository customerRepository;

    @BeforeEach
    void setUp() {
        when(jwtTokenProvider.getExpirationInSeconds()).thenReturn(7200L);
    }

    @Test
    @DisplayName("BƯỚC 9a: Đăng nhập thành công phát hành cookie HttpOnly, SameSite=Lax và KHÔNG trả token trong JSON body")
    void login_success_issuesHttpOnlySameSiteCookie_andNoTokenInBody() throws Exception {
        String rawPassword = "CustomerSecurePassword@123";
        Customer customer = Customer.builder()
                .customerId(1L)
                .email("buyer@store.com")
                .fullName("Buyer Name")
                .passwordHash(passwordEncoder.encode(rawPassword))
                .isActive(true)
                .build();

        when(staffRepository.findByEmailIgnoreCase("buyer@store.com")).thenReturn(Optional.empty());
        when(customerRepository.findByEmailIgnoreCase("buyer@store.com")).thenReturn(Optional.of(customer));
        when(jwtTokenProvider.generateToken("buyer@store.com", "customer", "Buyer Name")).thenReturn("mock.jwt.token.123");

        LoginRequest req = new LoginRequest();
        req.setEmail("buyer@store.com");
        req.setPassword(rawPassword);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                // Cookie assertions
                .andExpect(header().string("Set-Cookie", containsString("access_token=mock.jwt.token.123")))
                .andExpect(header().string("Set-Cookie", containsString("HttpOnly")))
                .andExpect(header().string("Set-Cookie", containsString("SameSite=Lax")))
                .andExpect(header().string("Set-Cookie", containsString("Max-Age=7200")))
                // JSON body: token KHÔNG được trả về
                .andExpect(jsonPath("$.token").doesNotExist())
                // JSON body: vẫn trả thông tin user
                .andExpect(jsonPath("$.user.email").value("buyer@store.com"))
                .andExpect(jsonPath("$.user.name").value("Buyer Name"))
                .andExpect(jsonPath("$.user.role").value("customer"));
    }

    @Test
    @DisplayName("BƯỚC 9a: POST /auth/logout xoá cookie access_token (Max-Age=0)")
    void logout_success_clearsAccessTokenCookie() throws Exception {
        mockMvc.perform(post("/auth/logout")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(header().string("Set-Cookie", containsString("access_token=")))
                .andExpect(header().string("Set-Cookie", containsString("Max-Age=0")))
                .andExpect(header().string("Set-Cookie", containsString("HttpOnly")))
                .andExpect(jsonPath("$.message").value("Đăng xuất thành công"));
    }

    @Test
    @DisplayName("BƯỚC 9a: Request ghi thiếu CSRF token bị chặn với 403 Forbidden")
    void writeRequest_missingCsrfToken_returns403Forbidden() throws Exception {
        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("BƯỚC 9a: POST /auth/login được miễn trừ CSRF")
    void loginRequest_exemptFromCsrf() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("nonexistent@store.com");
        req.setPassword("AnyPassword@123");

        // Gửi POST /auth/login không có CSRF token -> Vẫn được chuyển tới controller xử lý (nhận 401 thay vì 403)
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("BƯỚC 9a: GET /auth/me đọc thông tin từ cookie access_token")
    void getCurrentUser_fromCookie_returnsUserInfo() throws Exception {
        String token = "valid.cookie.token";
        Customer customer = Customer.builder()
                .customerId(2L)
                .email("cookie_user@store.com")
                .fullName("Cookie User")
                .build();

        io.jsonwebtoken.Claims mockClaims = org.mockito.Mockito.mock(io.jsonwebtoken.Claims.class);
        when(mockClaims.getSubject()).thenReturn("cookie_user@store.com");
        when(mockClaims.get("role", String.class)).thenReturn("customer");
        when(jwtTokenProvider.parseAndValidateToken(token)).thenReturn(mockClaims);

        when(customerRepository.findByEmailIgnoreCase("cookie_user@store.com")).thenReturn(Optional.of(customer));
        when(staffRepository.findByEmailIgnoreCase("cookie_user@store.com")).thenReturn(Optional.empty());

        mockMvc.perform(get("/auth/me")
                        .cookie(new Cookie("access_token", token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("cookie_user@store.com"))
                .andExpect(jsonPath("$.name").value("Cookie User"))
                .andExpect(jsonPath("$.role").value("customer"));
    }

    @Test
    @DisplayName("BƯỚC 9a: GET /auth/me vẫn dùng được header Authorization Bearer cho test API (tương thích ngược)")
    void getCurrentUser_fromBearerHeader_backwardCompatible() throws Exception {
        String token = "valid.bearer.token";
        Customer customer = Customer.builder()
                .customerId(3L)
                .email("bearer_user@store.com")
                .fullName("Bearer User")
                .build();

        io.jsonwebtoken.Claims mockClaims = org.mockito.Mockito.mock(io.jsonwebtoken.Claims.class);
        when(mockClaims.getSubject()).thenReturn("bearer_user@store.com");
        when(mockClaims.get("role", String.class)).thenReturn("customer");
        when(jwtTokenProvider.parseAndValidateToken(token)).thenReturn(mockClaims);

        when(customerRepository.findByEmailIgnoreCase("bearer_user@store.com")).thenReturn(Optional.of(customer));
        when(staffRepository.findByEmailIgnoreCase("bearer_user@store.com")).thenReturn(Optional.empty());

        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("bearer_user@store.com"))
                .andExpect(jsonPath("$.name").value("Bearer User"))
                .andExpect(jsonPath("$.role").value("customer"));
    }

    @Test
    @DisplayName("BƯỚC 9a: GET /auth/me khi chưa xác thực nhận 401 Unauthorized")
    void getCurrentUser_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
