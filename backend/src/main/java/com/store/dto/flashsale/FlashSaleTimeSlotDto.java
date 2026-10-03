package com.store.dto.flashsale;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

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
    private Integer productCount;
}
