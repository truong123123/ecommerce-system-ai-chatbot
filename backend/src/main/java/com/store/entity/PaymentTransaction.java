package com.store.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;

    @Column(name = "provider", nullable = false, length = 50)
    private String provider; // VNPAY, BANK_QR, STORE, MOMO, ONEPAY_CARD

    @Column(name = "amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 10)
    @Builder.Default
    private String currency = "VND";

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "INITIATED"; // INITIATED, PENDING, SUCCESS, FAILED, EXPIRED, REFUND_PENDING, REFUNDED

    @Column(name = "provider_txn_ref", nullable = false, unique = true, length = 100)
    private String providerTxnRef;

    @Column(name = "provider_transaction_no", length = 100)
    private String providerTransactionNo;

    @Column(name = "request_payload", columnDefinition = "TEXT")
    private String requestPayload;

    @Column(name = "callback_payload", columnDefinition = "TEXT")
    private String callbackPayload;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "paid_at")
    private OffsetDateTime paidAt;

    @Column(name = "expired_at")
    private OffsetDateTime expiredAt;
}
