package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "districts")
public class District extends BaseEntity {
    @Column(name = "province_id", nullable = false)
    private Long provinceId;
    private String name;
    private String code;
}
