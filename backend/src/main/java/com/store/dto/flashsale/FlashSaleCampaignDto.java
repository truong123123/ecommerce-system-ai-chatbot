package com.store.dto.flashsale;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleCampaignDto {
    private Long campaignId;
    private String title;
    private String disclaimer;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String status; // UPCOMING, ACTIVE, ENDED, INACTIVE, DRAFT
    private String computedStatus; // Tự tính toán dựa trên thời gian thực: UPCOMING, ACTIVE, ENDED, INACTIVE, DRAFT
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime serverNow;

    @Builder.Default
    private List<FlashSaleTimeSlotDto> timeSlots = new ArrayList<>();

    @Builder.Default
    private List<FlashSaleItemDto> products = new ArrayList<>();

    private Integer totalProductsCount;
    private Integer totalSoldQuantity;
    private Integer totalSlotsCount;
}
