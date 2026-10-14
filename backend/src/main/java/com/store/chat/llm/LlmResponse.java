package com.store.chat.llm;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LlmResponse {

    private String text;

    @Builder.Default
    private List<ToolCall> toolCalls = new ArrayList<>();

    private String model;

    public boolean hasToolCalls() {
        return toolCalls != null && !toolCalls.isEmpty();
    }

    public static LlmResponse ofText(String text, String model) {
        return LlmResponse.builder().text(text).model(model).build();
    }

    public static LlmResponse ofToolCalls(List<ToolCall> toolCalls, String model) {
        return LlmResponse.builder().toolCalls(toolCalls).model(model).build();
    }
}
