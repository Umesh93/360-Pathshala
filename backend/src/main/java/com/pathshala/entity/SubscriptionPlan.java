package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String name;
    @Column(nullable = false, unique = true, length = 50)
    private String code;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyPrice;
    @Column(nullable = false)
    private int durationDays = 30;
    @Column(nullable = false, length = 3)
    private String currency = "NPR";
    private String description;
    private boolean active = true;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "pricing_model", nullable = false, length = 20)
    private PricingModel pricingModel = PricingModel.LEGACY_FIXED;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SubscriptionPlanModule> modules = new ArrayList<>();
}
