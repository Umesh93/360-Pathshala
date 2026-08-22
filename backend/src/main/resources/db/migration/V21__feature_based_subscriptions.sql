ALTER TABLE modules ADD COLUMN IF NOT EXISTS billing_type VARCHAR(20) NOT NULL DEFAULT 'INCLUDED';
ALTER TABLE modules ADD COLUMN IF NOT EXISTS annual_price DECIMAL(12,2) NULL;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS billing_period VARCHAR(20) NOT NULL DEFAULT 'ANNUAL';
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS feature_codes_snapshot TEXT NULL;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS pricing_model VARCHAR(20) NOT NULL DEFAULT 'LEGACY_FIXED';
ALTER TABLE school_modules ADD COLUMN IF NOT EXISTS entitlement_starts_on DATE NULL;
ALTER TABLE school_modules ADD COLUMN IF NOT EXISTS entitlement_ends_on DATE NULL;

UPDATE subscription_plans SET active = FALSE, pricing_model = 'LEGACY_FIXED' WHERE code IN ('BASIC', 'STANDARD', 'PREMIUM');

UPDATE modules SET billing_type = 'REQUIRED', annual_price = NULL, billing_period = 'ANNUAL', active = TRUE, selectable = TRUE, coming_soon = FALSE, category = 'REQUIRED', required = TRUE WHERE code IN ('STUDENT_MANAGEMENT','SUBJECT_MANAGEMENT','EXAMINATION');
UPDATE modules SET billing_type = 'INCLUDED', annual_price = NULL, billing_period = 'ANNUAL', active = TRUE, selectable = TRUE, coming_soon = FALSE, category = 'INCLUDED', required = FALSE WHERE code IN ('TEACHER_MANAGEMENT','TEACHER_ASSIGNMENT','ATTENDANCE','PARENT_MANAGEMENT');
UPDATE modules SET billing_type = 'PAID', annual_price = 3000.00, billing_period = 'ANNUAL', active = TRUE, selectable = TRUE, coming_soon = FALSE, category = 'PAID', required = FALSE WHERE code IN ('ASSIGNMENT','TIMETABLE','FEE_MANAGEMENT','ACADEMIC_CALENDAR','STUDENT_DASHBOARD','TEACHER_DASHBOARD','PARENT_DASHBOARD','CERTIFICATES');
UPDATE modules SET billing_type = 'COMING_SOON', annual_price = NULL, billing_period = 'ANNUAL', active = FALSE, selectable = FALSE, coming_soon = TRUE, category = 'FUTURE', required = FALSE WHERE code IN ('HOSTEL','TRANSPORT','INVENTORY','HR_MANAGEMENT','PAYROLL','ACCOUNTS','ANALYTICS_DASHBOARD','LIBRARY');
UPDATE modules SET billing_type = 'COMING_SOON', annual_price = NULL, billing_period = 'ANNUAL', active = FALSE, selectable = FALSE, coming_soon = FALSE, category = NULL, required = FALSE WHERE code IN ('LEAVE_MANAGEMENT','NOTIFICATIONS');
