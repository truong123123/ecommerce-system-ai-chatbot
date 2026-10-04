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
public class FlashSaleAuditLogDto {

    private Long id;
    private Long campaignId;
    private String action;
    private String details;
    private String performedBy;
    private OffsetDateTime createdAt;
}
