package com.store.util;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

class ClientIpUtilTest {

    private final ClientIpUtil clientIpUtil = new ClientIpUtil(
            "127.0.0.1,::1,172.16.0.0/12,10.0.0.0/8",
            "none"
    );

    @Test
    @DisplayName("Peer trực tiếp không thuộc proxy tin cậy: Bỏ qua hoàn toàn XFF và trả về remoteAddr")
    void shouldReturnRemoteAddrWhenDirectPeerIsUntrusted() {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("203.0.113.10");
        when(request.getHeader("X-Forwarded-For")).thenReturn("1.2.3.4, 5.6.7.8");

        String ip = clientIpUtil.extractClientIp(request);
        assertThat(ip).isEqualTo("203.0.113.10");
    }

    @Test
    @DisplayName("Peer trực tiếp là proxy Docker tin cậy (172.18.0.2): Duyệt XFF phải-sang-trái lấy client IP")
    void shouldExtractRealClientIpFromTrustedProxyRightToLeft() {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("172.18.0.2");
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.195");

        String ip = clientIpUtil.extractClientIp(request);
        assertThat(ip).isEqualTo("203.0.113.195");
    }

    @Test
    @DisplayName("Kẻ tấn công giả mạo XFF (spoofing): Duyệt từ phải sang trái bỏ qua IP giả mạo")
    void shouldPreventIpSpoofingInXForwardedFor() {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("172.18.0.2"); // Docker proxy
        // Kẻ tấn công gửi 1.1.1.1, proxy thêm 203.0.113.195
        when(request.getHeader("X-Forwarded-For")).thenReturn("1.1.1.1, 203.0.113.195");

        String ip = clientIpUtil.extractClientIp(request);
        assertThat(ip).isEqualTo("203.0.113.195");
    }

    @Test
    @DisplayName("Nhiều proxy tin cậy theo chuỗi: Duyệt lùi qua các proxy tin cậy cho tới IP đầu tiên ngoài proxy")
    void shouldSkipMultipleTrustedProxiesInChain() {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("127.0.0.1"); // Local reverse proxy
        // Client -> Docker Nginx (172.18.0.5) -> Local proxy
        when(request.getHeader("X-Forwarded-For")).thenReturn("198.51.100.50, 172.18.0.5");

        String ip = clientIpUtil.extractClientIp(request);
        assertThat(ip).isEqualTo("198.51.100.50");
    }
}
