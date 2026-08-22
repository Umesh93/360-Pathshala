package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "wards")
public class Ward extends BaseEntity {
    @Column(name = "municipality_id", nullable = false)
    private Long municipalityId;
    @Column(name = "number", nullable = false)
    private Integer number;
    private String name;
}
