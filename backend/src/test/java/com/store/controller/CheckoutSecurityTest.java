package com.store.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.config.SecurityConfig;
import com.store.dto.checkout.CheckoutCalculateDto;
import com.store.dto.checkout.CheckoutCalculateRequest;
import com.store.dto.checkout.CheckoutPreviewDto;
import com.store.dto.checkout.CheckoutSubmitRequest;
import com.store.entity.Customer;
import com.store.exception.GlobalExceptionHandler;
import com.store.repository.CustomerRepository;
import com.store.repository.StaffRepository;
import com.store.security.JwtAuthenticationFilter;
import com.store.security.JwtTokenProvider;
import com.store.service.CheckoutService;
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

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({CheckoutController.class, VoucherController.class})
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class CheckoutSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CheckoutService checkoutService;

    @MockBean
    private com.store.repository.CouponRepository couponRepository;

    @MockBean
    private com.store.repository.VoucherUsageRepository voucherUsageRepository;

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
        }).when(jwtAuthenticationFilter).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    @DisplayName("BƯỚC 7: Khách vãng lai truy cập GET /checkout/preview bị từ chối 401 Unauthorized")
    void anonymous_previewCheckout_returns401() throws Exception {
        mockMvc.perform(get("/checkout/preview")
                        .param("variantIds", "1,2"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("BƯỚC 7: Khách vãng lai gửi POST /checkout kèm email khách bị từ chối 401 Unauthorized (không tự tạo guest)")
    void anonymous_submitCheckoutWithEmail_returns401() throws Exception {
        CheckoutSubmitRequest.ShippingAddressRequest addr = CheckoutSubmitRequest.ShippingAddressRequest.builder()
                .street("123 Duong Le Loi")
                .ward("Phuong Ben Nghe")
                .district("Quận 1")
                .province("Hồ Chí Minh")
                .build();

        CheckoutSubmitRequest req = CheckoutSubmitRequest.builder()
                .customerEmail("guest_attacker@example.com")
                .customerName("Guest User")
                .customerPhone("0987654321")
                .paymentMethod("COD")
                .receiveType("HOME_DELIVERY")
                .shippingAddress(addr)
                .items(List.of(
                        CheckoutSubmitRequest.ItemRequest.builder().variantId(1L).quantity(1).build()
                ))
                .build();

        mockMvc.perform(post("/checkout")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        // Xác nhận không bao giờ lưu hoặc tạo customer mới cho khách vãng lai
        verify(customerRepository, never()).save(any(Customer.class));
        verify(checkoutService, never()).submitCheckout(any(), any(), any(), any());
    }

    @Test
    @DisplayName("BƯỚC 7: Khách vãng lai tính tạm phí ship POST /checkout/calculate thành công 200 OK")
    void anonymous_calculateCheckout_returns200() throws Exception {
        CheckoutCalculateRequest req = CheckoutCalculateRequest.builder()
                .items(List.of(
                        CheckoutCalculateRequest.ItemRequest.builder().variantId(1L).quantity(1).build()
                ))
                .receiveType("HOME_DELIVERY")
                .build();

        CheckoutCalculateDto calculateDto = CheckoutCalculateDto.builder()
                .subtotal(new BigDecimal("500000"))
                .shippingFee(new BigDecimal("30000"))
                .totalAmount(new BigDecimal("530000"))
                .build();

        when(checkoutService.calculate(isNull(), any(CheckoutCalculateRequest.class)))
                .thenReturn(calculateDto);

        mockMvc.perform(post("/checkout/calculate")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal").value(500000))
                .andExpect(jsonPath("$.shippingFee").value(30000));
    }

    @Test
    @WithMockUser(username = "customer@store.com", roles = {"CUSTOMER"})
    @DisplayName("BƯỚC 7: Khách hàng đã đăng nhập truy cập GET /checkout/preview thành công 200 OK")
    void authenticatedCustomer_previewCheckout_returns200() throws Exception {
        Customer customer = Customer.builder()
                .customerId(10L)
                .email("customer@store.com")
                .fullName("Nguyen Van A")
                .build();

        when(customerRepository.findByEmailIgnoreCase("customer@store.com"))
                .thenReturn(Optional.of(customer));

        CheckoutPreviewDto previewDto = CheckoutPreviewDto.builder()
                .customer(CheckoutPreviewDto.CustomerInfo.builder().customerId(10L).email("customer@store.com").build())
                .items(Collections.emptyList())
                .pricing(CheckoutPreviewDto.PricingSummary.builder().totalAmount(BigDecimal.ZERO).build())
                .build();

        when(checkoutService.preview(eq(customer), anyList(), any()))
                .thenReturn(previewDto);

        mockMvc.perform(get("/checkout/preview")
                        .param("variantIds", "1,2"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("BƯỚC 8.6: Gọi POST /vouchers/validate với JSON hỏng nhận 400 Bad Request (không bị biến thành 401)")
    void anonymous_callVoucherValidateWithMalformedJson_returns400Not401() throws Exception {
        mockMvc.perform(post("/vouchers/validate")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{invalid_malformed_json_structure"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("BƯỚC 8.6: Gọi đường dẫn không tồn tại khi ẩn danh nhận 404 Not Found (không bị biến thành 401)")
    void anonymous_callNonExistentPath_returns404Not401() throws Exception {
        mockMvc.perform(get("/vouchers/this-subpath-does-not-exist-at-all"))
                .andExpect(status().isNotFound());
    }
}
