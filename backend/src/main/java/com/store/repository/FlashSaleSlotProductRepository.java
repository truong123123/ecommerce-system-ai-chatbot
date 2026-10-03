package com.store.repository;

import com.store.entity.FlashSaleSlotProduct;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlashSaleSlotProductRepository extends JpaRepository<FlashSaleSlotProduct, Long> {

    @Query("SELECT sp FROM FlashSaleSlotProduct sp JOIN FETCH sp.product p LEFT JOIN FETCH p.images WHERE sp.slot.id = :slotId ORDER BY sp.sortOrder ASC, sp.id ASC")
    List<FlashSaleSlotProduct> findBySlotIdWithProduct(@Param("slotId") Long slotId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT sp FROM FlashSaleSlotProduct sp WHERE sp.slot.id = :slotId AND sp.product.productId = :productId")
    Optional<FlashSaleSlotProduct> findBySlotIdAndProductIdWithLock(@Param("slotId") Long slotId, @Param("productId") Long productId);

    Optional<FlashSaleSlotProduct> findBySlotIdAndProductProductId(Long slotId, Long productId);
}
