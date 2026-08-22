package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "schools")
public class School extends BaseEntity {
    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    private String address;
    private String phone;
    @Column(nullable = false)
    private String contactPerson;
    @Column(nullable = false)
    private String designation;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String status = "DEMO";

    private boolean active = true;

    @JsonIgnore
    @Column(length = 500)
    private String logo;
}
