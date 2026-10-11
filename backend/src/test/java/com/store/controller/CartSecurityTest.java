package com.store.controller;

import com.store.config.SecurityConfig;
import com.store.dto.cart.CartDto;
import com.store.entity.Customer;
import com.store.exception.GlobalExceptionHandler;
import com.store.repository.CustomerRepository;
import com.store.repository.StaffRepository;
import com.store.security.JwtAuthenticationFilter;
import com.store.security.JwtTokenProvider;
import com.store.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CartController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class CartSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CartService cartService;

    @MockBean
    private CustomerRepository customerRepository;

    @MockBean
    private StaffRepository staffRepository;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() throws Exception {
        org.mockito.Mockito.doAnswer(invocation -> {
            jakarta.servlet.http.HttpServletRequest request = invocation.getArgument(0);
            jakarta.servlet.http.HttpServletResponse response = invocation.getArgument(1);
            jakarta.servlet.FilterChain chain = invocation.getArgument(2);
            chain.doFilter(request, response);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());
    }

    @Test
    @DisplayName("BƯỚC 8.6: GET /cart khi chưa đăng nhập phải bị chặn với 401 Unauthorized")
    void getCart_anonymous_returns401() throws Exception {
        mockMvc.perform(get("/cart"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "customer@store.com", roles = {"CUSTOMER"})
    @DisplayName("BƯỚC 8.6: GET /cart khi đã đăng nhập được phép truy cập (200 OK)")
    void getCart_authenticated_returns200() throws Exception {
        when(customerRepository.findByEmailIgnoreCase("customer@store.com"))
                .thenReturn(Optional.of(Customer.builder()
                        .customerId(1L)
                        .email("customer@store.com")
                        .fullName("Test Customer")
                        .build()));

        when(cartService.getCart(any(), any(), any()))
                .thenReturn(CartDto.builder().build());

        mockMvc.perform(get("/cart"))
                .andExpect(status().isOk());
    }
}
