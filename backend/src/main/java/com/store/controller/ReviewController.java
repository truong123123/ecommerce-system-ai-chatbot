package com.store.controller;

import com.store.dto.review.CreateReviewRequest;
import com.store.dto.review.ReviewDto;
import com.store.dto.review.ReviewEligibilityDto;
import com.store.dto.review.ReviewSummaryDto;
import com.store.dto.review.UpdateReviewRequest;
import com.store.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReviewController {

    private final ReviewService reviewService;

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return null;
        }
        return auth.getName();
    }

    // API Summary: GET /products/{productId}/reviews/summary
    @GetMapping({"/products/{productId}/reviews/summary", "/reviews/product/{productId}/summary"})
    public ResponseEntity<ReviewSummaryDto> getReviewSummary(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewSummary(productId));
    }

    // API Danh sách có phân trang, lọc sao và sắp xếp: GET /products/{productId}/reviews
    @GetMapping({"/products/{productId}/reviews", "/reviews/product/{productId}/paged"})
    public ResponseEntity<Page<ReviewDto>> getReviewsPaged(
            @PathVariable Long productId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sort
    ) {
        int boundedSize = Math.min(Math.max(size, 1), 50);
        return ResponseEntity.ok(reviewService.getReviewsPaged(productId, rating, page, boundedSize, sort));
    }

    // API Danh sách toàn bộ (backward compatibility)
    @GetMapping("/reviews/product/{productId}")
    public ResponseEntity<List<ReviewDto>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    // API Kiểm tra điều kiện đánh giá: GET /products/{productId}/reviews/check-eligibility
    @GetMapping({"/products/{productId}/reviews/check-eligibility", "/reviews/check-eligibility/{productId}", "/products/{productId}/reviews/eligibility"})
    public ResponseEntity<ReviewEligibilityDto> checkEligibility(@PathVariable Long productId) {
        String email = getCurrentUserEmail();
        return ResponseEntity.ok(reviewService.checkEligibility(productId, email));
    }

    // API Tạo đánh giá: POST /products/{productId}/reviews
    @PostMapping({"/products/{productId}/reviews", "/reviews/product/{productId}"})
    public ResponseEntity<ReviewDto> createReview(
            @PathVariable Long productId,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        String email = getCurrentUserEmail();
        if (email == null || "anonymousUser".equalsIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ReviewDto created = reviewService.createReview(productId, request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // API Sửa đánh giá: PUT /reviews/{reviewId} (chỉ chủ review, trong 7 ngày)
    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<ReviewDto> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody UpdateReviewRequest request
    ) {
        String email = getCurrentUserEmail();
        if (email == null || "anonymousUser".equalsIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ReviewDto updated = reviewService.updateReview(reviewId, request, email);
        return ResponseEntity.ok(updated);
    }

    // API Xóa đánh giá: DELETE /reviews/{reviewId} (chỉ chủ review, trong 7 ngày)
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        String email = getCurrentUserEmail();
        if (email == null || "anonymousUser".equalsIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        reviewService.deleteReview(reviewId, email);
        return ResponseEntity.noContent().build();
    }

    // API Bình chọn hữu ích: POST /reviews/{reviewId}/helpful
    @PostMapping("/reviews/{reviewId}/helpful")
    public ResponseEntity<Map<String, Object>> voteHelpful(@PathVariable Long reviewId) {
        String email = getCurrentUserEmail();
        if (email == null || "anonymousUser".equalsIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Map<String, Object> result = reviewService.voteHelpful(reviewId, email);
        return ResponseEntity.ok(result);
    }
}
