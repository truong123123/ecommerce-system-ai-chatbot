package com.store.chat.tool;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.dto.ProductPageResponseDto;
import com.store.dto.ProductResponseDto;
import com.store.dto.chat.ProductCardDto;
import com.store.entity.Brand;
import com.store.entity.Category;
import com.store.repository.BrandRepository;
import com.store.repository.CategoryRepository;
import com.store.repository.InventoryRepository;
import com.store.service.ProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Slf4j
public class SearchProductsTool implements ChatTool {

    private final ProductService productService;
    private final BrandRepository brandRepository;
    private final InventoryRepository inventoryRepository;
    private final ObjectMapper objectMapper;
    private final CategoryRepository categoryRepository;

    public SearchProductsTool(
            ProductService productService,
            BrandRepository brandRepository,
            InventoryRepository inventoryRepository,
            ObjectMapper objectMapper
    ) {
        this(productService, brandRepository, inventoryRepository, objectMapper, null);
    }

    @Autowired
    public SearchProductsTool(
            ProductService productService,
            BrandRepository brandRepository,
            InventoryRepository inventoryRepository,
            ObjectMapper objectMapper,
            @Autowired(required = false) CategoryRepository categoryRepository
    ) {
        this.productService = productService;
        this.brandRepository = brandRepository;
        this.inventoryRepository = inventoryRepository;
        this.objectMapper = objectMapper;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public String getName() {
        return "search_products";
    }

    @Override
    public String getDescription() {
        return "Tìm kiếm các sản phẩm đang kinh doanh theo từ khóa tên sản phẩm, ngành hàng/danh mục (category), thương hiệu (brand) và khoảng giá (minPrice, maxPrice). Trả về tối đa 5 sản phẩm phù hợp nhất.";
    }

    @Override
    public Map<String, Object> getParameterSchema() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "OBJECT");

        Map<String, Object> properties = new LinkedHashMap<>();

        Map<String, Object> keywordProp = new LinkedHashMap<>();
        keywordProp.put("type", "STRING");
        keywordProp.put("description", "Từ khóa tìm kiếm sản phẩm hoặc dòng máy (ví dụ: iPhone, Samsung Galaxy, MacBook, Tai nghe)");
        properties.put("keyword", keywordProp);

        Map<String, Object> categoryProp = new LinkedHashMap<>();
        categoryProp.put("type", "STRING");
        categoryProp.put("description", "Tên hoặc slug ngành hàng/danh mục sản phẩm (ví dụ: dien-thoai, laptop, may-tinh-bang, tai-nghe, dong-ho, tivi)");
        properties.put("category", categoryProp);

        Map<String, Object> brandProp = new LinkedHashMap<>();
        brandProp.put("type", "STRING");
        brandProp.put("description", "Tên hoặc slug thương hiệu sản phẩm (ví dụ: Apple, Samsung, OPPO, Asus, HP, Sony)");
        properties.put("brand", brandProp);

        Map<String, Object> minPriceProp = new LinkedHashMap<>();
        minPriceProp.put("type", "NUMBER");
        minPriceProp.put("description", "Mức giá thấp nhất (VNĐ), ví dụ: 5000000");
        properties.put("minPrice", minPriceProp);

        Map<String, Object> maxPriceProp = new LinkedHashMap<>();
        maxPriceProp.put("type", "NUMBER");
        maxPriceProp.put("description", "Mức giá cao nhất (VNĐ), ví dụ: 20000000");
        properties.put("maxPrice", maxPriceProp);

        schema.put("properties", properties);
        schema.put("required", Collections.emptyList());
        return schema;
    }

    @Override
    public ToolExecutionResult execute(Map<String, Object> args, ChatContext ctx) {
        String keyword = extractString(args, "keyword", 100);
        String categoryInput = extractString(args, "category", 50);
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

        // 1. Tự động trích xuất mức giá từ từ khóa nếu keyword có chứa cụm ngôn ngữ tự nhiên (ví dụ: "dưới 20 triệu")
        if (keyword != null && !keyword.isBlank()) {
            String lowerKw = keyword.toLowerCase();
            if (maxPrice == null) {
                Matcher m = Pattern.compile("dưới\\s+(\\d+(?:[.,]\\d+)?)\\s*(triệu|tr|k)?", Pattern.CASE_INSENSITIVE).matcher(lowerKw);
                if (m.find()) {
                    try {
                        double val = Double.parseDouble(m.group(1).replace(",", "."));
                        String unit = m.group(2) != null ? m.group(2).toLowerCase() : "triệu";
                        if ("k".equals(unit)) {
                            maxPrice = BigDecimal.valueOf((long) (val * 1_000));
                        } else {
                            maxPrice = BigDecimal.valueOf((long) (val * 1_000_000));
                        }
                    } catch (Exception ignored) {
                    }
                }
            }

            // Loại bỏ các cụm từ chỉ giá khỏi keyword để không làm hỏng câu truy vấn tên/mô tả
            keyword = keyword.replaceAll("(?i)\\b(dưới|trên|tầm|khoảng|mức giá|giá|phân khúc)\\s*\\d+(?:[.,]\\d+)?\\s*(triệu|tr|k|đ|vnd|vnđ)?\\b", "")
                    .replaceAll("(?i)\\b(dưới|trên|tầm|khoảng)\\s*\\d+\\b", "")
                    .trim();
            if (keyword.isEmpty()) {
                keyword = null;
            }
        }

        // 2. Nhận diện danh mục ngành hàng từ categoryInput hoặc keyword
        String categorySlug = null;
        if (categoryInput != null && !categoryInput.isBlank()) {
            categorySlug = resolveCategorySlug(categoryInput);
        }
        if (categorySlug == null && keyword != null) {
            String detectedCat = resolveCategorySlug(keyword);
            if (detectedCat != null) {
                categorySlug = detectedCat;
                // Nếu keyword chỉ đơn thuần là tên ngành hàng (ví dụ "điện thoại"), xóa keyword để query lấy toàn bộ sản phẩm ngành đó
                if (isPureCategoryWord(keyword)) {
                    keyword = null;
                }
            }
        }

        // 3. Nhận diện thương hiệu từ brandInput hoặc keyword
        String brandSlug = null;
        if (brandInput != null && !brandInput.isBlank()) {
            String cleanBrand = brandInput.trim().toLowerCase();
            Optional<Brand> bOpt = brandRepository.findBySlug(cleanBrand);
            if (bOpt.isEmpty()) {
                List<Brand> allBrands = brandRepository.findAll();
                bOpt = allBrands.stream()
                        .filter(b -> b.getName() != null && b.getName().equalsIgnoreCase(cleanBrand))
                        .findFirst();
            }
            if (bOpt.isPresent()) {
                brandSlug = bOpt.get().getSlug();
            } else {
                if (keyword == null || keyword.isBlank()) {
                    keyword = brandInput;
                } else if (!keyword.toLowerCase().contains(cleanBrand)) {
                    keyword = keyword + " " + brandInput;
                }
            }
        }

        // 4. Thực hiện tìm kiếm sản phẩm chính thức
        ProductPageResponseDto page = productService.getProducts(
                null,
                categorySlug,
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

        List<ProductResponseDto> items = page != null && page.getItems() != null ? new ArrayList<>(page.getItems()) : new ArrayList<>();
        String advisoryNote = null;

        // 5. Nếu không tìm thấy sản phẩm nào và có ràng buộc maxPrice, chạy fallback tìm các sản phẩm gần nhất trong danh mục
        if (items.isEmpty() && maxPrice != null) {
            ProductPageResponseDto fallbackPage = productService.getProducts(
                    null,
                    categorySlug,
                    null,
                    brandSlug,
                    keyword,
                    null,
                    null,
                    null, // bỏ maxPrice
                    null,
                    1,
                    5,
                    5,
                    true
            );
            if (fallbackPage != null && fallbackPage.getItems() != null && !fallbackPage.getItems().isEmpty()) {
                items = new ArrayList<>(fallbackPage.getItems());
                advisoryNote = "Không tìm thấy sản phẩm nào có mức giá <= " + formatVnd(maxPrice) +
                        ". Cửa hàng hiện có các sản phẩm cùng nhóm/ngành hàng có giá gần nhất dưới đây. Bạn hãy nhiệt tình tư vấn các mẫu này và hướng dẫn khách hàng chương trình Trả góp 0% lãi suất hoặc chính sách ưu đãi của cửa hàng.";
            }
        }

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
            summary.put("storeCommitments", List.of(
                    "⚡ Hỗ trợ trả góp 0% lãi suất qua thẻ hoặc công ty tài chính",
                    "🛡️ Bảo hành chính hãng 12 tháng tại các trung tâm ủy quyền",
                    "🔄 1 đổi 1 trong 30 ngày nếu phát sinh lỗi từ nhà sản xuất",
                    "🚚 Giao hàng hỏa tốc nội thành, miễn phí toàn quốc cho đơn từ 300K"
            ));
            llmSummaries.add(summary);
        }

        try {
            Map<String, Object> responseMap = new LinkedHashMap<>();
            responseMap.put("count", llmSummaries.size());
            responseMap.put("products", llmSummaries);
            if (advisoryNote != null) {
                responseMap.put("advisory", advisoryNote);
            }

            String jsonOutput = objectMapper.writeValueAsString(responseMap);
            return ToolExecutionResult.of(jsonOutput, productCards);
        } catch (Exception e) {
            log.error("Lỗi serialize kết quả search_products: {}", e.getMessage());
            return ToolExecutionResult.of("{\"count\": 0, \"products\": []}", Collections.emptyList());
        }
    }

    private String resolveCategorySlug(String input) {
        if (input == null || input.isBlank()) return null;
        String lower = input.trim().toLowerCase();
        String unaccented = removeDiacritics(lower).replace("-", " ").replace("_", " ");

        if (lower.contains("điện thoại") || unaccented.contains("dien thoai") || lower.contains("smartphone") || lower.equals("dt") || lower.equals("đt") || lower.contains("phone")) {
            return "dien-thoai";
        }
        if (lower.contains("máy tính bảng") || unaccented.contains("may tinh bang") || lower.contains("tablet") || lower.contains("ipad") || lower.equals("mtb")) {
            return "may-tinh-bang";
        }
        if (lower.contains("laptop") || unaccented.contains("may tinh xach tay") || lower.contains("macbook")) {
            return "laptop";
        }
        if (lower.contains("tai nghe") || unaccented.contains("tai nghe") || lower.contains("headphone") || lower.contains("airpods")) {
            return "tai-nghe";
        }
        if (lower.contains("đồng hồ") || unaccented.contains("dong ho") || lower.contains("smartwatch") || lower.contains("apple watch")) {
            return "dong-ho";
        }
        if (lower.contains("tivi") || unaccented.contains("ti vi") || lower.contains("smart tv")) {
            return "tivi";
        }
        if (categoryRepository != null) {
            Optional<Category> cOpt = categoryRepository.findBySlug(lower.replace(" ", "-"));
            if (cOpt.isPresent()) {
                return cOpt.get().getSlug();
            }
        }
        return null;
    }

    private boolean isPureCategoryWord(String kw) {
        if (kw == null) return false;
        String s = removeDiacritics(kw.trim().toLowerCase());
        return s.equals("dien thoai") || s.equals("dt") || s.equals("smartphone") || s.equals("phone")
                || s.equals("may tinh bang") || s.equals("tablet") || s.equals("mtb")
                || s.equals("laptop") || s.equals("tai nghe") || s.equals("dong ho") || s.equals("tivi");
    }

    private String removeDiacritics(String text) {
        if (text == null) return "";
        String normalized = java.text.Normalizer.normalize(text, java.text.Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "").replace("đ", "d").replace("Đ", "d");
    }

    private String formatVnd(BigDecimal amount) {
        if (amount == null) return "0₫";
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(new Locale("vi", "VN"));
        symbols.setGroupingSeparator('.');
        DecimalFormat df = new DecimalFormat("#,###", symbols);
        return df.format(amount) + "₫";
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
