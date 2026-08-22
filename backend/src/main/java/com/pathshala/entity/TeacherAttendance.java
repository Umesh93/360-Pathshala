package com.pathshala.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "teacher_attendance", uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "teacher_id", "attendance_date"}))
public class TeacherAttendance extends TenantEntity {
    @Column(name = "teacher_id", nullable = false)
    private Long teacherId;
    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;
    @Column(name = "check_in")
    private LocalTime checkIn;
    @Column(name = "check_out")
    private LocalTime checkOut;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;
    private String remarks;
    @Column(name = "marked_by", nullable = false)
    private Long markedBy;
}
