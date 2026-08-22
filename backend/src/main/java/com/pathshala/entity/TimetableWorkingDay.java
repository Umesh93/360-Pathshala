package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.DayOfWeek;

@Getter
@Setter
@Entity
@Table(name = "timetable_working_days", uniqueConstraints = @UniqueConstraint(
        name = "uq_tt_working_day", columnNames = {"school_id", "academic_session_id", "day_of_week"}))
public class TimetableWorkingDay extends TenantEntity {
    @Column(name = "academic_session_id", nullable = false)
    private Long academicSessionId;
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;
    @Column(nullable = false)
    private boolean active = true;
}
