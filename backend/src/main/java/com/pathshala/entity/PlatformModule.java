package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "modules")
public class PlatformModule extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, unique = true)
    private ModuleCode code;

    @Column(nullable = false)
    private String name;

    private String description;

    private boolean active = true;
    private boolean selectable = true;
    private boolean comingSoon = false;
    private String category;
    private boolean required = false;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "billing_type", nullable = false, length = 20)
    private BillingType billingType = BillingType.INCLUDED;

    @Column(name = "annual_price", precision = 12, scale = 2)
    private BigDecimal annualPrice;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "billing_period", nullable = false, length = 20)
    private BillingPeriod billingPeriod = BillingPeriod.ANNUAL;
}
