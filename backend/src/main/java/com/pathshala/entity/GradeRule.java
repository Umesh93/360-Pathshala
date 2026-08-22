package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "grade_rules")
public class GradeRule extends TenantEntity {
    @Column(name = "grading_system_id", nullable = false)
    private Long gradingSystemId;
    @Column(name = "min_percentage", nullable = false)
    private BigDecimal minPercentage;
    @Column(name = "max_percentage", nullable = false)
    private BigDecimal maxPercentage;
    @Column(nullable = false)
    private String grade;
    @Column(nullable = false)
    private BigDecimal gpa;
    private boolean passing;
    private String remarks;
}
