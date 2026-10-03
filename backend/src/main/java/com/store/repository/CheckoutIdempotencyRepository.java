package com.store.repository;

import com.store.entity.CheckoutIdempotency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;

@Repository
public interface CheckoutIdempotencyRepository extends JpaRepository<CheckoutIdempotency, Long> {

    Optional<CheckoutIdempotency> findByCustomerCustomerIdAndIdempotencyKey(Long customerId, String idempotencyKey);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "INSERT INTO checkout_idempotency (customer_id, idempotency_key, request_hash, status, expires_at, created_at) " +
                   "VALUES (:customerId, :idempotencyKey, :requestHash, 'PROCESSING', :expiresAt, NOW()) " +
                   "ON CONFLICT (customer_id, idempotency_key) DO NOTHING", nativeQuery = true)
    int insertOnConflictDoNothing(
            @Param("customerId") Long customerId,
            @Param("idempotencyKey") String idempotencyKey,
            @Param("requestHash") String requestHash,
            @Param("expiresAt") OffsetDateTime expiresAt
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM CheckoutIdempotency c WHERE c.expiresAt < :now")
    int deleteExpiredRecords(@Param("now") OffsetDateTime now);
}
