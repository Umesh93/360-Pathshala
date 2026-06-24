package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "exams")
public class Exam extends TenantEntity {
    @Column(name = "exam_type_id")
    private Long examTypeId;
    @Column(name = "class_id")
    private Long classId;
    private String name;
    private LocalDate startsOn;
    private LocalDate endsOn;
    private boolean published;
}
