CREATE TABLE exam_class_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    exam_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE KEY uq_exam_class_assignments_school_exam_class (school_id, exam_id, class_id),
    KEY idx_exam_class_assignments_school_class (school_id, class_id, exam_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO exam_class_assignments (school_id, exam_id, class_id, created_at, is_deleted)
SELECT school_id, id, class_id, CURRENT_TIMESTAMP, FALSE
FROM exams
WHERE class_id IS NOT NULL AND is_deleted = FALSE;

INSERT IGNORE INTO exam_class_assignments (school_id, exam_id, class_id, created_at, is_deleted)
SELECT school_id, exam_id, class_id, CURRENT_TIMESTAMP, FALSE
FROM exam_subjects
WHERE class_id IS NOT NULL AND is_deleted = FALSE;

-- exams.class_id remains for compatibility. Application reads assignments exclusively from this mapping.
