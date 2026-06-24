package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "data_access_logs")
public class DataAccessLog extends BaseEntity {
    @Column(name = "school_id")
    private Long schoolId;
    @Column(name = "user_id")
    private Long userId;
    private String resource;
    private String action;
    private String ipAddress;
    @Column(length = 2000)
    private String description;
}
