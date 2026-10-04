package com.store.dto.flashsale;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleTimeSlotDto {
    private Long id;
    private Long campaignId;
    private String label;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private Boolean isActive;
    private String status; // upcoming, live, ended
    private Boolean isOvernight;
    private Integer productCount;
    private Integer totalQuota;
    private Integer totalSold;
    private BigDecimal revenue;
    private Long version;

    @Builder.Default
    private List<FlashSaleItemDto> products = new ArrayList<>();

    public OffsetDateTime getStart() {
        return startTime;
    }

    public OffsetDateTime getEnd() {
        return endTime;
    }
}
