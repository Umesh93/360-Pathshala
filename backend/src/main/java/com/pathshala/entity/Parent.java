package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "parents")
public class Parent extends TenantEntity {
    @Column(name = "user_id")
    private Long userId;
    private String fullName;
    private String phone;
    private String email;
    private String address;
}
