package com.store.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.dto.review.CreateReviewRequest;
import com.store.dto.review.ReviewDto;
import com.store.dto.review.ReviewEligibilityDto;
import com.store.dto.review.ReviewReplyDto;
import com.store.dto.review.ReviewSummaryDto;
import com.store.dto.review.UpdateReviewRequest;
import com.store.entity.*;
import com.store.exception.RateLimitExceededException;
import com.store.exception.ResourceNotFoundException;
import com.store.exception.ReviewAlreadyExistsException;
import com.store.exception.ReviewNotAllowedException;
import com.store.repository.*;
import com.store.security.ReviewRateLimiter;
import com.store.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final ReviewHelpfulVoteRepository helpfulVoteRepository;
    private final AuditLogRepository auditLogRepository;
    private final ReviewRateLimiter rateLimiter;
    private final ObjectMapper objectMapper;

    private Customer getCustomerByEmailOrThrow(String email) {
        if (email == null || email.isBlank() || "anonymousUser".equalsIgnoreCase(email)) {
            throw new ReviewNotAllowedException("Vui lòng đăng nhập để đánh giá sản phẩm.");
        }
        Optional<Customer> customerOpt = customerRepository.findByEmailIgnoreCase(email);
        if (customerOpt.isPresent()) {
            return customerOpt.get();
        }

        // Chặn tài khoản quản trị (admin/staff) đánh giá sản phẩm
        if (staffRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ReviewNotAllowedException("Tài khoản quản trị không thể đánh giá sản phẩm.");
        }

        throw new ReviewNotAllowedException("Không tìm thấy thông tin tài khoản khách hàng.");
    }

    private String maskCustomerName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return "K***h";
        }
        String trimmed = fullName.trim();
        if (trimmed.length() == 1) {
            return trimmed + "***";
        }
        char first = trimmed.charAt(0);
        char last = trimmed.charAt(trimmed.length() - 1);
        return first + "***" + last;
    }

    private ReviewDto toDto(Review r) {
        return toDto(r, true, null);
    }

    private ReviewDto toDto(Review r, boolean maskName, Long currentCustomerId) {
        String authorName = "Khách hàng";
        if (r.getCustomer() != null && r.getCustomer().getFullName() != null) {
            authorName = maskName ? maskCustomerName(r.getCustomer().getFullName()) : r.getCustomer().getFullName();
        }

        ReviewReplyDto replyDto = null;
        Optional<ReviewReply> replyOpt = reviewReplyRepository.findByReviewReviewId(r.getReviewId());
        if (replyOpt.isPresent()) {
            ReviewReply reply = replyOpt.get();
            replyDto = ReviewReplyDto.builder()
                    .replyId(reply.getReplyId())
                    .reviewId(r.getReviewId())
                    .staffName(reply.getStaff() != null ? reply.getStaff().getFullName() : "Quản trị viên")
                    .comment(reply.getComment())
                    .createdAt(reply.getCreatedAt())
                    .build();
        }

        long helpfulCount = helpfulVoteRepository.countByReviewReviewId(r.getReviewId());
        boolean isHelpful = false;
        if (currentCustomerId != null) {
            isHelpful = helpfulVoteRepository.existsByReviewReviewIdAndCustomerCustomerId(r.getReviewId(), currentCustomerId);
        }

        return ReviewDto.builder()
                .reviewId(r.getReviewId())
                .productId(r.getProduct() != null ? r.getProduct().getProductId() : null)
                .productName(r.getProduct() != null ? r.getProduct().getName() : null)
                .customerId(r.getCustomer() != null ? r.getCustomer().getCustomerId() : null)
                .customerName(authorName)
                .rating(r.getRating())
                .comment(r.getComment())
                .orderItemId(r.getOrderItem() != null ? r.getOrderItem().getOrderItemId() : null)
                .isVerifiedPurchase(Boolean.TRUE.equals(r.getIsVerifiedPurchase()))
                .status(r.getStatus() != null ? r.getStatus().name() : ReviewStatus.APPROVED.name())
                .createdAt(r.getCreatedAt())
                .reply(replyDto)
                .helpfulCount(helpfulCount)
                .isHelpful(isHelpful)
                .build();
    }

    private void logAudit(Staff staff, String action, String recordId, Object oldData, Object newData) {
        try {
            String oldJson = oldData != null ? objectMapper.writeValueAsString(oldData) : null;
            String newJson = newData != null ? objectMapper.writeValueAsString(newData) : null;
            AuditLog auditLog = AuditLog.builder()
                    .staff(staff)
                    .tableName("reviews")
                    .recordId(recordId)
                    .action(action)
                    .oldData(oldJson)
                    .newData(newJson)
                    .createdAt(OffsetDateTime.now())
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Không thể ghi audit_log: {}", e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDto> getReviewsByProduct(Long productId) {
        List<Review> list = reviewRepository.findApprovedReviewsByProductId(productId);
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewDto> getReviewsPaged(Long productId, Integer rating, int page, int size, String sort) {
        Sort sortObj;
        if ("highest".equalsIgnoreCase(sort) || "highest_rating".equalsIgnoreCase(sort)) {
            sortObj = Sort.by(Sort.Direction.DESC, "rating").and(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else if ("lowest".equalsIgnoreCase(sort) || "lowest_rating".equalsIgnoreCase(sort)) {
            sortObj = Sort.by(Sort.Direction.ASC, "rating").and(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else {
            sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
        }

        Pageable pageable = PageRequest.of(page, Math.min(size, 50), sortObj);
        Short ratingShort = (rating != null && rating >= 1 && rating <= 5) ? rating.shortValue() : null;
        Page<Review> reviewPage = reviewRepository.findApprovedReviewsPaged(productId, ratingShort, pageable);

        return reviewPage.map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryDto getReviewSummary(Long productId) {
        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        Long totalReviews = reviewRepository.countByProductProductIdAndStatus(productId, ReviewStatus.APPROVED);

        double roundedAvg = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0;

        Map<Integer, Long> breakdown = new HashMap<>();
        for (int star = 1; star <= 5; star++) {
            breakdown.put(star, 0L);
        }

        List<Object[]> starCounts = reviewRepository.countRatingsByStar(productId);
        for (Object[] row : starCounts) {
            if (row[0] != null && row[1] != null) {
                Integer star = ((Number) row[0]).intValue();
                Long count = ((Number) row[1]).longValue();
                breakdown.put(star, count);
            }
        }

        return ReviewSummaryDto.builder()
                .averageRating(roundedAvg)
                .totalReviews(totalReviews != null ? totalReviews : 0L)
                .ratingBreakdown(breakdown)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewEligibilityDto checkEligibility(Long productId, String customerEmail) {
        if (customerEmail == null || customerEmail.isBlank() || "anonymousUser".equalsIgnoreCase(customerEmail)) {
            return ReviewEligibilityDto.builder()
                    .status("NOT_LOGGED_IN")
                    .message("Vui lòng đăng nhập để đánh giá sản phẩm.")
                    .eligibleOrderItemIds(Collections.emptyList())
                    .build();
        }

        if (staffRepository.findByEmailIgnoreCase(customerEmail).isPresent()) {
            return ReviewEligibilityDto.builder()
                    .status("STAFF_ACCOUNT")
                    .message("Tài khoản quản trị không thể đánh giá sản phẩm.")
                    .eligibleOrderItemIds(Collections.emptyList())
                    .build();
        }

        Optional<Customer> customerOpt = customerRepository.findByEmailIgnoreCase(customerEmail);
        if (customerOpt.isEmpty()) {
            return ReviewEligibilityDto.builder()
                    .status("NOT_LOGGED_IN")
                    .message("Vui lòng đăng nhập để đánh giá sản phẩm.")
                    .eligibleOrderItemIds(Collections.emptyList())
                    .build();
        }

        Customer customer = customerOpt.get();

        Optional<Review> existingReviewOpt = reviewRepository.findByProductProductIdAndCustomerCustomerId(productId, customer.getCustomerId());
        if (existingReviewOpt.isPresent()) {
            Review existingReview = existingReviewOpt.get();
            return ReviewEligibilityDto.builder()
                    .status("ALREADY_REVIEWED")
                    .message("Bạn đã đánh giá sản phẩm này rồi.")
                    .review(toDto(existingReview, false, customer.getCustomerId()))
                    .eligibleOrderItemIds(Collections.emptyList())
                    .build();
        }

        List<Long> itemIds = reviewRepository.findUnreviewedCompletedOrderItemIds(customer.getCustomerId(), productId);
        if (itemIds.isEmpty()) {
            return ReviewEligibilityDto.builder()
                    .status("NOT_PURCHASED")
                    .message("Bạn chỉ có thể đánh giá sau khi đã mua sản phẩm và đơn hàng hoàn thành.")
                    .eligibleOrderItemIds(Collections.emptyList())
                    .build();
        }

        return ReviewEligibilityDto.builder()
                .status("ELIGIBLE")
                .message("Bạn đủ điều kiện để đánh giá sản phẩm.")
                .eligibleOrderItemIds(itemIds)
                .build();
    }

    @Override
    @Transactional
    public ReviewDto createReview(Long productId, CreateReviewRequest request, String customerEmail) {
        // 0. Rate limiting check (5 req/min/user)
        if (!rateLimiter.isAllowed(customerEmail)) {
            throw new RateLimitExceededException("Bạn thao tác quá nhanh. Vui lòng thử lại sau 1 phút.");
        }

        Customer customer = getCustomerByEmailOrThrow(customerEmail);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm ID: " + productId));

        // 1. Chặn trùng đánh giá cho cùng sản phẩm
        if (reviewRepository.existsByProductProductIdAndCustomerCustomerId(productId, customer.getCustomerId())) {
            throw new ReviewAlreadyExistsException("Bạn đã đánh giá sản phẩm này rồi.");
        }

        // 2. Xác thực quyền đánh giá dựa trên đơn hàng & order_item
        OrderItem orderItem;
        if (request.getOrderItemId() != null) {
            orderItem = orderItemRepository.findById(request.getOrderItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy món hàng ID: " + request.getOrderItemId()));

            // IDOR Protection: Kiểm tra món hàng thuộc đúng đơn của khách
            if (orderItem.getOrder() == null || orderItem.getOrder().getCustomer() == null
                    || !orderItem.getOrder().getCustomer().getCustomerId().equals(customer.getCustomerId())) {
                throw new ReviewNotAllowedException("Bạn không có quyền đánh giá món hàng của đơn hàng khác.");
            }

            // Kiểm tra trạng thái đơn phải là completed
            if (orderItem.getOrder().getStatus() != OrderStatus.completed) {
                throw new ReviewNotAllowedException("Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã hoàn thành và nhận hàng thành công.");
            }

            // Kiểm tra món hàng thuộc đúng sản phẩm
            Long itemProductId = (orderItem.getVariant() != null && orderItem.getVariant().getProduct() != null)
                    ? orderItem.getVariant().getProduct().getProductId() : null;
            if (!productId.equals(itemProductId)) {
                throw new IllegalArgumentException("Món hàng không thuộc sản phẩm đang đánh giá.");
            }

            // Kiểm tra món hàng đã từng được đánh giá chưa
            if (reviewRepository.existsByOrderItemOrderItemId(orderItem.getOrderItemId())) {
                throw new ReviewAlreadyExistsException("Món hàng này đã được đánh giá rồi.");
            }
        } else {
            // Client không gửi orderItemId -> Backend tự resolve món hàng completed hợp lệ gần nhất
            List<Long> eligibleItemIds = reviewRepository.findUnreviewedCompletedOrderItemIds(customer.getCustomerId(), productId);
            if (eligibleItemIds.isEmpty()) {
                throw new ReviewNotAllowedException("Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công.");
            }
            orderItem = orderItemRepository.findById(eligibleItemIds.get(0))
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy món hàng ID: " + eligibleItemIds.get(0)));
        }

        // 3. Validate dữ liệu đánh giá
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Số sao đánh giá phải từ 1 đến 5 sao.");
        }

        if (request.getComment() == null || request.getComment().trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung nhận xét không được để trống.");
        }

        Review review = Review.builder()
                .product(product)
                .customer(customer)
                .orderItem(orderItem)
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .isVerifiedPurchase(true)
                .status(ReviewStatus.APPROVED)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        Review saved = reviewRepository.save(review);
        return toDto(saved, false, customer.getCustomerId());
    }

    @Override
    @Transactional
    public ReviewDto updateReview(Long reviewId, UpdateReviewRequest request, String customerEmail) {
        Customer customer = getCustomerByEmailOrThrow(customerEmail);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá ID: " + reviewId));

        if (!review.getCustomer().getCustomerId().equals(customer.getCustomerId())) {
            throw new ReviewNotAllowedException("Bạn không có quyền chỉnh sửa đánh giá của người khác.");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (review.getCreatedAt() != null && review.getCreatedAt().plusDays(7).isBefore(now)) {
            throw new ReviewNotAllowedException("Đã quá thời hạn 7 ngày để chỉnh sửa đánh giá.");
        }

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Số sao đánh giá phải từ 1 đến 5 sao.");
        }
        if (request.getComment() == null || request.getComment().trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung nhận xét không được để trống.");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        review.setStatus(ReviewStatus.APPROVED);
        review.setUpdatedAt(now);

        Review updated = reviewRepository.save(review);
        return toDto(updated, false, customer.getCustomerId());
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId, String customerEmail) {
        Customer customer = getCustomerByEmailOrThrow(customerEmail);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá ID: " + reviewId));

        if (!review.getCustomer().getCustomerId().equals(customer.getCustomerId())) {
            throw new ReviewNotAllowedException("Bạn không có quyền xóa đánh giá của người khác.");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (review.getCreatedAt() != null && review.getCreatedAt().plusDays(7).isBefore(now)) {
            throw new ReviewNotAllowedException("Đã quá thời hạn 7 ngày để xóa đánh giá.");
        }

        reviewRepository.delete(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDto> getAllReviewsAdmin() {
        return reviewRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(r -> toDto(r, false, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReviewDto updateReviewStatus(Long reviewId, String status) {
        return updateReviewStatus(reviewId, status, null);
    }

    @Override
    @Transactional
    public ReviewDto updateReviewStatus(Long reviewId, String status, String staffEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá ID: " + reviewId));

        ReviewStatus oldStatus = review.getStatus();
        ReviewStatus reviewStatus;
        try {
            reviewStatus = ReviewStatus.valueOf(status.trim().toUpperCase());
            review.setStatus(reviewStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái đánh giá không hợp lệ (Phải là PENDING, APPROVED, REJECTED hoặc HIDDEN).");
        }

        review.setUpdatedAt(OffsetDateTime.now());
        Review updated = reviewRepository.save(review);

        Staff staff = staffEmail != null ? staffRepository.findByEmailIgnoreCase(staffEmail).orElse(null) : null;
        logAudit(staff, "UPDATE", String.valueOf(reviewId),
                Map.of("status", oldStatus != null ? oldStatus.name() : ""),
                Map.of("status", reviewStatus.name()));

        return toDto(updated, false, null);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        deleteReviewAdmin(reviewId, null);
    }

    @Override
    @Transactional
    public void deleteReviewAdmin(Long reviewId, String staffEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá ID: " + reviewId));

        Staff staff = staffEmail != null ? staffRepository.findByEmailIgnoreCase(staffEmail).orElse(null) : null;
        logAudit(staff, "DELETE", String.valueOf(reviewId),
                Map.of("reviewId", review.getReviewId(), "productId", review.getProduct() != null ? review.getProduct().getProductId() : 0, "comment", review.getComment() != null ? review.getComment() : ""),
                null);

        reviewRepository.delete(review);
    }

    @Override
    @Transactional
    public ReviewDto addOrUpdateReply(Long reviewId, String comment, String staffEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá ID: " + reviewId));

        Staff staff = staffEmail != null ? staffRepository.findByEmailIgnoreCase(staffEmail).orElse(null) : null;

        Optional<ReviewReply> replyOpt = reviewReplyRepository.findByReviewReviewId(reviewId);
        ReviewReply reply;
        if (replyOpt.isPresent()) {
            reply = replyOpt.get();
            reply.setComment(comment.trim());
            reply.setStaff(staff);
            reply.setUpdatedAt(OffsetDateTime.now());
        } else {
            reply = ReviewReply.builder()
                    .review(review)
                    .staff(staff)
                    .comment(comment.trim())
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();
        }
        reviewReplyRepository.save(reply);

        logAudit(staff, "UPDATE", String.valueOf(reviewId), null, Map.of("reply", comment.trim()));

        return toDto(review, false, null);
    }

    @Override
    @Transactional
    public void deleteReply(Long reviewId, String staffEmail) {
        reviewReplyRepository.findByReviewReviewId(reviewId).ifPresent(reply -> {
            reviewReplyRepository.delete(reply);
            Staff staff = staffEmail != null ? staffRepository.findByEmailIgnoreCase(staffEmail).orElse(null) : null;
            logAudit(staff, "UPDATE", String.valueOf(reviewId), Map.of("replyDeleted", true), null);
        });
    }

    @Override
    @Transactional
    public Map<String, Object> voteHelpful(Long reviewId, String customerEmail) {
        Customer customer = getCustomerByEmailOrThrow(customerEmail);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá ID: " + reviewId));

        if (review.getCustomer() != null && review.getCustomer().getCustomerId().equals(customer.getCustomerId())) {
            throw new ReviewNotAllowedException("Bạn không thể bình chọn hữu ích cho đánh giá của chính mình.");
        }

        if (helpfulVoteRepository.existsByReviewReviewIdAndCustomerCustomerId(reviewId, customer.getCustomerId())) {
            throw new ReviewAlreadyExistsException("Bạn đã bình chọn hữu ích cho đánh giá này rồi.");
        }

        ReviewHelpfulVote vote = ReviewHelpfulVote.builder()
                .review(review)
                .customer(customer)
                .createdAt(OffsetDateTime.now())
                .build();
        helpfulVoteRepository.save(vote);

        long count = helpfulVoteRepository.countByReviewReviewId(reviewId);

        Map<String, Object> response = new HashMap<>();
        response.put("helpfulCount", count);
        response.put("isHelpful", true);
        response.put("message", "Cảm ơn bạn đã bình chọn hữu ích!");
        return response;
    }
}
