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

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "timetables", indexes = @Index(name = "idx_tt_scope",
        columnList = "school_id,academic_session_id,class_id,section_id,status,is_deleted"))
public class Timetable extends TenantEntity {
    public enum Status { DRAFT, ACTIVE, ARCHIVED }

    @Column(name = "academic_session_id", nullable = false)
    private Long academicSessionId;
    @Column(name = "class_id", nullable = false)
    private Long classId;
    @Column(name = "section_id", nullable = false)
    private Long sectionId;
    @Column(nullable = false)
    private String name;
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false)
    private Status status = Status.DRAFT;
    @Column(name = "effective_from")
    private LocalDate effectiveFrom;
    @Column(name = "effective_to")
    private LocalDate effectiveTo;
}
