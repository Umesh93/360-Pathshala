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
@Table(name = "parents", uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "guardian_code"}))
public class Parent extends TenantEntity {
    @Column(name = "user_id")
    private Long userId;
    private String fullName;
    @Column(name = "guardian_code", updatable = false)
    private String guardianCode;
    private String firstName;
    private String middleName;
    private String lastName;
    private String gender;
    private LocalDate dateOfBirth;
    private String phone;
    private String mobile;
    private String alternativeMobile;
    private String landline;
    private String email;
    private String address;
    private String fatherName;
    private String motherName;
    private String relationship;
    private String occupation;
    private String organization;
    private String officeAddress;
    private String citizenshipNumber;
    private String nationality;
    private String religion;
    private String fatherOccupation;
    private String fatherPhone;
    private String fatherEmail;
    private String motherOccupation;
    private String motherPhone;
    private String motherEmail;
    private String status = "ACTIVE";
    private String communicationPreference;
    private String emergencyContactPerson;
    private String emergencyContactNumber;
    private String emergencyContactRelationship;
    @Column(columnDefinition = "LONGTEXT")
    private String photo;
    @Column(columnDefinition = "LONGTEXT")
    private String documents;
    @Column(columnDefinition = "TEXT")
    private String documentMetadata;
    private String notes;
}
