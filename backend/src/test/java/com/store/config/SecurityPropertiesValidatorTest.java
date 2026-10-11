package com.store.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityPropertiesValidatorTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(SecurityPropertiesValidator.class);

    @Test
    @DisplayName("Khởi động THẤT BẠI khi thiếu biến môi trường JWT_SECRET")
    void shouldFailStartupWhenJwtSecretIsMissing() {
        contextRunner
                .withPropertyValues("jwt.secret=")
                .run(context -> {
                    assertThat(context).hasFailed();
                    Throwable rootCause = org.springframework.core.NestedExceptionUtils.getMostSpecificCause(context.getStartupFailure());
                    assertThat(rootCause).isInstanceOf(IllegalStateException.class)
                            .hasMessageContaining("Biến môi trường JWT_SECRET chưa được cấu hình");
                });
    }

    @Test
    @DisplayName("Khởi động THẤT BẠI khi JWT_SECRET có độ dài yếu (< 32 byte / 256 bit)")
    void shouldFailStartupWhenJwtSecretIsTooShort() {
        contextRunner
                .withPropertyValues("jwt.secret=too-short-secret-key-12345")
                .run(context -> {
                    assertThat(context).hasFailed();
                    Throwable rootCause = org.springframework.core.NestedExceptionUtils.getMostSpecificCause(context.getStartupFailure());
                    assertThat(rootCause).isInstanceOf(IllegalStateException.class)
                            .hasMessageContaining("JWT_SECRET phải có độ dài tối thiểu 32 byte");
                });
    }

    @Test
    @DisplayName("Khởi động THẤT BẠI khi JWT_SECRET dùng secret mặc định đã bị lộ (404E6352...)")
    void shouldFailStartupWhenJwtSecretIsCompromisedDefault() {
        contextRunner
                .withPropertyValues("jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970")
                .run(context -> {
                    assertThat(context).hasFailed();
                    Throwable rootCause = org.springframework.core.NestedExceptionUtils.getMostSpecificCause(context.getStartupFailure());
                    assertThat(rootCause).isInstanceOf(IllegalStateException.class)
                            .hasMessageContaining("secret mặc định đã bị lộ");
                });
    }

    @Test
    @DisplayName("Khởi động THẤT BẠI khi JWT_SECRET chứa chuỗi giữ chỗ CHANGE_ME hoặc changeme")
    void shouldFailStartupWhenJwtSecretContainsChangeMe() {
        contextRunner
                .withPropertyValues("jwt.secret=secure_prefix_CHANGE_ME_suffix_longer_than_32_bytes")
                .run(context -> {
                    assertThat(context).hasFailed();
                    Throwable rootCause = org.springframework.core.NestedExceptionUtils.getMostSpecificCause(context.getStartupFailure());
                    assertThat(rootCause).isInstanceOf(IllegalStateException.class)
                            .hasMessageContaining("chuỗi giữ chỗ mẫu không an toàn");
                });
    }

    @Test
    @DisplayName("Khởi động THÀNH CÔNG khi JWT_SECRET hợp lệ (>= 32 byte)")
    void shouldSucceedStartupWhenJwtSecretIsValid() {
        contextRunner
                .withPropertyValues("jwt.secret=this-is-a-very-secure-jwt-secret-key-that-exceeds-32-bytes")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(SecurityPropertiesValidator.class);
                });
    }

    @Test
    @DisplayName("Khởi động THẤT BẠI khi VNPAY_HASH_SECRET dùng giá trị mẫu không an toàn DEMOHASHSECRET")
    void shouldFailStartupWhenVnpayUsesDemoSecret() {
        contextRunner
                .withPropertyValues(
                        "jwt.secret=this-is-a-very-secure-jwt-secret-key-that-exceeds-32-bytes",
                        "vnpay.tmnCode=SANDBOXCODE",
                        "vnpay.hashSecret=DEMOHASHSECRET"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    Throwable rootCause = org.springframework.core.NestedExceptionUtils.getMostSpecificCause(context.getStartupFailure());
                    assertThat(rootCause).isInstanceOf(IllegalStateException.class)
                            .hasMessageContaining("VNPAY_HASH_SECRET không được dùng giá trị mẫu không an toàn DEMOHASHSECRET");
                });
    }

    @Test
    @DisplayName("Khởi động THẤT BẠI trên profile prod khi VNPay dùng tmnCode demo (DEMOCODE)")
    void shouldFailStartupInProdProfileWhenVnpayTmnCodeIsDemo() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "jwt.secret=this-is-a-very-secure-jwt-secret-key-that-exceeds-32-bytes",
                        "app.cookie.secure=true",
                        "app.cors.allowed-origins=https://mystore.vn",
                        "vnpay.tmnCode=DEMOCODE",
                        "vnpay.hashSecret=PRODUCTION_SECURE_HASH_SECRET_KEY_123456"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    Throwable rootCause = org.springframework.core.NestedExceptionUtils.getMostSpecificCause(context.getStartupFailure());
                    assertThat(rootCause).isInstanceOf(IllegalStateException.class)
                            .hasMessageContaining("Trên profile prod, vnpay.tmnCode không được để trống hoặc dùng giá trị demo");
                });
    }

    @Test
    @DisplayName("Khởi động THẤT BẠI trên profile prod khi app.cookie.secure = false")
    void shouldFailStartupInProdProfileWhenCookieSecureIsFalse() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "jwt.secret=this-is-a-very-secure-jwt-secret-key-that-exceeds-32-bytes",
                        "app.cookie.secure=false",
                        "app.cors.allowed-origins=https://mystore.vn",
                        "vnpay.tmnCode=REALTMNCODE",
                        "vnpay.hashSecret=PRODUCTION_SECURE_HASH_SECRET_KEY_123456"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    Throwable rootCause = org.springframework.core.NestedExceptionUtils.getMostSpecificCause(context.getStartupFailure());
                    assertThat(rootCause).isInstanceOf(IllegalStateException.class)
                            .hasMessageContaining("app.cookie.secure bắt buộc phải là true");
                });
    }

    @Test
    @DisplayName("Khởi động THẤT BẠI trên profile prod khi app.cors.allowed-origins chứa ký tự đại diện (*)")
    void shouldFailStartupInProdProfileWhenCorsOriginsContainsWildcard() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "jwt.secret=this-is-a-very-secure-jwt-secret-key-that-exceeds-32-bytes",
                        "app.cookie.secure=true",
                        "app.cors.allowed-origins=*",
                        "vnpay.tmnCode=REALTMNCODE",
                        "vnpay.hashSecret=PRODUCTION_SECURE_HASH_SECRET_KEY_123456"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    Throwable rootCause = org.springframework.core.NestedExceptionUtils.getMostSpecificCause(context.getStartupFailure());
                    assertThat(rootCause).isInstanceOf(IllegalStateException.class)
                            .hasMessageContaining("app.cors.allowed-origins không được chứa ký tự đại diện '*'");
                });
    }

    @Test
    @DisplayName("Khởi động THẤT BẠI trên profile prod khi app.cors.allowed-origins chứa localhost")
    void shouldFailStartupInProdProfileWhenCorsOriginsContainsLocalhost() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "jwt.secret=this-is-a-very-secure-jwt-secret-key-that-exceeds-32-bytes",
                        "app.cookie.secure=true",
                        "app.cors.allowed-origins=http://localhost:3000",
                        "vnpay.tmnCode=REALTMNCODE",
                        "vnpay.hashSecret=PRODUCTION_SECURE_HASH_SECRET_KEY_123456"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    Throwable rootCause = org.springframework.core.NestedExceptionUtils.getMostSpecificCause(context.getStartupFailure());
                    assertThat(rootCause).isInstanceOf(IllegalStateException.class)
                            .hasMessageContaining("app.cors.allowed-origins không được chứa localhost hoặc 127.0.0.1");
                });
    }

    @Test
    @DisplayName("Khởi động THÀNH CÔNG trên profile prod khi toàn bộ cấu hình bảo mật hợp lệ")
    void shouldSucceedStartupInProdProfileWhenAllConfigsValid() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=prod",
                        "jwt.secret=this-is-a-very-secure-jwt-secret-key-that-exceeds-32-bytes",
                        "app.cookie.secure=true",
                        "app.cors.allowed-origins=https://mystore.vn,https://admin.mystore.vn",
                        "vnpay.tmnCode=REALTMNCODE",
                        "vnpay.hashSecret=PRODUCTION_SECURE_HASH_SECRET_KEY_123456"
                )
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(SecurityPropertiesValidator.class);
                });
    }
}
