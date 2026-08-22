package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
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
@Table(name = "timetable_entries", uniqueConstraints = @UniqueConstraint(
        name = "uq_tt_entry_cell", columnNames = {"school_id", "timetable_id", "day_of_week", "period_id"}),
        indexes = {
                @Index(name = "idx_tt_entry_teacher", columnList = "school_id,day_of_week,period_id,teacher_id,is_deleted"),
                @Index(name = "idx_tt_entry_room", columnList = "school_id,day_of_week,period_id,room,is_deleted")
        })
public class TimetableEntry extends TenantEntity {
    @Column(name = "timetable_id", nullable = false)
    private Long timetableId;
    @Column(name = "period_id", nullable = false)
    private Long periodId;
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;
    @Column(name = "subject_id")
    private Long subjectId;
    @Column(name = "teacher_id")
    private Long teacherId;
    private String room;
    @Column(length = 1000)
    private String remarks;
}
