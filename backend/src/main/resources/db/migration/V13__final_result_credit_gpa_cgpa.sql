CREATE TABLE subject_academic_configs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    school_id BIGINT NOT NULL,
    academic_session_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    credit_hours DECIMAL(8,2) NULL,
    include_in_gpa BIT(1) NOT NULL DEFAULT b'1',
    include_in_cgpa BIT(1) NOT NULL DEFAULT b'0',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    is_deleted BIT(1) NOT NULL DEFAULT b'0',
    PRIMARY KEY (id),
    UNIQUE KEY uq_subject_academic_scope (school_id, academic_session_id, class_id, subject_id),
    KEY idx_subject_academic_list (school_id, academic_session_id, class_id, is_deleted),
    CONSTRAINT chk_subject_academic_credit CHECK (credit_hours IS NULL OR credit_hours > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE exams ADD COLUMN include_in_cgpa BIT(1) NOT NULL DEFAULT b'0';
ALTER TABLE exam_subjects
    ADD COLUMN credit_hours_snapshot DECIMAL(8,2) NULL,
    ADD COLUMN include_in_gpa_snapshot BIT(1) NULL,
    ADD COLUMN include_in_cgpa_snapshot BIT(1) NULL,
    ADD COLUMN grading_system_id_snapshot BIGINT NULL;
ALTER TABLE marks
    ADD COLUMN subject_percentage DECIMAL(7,4) NULL,
    ADD COLUMN quality_points DECIMAL(12,4) NULL,
    ADD COLUMN result_remarks VARCHAR(1000) NULL;

CREATE INDEX idx_exam_cgpa_periods ON exams (school_id, academic_session_id, include_in_cgpa, published, is_deleted);
CREATE INDEX idx_exam_subject_grade_snapshot ON exam_subjects (school_id, grading_system_id_snapshot, is_deleted);

UPDATE marks m
JOIN exam_subjects r ON r.id = m.exam_subject_id AND r.school_id = m.school_id
SET m.subject_percentage = CASE WHEN r.full_marks > 0
    THEN m.obtained_marks * 100 / r.full_marks ELSE NULL END
WHERE m.subject_percentage IS NULL AND m.is_deleted = false;
