package com.store.repository;

import com.store.entity.FlashSaleItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlashSaleItemRepository extends JpaRepository<FlashSaleItem, Long> {

    List<FlashSaleItem> findByCampaignCampaignId(Long campaignId);

    List<FlashSaleItem> findByTimeSlotId(Long slotId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM FlashSaleItem f WHERE f.id = :id")
    Optional<FlashSaleItem> findByIdWithLock(@Param("id") Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE FlashSaleItem f SET f.reservedQuantity = f.reservedQuantity + :qty " +
           "WHERE f.id = :id AND (f.totalStock - f.soldCount - f.reservedQuantity) >= :qty")
    int atomicReserveQuantity(@Param("id") Long id, @Param("qty") Integer qty);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE FlashSaleItem f SET f.reservedQuantity = f.reservedQuantity - :qty " +
           "WHERE f.id = :id AND f.reservedQuantity >= :qty")
    int atomicReleaseQuantity(@Param("id") Long id, @Param("qty") Integer qty);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE FlashSaleItem f SET f.soldCount = f.soldCount + :qty, f.reservedQuantity = f.reservedQuantity - :qty " +
           "WHERE f.id = :id AND f.reservedQuantity >= :qty")
    int atomicConsumeQuantity(@Param("id") Long id, @Param("qty") Integer qty);

    @Query("SELECT f FROM FlashSaleItem f " +
           "WHERE f.product.productId = :productId AND f.campaign.isActive = true " +
           "AND f.timeSlot.startTime <= CURRENT_TIMESTAMP AND f.timeSlot.endTime >= CURRENT_TIMESTAMP")
    Optional<FlashSaleItem> findActiveFlashSaleItemByProductId(@Param("productId") Long productId);
}
