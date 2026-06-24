package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "notifications")
public class Notification extends TenantEntity {
    @Column(name = "user_id")
    private Long userId;
    private String title;
    @Column(length = 2000)
    private String message;
    private String eventType;
    private boolean readFlag;
}
