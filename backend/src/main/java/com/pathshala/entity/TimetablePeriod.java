package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "timetable_periods", indexes = {
        @Index(name = "idx_tt_period_session", columnList = "school_id,academic_session_id,is_deleted,active"),
        @Index(name = "idx_tt_period_time", columnList = "school_id,academic_session_id,start_time,end_time")
})
public class TimetablePeriod extends TenantEntity {
    public enum Type {
        TEACHING_PERIOD, ASSEMBLY, TEA_BREAK, LUNCH_BREAK, ACTIVITY, EXTRA_CLASS
    }

    @Column(name = "academic_session_id", nullable = false)
    private Long academicSessionId;
    @Column(nullable = false)
    private String name;
    @Column(name = "period_number")
    private Integer periodNumber;
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false)
    private Type type;
    @Column(nullable = false)
    private boolean active = true;

    public boolean isSubjectAllocatable() {
        return type == Type.TEACHING_PERIOD || type == Type.EXTRA_CLASS;
    }
}
