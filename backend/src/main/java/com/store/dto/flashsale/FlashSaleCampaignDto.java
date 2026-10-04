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
public class FlashSaleCampaignDto {
    private Long campaignId;
    private String title;
    private String disclaimer;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String status; // UPCOMING, ACTIVE, ENDED, INACTIVE, DRAFT
    private String publishStatus; // DRAFT, ACTIVE, PAUSED
    private String runtimeStatus; // NO_SLOT, UPCOMING, RUNNING, WAITING_NEXT, ENDED
    private String computedStatus; // Tự tính toán dựa trên thời gian thực
    private Boolean isActive;
    private Long version;
    private String updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime serverNow;

    // Khoảng thời gian tự tính từ min(slot.start) và max(slot.end)
    private OffsetDateTime calculatedStartAt;
    private OffsetDateTime calculatedEndAt;

    @Builder.Default
    private List<FlashSaleTimeSlotDto> timeSlots = new ArrayList<>();

    @Builder.Default
    private List<FlashSaleItemDto> products = new ArrayList<>();

    private Integer totalProductsCount;
    private Integer totalSoldQuantity;
    private Integer totalQuota;
    private Integer totalSlotsCount;
    private BigDecimal totalRevenue;

    public Long getId() {
        return campaignId;
    }

    public String getNote() {
        return disclaimer;
    }

    public List<FlashSaleTimeSlotDto> getSlots() {
        return timeSlots;
    }

    public OffsetDateTime getServerTime() {
        return serverNow;
    }
}
