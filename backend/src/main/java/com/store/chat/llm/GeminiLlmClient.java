package com.store.chat.llm;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.config.LlmProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
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

    @Override
    public String getProviderName() {
        return "gemini";
    }

    @Override
    public LlmResponse generate(List<LlmMessage> messages, List<ToolDeclaration> tools) {
        if (!properties.hasApiKey()) {
            throw new LlmException("Gemini API key is not configured");
        }

        String model = properties.getModel();
        if (model == null || model.isBlank()) {
            model = "gemini-1.5-flash";
        }

        Map<String, Object> payload = buildPayload(messages, tools);

        try {
            String url = "/v1beta/models/" + model + ":generateContent";

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
            log.error("Gemini API responded with error status {}: {}", e.getStatusCode(), e.getStatusText());
            throw new LlmException("Gemini API returned error: " + e.getStatusCode(), e);
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
                if (msg.getToolCalls() != null && !msg.getToolCalls().isEmpty()) {
                    for (ToolCall tc : msg.getToolCalls()) {
                        Map<String, Object> fnCall = new LinkedHashMap<>();
                        fnCall.put("name", tc.getName());
                        fnCall.put("args", tc.getArguments() != null ? tc.getArguments() : Collections.emptyMap());
                        parts.add(Map.of("functionCall", fnCall));
                    }
                }
            } else if (msg.getRole() == LlmMessage.Role.TOOL) {
                contentMap.put("role", "function");
                ToolResult tr = msg.getToolResult();
                if (tr != null) {
                    Map<String, Object> fnResponse = new LinkedHashMap<>();
                    fnResponse.put("name", tr.getName());
                    // Đóng gói output dưới dạng JSON Object cho Gemini
                    fnResponse.put("response", Map.of("output", tr.getContent() != null ? tr.getContent() : ""));
                    parts.add(Map.of("functionResponse", fnResponse));
                }
            }

            if (!parts.isEmpty()) {
                contentMap.put("parts", parts);
                contents.add(contentMap);
            }
        }
        payload.put("contents", contents);

        // 3. Khai báo Tools (Function Declarations)
        if (tools != null && !tools.isEmpty()) {
            List<Map<String, Object>> funcDeclarations = new ArrayList<>();
            for (ToolDeclaration td : tools) {
                Map<String, Object> decl = new LinkedHashMap<>();
                decl.put("name", td.getName());
                decl.put("description", td.getDescription() != null ? td.getDescription() : "");
                if (td.getParameters() != null) {
                    decl.put("parameters", td.getParameters());
                }
                funcDeclarations.add(decl);
            }
            payload.put("tools", List.of(Map.of("functionDeclarations", funcDeclarations)));
        }

        return payload;
    }

    LlmResponse parseResponse(String responseJson, String model) {
        if (responseJson == null || responseJson.isBlank()) {
            throw new LlmException("Empty response received from Gemini");
        }

        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                log.warn("Gemini response has no candidates: {}", responseJson);
                return LlmResponse.ofText("Xin lỗi, tôi không thể xử lý yêu cầu lúc này.", model);
            }

            JsonNode firstCandidate = candidates.get(0);
            JsonNode parts = firstCandidate.path("content").path("parts");
            if (!parts.isArray() || parts.isEmpty()) {
                return LlmResponse.ofText("", model);
            }

            StringBuilder textBuilder = new StringBuilder();
            List<ToolCall> toolCalls = new ArrayList<>();

            for (JsonNode part : parts) {
                if (part.has("text")) {
                    textBuilder.append(part.get("text").asText());
                }
                if (part.has("functionCall")) {
                    JsonNode fnCall = part.get("functionCall");
                    String fnName = fnCall.path("name").asText();
                    Map<String, Object> args = new HashMap<>();
                    if (fnCall.has("args")) {
                        args = objectMapper.convertValue(fnCall.get("args"), new TypeReference<Map<String, Object>>() {});
                    }
                    toolCalls.add(ToolCall.builder().name(fnName).arguments(args).build());
                }
            }

            if (!toolCalls.isEmpty()) {
                return LlmResponse.builder()
                        .text(textBuilder.length() > 0 ? textBuilder.toString() : null)
                        .toolCalls(toolCalls)
                        .model(model)
                        .build();
            }

            return LlmResponse.ofText(textBuilder.toString().trim(), model);
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            throw new LlmException("Error parsing Gemini response: " + e.getMessage(), e);
        }
    }
}
