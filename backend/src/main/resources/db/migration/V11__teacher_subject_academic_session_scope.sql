ALTER TABLE teacher_subjects ADD COLUMN academic_session_id BIGINT NULL AFTER school_id;

CREATE TEMPORARY TABLE teacher_subject_session_backfill AS
SELECT school_id,
       COALESCE(
           CAST(SUBSTRING_INDEX(GROUP_CONCAT(CASE WHEN active = TRUE AND is_deleted = FALSE THEN id END ORDER BY starts_on DESC, id DESC), ',', 1) AS UNSIGNED),
           CAST(SUBSTRING_INDEX(GROUP_CONCAT(CASE WHEN is_deleted = FALSE THEN id END ORDER BY starts_on DESC, id DESC), ',', 1) AS UNSIGNED)
       ) AS academic_session_id
FROM academic_years
GROUP BY school_id;

UPDATE teacher_subjects ts
JOIN teacher_subject_session_backfill chosen ON chosen.school_id = ts.school_id
SET ts.academic_session_id = chosen.academic_session_id
WHERE ts.academic_session_id IS NULL AND chosen.academic_session_id IS NOT NULL;

DROP TEMPORARY TABLE teacher_subject_session_backfill;

-- Keep an active mapping before a deleted mapping, then keep the newest row.
DELETE older FROM teacher_subjects older
JOIN teacher_subjects newer ON newer.school_id = older.school_id
    AND newer.academic_session_id = older.academic_session_id
    AND newer.class_id = older.class_id
    AND newer.section_id = older.section_id
    AND newer.subject_id = older.subject_id
    AND older.academic_session_id IS NOT NULL
    AND (newer.is_deleted < older.is_deleted
         OR (newer.is_deleted = older.is_deleted AND newer.id > older.id));

CREATE INDEX idx_teacher_subject_teacher_session
    ON teacher_subjects (school_id, teacher_id, academic_session_id, class_id, section_id, subject_id, is_deleted);
ALTER TABLE teacher_subjects ADD UNIQUE KEY uq_teacher_subject_canonical_scope
    (school_id, academic_session_id, class_id, section_id, subject_id);
