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

    /**
     * Gửi chuỗi tin nhắn và danh sách tool declarations đến LLM với model chỉ định (dùng cho fallback model).
     */
    default LlmResponse generate(List<LlmMessage> messages, List<ToolDeclaration> tools, String modelOverride) {
        return generate(messages, tools);
    }
}
