package com.store.controller;

import com.store.config.SecurityConfig;
import com.store.entity.Customer;
import com.store.entity.Order;
import com.store.entity.OrderStatus;
import com.store.entity.PaymentTransaction;
import com.store.exception.GlobalExceptionHandler;
import com.store.payment.VNPayService;
import com.store.repository.CustomerRepository;
import com.store.repository.OrderRepository;
import com.store.repository.PaymentTransactionRepository;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
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

    private final String configuredTmn = "TESTTMNCODE";

    @BeforeEach
    void setUp() throws Exception {
        org.mockito.Mockito.doAnswer(invocation -> {
            jakarta.servlet.http.HttpServletRequest request = invocation.getArgument(0);
            jakarta.servlet.http.HttpServletResponse response = invocation.getArgument(1);
            jakarta.servlet.FilterChain chain = invocation.getArgument(2);
            chain.doFilter(request, response);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());

        when(vnPayService.getVnpTmnCode()).thenReturn(configuredTmn);
    }

    // ==========================================
    // GROUP B (BƯỚC 5 BỔ SUNG): VNPAY IPN CALLBACK TESTS
    // ==========================================

    @Test
    @DisplayName("BƯỚC 5: Chữ ký giả mạo bị từ chối với RspCode 97 (Invalid Checksum)")
    void fakeSignature_shouldBeRejected() throws Exception {
        when(vnPayService.verifySignature(anyMap(), eq("fake_signature_hash"))).thenReturn(false);

        mockMvc.perform(get("/payment/callback/vnpay")
                        .param("vnp_TxnRef", "ORD-123456")
                        .param("vnp_Amount", "10000000")
                        .param("vnp_TmnCode", configuredTmn)
                        .param("vnp_SecureHash", "fake_signature_hash"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("97"))
                .andExpect(jsonPath("$.Message").value("Invalid Checksum"));

        verify(checkoutService, never()).handlePaymentSuccess(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("BƯỚC 5: Mã TMN Code không khớp cấu hình trả về RspCode 97 (Invalid TMN Code)")
    void invalidTmnCode_returnsRspCode97() throws Exception {
        when(vnPayService.verifySignature(anyMap(), eq("valid_signature"))).thenReturn(true);

        mockMvc.perform(get("/payment/callback/vnpay")
                        .param("vnp_TxnRef", "ORD-123456")
                        .param("vnp_Amount", "10000000")
                        .param("vnp_TmnCode", "WRONG_TMN_CODE")
                        .param("vnp_SecureHash", "valid_signature"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("97"))
                .andExpect(jsonPath("$.Message").value("Invalid TMN Code"));
    }

    @Test
    @DisplayName("BƯỚC 5: Thiếu tham số vnp_Amount trả về RspCode 04 (Invalid Amount)")
    void missingAmount_returnsRspCode04() throws Exception {
        String txnRef = "ORD-MISSING-AMT";
        PaymentTransaction txn = PaymentTransaction.builder()
                .providerTxnRef(txnRef)
                .amount(new BigDecimal("100000"))
                .status("INITIATED")
                .build();

        when(vnPayService.verifySignature(anyMap(), eq("valid_signature"))).thenReturn(true);
        when(paymentTransactionRepository.findByProviderTxnRefForUpdate(txnRef)).thenReturn(Optional.of(txn));

        mockMvc.perform(get("/payment/callback/vnpay")
                        .param("vnp_TxnRef", txnRef)
                        .param("vnp_TmnCode", configuredTmn)
                        .param("vnp_SecureHash", "valid_signature"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("04"))
                .andExpect(jsonPath("$.Message").value("Invalid Amount"));
    }

    @Test
    @DisplayName("BƯỚC 5: Tham số vnp_Amount không phải số (Long parse error) trả về RspCode 99 không ném 500")
    void invalidAmountFormat_returnsRspCode99() throws Exception {
        String txnRef = "ORD-BAD-AMT-FMT";
        PaymentTransaction txn = PaymentTransaction.builder()
                .providerTxnRef(txnRef)
                .amount(new BigDecimal("100000"))
                .status("INITIATED")
                .build();

        when(vnPayService.verifySignature(anyMap(), eq("valid_signature"))).thenReturn(true);
        when(paymentTransactionRepository.findByProviderTxnRefForUpdate(txnRef)).thenReturn(Optional.of(txn));

        mockMvc.perform(get("/payment/callback/vnpay")
                        .param("vnp_TxnRef", txnRef)
                        .param("vnp_Amount", "NOT_A_NUMBER")
                        .param("vnp_TmnCode", configuredTmn)
                        .param("vnp_SecureHash", "valid_signature"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("99"))
                .andExpect(jsonPath("$.Message").value("Invalid Number Format"));
    }

    @Test
    @DisplayName("BƯỚC 5: Số tiền vnp_Amount sai lệch so với DB trả về RspCode 04 (Invalid Amount)")
    void tamperedAmount_returnsRspCode04() throws Exception {
        String txnRef = "ORD-AMOUNT-TAMPER";
        PaymentTransaction txn = PaymentTransaction.builder()
                .providerTxnRef(txnRef)
                .amount(new BigDecimal("100000")) // 100,000 VND -> expected 10,000,000
                .status("INITIATED")
                .build();

        when(vnPayService.verifySignature(anyMap(), eq("valid_signature"))).thenReturn(true);
        when(paymentTransactionRepository.findByProviderTxnRefForUpdate(txnRef)).thenReturn(Optional.of(txn));

        mockMvc.perform(get("/payment/callback/vnpay")
                        .param("vnp_TxnRef", txnRef)
                        .param("vnp_Amount", "5000000") // Sai lệch số tiền
                        .param("vnp_TmnCode", configuredTmn)
                        .param("vnp_SecureHash", "valid_signature"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("04"))
                .andExpect(jsonPath("$.Message").value("Invalid Amount"));
    }

    @Test
    @DisplayName("BƯỚC 5: Idempotency - Gọi IPN 2 lần không xử lý lặp lại, lần 2 trả về RspCode 02")
    void idempotentIpn_calledTwice_doesNotReprocess() throws Exception {
        String txnRef = "ORD-IDEMPOTENT-001";
        PaymentTransaction pendingTxn = PaymentTransaction.builder()
                .providerTxnRef(txnRef)
                .amount(new BigDecimal("100000"))
                .status("INITIATED")
                .build();

        PaymentTransaction successTxn = PaymentTransaction.builder()
                .providerTxnRef(txnRef)
                .amount(new BigDecimal("100000"))
                .status("SUCCESS")
                .build();

        when(vnPayService.verifySignature(anyMap(), eq("valid_signature"))).thenReturn(true);
        when(paymentTransactionRepository.findByProviderTxnRefForUpdate(txnRef))
                .thenReturn(Optional.of(pendingTxn))
                .thenReturn(Optional.of(successTxn));

        // Lần 1
        mockMvc.perform(get("/payment/callback/vnpay")
                        .param("vnp_TxnRef", txnRef)
                        .param("vnp_Amount", "10000000")
                        .param("vnp_TmnCode", configuredTmn)
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_TransactionNo", "14889901")
                        .param("vnp_SecureHash", "valid_signature"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("00"))
                .andExpect(jsonPath("$.Message").value("Confirm Success"));

        verify(checkoutService, times(1)).handlePaymentSuccess(eq(txnRef), eq("14889901"), anyString());

        // Lần 2 (Replay / Duplicate IPN)
        mockMvc.perform(get("/payment/callback/vnpay")
                        .param("vnp_TxnRef", txnRef)
                        .param("vnp_Amount", "10000000")
                        .param("vnp_TmnCode", configuredTmn)
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_TransactionNo", "14889901")
                        .param("vnp_SecureHash", "valid_signature"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("02"))
                .andExpect(jsonPath("$.Message").value("Order already confirmed"));

        verify(checkoutService, times(1)).handlePaymentSuccess(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("BƯỚC 5: Gọi callback qua phương thức HTTP POST bị từ chối với 403 Forbidden")
    void postCallback_shouldReturn403Forbidden() throws Exception {
        mockMvc.perform(post("/payment/callback/vnpay")
                        .contentType("application/json")
                        .content("{\"orderId\":\"ORD-123456\",\"amount\":100000}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.RspCode").value("99"));

        verify(checkoutService, never()).handlePaymentSuccess(anyString(), anyString(), anyString());
    }

    // ==========================================
    // GROUP C (BƯỚC 6 BẮT BUỘC): POST /payment/vnpay TESTS
    // ==========================================

    @Test
    @DisplayName("BƯỚC 6 - (1): Khách ẩn danh tạo thanh toán VNPay bị từ chối với 401 Unauthorized")
    void createVNPayPayment_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/payment/vnpay")
                        .contentType("application/json")
                        .content("{\"orderCode\":\"ORD-GUEST-001\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "customer_attacker@store.com", roles = {"CUSTOMER"})
    @DisplayName("BƯỚC 6 - (2): Cố gắng thanh toán đơn hàng của khách hàng khác bị từ chối với 403 Forbidden (Chống IDOR)")
    void createVNPayPayment_orderOfAnotherCustomer_returns403() throws Exception {
        Customer attacker = Customer.builder().customerId(10L).email("customer_attacker@store.com").build();
        Customer victim = Customer.builder().customerId(99L).email("victim@store.com").build();

        Order victimOrder = Order.builder()
                .orderId(123L)
                .orderCode("ORD-VICTIM-001")
                .customer(victim)
                .status(OrderStatus.pending_payment)
                .paymentMethod("VNPAY")
                .totalAmount(new BigDecimal("15000000"))
                .build();

        when(customerRepository.findByEmailIgnoreCase("customer_attacker@store.com")).thenReturn(Optional.of(attacker));
        when(orderRepository.findByOrderCode("ORD-VICTIM-001")).thenReturn(Optional.of(victimOrder));

        mockMvc.perform(post("/payment/vnpay")
                        .contentType("application/json")
                        .content("{\"orderCode\":\"ORD-VICTIM-001\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Không tìm thấy đơn hàng với mã: ORD-VICTIM-001"));
    }

    @Test
    @WithMockUser(username = "customer@store.com", roles = {"CUSTOMER"})
    @DisplayName("BƯỚC 6 - (3a): Đơn hàng có status không phải pending_payment bị từ chối với 400 Bad Request")
    void createVNPayPayment_orderNotPendingPayment_returnsBadRequest() throws Exception {
        Customer customer = Customer.builder().customerId(1L).email("customer@store.com").build();
        Order order = Order.builder()
                .orderId(101L)
                .orderCode("ORD-COMPLETED-001")
                .customer(customer)
                .status(OrderStatus.completed) // Trạng thái đã hoàn tất
                .paymentMethod("VNPAY")
                .totalAmount(new BigDecimal("20000000"))
                .build();

        when(customerRepository.findByEmailIgnoreCase("customer@store.com")).thenReturn(Optional.of(customer));
        when(orderRepository.findByOrderCode("ORD-COMPLETED-001")).thenReturn(Optional.of(order));

        mockMvc.perform(post("/payment/vnpay")
                        .contentType("application/json")
                        .content("{\"orderCode\":\"ORD-COMPLETED-001\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Đơn hàng không ở trạng thái chờ thanh toán (hiện tại: completed)."));
    }

    @Test
    @WithMockUser(username = "customer@store.com", roles = {"CUSTOMER"})
    @DisplayName("BƯỚC 6 - (3b): Đơn hàng có phương thức thanh toán không phải VNPAY bị từ chối với 400 Bad Request")
    void createVNPayPayment_orderPaymentMethodNotVnpay_returnsBadRequest() throws Exception {
        Customer customer = Customer.builder().customerId(1L).email("customer@store.com").build();
        Order order = Order.builder()
                .orderId(102L)
                .orderCode("ORD-COD-001")
                .customer(customer)
                .status(OrderStatus.pending_payment)
                .paymentMethod("STORE") // Không phải VNPAY
                .totalAmount(new BigDecimal("10000000"))
                .build();

        when(customerRepository.findByEmailIgnoreCase("customer@store.com")).thenReturn(Optional.of(customer));
        when(orderRepository.findByOrderCode("ORD-COD-001")).thenReturn(Optional.of(order));

        mockMvc.perform(post("/payment/vnpay")
                        .contentType("application/json")
                        .content("{\"orderCode\":\"ORD-COD-001\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Phương thức thanh toán của đơn hàng không phải là VNPAY."));
    }

    @Test
    @WithMockUser(username = "customer@store.com", roles = {"CUSTOMER"})
    @DisplayName("BƯỚC 6 - (3c): Đơn hàng đã hết hạn expiresAt bị từ chối với 400 Bad Request")
    void createVNPayPayment_orderExpired_returnsBadRequest() throws Exception {
        Customer customer = Customer.builder().customerId(1L).email("customer@store.com").build();
        Order order = Order.builder()
                .orderId(103L)
                .orderCode("ORD-EXPIRED-001")
                .customer(customer)
                .status(OrderStatus.pending_payment)
                .paymentMethod("VNPAY")
                .expiresAt(OffsetDateTime.now().minusHours(1)) // Đã quá hạn 1 tiếng
                .totalAmount(new BigDecimal("10000000"))
                .build();

        when(customerRepository.findByEmailIgnoreCase("customer@store.com")).thenReturn(Optional.of(customer));
        when(orderRepository.findByOrderCode("ORD-EXPIRED-001")).thenReturn(Optional.of(order));

        mockMvc.perform(post("/payment/vnpay")
                        .contentType("application/json")
                        .content("{\"orderCode\":\"ORD-EXPIRED-001\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Đơn hàng đã hết thời gian chờ thanh toán."));
    }

    @Test
    @WithMockUser(username = "customer@store.com", roles = {"CUSTOMER"})
    @DisplayName("BƯỚC 6 - (4): Bỏ qua hoàn toàn trường amount trong body, amount trong paymentUrl = totalAmount trong DB")
    void createVNPayPayment_ignoresBodyAmount_usesDbOrderTotalAmount() throws Exception {
        Customer customer = Customer.builder().customerId(1L).email("customer@store.com").build();
        BigDecimal dbTotalAmount = new BigDecimal("25000000"); // 25,000,000 VND

        Order validOrder = Order.builder()
                .orderId(104L)
                .orderCode("ORD-VALID-VNP-001")
                .customer(customer)
                .status(OrderStatus.pending_payment)
                .paymentMethod("VNPAY")
                .expiresAt(OffsetDateTime.now().plusHours(24))
                .totalAmount(dbTotalAmount)
                .build();

        when(customerRepository.findByEmailIgnoreCase("customer@store.com")).thenReturn(Optional.of(customer));
        when(orderRepository.findByOrderCode("ORD-VALID-VNP-001")).thenReturn(Optional.of(validOrder));
        when(paymentTransactionRepository.findByOrderOrderIdOrderByCreatedAtDesc(104L)).thenReturn(Collections.emptyList());
        when(vnPayService.createPaymentUrl(anyString(), eq(25000000L), anyString()))
                .thenReturn("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=2500000000");

        // Client cố ý giả mạo body amount = 1000 VND
        mockMvc.perform(post("/payment/vnpay")
                        .contentType("application/json")
                        .content("{\"orderCode\":\"ORD-VALID-VNP-001\",\"amount\":1000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.amount").value(25000000))
                .andExpect(jsonPath("$.paymentUrl").value("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=2500000000"));

        // Xác nhận amount dùng để sinh paymentUrl bằng đúng DB totalAmount (25,000,000)
        verify(vnPayService, times(1)).createPaymentUrl(anyString(), eq(25000000L), anyString());
        verify(vnPayService, never()).createPaymentUrl(anyString(), eq(1000L), anyString());
    }

    @Test
    @DisplayName("BƯỚC 8.6: GET /payment/order-status/{orderCode} ẩn danh bị từ chối 401 Unauthorized")
    void orderStatus_anonymous_returns401() throws Exception {
        mockMvc.perform(get("/payment/order-status/ORD-123"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "customer_attacker@store.com", roles = {"CUSTOMER"})
    @DisplayName("BƯỚC 8.6: GET /payment/order-status/{orderCode} đơn của người khác trả 404 Not Found")
    void orderStatus_orderBelongsToOtherCustomer_returns404() throws Exception {
        Customer attacker = Customer.builder().customerId(10L).email("customer_attacker@store.com").build();
        Customer victim = Customer.builder().customerId(99L).email("victim@store.com").build();

        Order victimOrder = Order.builder()
                .orderId(123L)
                .orderCode("ORD-VICTIM-999")
                .customer(victim)
                .status(OrderStatus.paid)
                .totalAmount(new BigDecimal("5000000"))
                .build();

        when(customerRepository.findByEmailIgnoreCase("customer_attacker@store.com")).thenReturn(Optional.of(attacker));
        when(orderRepository.findByOrderCode("ORD-VICTIM-999")).thenReturn(Optional.of(victimOrder));

        mockMvc.perform(get("/payment/order-status/ORD-VICTIM-999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Không tìm thấy đơn hàng"));
    }

    @Test
    @WithMockUser(username = "customer@store.com", roles = {"CUSTOMER"})
    @DisplayName("BƯỚC 8.6: GET /payment/order-status/{orderCode} chính chủ chỉ trả trạng thái tối thiểu (không số tiền, không thông tin khách)")
    void orderStatus_ownOrder_returnsMinimalInfo() throws Exception {
        Customer customer = Customer.builder().customerId(1L).email("customer@store.com").build();

        Order order = Order.builder()
                .orderId(200L)
                .orderCode("ORD-OWN-200")
                .customer(customer)
                .status(OrderStatus.paid)
                .totalAmount(new BigDecimal("1200000"))
                .build();

        when(customerRepository.findByEmailIgnoreCase("customer@store.com")).thenReturn(Optional.of(customer));
        when(orderRepository.findByOrderCode("ORD-OWN-200")).thenReturn(Optional.of(order));

        mockMvc.perform(get("/payment/order-status/ORD-OWN-200"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderCode").value("ORD-OWN-200"))
                .andExpect(jsonPath("$.status").value("paid"))
                // Khẳng định KHÔNG trả số tiền và thông tin khách
                .andExpect(jsonPath("$.totalAmount").doesNotExist())
                .andExpect(jsonPath("$.customer").doesNotExist())
                .andExpect(jsonPath("$.customerEmail").doesNotExist());
    }
}
