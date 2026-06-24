package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "audit_logs")
public class AuditLog extends BaseEntity {
    @Column(name = "school_id")
    private Long schoolId;
    @Column(name = "user_id")
    private Long userId;
    private String action;
    private String ipAddress;
    @Column(length = 2000)
    private String description;
}
