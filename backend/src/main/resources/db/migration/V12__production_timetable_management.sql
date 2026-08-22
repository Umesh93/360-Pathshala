CREATE TABLE IF NOT EXISTS timetable_periods (
    id BIGINT NOT NULL AUTO_INCREMENT,
    school_id BIGINT NOT NULL,
    academic_session_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    period_number INT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type VARCHAR(32) NOT NULL,
    active BIT(1) NOT NULL DEFAULT b'1',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    is_deleted BIT(1) NOT NULL DEFAULT b'0',
    PRIMARY KEY (id),
    UNIQUE KEY uq_tt_period_number (school_id, academic_session_id, period_number),
    UNIQUE KEY uq_tt_period_identity (school_id, academic_session_id, name, start_time, end_time),
    KEY idx_tt_period_session (school_id, academic_session_id, is_deleted, active),
    KEY idx_tt_period_time (school_id, academic_session_id, start_time, end_time),
    CONSTRAINT chk_tt_period_time CHECK (end_time > start_time),
    CONSTRAINT chk_tt_period_number CHECK (period_number IS NULL OR period_number > 0),
    CONSTRAINT chk_tt_teaching_number CHECK (type <> 'TEACHING_PERIOD' OR period_number IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timetable_working_days (
    id BIGINT NOT NULL AUTO_INCREMENT,
    school_id BIGINT NOT NULL,
    academic_session_id BIGINT NOT NULL,
    day_of_week VARCHAR(16) NOT NULL,
    active BIT(1) NOT NULL DEFAULT b'1',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    is_deleted BIT(1) NOT NULL DEFAULT b'0',
    PRIMARY KEY (id),
    UNIQUE KEY uq_tt_working_day (school_id, academic_session_id, day_of_week),
    KEY idx_tt_working_session (school_id, academic_session_id, is_deleted, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timetables (
    id BIGINT NOT NULL AUTO_INCREMENT,
    school_id BIGINT NOT NULL,
    academic_session_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    section_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
    effective_from DATE NULL,
    effective_to DATE NULL,
    canonical_scope VARCHAR(255) GENERATED ALWAYS AS (
        CASE WHEN is_deleted = b'0' AND status <> 'ARCHIVED'
             THEN CONCAT(school_id, ':', academic_session_id, ':', class_id, ':', section_id)
             ELSE NULL END) STORED,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    is_deleted BIT(1) NOT NULL DEFAULT b'0',
    PRIMARY KEY (id),
    UNIQUE KEY uq_tt_canonical_scope (canonical_scope),
    KEY idx_tt_scope (school_id, academic_session_id, class_id, section_id, status, is_deleted),
    CONSTRAINT chk_tt_effective_dates CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timetable_entries (
    id BIGINT NOT NULL AUTO_INCREMENT,
    school_id BIGINT NOT NULL,
    timetable_id BIGINT NOT NULL,
    period_id BIGINT NOT NULL,
    day_of_week VARCHAR(16) NOT NULL,
    subject_id BIGINT NULL,
    teacher_id BIGINT NULL,
    room VARCHAR(255) NULL,
    remarks VARCHAR(1000) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    is_deleted BIT(1) NOT NULL DEFAULT b'0',
    PRIMARY KEY (id),
    UNIQUE KEY uq_tt_entry_cell (school_id, timetable_id, day_of_week, period_id),
    KEY idx_tt_entry_teacher (school_id, day_of_week, period_id, teacher_id, is_deleted),
    KEY idx_tt_entry_room (school_id, day_of_week, period_id, room, is_deleted),
    KEY idx_tt_entry_timetable (school_id, timetable_id, is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO modules (code, name, description, active, created_at, is_deleted)
SELECT 'TIMETABLE', 'Timetable Management', 'Timetable Management module', b'1', CURRENT_TIMESTAMP(6), b'0'
WHERE NOT EXISTS (SELECT 1 FROM modules WHERE code = 'TIMETABLE');

INSERT INTO school_modules (school_id, module_code, active, created_at, is_deleted)
SELECT s.id, 'TIMETABLE', b'1', CURRENT_TIMESTAMP(6), b'0'
FROM schools s
WHERE s.is_deleted = b'0'
  AND NOT EXISTS (SELECT 1 FROM school_modules sm WHERE sm.school_id = s.id AND sm.module_code = 'TIMETABLE');
