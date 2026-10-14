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
import com.store.entity.ChatMessage;
import com.store.entity.Customer;
import com.store.repository.ChatMessageRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {

    private static final int MAX_TOOL_ITERATIONS = 4;
    private static final String DEFAULT_SYSTEM_PROMPT =
            "Bạn là trợ lý bán hàng AI của cửa hàng công nghệ chính hãng. " +
            "CHỈ dùng số liệu từ kết quả tool, không tự bịa đặt. " +
            "Trả lời ngắn gọn, lịch sự, đúng sự thật.";

    private final LlmClient llmClient;
    private final ChatRateLimiter chatRateLimiter;
    private final ChatMessageRepository chatMessageRepository;
    private final List<ChatTool> tools;
    private final SearchProductsTool searchProductsTool;
    private final LlmProperties llmProperties;

    private Map<String, ChatTool> toolMap;
    private List<ToolDeclaration> toolDeclarations;
    private String systemPrompt = DEFAULT_SYSTEM_PROMPT;

    @PostConstruct
    public void init() {
        toolMap = tools.stream()
                .collect(Collectors.toMap(ChatTool::getName, Function.identity(), (a, b) -> a));

        toolDeclarations = tools.stream()
                .map(t -> ToolDeclaration.builder()
                        .name(t.getName())
                        .description(t.getDescription())
                        .parameters(t.getParameterSchema())
                        .build())
                .collect(Collectors.toList());

        try {
            ClassPathResource res = new ClassPathResource("chat/system-prompt.vi.txt");
            try (InputStream is = res.getInputStream()) {
                byte[] bytes = is.readAllBytes();
                String text = new String(bytes, StandardCharsets.UTF_8).trim();
                if (!text.isEmpty()) {
                    this.systemPrompt = text;
                }
            }
        } catch (Exception e) {
            log.warn("Không thể tải chat/system-prompt.vi.txt, dùng system prompt mặc định: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public ChatResponse processChat(ChatRequest request, Customer currentCustomer, String clientIp) {
        long startTime = System.currentTimeMillis();

        // 1. Kiểm tra rate limit
        chatRateLimiter.checkAndIncrement(currentCustomer, clientIp);

        // 2. Xác định sessionId
        UUID sessionId = request.getSessionId() != null ? request.getSessionId() : UUID.randomUUID();

        // 3. Khởi tạo Context cho phiên gọi tool
        ChatContext context = new ChatContext(currentCustomer);

        // 4. Lưu tin nhắn của người dùng vào DB
        saveUserMessage(sessionId, currentCustomer, request.getMessage(), clientIp);

        // 5. Chuẩn bị danh sách messages cho LLM
        List<LlmMessage> messages = new ArrayList<>();
        messages.add(LlmMessage.system(this.systemPrompt));

        // Nạp sanitized history (chỉ role user và assistant)
        List<ChatMessageDto> sanitizedHistory = request.getSanitizedHistory();
        for (ChatMessageDto h : sanitizedHistory) {
            if ("user".equalsIgnoreCase(h.getRole())) {
                messages.add(LlmMessage.user(h.getContent()));
            } else if ("assistant".equalsIgnoreCase(h.getRole())) {
                messages.add(LlmMessage.assistant(h.getContent()));
            }
        }

        // Thêm tin nhắn hiện tại của user
        messages.add(LlmMessage.user(request.getMessage()));

        String finalReply = null;
        String modelUsed = llmProperties.getModel();
        boolean isFallback = false;

        try {
            // 6. Vòng lặp tool-calling (tối đa 4 vòng)
            int iteration = 0;
            while (iteration < MAX_TOOL_ITERATIONS) {
                iteration++;

                LlmResponse response = llmClient.generate(messages, toolDeclarations);
                if (response.getModel() != null) {
                    modelUsed = response.getModel();
                }

                if (!response.hasToolCalls()) {
                    // LLM đã hoàn tất và trả về câu trả lời bằng văn bản
                    finalReply = response.getText();
                    break;
                }

                // LLM yêu cầu gọi tool
                messages.add(LlmMessage.assistantWithTools(response.getText(), response.getToolCalls()));

                for (ToolCall call : response.getToolCalls()) {
                    ChatTool targetTool = toolMap.get(call.getName());
                    ToolExecutionResult execResult;
                    if (targetTool != null) {
                        try {
                            execResult = targetTool.execute(call.getArguments(), context);
                        } catch (Exception ex) {
                            log.error("Lỗi khi thực thi tool {}: {}", call.getName(), ex.getMessage());
                            execResult = ToolExecutionResult.of("{\"error\": \"Lỗi thực thi tool: " + ex.getMessage() + "\"}");
                        }
                    } else {
                        log.warn("LLM gọi tool không tồn tại: {}", call.getName());
                        execResult = ToolExecutionResult.of("{\"error\": \"Tool không được hỗ trợ: " + call.getName() + "\"}");
                    }

                    // Đưa kết quả tool vào message để LLM đọc ở vòng tiếp theo
                    messages.add(LlmMessage.tool(call.getName(), execResult.getResultJson()));
                }
            }

            // Nếu vượt quá số vòng lặp tối đa mà LLM vẫn muốn gọi tool
            if (finalReply == null || finalReply.isBlank()) {
                finalReply = "Dưới đây là một số thông tin và sản phẩm tìm thấy phù hợp với yêu cầu của bạn.";
            }

        } catch (Exception e) {
            log.error("Sự cố khi giao tiếp với LLM (Kích hoạt chế độ fallback): {}", e.getMessage());
            isFallback = true;
            finalReply = "Xin lỗi, hiện tại trợ lý AI đang bận hoặc gặp sự cố kết nối. " +
                    "Bạn có thể tham khảo một số sản phẩm gợi ý bên dưới hoặc liên hệ hotline cửa hàng để được hỗ trợ tốt nhất.";

            // Trong chế độ fallback, thử tìm kiếm sản phẩm theo từ khóa của người dùng
            try {
                searchProductsTool.execute(Map.of("keyword", request.getMessage()), context);
            } catch (Exception ignored) {
            }
        }

        long latency = System.currentTimeMillis() - startTime;

        // 7. Lưu câu trả lời của trợ lý vào DB
        saveAssistantMessage(sessionId, currentCustomer, finalReply, modelUsed, (int) latency, isFallback, clientIp);

        return ChatResponse.builder()
                .sessionId(sessionId)
                .reply(finalReply)
                .products(context.getCollectedProductsList())
                .fallback(isFallback)
                .build();
    }

    private void saveUserMessage(UUID sessionId, Customer customer, String content, String clientIp) {
        try {
            ChatMessage msg = ChatMessage.builder()
                    .sessionId(sessionId)
                    .customer(customer)
                    .role("user")
                    .content(content)
                    .ipHash(ChatRateLimiter.hashIp(clientIp))
                    .createdAt(OffsetDateTime.now())
                    .build();
            chatMessageRepository.save(msg);
        } catch (Exception e) {
            log.warn("Không thể lưu tin nhắn user vào chat_messages: {}", e.getMessage());
        }
    }

    private void saveAssistantMessage(
            UUID sessionId,
            Customer customer,
            String content,
            String model,
            int latencyMs,
            boolean fallback,
            String clientIp
    ) {
        try {
            ChatMessage msg = ChatMessage.builder()
                    .sessionId(sessionId)
                    .customer(customer)
                    .role("assistant")
                    .content(content)
                    .model(model)
                    .latencyMs(latencyMs)
                    .fallback(fallback)
                    .ipHash(ChatRateLimiter.hashIp(clientIp))
                    .createdAt(OffsetDateTime.now())
                    .build();
            chatMessageRepository.save(msg);
        } catch (Exception e) {
            log.warn("Không thể lưu tin nhắn assistant vào chat_messages: {}", e.getMessage());
        }
    }
}
