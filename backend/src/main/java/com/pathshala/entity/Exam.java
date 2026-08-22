package com.pathshala.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "exams")
public class Exam extends TenantEntity {
    @Column(name = "academic_session_id")
    private Long academicSessionId;
    @Column(name = "exam_type_id")
    private Long examTypeId;
    @Column(name = "class_id")
    private Long classId;
    private String name;
    private LocalDate startsOn;
    private LocalDate endsOn;
    @Column(name = "publish_date")
    private LocalDate resultPublishDate;
    @Column(length = 1000)
    private String description;
    private String status = "UPCOMING";
    private boolean published;
    private boolean includeInCgpa;

    @Deprecated
    @JsonProperty("publishDate")
    public LocalDate legacyPublishDate() {
        return resultPublishDate;
    }
}
