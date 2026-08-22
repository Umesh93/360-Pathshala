package com.pathshala.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "assignment_sections", uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "assignment_id", "section_id"}))
public class AssignmentSection extends TenantEntity {
    @Column(name = "assignment_id", nullable = false)
    private Long assignmentId;
    @Column(name = "section_id", nullable = false)
    private Long sectionId;
}
