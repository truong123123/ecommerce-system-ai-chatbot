package com.store.repository;

import com.store.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductProductIdOrderByCreatedAtDesc(Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.productId = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    Long countByProductProductId(Long productId);
}
