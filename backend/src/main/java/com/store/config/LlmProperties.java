package com.store.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "llm")
public class LlmProperties {

    private String provider = "gemini";
    private String apiKey = "";
    private String model = "";
    private String fallbackModels = "";
    private int connectTimeoutSeconds = 3;
    private int readTimeoutSeconds = 20;
    private int cooldownSeconds = 300;
    private int maxToolRounds = 2;
    private int logRetentionDays = 30;

    private RateLimit rateLimit = new RateLimit();

    public String getProvider() {
        return (provider == null || provider.trim().isEmpty()) ? "gemini" : provider;
    }

    public void setCooldownSeconds(Integer cooldownSeconds) {
        if (cooldownSeconds != null && cooldownSeconds > 0) {
            this.cooldownSeconds = cooldownSeconds;
        }
    }

    public void setMaxToolRounds(Integer maxToolRounds) {
        if (maxToolRounds != null && maxToolRounds > 0) {
            this.maxToolRounds = maxToolRounds;
        }
    }

    public void setLogRetentionDays(Integer logRetentionDays) {
        if (logRetentionDays != null && logRetentionDays > 0) {
            this.logRetentionDays = logRetentionDays;
        }
    }

    public List<String> getFallbackModelList() {
        if (fallbackModels == null || fallbackModels.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(fallbackModels.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    @Getter
    @Setter
    public static class RateLimit {
        private int systemDailyLimit = 200;
        private int systemMinuteLimit = 8;
        private int perKeyDailyLimit = 30;
        private int perKeyMinuteLimit = 5;

        public void setSystemDailyLimit(Integer val) {
            if (val != null && val > 0) this.systemDailyLimit = val;
        }

        public void setSystemMinuteLimit(Integer val) {
            if (val != null && val > 0) this.systemMinuteLimit = val;
        }

        public void setPerKeyDailyLimit(Integer val) {
            if (val != null && val > 0) this.perKeyDailyLimit = val;
        }

        public void setPerKeyMinuteLimit(Integer val) {
            if (val != null && val > 0) this.perKeyMinuteLimit = val;
        }
    }

    public boolean hasApiKey() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    public boolean hasModel() {
        return model != null && !model.trim().isEmpty();
    }

    public boolean isConfigured() {
        return hasApiKey() && hasModel();
    }
}
