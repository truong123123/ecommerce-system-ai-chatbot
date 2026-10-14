package com.store.chat.llm;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LlmMessage {

    public enum Role {
        SYSTEM,
        USER,
        ASSISTANT,
        TOOL
    }

    private Role role;
    private String content;

    @Builder.Default
    private List<ToolCall> toolCalls = new ArrayList<>();

    private ToolResult toolResult;

    public static LlmMessage system(String text) {
        return LlmMessage.builder().role(Role.SYSTEM).content(text).build();
    }

    public static LlmMessage user(String text) {
        return LlmMessage.builder().role(Role.USER).content(text).build();
    }

    public static LlmMessage assistant(String text) {
        return LlmMessage.builder().role(Role.ASSISTANT).content(text).build();
    }

    public static LlmMessage assistantWithTools(List<ToolCall> toolCalls) {
        return LlmMessage.builder().role(Role.ASSISTANT).toolCalls(toolCalls).build();
    }

    public static LlmMessage assistantWithTools(String text, List<ToolCall> toolCalls) {
        return LlmMessage.builder().role(Role.ASSISTANT).content(text).toolCalls(toolCalls).build();
    }

    public static LlmMessage tool(String toolName, String output) {
        return LlmMessage.builder()
                .role(Role.TOOL)
                .toolResult(ToolResult.builder().name(toolName).content(output).build())
                .build();
    }
}
