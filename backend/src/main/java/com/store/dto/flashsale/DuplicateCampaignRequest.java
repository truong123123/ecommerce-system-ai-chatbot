package com.store.dto.flashsale;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DuplicateCampaignRequest {

    private String newTitle;
    private Integer shiftDays; // Số ngày muốn tịnh tiến (dời lịch) cho tất cả slot
    private Boolean copyProducts;
}
