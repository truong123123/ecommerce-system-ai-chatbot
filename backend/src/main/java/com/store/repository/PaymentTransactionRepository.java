package com.store.repository;

import com.store.entity.PaymentTransaction;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByProviderTxnRef(String providerTxnRef);

    List<PaymentTransaction> findAllByOrderByCreatedAtDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.providerTxnRef = :providerTxnRef")
    Optional<PaymentTransaction> findByProviderTxnRefForUpdate(@Param("providerTxnRef") String providerTxnRef);

    List<PaymentTransaction> findByOrderOrderIdOrderByCreatedAtDesc(Long orderId);
}
