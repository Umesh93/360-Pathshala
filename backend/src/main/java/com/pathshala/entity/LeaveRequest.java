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
@Table(name = "leave_requests")
public class LeaveRequest extends TenantEntity {
    @Column(name = "requester_user_id")
    private Long requesterUserId;
    @Column(name = "student_id")
    private Long studentId;
    @Column(name = "teacher_id")
    private Long teacherId;
    private LocalDate startsOn;
    private LocalDate endsOn;
    @Column(length = 1000)
    private String reason;
    @Enumerated(EnumType.STRING)
    private LeaveStatus status = LeaveStatus.PENDING;
    private String decisionRemarks;
}
