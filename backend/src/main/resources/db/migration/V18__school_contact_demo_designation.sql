ALTER TABLE schools ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255) NOT NULL DEFAULT 'School Administrator';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS designation VARCHAR(255) NOT NULL DEFAULT 'School Administrator';
ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS designation VARCHAR(255) NOT NULL DEFAULT 'School Administrator';
