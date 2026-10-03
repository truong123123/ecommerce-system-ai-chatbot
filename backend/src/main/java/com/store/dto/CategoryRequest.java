package com.store.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {
    private String name;
    private String slug;
    private Integer parentId;
    private String imageUrl;
    private String iconUrl;
    private String description;
    private Integer sortOrder;
    private Boolean isActive;
}
