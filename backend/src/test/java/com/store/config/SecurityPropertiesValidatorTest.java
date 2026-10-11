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
}
