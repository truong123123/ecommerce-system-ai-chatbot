package com.store.integration;

import com.store.controller.PaymentController;
import com.store.entity.*;
import com.store.payment.VNPayService;
import com.store.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class VnPayIpnIdempotencyIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine")
            .withDatabaseName("store_dev")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (postgres != null && postgres.isRunning()) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl);
            registry.add("spring.datasource.username", postgres::getUsername);
            registry.add("spring.datasource.password", postgres::getPassword);
        }
    }

    @Autowired
    private PaymentController paymentController;

    @Autowired
    private VNPayService vnPayService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InventoryReservationRepository inventoryReservationRepository;

    @Test
    @DisplayName("BƯỚC 8.6: Gọi IPN hợp lệ 2 lần - Lần 1 sang paid, Lần 2 trả RspCode 02, tồn kho không bị trừ hai lần")
    void testVnPayIpn_calledTwice_idempotentAndDoesNotDeductInventoryTwice() {
        long timestamp = System.currentTimeMillis();

        // 1. Chuẩn bị dữ liệu thật không mock
        Customer customer = customerRepository.save(Customer.builder()
                .email("idempotency_cust_" + timestamp + "@store.com")
                .fullName("Idempotency Test Customer")
                .passwordHash("!NO_LOGIN")
                .isActive(true)
                .build());

        Order order = orderRepository.save(Order.builder()
                .orderCode("ORD_IDEMP_" + timestamp)
                .customer(customer)
                .status(OrderStatus.pending_payment)
                .paymentMethod("VNPAY")
                .totalAmount(new BigDecimal("200000.00"))
                .orderDate(OffsetDateTime.now())
                .build());

        Category category = categoryRepository.save(Category.builder()
                .name("Test Cat " + timestamp)
                .slug("test-cat-" + timestamp)
                .sortOrder(1)
                .isActive(true)
                .build());

        Product product = productRepository.save(Product.builder()
                .category(category)
                .name("Test Phone Idempotency")
                .slug("test-phone-idemp-" + timestamp)
                .isActive(true)
                .build());

        ProductVariant variant = productVariantRepository.save(ProductVariant.builder()
                .product(product)
                .sku("SKU_IDEMP_" + timestamp)
                .attributes(Map.of("color", "Black"))
                .costPrice(new BigDecimal("80000.00"))
                .salePrice(new BigDecimal("100000.00"))
                .isActive(true)
                .build());

        Warehouse warehouse = warehouseRepository.save(Warehouse.builder()
                .name("Kho Test Idempotency " + timestamp)
                .address("123 Test Street")
                .isActive(true)
                .isStore(false)
                .build());

        Inventory inventory = inventoryRepository.save(Inventory.builder()
                .id(new InventoryId(warehouse.getWarehouseId(), variant.getVariantId()))
                .variant(variant)
                .warehouse(warehouse)
                .quantity(10)
                .reservedQty(2)
                .build());

        inventoryReservationRepository.save(InventoryReservation.builder()
                .order(order)
                .variant(variant)
                .warehouse(warehouse)
                .quantity(2)
                .status("RESERVED")
                .expiresAt(OffsetDateTime.now().plusHours(1))
                .build());

        String txnRef = "TXN_IDEMP_" + order.getOrderCode();
        paymentTransactionRepository.save(PaymentTransaction.builder()
                .order(order)
                .paymentMethod("VNPAY")
                .provider("VNPAY")
                .amount(order.getTotalAmount())
                .currency("VND")
                .status(PaymentTransaction.STATUS_INITIATED)
                .providerTxnRef(txnRef)
                .build());

        // 2. Tạo tham số IPN VNPay hợp lệ có chữ ký HMAC
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_TmnCode", vnPayService.getVnpTmnCode());
        params.put("vnp_Amount", "20000000"); // 200,000 * 100
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionNo", "14889901");
        params.put("vnp_OrderInfo", "Thanh toan don " + txnRef);

        StringBuilder hashData = new StringBuilder();
        for (Iterator<Map.Entry<String, String>> it = params.entrySet().iterator(); it.hasNext(); ) {
            Map.Entry<String, String> entry = it.next();
            hashData.append(entry.getKey()).append('=').append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            if (it.hasNext()) {
                hashData.append('&');
            }
        }
        String calculatedHash = vnPayService.hmacSHA512("TEST_HASH_SECRET_KEY_FOR_TESTS_ONLY", hashData.toString());
        params.put("vnp_SecureHash", calculatedHash);

        // 3. Gọi IPN lần 1 -> Đơn chuyển sang PAID, tồn kho giảm từ 10 xuống 8
        ResponseEntity<Map<String, String>> res1 = paymentController.handleVnPayIpn(params);
        assertEquals("00", res1.getBody().get("RspCode"), "Lần 1 IPN phải trả RspCode 00");

        Order updatedOrder1 = orderRepository.findById(order.getOrderId()).orElseThrow();
        assertEquals(OrderStatus.paid, updatedOrder1.getStatus(), "Đơn hàng phải chuyển sang status PAID");

        Inventory updatedInv1 = inventoryRepository.findById(inventory.getId()).orElseThrow();
        assertEquals(8, updatedInv1.getQuantity(), "Tồn kho sau lần 1 phải bị trừ từ 10 xuống 8");

        // 4. Gọi IPN lần 2 với cùng tham số -> Trả RspCode 02 (Idempotent), tồn kho KHÔNG bị trừ tiếp
        ResponseEntity<Map<String, String>> res2 = paymentController.handleVnPayIpn(params);
        assertEquals("02", res2.getBody().get("RspCode"), "Lần 2 IPN phải trả RspCode 02");
        assertEquals("Order already confirmed", res2.getBody().get("Message"));

        Order updatedOrder2 = orderRepository.findById(order.getOrderId()).orElseThrow();
        assertEquals(OrderStatus.paid, updatedOrder2.getStatus(), "Trạng thái đơn vẫn là PAID");

        Inventory updatedInv2 = inventoryRepository.findById(inventory.getId()).orElseThrow();
        assertEquals(8, updatedInv2.getQuantity(), "Tồn kho KHÔNG được trừ lần 2 (vẫn giữ nguyên 8)");
    }
}
