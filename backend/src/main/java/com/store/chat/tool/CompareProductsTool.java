package com.store.chat.tool;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.dto.chat.ProductCardDto;
import com.store.entity.Product;
import com.store.entity.ProductImage;
import com.store.entity.ProductVariant;
import com.store.repository.InventoryRepository;
import com.store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class CompareProductsTool implements ChatTool {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final ObjectMapper objectMapper;

    private static final Map<String, String[]> GROUP_DEFINITIONS = new LinkedHashMap<>();
    private static final Map<String, String> LABEL_MAP = new HashMap<>();

    static {
        GROUP_DEFINITIONS.put("Màn hình", new String[]{"screen", "display"});
        GROUP_DEFINITIONS.put("Hiệu năng & Phần cứng", new String[]{"chip", "cpu", "gpu", "ram", "storage", "os", "chip_ai"});
        GROUP_DEFINITIONS.put("Camera & Quay phim", new String[]{"camera_rear", "camera_front"});
        GROUP_DEFINITIONS.put("Pin & Sạc", new String[]{"battery"});
        GROUP_DEFINITIONS.put("Kết nối & Thiết kế", new String[]{"ports", "material", "pen"});

        LABEL_MAP.put("screen", "Màn hình");
        LABEL_MAP.put("display", "Độ phân giải / Tần số quét");
        LABEL_MAP.put("chip", "Vi xử lý (CPU)");
        LABEL_MAP.put("cpu", "Vi xử lý (CPU)");
        LABEL_MAP.put("gpu", "Card đồ họa (GPU)");
        LABEL_MAP.put("ram", "RAM");
        LABEL_MAP.put("storage", "Bộ nhớ trong");
        LABEL_MAP.put("os", "Hệ điều hành");
        LABEL_MAP.put("chip_ai", "AI / NPU");
        LABEL_MAP.put("camera_rear", "Camera sau");
        LABEL_MAP.put("camera_front", "Camera trước");
        LABEL_MAP.put("battery", "Dung lượng pin & sạc");
        LABEL_MAP.put("ports", "Cổng kết nối");
        LABEL_MAP.put("material", "Chất liệu");
        LABEL_MAP.put("pen", "Bút cảm ứng");
    }

    @Override
    public String getName() {
        return "compare_products";
    }

    @Override
    public String getDescription() {
        return "So sánh thông số kỹ thuật, cấu hình và giá bán giữa 2 hoặc 3 sản phẩm theo danh sách ID sản phẩm (ids).";
    }

    @Override
    public Map<String, Object> getParameterSchema() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "OBJECT");

        Map<String, Object> properties = new LinkedHashMap<>();
        Map<String, Object> idsProp = new LinkedHashMap<>();
        idsProp.put("type", "ARRAY");
        idsProp.put("description", "Danh sách từ 2 đến 3 ID sản phẩm cần so sánh (ví dụ: [1, 2])");
        Map<String, Object> itemsSchema = new LinkedHashMap<>();
        itemsSchema.put("type", "INTEGER");
        idsProp.put("items", itemsSchema);
        properties.put("ids", idsProp);

        schema.put("properties", properties);
        schema.put("required", List.of("ids"));
        return schema;
    }

    @Override
    public ToolExecutionResult execute(Map<String, Object> args, ChatContext ctx) {
        List<Long> productIds = extractIds(args);
        if (productIds == null || productIds.size() < 2 || productIds.size() > 3) {
            return ToolExecutionResult.of("{\"error\": \"Vui lòng cung cấp chính xác từ 2 đến 3 ID sản phẩm để so sánh.\"}");
        }

        List<Product> products = new ArrayList<>();
        for (Long id : productIds) {
            productRepository.findById(id).ifPresent(p -> {
                if (Boolean.TRUE.equals(p.getIsActive())) {
                    products.add(p);
                }
            });
        }

        if (products.size() < 2) {
            return ToolExecutionResult.of("{\"error\": \"Không tìm thấy đủ tối thiểu 2 sản phẩm hợp lệ đang kinh doanh để so sánh.\"}");
        }

        List<ProductCardDto> productCards = new ArrayList<>();
        List<Map<String, Object>> productSummaries = new ArrayList<>();
        Map<Long, Map<String, String>> specsByProduct = new HashMap<>();

        for (Product p : products) {
            String imgUrl = null;
            if (p.getImages() != null && !p.getImages().isEmpty()) {
                imgUrl = p.getImages().stream()
                        .filter(i -> Boolean.TRUE.equals(i.getIsPrimary()))
                        .map(ProductImage::getUrl)
                        .findFirst()
                        .orElse(p.getImages().get(0).getUrl());
            }

            BigDecimal minPrice = null;
            BigDecimal salePrice = null;
            boolean inStock = false;
            if (p.getVariants() != null && !p.getVariants().isEmpty()) {
                for (ProductVariant v : p.getVariants()) {
                    if (v.getSalePrice() != null) {
                        if (minPrice == null || v.getSalePrice().compareTo(minPrice) < 0) minPrice = v.getSalePrice();
                        if (salePrice == null) salePrice = v.getSalePrice();
                    }
                    if (v.getVariantId() != null) {
                        Integer avail = inventoryRepository.getAvailableStockByVariantId(v.getVariantId());
                        if (avail != null && avail > 0) inStock = true;
                    }
                }
            }
            BigDecimal finalPrice = minPrice != null ? minPrice : BigDecimal.ZERO;

            ProductCardDto card = ProductCardDto.builder()
                    .id(p.getProductId())
                    .slug(p.getSlug())
                    .name(p.getName())
                    .price(finalPrice)
                    .salePrice(salePrice != null ? salePrice : finalPrice)
                    .imageUrl(imgUrl)
                    .inStock(inStock)
                    .build();

            productCards.add(card);
            ctx.addProduct(card);

            Map<String, Object> pSummary = new LinkedHashMap<>();
            pSummary.put("id", p.getProductId());
            pSummary.put("name", p.getName());
            pSummary.put("brand", p.getBrand() != null ? p.getBrand().getName() : null);
            pSummary.put("price", finalPrice);
            pSummary.put("salePrice", card.getSalePrice());
            pSummary.put("inStock", inStock);
            productSummaries.add(pSummary);

            // Parse specs
            Map<String, String> rawSpecs = new HashMap<>();
            if (p.getSpecs() != null) {
                for (Map.Entry<String, Object> entry : p.getSpecs().entrySet()) {
                    rawSpecs.put(entry.getKey(), String.valueOf(entry.getValue()));
                }
            }
            specsByProduct.put(p.getProductId(), rawSpecs);
        }

        // Tạo bảng so sánh theo tiêu chí
        List<Map<String, Object>> comparisonSections = new ArrayList<>();
        for (Map.Entry<String, String[]> entry : GROUP_DEFINITIONS.entrySet()) {
            String groupName = entry.getKey();
            String[] keys = entry.getValue();

            List<Map<String, Object>> attributes = new ArrayList<>();
            for (String k : keys) {
                Map<String, String> valuesByProduct = new LinkedHashMap<>();
                boolean hasValue = false;
                for (Product p : products) {
                    String val = specsByProduct.getOrDefault(p.getProductId(), Collections.emptyMap()).get(k);
                    valuesByProduct.put(p.getName(), val != null ? val : "-");
                    if (val != null) hasValue = true;
                }
                if (hasValue) {
                    Map<String, Object> attr = new LinkedHashMap<>();
                    attr.put("label", LABEL_MAP.getOrDefault(k, k));
                    attr.put("values", valuesByProduct);
                    attributes.add(attr);
                }
            }
            if (!attributes.isEmpty()) {
                Map<String, Object> section = new LinkedHashMap<>();
                section.put("group", groupName);
                section.put("attributes", attributes);
                comparisonSections.add(section);
            }
        }

        try {
            String json = objectMapper.writeValueAsString(Map.of(
                    "products", productSummaries,
                    "comparison", comparisonSections
            ));
            return ToolExecutionResult.of(json, productCards);
        } catch (Exception e) {
            log.error("Lỗi khi serialize kết quả so sánh: {}", e.getMessage());
            return ToolExecutionResult.of("{\"error\": \"Không thể tạo kết quả so sánh lúc này\"}");
        }
    }

    @SuppressWarnings("unchecked")
    private List<Long> extractIds(Map<String, Object> args) {
        if (args == null || !args.containsKey("ids") || args.get("ids") == null) {
            return null;
        }
        Object obj = args.get("ids");
        List<Long> result = new ArrayList<>();
        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            for (Object item : list) {
                try {
                    result.add(Long.valueOf(String.valueOf(item).trim()));
                } catch (Exception ignored) {
                }
            }
        }
        return result.stream().distinct().collect(Collectors.toList());
    }
}
