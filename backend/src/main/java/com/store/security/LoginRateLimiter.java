package com.store.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * Giới hạn tốc độ đăng nhập thất bại đa tầng:
 * 1. Theo cặp (IP + email): Tối đa 5 lần sai / 1 phút (60s) -> 429.
 * 2. Theo tài khoản (email): Tối đa 20 lần sai / 10 phút (600s) -> 429 (chống tấn công phân tán botnet xoay vòng IP).
 *
 * Cơ chế hoạt động:
 * - Hỗ trợ Redis khi có kết nối tập trung, tự động fallback sang Caffeine cache có TTL khi offline/test.
 */
@Component
@Slf4j
public class LoginRateLimiter {

    public static final int MAX_FAILED_ATTEMPTS_IP_EMAIL = 5;
    public static final long WINDOW_SECONDS_IP_EMAIL = 60;

    public static final int MAX_FAILED_ATTEMPTS_EMAIL = 20;
    public static final long WINDOW_SECONDS_EMAIL = 600; // 10 phút

    private final StringRedisTemplate redisTemplate;
    private final Cache<String, Integer> localCacheIpEmail;
    private final Cache<String, Integer> localCacheEmail;

    public LoginRateLimiter(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.localCacheIpEmail = Caffeine.newBuilder()
                .expireAfterWrite(WINDOW_SECONDS_IP_EMAIL, TimeUnit.SECONDS)
                .maximumSize(10_000)
                .build();
        this.localCacheEmail = Caffeine.newBuilder()
                .expireAfterWrite(WINDOW_SECONDS_EMAIL, TimeUnit.SECONDS)
                .maximumSize(10_000)
                .build();
    }

    private String buildIpEmailKey(String ip, String email) {
        String cleanIp = (ip == null || ip.isBlank()) ? "unknown" : ip.trim();
        String cleanEmail = (email == null || email.isBlank()) ? "unknown" : email.trim().toLowerCase();
        return "login_fail_ip:" + cleanIp + ":" + cleanEmail;
    }

    private String buildEmailKey(String email) {
        String cleanEmail = (email == null || email.isBlank()) ? "unknown" : email.trim().toLowerCase();
        return "login_fail_email:" + cleanEmail;
    }

    /**
     * Kiểm tra xem yêu cầu đăng nhập có bị chặn bởi giới hạn (IP+email) hoặc giới hạn (email) hay không.
     */
    public boolean isBlocked(String ip, String email) {
        String ipEmailKey = buildIpEmailKey(ip, email);
        String emailKey = buildEmailKey(email);

        if (redisTemplate != null) {
            try {
                String ipVal = redisTemplate.opsForValue().get(ipEmailKey);
                if (ipVal != null && Integer.parseInt(ipVal) >= MAX_FAILED_ATTEMPTS_IP_EMAIL) {
                    return true;
                }
                String emailVal = redisTemplate.opsForValue().get(emailKey);
                if (emailVal != null && Integer.parseInt(emailVal) >= MAX_FAILED_ATTEMPTS_EMAIL) {
                    return true;
                }
                return false;
            } catch (Exception e) {
                log.warn("Redis không khả dụng khi kiểm tra rate limit ({}), fallback sang Caffeine", e.getMessage());
            }
        }

        Integer ipCount = localCacheIpEmail.getIfPresent(ipEmailKey);
        if (ipCount != null && ipCount >= MAX_FAILED_ATTEMPTS_IP_EMAIL) {
            return true;
        }

        Integer emailCount = localCacheEmail.getIfPresent(emailKey);
        return emailCount != null && emailCount >= MAX_FAILED_ATTEMPTS_EMAIL;
    }

    /**
     * Ghi nhận một lần đăng nhập thất bại cho cả hai bộ đếm (IP+email và email).
     */
    public void recordFailedAttempt(String ip, String email) {
        String ipEmailKey = buildIpEmailKey(ip, email);
        String emailKey = buildEmailKey(email);

        if (redisTemplate != null) {
            try {
                Long ipCount = redisTemplate.opsForValue().increment(ipEmailKey);
                if (ipCount != null && ipCount == 1) {
                    redisTemplate.expire(ipEmailKey, WINDOW_SECONDS_IP_EMAIL, TimeUnit.SECONDS);
                }

                Long emailCount = redisTemplate.opsForValue().increment(emailKey);
                if (emailCount != null && emailCount == 1) {
                    redisTemplate.expire(emailKey, WINDOW_SECONDS_EMAIL, TimeUnit.SECONDS);
                }
                return;
            } catch (Exception e) {
                log.warn("Redis không khả dụng khi ghi nhận rate limit ({}), fallback sang Caffeine", e.getMessage());
            }
        }

        Integer currentIp = localCacheIpEmail.getIfPresent(ipEmailKey);
        localCacheIpEmail.put(ipEmailKey, (currentIp == null) ? 1 : currentIp + 1);

        Integer currentEmail = localCacheEmail.getIfPresent(emailKey);
        localCacheEmail.put(emailKey, (currentEmail == null) ? 1 : currentEmail + 1);
    }

    /**
     * Xóa toàn bộ bộ đếm thất bại khi người dùng đăng nhập thành công.
     */
    public void resetAttempts(String ip, String email) {
        String ipEmailKey = buildIpEmailKey(ip, email);
        String emailKey = buildEmailKey(email);

        if (redisTemplate != null) {
            try {
                redisTemplate.delete(ipEmailKey);
                redisTemplate.delete(emailKey);
            } catch (Exception e) {
                log.warn("Redis không khả dụng khi reset rate limit ({}), fallback sang Caffeine", e.getMessage());
            }
        }

        localCacheIpEmail.invalidate(ipEmailKey);
        localCacheEmail.invalidate(emailKey);
    }
}
