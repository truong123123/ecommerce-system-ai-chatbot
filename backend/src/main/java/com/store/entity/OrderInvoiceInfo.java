package com.store.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "order_invoice_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderInvoiceInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "tax_code", nullable = false, length = 50)
    private String taxCode;

    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName;

    @Column(name = "company_address", nullable = false, length = 255)
    private String companyAddress;

    @Column(name = "company_email", length = 150)
    private String companyEmail;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
