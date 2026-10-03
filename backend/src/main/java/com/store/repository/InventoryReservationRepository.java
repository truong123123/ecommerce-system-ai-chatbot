package com.store.repository;

import com.store.entity.InventoryReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, Long> {

    List<InventoryReservation> findByOrderOrderIdAndStatus(Long orderId, String status);

    List<InventoryReservation> findByStatusAndExpiresAtBefore(String status, OffsetDateTime time);

    @Query("SELECT COALESCE(SUM(r.quantity), 0) FROM InventoryReservation r " +
           "WHERE r.flashSaleItemId = :fsItemId AND r.order.customer.customerId = :customerId " +
           "AND r.status = 'RESERVED'")
    Integer getReservedQuantityForUserAndFlashSaleItem(
            @Param("fsItemId") Long fsItemId,
            @Param("customerId") Long customerId
    );
}
