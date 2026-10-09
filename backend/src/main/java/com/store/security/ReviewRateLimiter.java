package com.store.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ReviewRateLimiter {

    @Value("${app.review.rate-limit:5}")
    private int maxRequests = 5;

    private static final long TIME_WINDOW_MILLIS = 60_000L; // 1 phút

    private final ConcurrentHashMap<String, Deque<Long>> requestLog = new ConcurrentHashMap<>();

    public synchronized boolean isAllowed(String key) {
        if (key == null || key.isBlank()) {
            key = "anonymous";
        }
        long now = System.currentTimeMillis();
        Deque<Long> timestamps = requestLog.computeIfAbsent(key, k -> new ArrayDeque<>());

        while (!timestamps.isEmpty() && now - timestamps.peekFirst() > TIME_WINDOW_MILLIS) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= maxRequests) {
            return false;
        }

        timestamps.addLast(now);
        return true;
    }

    public void setMaxRequests(int maxRequests) {
        this.maxRequests = maxRequests;
    }

    public void reset() {
        requestLog.clear();
    }
}
