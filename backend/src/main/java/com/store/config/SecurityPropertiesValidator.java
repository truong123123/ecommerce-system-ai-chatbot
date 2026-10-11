package com.store.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Component
@Slf4j
public class SecurityPropertiesValidator {

    public static final String COMPROMISED_DEFAULT_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Value("${vnpay.hashSecret:}")
    private String vnpayHashSecret;

    @Value("${vnpay.tmnCode:}")
    private String vnpayTmnCode;

    @Autowired
    private Environment environment;

    @PostConstruct
    public void validateSecurityProperties() {
        validateJwtSecret();
        validateVNPayProperties();
        validateProductionRestrictions();
    }

    private void validateJwtSecret() {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException("CẤU HÌNH BẢO MẬT KHÔNG HỢP LỆ: Biến môi trường JWT_SECRET chưa được cấu hình. Ứng dụng từ chối khởi động để tránh rủi ro bảo mật.");
        }

        String trimmed = jwtSecret.trim();
        if (COMPROMISED_DEFAULT_SECRET.equalsIgnoreCase(trimmed)) {
            throw new IllegalStateException("CẤU HÌNH BẢO MẬT KHÔNG HỢP LỆ: JWT_SECRET đang dùng secret mặc định đã bị lộ (" + COMPROMISED_DEFAULT_SECRET + "). Bắt buộc phải thay thế bằng secret mới ngẫu nhiên an toàn.");
        }

        String lower = trimmed.toLowerCase();
        if (lower.contains("change_me") || lower.contains("changeme")) {
            throw new IllegalStateException("CẤU HÌNH BẢO MẬT KHÔNG HỢP LỆ: JWT_SECRET chứa chuỗi giữ chỗ mẫu không an toàn ('CHANGE_ME' hoặc 'changeme').");
        }

        byte[] secretBytes = trimmed.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException("CẤU HÌNH BẢO MẬT KHÔNG HỢP LỆ: JWT_SECRET phải có độ dài tối thiểu 32 byte (256-bit). Độ dài hiện tại: " + secretBytes.length + " bytes.");
        }

        log.info("Xác thực cấu hình bảo mật thành công: JWT_SECRET hợp lệ ({} bytes).", secretBytes.length);
    }

    private void validateVNPayProperties() {
        boolean hasTmn = vnpayTmnCode != null && !vnpayTmnCode.trim().isEmpty();
        boolean hasHash = vnpayHashSecret != null && !vnpayHashSecret.trim().isEmpty();

        if ((hasTmn && !hasHash) || (!hasTmn && hasHash)) {
            throw new IllegalStateException("CẤU HÌNH BẢO MẬT KHÔNG HỢP LỆ: Cần cấu hình đồng bộ cả VNPAY_TMN_CODE và VNPAY_HASH_SECRET.");
        }

        if (hasHash && "DEMOHASHSECRET".equalsIgnoreCase(vnpayHashSecret.trim())) {
            throw new IllegalStateException("CẤU HÌNH BẢO MẬT KHÔNG HỢP LỆ: VNPAY_HASH_SECRET không được dùng giá trị mẫu không an toàn DEMOHASHSECRET.");
        }
    }

    private void validateProductionRestrictions() {
        if (environment == null) return;
        boolean isProd = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("production"));

        if (isProd) {
            if (vnpayTmnCode == null || vnpayTmnCode.trim().isEmpty()
                    || "DEMOCODE".equalsIgnoreCase(vnpayTmnCode.trim())
                    || vnpayTmnCode.toLowerCase().contains("change_me")
                    || vnpayTmnCode.toLowerCase().contains("changeme")) {
                throw new IllegalStateException("CẤU HÌNH SẢN XUẤT KHÔNG HỢP LỆ: Trên profile prod, vnpay.tmnCode không được để trống hoặc dùng giá trị demo.");
            }
            if (vnpayHashSecret == null || vnpayHashSecret.trim().isEmpty()
                    || "DEMOHASHSECRET".equalsIgnoreCase(vnpayHashSecret.trim())
                    || vnpayHashSecret.toLowerCase().contains("change_me")
                    || vnpayHashSecret.toLowerCase().contains("changeme")) {
                throw new IllegalStateException("CẤU HÌNH SẢN XUẤT KHÔNG HỢP LỆ: Trên profile prod, vnpay.hashSecret không được để trống hoặc dùng giá trị demo.");
            }
        }
    }
}
