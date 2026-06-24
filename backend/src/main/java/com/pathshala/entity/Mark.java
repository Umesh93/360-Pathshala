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
@Table(name = "marks")
public class Mark extends TenantEntity {
    @Column(name = "exam_subject_id")
    private Long examSubjectId;
    @Column(name = "student_id")
    private Long studentId;
    private BigDecimal obtainedMarks;
    private String grade;
    private BigDecimal gpa;
    private String resultStatus;
}
