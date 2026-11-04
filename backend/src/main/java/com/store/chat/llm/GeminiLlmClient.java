package com.store.chat.llm;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.config.LlmProperties;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.*;

@Component
@Slf4j
public class GeminiLlmClient implements LlmClient {

    private static final String DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com";
    private final LlmProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public GeminiLlmClient(LlmProperties properties, RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        this(properties, restClientBuilder, objectMapper, true);
    }

    public GeminiLlmClient(LlmProperties properties, RestClient.Builder restClientBuilder, ObjectMapper objectMapper, boolean applyTimeout) {
        this.properties = properties;
        this.objectMapper = objectMapper;

        if (applyTimeout) {
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(properties.getConnectTimeoutSeconds() * 1000);
            requestFactory.setReadTimeout(properties.getReadTimeoutSeconds() * 1000);
            restClientBuilder.requestFactory(requestFactory);
        }

        this.restClient = restClientBuilder
                .baseUrl(DEFAULT_BASE_URL)
                .build();
    }

    // Package-private constructor for testing with custom RestClient
    GeminiLlmClient(LlmProperties properties, RestClient restClient, ObjectMapper objectMapper) {
        this.properties = properties;
        this.restClient = restClient;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        if (!properties.isConfigured()) {
            log.warn("Chatbot chạy chế độ fallback: thiếu LLM_API_KEY/LLM_MODEL");
        }
    }

    @Override
    public String getProviderName() {
        return "gemini";
    }

    @Override
    public LlmResponse generate(List<LlmMessage> messages, List<ToolDeclaration> tools) {
        return generate(messages, tools, null);
    }

    @Override
    public LlmResponse generate(List<LlmMessage> messages, List<ToolDeclaration> tools, String modelOverride) {
        if (!properties.hasApiKey()) {
            throw new LlmException("Gemini API key is not configured");
        }

        String model = (modelOverride != null && !modelOverride.isBlank())
                ? modelOverride.trim()
                : properties.getModel();
        if (model == null || model.isBlank()) {
            throw new LlmException("Gemini model is not configured");
        }

        Map<String, Object> payload = buildPayload(messages, tools);

        try {
            String url = "/v1beta/models/" + model.trim() + ":generateContent";

            String responseBody = restClient.post()
                    .uri(url)
                    .header("x-goog-api-key", properties.getApiKey().trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(String.class);

            return parseResponse(responseBody, model);
        } catch (RestClientResponseException e) {
            int statusCode = e.getStatusCode().value();
            boolean isDailyQuota = false;
            String errBody = "";
            try {
                errBody = e.getResponseBodyAsString();
            } catch (Exception ignored) {
            }

            if (statusCode == 404 || statusCode == 400) {
                log.error("Gemini API error (HTTP {}): Model '{}' không tồn tại hoặc tham số không hợp lệ. Chi tiết: {}", statusCode, model, errBody);
            } else if (statusCode == 429) {
                String lower = (errBody != null) ? errBody.toLowerCase() : "";
                if (lower.contains("per day") || lower.contains("perday") || lower.contains("daily") || lower.contains("per_day") || (lower.contains("quota") && lower.contains("day"))) {
                    isDailyQuota = true;
                }
                log.warn("Gemini API vượt quá hạn mức quota (HTTP 429, model={}, dailyQuota={}): {}", model, isDailyQuota, errBody);
            } else {
                log.error("Gemini API error (HTTP {}): {}", statusCode, e.getStatusText());
            }
            throw new LlmException("Gemini API returned error: " + statusCode, statusCode, isDailyQuota, e);
        } catch (LlmException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to communicate with Gemini API: {}", e.getMessage());
            throw new LlmException("Error communicating with Gemini: " + e.getMessage(), e);
        }
    }

    Map<String, Object> buildPayload(List<LlmMessage> messages, List<ToolDeclaration> tools) {
        Map<String, Object> payload = new LinkedHashMap<>();

        // 1. Tách System Instruction nếu có
        Optional<LlmMessage> systemMsg = messages.stream()
                .filter(m -> m.getRole() == LlmMessage.Role.SYSTEM)
                .findFirst();

        systemMsg.ifPresent(m -> {
            Map<String, Object> sysInstruction = Map.of(
                    "parts", List.of(Map.of("text", m.getContent() != null ? m.getContent() : ""))
            );
            payload.put("systemInstruction", sysInstruction);
        });

        // 2. Chuyển đổi nội dung hội thoại
        List<Map<String, Object>> contents = new ArrayList<>();
        for (LlmMessage msg : messages) {
            if (msg.getRole() == LlmMessage.Role.SYSTEM) {
                continue; // Đã đưa vào systemInstruction
            }

            Map<String, Object> contentMap = new LinkedHashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();

            if (msg.getRole() == LlmMessage.Role.USER) {
                contentMap.put("role", "user");
                parts.add(Map.of("text", msg.getContent() != null ? msg.getContent() : ""));
            } else if (msg.getRole() == LlmMessage.Role.ASSISTANT) {
                contentMap.put("role", "model");
                if (msg.getContent() != null && !msg.getContent().isBlank()) {
                    parts.add(Map.of("text", msg.getContent()));
                }
                if (msg.getToolCalls() != null) {
                    for (ToolCall tc : msg.getToolCalls()) {
                        Map<String, Object> part = new LinkedHashMap<>();
                        Map<String, Object> fc = new LinkedHashMap<>();
                        fc.put("name", tc.getName());
                        fc.put("args", tc.getArguments() != null ? tc.getArguments() : Collections.emptyMap());
                        if (tc.getCallId() != null) {
                            fc.put("id", tc.getCallId());
                        }
                        part.put("functionCall", fc);
                        if (tc.getThoughtSignature() != null) {
                            part.put("thoughtSignature", tc.getThoughtSignature());
                        }
                        parts.add(part);
                    }
                }
            } else if (msg.getRole() == LlmMessage.Role.TOOL) {
                // Trong Gemini generateContent API, functionResponse nằm dưới role: "user"
                contentMap.put("role", "user");
                Map<String, Object> funcResponse = new LinkedHashMap<>();
                String toolName = msg.getToolResult() != null ? msg.getToolResult().getName() : "";
                String toolContent = msg.getToolResult() != null ? msg.getToolResult().getContent() : msg.getContent();
                funcResponse.put("name", toolName);

                Object responseObj;
                try {
                    responseObj = objectMapper.readValue(toolContent, new TypeReference<Map<String, Object>>() {});
                } catch (Exception ex) {
                    responseObj = Map.of("result", toolContent != null ? toolContent : "");
                }
                funcResponse.put("response", responseObj);
                parts.add(Map.of("functionResponse", funcResponse));
            }

            contentMap.put("parts", parts);
            contents.add(contentMap);
        }
        payload.put("contents", contents);

        // 3. Khai báo danh sách Tools
        if (tools != null && !tools.isEmpty()) {
            List<Map<String, Object>> functionDeclarations = new ArrayList<>();
            for (ToolDeclaration tool : tools) {
                Map<String, Object> decl = new LinkedHashMap<>();
                decl.put("name", tool.getName());
                decl.put("description", tool.getDescription());
                if (tool.getParameters() != null) {
                    decl.put("parameters", tool.getParameters());
                }
                functionDeclarations.add(decl);
            }
            payload.put("tools", List.of(Map.of("functionDeclarations", functionDeclarations)));
        }

        return payload;
    }

    LlmResponse parseResponse(String responseBody, String modelName) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isMissingNode() || !candidates.isArray() || candidates.isEmpty()) {
                throw new LlmException("No candidates returned by Gemini API");
            }

            JsonNode candidate = candidates.get(0);
            JsonNode content = candidate.path("content");
            JsonNode parts = content.path("parts");

            StringBuilder textBuilder = new StringBuilder();
            List<ToolCall> toolCalls = new ArrayList<>();

            if (parts.isArray()) {
                for (JsonNode part : parts) {
                    if (part.has("text")) {
                        textBuilder.append(part.get("text").asText());
                    }
                    if (part.has("functionCall")) {
                        JsonNode fnCall = part.get("functionCall");
                        String fnName = fnCall.path("name").asText();
                        JsonNode argsNode = fnCall.path("args");
                        Map<String, Object> args = objectMapper.convertValue(argsNode, new TypeReference<Map<String, Object>>() {});

                        String thoughtSig = null;
                        if (part.has("thoughtSignature")) {
                            thoughtSig = part.path("thoughtSignature").asText();
                        } else if (part.has("thought_signature")) {
                            thoughtSig = part.path("thought_signature").asText();
                        }

                        String callId = fnCall.has("id") ? fnCall.path("id").asText() : null;

                        toolCalls.add(ToolCall.builder()
                                .name(fnName)
                                .arguments(args)
                                .thoughtSignature(thoughtSig)
                                .callId(callId)
                                .build());
                    }
                }
            }

            String text = textBuilder.toString().trim();
            return new LlmResponse(text.isEmpty() ? null : text, toolCalls, modelName);
        } catch (Exception e) {
            if (e instanceof LlmException) {
                throw (LlmException) e;
            }
            throw new LlmException("Failed to parse Gemini response: " + e.getMessage(), e);
        }
    }
}
