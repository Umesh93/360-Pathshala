CREATE TABLE schools (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  address VARCHAR(500), phone VARCHAR(50), email VARCHAR(255), active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE subscription_plans (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  monthly_price DECIMAL(12,2), description VARCHAR(1000), active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE modules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(1000), active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE school_modules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  school_id BIGINT NOT NULL,
  module_code VARCHAR(100) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE KEY uk_school_module (school_id, module_code),
  CONSTRAINT fk_school_modules_school FOREIGN KEY (school_id) REFERENCES schools(id)
);

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  school_id BIGINT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255), active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX idx_users_school (school_id),
  CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES schools(id)
);

CREATE TABLE user_roles (user_id BIGINT NOT NULL, roles VARCHAR(50) NOT NULL, PRIMARY KEY (user_id, roles), CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id));

CREATE TABLE students (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, user_id BIGINT NULL, parent_id BIGINT NULL, class_id BIGINT NULL, section_id BIGINT NULL,
  admission_number VARCHAR(100) NOT NULL, roll_number VARCHAR(100), first_name VARCHAR(150), last_name VARCHAR(150), date_of_birth DATE, gender VARCHAR(50), status VARCHAR(50),
  created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE KEY uk_student_admission (school_id, admission_number), INDEX idx_students_school (school_id)
);

CREATE TABLE teachers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, user_id BIGINT NULL, employee_number VARCHAR(100) NOT NULL, first_name VARCHAR(150), last_name VARCHAR(150), phone VARCHAR(50), qualification VARCHAR(255), status VARCHAR(50),
  created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE KEY uk_teacher_employee (school_id, employee_number), INDEX idx_teachers_school (school_id)
);

CREATE TABLE parents (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, user_id BIGINT NULL, full_name VARCHAR(255), phone VARCHAR(50), email VARCHAR(255), address VARCHAR(500), created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_parents_school (school_id));
CREATE TABLE academic_years (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, name VARCHAR(100), starts_on DATE, ends_on DATE, active BOOLEAN, created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_academic_years_school (school_id));
CREATE TABLE classes (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, name VARCHAR(100), code VARCHAR(50), created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_classes_school (school_id));
CREATE TABLE sections (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, class_id BIGINT NOT NULL, name VARCHAR(100), capacity INT, created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_sections_school (school_id));
CREATE TABLE subjects (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, name VARCHAR(150), code VARCHAR(50), created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_subjects_school (school_id));
CREATE TABLE teacher_subjects (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, teacher_id BIGINT, subject_id BIGINT, class_id BIGINT, section_id BIGINT, created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_teacher_subjects_school (school_id));
CREATE TABLE attendance (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, student_id BIGINT NOT NULL, class_id BIGINT, section_id BIGINT, attendance_date DATE NOT NULL, status VARCHAR(30), remarks VARCHAR(500), created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_attendance_school_date (school_id, attendance_date));
CREATE TABLE exam_types (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, name VARCHAR(150), weightage INT, created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_exam_types_school (school_id));
CREATE TABLE exams (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, exam_type_id BIGINT, class_id BIGINT, name VARCHAR(150), starts_on DATE, ends_on DATE, published BOOLEAN, created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_exams_school (school_id));
CREATE TABLE exam_subjects (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, exam_id BIGINT, subject_id BIGINT, exam_date DATE, full_marks DECIMAL(8,2), pass_marks DECIMAL(8,2), created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_exam_subjects_school (school_id));
CREATE TABLE marks (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, exam_subject_id BIGINT, student_id BIGINT, obtained_marks DECIMAL(8,2), grade VARCHAR(20), gpa DECIMAL(4,2), result_status VARCHAR(30), created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_marks_school_student (school_id, student_id));
CREATE TABLE assignments (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, teacher_id BIGINT, class_id BIGINT, section_id BIGINT, subject_id BIGINT, title VARCHAR(255), description VARCHAR(2000), due_at TIMESTAMP, created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_assignments_school (school_id));
CREATE TABLE assignment_submissions (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, assignment_id BIGINT, student_id BIGINT, file_url VARCHAR(1000), answer_text VARCHAR(2000), submitted_at TIMESTAMP, marks DECIMAL(8,2), feedback VARCHAR(1000), created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_submissions_school_student (school_id, student_id));
CREATE TABLE fee_categories (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, name VARCHAR(150), description VARCHAR(1000), created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_fee_categories_school (school_id));
CREATE TABLE fee_structures (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, fee_category_id BIGINT, class_id BIGINT, amount DECIMAL(12,2), due_date DATE, created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_fee_structures_school (school_id));
CREATE TABLE fee_collections (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, student_id BIGINT, fee_structure_id BIGINT, paid_amount DECIMAL(12,2), discount DECIMAL(12,2), fine DECIMAL(12,2), paid_on DATE, payment_mode VARCHAR(50), receipt_number VARCHAR(100), created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_fee_collections_school (school_id));
CREATE TABLE leave_requests (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, requester_user_id BIGINT, student_id BIGINT, teacher_id BIGINT, starts_on DATE, ends_on DATE, reason VARCHAR(1000), status VARCHAR(30), decision_remarks VARCHAR(1000), created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_leave_school (school_id));
CREATE TABLE notifications (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NOT NULL, user_id BIGINT, title VARCHAR(255), message VARCHAR(2000), event_type VARCHAR(100), read_flag BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_notifications_school_user (school_id, user_id));
CREATE TABLE audit_logs (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NULL, user_id BIGINT NULL, action VARCHAR(100), ip_address VARCHAR(100), description VARCHAR(2000), created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_audit_school_user (school_id, user_id));
CREATE TABLE data_access_logs (id BIGINT PRIMARY KEY AUTO_INCREMENT, school_id BIGINT NULL, user_id BIGINT NULL, resource VARCHAR(150), action VARCHAR(100), ip_address VARCHAR(100), description VARCHAR(2000), created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL, created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, INDEX idx_data_access_school_user (school_id, user_id));
