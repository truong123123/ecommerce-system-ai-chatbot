package com.store.controller;

import com.store.dto.admin.AdminChatSessionDto;
import com.store.entity.ChatMessage;
import com.store.entity.Customer;
import com.store.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/support")
@RequiredArgsConstructor
public class AdminSupportController {

    private final ChatMessageRepository chatMessageRepository;

    @GetMapping("/chats")
    public ResponseEntity<List<AdminChatSessionDto>> getRecentChatSessions() {
        List<ChatMessage> recentMessages = chatMessageRepository.findTop200ByOrderByCreatedAtDesc();

        // Nhóm theo sessionId và lấy tin nhắn gần nhất cùng tổng số tin nhắn
        Map<UUID, List<ChatMessage>> grouped = recentMessages.stream()
                .collect(Collectors.groupingBy(ChatMessage::getSessionId, LinkedHashMap::new, Collectors.toList()));

        List<AdminChatSessionDto> sessions = new ArrayList<>();

        for (Map.Entry<UUID, List<ChatMessage>> entry : grouped.entrySet()) {
            UUID sessionId = entry.getKey();
            List<ChatMessage> msgs = entry.getValue();
            if (msgs.isEmpty()) continue;

            // Tin nhắn mới nhất (do đã sắp xếp theo createdAt DESC)
            ChatMessage latest = msgs.get(0);
            Customer cust = msgs.stream()
                    .map(ChatMessage::getCustomer)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);

            sessions.add(AdminChatSessionDto.builder()
                    .sessionId(sessionId)
                    .customerId(cust != null ? cust.getCustomerId() : null)
                    .customerName(cust != null ? cust.getFullName() : "Khách vãng lai")
                    .customerEmail(cust != null ? cust.getEmail() : null)
                    .lastMessage(latest.getContent())
                    .lastRole(latest.getRole())
                    .messageCount((long) msgs.size())
                    .lastMessageAt(latest.getCreatedAt())
                    .build());
        }

        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/chats/{sessionId}")
    public ResponseEntity<List<ChatMessage>> getChatThread(@PathVariable UUID sessionId) {
        List<ChatMessage> thread = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        return ResponseEntity.ok(thread);
    }

    @PostMapping("/chats/{sessionId}/reply")
    public ResponseEntity<?> replyToChat(
            @PathVariable UUID sessionId,
            @RequestBody Map<String, String> body,
            Authentication auth
    ) {
        String content = body.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nội dung phản hồi không được để trống"));
        }

        String staffName = auth != null ? auth.getName() : "Tư vấn viên";

        ChatMessage replyMessage = ChatMessage.builder()
                .sessionId(sessionId)
                .role("assistant")
                .content(content.trim())
                .model("staff-support (" + staffName + ")")
                .latencyMs(0)
                .fallback(false)
                .createdAt(OffsetDateTime.now())
                .build();

        ChatMessage saved = chatMessageRepository.save(replyMessage);
        return ResponseEntity.ok(saved);
    }
}

