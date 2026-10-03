package com.store.repository;

import com.store.entity.FlashSaleCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FlashSaleCampaignRepository extends JpaRepository<FlashSaleCampaign, Long> {
    Optional<FlashSaleCampaign> findFirstByIsActiveTrueOrderByCreatedAtDesc();
}
