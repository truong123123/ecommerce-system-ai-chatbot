package com.store.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(
    name = "checkout_idempotency",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_user_idempotency", columnNames = {"customer_id", "idempotency_key"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutIdempotency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "idempotency_key", nullable = false, length = 64)
    private String idempotencyKey;

    @Column(name = "request_hash", nullable = false, length = 64)
    private String requestHash;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "response_snapshot", columnDefinition = "TEXT")
    private String responseSnapshot;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PROCESSING"; // PROCESSING, COMPLETED, FAILED

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;
}
