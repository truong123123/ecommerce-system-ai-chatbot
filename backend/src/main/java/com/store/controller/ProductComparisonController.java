package com.store.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.dto.comparison.ComparisonResponseDto;
import com.store.dto.comparison.ComparisonResponseDto.*;
import com.store.entity.Product;
import com.store.entity.ProductImage;
import com.store.entity.ProductVariant;
import com.store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/products/compare")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductComparisonController {

    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    private static final Map<String, String[]> GROUP_DEFINITIONS = new LinkedHashMap<>();

    static {
        GROUP_DEFINITIONS.put("Màn hình", new String[]{"screen", "display"});
        GROUP_DEFINITIONS.put("Hiệu năng & Phần cứng", new String[]{"chip", "cpu", "gpu", "ram", "storage", "os", "chip_ai"});
        GROUP_DEFINITIONS.put("Camera & Quay phim", new String[]{"camera_rear", "camera_front"});
        GROUP_DEFINITIONS.put("Pin & Sạc", new String[]{"battery"});
        GROUP_DEFINITIONS.put("Kết nối & Thiết kế", new String[]{"ports", "material", "pen"});
    }

    private static final Map<String, String> LABEL_MAP = new HashMap<>();

    static {
        LABEL_MAP.put("screen", "Kích thước & Công nghệ màn hình");
        LABEL_MAP.put("display", "Độ phân giải & Tần số quét");
        LABEL_MAP.put("chip", "Vi xử lý (CPU)");
        LABEL_MAP.put("cpu", "Vi xử lý (CPU)");
        LABEL_MAP.put("gpu", "Card đồ họa (GPU)");
        LABEL_MAP.put("ram", "Bộ nhớ RAM");
        LABEL_MAP.put("storage", "Bộ nhớ trong / Ổ cứng");
        LABEL_MAP.put("os", "Hệ điều hành");
        LABEL_MAP.put("chip_ai", "Trí tuệ nhân tạo (NPU / AI Engine)");
        LABEL_MAP.put("camera_rear", "Camera sau");
        LABEL_MAP.put("camera_front", "Camera trước");
        LABEL_MAP.put("battery", "Dung lượng Pin & Công nghệ sạc");
        LABEL_MAP.put("ports", "Cổng kết nối");
        LABEL_MAP.put("material", "Chất liệu & Khung viền");
        LABEL_MAP.put("pen", "Bút cảm ứng / Tiện ích mở rộng");
    }

    @GetMapping
    public ResponseEntity<?> compareProducts(@RequestParam("ids") String idsParam) {
        if (idsParam == null || idsParam.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng chọn từ 2 đến 4 sản phẩm để so sánh."));
        }

        List<Long> productIds;
        try {
            productIds = Arrays.stream(idsParam.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .distinct()
                    .collect(Collectors.toList());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Danh sách ID sản phẩm không hợp lệ."));
        }

        if (productIds.size() < 2 || productIds.size() > 4) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Hệ thống chỉ hỗ trợ so sánh từ 2 đến 4 sản phẩm cùng lúc. Bạn đã chọn " + productIds.size() + " sản phẩm."
            ));
        }

        List<Product> products = new ArrayList<>();
        for (Long id : productIds) {
            productRepository.findById(id).ifPresent(products::add);
        }

        if (products.size() < 2) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm đủ tối thiểu 2 sản phẩm tồn tại để thực hiện so sánh."));
        }

        // Map product items
        List<ProductComparisonItemDto> productDtos = new ArrayList<>();
        Map<Long, Map<String, String>> productSpecsMap = new HashMap<>();

        for (Product p : products) {
            String img = null;
            if (p.getImages() != null && !p.getImages().isEmpty()) {
                img = p.getImages().stream()
                        .filter(i -> Boolean.TRUE.equals(i.getIsPrimary()))
                        .map(ProductImage::getUrl)
                        .findFirst()
                        .orElse(p.getImages().get(0).getUrl());
            }

            BigDecimal minPrice = null;
            BigDecimal maxPrice = null;
            if (p.getVariants() != null && !p.getVariants().isEmpty()) {
                for (ProductVariant v : p.getVariants()) {
                    if (v.getSalePrice() != null) {
                        if (minPrice == null || v.getSalePrice().compareTo(minPrice) < 0) minPrice = v.getSalePrice();
                        if (maxPrice == null || v.getSalePrice().compareTo(maxPrice) > 0) maxPrice = v.getSalePrice();
                    }
                }
            }

            // Parse specs JSON
            Map<String, String> rawSpecs = new HashMap<>();
            if (p.getSpecs() != null) {
                try {
                    String str;
                    if (p.getSpecs() instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> map = (Map<String, Object>) p.getSpecs();
                        map.forEach((k, v) -> rawSpecs.put(k, v != null ? v.toString() : "-"));
                        str = null;
                    } else {
                        str = String.valueOf(p.getSpecs());
                    }

                    if (str != null && !str.trim().isEmpty() && !str.equals("{}")) {
                        // Unescape if double-encoded
                        if (str.startsWith("\"") && str.endsWith("\"")) {
                            str = objectMapper.readValue(str, String.class);
                        }
                        Map<String, Object> map = objectMapper.readValue(str, new TypeReference<Map<String, Object>>() {});
                        map.forEach((k, v) -> rawSpecs.put(k, v != null ? v.toString() : "-"));
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse specs for product {}: {}", p.getProductId(), e.getMessage());
                }
            }

            productSpecsMap.put(p.getProductId(), rawSpecs);

            productDtos.add(ProductComparisonItemDto.builder()
                    .productId(p.getProductId())
                    .name(p.getName())
                    .slug(p.getSlug())
                    .brandName(p.getBrand() != null ? p.getBrand().getName() : null)
                    .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                    .imageUrl(img)
                    .minPrice(minPrice)
                    .maxPrice(maxPrice)
                    .inStock(Boolean.TRUE.equals(p.getIsActive()))
                    .specs(rawSpecs)
                    .build());
        }

        // Build groups and compute isDifferent
        List<ComparisonGroupDto> attributeGroups = new ArrayList<>();
        Set<String> processedKeys = new HashSet<>();

        for (Map.Entry<String, String[]> entry : GROUP_DEFINITIONS.entrySet()) {
            String groupName = entry.getKey();
            String[] keys = entry.getValue();

            List<ComparisonAttributeRowDto> rows = new ArrayList<>();
            for (String key : keys) {
                // Check if any product has this key
                boolean anyHas = products.stream().anyMatch(p -> productSpecsMap.get(p.getProductId()).containsKey(key));
                if (!anyHas) continue;

                processedKeys.add(key);
                Map<String, String> values = new LinkedHashMap<>();
                Set<String> distinctValues = new HashSet<>();

                for (Product p : products) {
                    String val = productSpecsMap.get(p.getProductId()).getOrDefault(key, "—");
                    values.put(String.valueOf(p.getProductId()), val);
                    distinctValues.add(val.trim());
                }

                boolean isDiff = distinctValues.size() > 1;

                rows.add(ComparisonAttributeRowDto.builder()
                        .key(key)
                        .label(LABEL_MAP.getOrDefault(key, key))
                        .values(values)
                        .isDifferent(isDiff)
                        .build());
            }

            if (!rows.isEmpty()) {
                attributeGroups.add(ComparisonGroupDto.builder()
                        .groupName(groupName)
                        .attributes(rows)
                        .build());
            }
        }

        // Add any remaining keys to "Thông số bổ sung"
        List<ComparisonAttributeRowDto> extraRows = new ArrayList<>();
        for (Product p : products) {
            Map<String, String> sMap = productSpecsMap.get(p.getProductId());
            for (String k : sMap.keySet()) {
                if (!processedKeys.contains(k)) {
                    processedKeys.add(k);
                    Map<String, String> values = new LinkedHashMap<>();
                    Set<String> distinctValues = new HashSet<>();
                    for (Product prod : products) {
                        String val = productSpecsMap.get(prod.getProductId()).getOrDefault(k, "—");
                        values.put(String.valueOf(prod.getProductId()), val);
                        distinctValues.add(val.trim());
                    }
                    extraRows.add(ComparisonAttributeRowDto.builder()
                            .key(k)
                            .label(LABEL_MAP.getOrDefault(k, k.substring(0, 1).toUpperCase() + k.substring(1)))
                            .values(values)
                            .isDifferent(distinctValues.size() > 1)
                            .build());
                }
            }
        }

        if (!extraRows.isEmpty()) {
            attributeGroups.add(ComparisonGroupDto.builder()
                    .groupName("Thông số bổ sung")
                    .attributes(extraRows)
                    .build());
        }

        return ResponseEntity.ok(ComparisonResponseDto.builder()
                .products(productDtos)
                .attributeGroups(attributeGroups)
                .build());
    }
}
