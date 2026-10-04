package com.store.repository;

import com.store.entity.FlashSaleAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashSaleAuditLogRepository extends JpaRepository<FlashSaleAuditLog, Long> {

    List<FlashSaleAuditLog> findByCampaignIdOrderByCreatedAtDesc(Long campaignId);
}
