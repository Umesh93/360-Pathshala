ALTER TABLE exams ADD COLUMN academic_session_id BIGINT NULL;
ALTER TABLE exams ADD COLUMN publish_date DATE NULL;
ALTER TABLE exams ADD COLUMN description VARCHAR(1000) NULL;
ALTER TABLE exams ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING';
UPDATE exams e INNER JOIN academic_years y ON y.school_id = e.school_id AND y.active = TRUE AND y.is_deleted = FALSE SET e.academic_session_id = y.id WHERE e.academic_session_id IS NULL;
UPDATE exams SET status = CASE WHEN published = TRUE THEN 'COMPLETED' WHEN ends_on < CURDATE() THEN 'COMPLETED' WHEN starts_on <= CURDATE() THEN 'ACTIVE' ELSE 'UPCOMING' END;
UPDATE exams older INNER JOIN exams newer ON newer.school_id = older.school_id AND newer.academic_session_id = older.academic_session_id AND LOWER(newer.name) = LOWER(older.name) AND newer.id > older.id SET older.name = CONCAT(LEFT(older.name, 220), ' (legacy ', older.id, ')') WHERE older.academic_session_id IS NOT NULL;
ALTER TABLE exams ADD UNIQUE KEY uq_exams_school_session_name (school_id, academic_session_id, name);
CREATE INDEX idx_exams_school_session_status ON exams (school_id, academic_session_id, status);

ALTER TABLE exam_subjects ADD COLUMN class_id BIGINT NULL;
ALTER TABLE exam_subjects ADD COLUMN section_id BIGINT NULL;
ALTER TABLE exam_subjects ADD COLUMN start_time TIME NULL;
ALTER TABLE exam_subjects ADD COLUMN end_time TIME NULL;
ALTER TABLE exam_subjects ADD COLUMN room VARCHAR(255) NULL;
ALTER TABLE exam_subjects ADD COLUMN invigilator_id BIGINT NULL;
UPDATE exam_subjects es INNER JOIN exams e ON e.id = es.exam_id AND e.school_id = es.school_id SET es.class_id = e.class_id WHERE es.class_id IS NULL;
CREATE INDEX idx_exam_subjects_routine ON exam_subjects (school_id, exam_id, class_id, section_id, exam_date);
ALTER TABLE exam_subjects ADD UNIQUE KEY uq_exam_subject_section_subject (school_id, exam_id, class_id, section_id, subject_id);

ALTER TABLE marks ADD COLUMN absent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE marks ADD COLUMN marked_by BIGINT NULL;
UPDATE marks SET marked_by = created_by WHERE marked_by IS NULL;
UPDATE marks SET obtained_marks = 0, result_status = 'ABSENT' WHERE absent = TRUE;
DELETE older FROM marks older INNER JOIN marks newer ON newer.school_id = older.school_id AND newer.exam_subject_id = older.exam_subject_id AND newer.student_id = older.student_id AND newer.id > older.id;
ALTER TABLE marks ADD UNIQUE KEY uq_marks_school_routine_student (school_id, exam_subject_id, student_id);
CREATE INDEX idx_marks_school_student ON marks (school_id, student_id);

CREATE TABLE grading_systems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    academic_session_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    KEY idx_grading_system_session (school_id, academic_session_id, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE grade_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    grading_system_id BIGINT NOT NULL,
    min_percentage DECIMAL(7,4) NOT NULL,
    max_percentage DECIMAL(7,4) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    gpa DECIMAL(5,2) NOT NULL,
    passing BOOLEAN NOT NULL DEFAULT FALSE,
    remarks VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    KEY idx_grade_rules_system_range (school_id, grading_system_id, min_percentage, max_percentage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
