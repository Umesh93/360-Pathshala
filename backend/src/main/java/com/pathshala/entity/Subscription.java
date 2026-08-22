package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Lob;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "subscriptions")
public class Subscription extends BaseEntity {
    @Column(name = "school_id", nullable = false)
    private Long schoolId;

    @Column(name = "plan_id")
    private Long planId;

    @Column(name = "plan_code", length = 50)
    private String planCode;

    @Column(name = "plan_name")
    private String planName;

    @Column(length = 3)
    private String currency = "NPR";

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "auto_renew", nullable = false)
    private boolean autoRenew = false;

    @Lob
    @Column(name = "module_codes_snapshot")
    private String moduleCodesSnapshot;

    @Column(name = "base_amount", nullable = false)
    private BigDecimal baseAmount;

    @Column(name = "additional_amount", nullable = false)
    private BigDecimal additionalAmount;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private String paymentStatus = "PENDING";

    @Column(nullable = false)
    private String subscriptionStatus = "DEMO";

    @Column(name = "reference_number", nullable = false, unique = true)
    private String referenceNumber;

    @Column(name = "starts_on")
    private LocalDate startsOn;

    @Column(name = "ends_on")
    private LocalDate endsOn;
}
