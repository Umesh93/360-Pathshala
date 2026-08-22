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
    private String province;
    private String district;
    private String municipality;
    private Integer ward;
    private String street;
    private String academicYear;
    private String medium;
    private LocalDate admissionDate;
    private String house;
    private String scholarship;
    private String middleName;
    private String bloodGroup;
    private String religion;
    private String caste;
    private String nationality;
    private String motherTongue;
    private String studentPhone;
    private String studentEmail;
    private String citizenshipNumber;
    private String emisId;
    private String studentIdBarcode;
    @Column(columnDefinition = "LONGTEXT")
    private String photo;
    @Column(name = "parent_guardian_details", columnDefinition = "LONGTEXT")
    private String parentGuardianDetails;
    private String medicalBloodGroup;
    private String height;
    private String weight;
    @Column(columnDefinition = "TEXT")
    private String medicalConditions;
    @Column(columnDefinition = "TEXT")
    private String medicalConditionsOther;
    @Column(columnDefinition = "TEXT")
    private String allergies;
    private String disability;
    private String emergencyContactPerson;
    private String emergencyContactNumber;
    private String previousSchool;
    private String previousAddress;
    private String previousClass;
    private String transferCertificateNumber;
    private String reasonForLeaving;
    private Boolean hasHostel;
    private String hostel;
    private String roomNumber;
    private String bedNumber;
    private Boolean usesTransport;
    private String route;
    private String pickupPoint;
    private String vehicle;
    @Column(columnDefinition = "LONGTEXT")
    private String documents;
    @Column(columnDefinition = "TEXT")
    private String documentCategories;
    @Column(columnDefinition = "TEXT")
    private String notes;
}
