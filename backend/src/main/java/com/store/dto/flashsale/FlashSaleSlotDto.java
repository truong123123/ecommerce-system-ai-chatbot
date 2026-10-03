package com.store.dto.flashsale;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSaleSlotDto {
    private Long id;

    @JsonProperty("start_at")
    private OffsetDateTime startAt;

    @JsonProperty("end_at")
    private OffsetDateTime endAt;

    private String status; // "upcoming", "live", "ended"
}
