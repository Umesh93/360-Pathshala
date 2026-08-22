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
@Table(name = "marks", uniqueConstraints = @jakarta.persistence.UniqueConstraint(columnNames = {"school_id", "exam_subject_id", "student_id"}))
public class Mark extends TenantEntity {
    @Column(name = "exam_subject_id")
    private Long examSubjectId;
    @Column(name = "student_id")
    private Long studentId;
    private BigDecimal obtainedMarks;
    private boolean absent;
    @Column(name = "marked_by")
    private Long markedBy;
    private String grade;
    private BigDecimal gpa;
    private String resultStatus;
    @Column(precision = 7, scale = 4)
    private BigDecimal subjectPercentage;
    @Column(precision = 12, scale = 4)
    private BigDecimal qualityPoints;
    @Column(length = 1000)
    private String resultRemarks;
}
