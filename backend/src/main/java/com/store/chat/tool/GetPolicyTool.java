package com.store.chat.tool;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class GetPolicyTool implements ChatTool {

    private final ObjectMapper objectMapper;
    private final Map<String, Map<String, Object>> policiesCache = new HashMap<>();

    private static final Set<String> ALLOWED_TOPICS = Set.of(
            "warranty", "return", "shipping", "payment", "installment"
    );

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("chat/policies.vi.json");
            try (InputStream is = resource.getInputStream()) {
                Map<String, Map<String, Object>> map = objectMapper.readValue(is, new TypeReference<>() {});
                policiesCache.putAll(map);
                log.info("Nạp thành công {} chính sách từ chat/policies.vi.json", policiesCache.size());
            }
        } catch (Exception e) {
            log.warn("Không thể nạp chat/policies.vi.json từ classpath: {}", e.getMessage());
        }
    }

    @Override
    public String getName() {
        return "get_policy";
    }

    @Override
    public String getDescription() {
        return "Tra cứu thông tin chính sách của cửa hàng theo chủ đề (warranty: bảo hành, return: đổi trả, shipping: vận chuyển, payment: thanh toán, installment: trả góp 0%).";
    }

    @Override
    public Map<String, Object> getParameterSchema() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "OBJECT");

        Map<String, Object> properties = new LinkedHashMap<>();
        Map<String, Object> topicProp = new LinkedHashMap<>();
        topicProp.put("type", "STRING");
        topicProp.put("description", "Chủ đề chính sách cần tra cứu. Giá trị hợp lệ: warranty, return, shipping, payment, installment");
        topicProp.put("enum", List.of("warranty", "return", "shipping", "payment", "installment"));
        properties.put("topic", topicProp);

        schema.put("properties", properties);
        schema.put("required", List.of("topic"));
        return schema;
    }

    @Override
    public ToolExecutionResult execute(Map<String, Object> args, ChatContext ctx) {
        if (args == null || !args.containsKey("topic") || args.get("topic") == null) {
            return ToolExecutionResult.of("{\"error\": \"Vui lòng chỉ định chủ đề chính sách (warranty, return, shipping, payment, installment)\"}");
        }

        String topic = String.valueOf(args.get("topic")).trim().toLowerCase();
        if (!ALLOWED_TOPICS.contains(topic)) {
            return ToolExecutionResult.of("{\"error\": \"Chủ đề không hợp lệ. Hệ thống chỉ hỗ trợ: " + ALLOWED_TOPICS + "\"}");
        }

        Map<String, Object> policy = policiesCache.get(topic);
        if (policy == null) {
            // Thử nạp lại nếu cache trống
            init();
            policy = policiesCache.get(topic);
        }

        if (policy == null) {
            return ToolExecutionResult.of("{\"error\": \"Chưa có dữ liệu chính sách cho chủ đề: " + topic + "\"}");
        }

        try {
            return ToolExecutionResult.of(objectMapper.writeValueAsString(policy));
        } catch (Exception e) {
            log.error("Lỗi serialize chính sách {}: {}", topic, e.getMessage());
            return ToolExecutionResult.of("{\"error\": \"Không thể đọc chính sách lúc này\"}");
        }
    }
}
