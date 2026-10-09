package com.store.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.config.SecurityConfig;
import com.store.dto.review.CreateReviewRequest;
import com.store.dto.review.ReviewDto;
import com.store.dto.review.ReviewEligibilityDto;
import com.store.dto.review.ReviewSummaryDto;
import com.store.dto.review.UpdateReviewRequest;
import com.store.exception.GlobalExceptionHandler;
import com.store.exception.ReviewAlreadyExistsException;
import com.store.exception.ReviewNotAllowedException;
import com.store.security.JwtAuthenticationFilter;
import com.store.service.ReviewService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReviewController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
public class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReviewService reviewService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @org.junit.jupiter.api.BeforeEach
    void setUp() throws jakarta.servlet.ServletException, java.io.IOException {
        org.mockito.Mockito.doAnswer(invocation -> {
            jakarta.servlet.http.HttpServletRequest request = invocation.getArgument(0);
            jakarta.servlet.http.HttpServletResponse response = invocation.getArgument(1);
            jakarta.servlet.FilterChain chain = invocation.getArgument(2);
            chain.doFilter(request, response);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());
    }

    @Test
    @DisplayName("Ca 1: Chưa đăng nhập gửi đánh giá trả về HTTP 401 Unauthorized")
    void testCreateReviewUnauthenticated() throws Exception {
        CreateReviewRequest req = CreateReviewRequest.builder()
                .rating((short) 5)
                .comment("Nội dung đánh giá")
                .orderItemId(1L)
                .build();

        mockMvc.perform(post("/products/100/reviews")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Ca 2: Validation số sao = 0 trả về HTTP 400 kèm chi tiết lỗi field rating")
    @WithMockUser(username = "customer@store.com")
    void testRatingZeroValidationFailed() throws Exception {
        CreateReviewRequest req = CreateReviewRequest.builder()
                .rating((short) 0)
                .comment("Đánh giá 0 sao")
                .orderItemId(1L)
                .build();

        mockMvc.perform(post("/products/100/reviews")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.rating", containsString("tối thiểu 1 sao")));
    }

    @Test
    @DisplayName("Ca 3: Validation số sao = 6 trả về HTTP 400 kèm chi tiết lỗi field rating")
    @WithMockUser(username = "customer@store.com")
    void testRatingSixValidationFailed() throws Exception {
        CreateReviewRequest req = CreateReviewRequest.builder()
                .rating((short) 6)
                .comment("Đánh giá 6 sao")
                .orderItemId(1L)
                .build();

        mockMvc.perform(post("/products/100/reviews")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.rating", containsString("tối đa 5 sao")));
    }

    @Test
    @DisplayName("Ca 4: Validation nội dung nhận xét rỗng trả về HTTP 400 kèm lỗi field comment")
    @WithMockUser(username = "customer@store.com")
    void testBlankCommentValidationFailed() throws Exception {
        CreateReviewRequest req = CreateReviewRequest.builder()
                .rating((short) 5)
                .comment("   ")
                .orderItemId(1L)
                .build();

        mockMvc.perform(post("/products/100/reviews")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.comment", notNullValue()));
    }

    @Test
    @DisplayName("Ca 5: Validation nội dung nhận xét vượt quá 500 ký tự trả về HTTP 400")
    @WithMockUser(username = "customer@store.com")
    void testCommentTooLongValidationFailed() throws Exception {
        String longComment = "a".repeat(501);
        CreateReviewRequest req = CreateReviewRequest.builder()
                .rating((short) 5)
                .comment(longComment)
                .orderItemId(1L)
                .build();

        mockMvc.perform(post("/products/100/reviews")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.comment", containsString("500 ký tự")));
    }

    @Test
    @DisplayName("Ca 6: Validation thiếu orderItemId trả về HTTP 400")
    @WithMockUser(username = "customer@store.com")
    void testMissingOrderItemIdValidationFailed() throws Exception {
        CreateReviewRequest req = CreateReviewRequest.builder()
                .rating((short) 5)
                .comment("Đánh giá thiếu order item")
                .orderItemId(null)
                .build();

        mockMvc.perform(post("/products/100/reviews")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.orderItemId", notNullValue()));
    }

    @Test
    @DisplayName("Ca 7: Tài khoản Staff bị chặn trả về HTTP 403 Forbidden")
    @WithMockUser(username = "admin@store.com")
    void testStaffAccountForbidden() throws Exception {
        when(reviewService.createReview(eq(100L), any(), eq("admin@store.com")))
                .thenThrow(new ReviewNotAllowedException("Tài khoản quản trị không thể đánh giá sản phẩm."));

        CreateReviewRequest req = CreateReviewRequest.builder()
                .rating((short) 5)
                .comment("Nội dung đánh giá hợp lệ")
                .orderItemId(1L)
                .build();

        mockMvc.perform(post("/products/100/reviews")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Tài khoản quản trị không thể đánh giá sản phẩm."));
    }

    @Test
    @DisplayName("Ca 8: Đã đánh giá rồi trả về HTTP 409 Conflict")
    @WithMockUser(username = "customer@store.com")
    void testAlreadyReviewedConflict() throws Exception {
        when(reviewService.createReview(eq(100L), any(), eq("customer@store.com")))
                .thenThrow(new ReviewAlreadyExistsException("Bạn đã đánh giá sản phẩm này rồi."));

        CreateReviewRequest req = CreateReviewRequest.builder()
                .rating((short) 5)
                .comment("Nội dung đánh giá hợp lệ")
                .orderItemId(1L)
                .build();

        mockMvc.perform(post("/products/100/reviews")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Bạn đã đánh giá sản phẩm này rồi."));
    }

    @Test
    @DisplayName("Ca 9: Đánh giá thành công trả về HTTP 201 Created")
    @WithMockUser(username = "customer@store.com")
    void testCreateReviewSuccess() throws Exception {
        ReviewDto created = ReviewDto.builder()
                .reviewId(10L)
                .productId(100L)
                .rating((short) 5)
                .comment("Sản phẩm tuyệt vời!")
                .isVerifiedPurchase(true)
                .status("APPROVED")
                .build();

        when(reviewService.createReview(eq(100L), any(), eq("customer@store.com")))
                .thenReturn(created);

        CreateReviewRequest req = CreateReviewRequest.builder()
                .rating((short) 5)
                .comment("Sản phẩm tuyệt vời!")
                .orderItemId(1L)
                .build();

        mockMvc.perform(post("/products/100/reviews")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reviewId").value(10))
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    @DisplayName("Ca 10: API Summary trả về HTTP 200 OK kèm breakdown")
    void testGetReviewSummary() throws Exception {
        ReviewSummaryDto summary = ReviewSummaryDto.builder()
                .averageRating(4.8)
                .totalReviews(20L)
                .ratingBreakdown(Map.of(5, 16L, 4, 3L, 3, 1L, 2, 0L, 1, 0L))
                .build();

        when(reviewService.getReviewSummary(100L)).thenReturn(summary);

        mockMvc.perform(get("/products/100/reviews/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageRating").value(4.8))
                .andExpect(jsonPath("$.totalReviews").value(20))
                .andExpect(jsonPath("$.ratingBreakdown.5").value(16));
    }

    @Test
    @DisplayName("Ca 11: API danh sách phân trang trả về HTTP 200 OK")
    void testGetReviewsPaged() throws Exception {
        ReviewDto dto = ReviewDto.builder().reviewId(1L).rating((short) 5).build();
        when(reviewService.getReviewsPaged(eq(100L), any(), eq(0), eq(10), eq("newest")))
                .thenReturn(new PageImpl<>(List.of(dto)));

        mockMvc.perform(get("/products/100/reviews?page=0&size=10&sort=newest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].reviewId").value(1));
    }

    @Test
    @DisplayName("Ca 12: API Check Eligibility cho khách vãng lai trả về 200 NOT_LOGGED_IN")
    void testCheckEligibilityGuest() throws Exception {
        ReviewEligibilityDto eligibility = ReviewEligibilityDto.builder()
                .status("NOT_LOGGED_IN")
                .message("Vui lòng đăng nhập để đánh giá sản phẩm.")
                .build();

        when(reviewService.checkEligibility(eq(100L), any())).thenReturn(eligibility);

        mockMvc.perform(get("/products/100/reviews/check-eligibility"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("NOT_LOGGED_IN"));
    }

    @Test
    @DisplayName("Ca 13: Chỉnh sửa review thành công qua PUT /reviews/{id}")
    @WithMockUser(username = "customer@store.com")
    void testUpdateReviewSuccess() throws Exception {
        UpdateReviewRequest req = UpdateReviewRequest.builder()
                .rating((short) 4)
                .comment("Nội dung nhận xét đã cập nhật")
                .build();

        ReviewDto updated = ReviewDto.builder()
                .reviewId(10L)
                .rating((short) 4)
                .comment("Nội dung nhận xét đã cập nhật")
                .status("APPROVED")
                .build();

        when(reviewService.updateReview(eq(10L), any(), eq("customer@store.com"))).thenReturn(updated);

        mockMvc.perform(put("/reviews/10")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(4))
                .andExpect(jsonPath("$.comment").value("Nội dung nhận xét đã cập nhật"));
    }

    @Test
    @DisplayName("Ca 14: Xóa review thành công qua DELETE /reviews/{id}")
    @WithMockUser(username = "customer@store.com")
    void testDeleteReviewSuccess() throws Exception {
        doNothing().when(reviewService).deleteReview(eq(10L), eq("customer@store.com"));

        mockMvc.perform(delete("/reviews/10")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
