package com.store.repository;

import com.store.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Integer> {
    List<Brand> findAllByOrderBySortOrderAscNameAsc();
    List<Brand> findByIsActiveTrueOrderBySortOrderAscNameAsc();
    Optional<Brand> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndBrandIdNot(String slug, Integer brandId);

    @Query("SELECT DISTINCT p.brand FROM Product p " +
           "WHERE p.isActive = true AND p.brand IS NOT NULL AND p.brand.isActive = true " +
           "AND p.category.categoryId IN :categoryIds " +
           "ORDER BY p.brand.sortOrder ASC, p.brand.name ASC")
    List<Brand> findDistinctBrandsByCategoryIds(@Param("categoryIds") List<Integer> categoryIds);
}

