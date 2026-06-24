package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "attendance")
public class Attendance extends TenantEntity {
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    @Column(name = "class_id")
    private Long classId;
    @Column(name = "section_id")
    private Long sectionId;
    @Column(nullable = false)
    private LocalDate attendanceDate;
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;
    private String remarks;
}
