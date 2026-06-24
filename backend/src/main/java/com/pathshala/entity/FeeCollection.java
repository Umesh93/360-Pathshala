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
@Table(name = "fee_collections")
public class FeeCollection extends TenantEntity {
    @Column(name = "student_id")
    private Long studentId;
    @Column(name = "fee_structure_id")
    private Long feeStructureId;
    private BigDecimal paidAmount;
    private BigDecimal discount;
    private BigDecimal fine;
    private LocalDate paidOn;
    private String paymentMode;
    private String receiptNumber;
}
