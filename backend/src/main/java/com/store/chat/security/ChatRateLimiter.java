package com.store.chat.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.store.config.LlmProperties;
import com.store.entity.Customer;
import com.store.exception.RateLimitExceededException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class ChatRateLimiter {

    private final StringRedisTemplate redisTemplate;
    private final LlmProperties llmProperties;

    private final Cache<String, Integer> localCacheMinute;
    private final Cache<String, Integer> localCacheDay;
    private final Cache<String, Integer> localCacheSystem;

    public ChatRateLimiter(
            @Autowired(required = false) StringRedisTemplate redisTemplate,
            LlmProperties llmProperties
    ) {
        this.redisTemplate = redisTemplate;
        this.llmProperties = llmProperties;

        this.localCacheMinute = Caffeine.newBuilder()
                .expireAfterWrite(65, TimeUnit.SECONDS)
                .maximumSize(50_000)
                .build();

        this.localCacheDay = Caffeine.newBuilder()
                .expireAfterWrite(25, TimeUnit.HOURS)
                .maximumSize(50_000)
                .build();

        this.localCacheSystem = Caffeine.newBuilder()
                .expireAfterWrite(25, TimeUnit.HOURS)
                .maximumSize(100)
                .build();
    }

    public void checkAndIncrement(Customer customer, String clientIp) {
        String userIdentifier = (customer != null && customer.getCustomerId() != null)
                ? "cust:" + customer.getCustomerId()
                : "ip:" + hashIp(clientIp);

        String today = LocalDate.now().toString();
        long currentMinuteEpoch = System.currentTimeMillis() / 60000;

        String minuteKey = "chat_limit:min:" + userIdentifier + ":" + currentMinuteEpoch;
        String dayKey = "chat_limit:day:" + userIdentifier + ":" + today;
        String systemKey = "chat_limit:sys:" + today;

        int limitPerMinute = llmProperties.getRateLimit().getPerMinute();
        int limitPerDay = llmProperties.getRateLimit().getPerDay();
        int systemDailyLimit = llmProperties.getRateLimit().getSystemDailyLimit();

        if (redisTemplate != null) {
            try {
                // 1. Kiểm tra giới hạn toàn hệ thống
                String sysVal = redisTemplate.opsForValue().get(systemKey);
                if (sysVal != null && Integer.parseInt(sysVal) >= systemDailyLimit) {
                    throw new RateLimitExceededException("Hệ thống trợ lý AI đã đạt giới hạn phục vụ trong ngày. Vui lòng thử lại sau.");
                }

                // 2. Kiểm tra giới hạn ngày của user
                String dayVal = redisTemplate.opsForValue().get(dayKey);
                if (dayVal != null && Integer.parseInt(dayVal) >= limitPerDay) {
                    throw new RateLimitExceededException("Bạn đã đạt giới hạn số tin nhắn AI trong ngày (tối đa " + limitPerDay + " tin). Vui lòng quay lại vào ngày mai.");
                }

                // 3. Kiểm tra giới hạn phút của user
                String minVal = redisTemplate.opsForValue().get(minuteKey);
                if (minVal != null && Integer.parseInt(minVal) >= limitPerMinute) {
                    throw new RateLimitExceededException("Bạn đang gửi tin nhắn quá nhanh. Vui lòng chờ ít phút để tiếp tục trò chuyện.");
                }

                // Tăng bộ đếm
                Long newMin = redisTemplate.opsForValue().increment(minuteKey);
                if (newMin != null && newMin == 1) {
                    redisTemplate.expire(minuteKey, 65, TimeUnit.SECONDS);
                }

                Long newDay = redisTemplate.opsForValue().increment(dayKey);
                if (newDay != null && newDay == 1) {
                    redisTemplate.expire(dayKey, 25, TimeUnit.HOURS);
                }

                Long newSys = redisTemplate.opsForValue().increment(systemKey);
                if (newSys != null && newSys == 1) {
                    redisTemplate.expire(systemKey, 25, TimeUnit.HOURS);
                }

                return;
            } catch (RateLimitExceededException e) {
                throw e;
            } catch (Exception e) {
                log.warn("Redis không khả dụng khi kiểm tra rate limit ({}), fallback sang Caffeine", e.getMessage());
            }
        }

        // Fallback Caffeine
        Integer sysCount = localCacheSystem.getIfPresent(systemKey);
        if (sysCount != null && sysCount >= systemDailyLimit) {
            throw new RateLimitExceededException("Hệ thống trợ lý AI đã đạt giới hạn phục vụ trong ngày. Vui lòng thử lại sau.");
        }

        Integer dayCount = localCacheDay.getIfPresent(dayKey);
        if (dayCount != null && dayCount >= limitPerDay) {
            throw new RateLimitExceededException("Bạn đã đạt giới hạn số tin nhắn AI trong ngày (tối đa " + limitPerDay + " tin). Vui lòng quay lại vào ngày mai.");
        }

        Integer minCount = localCacheMinute.getIfPresent(minuteKey);
        if (minCount != null && minCount >= limitPerMinute) {
            throw new RateLimitExceededException("Bạn đang gửi tin nhắn quá nhanh. Vui lòng chờ ít phút để tiếp tục trò chuyện.");
        }

        localCacheMinute.put(minuteKey, minCount == null ? 1 : minCount + 1);
        localCacheDay.put(dayKey, dayCount == null ? 1 : dayCount + 1);
        localCacheSystem.put(systemKey, sysCount == null ? 1 : sysCount + 1);
    }

    public static String hashIp(String ip) {
        if (ip == null || ip.isBlank()) {
            return "unknown";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(ip.trim().getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "hashed_" + Math.abs(ip.hashCode());
        }
    }
}
