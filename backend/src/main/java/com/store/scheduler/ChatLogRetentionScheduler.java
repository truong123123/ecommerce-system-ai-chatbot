package com.store.scheduler;

import com.store.config.LlmProperties;
import com.store.repository.ChatMessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
@Slf4j
public class ChatLogRetentionScheduler {

    private final ChatMessageRepository chatMessageRepository;
    private final LlmProperties llmProperties;

    public ChatLogRetentionScheduler(ChatMessageRepository chatMessageRepository, LlmProperties llmProperties) {
        this.chatMessageRepository = chatMessageRepository;
        this.llmProperties = llmProperties;
    }

    /**
     * Chạy định kỳ hàng ngày vào 3:00 sáng để dọn dẹp các bản ghi chat cũ hơn logRetentionDays (mặc định 30 ngày).
     */
    @Scheduled(cron = "${app.chat.retention-cron:0 0 3 * * ?}")
    public void cleanupOldChatLogs() {
        int retentionDays = llmProperties.getLogRetentionDays();
        if (retentionDays <= 0) {
            retentionDays = 30;
        }

        try {
            OffsetDateTime cutoff = OffsetDateTime.now().minusDays(retentionDays);
            int deletedCount = chatMessageRepository.deleteByCreatedAtBefore(cutoff);
            if (deletedCount > 0) {
                log.info("Dọn dẹp nhật ký chat: Đã xóa {} bản ghi cũ hơn {} ngày (trước {})",
                        deletedCount, retentionDays, cutoff);
            }
        } catch (Exception e) {
            log.error("Lỗi trong quá trình dọn dẹp nhật ký chat định kỳ: {}", e.getMessage(), e);
        }
    }
}
