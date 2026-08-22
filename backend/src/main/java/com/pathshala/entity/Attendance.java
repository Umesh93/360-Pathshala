package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "attendance", uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "student_id", "attendance_date"}))
public class Attendance extends TenantEntity {
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    @Column(name = "class_id")
    private Long classId;
    @Column(name = "section_id")
    private Long sectionId;
    @Column(name = "academic_session_id", nullable = false)
    private Long academicSessionId;
    @Column(nullable = false)
    private LocalDate attendanceDate;
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;
    private String remarks;
    @Column(name = "marked_by", nullable = false)
    private Long markedBy;
}
