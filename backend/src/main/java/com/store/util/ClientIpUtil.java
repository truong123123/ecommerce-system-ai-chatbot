package com.store.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Utility xác định IP client an toàn.
 * Chỉ tin cậy các tiêu đề X-Forwarded-For hoặc X-Real-IP khi request xuất phát từ Proxy tin cậy.
 * Mặc định, nếu không đến từ proxy tin cậy, remoteAddr sẽ được sử dụng để chống bypass Rate Limiting.
 */
@Component
public class ClientIpUtil {

    private static final Set<String> DEFAULT_TRUSTED_PROXIES = new HashSet<>(Arrays.asList(
            "127.0.0.1", "0:0:0:0:0:0:0:1", "::1"
    ));

    private final Set<String> trustedProxies;
    private final boolean trustForwardHeaders;

    public ClientIpUtil(
            @Value("${app.security.trusted-proxies:127.0.0.1,::1}") String trustedProxiesConfig,
            @Value("${server.forward-headers-strategy:none}") String forwardHeadersStrategy) {
        this.trustedProxies = new HashSet<>(DEFAULT_TRUSTED_PROXIES);
        if (trustedProxiesConfig != null && !trustedProxiesConfig.isBlank()) {
            Arrays.stream(trustedProxiesConfig.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(this.trustedProxies::add);
        }
        this.trustForwardHeaders = !"none".equalsIgnoreCase(forwardHeadersStrategy)
                && !"false".equalsIgnoreCase(forwardHeadersStrategy);
    }

    public String extractClientIp(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }

        String remoteAddr = request.getRemoteAddr();
        if (remoteAddr == null || remoteAddr.isBlank()) {
            remoteAddr = "127.0.0.1";
        }

        // Chỉ tin cậy header X-Forwarded-For khi kết nối đến từ proxy tin cậy
        boolean isTrusted = trustForwardHeaders || trustedProxies.contains(remoteAddr.trim());
        if (!isTrusted) {
            return remoteAddr.trim();
        }

        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp.trim();
        }

        return remoteAddr.trim();
    }
}
