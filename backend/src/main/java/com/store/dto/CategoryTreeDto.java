package com.store.dto;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryTreeDto {
    private Integer categoryId;
    private Integer parentId;
    private String name;
    private String slug;
    private String imageUrl;
    private String iconUrl;
    private String description;
    private Integer sortOrder;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Builder.Default
    private List<CategoryTreeDto> children = new ArrayList<>();
}
