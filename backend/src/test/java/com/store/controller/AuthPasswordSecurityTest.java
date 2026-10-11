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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class AuthPasswordSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
}
