package com.store.dto.flashsale;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFlashSaleRequest {

    @NotBlank(message = "Tên chiến dịch Flash Sale không được để trống")
    private String title;

    private String disclaimer;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private OffsetDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private OffsetDateTime endTime;

    @Builder.Default
    private String status = "ACTIVE"; // UPCOMING, ACTIVE, ENDED, INACTIVE

    private List<TimeSlotInput> timeSlots;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSlotInput {
        private String label;
        private OffsetDateTime startTime;
        private OffsetDateTime endTime;
        private Boolean isActive;
    }
}
