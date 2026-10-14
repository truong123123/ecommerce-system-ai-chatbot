package com.store.dto.chat;

import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private UUID sessionId;
    private String reply;
    @Builder.Default
    private List<ProductCardDto> products = new ArrayList<>();
    private boolean fallback;
}
