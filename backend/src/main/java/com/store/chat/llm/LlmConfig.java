package com.store.chat.llm;

import com.store.config.LlmProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Configuration
public class LlmConfig {

    @Bean
    @Primary
    public LlmClient primaryLlmClient(LlmProperties properties, List<LlmClient> clients) {
        String targetProvider = properties.getProvider() != null ? properties.getProvider().trim().toLowerCase() : "gemini";
        Map<String, LlmClient> clientMap = clients.stream()
                .collect(Collectors.toMap(c -> c.getProviderName().toLowerCase(), Function.identity(), (a, b) -> a));

        LlmClient selected = clientMap.get(targetProvider);
        if (selected != null) {
            return selected;
        }
        return clientMap.getOrDefault("gemini", clients.isEmpty() ? null : clients.get(0));
    }
}
