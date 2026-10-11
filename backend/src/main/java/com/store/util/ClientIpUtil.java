package com.store.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Utility xác định IP client an toàn.
 * Chỉ tin cậy các tiêu đề X-Forwarded-For hoặc X-Real-IP khi request xuất phát từ Proxy tin cậy.
 * Duyệt X-Forwarded-For từ PHẢI sang TRÁI (right-to-left) để lấy IP thực tế đầu tiên ngoài dải proxy tin cậy,
 * ngăn chặn hoàn toàn tấn công giả mạo (IP spoofing) header X-Forwarded-For.
 */
@Component
public class ClientIpUtil {

    public static final String DEFAULT_TRUSTED_PROXIES = "127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16";

    private final List<IpAddressMatcher> trustedProxyMatchers = new ArrayList<>();
    private final boolean trustForwardHeaders;

    public ClientIpUtil(
            @Value("${app.security.trusted-proxies:" + DEFAULT_TRUSTED_PROXIES + "}") String trustedProxiesConfig,
            @Value("${server.forward-headers-strategy:none}") String forwardHeadersStrategy) {
        String combined = (trustedProxiesConfig != null && !trustedProxiesConfig.isBlank())
                ? trustedProxiesConfig
                : DEFAULT_TRUSTED_PROXIES;

        Arrays.stream(combined.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .forEach(cidrOrIp -> {
                    try {
                        trustedProxyMatchers.add(new IpAddressMatcher(cidrOrIp));
                    } catch (Exception ignored) {
                    }
                });

        this.trustForwardHeaders = !"none".equalsIgnoreCase(forwardHeadersStrategy)
                && !"false".equalsIgnoreCase(forwardHeadersStrategy);
    }

    public boolean isTrustedProxy(String ip) {
        if (ip == null || ip.isBlank()) {
            return false;
        }
        String cleanIp = ip.trim();
        for (IpAddressMatcher matcher : trustedProxyMatchers) {
            try {
                if (matcher.matches(cleanIp)) {
                    return true;
                }
            } catch (Exception ignored) {
            }
        }
        return false;
    }

    public String extractClientIp(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }

        String remoteAddr = request.getRemoteAddr();
        if (remoteAddr == null || remoteAddr.isBlank()) {
            remoteAddr = "127.0.0.1";
        }
        remoteAddr = remoteAddr.trim();

        // Chỉ tin cậy header X-Forwarded-For khi kết nối trực tiếp đến từ proxy tin cậy
        boolean isDirectPeerTrusted = trustForwardHeaders || isTrustedProxy(remoteAddr);
        if (!isDirectPeerTrusted) {
            return remoteAddr;
        }

        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            String[] hops = xForwardedFor.split(",");
            // Duyệt từ PHẢI sang TRÁI (right-to-left) để lấy client IP ngoài cùng trước khi vào chuỗi proxy tin cậy
            for (int i = hops.length - 1; i >= 0; i--) {
                String hopIp = hops[i].trim();
                if (hopIp.isEmpty() || "unknown".equalsIgnoreCase(hopIp)) {
                    continue;
                }
                if (!isTrustedProxy(hopIp)) {
                    return hopIp;
                }
            }
            // Nếu tất cả các hop đều là proxy tin cậy, trả về hop ngoài cùng bên trái
            for (String hop : hops) {
                String hopIp = hop.trim();
                if (!hopIp.isEmpty() && !"unknown".equalsIgnoreCase(hopIp)) {
                    return hopIp;
                }
            }
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp.trim();
        }

        return remoteAddr;
    }
}
