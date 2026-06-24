package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "students", uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "admission_number"}))
public class Student extends TenantEntity {
    @Column(name = "user_id")
    private Long userId;
    @Column(name = "parent_id")
    private Long parentId;
    @Column(name = "class_id")
    private Long classId;
    @Column(name = "section_id")
    private Long sectionId;
    @Column(name = "admission_number", nullable = false)
    private String admissionNumber;
    private String rollNumber;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private String status = "ACTIVE";
}
