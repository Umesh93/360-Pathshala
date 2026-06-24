package com.pathshala.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "academic_years")
public class AcademicYear extends TenantEntity {
    private String name;
    private LocalDate startsOn;
    private LocalDate endsOn;
    private boolean active;
}
