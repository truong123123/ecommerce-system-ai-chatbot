package com.store.chat.service;

import com.store.chat.llm.*;
import com.store.chat.security.ChatRateLimiter;
import com.store.chat.tool.ChatContext;
import com.store.chat.tool.ChatTool;
import com.store.chat.tool.SearchProductsTool;
import com.store.chat.tool.ToolExecutionResult;
import com.store.config.LlmProperties;
import com.store.dto.chat.ChatMessageDto;
import com.store.dto.chat.ChatRequest;
import com.store.dto.chat.ChatResponse;
import com.store.dto.chat.ProductCardDto;
import com.store.entity.Customer;
import com.store.repository.ChatMessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceImplTest {

    @Mock
    private LlmClient llmClient;
    @Mock
    private ChatRateLimiter chatRateLimiter;
    @Mock
    private ChatMessageRepository chatMessageRepository;
    @Mock
    private SearchProductsTool searchProductsTool;

    private LlmProperties llmProperties;
    private ChatServiceImpl chatService;

    @BeforeEach
    void setUp() {
        llmProperties = new LlmProperties();
        llmProperties.setModel("gemini-1.5-flash");

        when(searchProductsTool.getName()).thenReturn("search_products");
        when(searchProductsTool.getDescription()).thenReturn("Tìm kiếm sản phẩm");
        when(searchProductsTool.getParameterSchema()).thenReturn(Map.of("type", "OBJECT"));

        chatService = new ChatServiceImpl(
                llmClient,
                chatRateLimiter,
                chatMessageRepository,
                List.of(searchProductsTool),
                searchProductsTool,
                llmProperties
        );
        chatService.init();
    }

    @Test
    @DisplayName("Kịch bản (a): LLM gọi search_products, nhận kết quả và trả lời người dùng kèm ProductCard")
    void processChat_scenarioA_toolCallThenReply() {
        ProductCardDto card = ProductCardDto.builder()
                .id(1L)
                .name("iPhone 15 Pro Max")
                .slug("iphone-15-pro-max")
                .price(BigDecimal.valueOf(29990000))
                .inStock(true)
                .build();

        // Lần 1: LLM yêu cầu gọi tool search_products
        LlmResponse response1 = LlmResponse.builder()
                .toolCalls(List.of(ToolCall.builder().name("search_products").arguments(Map.of("keyword", "iphone 15")).build()))
                .model("gemini-1.5-flash")
                .build();

        // Lần 2: LLM nhận kết quả tool và đưa ra câu trả lời cuối cùng
        LlmResponse response2 = LlmResponse.builder()
                .text("Dạ shop có sẵn iPhone 15 Pro Max 256GB chính hãng giá 29.990.000đ ạ.")
                .model("gemini-1.5-flash")
                .build();

        when(llmClient.generate(anyList(), anyList()))
                .thenReturn(response1)
                .thenReturn(response2);

        doAnswer(invocation -> {
            ChatContext ctx = invocation.getArgument(1);
            ctx.addProduct(card);
            return ToolExecutionResult.of("{\"count\": 1, \"products\": [{\"name\": \"iPhone 15 Pro Max\"}]}", List.of(card));
        }).when(searchProductsTool).execute(anyMap(), any(ChatContext.class));

        ChatRequest request = ChatRequest.builder()
                .message("Shop có iPhone 15 không?")
                .build();

        Customer customer = Customer.builder().customerId(10L).email("user@store.com").build();
        ChatResponse res = chatService.processChat(request, customer, "127.0.0.1");

        assertThat(res.isFallback()).isFalse();
        assertThat(res.getReply()).contains("iPhone 15 Pro Max");
        assertThat(res.getProducts()).hasSize(1);
        assertThat(res.getProducts().get(0).getName()).isEqualTo("iPhone 15 Pro Max");

        verify(searchProductsTool, times(1)).execute(anyMap(), any(ChatContext.class));
        verify(llmClient, times(2)).generate(anyList(), anyList());
        verify(chatMessageRepository, times(2)).save(any());
    }

    @Test
    @DisplayName("Kịch bản (b): Vượt quá 4 vòng lặp gọi tool thì dừng lại và trả kết quả đã có")
    void processChat_scenarioB_stopsAtMaxIterations() {
        // LLM liên tục gọi tool không ngừng
        LlmResponse endlessToolResponse = LlmResponse.builder()
                .toolCalls(List.of(ToolCall.builder().name("search_products").arguments(Map.of("keyword", "loop")).build()))
                .model("gemini-1.5-flash")
                .build();

        when(llmClient.generate(anyList(), anyList())).thenReturn(endlessToolResponse);
        when(searchProductsTool.execute(anyMap(), any(ChatContext.class)))
                .thenReturn(ToolExecutionResult.of("{\"status\":\"ok\"}"));

        ChatRequest request = ChatRequest.builder()
                .message("Lặp vô tận")
                .build();

        ChatResponse res = chatService.processChat(request, null, "127.0.0.1");

        // Không bị treo, dừng sau đúng 4 lần
        verify(llmClient, times(4)).generate(anyList(), anyList());
        verify(searchProductsTool, times(4)).execute(anyMap(), any(ChatContext.class));
        assertThat(res.getReply()).isNotNull();
        assertThat(res.isFallback()).isFalse();
    }

    @Test
    @DisplayName("Kịch bản (c): LLM ném lỗi (429/timeout/chưa có key) -> fallback=true và tự động search theo từ khóa người dùng")
    void processChat_scenarioC_llmErrorTriggersFallback() {
        when(llmClient.generate(anyList(), anyList()))
                .thenThrow(new LlmException("Gemini API quota exceeded (HTTP 429)"));

        ProductCardDto fallbackCard = ProductCardDto.builder()
                .id(2L)
                .name("MacBook Air M3")
                .price(BigDecimal.valueOf(27000000))
                .inStock(true)
                .build();

        doAnswer(invocation -> {
            ChatContext ctx = invocation.getArgument(1);
            ctx.addProduct(fallbackCard);
            return ToolExecutionResult.of("{}", List.of(fallbackCard));
        }).when(searchProductsTool).execute(anyMap(), any(ChatContext.class));

        ChatRequest request = ChatRequest.builder()
                .message("Tư vấn laptop MacBook")
                .build();

        ChatResponse res = chatService.processChat(request, null, "127.0.0.1");

        assertThat(res.isFallback()).isTrue();
        assertThat(res.getReply()).contains("Xin lỗi, hiện tại trợ lý AI đang bận");
        assertThat(res.getProducts()).hasSize(1);
        assertThat(res.getProducts().get(0).getName()).isEqualTo("MacBook Air M3");

        // Xác nhận đã lưu tin nhắn fallback vào DB
        verify(chatMessageRepository, times(2)).save(any());
    }
}
