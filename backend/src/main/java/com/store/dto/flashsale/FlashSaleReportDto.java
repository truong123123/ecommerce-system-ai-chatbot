package com.store.dto.flashsale;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleReportDto {

    private Long campaignId;
    private String campaignTitle;
    private Integer totalSlots;
    private Integer totalProducts;
    private Integer totalQuota;
    private Integer totalSold;
    private Double sellThroughRate; // Tỷ lệ bán %
    private BigDecimal totalRevenue; // Doanh thu
    private Integer cancelledReservations; // Số đơn hủy / hoàn suất

    @Builder.Default
    private List<SlotReportItem> slotReports = new ArrayList<>();

    @Builder.Default
    private List<ProductReportItem> productReports = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlotReportItem {
        private Long slotId;
        private String label;
        private String timeRange;
        private String status;
        private Integer productCount;
        private Integer quota;
        private Integer sold;
        private Double sellThroughRate;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductReportItem {
        private Long itemId;
        private Long productId;
        private String productName;
        private String sku;
        private String imageUrl;
        private BigDecimal originalPrice;
        private BigDecimal salePrice;
        private Integer quota;
        private Integer sold;
        private Double sellThroughRate;
        private BigDecimal revenue;
        private Integer availableInventory;
    }
}
