package com.store.chat.service;

import com.store.dto.chat.ChatRequest;
import com.store.dto.chat.ChatResponse;
import com.store.entity.Customer;

public interface ChatService {

    /**
     * Xử lý tin nhắn chat từ người dùng, quản lý vòng lặp gọi tool của LLM,
     * lưu lịch sử hội thoại và trả về câu trả lời kèm các thẻ sản phẩm đã xác thực.
     */
    ChatResponse processChat(ChatRequest request, Customer currentCustomer, String clientIp);
}
