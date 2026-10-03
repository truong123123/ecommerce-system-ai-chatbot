package com.store.repository;

import com.store.entity.FlashSalePurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FlashSalePurchaseRepository extends JpaRepository<FlashSalePurchase, Long> {

    @Query("SELECT COUNT(p) > 0 FROM FlashSalePurchase p WHERE p.slot.id = :slotId AND p.product.productId = :productId AND p.phone = :phone")
    boolean existsBySlotIdAndProductIdAndPhone(@Param("slotId") Long slotId, @Param("productId") Long productId, @Param("phone") String phone);

    Optional<FlashSalePurchase> findBySlotIdAndProductProductIdAndPhone(Long slotId, Long productId, String phone);
}
