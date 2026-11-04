package com.store.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class LlmPropertiesTest {

    @Test
    @DisplayName("Giá trị mặc định chuẩn: cooldown 300s, maxToolRounds 2, retention 30 ngày")
    void defaultValues() {
        LlmProperties props = new LlmProperties();

        assertThat(props.getCooldownSeconds()).isEqualTo(300);
        assertThat(props.getMaxToolRounds()).isEqualTo(2);
        assertThat(props.getLogRetentionDays()).isEqualTo(30);
        assertThat(props.getProvider()).isEqualTo("gemini");
        assertThat(props.getRateLimit().getSystemDailyLimit()).isEqualTo(200);
        assertThat(props.getRateLimit().getSystemMinuteLimit()).isEqualTo(8);
        assertThat(props.getRateLimit().getPerKeyDailyLimit()).isEqualTo(30);
        assertThat(props.getRateLimit().getPerKeyMinuteLimit()).isEqualTo(5);
    }

    @Test
    @DisplayName("getFallbackModelList: tách chuỗi phân cách bằng dấu phẩy, loại bỏ khoảng trắng và chuỗi rỗng")
    void getFallbackModelList_parsesCorrectly() {
        LlmProperties props = new LlmProperties();
        props.setFallbackModels("gemini-3.5-flash, gemini-3-flash-preview,  , backup-flash ");

        List<String> list = props.getFallbackModelList();
        assertThat(list).containsExactly("gemini-3.5-flash", "gemini-3-flash-preview", "backup-flash");
    }

    @Test
    @DisplayName("getFallbackModelList: trả về danh sách rỗng nếu null hoặc rỗng")
    void getFallbackModelList_emptyOrNull() {
        LlmProperties props = new LlmProperties();
        props.setFallbackModels(null);
        assertThat(props.getFallbackModelList()).isEmpty();

        props.setFallbackModels("   ");
        assertThat(props.getFallbackModelList()).isEmpty();
    }

    @Test
    @DisplayName("Setters an toàn: bỏ qua null hoặc số không hợp lệ để giữ default")
    void defensiveSetters() {
        LlmProperties props = new LlmProperties();
        props.setCooldownSeconds(null);
        assertThat(props.getCooldownSeconds()).isEqualTo(300);

        props.setMaxToolRounds(null);
        assertThat(props.getMaxToolRounds()).isEqualTo(2);

        props.setLogRetentionDays(null);
        assertThat(props.getLogRetentionDays()).isEqualTo(30);

        props.getRateLimit().setSystemDailyLimit(null);
        assertThat(props.getRateLimit().getSystemDailyLimit()).isEqualTo(200);
    }
}
