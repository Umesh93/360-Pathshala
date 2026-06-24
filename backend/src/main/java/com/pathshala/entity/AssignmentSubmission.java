package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "assignment_submissions")
public class AssignmentSubmission extends TenantEntity {
    @Column(name = "assignment_id")
    private Long assignmentId;
    @Column(name = "student_id")
    private Long studentId;
    private String fileUrl;
    @Column(length = 2000)
    private String answerText;
    private LocalDateTime submittedAt;
    private BigDecimal marks;
    private String feedback;
}
