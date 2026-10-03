package com.store.dto.flashsale;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFlashSaleSlotRequest {

    private String label;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private OffsetDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private OffsetDateTime endTime;

    @Builder.Default
    private Boolean isActive = true;
}
