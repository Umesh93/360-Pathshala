ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS code VARCHAR(50);
UPDATE subscription_plans SET code = UPPER(REPLACE(name, ' ', '_')) WHERE code IS NULL;
ALTER TABLE subscription_plans MODIFY code VARCHAR(50) NOT NULL;
ALTER TABLE subscription_plans ADD CONSTRAINT uk_subscription_plan_code UNIQUE (code);
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS duration_days INT NOT NULL DEFAULT 30;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'NPR';
CREATE TABLE IF NOT EXISTS subscription_plan_modules (
 id BIGINT NOT NULL AUTO_INCREMENT, created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL,
 created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
 plan_id BIGINT NOT NULL, module_code VARCHAR(50) NOT NULL,
 PRIMARY KEY (id), CONSTRAINT uk_plan_module UNIQUE (plan_id, module_code)
);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_id BIGINT NULL, ADD COLUMN IF NOT EXISTS plan_code VARCHAR(50) NULL,
 ADD COLUMN IF NOT EXISTS plan_name VARCHAR(255) NULL, ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'NPR',
 ADD COLUMN IF NOT EXISTS duration_days INT NULL, ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE school_modules ADD COLUMN IF NOT EXISTS managed_by_subscription BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE IF NOT EXISTS payment_transactions (
 id BIGINT NOT NULL AUTO_INCREMENT, created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NULL,
 created_by BIGINT NULL, updated_by BIGINT NULL, is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
 school_id BIGINT NOT NULL, subscription_id BIGINT NULL, plan_id BIGINT NOT NULL, provider VARCHAR(20) NOT NULL,
 purchase_order_id VARCHAR(80) NOT NULL UNIQUE, pidx VARCHAR(100) UNIQUE, transaction_id VARCHAR(100) UNIQUE,
 amount_paisa BIGINT NOT NULL, amount_npr DECIMAL(12,2) NOT NULL, currency VARCHAR(3) NOT NULL,
 status VARCHAR(20) NOT NULL, provider_status VARCHAR(80), initiated_at TIMESTAMP NOT NULL, verified_at TIMESTAMP NULL,
 failure_reason VARCHAR(500), payment_url VARCHAR(1000), raw_response LONGTEXT, PRIMARY KEY (id),
 INDEX idx_payment_school_status_created (school_id,status,created_at), INDEX idx_payment_pidx_order (pidx,purchase_order_id)
);
