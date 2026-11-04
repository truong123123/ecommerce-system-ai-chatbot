package com.store.scheduler;

import com.store.config.LlmProperties;
import com.store.repository.ChatMessageRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatLogRetentionSchedulerTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;
    @Mock
    private LlmProperties llmProperties;

    @InjectMocks
    private ChatLogRetentionScheduler scheduler;

    @Test
    @DisplayName("A4: Xóa các bản ghi chat_messages cũ hơn retentionDays cấu hình (mặc định 30 ngày)")
    void cleanupOldChatLogs_deletesRecordsBeforeCutoff() {
        when(llmProperties.getLogRetentionDays()).thenReturn(30);
        when(chatMessageRepository.deleteByCreatedAtBefore(any(OffsetDateTime.class))).thenReturn(15);

        scheduler.cleanupOldChatLogs();

        ArgumentCaptor<OffsetDateTime> captor = ArgumentCaptor.forClass(OffsetDateTime.class);
        verify(chatMessageRepository).deleteByCreatedAtBefore(captor.capture());

        OffsetDateTime cutoff = captor.getValue();
        // Điểm cắt phải nằm trong khoảng 30 ngày trước thời điểm hiện tại
        assertThat(cutoff).isBefore(OffsetDateTime.now().minusDays(29));
        assertThat(cutoff).isAfter(OffsetDateTime.now().minusDays(31));
    }
}
