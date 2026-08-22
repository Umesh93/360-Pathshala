package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "demo_schools")
public class DemoSchool extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String demoCode;

    @Column(name = "demo_request_id", unique = true)
    private Long demoRequestId;

    @Column(name = "school_id", unique = true)
    private Long schoolId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(length = 1000)
    private String enabledModules;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(length = 1000)
    private String remarks;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";
}
