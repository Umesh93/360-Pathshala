package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "teacher_subjects")
public class TeacherSubject extends TenantEntity {
    @Column(name = "teacher_id")
    private Long teacherId;
    @Column(name = "subject_id")
    private Long subjectId;
    @Column(name = "class_id")
    private Long classId;
    @Column(name = "section_id")
    private Long sectionId;
}
