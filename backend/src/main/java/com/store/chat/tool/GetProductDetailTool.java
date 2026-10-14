package com.store.chat.tool;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.dto.ProductDetailDto;
import com.store.dto.chat.ProductCardDto;
import com.store.repository.InventoryRepository;
import com.store.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class GetProductDetailTool implements ChatTool {

    private final ProductService productService;
    private final InventoryRepository inventoryRepository;
    private final ObjectMapper objectMapper;

    @Override
    public String getName() {
        return "get_product_detail";
    }

    @Override
    public String getDescription() {
        return "Lấy thông tin chi tiết đầy đủ của sản phẩm bao gồm cấu hình, thông số kỹ thuật, các phiên bản màu sắc/dung lượng và giá niêm yết dựa trên đường dẫn slug.";
    }

    @Override
    public Map<String, Object> getParameterSchema() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "OBJECT");

        Map<String, Object> properties = new LinkedHashMap<>();
        Map<String, Object> slugProp = new LinkedHashMap<>();
        slugProp.put("type", "STRING");
        slugProp.put("description", "Đường dẫn slug duy nhất của sản phẩm (ví dụ: iphone-15-pro-max, macbook-air-13-m3)");
        properties.put("slug", slugProp);

        schema.put("properties", properties);
        schema.put("required", List.of("slug"));
        return schema;
    }

    @Override
    public ToolExecutionResult execute(Map<String, Object> args, ChatContext ctx) {
        if (args == null || !args.containsKey("slug") || args.get("slug") == null) {
            return ToolExecutionResult.of("{\"error\": \"Tham số slug không được để trống\"}");
        }

        String slug = String.valueOf(args.get("slug")).trim();
        if (slug.length() > 150) {
            slug = slug.substring(0, 150);
        }

        try {
            ProductDetailDto detail = productService.getProductDetailBySlug(slug);
            if (detail == null) {
                return ToolExecutionResult.of("{\"error\": \"Không tìm thấy sản phẩm với slug: " + slug + "\"}");
            }

            boolean anyInStock = false;
            List<Map<String, Object>> variantList = new ArrayList<>();
            BigDecimal firstSalePrice = null;

            if (detail.getVariants() != null) {
                for (ProductDetailDto.VariantDetailDto v : detail.getVariants()) {
                    int stock = 0;
                    if (v.getId() != null) {
                        Integer avail = inventoryRepository.getAvailableStockByVariantId(v.getId());
                        if (avail != null) stock = avail;
                    }
                    if (stock > 0) anyInStock = true;

                    if (firstSalePrice == null && v.getPrice() != null) {
                        firstSalePrice = v.getPrice();
                    }

                    Map<String, Object> vMap = new LinkedHashMap<>();
                    vMap.put("variantId", v.getId());
                    vMap.put("sku", v.getSku());
                    vMap.put("attributes", v.getAttributes());
                    vMap.put("price", v.getPrice());
                    vMap.put("inStock", stock > 0);
                    vMap.put("availableStock", stock);
                    variantList.add(vMap);
                }
            }

            ProductCardDto card = ProductCardDto.builder()
                    .id(detail.getId())
                    .slug(detail.getSlug())
                    .name(detail.getName())
                    .price(detail.getPrice())
                    .salePrice(firstSalePrice != null ? firstSalePrice : detail.getPrice())
                    .imageUrl(detail.getPrimaryImage())
                    .inStock(anyInStock)
                    .build();

            ctx.addProduct(card);

            Map<String, Object> output = new LinkedHashMap<>();
            output.put("id", detail.getId());
            output.put("name", detail.getName());
            output.put("slug", detail.getSlug());
            output.put("brand", detail.getBrand() != null ? detail.getBrand().getName() : detail.getBrandName());
            output.put("category", detail.getCategory() != null ? detail.getCategory().getName() : detail.getCategoryName());
            output.put("price", detail.getPrice());
            output.put("oldPrice", detail.getOldPrice());
            output.put("inStock", anyInStock);
            output.put("description", detail.getDescription());
            output.put("specs", detail.getSpecs());
            output.put("variants", variantList);

            String json = objectMapper.writeValueAsString(output);
            return ToolExecutionResult.of(json, List.of(card));
        } catch (com.store.exception.ResourceNotFoundException e) {
            return ToolExecutionResult.of("{\"error\": \"Không tìm thấy sản phẩm với slug: " + slug + "\"}");
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết sản phẩm {}: {}", slug, e.getMessage());
            return ToolExecutionResult.of("{\"error\": \"Không thể truy xuất thông tin chi tiết sản phẩm lúc này\"}");
        }
    }
}
