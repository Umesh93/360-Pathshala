package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.math.BigDecimal;

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
    private String middleName;
    private String gender;
    private LocalDate dateOfBirth;
    private String email;
    private String photo;
    private LocalDate joiningDate;
    private String employmentType;
    private String department;
    private String designation;
    private String experience;
    private BigDecimal basicSalary;
    @Column(columnDefinition = "LONGTEXT")
    private String details;
}
