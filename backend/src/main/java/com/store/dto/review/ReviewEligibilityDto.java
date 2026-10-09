package com.store.dto.review;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewEligibilityDto {

    // Trạng thái: NOT_LOGGED_IN, STAFF_ACCOUNT, NOT_PURCHASED, ALREADY_REVIEWED, ELIGIBLE
    private String status;

    private String message;

    // Review của mình (nếu status == ALREADY_REVIEWED)
    private ReviewDto review;

    // Danh sách orderItemId đủ điều kiện (nếu status == ELIGIBLE)
    private List<Long> eligibleOrderItemIds;

    // Backward compatibility helper flags
    @JsonProperty("canReview")
    public boolean isCanReview() {
        return "ELIGIBLE".equalsIgnoreCase(this.status);
    }

    @JsonProperty("reason")
    public String getReason() {
        return this.status;
    }

    @JsonProperty("myReview")
    public ReviewDto getMyReview() {
        return this.review;
    }

    @JsonProperty("eligibleOrderItemId")
    public Long getEligibleOrderItemId() {
        return (eligibleOrderItemIds != null && !eligibleOrderItemIds.isEmpty()) ? eligibleOrderItemIds.get(0) : null;
    }
}
