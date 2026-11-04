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
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class ChatRateLimiter {

    private static final String REDIS_CIRCUIT_PREFIX = "chat_circuit_breaker:cooldown:";

    private final StringRedisTemplate redisTemplate;
    private final LlmProperties llmProperties;

    // Cache local khi không có Redis
    private final Cache<String, Integer> localCacheUserMinute;
    private final Cache<String, Integer> localCacheUserDay;
    private final Cache<String, Integer> localCacheSystemMinute;
    private final Cache<String, Integer> localCacheSystemDay;

    // In-memory fallback cho Circuit Breaker theo từng model
    private final ConcurrentHashMap<String, Long> localCircuitBreakerUntilMs = new ConcurrentHashMap<>();

    public ChatRateLimiter(
            @Autowired(required = false) StringRedisTemplate redisTemplate,
            LlmProperties llmProperties
    ) {
        this.redisTemplate = redisTemplate;
        this.llmProperties = llmProperties;

        this.localCacheUserMinute = Caffeine.newBuilder()
                .expireAfterWrite(65, TimeUnit.SECONDS)
                .maximumSize(50_000)
                .build();

        this.localCacheUserDay = Caffeine.newBuilder()
                .expireAfterWrite(25, TimeUnit.HOURS)
                .maximumSize(50_000)
                .build();

        this.localCacheSystemMinute = Caffeine.newBuilder()
                .expireAfterWrite(65, TimeUnit.SECONDS)
                .maximumSize(1_000)
                .build();

        this.localCacheSystemDay = Caffeine.newBuilder()
                .expireAfterWrite(25, TimeUnit.HOURS)
                .maximumSize(1_000)
                .build();
    }

    private String sanitizeModel(String model) {
        if (model != null && !model.isBlank()) {
            return model.trim();
        }
        String defaultModel = llmProperties.getModel();
        if (defaultModel != null && !defaultModel.isBlank()) {
            return defaultModel.trim();
        }
        return "default";
    }

    /**
     * Kiểm tra và tăng lượt chat request theo từng người dùng (Customer ID hoặc Hash IP).
     * Áp dụng: perKeyMinuteLimit (5 req/phút), perKeyDailyLimit (30 req/ngày).
     */
    public void checkAndIncrement(Customer customer, String clientIp) {
        String userIdentifier = (customer != null && customer.getCustomerId() != null)
                ? "cust:" + customer.getCustomerId()
                : "ip:" + hashIp(clientIp);

        String today = LocalDate.now(ZoneOffset.UTC).toString();
        long currentMinuteEpoch = System.currentTimeMillis() / 60000;

        String minuteKey = "chat_limit:min:" + userIdentifier + ":" + currentMinuteEpoch;
        String dayKey = "chat_limit:day:" + userIdentifier + ":" + today;

        int limitPerMinute = llmProperties.getRateLimit().getPerKeyMinuteLimit();
        int limitPerDay = llmProperties.getRateLimit().getPerKeyDailyLimit();

        if (redisTemplate != null) {
            try {
                // 1. Kiểm tra giới hạn ngày của user
                String dayVal = redisTemplate.opsForValue().get(dayKey);
                if (dayVal != null && Integer.parseInt(dayVal) >= limitPerDay) {
                    throw new RateLimitExceededException("Bạn đã đạt giới hạn số tin nhắn AI trong ngày (tối đa " + limitPerDay + " tin). Vui lòng quay lại vào ngày mai.");
                }

                // 2. Kiểm tra giới hạn phút của user
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
                return;
            } catch (RateLimitExceededException rle) {
                throw rle;
            } catch (Exception e) {
                log.warn("Redis không khả dụng khi kiểm tra rate limit user ({}), fallback sang Caffeine", e.getMessage());
            }
        }

        // Fallback Caffeine
        Integer userDayCount = localCacheUserDay.getIfPresent(dayKey);
        if (userDayCount != null && userDayCount >= limitPerDay) {
            throw new RateLimitExceededException("Bạn đã đạt giới hạn số tin nhắn AI trong ngày (tối đa " + limitPerDay + " tin). Vui lòng quay lại vào ngày mai.");
        }

        Integer userMinCount = localCacheUserMinute.getIfPresent(minuteKey);
        if (userMinCount != null && userMinCount >= limitPerMinute) {
            throw new RateLimitExceededException("Bạn đang gửi tin nhắn quá nhanh. Vui lòng chờ ít phút để tiếp tục trò chuyện.");
        }

        localCacheUserMinute.put(minuteKey, (userMinCount == null ? 0 : userMinCount) + 1);
        localCacheUserDay.put(dayKey, (userDayCount == null ? 0 : userDayCount) + 1);
    }

    /**
     * Kiểm tra và tăng hạn mức hệ thống dựa trên SỐ LẦN GỌI LLM THỰC TẾ theo TỪNG MODEL.
     * Key gồm tên model + ngày UTC (yyyy-MM-dd).
     * Áp dụng: systemMinuteLimit (8 calls/phút), systemDailyLimit (200 calls/ngày).
     * @return true nếu còn quota, false nếu đã vượt giới hạn
     */
    public boolean checkAndIncrementSystemLlmCall(String model) {
        String sanitizedModel = sanitizeModel(model);
        String utcToday = LocalDate.now(ZoneOffset.UTC).toString();
        long currentMinuteEpoch = System.currentTimeMillis() / 60000;

        String sysMinKey = "chat_limit:sys:min:" + sanitizedModel + ":" + currentMinuteEpoch;
        String sysDayKey = "chat_limit:sys:day:" + sanitizedModel + ":" + utcToday;

        int systemMinuteLimit = llmProperties.getRateLimit().getSystemMinuteLimit();
        int systemDailyLimit = llmProperties.getRateLimit().getSystemDailyLimit();

        if (redisTemplate != null) {
            try {
                String dayVal = redisTemplate.opsForValue().get(sysDayKey);
                if (dayVal != null && Integer.parseInt(dayVal) >= systemDailyLimit) {
                    log.warn("Hệ thống đã đạt giới hạn LLM calls trong ngày cho model '{}': {}/{}", sanitizedModel, dayVal, systemDailyLimit);
                    return false;
                }

                String minVal = redisTemplate.opsForValue().get(sysMinKey);
                if (minVal != null && Integer.parseInt(minVal) >= systemMinuteLimit) {
                    log.warn("Hệ thống đã đạt giới hạn LLM calls trong phút cho model '{}': {}/{}", sanitizedModel, minVal, systemMinuteLimit);
                    return false;
                }

                Long newMin = redisTemplate.opsForValue().increment(sysMinKey);
                if (newMin != null && newMin == 1) {
                    redisTemplate.expire(sysMinKey, 65, TimeUnit.SECONDS);
                }

                Long newDay = redisTemplate.opsForValue().increment(sysDayKey);
                if (newDay != null && newDay == 1) {
                    redisTemplate.expire(sysDayKey, 25, TimeUnit.HOURS);
                }
                return true;
            } catch (Exception e) {
                log.warn("Redis không khả dụng khi đếm LLM call cho model '{}' ({}), fallback sang Caffeine", sanitizedModel, e.getMessage());
            }
        }

        // Fallback Caffeine
        Integer currentDayCalls = localCacheSystemDay.getIfPresent(sysDayKey);
        if (currentDayCalls != null && currentDayCalls >= systemDailyLimit) {
            log.warn("Hệ thống (Caffeine) đã đạt giới hạn LLM calls trong ngày cho model '{}': {}/{}", sanitizedModel, currentDayCalls, systemDailyLimit);
            return false;
        }

        Integer currentMinCalls = localCacheSystemMinute.getIfPresent(sysMinKey);
        if (currentMinCalls != null && currentMinCalls >= systemMinuteLimit) {
            log.warn("Hệ thống (Caffeine) đã đạt giới hạn LLM calls trong phút cho model '{}': {}/{}", sanitizedModel, currentMinCalls, systemMinuteLimit);
            return false;
        }

        localCacheSystemMinute.put(sysMinKey, (currentMinCalls == null ? 0 : currentMinCalls) + 1);
        localCacheSystemDay.put(sysDayKey, (currentDayCalls == null ? 0 : currentDayCalls) + 1);
        return true;
    }

    public boolean checkAndIncrementSystemLlmCall() {
        return checkAndIncrementSystemLlmCall(llmProperties.getModel());
    }

    /**
     * Kích hoạt Circuit Breaker khi LLM trả lỗi HTTP 429 (Resource Exhausted).
     * Tạm dừng gọi model trong cooldownSeconds (mặc định 300 giây).
     * Nếu lỗi thuộc loại hết hạn mức ngày (dailyQuota = true), cooldown kéo dài đến hết ngày UTC.
     */
    public void recordLlm429(String model, boolean isDailyQuota) {
        String sanitizedModel = sanitizeModel(model);
        long cooldownSeconds = llmProperties.getCooldownSeconds();
        if (cooldownSeconds <= 0) {
            cooldownSeconds = 300;
        }

        if (isDailyQuota) {
            OffsetDateTime nowUtc = OffsetDateTime.now(ZoneOffset.UTC);
            OffsetDateTime midnightUtc = nowUtc.toLocalDate().plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);
            long secondsUntilMidnightUtc = Duration.between(nowUtc, midnightUtc).getSeconds();
            if (secondsUntilMidnightUtc > 0) {
                cooldownSeconds = secondsUntilMidnightUtc;
            }
        }

        this.localCircuitBreakerUntilMs.put(sanitizedModel, System.currentTimeMillis() + (cooldownSeconds * 1000L));

        String circuitKey = REDIS_CIRCUIT_PREFIX + sanitizedModel;
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(circuitKey, "open", cooldownSeconds, TimeUnit.SECONDS);
            } catch (Exception e) {
                log.warn("Không thể lưu trạng thái circuit breaker vào Redis cho model {}: {}", sanitizedModel, e.getMessage());
            }
        }

        log.warn("Circuit Breaker đã mở cho model '{}': Tạm dừng gọi trong {} giây (dailyQuota={}) để bảo vệ quota.",
                sanitizedModel, cooldownSeconds, isDailyQuota);
    }

    public void recordLlm429(String model) {
        recordLlm429(model, false);
    }

    public void recordLlm429() {
        recordLlm429(llmProperties.getModel(), false);
    }

    /**
     * Kiểm tra trạng thái Circuit Breaker theo model.
     * @return true nếu model đang trong thời gian cooldown (không được gọi LLM)
     */
    public boolean isCircuitOpen(String model) {
        String sanitizedModel = sanitizeModel(model);
        String circuitKey = REDIS_CIRCUIT_PREFIX + sanitizedModel;

        if (redisTemplate != null) {
            try {
                String val = redisTemplate.opsForValue().get(circuitKey);
                if (val != null) {
                    return true;
                }
            } catch (Exception ignored) {
            }
        }
        Long untilMs = localCircuitBreakerUntilMs.get(sanitizedModel);
        return untilMs != null && System.currentTimeMillis() < untilMs;
    }

    public boolean isCircuitOpen() {
        return isCircuitOpen(llmProperties.getModel());
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
            return hexString.substring(0, 16);
        } catch (Exception e) {
            return String.valueOf(ip.hashCode());
        }
    }
}
