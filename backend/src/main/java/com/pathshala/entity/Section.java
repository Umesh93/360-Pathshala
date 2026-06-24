package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "sections")
public class Section extends TenantEntity {
    @Column(name = "class_id", nullable = false)
    private Long classId;
    private String name;
    private Integer capacity;
}
