package com.pathshala.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "exam_types")
public class ExamType extends TenantEntity {
    private String name;
    private Integer weightage;
}
