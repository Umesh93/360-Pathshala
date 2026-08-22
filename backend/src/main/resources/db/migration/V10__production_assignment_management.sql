ALTER TABLE assignments ADD COLUMN academic_session_id BIGINT NULL;
ALTER TABLE assignments ADD COLUMN category VARCHAR(40) NOT NULL DEFAULT 'HOMEWORK';
ALTER TABLE assignments MODIFY COLUMN description LONGTEXT NULL;
ALTER TABLE assignments ADD COLUMN instructions LONGTEXT NULL;
ALTER TABLE assignments ADD COLUMN publish_at DATETIME NULL;
ALTER TABLE assignments ADD COLUMN maximum_marks DECIMAL(10,2) NULL;
ALTER TABLE assignments ADD COLUMN allow_late_submission BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE assignments ADD COLUMN late_submission_deadline DATETIME NULL;
ALTER TABLE assignments ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'DRAFT';
ALTER TABLE assignments ADD COLUMN attachment_metadata LONGTEXT NULL;
ALTER TABLE assignments ADD COLUMN reminder_sent_at DATETIME NULL;

UPDATE assignments a
INNER JOIN academic_years y ON y.school_id = a.school_id AND y.active = TRUE AND y.is_deleted = FALSE
SET a.academic_session_id = y.id
WHERE a.academic_session_id IS NULL;
UPDATE assignments SET publish_at = COALESCE(created_at, NOW()), status = 'ACTIVE'
WHERE status = 'DRAFT' AND due_at IS NOT NULL AND due_at >= NOW();
UPDATE assignments SET publish_at = COALESCE(created_at, NOW()), status = 'CLOSED'
WHERE status = 'DRAFT' AND due_at IS NOT NULL AND due_at < NOW();
CREATE INDEX idx_assignments_scope ON assignments (school_id, academic_session_id, class_id, subject_id, teacher_id, status);
CREATE INDEX idx_assignments_publish_due ON assignments (school_id, publish_at, due_at, status);

CREATE TABLE assignment_sections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    assignment_id BIGINT NOT NULL,
    section_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE KEY uq_assignment_sections_school_assignment_section (school_id, assignment_id, section_id),
    KEY idx_assignment_sections_school_section (school_id, section_id, assignment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO assignment_sections (school_id, assignment_id, section_id, created_at, updated_at, created_by, updated_by, is_deleted)
SELECT school_id, id, section_id, COALESCE(created_at, NOW()), updated_at, created_by, updated_by, FALSE
FROM assignments WHERE section_id IS NOT NULL;

ALTER TABLE assignment_submissions ADD COLUMN attachment_metadata LONGTEXT NULL;
ALTER TABLE assignment_submissions MODIFY COLUMN answer_text LONGTEXT NULL;
ALTER TABLE assignment_submissions ADD COLUMN comments LONGTEXT NULL;
ALTER TABLE assignment_submissions ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
ALTER TABLE assignment_submissions ADD COLUMN percentage DECIMAL(7,2) NULL;
ALTER TABLE assignment_submissions MODIFY COLUMN feedback LONGTEXT NULL;
ALTER TABLE assignment_submissions ADD COLUMN reviewed_by BIGINT NULL;
ALTER TABLE assignment_submissions ADD COLUMN reviewed_at DATETIME NULL;
UPDATE assignment_submissions SET status = CASE
    WHEN marks IS NOT NULL THEN 'GRADED'
    WHEN submitted_at IS NOT NULL THEN 'SUBMITTED'
    ELSE 'PENDING' END;
UPDATE assignment_submissions s
INNER JOIN assignments a ON a.id = s.assignment_id AND a.school_id = s.school_id
SET s.percentage = ROUND((s.marks * 100) / a.maximum_marks, 2)
WHERE s.marks IS NOT NULL AND a.maximum_marks IS NOT NULL AND a.maximum_marks > 0;

-- Preserve an active row before a newer deleted row, then prefer the newest within that priority.
DELETE older FROM assignment_submissions older
INNER JOIN assignment_submissions newer ON newer.school_id = older.school_id
    AND newer.assignment_id = older.assignment_id AND newer.student_id = older.student_id
    AND (newer.is_deleted < older.is_deleted
         OR (newer.is_deleted = older.is_deleted AND newer.id > older.id));
ALTER TABLE assignment_submissions ADD UNIQUE KEY uq_assignment_submission (school_id, assignment_id, student_id);
CREATE INDEX idx_assignment_submissions_roster ON assignment_submissions (school_id, assignment_id, status);
