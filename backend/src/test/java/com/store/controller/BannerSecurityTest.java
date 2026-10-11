package com.store.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.config.SecurityConfig;
import com.store.entity.Banner;
import com.store.exception.GlobalExceptionHandler;
import com.store.repository.BannerRepository;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BannerController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class BannerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BannerRepository bannerRepository;

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
    }

    @Test
    @DisplayName("BƯỚC 7: Khách vãng lai xem danh sách banner GET /banners thành công 200 OK")
    void anonymous_getBanners_returns200() throws Exception {
        when(bannerRepository.findByIsActiveTrueOrderByDisplayOrderAsc()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/banners"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("BƯỚC 7: Khách vãng lai tạo banner POST /banners bị từ chối 401 Unauthorized")
    void anonymous_createBanner_returns401() throws Exception {
        Banner banner = new Banner();
        banner.setTitle("Promo");
        banner.setImageUrl("https://example.com/banner.jpg");

        mockMvc.perform(post("/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(banner)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @WithMockUser(username = "customer@store.com", roles = {"CUSTOMER"})
    @DisplayName("BƯỚC 7: Tài khoản CUSTOMER tạo banner POST /banners bị từ chối 403 Forbidden")
    void customer_createBanner_returns403() throws Exception {
        Banner banner = new Banner();
        banner.setTitle("Promo");
        banner.setImageUrl("https://example.com/banner.jpg");

        mockMvc.perform(post("/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(banner)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @WithMockUser(username = "admin@store.com", roles = {"ADMIN"})
    @DisplayName("BƯỚC 7: Quản trị viên (ADMIN) tạo banner POST /banners thành công 200 OK")
    void admin_createBanner_returns200() throws Exception {
        Banner banner = new Banner();
        banner.setId(1L);
        banner.setTitle("Promo");
        banner.setImageUrl("https://example.com/banner.jpg");
        when(bannerRepository.save(any(Banner.class))).thenReturn(banner);

        mockMvc.perform(post("/banners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(banner)))
                .andExpect(status().isOk());
    }
}
