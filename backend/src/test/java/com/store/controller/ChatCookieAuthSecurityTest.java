package com.store.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.chat.service.ChatService;
import com.store.config.SecurityConfig;
import com.store.dto.chat.ChatRequest;
import com.store.dto.chat.ChatResponse;
import com.store.entity.Customer;
import com.store.exception.GlobalExceptionHandler;
import com.store.repository.CustomerRepository;
import com.store.repository.StaffRepository;
import com.store.security.JwtAuthenticationFilter;
import com.store.security.JwtTokenProvider;
import com.store.service.AuthCookieService;
import com.store.util.ClientIpUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ChatController.class)
@Import({
        SecurityConfig.class,
        GlobalExceptionHandler.class,
        AuthCookieService.class,
        JwtAuthenticationFilter.class,
        ClientIpUtil.class
})
class ChatCookieAuthSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatService chatService;

    @MockBean
    private CustomerRepository customerRepository;

    @MockBean
    private StaffRepository staffRepository;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("B2: Khách đã đăng nhập qua cookie access_token: ChatController lấy người dùng từ SecurityContext và truyền vào ChatService")
    void chat_withCookieAuth_resolvesCustomerFromSecurityContext() throws Exception {
        Customer alice = Customer.builder()
                .customerId(10L)
                .email("alice@store.com")
                .fullName("Alice Nguyen")
                .isActive(true)
                .build();

        Claims claims = Mockito.mock(Claims.class);
        when(claims.getSubject()).thenReturn("alice@store.com");
        when(claims.get("role", String.class)).thenReturn("customer");
        when(jwtTokenProvider.parseAndValidateToken("valid-cookie-jwt-token")).thenReturn(claims);
        when(customerRepository.findByEmailIgnoreCase("alice@store.com")).thenReturn(Optional.of(alice));

        when(chatService.processChat(any(), any(), any())).thenReturn(
                ChatResponse.builder()
                        .sessionId(UUID.randomUUID())
                        .reply("Chào Alice, bạn có 1 đơn hàng ORD-ALICE-99.")
                        .build()
        );

        ChatRequest req = ChatRequest.builder()
                .message("Đơn hàng của tôi thế nào rồi?")
                .build();

        mockMvc.perform(post("/chat")
                        .with(csrf())
                        .cookie(new Cookie("access_token", "valid-cookie-jwt-token"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        ArgumentCaptor<Customer> customerCaptor = ArgumentCaptor.forClass(Customer.class);
        verify(chatService).processChat(any(ChatRequest.class), customerCaptor.capture(), any());

        assertThat(customerCaptor.getValue()).isNotNull();
        assertThat(customerCaptor.getValue().getCustomerId()).isEqualTo(10L);
        assertThat(customerCaptor.getValue().getEmail()).isEqualTo("alice@store.com");
    }

    @Test
    @DisplayName("B2: Khách vãng lai không có cookie: ChatController nhận diện người dùng ẩn danh (currentCustomer = null)")
    void chat_withoutCookieAuth_anonymousCustomer() throws Exception {
        when(chatService.processChat(any(), any(), any())).thenReturn(
                ChatResponse.builder()
                        .sessionId(UUID.randomUUID())
                        .reply("Dạ chào bạn, tôi là trợ lý AI.")
                        .build()
        );

        ChatRequest req = ChatRequest.builder()
                .message("Tư vấn iPhone 15")
                .build();

        mockMvc.perform(post("/chat")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        ArgumentCaptor<Customer> customerCaptor = ArgumentCaptor.forClass(Customer.class);
        verify(chatService).processChat(any(ChatRequest.class), customerCaptor.capture(), any());

        assertThat(customerCaptor.getValue()).isNull();
    }
}
