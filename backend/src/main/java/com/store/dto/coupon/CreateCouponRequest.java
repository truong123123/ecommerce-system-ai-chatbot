package com.store.dto.coupon;

import com.store.entity.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCouponRequest {
    @NotBlank(message = "Mã giảm giá không được để trống")
    private String code;

    @NotNull(message = "Loại giảm giá không được để trống")
    private DiscountType type;

    @NotNull(message = "Giá trị giảm không được để trống")
    private BigDecimal value;

    private BigDecimal minOrderValue;
    private BigDecimal maxDiscount;
    private Integer usageLimit;
    private Integer maxUsagePerUser;
    private Boolean isActive;
    private String title;
    private String description;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private OffsetDateTime startsAt;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private OffsetDateTime endsAt;

    private Integer categoryId;
    private Integer brandId;
    private Long productId;
}
