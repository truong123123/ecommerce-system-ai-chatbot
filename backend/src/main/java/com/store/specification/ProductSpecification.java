package com.store.specification;

import com.store.entity.Product;
import com.store.entity.ProductVariant;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filter(
            List<Integer> categoryIds,
            Integer brandId,
            String brandSlug,
            String keyword,
            Boolean isHot,
            Boolean isNew,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean activeOnly
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Chỉ lấy sản phẩm đang active nếu activeOnly = true
            if (activeOnly != null && activeOnly) {
                predicates.add(cb.isTrue(root.get("isActive")));
            }

            // 2. Lọc theo danh mục (chính nó hoặc bất kỳ con cháu nào)
            if (categoryIds != null && !categoryIds.isEmpty()) {
                predicates.add(root.get("category").get("categoryId").in(categoryIds));
            }

            // 3. Lọc theo thương hiệu (hỗ trợ cả brandId và brandSlug)
            if (brandId != null) {
                predicates.add(cb.equal(root.get("brand").get("brandId"), brandId));
            } else if (brandSlug != null && !brandSlug.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("brand").get("slug")), brandSlug.trim().toLowerCase()));
            }

            // 4. Lọc theo cờ isHot
            if (isHot != null) {
                predicates.add(cb.equal(root.get("isHot"), isHot));
            }

            // 5. Lọc theo cờ isNew
            if (isNew != null) {
                predicates.add(cb.equal(root.get("isNew"), isNew));
            }

            // 6. Lọc theo từ khóa tìm kiếm
            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate modelMatch = cb.like(cb.lower(cb.coalesce(root.get("modelCode"), "")), pattern);
                predicates.add(cb.or(nameMatch, modelMatch));
            }

            // 7. Lọc theo khoảng giá (minPrice, maxPrice) qua product_variants
            if (minPrice != null || maxPrice != null) {
                Join<Product, ProductVariant> variantJoin = root.join("variants", JoinType.INNER);
                predicates.add(cb.isTrue(variantJoin.get("isActive")));

                if (minPrice != null) {
                    predicates.add(cb.greaterThanOrEqualTo(variantJoin.get("salePrice"), minPrice));
                }
                if (maxPrice != null) {
                    predicates.add(cb.lessThanOrEqualTo(variantJoin.get("salePrice"), maxPrice));
                }
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
