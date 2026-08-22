package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "demo_requests")
public class DemoRequest extends BaseEntity {
    @Version
    private Long version;

    @Column(nullable = false, unique = true)
    private String requestCode;

    @Column(nullable = false)
    private String schoolName;

    @Column(nullable = false)
    private String contactPerson;
    @Column(nullable = false)
    private String designation;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    private String address;

    @Column(name = "student_count")
    private Integer studentCount;

    @Column(length = 1000)
    private String interestedModules;

    @Column(length = 2000)
    private String message;


    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "logo_key", length = 500)
    private String logoKey;

    @Column(name = "provisioned_school_id", unique = true)
    private Long provisionedSchoolId;

    @Column(name = "demo_school_id", unique = true)
    private Long demoSchoolId;

    @Column(name = "accepted_at")
    private java.time.Instant acceptedAt;

    @Column(name = "accepted_by")
    private Long acceptedBy;

    @Column(name = "email_status", nullable = false, length = 20)
    private String emailStatus = "PENDING";

    @Column(name = "email_error", length = 500)
    private String emailError;

    @Column(name = "credentials_sent_at")
    private java.time.Instant credentialsSentAt;
}
