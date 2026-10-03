package com.store.repository;

import com.store.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    List<Product> findByIsActiveTrueOrderByCreatedAtDesc();

    long countByCategoryCategoryId(Integer categoryId);

    boolean existsByCategoryCategoryId(Integer categoryId);

    long countByBrandBrandId(Integer brandId);

    boolean existsByBrandBrandId(Integer brandId);

    @Query("SELECT p FROM Product p WHERE p.isActive = true " +
           "AND (:categoryId IS NULL OR p.category.categoryId = :categoryId) " +
           "AND (:categorySlug IS NULL OR p.category.slug = :categorySlug) " +
           "AND (:brandId IS NULL OR p.brand.brandId = :brandId) " +
           "AND (cast(:keyword as string) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', cast(:keyword as string), '%'))) " +
           "ORDER BY p.productId DESC")
    List<Product> filterProducts(
            @Param("categoryId") Integer categoryId,
            @Param("categorySlug") String categorySlug,
            @Param("brandId") Integer brandId,
            @Param("keyword") String keyword
    );
}

