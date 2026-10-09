package com.store.dto.review;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewSummaryDto {
    private Double averageRating;
    private Long totalReviews;
    private Map<Integer, Long> ratingBreakdown;
}
