package com.pathshala.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "subjects")
public class Subject extends TenantEntity {
    @Column(name = "class_id")
    private Long classId;
    @Column(name = "subject_name", nullable = false)
    private String subjectName;
    @Column(name = "subject_code", nullable = false)
    private String subjectCode;
    private String subjectType;
    private BigDecimal creditHours;
    private BigDecimal fullMarks;
    private BigDecimal passMarks;
    private boolean optional;
    private String status = "ACTIVE";
    @Column(length = 1000)
    private String description;
    @Column(name = "name")
    private String legacyName;
    @Column(name = "code")
    private String legacyCode;
}
