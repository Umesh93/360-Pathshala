package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "exam_subjects")
public class ExamSubject extends TenantEntity {
    @Column(name = "exam_id")
    private Long examId;
    @Column(name = "subject_id")
    private Long subjectId;
    private LocalDate examDate;
    private BigDecimal fullMarks;
    private BigDecimal passMarks;
}
