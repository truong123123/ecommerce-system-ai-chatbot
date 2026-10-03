package com.store.dto.flashsale;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSlotRequest {

    @NotNull(message = "Thời gian bắt đầu không được trống.")
    @JsonProperty("start_at")
    private OffsetDateTime startAt;

    @NotNull(message = "Thời gian kết thúc không được trống.")
    @JsonProperty("end_at")
    private OffsetDateTime endAt;

    @JsonProperty("is_active")
    @Builder.Default
    private Boolean isActive = true;
}
