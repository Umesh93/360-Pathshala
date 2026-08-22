package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "exam_subjects")
public class ExamSubject extends TenantEntity {
    @Column(name = "exam_id")
    private Long examId;
    @Column(name = "subject_id")
    private Long subjectId;
    @Column(name = "class_id")
    private Long classId;
    @Column(name = "section_id")
    private Long sectionId;
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String room;
    @Column(name = "invigilator_id")
    private Long invigilatorId;
    private BigDecimal fullMarks;
    private BigDecimal passMarks;
    @Column(precision = 8, scale = 2)
    private BigDecimal creditHoursSnapshot;
    private Boolean includeInGpaSnapshot;
    private Boolean includeInCgpaSnapshot;
    private Long gradingSystemIdSnapshot;
}
