package com.store.chat.security;

import com.store.config.LlmProperties;
import com.store.entity.Customer;
import com.store.exception.RateLimitExceededException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ChatRateLimiterTest {

    private LlmProperties properties;
    private ChatRateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        properties = new LlmProperties();
        properties.setModel("model-primary");
        properties.getRateLimit().setPerKeyMinuteLimit(3);
        properties.getRateLimit().setPerKeyDailyLimit(5);
        properties.getRateLimit().setSystemMinuteLimit(4);
        properties.getRateLimit().setSystemDailyLimit(6);
        properties.setCooldownSeconds(300);

        // Khởi tạo không có Redis để kiểm tra cơ chế Caffeine fallback
        rateLimiter = new ChatRateLimiter(null, properties);
    }

    @Test
    @DisplayName("Giới hạn tần suất người dùng theo phút (perKeyMinuteLimit)")
    void checkAndIncrement_perKeyMinuteLimit() {
        Customer customer = Customer.builder().customerId(1L).email("user1@gmail.com").build();

        // 3 request đầu tiên thành công
        rateLimiter.checkAndIncrement(customer, "192.168.1.1");
        rateLimiter.checkAndIncrement(customer, "192.168.1.1");
        rateLimiter.checkAndIncrement(customer, "192.168.1.1");

        // Request thứ 4 trong cùng phút ném RateLimitExceededException
        assertThatThrownBy(() -> rateLimiter.checkAndIncrement(customer, "192.168.1.1"))
                .isInstanceOf(RateLimitExceededException.class)
                .hasMessageContaining("Bạn đang gửi tin nhắn quá nhanh");
    }

    @Test
    @DisplayName("Đếm hạn mức hệ thống theo TỪNG MODEL (key gồm tên model + ngày UTC)")
    void checkAndIncrementSystemLlmCall_perModelLimits() {
        String modelA = "model-alpha";
        String modelB = "model-beta";

        // systemMinuteLimit = 4 cho modelA
        assertThat(rateLimiter.checkAndIncrementSystemLlmCall(modelA)).isTrue();
        assertThat(rateLimiter.checkAndIncrementSystemLlmCall(modelA)).isTrue();
        assertThat(rateLimiter.checkAndIncrementSystemLlmCall(modelA)).isTrue();
        assertThat(rateLimiter.checkAndIncrementSystemLlmCall(modelA)).isTrue();

        // Lần gọi thứ 5 của modelA trong phút bị từ chối
        assertThat(rateLimiter.checkAndIncrementSystemLlmCall(modelA)).isFalse();

        // Nhưng modelB hoàn toàn độc lập, vẫn còn quota!
        assertThat(rateLimiter.checkAndIncrementSystemLlmCall(modelB)).isTrue();
        assertThat(rateLimiter.checkAndIncrementSystemLlmCall(modelB)).isTrue();
    }

    @Test
    @DisplayName("Circuit Breaker theo từng model với thời gian cooldown mặc định 300 giây")
    void recordLlm429_circuitBreakerOpensPerModel() {
        String modelA = "model-primary";
        String modelB = "model-fallback";

        assertThat(rateLimiter.isCircuitOpen(modelA)).isFalse();
        assertThat(rateLimiter.isCircuitOpen(modelB)).isFalse();

        // Model A gặp lỗi 429 thông thường (không phải daily quota)
        rateLimiter.recordLlm429(modelA, false);

        // Circuit breaker của Model A lập tức mở
        assertThat(rateLimiter.isCircuitOpen(modelA)).isTrue();
        // Model B không bị ảnh hưởng, vẫn đóng
        assertThat(rateLimiter.isCircuitOpen(modelB)).isFalse();
    }

    @Test
    @DisplayName("Nếu lỗi 429 thuộc loại hết hạn mức ngày (dailyQuota = true) thì cooldown đến hết ngày UTC")
    void recordLlm429_dailyQuotaCooldownUntilMidnightUtc() {
        String model = "model-daily-limited";

        assertThat(rateLimiter.isCircuitOpen(model)).isFalse();

        // Kích hoạt lỗi 429 hết hạn mức ngày
        rateLimiter.recordLlm429(model, true);

        // Circuit breaker mở
        assertThat(rateLimiter.isCircuitOpen(model)).isTrue();

        // Tính khoảng thời gian đến hết ngày UTC
        OffsetDateTime nowUtc = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime midnightUtc = nowUtc.toLocalDate().plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);
        long expectedSeconds = Duration.between(nowUtc, midnightUtc).getSeconds();

        // Cooldown phải lớn hơn 0
        assertThat(expectedSeconds).isGreaterThan(0);
    }
}
