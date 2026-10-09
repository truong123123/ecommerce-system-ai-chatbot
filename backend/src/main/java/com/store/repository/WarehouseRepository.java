package com.store.repository;

import com.store.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Integer> {
    List<Warehouse> findByIsStoreTrueAndIsActiveTrue();

    List<Warehouse> findByIsActiveTrue();

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT w.province FROM Warehouse w WHERE w.isStore = true AND w.isActive = true AND w.province IS NOT NULL ORDER BY w.province")
    List<String> findDistinctStoreProvinces();
}
