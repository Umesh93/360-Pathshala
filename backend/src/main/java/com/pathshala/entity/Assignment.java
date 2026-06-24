package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "assignments")
public class Assignment extends TenantEntity {
    @Column(name = "teacher_id")
    private Long teacherId;
    @Column(name = "class_id")
    private Long classId;
    @Column(name = "section_id")
    private Long sectionId;
    @Column(name = "subject_id")
    private Long subjectId;
    private String title;
    @Column(length = 2000)
    private String description;
    private LocalDateTime dueAt;
}
