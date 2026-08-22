package com.pathshala.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "attendance_corrections")
public class AttendanceCorrection extends TenantEntity {
    @Column(name = "attendance_type", nullable = false)
    private String attendanceType;
    @Column(name = "attendance_id", nullable = false)
    private Long attendanceId;
    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", nullable = false)
    private AttendanceStatus previousStatus;
    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false)
    private AttendanceStatus newStatus;
    @Column(nullable = false, length = 1000)
    private String reason;
    @Column(name = "requested_by", nullable = false)
    private Long requestedBy;
    @Column(name = "reviewed_by")
    private Long reviewedBy;
    @Column(nullable = false)
    private String status = "PENDING";
}
