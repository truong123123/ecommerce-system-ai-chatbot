package com.store.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "variant_id")
    private Long variantId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "sku", nullable = false, unique = true, length = 60)
    private String sku;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attributes", columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private Map<String, Object> attributes = new HashMap<>();

    @Column(name = "cost_price", nullable = false, precision = 14, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "sale_price", nullable = false, precision = 14, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public void setAttributes(Object input) {
        this.attributes = parseAttributes(input);
    }

    public static Map<String, Object> parseAttributes(Object input) {
        if (input == null) {
            return new HashMap<>();
        }
        if (input instanceof Map<?, ?> map) {
            Map<String, Object> result = new HashMap<>();
            map.forEach((k, v) -> result.put(String.valueOf(k), v));
            return result;
        }
        if (input instanceof String str) {
            String trimmed = str.trim();
            if (trimmed.isEmpty() || trimmed.equals("{}")) {
                return new HashMap<>();
            }
            try {
                return MAPPER.readValue(trimmed, new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                return new HashMap<>();
            }
        }
        try {
            return MAPPER.convertValue(input, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    public static class ProductVariantBuilder {
        public ProductVariantBuilder attributes(Object input) {
            this.attributes$value = parseAttributes(input);
            this.attributes$set = true;
            return this;
        }
    }
}
