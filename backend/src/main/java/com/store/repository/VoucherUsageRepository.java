package com.store.repository;

import com.store.entity.VoucherUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, Long> {

    Optional<VoucherUsage> findByCouponCouponIdAndOrderOrderId(Integer couponId, Long orderId);

    @Query("SELECT COUNT(vu) FROM VoucherUsage vu " +
           "WHERE vu.coupon.couponId = :couponId AND vu.customer.customerId = :customerId " +
           "AND vu.status IN ('RESERVED', 'CONSUMED')")
    long countUsageByCouponAndCustomer(
            @Param("couponId") Integer couponId,
            @Param("customerId") Long customerId
    );

    List<VoucherUsage> findByStatusAndExpiresAtBefore(String status, OffsetDateTime time);
}
