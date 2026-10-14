package com.store.chat.tool;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.dto.ProductPageResponseDto;
import com.store.dto.ProductResponseDto;
import com.store.dto.chat.ProductCardDto;
import com.store.entity.Brand;
import com.store.repository.BrandRepository;
import com.store.repository.InventoryRepository;
import com.store.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class SearchProductsTool implements ChatTool {

    private final ProductService productService;
    private final BrandRepository brandRepository;
    private final InventoryRepository inventoryRepository;
    private final ObjectMapper objectMapper;

    @Override
    public String getName() {
        return "search_products";
    }

    @Override
    public String getDescription() {
        return "Tìm kiếm các sản phẩm đang kinh doanh theo từ khóa tên sản phẩm, thương hiệu (hãng) và khoảng giá (minPrice, maxPrice). Trả về tối đa 5 sản phẩm phù hợp nhất.";
    }

    @Override
    public Map<String, Object> getParameterSchema() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "OBJECT");

        Map<String, Object> properties = new LinkedHashMap<>();

        Map<String, Object> keywordProp = new LinkedHashMap<>();
        keywordProp.put("type", "STRING");
        keywordProp.put("description", "Từ khóa tìm kiếm sản phẩm (ví dụ: iPhone, MacBook, Tai nghe)");
        properties.put("keyword", keywordProp);

        Map<String, Object> brandProp = new LinkedHashMap<>();
        brandProp.put("type", "STRING");
        brandProp.put("description", "Tên hoặc slug thương hiệu (ví dụ: Apple, Samsung, Asus, HP)");
        properties.put("brand", brandProp);

        Map<String, Object> minPriceProp = new LinkedHashMap<>();
        minPriceProp.put("type", "NUMBER");
        minPriceProp.put("description", "Giá thấp nhất (VNĐ)");
        properties.put("minPrice", minPriceProp);

        Map<String, Object> maxPriceProp = new LinkedHashMap<>();
        maxPriceProp.put("type", "NUMBER");
        maxPriceProp.put("description", "Giá cao nhất (VNĐ)");
        properties.put("maxPrice", maxPriceProp);

        schema.put("properties", properties);
        schema.put("required", List.of("keyword"));
        return schema;
    }

    @Override
    public ToolExecutionResult execute(Map<String, Object> args, ChatContext ctx) {
        String keyword = extractString(args, "keyword", 100);
        String brandInput = extractString(args, "brand", 50);
        BigDecimal minPrice = extractBigDecimal(args, "minPrice");
        BigDecimal maxPrice = extractBigDecimal(args, "maxPrice");

        if (minPrice != null && minPrice.compareTo(BigDecimal.ZERO) < 0) {
            minPrice = BigDecimal.ZERO;
        }
        if (maxPrice != null && minPrice != null && maxPrice.compareTo(minPrice) < 0) {
            BigDecimal temp = minPrice;
            minPrice = maxPrice;
            maxPrice = temp;
        }

        String brandSlug = null;
        if (brandInput != null && !brandInput.isBlank()) {
            String cleanBrand = brandInput.trim().toLowerCase();
            Optional<Brand> bOpt = brandRepository.findBySlug(cleanBrand);
            if (bOpt.isEmpty()) {
                // Thử tìm theo tên
                List<Brand> allBrands = brandRepository.findAll();
                bOpt = allBrands.stream()
                        .filter(b -> b.getName() != null && b.getName().equalsIgnoreCase(cleanBrand))
                        .findFirst();
            }
            if (bOpt.isPresent()) {
                brandSlug = bOpt.get().getSlug();
            } else {
                // Nếu không thấy brand slug, gộp brand vào keyword
                if (keyword == null || keyword.isBlank()) {
                    keyword = brandInput;
                } else if (!keyword.toLowerCase().contains(cleanBrand)) {
                    keyword = keyword + " " + brandInput;
                }
            }
        }

        ProductPageResponseDto page = productService.getProducts(
                null,
                null,
                null,
                brandSlug,
                keyword,
                null,
                null,
                minPrice,
                maxPrice,
                1,
                5,
                5,
                true // chỉ sản phẩm active
        );

        List<ProductResponseDto> items = page != null && page.getItems() != null ? page.getItems() : Collections.emptyList();
        if (items.size() > 5) {
            items = items.subList(0, 5);
        }

        List<ProductCardDto> productCards = new ArrayList<>();
        List<Map<String, Object>> llmSummaries = new ArrayList<>();

        for (ProductResponseDto p : items) {
            boolean inStock = calculateInStock(p);

            BigDecimal salePrice = null;
            if (p.getVariants() != null && !p.getVariants().isEmpty()) {
                salePrice = p.getVariants().get(0).getSalePrice();
            }

            ProductCardDto card = ProductCardDto.builder()
                    .id(p.getId())
                    .slug(p.getSlug())
                    .name(p.getName())
                    .price(p.getPrice())
                    .salePrice(salePrice != null ? salePrice : p.getPrice())
                    .imageUrl(p.getPrimaryImage())
                    .inStock(inStock)
                    .build();

            productCards.add(card);
            ctx.addProduct(card);

            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("id", p.getId());
            summary.put("name", p.getName());
            summary.put("slug", p.getSlug());
            summary.put("brand", p.getBrandName());
            summary.put("category", p.getCategoryName());
            summary.put("price", p.getPrice());
            summary.put("salePrice", card.getSalePrice());
            summary.put("inStock", inStock);
            summary.put("description", p.getDescription());
            llmSummaries.add(summary);
        }

        try {
            String jsonOutput = objectMapper.writeValueAsString(Map.of(
                    "count", llmSummaries.size(),
                    "products", llmSummaries
            ));
            return ToolExecutionResult.of(jsonOutput, productCards);
        } catch (Exception e) {
            log.error("Lỗi serialize kết quả search_products: {}", e.getMessage());
            return ToolExecutionResult.of("{\"count\": 0, \"products\": []}", Collections.emptyList());
        }
    }

    private boolean calculateInStock(ProductResponseDto p) {
        if (p.getVariants() == null || p.getVariants().isEmpty()) {
            return false;
        }
        for (ProductResponseDto.VariantDto v : p.getVariants()) {
            if (v.getVariantId() != null) {
                Integer avail = inventoryRepository.getAvailableStockByVariantId(v.getVariantId());
                if (avail != null && avail > 0) {
                    return true;
                }
            }
        }
        return false;
    }

    private String extractString(Map<String, Object> args, String key, int maxLen) {
        if (args == null || !args.containsKey(key) || args.get(key) == null) {
            return null;
        }
        String val = String.valueOf(args.get(key)).trim();
        if (val.length() > maxLen) {
            val = val.substring(0, maxLen);
        }
        return val.isEmpty() ? null : val;
    }

    private BigDecimal extractBigDecimal(Map<String, Object> args, String key) {
        if (args == null || !args.containsKey(key) || args.get(key) == null) {
            return null;
        }
        try {
            return new BigDecimal(String.valueOf(args.get(key)).trim());
        } catch (Exception e) {
            return null;
        }
    }
}
