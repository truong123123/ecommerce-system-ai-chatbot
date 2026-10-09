package com.store.repository;

import com.store.entity.OrderItem;
import com.store.entity.Review;
import com.store.entity.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r WHERE r.product.productId = :productId AND r.status = com.store.entity.ReviewStatus.APPROVED ORDER BY r.createdAt DESC")
    List<Review> findApprovedReviewsByProductId(@Param("productId") Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.productId = :productId AND r.status = com.store.entity.ReviewStatus.APPROVED")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    Long countByProductProductIdAndStatus(Long productId, ReviewStatus status);

    boolean existsByProductProductIdAndCustomerCustomerId(Long productId, Long customerId);

    boolean existsByOrderItemOrderItemId(Long orderItemId);

    Optional<Review> findByOrderItemOrderItemId(Long orderItemId);

    Optional<Review> findByProductProductIdAndCustomerCustomerId(Long productId, Long customerId);

    @Query("SELECT r FROM Review r WHERE r.product.productId = :productId " +
           "AND r.status = com.store.entity.ReviewStatus.APPROVED " +
           "AND (:rating IS NULL OR r.rating = :rating)")
    Page<Review> findApprovedReviewsPaged(
            @Param("productId") Long productId,
            @Param("rating") Short rating,
            Pageable pageable
    );

    @Query("SELECT r.rating, COUNT(r) FROM Review r " +
           "WHERE r.product.productId = :productId AND r.status = com.store.entity.ReviewStatus.APPROVED " +
           "GROUP BY r.rating")
    List<Object[]> countRatingsByStar(@Param("productId") Long productId);

    @Query(value = "SELECT oi.order_item_id FROM order_items oi " +
           "JOIN orders o ON oi.order_id = o.order_id " +
           "JOIN product_variants pv ON oi.variant_id = pv.variant_id " +
           "WHERE o.customer_id = :customerId " +
           "AND pv.product_id = :productId " +
           "AND o.status = 'completed' " +
           "AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.order_item_id = oi.order_item_id) " +
           "ORDER BY o.order_date DESC, oi.order_item_id DESC", nativeQuery = true)
    List<Long> findUnreviewedCompletedOrderItemIds(
            @Param("customerId") Long customerId,
            @Param("productId") Long productId
    );

    @Query(value = "SELECT COUNT(oi.order_item_id) > 0 FROM order_items oi " +
           "JOIN orders o ON oi.order_id = o.order_id " +
           "JOIN product_variants pv ON oi.variant_id = pv.variant_id " +
           "WHERE o.customer_id = :customerId " +
           "AND pv.product_id = :productId " +
           "AND o.status = 'completed'", nativeQuery = true)
    boolean hasPurchasedProduct(
            @Param("customerId") Long customerId,
            @Param("productId") Long productId
    );
}
