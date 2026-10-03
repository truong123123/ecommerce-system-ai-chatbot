package com.store.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandDto {
    private Integer brandId;
    private String name;
    private String slug;
    private String country;
    private String logoUrl;
    private String description;
    private Integer sortOrder;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
