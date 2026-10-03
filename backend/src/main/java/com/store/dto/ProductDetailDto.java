package com.store.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailDto {
    private Long id;
    private String name;
    private String slug;
    private String productCode;
    private String description;
    private Object specs;
    private BigDecimal price;
    private BigDecimal maxPrice;
    private BigDecimal oldPrice;
    private Double rating;
    private Long reviewCount;

    private BrandSummaryDto brand;
    private CategorySummaryDto category;
    private SeriesSummaryDto series;

    // Convenience / backward-compatibility fields
    private Integer categoryId;
    private String categoryName;
    private String categorySlug;
    private Integer brandId;
    private String brandName;
    private String primaryImage;

    private List<VariantDetailDto> variants;
    private List<ImageDetailDto> images;
    private List<StoreAvailabilityDto> stores;
    private List<ReviewDetailDto> reviews;
    private ReviewBreakdownDto reviewBreakdown;
    private List<PromotionItemDto> promotions;
    private List<CommitmentItemDto> commitments;
    private List<WarrantyPlanDto> warrantyPlans;
    private List<PaymentOfferDto> paymentOffers;
    private List<InstallmentPlanDto> installmentPlans;
    private List<BundleItemDto> bundles;
    private List<MembershipDiscountDto> membershipDiscounts;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BrandSummaryDto {
        private Integer id;
        private String name;
        private String slug;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategorySummaryDto {
        private Integer id;
        private String name;
        private String slug;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SeriesSummaryDto {
        private Integer id;
        private String name;
        private String slug;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VariantDetailDto {
        private Long id;
        private String sku;
        private String color;
        private BigDecimal price;
        private BigDecimal oldPrice;
        private Object attributes;
        private Integer stock;
        private Boolean isActive;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImageDetailDto {
        private Long id;
        private String url;
        private Boolean isPrimary;
        private Integer sortOrder;
        private String type;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StoreAvailabilityDto {
        private Integer id;
        private String name;
        private String address;
        private String province;
        private String district;
        private String phone;
        private Integer availableQty;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewDetailDto {
        private Long id;
        private String author;
        private Short rating;
        private String comment;
        private String createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewBreakdownDto {
        private Integer star5Count;
        private Integer star5Pct;
        private Integer star4Count;
        private Integer star4Pct;
        private Integer star3Count;
        private Integer star3Pct;
        private Integer star2Count;
        private Integer star2Pct;
        private Integer star1Count;
        private Integer star1Pct;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PromotionItemDto {
        private Integer id;
        private String name;
        private String description;
        private String kind;
        private String giftText;
        private BigDecimal discountAmount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CommitmentItemDto {
        private Integer id;
        private String title;
        private String content;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WarrantyPlanDto {
        private Integer id;
        private String name;
        private Integer durationMonths;
        private BigDecimal price;
        private String description;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentOfferDto {
        private Integer id;
        private String title;
        private String description;
        private String partner;
        private String discountType;
        private BigDecimal discountValue;
        private BigDecimal maxDiscount;
        private BigDecimal minOrderAmount;
        private String tag;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InstallmentPlanDto {
        private Integer id;
        private String provider;
        private Integer termMonths;
        private BigDecimal monthlyRatePct;
        private BigDecimal downPaymentPct;
        private BigDecimal minOrderAmount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BundleItemDto {
        private Integer id;
        private Long bundledVariantId;
        private String name;
        private String sku;
        private BigDecimal originalPrice;
        private BigDecimal bundlePrice;
        private Integer discountPercent;
        private String discountType;
        private BigDecimal discountValue;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MembershipDiscountDto {
        private Integer tierId;
        private String code;
        private String name;
        private BigDecimal discountPercent;
        private BigDecimal discountAmount;
    }
}
