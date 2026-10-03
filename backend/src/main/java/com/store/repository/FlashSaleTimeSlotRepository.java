package com.store.repository;

import com.store.entity.FlashSaleTimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashSaleTimeSlotRepository extends JpaRepository<FlashSaleTimeSlot, Long> {
    List<FlashSaleTimeSlot> findByCampaignCampaignIdOrderByStartTimeAsc(Long campaignId);
}
