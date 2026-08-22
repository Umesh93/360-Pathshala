package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "municipalities")
public class Municipality extends BaseEntity {
    @Column(name = "district_id", nullable = false)
    private Long districtId;
    private String name;
    @Column(name = "type")
    private String type;
    private String code;
}
