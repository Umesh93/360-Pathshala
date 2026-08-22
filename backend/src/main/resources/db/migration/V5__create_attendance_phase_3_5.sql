ALTER TABLE attendance ADD COLUMN academic_session_id BIGINT NULL;
ALTER TABLE attendance ADD COLUMN marked_by BIGINT NULL;
UPDATE attendance a INNER JOIN academic_years y ON y.school_id = a.school_id AND y.active = TRUE AND y.is_deleted = FALSE
SET a.academic_session_id = y.id WHERE a.academic_session_id IS NULL;
UPDATE attendance SET marked_by = IFNULL(created_by, 0) WHERE marked_by IS NULL;
DELETE FROM attendance WHERE academic_session_id IS NULL;
DELETE older FROM attendance older
INNER JOIN attendance newer
    ON newer.school_id = older.school_id
    AND newer.student_id = older.student_id
    AND newer.attendance_date = older.attendance_date
    AND newer.id > older.id;
ALTER TABLE attendance MODIFY COLUMN academic_session_id BIGINT NOT NULL;
ALTER TABLE attendance MODIFY COLUMN marked_by BIGINT NOT NULL;
ALTER TABLE attendance ADD UNIQUE KEY uq_attendance_school_student_date (school_id, student_id, attendance_date);
CREATE INDEX idx_attendance_school_date ON attendance (school_id, attendance_date);
CREATE INDEX idx_attendance_school_session ON attendance (school_id, academic_session_id);
ALTER TABLE notifications ADD COLUMN metadata LONGTEXT NULL;

CREATE TABLE teacher_attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in TIME NULL,
    check_out TIME NULL,
    status VARCHAR(20) NOT NULL,
    remarks VARCHAR(1000),
    marked_by BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE KEY uq_teacher_attendance_school_teacher_date (school_id, teacher_id, attendance_date),
    KEY idx_teacher_attendance_school_date (school_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attendance_corrections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    attendance_type VARCHAR(20) NOT NULL,
    attendance_id BIGINT NOT NULL,
    previous_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL,
    reason VARCHAR(1000) NOT NULL,
    requested_by BIGINT NOT NULL,
    reviewed_by BIGINT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    KEY idx_attendance_corrections_school_status (school_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attendance_holidays (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL,
    starts_on DATE NOT NULL,
    ends_on DATE NOT NULL,
    description VARCHAR(1000),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    KEY idx_attendance_holidays_school_range (school_id, starts_on, ends_on)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attendance_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT NOT NULL,
    school_start_time TIME NOT NULL DEFAULT '09:00:00',
    late_after TIME NOT NULL DEFAULT '09:15:00',
    allow_teacher_self_checkin BOOLEAN NOT NULL DEFAULT TRUE,
    allow_future_attendance BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE KEY uq_attendance_settings_school (school_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
