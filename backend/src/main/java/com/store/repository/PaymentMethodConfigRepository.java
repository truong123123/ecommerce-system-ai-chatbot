package com.store.repository;

import com.store.entity.PaymentMethodConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodConfigRepository extends JpaRepository<PaymentMethodConfig, Integer> {
    List<PaymentMethodConfig> findByIsActiveTrueOrderBySortOrderAsc();
    Optional<PaymentMethodConfig> findByCodeIgnoreCase(String code);
}
