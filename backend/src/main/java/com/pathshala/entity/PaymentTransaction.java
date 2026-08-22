package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "payment_transactions", indexes = {
        @Index(name = "idx_payment_school_status_created", columnList = "school_id,status,created_at"),
        @Index(name = "idx_payment_pidx_order", columnList = "pidx,purchase_order_id")
})
public class PaymentTransaction extends BaseEntity {
    public enum Status { INITIATED, PENDING, COMPLETED, FAILED, CANCELLED, EXPIRED, REFUNDED }

    @Column(name = "school_id", nullable = false)
    private Long schoolId;
    @Column(name = "subscription_id")
    private Long subscriptionId;
    @Column(name = "plan_id", nullable = false)
    private Long planId;
    @Column(nullable = false, length = 20)
    private String provider = "KHALTI";
    @Column(name = "purchase_order_id", nullable = false, unique = true, length = 80)
    private String purchaseOrderId;
    @Column(unique = true, length = 100)
    private String pidx;
    @Column(name = "transaction_id", unique = true, length = 100)
    private String transactionId;
    @Column(name = "amount_paisa", nullable = false)
    private long amountPaisa;
    @Column(name = "amount_npr", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountNpr;
    @Column(nullable = false, length = 3)
    private String currency = "NPR";
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private Status status = Status.INITIATED;
    @Column(name = "provider_status", length = 80)
    private String providerStatus;
    @Column(name = "initiated_at", nullable = false)
    private Instant initiatedAt;
    @Column(name = "verified_at")
    private Instant verifiedAt;
    @Column(name = "failure_reason", length = 500)
    private String failureReason;
    @Column(name = "payment_url", length = 1000)
    private String paymentUrl;
    @Lob
    @Column(name = "raw_response")
    private String rawResponse;

    @Lob
    @Column(name = "feature_codes_snapshot")
    private String featureCodesSnapshot;

    @Lob
    @Column(name = "entitlement_baseline_snapshot")
    private String entitlementBaselineSnapshot;
}
