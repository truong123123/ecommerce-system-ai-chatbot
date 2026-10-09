package com.store.integration;

import com.store.dto.review.CreateReviewRequest;
import com.store.dto.review.ReviewDto;
import com.store.entity.*;
import com.store.exception.ReviewAlreadyExistsException;
import com.store.repository.*;
import com.store.service.ReviewService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class ReviewConcurrencyIntegrationTest {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    private Customer testCustomer;
    private Product testProduct;
    private OrderItem testOrderItem;
    private Order testOrder;

    @BeforeEach
    void setupTestData() {
        // Tạo customer test độc lập
        testCustomer = customerRepository.save(Customer.builder()
                .email("concurrency_test_" + System.currentTimeMillis() + "@test.com")
                .fullName("Khách Hàng Concurrency")
                .passwordHash("secret")
                .phone("0912345678")
                .isActive(true)
                .build());

        // Tìm một product có sẵn
        List<Product> products = productRepository.findAll();
        assertFalse(products.isEmpty(), "Cần có ít nhất 1 sản phẩm trong DB để test");
        testProduct = products.get(0);

        List<ProductVariant> variants = productVariantRepository.findByProductProductId(testProduct.getProductId());
        assertFalse(variants.isEmpty(), "Cần có ít nhất 1 variant trong DB để test");
        ProductVariant variant = variants.get(0);

        // Tạo đơn hàng completed hợp lệ
        testOrder = orderRepository.save(Order.builder()
                .customer(testCustomer)
                .orderCode("ORD-TEST-" + System.currentTimeMillis())
                .status(OrderStatus.completed)
                .orderDate(OffsetDateTime.now())
                .build());

        testOrderItem = orderItemRepository.save(OrderItem.builder()
                .order(testOrder)
                .variant(variant)
                .quantity(1)
                .unitPrice(new java.math.BigDecimal("100000"))
                .unitCost(new java.math.BigDecimal("80000"))
                .build());
    }

    @AfterEach
    void cleanUpTestData() {
        if (testCustomer != null && testProduct != null) {
            reviewRepository.findByProductProductIdAndCustomerCustomerId(testProduct.getProductId(), testCustomer.getCustomerId())
                    .ifPresent(reviewRepository::delete);
        }
        if (testOrderItem != null) {
            orderItemRepository.delete(testOrderItem);
        }
        if (testOrder != null) {
            orderRepository.delete(testOrder);
        }
        if (testCustomer != null) {
            customerRepository.delete(testCustomer);
        }
    }

    @Test
    @DisplayName("Test gửi đồng thời (Concurrent Submission): Đúng 1 thread thành công, các thread khác nhận 409 Conflict")
    void testConcurrentReviewSubmission() throws Exception {
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        List<Throwable> unexpectedErrors = new CopyOnWriteArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    startLatch.await(); // Chờ tất cả threads sẵn sàng để gửi cùng 1 micro-giây
                    CreateReviewRequest request = CreateReviewRequest.builder()
                            .rating((short) 5)
                            .comment("Đánh giá đồng thời luồng số " + index)
                            .orderItemId(testOrderItem.getOrderItemId())
                            .build();

                    ReviewDto created = reviewService.createReview(testProduct.getProductId(), request, testCustomer.getEmail());
                    if (created != null) {
                        successCount.incrementAndGet();
                    }
                } catch (ReviewAlreadyExistsException | DataIntegrityViolationException ex) {
                    conflictCount.incrementAndGet();
                } catch (Throwable t) {
                    unexpectedErrors.add(t);
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown(); // Bắn tín hiệu kích hoạt đồng thời
        boolean finished = finishLatch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(finished, "Tất cả các thread phải hoàn thành trong 10 giây");
        assertTrue(unexpectedErrors.isEmpty(), "Không được có lỗi không mong muốn: " + unexpectedErrors);

        // Kiểm tra đúng 1 luồng thành công và 7 luồng còn lại bị Conflict (409)
        assertEquals(1, successCount.get(), "Chỉ đúng 1 request được phép tạo review thành công");
        assertEquals(threadCount - 1, conflictCount.get(), "Các request còn lại phải bị chặn bởi Conflict");
    }
}
