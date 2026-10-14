package com.store.chat.llm;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToolResult {
    private String name;
    private String content;
}
