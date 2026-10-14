package com.store.chat.llm;

import java.util.List;

public interface LlmClient {

    /**
     * Tên provider (vd: "gemini", "openai", "claude")
     */
    String getProviderName();

    /**
     * Gửi chuỗi tin nhắn và danh sách tool declarations đến LLM, nhận về câu trả lời hoặc yêu cầu gọi tool.
     */
    LlmResponse generate(List<LlmMessage> messages, List<ToolDeclaration> tools);
}
