package com.store.chat.llm;

import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToolCall {
    private String name;
    @Builder.Default
    private Map<String, Object> arguments = new HashMap<>();
    private String thoughtSignature;
    private String callId;
}
