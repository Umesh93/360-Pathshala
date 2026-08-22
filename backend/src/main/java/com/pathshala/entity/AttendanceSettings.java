package com.pathshala.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "attendance_settings", uniqueConstraints = @UniqueConstraint(columnNames = "school_id"))
public class AttendanceSettings extends TenantEntity {
    @Column(name = "school_start_time", nullable = false)
    private LocalTime schoolStartTime = LocalTime.of(9, 0);
    @Column(name = "late_after", nullable = false)
    private LocalTime lateAfter = LocalTime.of(9, 15);
    @Column(name = "allow_teacher_self_checkin", nullable = false)
    private boolean allowTeacherSelfCheckin = true;
    @Column(name = "allow_future_attendance", nullable = false)
    private boolean allowFutureAttendance;
}
