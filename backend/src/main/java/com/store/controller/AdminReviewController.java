package com.store.controller;

import com.store.dto.review.ReviewDto;
import com.store.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<ReviewDto>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviewsAdmin());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateReviewStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Principal principal
    ) {
        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Trạng thái không được để trống."));
        }
        try {
            String staffEmail = principal != null ? principal.getName() : null;
            ReviewDto updated = reviewService.updateReviewStatus(id, status, staffEmail);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id, Principal principal) {
        try {
            String staffEmail = principal != null ? principal.getName() : null;
            reviewService.deleteReviewAdmin(id, staffEmail);
            return ResponseEntity.ok(Map.of("message", "Xóa đánh giá thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<?> addOrUpdateReply(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Principal principal
    ) {
        String comment = body.get("comment");
        if (comment == null || comment.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nội dung phản hồi không được để trống."));
        }
        String staffEmail = principal != null ? principal.getName() : null;
        ReviewDto updated = reviewService.addOrUpdateReply(id, comment, staffEmail);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/reply")
    public ResponseEntity<?> deleteReply(@PathVariable Long id, Principal principal) {
        String staffEmail = principal != null ? principal.getName() : null;
        reviewService.deleteReply(id, staffEmail);
        return ResponseEntity.ok(Map.of("message", "Xóa phản hồi thành công!"));
    }
}
