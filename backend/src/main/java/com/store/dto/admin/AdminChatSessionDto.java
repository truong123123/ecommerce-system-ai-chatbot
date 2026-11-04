package com.store.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminChatSessionDto {
    private UUID sessionId;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String lastMessage;
    private String lastRole;
    private Long messageCount;
    private OffsetDateTime lastMessageAt;
}

