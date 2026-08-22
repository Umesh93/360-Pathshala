package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "exam_class_assignments", uniqueConstraints =
        @UniqueConstraint(name = "uq_exam_class_assignments_scope", columnNames = {"school_id", "exam_id", "class_id", "section_key"}))
public class ExamClassAssignment extends TenantEntity {
    @Column(name = "exam_id", nullable = false)
    private Long examId;

    @Column(name = "class_id", nullable = false)
    private Long classId;

    @Column(name = "section_id")
    private Long sectionId;

    @Column(name = "section_key", insertable = false, updatable = false,
            columnDefinition = "BIGINT GENERATED ALWAYS AS (COALESCE(section_id,0)) STORED")
    private Long sectionKey;

    @Column(nullable = false)
    private boolean published;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;
}
