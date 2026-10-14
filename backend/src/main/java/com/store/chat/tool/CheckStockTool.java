package com.store.chat.tool;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.entity.Inventory;
import com.store.entity.Product;
import com.store.entity.ProductVariant;
import com.store.repository.InventoryRepository;
import com.store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class CheckStockTool implements ChatTool {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final ObjectMapper objectMapper;

    @Override
    public String getName() {
        return "check_stock";
    }

    @Override
    public String getDescription() {
        return "Kiểm tra số lượng tồn kho khả dụng thực tế của sản phẩm theo ID (tồn kho khả dụng = tổng số lượng trừ đi số lượng đang được giữ chỗ/reserve).";
    }

    @Override
    public Map<String, Object> getParameterSchema() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "OBJECT");

        Map<String, Object> properties = new LinkedHashMap<>();
        Map<String, Object> idProp = new LinkedHashMap<>();
        idProp.put("type", "INTEGER");
        idProp.put("description", "ID của sản phẩm cần kiểm tra tồn kho (ví dụ: 1)");
        properties.put("productId", idProp);

        schema.put("properties", properties);
        schema.put("required", List.of("productId"));
        return schema;
    }

    @Override
    public ToolExecutionResult execute(Map<String, Object> args, ChatContext ctx) {
        Long productId = extractLong(args, "productId");
        if (productId == null || productId <= 0) {
            return ToolExecutionResult.of("{\"error\": \"ID sản phẩm không hợp lệ\"}");
        }

        Optional<Product> prodOpt = productRepository.findById(productId);
        if (prodOpt.isEmpty() || !Boolean.TRUE.equals(prodOpt.get().getIsActive())) {
            return ToolExecutionResult.of("{\"error\": \"Không tìm thấy sản phẩm hoặc sản phẩm đã ngừng kinh doanh với ID: " + productId + "\"}");
        }

        Product product = prodOpt.get();
        List<ProductVariant> variants = product.getVariants() != null ? product.getVariants() : Collections.emptyList();

        int totalAvailableStock = 0;
        Map<String, Integer> stockByWarehouse = new LinkedHashMap<>();
        List<Map<String, Object>> variantStockList = new ArrayList<>();

        for (ProductVariant v : variants) {
            if (!Boolean.TRUE.equals(v.getIsActive())) {
                continue;
            }

            List<Inventory> invList = inventoryRepository.findByIdVariantId(v.getVariantId());
            int variantAvailable = 0;

            for (Inventory inv : invList) {
                int avail = Math.max(0, (inv.getQuantity() != null ? inv.getQuantity() : 0)
                        - (inv.getReservedQty() != null ? inv.getReservedQty() : 0));
                variantAvailable += avail;

                String wName = (inv.getWarehouse() != null && inv.getWarehouse().getName() != null)
                        ? inv.getWarehouse().getName()
                        : "Kho mặc định";

                stockByWarehouse.put(wName, stockByWarehouse.getOrDefault(wName, 0) + avail);
            }

            totalAvailableStock += variantAvailable;

            Map<String, Object> vStock = new LinkedHashMap<>();
            vStock.put("sku", v.getSku());
            vStock.put("attributes", v.getAttributes());
            vStock.put("availableQuantity", variantAvailable);
            vStock.put("inStock", variantAvailable > 0);
            variantStockList.add(vStock);
        }

        List<Map<String, Object>> warehouseDetails = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : stockByWarehouse.entrySet()) {
            warehouseDetails.add(Map.of(
                    "warehouseName", entry.getKey(),
                    "availableQuantity", entry.getValue()
            ));
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("productId", product.getProductId());
        result.put("productName", product.getName());
        result.put("inStock", totalAvailableStock > 0);
        result.put("totalAvailableQuantity", totalAvailableStock);
        result.put("warehouses", warehouseDetails);
        result.put("variants", variantStockList);

        try {
            return ToolExecutionResult.of(objectMapper.writeValueAsString(result));
        } catch (Exception e) {
            log.error("Lỗi serialize check_stock: {}", e.getMessage());
            return ToolExecutionResult.of("{\"error\": \"Không thể kiểm tra tồn kho lúc này\"}");
        }
    }

    private Long extractLong(Map<String, Object> args, String key) {
        if (args == null || !args.containsKey(key) || args.get(key) == null) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(args.get(key)).trim());
        } catch (Exception e) {
            return null;
        }
    }
}
