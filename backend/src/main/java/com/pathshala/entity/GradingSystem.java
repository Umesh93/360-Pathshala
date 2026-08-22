package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "grading_systems")
public class GradingSystem extends TenantEntity {
    @Column(name = "academic_session_id", nullable = false)
    private Long academicSessionId;
    @Column(nullable = false)
    private String name;
    private boolean active;
}
