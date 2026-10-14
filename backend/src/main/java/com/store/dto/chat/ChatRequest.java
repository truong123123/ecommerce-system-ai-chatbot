package com.store.dto.chat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequest {

    private UUID sessionId;

    @NotBlank(message = "Tin nhắn không được để trống")
    @Size(min = 1, max = 500, message = "Tin nhắn phải có độ dài từ 1 đến 500 ký tự")
    private String message;

    @Valid
    @Size(max = 10, message = "Lịch sử trò chuyện tối đa 10 tin nhắn")
    @Builder.Default
    private List<ChatMessageDto> history = new ArrayList<>();

    /**
     * Lọc sạch lịch sử chat: chỉ giữ lại các tin nhắn có role hợp lệ ("user" hoặc "assistant")
     * và giới hạn tối đa 10 tin nhắn gần nhất để phòng ngừa prompt injection và giả mạo role.
     */
    public List<ChatMessageDto> getSanitizedHistory() {
        if (history == null) {
            return new ArrayList<>();
        }
        return history.stream()
                .filter(m -> m != null && m.getRole() != null && m.getContent() != null)
                .filter(m -> {
                    String r = m.getRole().trim().toLowerCase();
                    return "user".equals(r) || "assistant".equals(r);
                })
                .map(m -> new ChatMessageDto(
                        m.getRole().trim().toLowerCase(),
                        m.getContent().trim()
                ))
                .limit(10)
                .collect(Collectors.toList());
    }
}
