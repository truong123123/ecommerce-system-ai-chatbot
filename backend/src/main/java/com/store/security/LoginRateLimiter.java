package com.store.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * Giới hạn tốc độ đăng nhập thất bại: Tối đa 5 lần sai / 1 phút theo cặp (IP + email).
 * Nếu vượt quá 5 lần sai, các yêu cầu tiếp theo trong khoảng thời gian này sẽ bị chặn với mã HTTP 429.
 *
 * Cơ chế hoạt động:
 * - Nếu Spring Data Redis khả dụng và kết nối thành công, rate limit được quản lý tập trung trên Redis (phân tán).
 * - Nếu Redis không được cấu hình hoặc offline (ví dụ: test suite, local dev không bật Redis), hệ thống tự động
 *   fallback sang bộ nhớ đệm Caffeine với TTL 60 giây (thread-safe, high-performance).
 */
@Component
@Slf4j
public class LoginRateLimiter {

    public static final int MAX_FAILED_ATTEMPTS = 5;
    public static final long WINDOW_SECONDS = 60;

    private final StringRedisTemplate redisTemplate;
    private final Cache<String, Integer> localCache;

    public LoginRateLimiter(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.localCache = Caffeine.newBuilder()
                .expireAfterWrite(WINDOW_SECONDS, TimeUnit.SECONDS)
                .maximumSize(10_000)
                .build();
    }

    private String buildKey(String ip, String email) {
        String cleanIp = (ip == null || ip.isBlank()) ? "unknown" : ip.trim();
        String cleanEmail = (email == null || email.isBlank()) ? "unknown" : email.trim().toLowerCase();
        return "login_fail:" + cleanIp + ":" + cleanEmail;
    }

    /**
     * Kiểm tra xem cặp (IP + email) đã bị chặn do vượt quá số lần thất bại cho phép hay chưa.
     */
    public boolean isBlocked(String ip, String email) {
        String key = buildKey(ip, email);
        if (redisTemplate != null) {
            try {
                String val = redisTemplate.opsForValue().get(key);
                if (val != null) {
                    return Integer.parseInt(val) >= MAX_FAILED_ATTEMPTS;
                }
                return false;
            } catch (Exception e) {
                log.warn("Redis không khả dụng khi kiểm tra rate limit ({}), fallback sang Caffeine", e.getMessage());
            }
        }
        Integer count = localCache.getIfPresent(key);
        return count != null && count >= MAX_FAILED_ATTEMPTS;
    }

    /**
     * Ghi nhận một lần đăng nhập thất bại cho cặp (IP + email).
     */
    public void recordFailedAttempt(String ip, String email) {
        String key = buildKey(ip, email);
        if (redisTemplate != null) {
            try {
                Long count = redisTemplate.opsForValue().increment(key);
                if (count != null && count == 1) {
                    redisTemplate.expire(key, WINDOW_SECONDS, TimeUnit.SECONDS);
                }
                return;
            } catch (Exception e) {
                log.warn("Redis không khả dụng khi ghi nhận rate limit ({}), fallback sang Caffeine", e.getMessage());
            }
        }
        Integer current = localCache.getIfPresent(key);
        int next = (current == null) ? 1 : current + 1;
        localCache.put(key, next);
    }

    /**
     * Xóa bộ đếm thất bại khi đăng nhập thành công.
     */
    public void resetAttempts(String ip, String email) {
        String key = buildKey(ip, email);
        if (redisTemplate != null) {
            try {
                redisTemplate.delete(key);
            } catch (Exception e) {
                log.warn("Redis không khả dụng khi reset rate limit ({}), fallback sang Caffeine", e.getMessage());
            }
        }
        localCache.invalidate(key);
    }
}
