package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "subject_academic_configs", uniqueConstraints = @UniqueConstraint(
        columnNames = {"school_id", "academic_session_id", "class_id", "subject_id"}))
public class SubjectAcademicConfig extends TenantEntity {
    @Column(name = "academic_session_id", nullable = false)
    private Long academicSessionId;
    @Column(name = "class_id", nullable = false)
    private Long classId;
    @Column(name = "subject_id", nullable = false)
    private Long subjectId;
    @Column(precision = 8, scale = 2)
    private BigDecimal creditHours;
    private boolean includeInGpa = true;
    private boolean includeInCgpa;
}
