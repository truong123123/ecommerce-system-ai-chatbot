package com.store.controller;

import com.store.config.SecurityConfig;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class DashboardSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JdbcTemplate jdbcTemplate;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomerRepository customerRepository;

    @MockBean
    private StaffRepository staffRepository;

    @BeforeEach
    void setUp() throws Exception {
        org.mockito.Mockito.doAnswer(invocation -> {
            jakarta.servlet.http.HttpServletRequest request = invocation.getArgument(0);
            jakarta.servlet.http.HttpServletResponse response = invocation.getArgument(1);
            jakarta.servlet.FilterChain chain = invocation.getArgument(2);
            chain.doFilter(request, response);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());

        when(jdbcTemplate.queryForList(anyString())).thenReturn(Collections.emptyList());
    }

    @Test
    @DisplayName("BƯỚC 7: Khách vãng lai (Anonymous) truy cập /dashboard/overview bị từ chối 401 Unauthorized")
    void anonymous_accessDashboardOverview_returns401() throws Exception {
        mockMvc.perform(get("/dashboard/overview"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @WithMockUser(username = "customer@store.com", roles = {"CUSTOMER"})
    @DisplayName("BƯỚC 7: Tài khoản CUSTOMER truy cập /dashboard/overview bị từ chối 403 Forbidden")
    void customerRole_accessDashboardOverview_returns403() throws Exception {
        mockMvc.perform(get("/dashboard/overview"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @WithMockUser(username = "accountant@store.com", roles = {"ACCOUNTANT"})
    @DisplayName("BƯỚC 7: Kế toán (ACCOUNTANT) truy cập /dashboard/overview thành công 200 OK")
    void accountantRole_accessDashboardOverview_returns200() throws Exception {
        mockMvc.perform(get("/dashboard/overview"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin@store.com", roles = {"ADMIN"})
    @DisplayName("BƯỚC 7: Quản trị viên (ADMIN) truy cập /dashboard/overview thành công 200 OK")
    void adminRole_accessDashboardOverview_returns200() throws Exception {
        mockMvc.perform(get("/dashboard/overview"))
                .andExpect(status().isOk());
    }
}
