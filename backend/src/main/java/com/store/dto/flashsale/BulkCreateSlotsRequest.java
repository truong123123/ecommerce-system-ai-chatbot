package com.store.dto.flashsale;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkCreateSlotsRequest {

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private String startDate; // yyyy-MM-dd

    @NotNull(message = "Ngày kết thúc không được để trống")
    private String endDate; // yyyy-MM-dd

    @NotNull(message = "Giờ bắt đầu hàng ngày không được để trống")
    private String dailyStartTime; // HH:mm (e.g. 09:00)

    @NotNull(message = "Giờ kết thúc hàng ngày không được để trống")
    private String dailyEndTime; // HH:mm (e.g. 21:00)

    @NotNull(message = "Thời lượng mỗi slot không được để trống")
    private Integer slotDurationMinutes; // e.g. 120 (2h)

    private Integer breakMinutes; // e.g. 0 or 30

    private List<Integer> daysOfWeek; // 1 (Thứ 2) .. 7 (Chủ Nhật)

    private Boolean dryRun; // true = preview only, false = commit create
}
