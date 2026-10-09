package com.store.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.dto.*;
import com.store.entity.*;
import com.store.repository.*;
import com.store.service.CategoryService;
import com.store.service.ProductService;
import com.store.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final SeriesRepository seriesRepository;
    private final com.store.service.ReviewService reviewService;
    private final WarehouseRepository warehouseRepository;
    private final CategoryService categoryService;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getProducts(Integer categoryId, String categorySlug, Integer brandId, String keyword) {
        return getProducts(categoryId, categorySlug, brandId, keyword, null, null, null, null, null, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getProducts(
            Integer categoryId,
            String categorySlug,
            Integer brandId,
            String keyword,
            Boolean isHot,
            Boolean isNew,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer limit,
            Boolean activeOnly
    ) {
        ProductPageResponseDto pageDto = getProducts(
                categoryId, categorySlug, brandId, null, keyword, isHot, isNew, minPrice, maxPrice, null, null, limit, activeOnly
        );
        return pageDto.getItems();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductPageResponseDto getProducts(
            Integer categoryId,
            String categorySlug,
            Integer brandId,
            String brandSlug,
            String keyword,
            Boolean isHot,
            Boolean isNew,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer page,
            Integer size,
            Integer limit,
            Boolean activeOnly
    ) {
        List<Integer> categoryIds = null;
        if (categoryId != null) {
            categoryIds = categoryService.getCategoryAndDescendantIds(categoryId);
        } else if (categorySlug != null && !categorySlug.isBlank()) {
            Optional<Category> catOpt = categoryRepository.findBySlug(categorySlug.trim());
            if (catOpt.isPresent()) {
                categoryIds = categoryService.getCategoryAndDescendantIds(catOpt.get().getCategoryId());
            } else {
                return ProductPageResponseDto.builder()
                        .items(Collections.emptyList())
                        .totalElements(0)
                        .totalPages(0)
                        .currentPage(page != null ? page : 1)
                        .pageSize(size != null ? size : 20)
                        .build();
            }
        }

        // Kiểm tra brandSlug nếu có
        Integer resolvedBrandId = brandId;
        if (resolvedBrandId == null && brandSlug != null && !brandSlug.isBlank()) {
            Optional<Brand> brandOpt = brandRepository.findBySlug(brandSlug.trim());
            if (brandOpt.isPresent()) {
                resolvedBrandId = brandOpt.get().getBrandId();
            } else {
                return ProductPageResponseDto.builder()
                        .items(Collections.emptyList())
                        .totalElements(0)
                        .totalPages(0)
                        .currentPage(page != null ? page : 1)
                        .pageSize(size != null ? size : 20)
                        .build();
            }
        }

        Specification<Product> spec = ProductSpecification.filter(
                categoryIds,
                resolvedBrandId,
                brandSlug,
                keyword,
                isHot,
                isNew,
                minPrice,
                maxPrice,
                activeOnly
        );

        if (page != null && page > 0) {
            int pageSize = (size != null && size > 0) ? size : 20;
            Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Product> productPage = productRepository.findAll(spec, pageable);
            List<ProductResponseDto> items = productPage.getContent().stream()
                    .map(this::mapToResponseDto)
                    .collect(Collectors.toList());

            return ProductPageResponseDto.builder()
                    .items(items)
                    .totalElements(productPage.getTotalElements())
                    .totalPages(productPage.getTotalPages())
                    .currentPage(page)
                    .pageSize(pageSize)
                    .build();
        }

        List<Product> products;
        if (limit != null && limit > 0) {
            Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
            products = productRepository.findAll(spec, pageable).getContent();
        } else {
            products = productRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        List<ProductResponseDto> items = products.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        return ProductPageResponseDto.builder()
                .items(items)
                .totalElements(items.size())
                .totalPages(1)
                .currentPage(1)
                .pageSize(items.size())
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    public ProductDetailDto getProductDetailById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + id));
        return mapToDetailDto(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailDto getProductDetailBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với slug: " + slug));
        return mapToDetailDto(product);
    }

    @Override
    @Transactional
    public ProductResponseDto createProduct(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại: " + request.getCategoryId()));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId()).orElse(null);
        }

        Series series = null;
        if (request.getSeriesId() != null) {
            series = seriesRepository.findById(request.getSeriesId()).orElse(null);
        }

        Product product = Product.builder()
                .name(request.getName().trim())
                .slug(request.getSlug() != null ? request.getSlug().trim() : generateSlug(request.getName()))
                .modelCode(request.getModelCode())
                .description(request.getDescription())
                .category(category)
                .brand(brand)
                .series(series)
                .specs(request.getSpecs() != null ? request.getSpecs() : new HashMap<>())
                .isActive(true)
                .isHot(request.getIsHot() != null ? request.getIsHot() : false)
                .isNew(request.getIsNew() != null ? request.getIsNew() : false)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        Product saved = productRepository.save(product);

        // Lưu ảnh đại diện nếu có
        if (request.getImage() != null && !request.getImage().isBlank()) {
            ProductImage img = ProductImage.builder()
                    .product(saved)
                    .url(request.getImage().trim())
                    .isPrimary(true)
                    .sortOrder(0)
                    .build();
            saved.getImages().add(img);
            productRepository.save(saved);
        }

        // Tạo biến thể mặc định nếu có giá
        if (request.getPrice() != null && request.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            ProductVariant variant = ProductVariant.builder()
                    .product(saved)
                    .sku(request.getSku() != null ? request.getSku().trim() : "SKU-" + saved.getProductId())
                    .attributes(Collections.singletonMap("color", "Tiêu chuẩn"))
                    .costPrice(request.getCostPrice() != null ? request.getCostPrice() : request.getPrice())
                    .salePrice(request.getPrice())
                    .isActive(true)
                    .build();
            productVariantRepository.save(variant);
        }

        return mapToResponseDto(saved);
    }

    @Override
    @Transactional
    public ProductResponseDto updateProduct(Long id, UpdateProductRequest request) {
        Product prod = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            prod.setName(request.getName().trim());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại: " + request.getCategoryId()));
            prod.setCategory(category);
        }
        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId()).orElse(null);
            prod.setBrand(brand);
        }
        if (request.getDescription() != null) {
            prod.setDescription(request.getDescription().trim());
        }
        if (request.getIsActive() != null) {
            prod.setIsActive(request.getIsActive());
        }
        if (request.getIsHot() != null) {
            prod.setIsHot(request.getIsHot());
        }
        if (request.getIsNew() != null) {
            prod.setIsNew(request.getIsNew());
        }
        prod.setUpdatedAt(OffsetDateTime.now());

        if (request.getPrice() != null && request.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            if (prod.getVariants() != null && !prod.getVariants().isEmpty()) {
                for (ProductVariant v : prod.getVariants()) {
                    v.setSalePrice(request.getPrice());
                    if (request.getCostPrice() != null) {
                        v.setCostPrice(request.getCostPrice());
                    }
                    productVariantRepository.save(v);
                }
            }
        }
        if (request.getImage() != null && !request.getImage().isBlank()) {
            if (prod.getImages() != null && !prod.getImages().isEmpty()) {
                prod.getImages().get(0).setUrl(request.getImage().trim());
            } else {
                ProductImage img = ProductImage.builder()
                        .product(prod)
                        .url(request.getImage().trim())
                        .isPrimary(true)
                        .sortOrder(0)
                        .build();
                prod.getImages().add(img);
            }
        }
        Product saved = productRepository.save(prod);
        return mapToResponseDto(saved);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product prod = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại với ID: " + id));
        prod.setIsActive(false);
        productRepository.save(prod);
    }

    private ProductDetailDto mapToDetailDto(Product product) {
        BigDecimal minPrice = BigDecimal.ZERO;
        BigDecimal maxPrice = BigDecimal.ZERO;
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            minPrice = product.getVariants().stream()
                    .map(ProductVariant::getSalePrice)
                    .min(Comparator.naturalOrder())
                    .orElse(BigDecimal.ZERO);
            maxPrice = product.getVariants().stream()
                    .map(ProductVariant::getSalePrice)
                    .max(Comparator.naturalOrder())
                    .orElse(BigDecimal.ZERO);
        }

        // Original price based on cost_price if available, otherwise minPrice (no fake 1.1x multiplier)
        BigDecimal oldPrice = minPrice;
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            BigDecimal maxCost = product.getVariants().stream()
                    .map(ProductVariant::getCostPrice)
                    .filter(Objects::nonNull)
                    .max(Comparator.naturalOrder())
                    .orElse(minPrice);
            if (maxCost.compareTo(minPrice) > 0) {
                oldPrice = maxCost;
            }
        }

        // Ratings & Reviews via ReviewService (chỉ lấy review APPROVED)
        com.store.dto.review.ReviewSummaryDto summary = reviewService.getReviewSummary(product.getProductId());
        Double avgRating = summary.getAverageRating();
        Long reviewCount = summary.getTotalReviews();

        List<ProductDetailDto.ReviewDetailDto> reviewDtos = new ArrayList<>();
        List<com.store.dto.review.ReviewDto> reviews = reviewService.getReviewsByProduct(product.getProductId());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        for (com.store.dto.review.ReviewDto r : reviews) {
            reviewDtos.add(ProductDetailDto.ReviewDetailDto.builder()
                    .id(r.getReviewId())
                    .author(r.getCustomerName() != null ? r.getCustomerName() : "Khách hàng")
                    .rating(r.getRating())
                    .comment(r.getComment())
                    .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().format(formatter) : "")
                    .build());
        }

        Map<Integer, Long> breakdown = summary.getRatingBreakdown();
        int star5 = breakdown != null ? breakdown.getOrDefault(5, 0L).intValue() : 0;
        int star4 = breakdown != null ? breakdown.getOrDefault(4, 0L).intValue() : 0;
        int star3 = breakdown != null ? breakdown.getOrDefault(3, 0L).intValue() : 0;
        int star2 = breakdown != null ? breakdown.getOrDefault(2, 0L).intValue() : 0;
        int star1 = breakdown != null ? breakdown.getOrDefault(1, 0L).intValue() : 0;
        long totalRev = summary.getTotalReviews();

        ProductDetailDto.ReviewBreakdownDto breakdownDto = ProductDetailDto.ReviewBreakdownDto.builder()
                .star5Count(star5).star5Pct(totalRev > 0 ? (int) Math.round((star5 * 100.0) / totalRev) : 0)
                .star4Count(star4).star4Pct(totalRev > 0 ? (int) Math.round((star4 * 100.0) / totalRev) : 0)
                .star3Count(star3).star3Pct(totalRev > 0 ? (int) Math.round((star3 * 100.0) / totalRev) : 0)
                .star2Count(star2).star2Pct(totalRev > 0 ? (int) Math.round((star2 * 100.0) / totalRev) : 0)
                .star1Count(star1).star1Pct(totalRev > 0 ? (int) Math.round((star1 * 100.0) / totalRev) : 0)
                .build();

        // Variants directly from product_variants
        List<ProductDetailDto.VariantDetailDto> variantDtos = new ArrayList<>();
        Long primaryVariantId = null;
        if (product.getVariants() != null) {
            for (ProductVariant v : product.getVariants()) {
                if (primaryVariantId == null) primaryVariantId = v.getVariantId();
                String colorName = "Mặc định";
                if (v.getAttributes() != null) {
                    try {
                        Map<String, Object> map = objectMapper.convertValue(v.getAttributes(), Map.class);
                        if (map.containsKey("color")) {
                            colorName = String.valueOf(map.get("color"));
                        }
                    } catch (Exception ignored) {}
                }

                BigDecimal vOldPrice = v.getCostPrice() != null && v.getCostPrice().compareTo(v.getSalePrice()) > 0
                        ? v.getCostPrice()
                        : v.getSalePrice();

                variantDtos.add(ProductDetailDto.VariantDetailDto.builder()
                        .id(v.getVariantId())
                        .sku(v.getSku())
                        .color(colorName)
                        .price(v.getSalePrice())
                        .oldPrice(vOldPrice)
                        .attributes(v.getAttributes())
                        .stock(0) // Will be populated from inventory if available
                        .isActive(v.getIsActive())
                        .build());
            }
        }

        // Images directly from product_images
        List<ProductDetailDto.ImageDetailDto> imageDtos = new ArrayList<>();
        if (product.getImages() != null) {
            for (ProductImage img : product.getImages()) {
                imageDtos.add(ProductDetailDto.ImageDetailDto.builder()
                        .id(img.getImageId())
                        .url(img.getUrl())
                        .isPrimary(img.getIsPrimary())
                        .sortOrder(img.getSortOrder())
                        .type("IMAGE")
                        .build());
            }
        }

        // Stores & Inventory from PostgreSQL view `v_store_availability`
        // NO fake availableQty = 5 fallback. If 0 or not stocked, store is not listed or has 0 qty.
        List<ProductDetailDto.StoreAvailabilityDto> storeDtos = new ArrayList<>();
        try {
            if (primaryVariantId != null) {
                storeDtos = jdbcTemplate.query(
                        "SELECT warehouse_id, store_name, address, province, district, phone, available_qty " +
                        "FROM v_store_availability WHERE variant_id = ? AND available_qty > 0 ORDER BY available_qty DESC",
                        (rs, rowNum) -> ProductDetailDto.StoreAvailabilityDto.builder()
                                .id(rs.getInt("warehouse_id"))
                                .name(rs.getString("store_name"))
                                .address(rs.getString("address"))
                                .province(rs.getString("province"))
                                .district(rs.getString("district"))
                                .phone(rs.getString("phone"))
                                .availableQty(rs.getInt("available_qty"))
                                .build(),
                        primaryVariantId
                );
            }
        } catch (Exception e) {
            log.warn("Lỗi khi truy vấn store availability: {}", e.getMessage());
        }

        // Commitments from PostgreSQL table `product_commitments`
        List<ProductDetailDto.CommitmentItemDto> commitmentDtos = new ArrayList<>();
        try {
            commitmentDtos = jdbcTemplate.query(
                    "SELECT commitment_id, title, content FROM product_commitments WHERE is_active = true ORDER BY sort_order ASC",
                    (rs, rowNum) -> ProductDetailDto.CommitmentItemDto.builder()
                            .id(rs.getInt("commitment_id"))
                            .title(rs.getString("title"))
                            .content(rs.getString("content"))
                            .build()
            );
        } catch (Exception e) {
            log.warn("Lỗi khi truy vấn commitments: {}", e.getMessage());
        }

        // Warranty Plans from PostgreSQL table `warranty_plans`
        List<ProductDetailDto.WarrantyPlanDto> warrantyDtos = new ArrayList<>();
        try {
            warrantyDtos = jdbcTemplate.query(
                    "SELECT plan_id, name, duration_months, price, description FROM warranty_plans WHERE is_active = true ORDER BY sort_order ASC",
                    (rs, rowNum) -> ProductDetailDto.WarrantyPlanDto.builder()
                            .id(rs.getInt("plan_id"))
                            .name(rs.getString("name"))
                            .durationMonths(rs.getInt("duration_months"))
                            .price(rs.getBigDecimal("price"))
                            .description(rs.getString("description"))
                            .build()
            );
        } catch (Exception e) {
            log.warn("Lỗi khi truy vấn warranty plans: {}", e.getMessage());
        }

        // Promotions from PostgreSQL table `promotions`
        List<ProductDetailDto.PromotionItemDto> promotionDtos = new ArrayList<>();
        try {
            promotionDtos = jdbcTemplate.query(
                    "SELECT promotion_id, name, description, kind::text AS kind, gift_text, discount_value " +
                    "FROM promotions WHERE is_active = true AND starts_at <= NOW() AND ends_at > NOW() ORDER BY priority DESC",
                    (rs, rowNum) -> ProductDetailDto.PromotionItemDto.builder()
                            .id(rs.getInt("promotion_id"))
                            .name(rs.getString("name"))
                            .description(rs.getString("description"))
                            .kind(rs.getString("kind"))
                            .giftText(rs.getString("gift_text"))
                            .discountAmount(rs.getBigDecimal("discount_value"))
                            .build()
            );
        } catch (Exception e) {
            log.warn("Lỗi khi truy vấn promotions: {}", e.getMessage());
        }

        // Payment Offers from PostgreSQL table `payment_offers`
        List<ProductDetailDto.PaymentOfferDto> paymentOfferDtos = new ArrayList<>();
        try {
            paymentOfferDtos = jdbcTemplate.query(
                    "SELECT offer_id, title, description, bank_name, discount_type::text AS discount_type, " +
                    "discount_value, max_discount, min_order_amount " +
                    "FROM payment_offers WHERE is_active = true AND starts_at <= NOW() AND ends_at > NOW() " +
                    "ORDER BY sort_order ASC",
                    (rs, rowNum) -> ProductDetailDto.PaymentOfferDto.builder()
                            .id(rs.getInt("offer_id"))
                            .title(rs.getString("title"))
                            .description(rs.getString("description"))
                            .partner(rs.getString("bank_name") != null ? rs.getString("bank_name") : "Đối tác")
                            .discountType(rs.getString("discount_type"))
                            .discountValue(rs.getBigDecimal("discount_value"))
                            .maxDiscount(rs.getBigDecimal("max_discount"))
                            .minOrderAmount(rs.getBigDecimal("min_order_amount"))
                            .tag("Ưu đãi thanh toán")
                            .build()
            );
        } catch (Exception e) {
            log.warn("Lỗi khi truy vấn payment_offers: {}", e.getMessage());
        }

        // Installment Plans from PostgreSQL table `installment_plans` (empty if 0 rows)
        List<ProductDetailDto.InstallmentPlanDto> installmentPlanDtos = new ArrayList<>();
        try {
            installmentPlanDtos = jdbcTemplate.query(
                    "SELECT plan_id, provider, term_months, monthly_rate_pct, down_payment_pct, min_order_amount " +
                    "FROM installment_plans WHERE is_active = true ORDER BY term_months ASC",
                    (rs, rowNum) -> ProductDetailDto.InstallmentPlanDto.builder()
                            .id(rs.getInt("plan_id"))
                            .provider(rs.getString("provider"))
                            .termMonths(rs.getInt("term_months"))
                            .monthlyRatePct(rs.getBigDecimal("monthly_rate_pct"))
                            .downPaymentPct(rs.getBigDecimal("down_payment_pct"))
                            .minOrderAmount(rs.getBigDecimal("min_order_amount"))
                            .build()
            );
        } catch (Exception e) {
            log.warn("Lỗi khi truy vấn installment_plans: {}", e.getMessage());
        }

        // Bundles from PostgreSQL view `v_active_bundles` (empty if 0 rows)
        List<ProductDetailDto.BundleItemDto> bundleDtos = new ArrayList<>();
        try {
            bundleDtos = jdbcTemplate.query(
                    "SELECT bundle_id, bundled_variant_id, bundled_product_name, sku, " +
                    "original_price, bundle_price, discount_type::text AS discount_type, discount_value " +
                    "FROM v_active_bundles WHERE main_product_id = ? ORDER BY sort_order ASC",
                    (rs, rowNum) -> {
                        BigDecimal orig = rs.getBigDecimal("original_price");
                        BigDecimal bPrice = rs.getBigDecimal("bundle_price");
                        int discountPct = 0;
                        if (orig != null && bPrice != null && orig.compareTo(BigDecimal.ZERO) > 0 && orig.compareTo(bPrice) > 0) {
                            discountPct = orig.subtract(bPrice).multiply(BigDecimal.valueOf(100))
                                    .divide(orig, 0, BigDecimal.ROUND_HALF_UP).intValue();
                        }
                        return ProductDetailDto.BundleItemDto.builder()
                                .id(rs.getInt("bundle_id"))
                                .bundledVariantId(rs.getLong("bundled_variant_id"))
                                .name(rs.getString("bundled_product_name"))
                                .sku(rs.getString("sku"))
                                .originalPrice(orig)
                                .bundlePrice(bPrice)
                                .discountPercent(discountPct)
                                .discountType(rs.getString("discount_type"))
                                .discountValue(rs.getBigDecimal("discount_value"))
                                .build();
                    },
                    product.getProductId()
            );
        } catch (Exception e) {
            log.warn("Lỗi khi truy vấn v_active_bundles: {}", e.getMessage());
        }

        // Membership Tiers from PostgreSQL table `membership_tiers` (empty if 0 rows)
        List<ProductDetailDto.MembershipDiscountDto> membershipDiscountDtos = new ArrayList<>();
        try {
            final BigDecimal finalPrice = minPrice;
            membershipDiscountDtos = jdbcTemplate.query(
                    "SELECT tier_id, code, name, discount_percent FROM membership_tiers ORDER BY min_annual_spend ASC",
                    (rs, rowNum) -> {
                        BigDecimal discountPct = rs.getBigDecimal("discount_percent");
                        BigDecimal discountAmt = BigDecimal.ZERO;
                        if (discountPct != null && discountPct.compareTo(BigDecimal.ZERO) > 0 && finalPrice.compareTo(BigDecimal.ZERO) > 0) {
                            discountAmt = finalPrice.multiply(discountPct)
                                    .divide(BigDecimal.valueOf(100), 0, BigDecimal.ROUND_HALF_UP);
                        }
                        return ProductDetailDto.MembershipDiscountDto.builder()
                                .tierId(rs.getInt("tier_id"))
                                .code(rs.getString("code"))
                                .name(rs.getString("name"))
                                .discountPercent(discountPct)
                                .discountAmount(discountAmt)
                                .build();
                    }
            );
        } catch (Exception e) {
            log.warn("Lỗi khi truy vấn membership_tiers: {}", e.getMessage());
        }

        String primaryImg = null;
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            primaryImg = product.getImages().stream()
                    .filter(ProductImage::getIsPrimary)
                    .map(ProductImage::getUrl)
                    .findFirst()
                    .orElse(product.getImages().get(0).getUrl());
        }

        return ProductDetailDto.builder()
                .id(product.getProductId())
                .name(product.getName())
                .slug(product.getSlug())
                .productCode(product.getModelCode() != null ? product.getModelCode() : "M-" + product.getProductId())
                .description(product.getDescription())
                .specs(product.getSpecs())
                .price(minPrice)
                .maxPrice(maxPrice)
                .oldPrice(oldPrice)
                .rating(avgRating)
                .reviewCount(reviewCount)
                .primaryImage(primaryImg)
                .categoryId(product.getCategory() != null ? product.getCategory().getCategoryId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
                .brandId(product.getBrand() != null ? product.getBrand().getBrandId() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .brand(product.getBrand() != null ? ProductDetailDto.BrandSummaryDto.builder()
                        .id(product.getBrand().getBrandId())
                        .name(product.getBrand().getName())
                        .slug(product.getBrand().getSlug())
                        .build() : null)
                .category(product.getCategory() != null ? ProductDetailDto.CategorySummaryDto.builder()
                        .id(product.getCategory().getCategoryId())
                        .name(product.getCategory().getName())
                        .slug(product.getCategory().getSlug())
                        .build() : null)
                .series(product.getSeries() != null ? ProductDetailDto.SeriesSummaryDto.builder()
                        .id(product.getSeries().getSeriesId())
                        .name(product.getSeries().getName())
                        .slug(product.getSeries().getSlug())
                        .build() : null)
                .variants(variantDtos)
                .images(imageDtos)
                .stores(storeDtos)
                .reviews(reviewDtos)
                .reviewBreakdown(breakdownDto)
                .commitments(commitmentDtos)
                .warrantyPlans(warrantyDtos)
                .promotions(promotionDtos)
                .paymentOffers(paymentOfferDtos)
                .installmentPlans(installmentPlanDtos)
                .bundles(bundleDtos)
                .membershipDiscounts(membershipDiscountDtos)
                .build();
    }

    private ProductResponseDto mapToResponseDto(Product product) {
        String primaryImg = null;
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            primaryImg = product.getImages().stream()
                    .filter(ProductImage::getIsPrimary)
                    .map(ProductImage::getUrl)
                    .findFirst()
                    .orElse(product.getImages().get(0).getUrl());
        }

        BigDecimal minPrice = BigDecimal.ZERO;
        BigDecimal maxPrice = BigDecimal.ZERO;
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            minPrice = product.getVariants().stream()
                    .map(ProductVariant::getSalePrice)
                    .min(Comparator.naturalOrder())
                    .orElse(BigDecimal.ZERO);
            maxPrice = product.getVariants().stream()
                    .map(ProductVariant::getSalePrice)
                    .max(Comparator.naturalOrder())
                    .orElse(BigDecimal.ZERO);
        }

        List<ProductResponseDto.VariantDto> variantDtos = null;
        if (product.getVariants() != null) {
            variantDtos = product.getVariants().stream()
                    .map(v -> ProductResponseDto.VariantDto.builder()
                            .variantId(v.getVariantId())
                            .sku(v.getSku())
                            .attributes(v.getAttributes())
                            .costPrice(v.getCostPrice())
                            .salePrice(v.getSalePrice())
                            .isActive(v.getIsActive())
                            .build())
                    .collect(Collectors.toList());
        }

        List<String> imageUrls = null;
        if (product.getImages() != null) {
            imageUrls = product.getImages().stream()
                    .map(ProductImage::getUrl)
                    .collect(Collectors.toList());
        }

        return ProductResponseDto.builder()
                .id(product.getProductId())
                .name(product.getName())
                .slug(product.getSlug())
                .categoryId(product.getCategory() != null ? product.getCategory().getCategoryId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
                .brandId(product.getBrand() != null ? product.getBrand().getBrandId() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .description(product.getDescription())
                .primaryImage(primaryImg)
                .price(minPrice)
                .maxPrice(maxPrice)
                .isActive(product.getIsActive())
                .isHot(product.getIsHot())
                .isNew(product.getIsNew())
                .variants(variantDtos)
                .images(imageUrls)
                .build();
    }

    private String generateSlug(String input) {
        if (input == null) return UUID.randomUUID().toString();
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = java.text.Normalizer.normalize(nowhitespace, java.text.Normalizer.Form.NFD);
        String slug = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9-]", "");
        return slug + "-" + System.currentTimeMillis() % 10000;
    }
}
