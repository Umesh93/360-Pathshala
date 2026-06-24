package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "teachers", uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "employee_number"}))
public class Teacher extends TenantEntity {
    @Column(name = "user_id")
    private Long userId;
    @Column(name = "employee_number", nullable = false)
    private String employeeNumber;
    private String firstName;
    private String lastName;
    private String phone;
    private String qualification;
    private String status = "ACTIVE";
}
