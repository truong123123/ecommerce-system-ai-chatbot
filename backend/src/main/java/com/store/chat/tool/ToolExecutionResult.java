package com.store.chat.tool;

import com.store.dto.chat.ProductCardDto;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToolExecutionResult {

    private String resultJson;

    @Builder.Default
    private List<ProductCardDto> products = new ArrayList<>();

    public static ToolExecutionResult of(String resultJson) {
        return ToolExecutionResult.builder().resultJson(resultJson).build();
    }

    public static ToolExecutionResult of(String resultJson, List<ProductCardDto> products) {
        return ToolExecutionResult.builder()
                .resultJson(resultJson)
                .products(products != null ? products : new ArrayList<>())
                .build();
    }
}
