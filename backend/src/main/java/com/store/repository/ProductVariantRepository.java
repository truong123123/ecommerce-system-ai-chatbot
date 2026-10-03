package com.store.repository;

import com.store.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductProductId(Long productId);
    Optional<ProductVariant> findBySku(String sku);

    @org.springframework.data.jpa.repository.Query("SELECT v FROM ProductVariant v JOIN FETCH v.product p LEFT JOIN FETCH p.images WHERE v.variantId = :id")
    Optional<ProductVariant> findWithProductAndImagesById(@org.springframework.data.repository.query.Param("id") Long id);
}
