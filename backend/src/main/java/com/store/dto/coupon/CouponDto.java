package com.store.dto.coupon;

import com.store.entity.DiscountType;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponDto {
    private Integer couponId;
    private String code;
    private DiscountType type;
    private BigDecimal value;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscount;
    private Integer usageLimit;
    private Integer usedCount;
    private Integer reservedCount;
    private Integer maxUsagePerUser;
    private Boolean isActive;
    private String title;
    private String description;
    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;
    private Integer categoryId;
    private Integer brandId;
    private Long productId;
    private boolean isExpired;
}
