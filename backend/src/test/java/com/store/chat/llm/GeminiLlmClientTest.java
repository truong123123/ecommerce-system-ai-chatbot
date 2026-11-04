package com.store.chat.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.config.LlmProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class GeminiLlmClientTest {

    private LlmProperties properties;
    private ObjectMapper objectMapper;
    private MockRestServiceServer mockServer;
    private GeminiLlmClient geminiClient;

    @BeforeEach
    void setUp() {
        properties = new LlmProperties();
        properties.setProvider("gemini");
        properties.setApiKey("test-secret-key-123");
        properties.setModel("gemini-1.5-flash");

        objectMapper = new ObjectMapper();

        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();
        geminiClient = new GeminiLlmClient(properties, builder, objectMapper, false);
    }

    @Test
    @DisplayName("Parse đúng text response và gửi key qua header x-goog-api-key (KHÔNG có trên query string)")
    void generate_textResponse_success() {
        String mockResponseJson = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          { "text": "Chào bạn, tôi là trợ lý AI." }
                        ],
                        "role": "model"
                      },
                      "finishReason": "STOP"
                    }
                  ]
                }
                """;

        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("x-goog-api-key", "test-secret-key-123"))
                // Đảm bảo URI không chứa query param chứa API key
                .andExpect(requestTo(not(containsString("key="))))
                .andRespond(withSuccess(mockResponseJson, MediaType.APPLICATION_JSON));

        LlmResponse response = geminiClient.generate(
                List.of(LlmMessage.user("Xin chào")),
                List.of()
        );

        mockServer.verify();
        assertThat(response.getText()).isEqualTo("Chào bạn, tôi là trợ lý AI.");
        assertThat(response.hasToolCalls()).isFalse();
    }

    @Test
    @DisplayName("Parse đúng functionCall từ Gemini response")
    void generate_functionCallResponse_success() {
        String mockResponseJson = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "functionCall": {
                              "name": "search_products",
                              "args": {
                                "keyword": "iphone 15",
                                "maxPrice": 30000000
                              }
                            }
                          }
                        ],
                        "role": "model"
                      },
                      "finishReason": "STOP"
                    }
                  ]
                }
                """;

        ToolDeclaration toolDecl = ToolDeclaration.builder()
                .name("search_products")
                .description("Tìm kiếm sản phẩm")
                .parameters(Map.of("type", "OBJECT"))
                .build();

        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("x-goog-api-key", "test-secret-key-123"))
                .andRespond(withSuccess(mockResponseJson, MediaType.APPLICATION_JSON));

        LlmResponse response = geminiClient.generate(
                List.of(LlmMessage.user("Tìm iPhone dưới 30 triệu")),
                List.of(toolDecl)
        );

        mockServer.verify();
        assertThat(response.hasToolCalls()).isTrue();
        assertThat(response.getToolCalls()).hasSize(1);
        ToolCall call = response.getToolCalls().get(0);
        assertThat(call.getName()).isEqualTo("search_products");
        assertThat(call.getArguments().get("keyword")).isEqualTo("iphone 15");
        assertThat(call.getArguments().get("maxPrice")).isEqualTo(30000000);
    }

    @Test
    @DisplayName("Ném LlmException khi chưa cấu hình API key")
    void generate_missingApiKey_throwsException() {
        properties.setApiKey("");

        assertThatThrownBy(() -> geminiClient.generate(List.of(LlmMessage.user("Alo")), List.of()))
                .isInstanceOf(LlmException.class)
                .hasMessageContaining("Gemini API key is not configured");
    }

    @Test
    @DisplayName("Hỗ trợ modelOverride khi gọi generate")
    void generate_withModelOverride_usesSpecifiedModel() {
        String mockResponseJson = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          { "text": "Trả lời từ model override." }
                        ],
                        "role": "model"
                      },
                      "finishReason": "STOP"
                    }
                  ]
                }
                """;

        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-fallback-model:generateContent"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("x-goog-api-key", "test-secret-key-123"))
                .andRespond(withSuccess(mockResponseJson, MediaType.APPLICATION_JSON));

        LlmResponse response = geminiClient.generate(
                List.of(LlmMessage.user("Xin chào")),
                List.of(),
                "gemini-fallback-model"
        );

        mockServer.verify();
        assertThat(response.getText()).isEqualTo("Trả lời từ model override.");
        assertThat(response.getModel()).isEqualTo("gemini-fallback-model");
    }

    @Test
    @DisplayName("Lỗi HTTP 429 khi hết hạn mức ngày: ném LlmException với statusCode=429 và dailyQuota=true")
    void generate_http429DailyQuota_setsFlag() {
        String errBody = """
                {
                  "error": {
                    "code": 429,
                    "message": "Resource has been exhausted (e.g. check quota). Quota exceeded per day.",
                    "status": "RESOURCE_EXHAUSTED"
                  }
                }
                """;

        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators.withRawStatus(429)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(errBody));

        assertThatThrownBy(() -> geminiClient.generate(List.of(LlmMessage.user("Alo")), List.of()))
                .isInstanceOf(LlmException.class)
                .satisfies(ex -> {
                    LlmException llmEx = (LlmException) ex;
                    assertThat(llmEx.getStatusCode()).isEqualTo(429);
                    assertThat(llmEx.isDailyQuota()).isTrue();
                });
    }
}

