package com.store.service;

import com.store.dto.CreateProductRequest;
import com.store.dto.ProductResponseDto;
import com.store.dto.UpdateProductRequest;
import com.store.entity.Brand;
import com.store.entity.Category;
import com.store.entity.Product;
import com.store.entity.ProductVariant;
import com.store.repository.*;
import com.store.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductSpecsJsonMappingTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private SeriesRepository seriesRepository;

    @Mock
    private ReviewService reviewService;

    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private CategoryService categoryService;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private ProductServiceImpl productService;

    private Category mockCategory;
    private Brand mockBrand;

    @BeforeEach
    void setUp() {
        mockCategory = Category.builder().categoryId(1).name("Điện thoại").slug("dien-thoai").build();
        mockBrand = Brand.builder().brandId(1).name("Apple").slug("apple").build();
    }

    @Test
    @DisplayName("1. Product Entity: Khởi tạo và parse specs với nhiều thuộc tính")
    void testProductSpecsWithMultipleAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("chip", "Apple A18 Pro");
        attributes.put("ram", "8GB");
        attributes.put("storage", "256GB");
        attributes.put("screen", "6.3 inch OLED 120Hz");
        attributes.put("rating", 4.8);

        Product product = Product.builder()
                .name("iPhone 16 Pro")
                .slug("iphone-16-pro")
                .specs(attributes)
                .build();

        assertThat(product.getSpecs()).isNotNull();
        assertThat(product.getSpecs()).isInstanceOf(Map.class);
        assertThat(product.getSpecs()).containsEntry("chip", "Apple A18 Pro");
        assertThat(product.getSpecs()).containsEntry("ram", "8GB");
        assertThat(product.getSpecs()).containsEntry("rating", 4.8);
    }

    @Test
    @DisplayName("2. Product Entity: Khởi tạo với specs rỗng")
    void testProductSpecsWithEmptyMap() {
        Product product = Product.builder()
                .name("Tai nghe AirPods")
                .slug("airpods")
                .specs(new HashMap<>())
                .build();

        assertThat(product.getSpecs()).isNotNull();
        assertThat(product.getSpecs()).isEmpty();
    }

    @Test
    @DisplayName("3. Product Entity: Khởi tạo với specs null")
    void testProductSpecsWithNull() {
        Product product = Product.builder()
                .name("Cáp sạc USB-C")
                .slug("cap-sac-usb-c")
                .specs(null)
                .build();

        assertThat(product.getSpecs()).isNotNull();
        assertThat(product.getSpecs()).isEmpty();
    }

    @Test
    @DisplayName("4. Product Entity: Khởi tạo với chuỗi JSON String")
    void testProductSpecsWithStringJson() {
        String json = "{\"color\":\"Titanium\",\"battery\":\"4000mAh\"}";

        Product product = Product.builder()
                .name("Galaxy S24")
                .slug("galaxy-s24")
                .specs(json)
                .build();

        assertThat(product.getSpecs()).isNotNull();
        assertThat(product.getSpecs()).containsEntry("color", "Titanium");
        assertThat(product.getSpecs()).containsEntry("battery", "4000mAh");
    }

    @Test
    @DisplayName("5. Product Entity: Cập nhật specs qua setter với Object linh hoạt")
    void testProductSetSpecs() {
        Product product = Product.builder().name("Test").slug("test").build();

        // Ban đầu rỗng
        assertThat(product.getSpecs()).isEmpty();

        // Cập nhật qua Map
        Map<String, Object> newSpecs = Map.of("cpu", "M3 Max", "ram", "64GB");
        product.setSpecs(newSpecs);
        assertThat(product.getSpecs()).containsEntry("cpu", "M3 Max");

        // Cập nhật qua String JSON
        product.setSpecs("{\"gpu\": \"40-core\"}");
        assertThat(product.getSpecs()).containsEntry("gpu", "40-core");

        // Cập nhật null -> rỗng an toàn
        product.setSpecs(null);
        assertThat(product.getSpecs()).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("6. ProductVariant Entity: Khởi tạo attributes an toàn")
    void testProductVariantAttributes() {
        Map<String, Object> attrs = Map.of("color", "Titan Tự Nhiên", "storage", "512GB");
        ProductVariant variant = ProductVariant.builder()
                .sku("SKU-TEST-01")
                .costPrice(BigDecimal.valueOf(20000000))
                .salePrice(BigDecimal.valueOf(25000000))
                .attributes(attrs)
                .build();

        assertThat(variant.getAttributes()).isNotNull();
        assertThat(variant.getAttributes()).containsEntry("color", "Titan Tự Nhiên");
    }

    @Test
    @DisplayName("7. Service: createProduct với specs có nhiều thuộc tính")
    void testCreateProductWithSpecs() {
        when(categoryRepository.findById(1)).thenReturn(Optional.of(mockCategory));
        when(brandRepository.findById(1)).thenReturn(Optional.of(mockBrand));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setProductId(100L);
            return p;
        });

        Map<String, Object> specs = new HashMap<>();
        specs.put("screen", "6.7 inch");
        specs.put("chip", "Snapdragon 8 Gen 3");
        specs.put("battery", "5000mAh");

        CreateProductRequest request = CreateProductRequest.builder()
                .name("Smartphone Flagship Test")
                .slug("flagship-test")
                .categoryId(1)
                .brandId(1)
                .price(BigDecimal.valueOf(21990000))
                .costPrice(BigDecimal.valueOf(18000000))
                .specs(specs)
                .build();

        ProductResponseDto response = productService.createProduct(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getName()).isEqualTo("Smartphone Flagship Test");

        verify(productRepository, times(1)).save(argThat(p -> {
            assertThat(p.getSpecs()).isNotNull();
            assertThat(p.getSpecs()).containsEntry("chip", "Snapdragon 8 Gen 3");
            assertThat(p.getSpecs()).containsEntry("battery", "5000mAh");
            return true;
        }));
    }

    @Test
    @DisplayName("8. Service: updateProduct cập nhật trường specs mới")
    void testUpdateProductSpecs() {
        Product existingProduct = Product.builder()
                .productId(200L)
                .name("MacBook Pro M3")
                .slug("macbook-pro-m3")
                .specs(Map.of("ram", "16GB"))
                .build();

        when(productRepository.findById(200L)).thenReturn(Optional.of(existingProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> updatedSpecs = Map.of("ram", "36GB", "storage", "1TB");
        UpdateProductRequest updateRequest = UpdateProductRequest.builder()
                .name("MacBook Pro M3 Max")
                .specs(updatedSpecs)
                .build();

        ProductResponseDto response = productService.updateProduct(200L, updateRequest);

        assertThat(response).isNotNull();
        assertThat(existingProduct.getSpecs()).containsEntry("ram", "36GB");
        assertThat(existingProduct.getSpecs()).containsEntry("storage", "1TB");
    }
}
