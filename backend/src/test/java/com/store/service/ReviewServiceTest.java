package com.store.service;

import com.store.dto.review.CreateReviewRequest;
import com.store.dto.review.ReviewDto;
import com.store.dto.review.ReviewSummaryDto;
import com.store.entity.*;
import com.store.exception.ResourceNotFoundException;
import com.store.exception.ReviewAlreadyExistsException;
import com.store.exception.ReviewNotAllowedException;
import com.store.repository.*;
import com.store.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ReviewReplyRepository reviewReplyRepository;

    @Mock
    private ReviewHelpfulVoteRepository helpfulVoteRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private com.store.security.ReviewRateLimiter rateLimiter;

    @Mock
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private Customer customer;
    private Product product;
    private Order order;
    private OrderItem orderItem;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .customerId(1L)
                .email("customer@store.com")
                .fullName("Nguyễn Khách Hàng")
                .build();

        product = Product.builder()
                .productId(100L)
                .name("iPhone 15 Pro Max")
                .build();

        ProductVariant variant = ProductVariant.builder()
                .variantId(200L)
                .product(product)
                .sku("IP15-256")
                .build();

        order = Order.builder()
                .orderId(10L)
                .customer(customer)
                .status(OrderStatus.completed)
                .orderDate(OffsetDateTime.now())
                .build();

        orderItem = OrderItem.builder()
                .orderItemId(50L)
                .order(order)
                .variant(variant)
                .quantity(1)
                .build();

        lenient().when(rateLimiter.isAllowed(any())).thenReturn(true);
    }

    @Test
    @DisplayName("Ca 1: Tài khoản admin/staff bị chặn đánh giá (HTTP 403)")
    void testStaffAccountBlocked() {
        String staffEmail = "admin@store.com";
        when(customerRepository.findByEmailIgnoreCase(staffEmail)).thenReturn(Optional.empty());
        when(staffRepository.findByEmailIgnoreCase(staffEmail)).thenReturn(Optional.of(Staff.builder().email(staffEmail).role(StaffRole.admin).build()));

        CreateReviewRequest request = CreateReviewRequest.builder()
                .rating((short) 5)
                .comment("Đánh giá từ admin")
                .build();

        ReviewNotAllowedException ex = assertThrows(ReviewNotAllowedException.class, () ->
                reviewService.createReview(100L, request, staffEmail)
        );

        assertEquals("Tài khoản quản trị không thể đánh giá sản phẩm.", ex.getMessage());
        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("Ca 2: Khách hàng chưa đăng nhập hoặc không tìm thấy bị chặn (HTTP 403)")
    void testUnknownCustomerBlocked() {
        when(customerRepository.findByEmailIgnoreCase("ghost@test.com")).thenReturn(Optional.empty());
        when(staffRepository.findByEmailIgnoreCase("ghost@test.com")).thenReturn(Optional.empty());

        CreateReviewRequest request = CreateReviewRequest.builder()
                .rating((short) 5)
                .comment("Nội dung đánh giá")
                .build();

        assertThrows(ReviewNotAllowedException.class, () ->
                reviewService.createReview(100L, request, "ghost@test.com")
        );
    }

    @Test
    @DisplayName("Ca 3: Chống IDOR - Khách hàng dùng order_item_id của khách hàng khác bị chặn 403")
    void testIdorOrderItemBlocked() {
        Customer otherCustomer = Customer.builder().customerId(999L).email("other@store.com").build();
        Order otherOrder = Order.builder().orderId(99L).customer(otherCustomer).status(OrderStatus.completed).build();
        OrderItem otherItem = OrderItem.builder().orderItemId(50L).order(otherOrder).variant(orderItem.getVariant()).build();

        when(customerRepository.findByEmailIgnoreCase(customer.getEmail())).thenReturn(Optional.of(customer));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(reviewRepository.existsByProductProductIdAndCustomerCustomerId(100L, 1L)).thenReturn(false);
        when(orderItemRepository.findById(50L)).thenReturn(Optional.of(otherItem));

        CreateReviewRequest request = CreateReviewRequest.builder()
                .rating((short) 5)
                .comment("Thử IDOR món hàng người khác")
                .orderItemId(50L)
                .build();

        ReviewNotAllowedException ex = assertThrows(ReviewNotAllowedException.class, () ->
                reviewService.createReview(100L, request, customer.getEmail())
        );

        assertEquals("Bạn không có quyền đánh giá món hàng của đơn hàng khác.", ex.getMessage());
        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("Ca 4: Đơn hàng chưa completed (ví dụ: shipped, pending) bị chặn 403")
    void testNonCompletedOrderBlocked() {
        order.setStatus(OrderStatus.shipped); // Đang giao, chưa completed

        when(customerRepository.findByEmailIgnoreCase(customer.getEmail())).thenReturn(Optional.of(customer));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(reviewRepository.existsByProductProductIdAndCustomerCustomerId(100L, 1L)).thenReturn(false);
        when(orderItemRepository.findById(50L)).thenReturn(Optional.of(orderItem));

        CreateReviewRequest request = CreateReviewRequest.builder()
                .rating((short) 5)
                .comment("Chưa nhận hàng đã đánh giá")
                .orderItemId(50L)
                .build();

        ReviewNotAllowedException ex = assertThrows(ReviewNotAllowedException.class, () ->
                reviewService.createReview(100L, request, customer.getEmail())
        );

        assertEquals("Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã hoàn thành và nhận hàng thành công.", ex.getMessage());
    }

    @Test
    @DisplayName("Ca 5: Khách hàng chưa mua sản phẩm bị chặn 403")
    void testUnpurchasedProductBlocked() {
        when(customerRepository.findByEmailIgnoreCase(customer.getEmail())).thenReturn(Optional.of(customer));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(reviewRepository.existsByProductProductIdAndCustomerCustomerId(100L, 1L)).thenReturn(false);
        when(reviewRepository.findUnreviewedCompletedOrderItemIds(1L, 100L)).thenReturn(Collections.emptyList());

        CreateReviewRequest request = CreateReviewRequest.builder()
                .rating((short) 5)
                .comment("Chưa từng mua sản phẩm này")
                .build();

        ReviewNotAllowedException ex = assertThrows(ReviewNotAllowedException.class, () ->
                reviewService.createReview(100L, request, customer.getEmail())
        );

        assertEquals("Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công.", ex.getMessage());
    }

    @Test
    @DisplayName("Ca 6: Đã đánh giá sản phẩm này rồi bị chặn 409 Conflict")
    void testAlreadyReviewedProductBlocked() {
        when(customerRepository.findByEmailIgnoreCase(customer.getEmail())).thenReturn(Optional.of(customer));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(reviewRepository.existsByProductProductIdAndCustomerCustomerId(100L, 1L)).thenReturn(true);

        CreateReviewRequest request = CreateReviewRequest.builder()
                .rating((short) 5)
                .comment("Đánh giá lần 2")
                .build();

        ReviewAlreadyExistsException ex = assertThrows(ReviewAlreadyExistsException.class, () ->
                reviewService.createReview(100L, request, customer.getEmail())
        );

        assertEquals("Bạn đã đánh giá sản phẩm này rồi.", ex.getMessage());
    }

    @Test
    @DisplayName("Ca 7: Đánh giá thành công với order_item_id hợp lệ")
    void testCreateReviewSuccess() {
        when(customerRepository.findByEmailIgnoreCase(customer.getEmail())).thenReturn(Optional.of(customer));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(reviewRepository.existsByProductProductIdAndCustomerCustomerId(100L, 1L)).thenReturn(false);
        when(orderItemRepository.findById(50L)).thenReturn(Optional.of(orderItem));
        when(reviewRepository.existsByOrderItemOrderItemId(50L)).thenReturn(false);

        Review savedReview = Review.builder()
                .reviewId(1L)
                .product(product)
                .customer(customer)
                .orderItem(orderItem)
                .rating((short) 5)
                .comment("Sản phẩm tuyệt vời, giao hàng nhanh!")
                .isVerifiedPurchase(true)
                .status(ReviewStatus.APPROVED)
                .createdAt(OffsetDateTime.now())
                .build();

        when(reviewRepository.save(any(Review.class))).thenReturn(savedReview);

        CreateReviewRequest request = CreateReviewRequest.builder()
                .rating((short) 5)
                .comment("Sản phẩm tuyệt vời, giao hàng nhanh!")
                .orderItemId(50L)
                .build();

        ReviewDto result = reviewService.createReview(100L, request, customer.getEmail());

        assertNotNull(result);
        assertEquals(1L, result.getReviewId());
        assertEquals((short) 5, result.getRating());
        assertEquals("APPROVED", result.getStatus());
        assertTrue(result.getIsVerifiedPurchase());
        assertEquals(50L, result.getOrderItemId());
        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    @DisplayName("Ca 8: Tính toán Summary và phân bổ sao 1-5 sao chuẩn xác")
    void testGetReviewSummary() {
        when(reviewRepository.getAverageRatingByProductId(100L)).thenReturn(4.666);
        when(reviewRepository.countByProductProductIdAndStatus(100L, ReviewStatus.APPROVED)).thenReturn(10L);

        List<Object[]> starCounts = new ArrayList<>();
        starCounts.add(new Object[]{(short) 5, 7L});
        starCounts.add(new Object[]{(short) 4, 2L});
        starCounts.add(new Object[]{(short) 3, 1L});
        when(reviewRepository.countRatingsByStar(100L)).thenReturn(starCounts);

        ReviewSummaryDto summary = reviewService.getReviewSummary(100L);

        assertNotNull(summary);
        assertEquals(4.7, summary.getAverageRating());
        assertEquals(10L, summary.getTotalReviews());
        assertEquals(7L, summary.getRatingBreakdown().get(5));
        assertEquals(2L, summary.getRatingBreakdown().get(4));
        assertEquals(1L, summary.getRatingBreakdown().get(3));
        assertEquals(0L, summary.getRatingBreakdown().get(2));
        assertEquals(0L, summary.getRatingBreakdown().get(1));
    }

    @Test
    @DisplayName("Ca 9: Danh sách phân trang hỗ trợ lọc theo số sao")
    void testGetReviewsPaged() {
        Review r1 = Review.builder().reviewId(1L).product(product).customer(customer).rating((short) 5).status(ReviewStatus.APPROVED).build();
        Page<Review> pageResult = new PageImpl<>(List.of(r1));

        when(reviewRepository.findApprovedReviewsPaged(eq(100L), eq((short) 5), any(Pageable.class)))
                .thenReturn(pageResult);

        Page<ReviewDto> result = reviewService.getReviewsPaged(100L, 5, 0, 10, "newest");

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1L, result.getContent().get(0).getReviewId());
    }

    @Test
    @DisplayName("Ca 10: Chủ đánh giá chỉnh sửa review trong vòng 7 ngày thành công")
    void testUpdateReview_Success() {
        Review review = Review.builder()
                .reviewId(10L)
                .product(product)
                .customer(customer)
                .rating((short) 4)
                .comment("Đánh giá cũ")
                .status(ReviewStatus.APPROVED)
                .createdAt(OffsetDateTime.now().minusDays(2))
                .build();

        when(customerRepository.findByEmailIgnoreCase(customer.getEmail())).thenReturn(Optional.of(customer));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

        com.store.dto.review.UpdateReviewRequest req = com.store.dto.review.UpdateReviewRequest.builder()
                .rating((short) 5)
                .comment("Đã cập nhật sau khi dùng thêm 2 ngày")
                .build();

        ReviewDto updated = reviewService.updateReview(10L, req, customer.getEmail());

        assertNotNull(updated);
        assertEquals((short) 5, updated.getRating());
        assertEquals("Đã cập nhật sau khi dùng thêm 2 ngày", updated.getComment());
        assertEquals("APPROVED", updated.getStatus());
    }

    @Test
    @DisplayName("Ca 11: Chỉnh sửa review quá 7 ngày bị chặn 403")
    void testUpdateReview_ExpiredAfter7Days() {
        Review review = Review.builder()
                .reviewId(10L)
                .product(product)
                .customer(customer)
                .rating((short) 4)
                .comment("Đánh giá cũ")
                .status(ReviewStatus.APPROVED)
                .createdAt(OffsetDateTime.now().minusDays(8))
                .build();

        when(customerRepository.findByEmailIgnoreCase(customer.getEmail())).thenReturn(Optional.of(customer));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));

        com.store.dto.review.UpdateReviewRequest req = com.store.dto.review.UpdateReviewRequest.builder()
                .rating((short) 5)
                .comment("Cố tình sửa sau 8 ngày")
                .build();

        assertThrows(ReviewNotAllowedException.class, () ->
                reviewService.updateReview(10L, req, customer.getEmail())
        );
    }

    @Test
    @DisplayName("Ca 12: Người khác cố tình sửa review của chủ khác bị chặn 403")
    void testUpdateReview_OtherCustomerBlocked() {
        Customer otherCustomer = Customer.builder().customerId(999L).email("other@store.com").build();
        Review review = Review.builder()
                .reviewId(10L)
                .product(product)
                .customer(customer) // review thuộc về customer id 1
                .rating((short) 4)
                .createdAt(OffsetDateTime.now().minusDays(1))
                .build();

        when(customerRepository.findByEmailIgnoreCase("other@store.com")).thenReturn(Optional.of(otherCustomer));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));

        com.store.dto.review.UpdateReviewRequest req = com.store.dto.review.UpdateReviewRequest.builder()
                .rating((short) 5)
                .comment("Hacker sửa review")
                .build();

        assertThrows(ReviewNotAllowedException.class, () ->
                reviewService.updateReview(10L, req, "other@store.com")
        );
    }

    @Test
    @DisplayName("Ca 13: Xóa review quá 7 ngày bị chặn 403")
    void testDeleteReview_ExpiredAfter7Days() {
        Review review = Review.builder()
                .reviewId(10L)
                .product(product)
                .customer(customer)
                .createdAt(OffsetDateTime.now().minusDays(10))
                .build();

        when(customerRepository.findByEmailIgnoreCase(customer.getEmail())).thenReturn(Optional.of(customer));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));

        assertThrows(ReviewNotAllowedException.class, () ->
                reviewService.deleteReview(10L, customer.getEmail())
        );
    }

    @Test
    @DisplayName("Ca 14: Người khác xóa review bị chặn 403")
    void testDeleteReview_OtherCustomerBlocked() {
        Customer otherCustomer = Customer.builder().customerId(999L).email("other@store.com").build();
        Review review = Review.builder()
                .reviewId(10L)
                .product(product)
                .customer(customer)
                .createdAt(OffsetDateTime.now().minusDays(1))
                .build();

        when(customerRepository.findByEmailIgnoreCase("other@store.com")).thenReturn(Optional.of(otherCustomer));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));

        assertThrows(ReviewNotAllowedException.class, () ->
                reviewService.deleteReview(10L, "other@store.com")
        );
    }

    @Test
    @DisplayName("Ca 15: Thêm phản hồi của shop thành công & ghi audit log")
    void testAddShopReply_Success() {
        Review review = Review.builder().reviewId(10L).product(product).customer(customer).build();
        Staff staff = Staff.builder().staffId(1).email("admin@store.com").fullName("Quản trị viên").build();

        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(staffRepository.findByEmailIgnoreCase("admin@store.com")).thenReturn(Optional.of(staff));
        when(reviewReplyRepository.findByReviewReviewId(10L)).thenReturn(Optional.empty());

        ReviewDto dto = reviewService.addOrUpdateReply(10L, "Cảm ơn bạn đã đánh giá!", "admin@store.com");

        assertNotNull(dto);
        verify(reviewReplyRepository, times(1)).save(any(ReviewReply.class));
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("Ca 16: Không thể tự bình chọn hữu ích cho review của chính mình (403)")
    void testHelpfulVote_SelfVoteBlocked() {
        Review review = Review.builder().reviewId(10L).product(product).customer(customer).build();

        when(customerRepository.findByEmailIgnoreCase(customer.getEmail())).thenReturn(Optional.of(customer));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));

        assertThrows(ReviewNotAllowedException.class, () ->
                reviewService.voteHelpful(10L, customer.getEmail())
        );
    }

    @Test
    @DisplayName("Ca 17: Bình chọn trùng lặp bị chặn 409")
    void testHelpfulVote_DuplicateBlocked() {
        Customer voter = Customer.builder().customerId(888L).email("voter@store.com").build();
        Review review = Review.builder().reviewId(10L).product(product).customer(customer).build();

        when(customerRepository.findByEmailIgnoreCase("voter@store.com")).thenReturn(Optional.of(voter));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(helpfulVoteRepository.existsByReviewReviewIdAndCustomerCustomerId(10L, 888L)).thenReturn(true);

        assertThrows(ReviewAlreadyExistsException.class, () ->
                reviewService.voteHelpful(10L, "voter@store.com")
        );
    }

    @Test
    @DisplayName("Ca 18: Bình chọn hữu ích thành công")
    void testHelpfulVote_Success() {
        Customer voter = Customer.builder().customerId(888L).email("voter@store.com").build();
        Review review = Review.builder().reviewId(10L).product(product).customer(customer).build();

        when(customerRepository.findByEmailIgnoreCase("voter@store.com")).thenReturn(Optional.of(voter));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(helpfulVoteRepository.existsByReviewReviewIdAndCustomerCustomerId(10L, 888L)).thenReturn(false);
        when(helpfulVoteRepository.countByReviewReviewId(10L)).thenReturn(1L);

        Map<String, Object> result = reviewService.voteHelpful(10L, "voter@store.com");

        assertEquals(1L, result.get("helpfulCount"));
        assertEquals(true, result.get("isHelpful"));
        verify(helpfulVoteRepository, times(1)).save(any(ReviewHelpfulVote.class));
    }

    @Test
    @DisplayName("Ca 19: Gửi đánh giá vượt quá rate limit bị chặn 429")
    void testRateLimitExceeded() {
        when(rateLimiter.isAllowed("user@test.com")).thenReturn(false);

        CreateReviewRequest request = CreateReviewRequest.builder().rating((short) 5).comment("Test").build();

        assertThrows(com.store.exception.RateLimitExceededException.class, () ->
                reviewService.createReview(100L, request, "user@test.com")
        );
    }
}
