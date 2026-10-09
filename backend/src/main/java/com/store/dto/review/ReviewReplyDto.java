package com.store.dto.review;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewReplyDto {
    private Long replyId;
    private Long reviewId;
    private String staffName;
    private String comment;
    private OffsetDateTime createdAt;
}
