package com.store.repository;

import com.store.entity.FlashSaleSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashSaleSlotRepository extends JpaRepository<FlashSaleSlot, Long> {
    List<FlashSaleSlot> findAllByIsActiveTrueOrderByStartAtAsc();
}
