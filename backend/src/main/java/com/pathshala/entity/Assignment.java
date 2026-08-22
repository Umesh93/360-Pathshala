package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "assignments")
public class Assignment extends TenantEntity {
    public enum Category { HOMEWORK, CLASSWORK, PROJECT, PRACTICAL, PRESENTATION, INTERNAL_ASSESSMENT, HOLIDAY_HOMEWORK }
    public enum Status { DRAFT, PUBLISHED, ACTIVE, CLOSED, ARCHIVED }

    @Column(name = "academic_session_id")
    private Long academicSessionId;
    @Column(name = "teacher_id")
    private Long teacherId;
    @Column(name = "class_id")
    private Long classId;
    @Column(name = "section_id")
    private Long sectionId;
    @Column(name = "subject_id")
    private Long subjectId;
    private String title;
    @Column(columnDefinition = "LONGTEXT")
    private String description;
    @Column(columnDefinition = "LONGTEXT")
    private String instructions;
    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private Category category = Category.HOMEWORK;
    private LocalDateTime publishAt;
    private LocalDateTime dueAt;
    @Column(precision = 10, scale = 2)
    private BigDecimal maximumMarks;
    private boolean allowLateSubmission;
    private LocalDateTime lateSubmissionDeadline;
    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private Status status = Status.DRAFT;
    @Column(columnDefinition = "LONGTEXT")
    private String attachmentMetadata;
    private LocalDateTime reminderSentAt;
}
