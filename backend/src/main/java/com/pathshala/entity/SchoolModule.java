package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "school_modules", uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "module_code"}))
public class SchoolModule extends BaseEntity {
    @Column(name = "school_id", nullable = false)
    private Long schoolId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "module_code", nullable = false)
    private ModuleCode moduleCode;

    private boolean active = true;

    @Column(name = "managed_by_subscription", nullable = false)
    private boolean managedBySubscription = false;

    @Column(name = "entitlement_starts_on")
    private LocalDate entitlementStartsOn;

    @Column(name = "entitlement_ends_on")
    private LocalDate entitlementEndsOn;
}
