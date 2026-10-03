package com.store.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "address_id")
    private Long addressId;

    @Column(name = "coupon_id")
    private Integer couponId;

    @Column(name = "staff_id")
    private Integer staffId;

    @Column(name = "order_date", nullable = false)
    @Builder.Default
    private OffsetDateTime orderDate = OffsetDateTime.now();

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "status", columnDefinition = "order_status", nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.pending;

    @Column(name = "subtotal", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "shipping_fee", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    @Column(name = "receive_type", nullable = false, length = 20)
    @Builder.Default
    private String receiveType = "STORE_PICKUP";

    @Column(name = "store_id")
    private Integer storeId;

    @Column(name = "shipping_province", length = 100)
    private String shippingProvince;

    @Column(name = "shipping_district", length = 100)
    private String shippingDistrict;

    @Column(name = "shipping_ward", length = 100)
    private String shippingWard;

    @Column(name = "shipping_street", length = 255)
    private String shippingStreet;

    @Column(name = "customer_name", length = 150)
    private String customerName;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @Column(name = "customer_email", length = 150)
    private String customerEmail;

    @Column(name = "need_invoice", nullable = false)
    @Builder.Default
    private Boolean needInvoice = false;

    @Column(name = "payment_method", nullable = false, length = 50)
    @Builder.Default
    private String paymentMethod = "STORE";

    @Column(name = "voucher_discount", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal voucherDiscount = BigDecimal.ZERO;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "channel", nullable = false, length = 20)
    @Builder.Default
    private String channel = "web";

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}
