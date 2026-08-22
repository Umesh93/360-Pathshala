package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "assignment_submissions", uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "assignment_id", "student_id"}))
public class AssignmentSubmission extends TenantEntity {
    public enum Status { PENDING, SUBMITTED, LATE, REVIEWED, RETURNED, GRADED }
    @Column(name = "assignment_id")
    private Long assignmentId;
    @Column(name = "student_id")
    private Long studentId;
    private String fileUrl;
    @Column(columnDefinition = "LONGTEXT")
    private String attachmentMetadata;
    @Column(columnDefinition = "LONGTEXT")
    private String answerText;
    @Column(columnDefinition = "LONGTEXT")
    private String comments;
    private LocalDateTime submittedAt;
    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private Status status = Status.PENDING;
    @Column(precision = 10, scale = 2)
    private BigDecimal marks;
    @Column(precision = 7, scale = 2)
    private BigDecimal percentage;
    @Column(columnDefinition = "LONGTEXT")
    private String feedback;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;
}
