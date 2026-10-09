package com.store.repository;

import com.store.entity.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    @Query("SELECT m FROM InventoryMovement m " +
           "JOIN FETCH m.warehouse w " +
           "JOIN FETCH m.variant v " +
           "JOIN FETCH v.product p " +
           "LEFT JOIN FETCH m.staff s " +
           "WHERE v.variantId = :variantId " +
           "ORDER BY m.createdAt DESC")
    List<InventoryMovement> findByVariantIdWithDetails(@Param("variantId") Long variantId);

    @Query("SELECT m FROM InventoryMovement m " +
           "JOIN FETCH m.warehouse w " +
           "JOIN FETCH m.variant v " +
           "JOIN FETCH v.product p " +
           "LEFT JOIN FETCH m.staff s " +
           "ORDER BY m.createdAt DESC")
    List<InventoryMovement> findRecentMovements();
}
