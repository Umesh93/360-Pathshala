-- Hibernate ddl-auto created the enum-backed catalogue columns before V21 could
-- backfill existing rows. MariaDB validates both checks on every update, so both
-- blank values must be normalized atomically. No module rows are deleted.
UPDATE modules
SET billing_period = 'ANNUAL',
    billing_type = CASE
        WHEN code IN ('STUDENT_MANAGEMENT','SUBJECT_MANAGEMENT','EXAMINATION') THEN 'REQUIRED'
        WHEN code IN ('TEACHER_MANAGEMENT','TEACHER_ASSIGNMENT','ATTENDANCE','PARENT_MANAGEMENT') THEN 'INCLUDED'
        WHEN code IN ('ASSIGNMENT','TIMETABLE','FEE_MANAGEMENT','ACADEMIC_CALENDAR','STUDENT_DASHBOARD','TEACHER_DASHBOARD','PARENT_DASHBOARD','CERTIFICATES') THEN 'PAID'
        ELSE 'COMING_SOON'
    END
WHERE billing_period IS NULL OR TRIM(billing_period) = ''
   OR billing_type IS NULL OR TRIM(billing_type) = '';

-- Preserve historical fixed plans while making their enum-backed metadata
-- readable by Hibernate. Active checkout no longer exposes these records.
UPDATE subscription_plans
SET pricing_model = 'LEGACY_FIXED'
WHERE pricing_model IS NULL OR TRIM(pricing_model) = '';
