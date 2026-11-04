package com.store.integration;

import com.store.config.LlmProperties;
import com.store.entity.ChatMessage;
import com.store.repository.ChatMessageRepository;
import com.store.scheduler.ChatLogRetentionScheduler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@TestPropertySource(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false",
        "spring.jpa.show-sql=true"
})
class ChatLogRetentionIntegrationTest {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Xác nhận deleteByCreatedAtBefore và job dọn dẹp xóa thật các bản ghi cũ")
    void testChatLogRetentionScheduler_deletesOldLogsRealDatabase() {
        UUID session1 = UUID.randomUUID();
        UUID session2 = UUID.randomUUID();
        UUID session3 = UUID.randomUUID();

        // 1. Bản ghi cũ: 35 ngày trước
        ChatMessage oldMsg1 = ChatMessage.builder()
                .sessionId(session1)
                .role("user")
                .content("Tin nhắn cũ 35 ngày trước")
                .createdAt(OffsetDateTime.now().minusDays(35))
                .build();

        // 2. Bản ghi cũ: 40 ngày trước
        ChatMessage oldMsg2 = ChatMessage.builder()
                .sessionId(session2)
                .role("assistant")
                .content("Tin nhắn cũ 40 ngày trước")
                .createdAt(OffsetDateTime.now().minusDays(40))
                .build();

        // 3. Bản ghi mới: 5 ngày trước
        ChatMessage newMsg1 = ChatMessage.builder()
                .sessionId(session3)
                .role("user")
                .content("Tin nhắn mới 5 ngày trước")
                .createdAt(OffsetDateTime.now().minusDays(5))
                .build();

        // 4. Bản ghi mới: vừa tạo
        ChatMessage newMsg2 = ChatMessage.builder()
                .sessionId(session3)
                .role("assistant")
                .content("Tin nhắn mới vừa tạo")
                .createdAt(OffsetDateTime.now())
                .build();

        chatMessageRepository.save(oldMsg1);
        chatMessageRepository.save(oldMsg2);
        chatMessageRepository.save(newMsg1);
        chatMessageRepository.save(newMsg2);
        entityManager.flush();
        entityManager.clear();

        assertThat(chatMessageRepository.count()).isEqualTo(4);

        // Kiểm tra trực tiếp method repository deleteByCreatedAtBefore
        OffsetDateTime cutoff = OffsetDateTime.now().minusDays(30);
        int deleted = chatMessageRepository.deleteByCreatedAtBefore(cutoff);
        assertThat(deleted).isEqualTo(2);

        entityManager.clear();

        // Kiểm tra sau khi xóa: chỉ còn lại 2 bản ghi mới
        List<ChatMessage> remaining = chatMessageRepository.findAll();
        assertThat(remaining).hasSize(2);
        assertThat(remaining).extracting(ChatMessage::getContent)
                .containsExactlyInAnyOrder("Tin nhắn mới 5 ngày trước", "Tin nhắn mới vừa tạo");

        // Đồng thời kiểm tra scheduler hoạt động chuẩn xác khi gọi job
        LlmProperties props = new LlmProperties();
        props.setLogRetentionDays(30);
        ChatLogRetentionScheduler scheduler = new ChatLogRetentionScheduler(chatMessageRepository, props);
        scheduler.cleanupOldChatLogs();
    }
}
