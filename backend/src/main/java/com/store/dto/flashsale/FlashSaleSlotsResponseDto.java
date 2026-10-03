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
public class FlashSaleSlotsResponseDto {

    @JsonProperty("server_time")
    private OffsetDateTime serverTime;

    private List<FlashSaleSlotDto> slots;
}
