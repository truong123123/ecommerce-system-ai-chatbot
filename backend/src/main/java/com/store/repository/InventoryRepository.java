package com.store.repository;

import com.store.entity.Inventory;
import com.store.entity.InventoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, InventoryId> {

    List<Inventory> findByIdVariantId(Long variantId);

    @Query("SELECT COALESCE(SUM(i.quantity - i.reservedQty), 0) FROM Inventory i WHERE i.id.variantId = :variantId")
    Integer getAvailableStockByVariantId(@Param("variantId") Long variantId);

    @Query("SELECT (i.quantity - i.reservedQty) FROM Inventory i WHERE i.id.variantId = :variantId AND i.id.warehouseId = :warehouseId")
    Optional<Integer> getAvailableStockByVariantIdAndWarehouseId(
            @Param("variantId") Long variantId,
            @Param("warehouseId") Integer warehouseId
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Inventory i SET i.reservedQty = i.reservedQty + :qty " +
           "WHERE i.id.variantId = :variantId AND i.id.warehouseId = :warehouseId " +
           "AND (i.quantity - i.reservedQty) >= :qty")
    int atomicReserveStock(
            @Param("variantId") Long variantId,
            @Param("warehouseId") Integer warehouseId,
            @Param("qty") Integer qty
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Inventory i SET i.reservedQty = i.reservedQty - :qty " +
           "WHERE i.id.variantId = :variantId AND i.id.warehouseId = :warehouseId AND i.reservedQty >= :qty")
    int atomicReleaseStock(
            @Param("variantId") Long variantId,
            @Param("warehouseId") Integer warehouseId,
            @Param("qty") Integer qty
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Inventory i SET i.quantity = i.quantity - :qty, i.reservedQty = i.reservedQty - :qty " +
           "WHERE i.id.variantId = :variantId AND i.id.warehouseId = :warehouseId AND i.reservedQty >= :qty AND i.quantity >= :qty")
    int atomicConsumeStock(
            @Param("variantId") Long variantId,
            @Param("warehouseId") Integer warehouseId,
            @Param("qty") Integer qty
    );
}
