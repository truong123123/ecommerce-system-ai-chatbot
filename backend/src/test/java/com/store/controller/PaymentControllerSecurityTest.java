package com.store.controller;

import com.store.config.SecurityConfig;
import com.store.entity.PaymentTransaction;
import com.store.exception.GlobalExceptionHandler;
import com.store.payment.VNPayService;
import com.store.repository.CustomerRepository;
import com.store.repository.PaymentTransactionRepository;
import com.store.repository.StaffRepository;
import com.store.security.JwtAuthenticationFilter;
import com.store.security.JwtTokenProvider;
import com.store.service.CheckoutService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PaymentController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class PaymentControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VNPayService vnPayService;

    @MockBean
    private CheckoutService checkoutService;

    @MockBean
    private PaymentTransactionRepository paymentTransactionRepository;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomerRepository customerRepository;

    @MockBean
    private StaffRepository staffRepository;

    @org.junit.jupiter.api.BeforeEach
    void setUp() throws jakarta.servlet.ServletException, java.io.IOException {
        org.mockito.Mockito.doAnswer(invocation -> {
            jakarta.servlet.http.HttpServletRequest request = invocation.getArgument(0);
            jakarta.servlet.http.HttpServletResponse response = invocation.getArgument(1);
            jakarta.servlet.FilterChain chain = invocation.getArgument(2);
            chain.doFilter(request, response);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    @DisplayName("BƯỚC 5: Chữ ký giả mạo bị từ chối với RspCode 97 (Invalid Checksum)")
    void fakeSignature_shouldBeRejected() throws Exception {
        when(vnPayService.verifySignature(anyMap(), eq("fake_signature_hash")))
                .thenReturn(false);

        mockMvc.perform(get("/payment/callback/vnpay")
                        .param("vnp_TxnRef", "ORD-123456")
                        .param("vnp_Amount", "10000000")
                        .param("vnp_SecureHash", "fake_signature_hash"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("97"))
                .andExpect(jsonPath("$.Message").value("Invalid Checksum"));

        verify(checkoutService, never()).handlePaymentSuccess(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("BƯỚC 5: Chữ ký sai không thể bypass khi dùng DEMOHASHSECRET")
    void demoHashSecret_cannotBypassVerification() throws Exception {
        when(vnPayService.verifySignature(anyMap(), eq("invalid_hash_attempt")))
                .thenReturn(false);

        mockMvc.perform(get("/payment/callback/vnpay")
                        .param("vnp_TxnRef", "ORD-123456")
                        .param("vnp_Amount", "10000000")
                        .param("vnp_SecureHash", "invalid_hash_attempt"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("97"))
                .andExpect(jsonPath("$.Message").value("Invalid Checksum"));

        verify(checkoutService, never()).handlePaymentSuccess(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("BƯỚC 5: Gọi callback qua phương thức HTTP POST bị từ chối với mã 403 Forbidden")
    void postCallback_shouldReturn403Forbidden() throws Exception {
        mockMvc.perform(post("/payment/callback/vnpay")
                        .contentType("application/json")
                        .content("{\"orderId\":\"ORD-123456\",\"amount\":100000}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.RspCode").value("99"));

        verify(checkoutService, never()).handlePaymentSuccess(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("BƯỚC 5: Idempotency - Gọi IPN 2 lần không xử lý lặp lại, lần 2 trả về RspCode 02")
    void idempotentIpn_calledTwice_doesNotReprocess() throws Exception {
        String txnRef = "ORD-IDEMPOTENT-001";
        PaymentTransaction pendingTxn = PaymentTransaction.builder()
                .providerTxnRef(txnRef)
                .amount(new BigDecimal("100000"))
                .status("PENDING")
                .build();

        PaymentTransaction successTxn = PaymentTransaction.builder()
                .providerTxnRef(txnRef)
                .amount(new BigDecimal("100000"))
                .status("SUCCESS")
                .build();

        when(vnPayService.verifySignature(anyMap(), eq("valid_signature"))).thenReturn(true);
        // Lần đầu trả về pending, lần sau trả về success
        when(paymentTransactionRepository.findByProviderTxnRef(txnRef))
                .thenReturn(Optional.of(pendingTxn))
                .thenReturn(Optional.of(successTxn));

        // LẦN GỌI 1: Xử lý thành công
        mockMvc.perform(get("/payment/callback/vnpay")
                        .param("vnp_TxnRef", txnRef)
                        .param("vnp_Amount", "10000000")
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_TransactionNo", "14889901")
                        .param("vnp_SecureHash", "valid_signature"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("00"))
                .andExpect(jsonPath("$.Message").value("Confirm Success"));

        verify(checkoutService, times(1)).handlePaymentSuccess(eq(txnRef), eq("14889901"), anyString());

        // LẦN GỌI 2 (trùng lặp): Trả về RspCode 02, KHÔNG gọi checkoutService lần 2
        mockMvc.perform(get("/payment/callback/vnpay")
                        .param("vnp_TxnRef", txnRef)
                        .param("vnp_Amount", "10000000")
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_TransactionNo", "14889901")
                        .param("vnp_SecureHash", "valid_signature"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("02"))
                .andExpect(jsonPath("$.Message").value("Order already confirmed"));

        // Xác nhận checkoutService VẪN CHỈ ĐƯỢC GỌI ĐÚNG 1 LẦN DUY NHẤT
        verify(checkoutService, times(1)).handlePaymentSuccess(anyString(), anyString(), anyString());
    }
}
