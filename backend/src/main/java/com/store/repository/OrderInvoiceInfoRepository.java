package com.store.repository;

import com.store.entity.OrderInvoiceInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderInvoiceInfoRepository extends JpaRepository<OrderInvoiceInfo, Long> {
    Optional<OrderInvoiceInfo> findByOrderOrderId(Long orderId);
}
