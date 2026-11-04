package com.store.chat.service;

import com.store.chat.llm.LlmClient;
import com.store.chat.llm.LlmException;
import com.store.chat.llm.LlmMessage;
import com.store.chat.llm.LlmResponse;
import com.store.chat.llm.ToolCall;
import com.store.chat.llm.ToolDeclaration;
import com.store.chat.security.ChatRateLimiter;
import com.store.chat.tool.ChatContext;
import com.store.chat.tool.ChatTool;
import com.store.chat.tool.SearchProductsTool;
import com.store.chat.tool.ToolExecutionResult;
import com.store.chat.util.PiiMasker;
import com.store.config.LlmProperties;
import com.store.dto.chat.ChatRequest;
import com.store.dto.chat.ChatResponse;
import com.store.entity.ChatMessage;
import com.store.entity.Customer;
import com.store.exception.RateLimitExceededException;
import com.store.repository.ChatMessageRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final LlmClient llmClient;
    private final LlmProperties llmProperties;
    private final ChatRateLimiter chatRateLimiter;
    private final ChatMessageRepository chatMessageRepository;
    private final SearchProductsTool searchProductsTool;

    private final Map<String, ChatTool> toolMap = new HashMap<>();
    private final List<ToolDeclaration> toolDeclarations = new ArrayList<>();

    private String systemPrompt = "Bạn là trợ lý bán hàng AI của cửa hàng. Hãy trả lời ngắn gọn, trung thực, chỉ dùng thông tin từ kết quả tool.";

    public ChatServiceImpl(
            LlmClient llmClient,
            ChatRateLimiter chatRateLimiter,
            ChatMessageRepository chatMessageRepository,
            List<ChatTool> tools,
            SearchProductsTool searchProductsTool,
            LlmProperties llmProperties
    ) {
        this.llmClient = llmClient;
        this.chatRateLimiter = chatRateLimiter;
        this.chatMessageRepository = chatMessageRepository;
        this.searchProductsTool = searchProductsTool;
        this.llmProperties = llmProperties;

        for (ChatTool tool : tools) {
            toolMap.put(tool.getName(), tool);
            toolDeclarations.add(new ToolDeclaration(
                    tool.getName(),
                    tool.getDescription(),
                    tool.getParameterSchema()
            ));
        }
    }

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("chat/system-prompt.vi.txt");
            try (InputStream is = resource.getInputStream()) {
                byte[] bytes = is.readAllBytes();
                this.systemPrompt = new String(bytes, StandardCharsets.UTF_8).trim();
                log.info("Nạp thành công system prompt từ chat/system-prompt.vi.txt");
            }
        } catch (Exception e) {
            log.warn("Không thể tải chat/system-prompt.vi.txt, dùng system prompt mặc định: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public ChatResponse processChat(ChatRequest request, Customer currentCustomer, String clientIp) {
        long startTime = System.currentTimeMillis();

        // 1. Kiểm tra rate limit người dùng / IP
        chatRateLimiter.checkAndIncrement(currentCustomer, clientIp);

        // 2. Xác định sessionId và nạp lịch sử từ DB (B4: chống client giả mạo history & bảo vệ phiên)
        UUID sessionId = request.getSessionId();
        List<ChatMessage> existingMessages = Collections.emptyList();

        if (sessionId != null) {
            existingMessages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
            if (!existingMessages.isEmpty()) {
                Long sessionCustomerId = existingMessages.stream()
                        .map(ChatMessage::getCustomer)
                        .filter(Objects::nonNull)
                        .map(Customer::getCustomerId)
                        .findFirst()
                        .orElse(null);

                Long currentCustomerId = (currentCustomer != null) ? currentCustomer.getCustomerId() : null;

                // Kiểm tra phân quyền phiên: Nếu phiên gắn với customer khác -> tạo sessionId mới
                if (sessionCustomerId != null && !Objects.equals(sessionCustomerId, currentCustomerId)) {
                    log.warn("Cảnh báo bảo mật: SessionId {} thuộc về khách hàng id={}, người dùng hiện tại id={}. Tạo phiên mới.",
                            sessionId, sessionCustomerId, currentCustomerId);
                    sessionId = UUID.randomUUID();
                    existingMessages = Collections.emptyList();
                }
            }
        } else {
            sessionId = UUID.randomUUID();
        }

        // 3. Khởi tạo Context cho phiên gọi tool
        ChatContext context = new ChatContext(currentCustomer);

        // 4. Lưu tin nhắn của người dùng vào DB (đã che giấu PII: SĐT, Email)
        String maskedUserMessage = PiiMasker.maskPii(request.getMessage());
        saveUserMessage(sessionId, currentCustomer, maskedUserMessage, clientIp);

        // 5. Chuẩn bị danh sách messages cho LLM
        List<LlmMessage> messages = new ArrayList<>();
        messages.add(LlmMessage.system(this.systemPrompt));

        // Nạp lịch sử từ DB (tối đa 10 tin nhắn gần nhất, chỉ user và assistant, KHÔNG lấy payload tool)
        if (!existingMessages.isEmpty()) {
            List<ChatMessage> textHistory = existingMessages.stream()
                    .filter(m -> "user".equalsIgnoreCase(m.getRole()) || "assistant".equalsIgnoreCase(m.getRole()))
                    .toList();
            if (textHistory.size() > 10) {
                textHistory = textHistory.subList(textHistory.size() - 10, textHistory.size());
            }
            for (ChatMessage msg : textHistory) {
                if ("user".equalsIgnoreCase(msg.getRole())) {
                    messages.add(LlmMessage.user(msg.getContent()));
                } else if ("assistant".equalsIgnoreCase(msg.getRole())) {
                    messages.add(LlmMessage.assistant(msg.getContent()));
                }
            }
        }

        // Thêm tin nhắn hiện tại của user ĐÃ ĐƯỢC CHE PII trước khi gửi cho LLM
        messages.add(LlmMessage.user(maskedUserMessage));

        // Thu thập danh sách candidate models: [model chính, ...fallback models]
        List<String> candidateModels = new ArrayList<>();
        if (llmProperties.hasModel()) {
            candidateModels.add(llmProperties.getModel().trim());
        }
        for (String fb : llmProperties.getFallbackModelList()) {
            if (!candidateModels.contains(fb)) {
                candidateModels.add(fb);
            }
        }

        String finalReply = null;
        String modelUsed = candidateModels.isEmpty() ? llmProperties.getModel() : candidateModels.get(0);
        boolean isFallback = false;

        // Kiểm tra cấu hình LLM
        if (!llmProperties.hasApiKey() || candidateModels.isEmpty()) {
            isFallback = true;
            log.warn("Chatbot chạy chế độ fallback: thiếu LLM_API_KEY hoặc không có LLM_MODEL nào được cấu hình");
        }

        if (!isFallback) {
            int maxToolRounds = llmProperties.getMaxToolRounds() > 0 ? llmProperties.getMaxToolRounds() : 2;
            int toolRounds = 0;
            int currentCandidateIndex = 0;

            while (toolRounds <= maxToolRounds) {
                List<ToolDeclaration> currentTools = (toolRounds < maxToolRounds) ? toolDeclarations : Collections.emptyList();
                LlmResponse response = null;

                while (currentCandidateIndex < candidateModels.size()) {
                    String currentModel = candidateModels.get(currentCandidateIndex);

                    // Kiểm tra Circuit Breaker theo model
                    if (chatRateLimiter.isCircuitOpen(currentModel)) {
                        log.warn("Circuit Breaker đang mở cho model '{}', chuyển sang model kế tiếp", currentModel);
                        currentCandidateIndex++;
                        continue;
                    }

                    // Kiểm tra và đếm hạn mức hệ thống theo từng model
                    if (!chatRateLimiter.checkAndIncrementSystemLlmCall(currentModel)) {
                        log.warn("Model '{}' đã đạt giới hạn cuộc gọi hệ thống, chuyển sang model kế tiếp", currentModel);
                        currentCandidateIndex++;
                        continue;
                    }

                    try {
                        response = llmClient.generate(messages, currentTools, currentModel);
                        modelUsed = (response.getModel() != null && !response.getModel().isBlank()) ? response.getModel() : currentModel;
                        break; // Gọi thành công model này
                    } catch (Exception e) {
                        boolean is429 = (e instanceof LlmException && ((LlmException) e).getStatusCode() == 429)
                                || (e.getMessage() != null && (e.getMessage().contains("429") || e.getMessage().contains("RESOURCE_EXHAUSTED")));
                        boolean isDaily = (e instanceof LlmException) && ((LlmException) e).isDailyQuota();

                        if (is429) {
                            chatRateLimiter.recordLlm429(currentModel, isDaily);
                            log.warn("Model '{}' gặp lỗi 429 (dailyQuota={}), kích hoạt chuyển sang model kế tiếp", currentModel, isDaily);
                        } else {
                            log.error("Lỗi khi gọi model '{}': {}", currentModel, e.getMessage());
                        }
                        currentCandidateIndex++;
                    }
                }

                if (response == null) {
                    log.warn("Tất cả các model LLM đều không khả dụng hoặc vượt hạn mức. Kích hoạt rule-based fallback.");
                    isFallback = true;
                    break;
                }

                if (!response.hasToolCalls() || toolRounds >= maxToolRounds) {
                    finalReply = response.getText();
                    break;
                }

                // LLM yêu cầu gọi tool
                toolRounds++;
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

            if (!isFallback && (finalReply == null || finalReply.isBlank())) {
                finalReply = "Dưới đây là một số thông tin và sản phẩm tìm thấy phù hợp với yêu cầu của bạn.";
            }
        }

        if (isFallback) {
            finalReply = "Xin lỗi, hiện tại trợ lý AI đang bận hoặc gặp sự cố kết nối. " +
                    "Bạn có thể tham khảo một số sản phẩm gợi ý bên dưới hoặc liên hệ hotline cửa hàng để được hỗ trợ tốt nhất.";

            try {
                String searchKeyword = extractFallbackKeyword(request.getMessage());
                if (searchKeyword != null && !searchKeyword.isBlank()) {
                    searchProductsTool.execute(Map.of("keyword", searchKeyword), context);
                }
            } catch (Exception ignored) {
            }
        }

        long latency = System.currentTimeMillis() - startTime;

        // 7. Lưu câu trả lời của trợ lý vào DB (A4: che giấu PII)
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
                    .content(PiiMasker.maskPii(content))
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
                    .content(PiiMasker.maskPii(content))
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

    private String extractFallbackKeyword(String message) {
        if (message == null || message.isBlank()) {
            return null;
        }

        String lower = message.toLowerCase().trim();

        // 1. Kiểm tra các nhóm từ khóa sản phẩm cốt lõi
        String[] techKeywords = {
                "iphone", "macbook", "ipad", "airpods", "apple watch", "watch",
                "laptop", "samsung", "asus", "dell", "hp", "tai nghe", "chuột", "bàn phím"
        };
        for (String kw : techKeywords) {
            if (lower.contains(kw)) {
                return kw;
            }
        }

        // 2. Loại bỏ các từ dừng tiếng Việt phổ biến trong câu hỏi mua hàng
        String cleaned = lower
                .replaceAll("(?i)\\b(có|không|shop|ơi|nào|dưới|trên|khoảng|triệu|tr|k|ạ|giá|báo|tư vấn|cho|mình|em|anh|chị|mua|cần|tìm|xem|muốn|hỏi|sản phẩm)\\b", " ")
                .replaceAll("[^a-zA-Z0-9àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ\\s]", " ")
                .trim()
                .replaceAll("\\s+", " ");

        if (!cleaned.isEmpty()) {
            String[] words = cleaned.split(" ");
            if (words.length > 3) {
                return String.join(" ", Arrays.copyOfRange(words, 0, 3));
            }
            return cleaned;
        }

        return message.length() > 20 ? message.substring(0, 20) : message;
    }
}
