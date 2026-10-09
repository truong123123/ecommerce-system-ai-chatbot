package com.store.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReviewRequest {

    @NotNull(message = "Số sao đánh giá không được để trống")
    @Min(value = 1, message = "Đánh giá tối thiểu 1 sao")
    @Max(value = 5, message = "Đánh giá tối đa 5 sao")
    private Short rating;

    @NotBlank(message = "Nội dung nhận xét không được để trống")
    @Size(max = 500, message = "Nội dung nhận xét không được vượt quá 500 ký tự")
    private String comment;

    @NotNull(message = "Chi tiết đơn hàng không được để trống")
    private Long orderItemId;
}
