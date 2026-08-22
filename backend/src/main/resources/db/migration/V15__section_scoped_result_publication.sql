SET @schema_name = DATABASE();

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=@schema_name AND table_name='exam_class_assignments' AND column_name='section_id')=0,
  'ALTER TABLE exam_class_assignments ADD COLUMN section_id BIGINT NULL AFTER class_id', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=@schema_name AND table_name='exam_class_assignments' AND column_name='published')=0,
  'ALTER TABLE exam_class_assignments ADD COLUMN published BOOLEAN NOT NULL DEFAULT FALSE AFTER section_id', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=@schema_name AND table_name='exam_class_assignments' AND column_name='published_at')=0,
  'ALTER TABLE exam_class_assignments ADD COLUMN published_at DATETIME NULL AFTER published', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @old_index = (SELECT index_name FROM information_schema.statistics WHERE table_schema=@schema_name AND table_name='exam_class_assignments'
  AND index_name='uq_exam_class_assignments_school_exam_class' LIMIT 1);
SET @sql = IF(@old_index IS NULL, 'SELECT 1', 'ALTER TABLE exam_class_assignments DROP INDEX uq_exam_class_assignments_school_exam_class');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=@schema_name AND table_name='exam_class_assignments' AND column_name='section_key')=0,
  'ALTER TABLE exam_class_assignments ADD COLUMN section_key BIGINT GENERATED ALWAYS AS (COALESCE(section_id,0)) STORED', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=@schema_name AND table_name='exam_class_assignments'
  AND column_name='section_key' AND extra NOT LIKE '%GENERATED%')>0,
  'ALTER TABLE exam_class_assignments MODIFY COLUMN section_key BIGINT GENERATED ALWAYS AS (COALESCE(section_id,0)) STORED', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=@schema_name AND table_name='exam_class_assignments' AND index_name='uq_exam_class_assignments_scope')=0,
  'ALTER TABLE exam_class_assignments ADD UNIQUE INDEX uq_exam_class_assignments_scope (school_id,exam_id,class_id,section_key)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT IGNORE INTO exam_class_assignments
  (school_id, exam_id, class_id, section_id, published, published_at, created_at, is_deleted)
SELECT DISTINCT es.school_id, es.exam_id, es.class_id, es.section_id, e.published,
  CASE WHEN e.published THEN COALESCE(e.updated_at, CURRENT_TIMESTAMP) ELSE NULL END,
  CURRENT_TIMESTAMP, FALSE
FROM exam_subjects es
JOIN exams e ON e.id=es.exam_id AND e.school_id=es.school_id AND e.is_deleted=FALSE
WHERE es.is_deleted=FALSE AND es.class_id IS NOT NULL AND es.section_id IS NOT NULL;

UPDATE exam_class_assignments a
JOIN exams e ON e.id=a.exam_id AND e.school_id=a.school_id
SET a.published=TRUE, a.published_at=COALESCE(a.published_at,e.updated_at,CURRENT_TIMESTAMP)
WHERE a.section_id IS NOT NULL AND e.published=TRUE AND a.is_deleted=FALSE;

-- Null-section legacy routines cannot be assigned a real section safely. They retain the
-- legacy exam flag and require section repair before any section-scoped operation.
UPDATE exams e
JOIN (
  SELECT school_id, exam_id, COUNT(*) AS scope_count,
         SUM(CASE WHEN published THEN 1 ELSE 0 END) AS published_count
  FROM exam_class_assignments
  WHERE section_id IS NOT NULL AND is_deleted=FALSE
  GROUP BY school_id, exam_id
) concrete ON concrete.school_id=e.school_id AND concrete.exam_id=e.id
SET e.published=(concrete.published_count=concrete.scope_count),
    e.status=CASE
      WHEN concrete.published_count=concrete.scope_count THEN 'COMPLETED'
      WHEN e.status IN ('DRAFT','UPCOMING') THEN e.status
      ELSE 'ACTIVE'
    END
WHERE concrete.scope_count > 0 AND e.is_deleted=FALSE;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=@schema_name AND table_name='exam_class_assignments' AND index_name='idx_exam_class_assignments_exam_scope_published')=0,
  'ALTER TABLE exam_class_assignments ADD INDEX idx_exam_class_assignments_exam_scope_published (school_id,exam_id,section_id,published,is_deleted)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=@schema_name AND table_name='exam_class_assignments' AND index_name='idx_exam_class_assignments_class_section')=0,
  'ALTER TABLE exam_class_assignments ADD INDEX idx_exam_class_assignments_class_section (school_id,class_id,section_id,exam_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
