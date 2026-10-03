package com.store.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductPageResponseDto {
    private List<ProductResponseDto> items;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
}
