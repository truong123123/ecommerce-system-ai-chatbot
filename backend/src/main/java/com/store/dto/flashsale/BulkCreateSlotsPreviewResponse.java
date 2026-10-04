package com.store.dto.flashsale;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkCreateSlotsPreviewResponse {

    @Builder.Default
    private List<FlashSaleTimeSlotDto> slots = new ArrayList<>();

    private Integer totalSlots;

    @Builder.Default
    private List<String> warnings = new ArrayList<>();

    private Boolean isDryRun;
}
