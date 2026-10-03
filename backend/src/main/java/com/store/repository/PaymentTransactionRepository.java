package com.store.repository;

import com.store.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByProviderTxnRef(String providerTxnRef);
    List<PaymentTransaction> findByOrderOrderIdOrderByCreatedAtDesc(Long orderId);
}
