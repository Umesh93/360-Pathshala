package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "fee_structures")
public class FeeStructure extends TenantEntity {
    @Column(name = "fee_category_id")
    private Long feeCategoryId;
    @Column(name = "class_id")
    private Long classId;
    private BigDecimal amount;
    private LocalDate dueDate;
}
