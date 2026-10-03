package com.store.dto.flashsale;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSlotDto {
    private Long id;

    @JsonProperty("start_at")
    private OffsetDateTime startAt;

    @JsonProperty("end_at")
    private OffsetDateTime endAt;

    @JsonProperty("is_active")
    private Boolean isActive;

    private String status; // "upcoming", "live", "ended"

    @JsonProperty("product_count")
    private int productCount;

    @JsonProperty("total_sold")
    private int totalSold;

    @JsonProperty("total_quota")
    private int totalQuota;

    private List<AdminSlotProductDto> products;
}
