package com.store.service;

import com.store.dto.review.CreateReviewRequest;
import com.store.dto.review.ReviewDto;
import com.store.dto.review.ReviewEligibilityDto;
import com.store.dto.review.ReviewSummaryDto;
import com.store.dto.review.UpdateReviewRequest;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface ReviewService {

    List<ReviewDto> getReviewsByProduct(Long productId);

    Page<ReviewDto> getReviewsPaged(Long productId, Integer rating, int page, int size, String sort);

    ReviewSummaryDto getReviewSummary(Long productId);

    ReviewEligibilityDto checkEligibility(Long productId, String customerEmail);

    ReviewDto createReview(Long productId, CreateReviewRequest request, String customerEmail);

    ReviewDto updateReview(Long reviewId, UpdateReviewRequest request, String customerEmail);

    void deleteReview(Long reviewId, String customerEmail);

    List<ReviewDto> getAllReviewsAdmin();

    ReviewDto updateReviewStatus(Long reviewId, String status);

    ReviewDto updateReviewStatus(Long reviewId, String status, String staffEmail);

    void deleteReview(Long reviewId);

    void deleteReviewAdmin(Long reviewId, String staffEmail);

    ReviewDto addOrUpdateReply(Long reviewId, String comment, String staffEmail);

    void deleteReply(Long reviewId, String staffEmail);

    Map<String, Object> voteHelpful(Long reviewId, String customerEmail);
}
