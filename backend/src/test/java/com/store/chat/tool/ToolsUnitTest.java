package com.store.chat.tool;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.dto.ProductDetailDto;
import com.store.dto.ProductPageResponseDto;
import com.store.dto.ProductResponseDto;
import com.store.entity.*;
import com.store.repository.BrandRepository;
import com.store.repository.InventoryRepository;
import com.store.repository.OrderRepository;
import com.store.repository.ProductRepository;
import com.store.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ToolsUnitTest {

    private ObjectMapper objectMapper;

    @Mock
    private ProductService productService;
    @Mock
    private BrandRepository brandRepository;
    @Mock
    private InventoryRepository inventoryRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private OrderRepository orderRepository;

    private SearchProductsTool searchProductsTool;
    private GetProductDetailTool getProductDetailTool;
    private CompareProductsTool compareProductsTool;
    private CheckStockTool checkStockTool;
    private GetOrderStatusTool getOrderStatusTool;
    private GetPolicyTool getPolicyTool;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();

        searchProductsTool = new SearchProductsTool(productService, brandRepository, inventoryRepository, objectMapper);
        getProductDetailTool = new GetProductDetailTool(productService, inventoryRepository, objectMapper);
        compareProductsTool = new CompareProductsTool(productRepository, inventoryRepository, objectMapper);
        checkStockTool = new CheckStockTool(productRepository, inventoryRepository, objectMapper);
        getOrderStatusTool = new GetOrderStatusTool(orderRepository, objectMapper);

        getPolicyTool = new GetPolicyTool(objectMapper);
        getPolicyTool.init();
    }

    // ==========================================
    // 1. SearchProductsTool Tests
    // ==========================================
    @Test
    @DisplayName("search_products: tìm kiếm hợp lệ, trả về sản phẩm và gắn ProductCardDto vào context")
    void searchProducts_validInput_returnsProducts() {
        ProductResponseDto.VariantDto vDto = ProductResponseDto.VariantDto.builder()
                .variantId(101L)
                .salePrice(BigDecimal.valueOf(25000000))
                .build();
        ProductResponseDto pDto = ProductResponseDto.builder()
                .id(1L)
                .name("iPhone 15 Pro")
                .slug("iphone-15-pro")
                .price(BigDecimal.valueOf(28000000))
                .primaryImage("https://img.com/iphone.jpg")
                .variants(List.of(vDto))
                .build();

        ProductPageResponseDto page = ProductPageResponseDto.builder()
                .items(List.of(pDto))
                .totalElements(1)
                .build();

        when(productService.getProducts(any(), any(), any(), any(), eq("iPhone"), any(), any(), any(), any(), anyInt(), anyInt(), anyInt(), eq(true)))
                .thenReturn(page);
        when(inventoryRepository.getAvailableStockByVariantId(101L)).thenReturn(5);

        ChatContext ctx = new ChatContext(null);
        ToolExecutionResult result = searchProductsTool.execute(Map.of("keyword", "iPhone"), ctx);

        assertThat(result.getResultJson()).contains("iPhone 15 Pro");
        assertThat(result.getProducts()).hasSize(1);
        assertThat(result.getProducts().get(0).getName()).isEqualTo("iPhone 15 Pro");
        assertThat(result.getProducts().get(0).isInStock()).isTrue();
        assertThat(ctx.getCollectedProductsList()).hasSize(1);
    }

    @Test
    @DisplayName("search_products: không tìm thấy sản phẩm nào")
    void searchProducts_noData_returnsEmpty() {
        ProductPageResponseDto emptyPage = ProductPageResponseDto.builder()
                .items(Collections.emptyList())
                .totalElements(0)
                .build();

        when(productService.getProducts(any(), any(), any(), any(), eq("xyz123"), any(), any(), any(), any(), anyInt(), anyInt(), anyInt(), eq(true)))
                .thenReturn(emptyPage);

        ChatContext ctx = new ChatContext(null);
        ToolExecutionResult result = searchProductsTool.execute(Map.of("keyword", "xyz123"), ctx);

        assertThat(result.getResultJson()).contains("\"count\":0");
        assertThat(result.getProducts()).isEmpty();
        assertThat(ctx.getCollectedProductsList()).isEmpty();
    }

    @Test
    @DisplayName("search_products: khoảng giá âm được chuẩn hóa thành 0")
    void searchProducts_negativePrice_normalized() {
        when(productService.getProducts(any(), any(), any(), any(), eq("MacBook"), any(), any(), eq(BigDecimal.ZERO), any(), anyInt(), anyInt(), anyInt(), eq(true)))
                .thenReturn(ProductPageResponseDto.builder().items(List.of()).build());

        ChatContext ctx = new ChatContext(null);
        ToolExecutionResult result = searchProductsTool.execute(Map.of("keyword", "MacBook", "minPrice", -5000), ctx);

        assertThat(result.getResultJson()).contains("\"count\":0");
    }

    // ==========================================
    // 2. GetProductDetailTool Tests
    // ==========================================
    @Test
    @DisplayName("get_product_detail: slug hợp lệ trả về thông tin chi tiết và thêm card vào context")
    void getProductDetail_validSlug_returnsDetail() {
        ProductDetailDto detail = ProductDetailDto.builder()
                .id(2L)
                .name("MacBook Air M3")
                .slug("macbook-air-m3")
                .price(BigDecimal.valueOf(27000000))
                .primaryImage("https://img.com/mac.jpg")
                .variants(List.of(
                        ProductDetailDto.VariantDetailDto.builder()
                                .id(201L)
                                .sku("MBA-M3-8-256")
                                .price(BigDecimal.valueOf(26500000))
                                .build()
                ))
                .build();

        when(productService.getProductDetailBySlug("macbook-air-m3")).thenReturn(detail);
        when(inventoryRepository.getAvailableStockByVariantId(201L)).thenReturn(3);

        ChatContext ctx = new ChatContext(null);
        ToolExecutionResult result = getProductDetailTool.execute(Map.of("slug", "macbook-air-m3"), ctx);

        assertThat(result.getResultJson()).contains("MacBook Air M3");
        assertThat(result.getProducts()).hasSize(1);
        assertThat(result.getProducts().get(0).isInStock()).isTrue();
        assertThat(ctx.getCollectedProductsList()).hasSize(1);
    }

    @Test
    @DisplayName("get_product_detail: thiếu tham số slug trả về lỗi")
    void getProductDetail_missingSlug_returnsError() {
        ChatContext ctx = new ChatContext(null);
        ToolExecutionResult result = getProductDetailTool.execute(Collections.emptyMap(), ctx);

        assertThat(result.getResultJson()).contains("error");
    }

    @Test
    @DisplayName("get_product_detail: không tìm thấy slug trả về thông báo lỗi")
    void getProductDetail_notFound_returnsError() {
        when(productService.getProductDetailBySlug("non-existent")).thenReturn(null);

        ChatContext ctx = new ChatContext(null);
        ToolExecutionResult result = getProductDetailTool.execute(Map.of("slug", "non-existent"), ctx);

        assertThat(result.getResultJson()).contains("Không tìm thấy sản phẩm");
    }

    // ==========================================
    // 3. CompareProductsTool Tests
    // ==========================================
    @Test
    @DisplayName("compare_products: 2 ID hợp lệ trả về bảng so sánh")
    void compareProducts_validTwoIds_returnsComparison() {
        Product p1 = Product.builder()
                .productId(1L)
                .name("iPhone 15 Pro")
                .slug("iphone-15-pro")
                .isActive(true)
                .variants(List.of(ProductVariant.builder().variantId(101L).salePrice(BigDecimal.valueOf(28000000)).build()))
                .specs("{\"chip\": \"A17 Pro\", \"ram\": \"8GB\"}")
                .build();

        Product p2 = Product.builder()
                .productId(2L)
                .name("Samsung Galaxy S24 Ultra")
                .slug("s24-ultra")
                .isActive(true)
                .variants(List.of(ProductVariant.builder().variantId(102L).salePrice(BigDecimal.valueOf(29000000)).build()))
                .specs("{\"chip\": \"Snapdragon 8 Gen 3\", \"ram\": \"12GB\"}")
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(p1));
        when(productRepository.findById(2L)).thenReturn(Optional.of(p2));

        ChatContext ctx = new ChatContext(null);
        ToolExecutionResult result = compareProductsTool.execute(Map.of("ids", List.of(1, 2)), ctx);

        assertThat(result.getResultJson()).contains("iPhone 15 Pro");
        assertThat(result.getResultJson()).contains("Samsung Galaxy S24 Ultra");
        assertThat(result.getResultJson()).contains("Hiệu năng & Phần cứng");
        assertThat(result.getProducts()).hasSize(2);
        assertThat(ctx.getCollectedProductsList()).hasSize(2);
    }

    @Test
    @DisplayName("compare_products: truyền dưới 2 ID hoặc trên 3 ID trả về lỗi")
    void compareProducts_invalidCount_returnsError() {
        ChatContext ctx = new ChatContext(null);
        ToolExecutionResult r1 = compareProductsTool.execute(Map.of("ids", List.of(1)), ctx);
        assertThat(r1.getResultJson()).contains("error");

        ToolExecutionResult r2 = compareProductsTool.execute(Map.of("ids", List.of(1, 2, 3, 4)), ctx);
        assertThat(r2.getResultJson()).contains("error");
    }

    // ==========================================
    // 4. CheckStockTool Tests
    // ==========================================
    @Test
    @DisplayName("check_stock: ID hợp lệ tính toán tồn kho trừ đi reserved quantity")
    void checkStock_validId_calculatesStockMinusReserved() {
        ProductVariant variant = ProductVariant.builder()
                .variantId(11L)
                .sku("IP15-128")
                .isActive(true)
                .build();

        Product product = Product.builder()
                .productId(1L)
                .name("iPhone 15")
                .isActive(true)
                .variants(List.of(variant))
                .build();

        Warehouse warehouse = Warehouse.builder().name("Kho Hà Nội").build();
        Inventory inventory = Inventory.builder()
                .warehouse(warehouse)
                .quantity(10)
                .reservedQty(3) // Khả dụng = 10 - 3 = 7
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByIdVariantId(11L)).thenReturn(List.of(inventory));

        ChatContext ctx = new ChatContext(null);
        ToolExecutionResult result = checkStockTool.execute(Map.of("productId", 1), ctx);

        assertThat(result.getResultJson()).contains("\"inStock\":true");
        assertThat(result.getResultJson()).contains("\"totalAvailableQuantity\":7");
        assertThat(result.getResultJson()).contains("Kho Hà Nội");
    }

    @Test
    @DisplayName("check_stock: sản phẩm không tồn tại trả về lỗi")
    void checkStock_notFound_returnsError() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        ChatContext ctx = new ChatContext(null);
        ToolExecutionResult result = checkStockTool.execute(Map.of("productId", 999), ctx);

        assertThat(result.getResultJson()).contains("Không tìm thấy sản phẩm");
    }

    // ==========================================
    // 5. GetOrderStatusTool Tests (Bảo mật & Phân quyền)
    // ==========================================
    @Test
    @DisplayName("get_order_status: khách chưa đăng nhập bị từ chối")
    void getOrderStatus_unauthenticated_rejected() {
        ChatContext unauthCtx = new ChatContext(null); // Chưa đăng nhập

        ToolExecutionResult result = getOrderStatusTool.execute(Map.of("orderId", "ORD-123"), unauthCtx);

        assertThat(result.getResultJson()).contains("Bạn cần đăng nhập");
    }

    @Test
    @DisplayName("get_order_status: tra cứu đơn hàng của khách hàng khác bị từ chối")
    void getOrderStatus_otherCustomerOrder_isolated() {
        Customer customerAlice = Customer.builder().customerId(10L).email("alice@store.com").build();
        Customer customerBob = Customer.builder().customerId(20L).email("bob@store.com").build();

        Order bobsOrder = Order.builder()
                .orderId(100L)
                .orderCode("ORD-BOB-01")
                .customer(customerBob)
                .build();

        when(orderRepository.findByOrderCode("ORD-BOB-01")).thenReturn(Optional.of(bobsOrder));

        // Alice đang đăng nhập nhưng cố tra cứu đơn của Bob
        ChatContext aliceCtx = new ChatContext(customerAlice);
        ToolExecutionResult result = getOrderStatusTool.execute(Map.of("orderId", "ORD-BOB-01"), aliceCtx);

        assertThat(result.getResultJson()).contains("Không tìm thấy đơn hàng");
    }

    @Test
    @DisplayName("get_order_status: khách hàng tra cứu đúng đơn của mình thành công và không lộ SĐT/địa chỉ")
    void getOrderStatus_ownOrder_success_noSensitiveData() {
        Customer alice = Customer.builder().customerId(10L).email("alice@store.com").build();

        OrderItem item = OrderItem.builder()
                .productNameSnapshot("iPhone 15 Pro Max")
                .quantity(1)
                .unitPrice(BigDecimal.valueOf(29990000))
                .lineTotal(BigDecimal.valueOf(29990000))
                .build();

        Order order = Order.builder()
                .orderId(500L)
                .orderCode("ORD-ALICE-99")
                .customer(alice)
                .status(OrderStatus.confirmed)
                .orderDate(OffsetDateTime.now())
                .totalAmount(BigDecimal.valueOf(29990000))
                .shippingStreet("123 Phố Huế, Hoàn Kiếm, Hà Nội")
                .customerPhone("0987654321")
                .items(List.of(item))
                .build();

        when(orderRepository.findByOrderCode("ORD-ALICE-99")).thenReturn(Optional.of(order));

        ChatContext aliceCtx = new ChatContext(alice);
        ToolExecutionResult result = getOrderStatusTool.execute(Map.of("orderId", "ORD-ALICE-99"), aliceCtx);

        assertThat(result.getResultJson()).contains("ORD-ALICE-99");
        assertThat(result.getResultJson()).contains("confirmed");
        assertThat(result.getResultJson()).contains("iPhone 15 Pro Max");
        // Kiểm tra không để lộ thông tin nhạy cảm
        assertThat(result.getResultJson()).doesNotContain("123 Phố Huế");
        assertThat(result.getResultJson()).doesNotContain("0987654321");
    }

    @Test
    @DisplayName("B1: get_order_status: LLM cố truyền thêm customerId/customer_id trong args thì bị bỏ qua")
    void getOrderStatus_spoofedCustomerIdInArgs_ignored() {
        Customer alice = Customer.builder().customerId(10L).email("alice@store.com").build();
        Customer bob = Customer.builder().customerId(20L).email("bob@store.com").build();

        Order bobsOrder = Order.builder()
                .orderId(100L)
                .orderCode("ORD-BOB-01")
                .customer(bob)
                .status(OrderStatus.confirmed)
                .build();

        when(orderRepository.findByOrderCode("ORD-BOB-01")).thenReturn(Optional.of(bobsOrder));

        ChatContext aliceCtx = new ChatContext(alice);
        // LLM cố giả mạo bằng cách truyền customerId=20 trong args
        Map<String, Object> maliciousArgs = Map.of(
                "orderId", "ORD-BOB-01",
                "customerId", 20,
                "customer_id", 20
        );
        ToolExecutionResult result = getOrderStatusTool.execute(maliciousArgs, aliceCtx);

        // Tool phải bỏ qua customerId trong args và dựa vào aliceCtx, từ chối vì không phải đơn của Alice
        assertThat(result.getResultJson()).contains("Không tìm thấy đơn hàng");
    }

    // ==========================================
    // 6. GetPolicyTool Tests (A3: Grounded Policies)
    // ==========================================
    @Test
    @DisplayName("A3: get_policy: chủ đề hợp lệ trả về thông tin đã xác thực verified=true và source")
    void getPolicy_validTopic_returnsVerifiedTrue() {
        ChatContext ctx = new ChatContext(null);
        ToolExecutionResult result = getPolicyTool.execute(Map.of("topic", "shipping"), ctx);

        assertThat(result.getResultJson()).contains("Chính sách vận chuyển");
        assertThat(result.getResultJson()).contains("\"verified\":true");
        assertThat(result.getResultJson()).contains("\"source\":");
    }

    @Test
    @DisplayName("A3: get_policy: chủ đề chưa có số liệu chi tiết trả về verified=false kèm hướng dẫn liên hệ")
    void getPolicy_unverifiedTopic_returnsVerifiedFalse() {
        ChatContext ctx = new ChatContext(null);
        ToolExecutionResult result = getPolicyTool.execute(Map.of("topic", "installment"), ctx);

        assertThat(result.getResultJson()).contains("Chính sách trả góp");
        assertThat(result.getResultJson()).contains("\"verified\":false");
        assertThat(result.getResultJson()).contains("liên hệ");
    }

    @Test
    @DisplayName("A3: get_policy: chủ đề không hợp lệ trả về lỗi và verified=false")
    void getPolicy_invalidTopic_returnsError() {
        ChatContext ctx = new ChatContext(null);
        ToolExecutionResult result = getPolicyTool.execute(Map.of("topic", "tuyendung"), ctx);

        assertThat(result.getResultJson()).contains("Chủ đề không hợp lệ");
        assertThat(result.getResultJson()).contains("\"verified\"");
        assertThat(result.getResultJson()).contains("false");
        assertThat(result.getResultJson()).contains("warranty");
    }

    @Test
    @DisplayName("A3: policies.vi.json không còn sót số liệu tự bịa (1.000.000, 2h, 0%)")
    void policiesFile_containsNoInventedMetrics() throws Exception {
        org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource("chat/policies.vi.json");
        String content = new String(resource.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);

        assertThat(content).doesNotContain("1.000.000");
        assertThat(content).doesNotContain("2h");
        assertThat(content).doesNotContain("0%");
    }

    @Test
    @DisplayName("A3: get_policy: ưu tiên đọc từ DB product_commitments trước khi fallback")
    void getPolicy_readsFromDatabaseFirst() {
        org.springframework.jdbc.core.JdbcTemplate mockJdbc = org.mockito.Mockito.mock(org.springframework.jdbc.core.JdbcTemplate.class);
        when(mockJdbc.query(anyString(), any(org.springframework.jdbc.core.RowMapper.class), any(), any()))
                .thenReturn(List.of("Bảo hành 1 đổi 1 trong 30 ngày"));

        GetPolicyTool dbPolicyTool = new GetPolicyTool(objectMapper, mockJdbc);
        dbPolicyTool.init();

        ChatContext ctx = new ChatContext(null);
        ToolExecutionResult result = dbPolicyTool.execute(Map.of("topic", "warranty"), ctx);

        assertThat(result.getResultJson()).contains("database: table product_commitments");
        assertThat(result.getResultJson()).contains("Bảo hành 1 đổi 1");
        assertThat(result.getResultJson()).contains("\"verified\":true");
    }
}
