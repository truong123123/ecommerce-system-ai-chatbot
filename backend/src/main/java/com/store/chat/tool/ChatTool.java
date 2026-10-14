package com.store.chat.tool;

import java.util.Map;

public interface ChatTool {

    /**
     * Tên định danh của tool (vd: search_products, get_product_detail...)
     */
    String getName();

    /**
     * Mô tả chức năng và mục đích của tool cho LLM
     */
    String getDescription();

    /**
     * JSON Schema định nghĩa tham số đầu vào
     */
    Map<String, Object> getParameterSchema();

    /**
     * Thực thi tool với tham số và context hội thoại
     */
    ToolExecutionResult execute(Map<String, Object> args, ChatContext ctx);
}
