package com.store.dto.review;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDto {
    private Long reviewId;
    private Long productId;
    private String productName;
    private Long customerId;
    private String customerName;
    private Short rating;
    private String comment;
    private Long orderItemId;
    private Boolean isVerifiedPurchase;
    private String status;
    private OffsetDateTime createdAt;
    private ReviewReplyDto reply;
    private Long helpfulCount;
    private Boolean isHelpful;
}
