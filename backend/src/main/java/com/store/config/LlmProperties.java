package com.store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "llm")
public class LlmProperties {

    private String provider = "gemini";
    private String apiKey = "";
    private String model = "gemini-1.5-flash";
    private int connectTimeoutSeconds = 3;
    private int readTimeoutSeconds = 20;

    private RateLimit rateLimit = new RateLimit();

    @Getter
    @Setter
    public static class RateLimit {
        private int perMinute = 10;
        private int perDay = 100;
        private int systemDailyLimit = 1000;
    }

    public boolean hasApiKey() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }
}
