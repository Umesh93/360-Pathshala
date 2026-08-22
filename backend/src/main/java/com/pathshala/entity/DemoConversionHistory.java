package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "demo_conversion_history")
public class DemoConversionHistory extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String conversionCode;

    @Column(name = "demo_request_id", nullable = false)
    private Long demoRequestId;

    @Column(name = "demo_school_id", nullable = false, unique = true)
    private Long demoSchoolId;

    @Column(name = "paid_school_id", nullable = false, unique = true)
    private Long paidSchoolId;

    @Column(nullable = false)
    private String schoolName;

    @Column(name = "converted_by", nullable = false)
    private Long convertedBy;

    @Column(name = "conversion_date", nullable = false)
    private LocalDate conversionDate;

    @Column(name = "initial_subscription_plan")
    private String initialSubscriptionPlan;

    @Column(name = "subscription_duration")
    private Integer subscriptionDuration;

    @Column(length = 1000)
    private String enabledModules;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_amount")
    private java.math.BigDecimal paymentAmount;

    @Column(length = 3)
    private String currency = "NPR";

    @Column(length = 2000)
    private String remarks;
}
