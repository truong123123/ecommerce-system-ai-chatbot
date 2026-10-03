package com.store.scheduler;

import com.store.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CheckoutTimeoutScheduler {

    private final CheckoutService checkoutService;

    /**
     * Run every 60 seconds to release expired inventory, flash sale reservations, and vouchers.
     */
    @Scheduled(fixedDelay = 60000)
    public void scheduleCheckoutTimeoutCleanup() {
        try {
            checkoutService.cleanupExpiredOrders();
        } catch (Exception e) {
            log.error("Lỗi khi chạy job dọn dẹp đơn hàng hết hạn", e);
        }
    }
}
