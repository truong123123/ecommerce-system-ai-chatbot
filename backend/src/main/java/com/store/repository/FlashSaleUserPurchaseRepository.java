package com.store.repository;

import com.store.entity.FlashSaleUserPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FlashSaleUserPurchaseRepository extends JpaRepository<FlashSaleUserPurchase, Long> {

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM FlashSaleUserPurchase p WHERE p.item.id = :itemId AND p.customer.customerId = :customerId")
    Integer sumPurchasedQuantity(@Param("itemId") Long itemId, @Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM FlashSaleUserPurchase p " +
           "WHERE (p.item.id = :itemId OR p.item.product.productId = :productId) " +
           "AND ((:customerId IS NOT NULL AND p.customer.customerId = :customerId) " +
           "     OR (:phone IS NOT NULL AND :phone <> '' AND p.order.customerPhone = :phone))")
    Integer countPurchasedByCustomerOrPhone(
            @Param("itemId") Long itemId,
            @Param("productId") Long productId,
            @Param("customerId") Long customerId,
            @Param("phone") String phone
    );

    void deleteByOrderOrderId(Long orderId);
}
