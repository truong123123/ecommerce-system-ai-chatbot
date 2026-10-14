package com.store.chat.llm;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToolDeclaration {
    private String name;
    private String description;
    private Map<String, Object> parameters;
}
