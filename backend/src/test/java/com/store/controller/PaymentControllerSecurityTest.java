package com.store.controller;

import com.store.config.SecurityConfig;
import com.store.entity.PaymentTransaction;
import com.store.exception.GlobalExceptionHandler;
import com.store.payment.VNPayService;
import com.store.entity.Order;
import com.store.entity.OrderStatus;
import com.store.repository.CustomerRepository;
import com.store.repository.OrderRepository;
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
import java.util.Collections;
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
    private OrderRepository orderRepository;

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

    @Test
    @DisplayName("BƯỚC 6: Client truyền số tiền giả mạo (tampered amount) bị bỏ qua, hệ thống lấy amount thật từ DB")
    void createVNPayPayment_clientTamperedAmount_usesServerSideAmountFromDb() throws Exception {
        String orderCode = "ORD-REAL-123";
        BigDecimal realOrderAmount = new BigDecimal("25000000"); // 25,000,000 VND

        Order realOrder = Order.builder()
                .orderId(99L)
                .orderCode(orderCode)
                .totalAmount(realOrderAmount)
                .status(OrderStatus.pending)
                .build();

        when(orderRepository.findByOrderCode(orderCode)).thenReturn(Optional.of(realOrder));
        when(paymentTransactionRepository.findByOrderOrderIdOrderByCreatedAtDesc(99L)).thenReturn(Collections.emptyList());
        when(vnPayService.createPaymentUrl(anyString(), eq(25000000L), anyString()))
                .thenReturn("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=2500000000");

        // Client cố tình truyền amount = 1000 VND để gian lận
        mockMvc.perform(post("/payment/vnpay")
                        .contentType("application/json")
                        .content("{\"orderCode\":\"" + orderCode + "\",\"amount\":1000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.amount").value(25000000))
                .andExpect(jsonPath("$.orderCode").value(orderCode));

        // Xác nhận vnPayService nhận đúng số tiền 25,000,000 VND từ DB, KHÔNG nhận 1000 VND
        verify(vnPayService, times(1)).createPaymentUrl(anyString(), eq(25000000L), anyString());
        verify(vnPayService, never()).createPaymentUrl(anyString(), eq(1000L), anyString());
    }

    @Test
    @DisplayName("BƯỚC 6: Tạo thanh toán cho đơn hàng không tồn tại trong DB trả về 404 Not Found")
    void createVNPayPayment_unknownOrder_returns404() throws Exception {
        when(orderRepository.findByOrderCode("ORD-NON-EXISTENT")).thenReturn(Optional.empty());
        when(paymentTransactionRepository.findByProviderTxnRef("ORD-NON-EXISTENT")).thenReturn(Optional.empty());

        mockMvc.perform(post("/payment/vnpay")
                        .contentType("application/json")
                        .content("{\"orderCode\":\"ORD-NON-EXISTENT\",\"amount\":50000}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("BƯỚC 6: Callback IPN bị sửa vnp_Amount không khớp với DB trả về RspCode 04 (Invalid Amount)")
    void handleVnPayIpn_tamperedAmount_returnsRspCode04() throws Exception {
        String txnRef = "ORD-AMOUNT-TAMPER-001";
        PaymentTransaction txn = PaymentTransaction.builder()
                .providerTxnRef(txnRef)
                .amount(new BigDecimal("100000")) // 100,000 VND -> expected vnp_Amount = 10,000,000
                .status("PENDING")
                .build();

        when(vnPayService.verifySignature(anyMap(), eq("valid_hash"))).thenReturn(true);
        when(paymentTransactionRepository.findByProviderTxnRef(txnRef)).thenReturn(Optional.of(txn));

        // Kẻ tấn công giả mạo số tiền vnp_Amount = 5,000,000 thay vì 10,000,000
        mockMvc.perform(get("/payment/callback/vnpay")
                        .param("vnp_TxnRef", txnRef)
                        .param("vnp_Amount", "5000000") // Sai số tiền
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_SecureHash", "valid_hash"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("04"))
                .andExpect(jsonPath("$.Message").value("Invalid Amount"));

        // Xác nhận không xử lý đơn hàng thành công khi số tiền bị sai
        verify(checkoutService, never()).handlePaymentSuccess(anyString(), anyString(), anyString());
    }
}
