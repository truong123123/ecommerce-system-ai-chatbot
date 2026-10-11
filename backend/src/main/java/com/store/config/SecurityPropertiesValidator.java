package com.store.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class SecurityPropertiesValidator {

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Value("${vnpay.hashSecret:}")
    private String vnpayHashSecret;

    @Value("${vnpay.tmnCode:}")
    private String vnpayTmnCode;

    @PostConstruct
    public void validateSecurityProperties() {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException("CẤU HÌNH BẢO MẬT KHÔNG HỢP LỆ: Biến môi trường JWT_SECRET chưa được cấu hình. Ứng dụng từ chối khởi động để tránh rủi ro bảo mật.");
        }

        byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException("CẤU HÌNH BẢO MẬT KHÔNG HỢP LỆ: JWT_SECRET phải có độ dài tối thiểu 32 byte (256-bit). Độ dài hiện tại: " + secretBytes.length + " bytes.");
        }

        boolean hasTmn = vnpayTmnCode != null && !vnpayTmnCode.trim().isEmpty();
        boolean hasHash = vnpayHashSecret != null && !vnpayHashSecret.trim().isEmpty();

        if ((hasTmn && !hasHash) || (!hasTmn && hasHash)) {
            throw new IllegalStateException("CẤU HÌNH BẢO MẬT KHÔNG HỢP LỆ: Cần cấu hình đồng bộ cả VNPAY_TMN_CODE và VNPAY_HASH_SECRET.");
        }

        if (hasHash && "DEMOHASHSECRET".equalsIgnoreCase(vnpayHashSecret.trim())) {
            throw new IllegalStateException("CẤU HÌNH BẢO MẬT KHÔNG HỢP LỆ: VNPAY_HASH_SECRET không được dùng giá trị mẫu không an toàn DEMOHASHSECRET.");
        }

        log.info("Xác thực cấu hình bảo mật thành công: JWT_SECRET hợp lệ ({} bytes).", secretBytes.length);
    }
}
