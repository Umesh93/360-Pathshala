ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS module_codes_snapshot TEXT NULL;
CREATE INDEX idx_subscription_school_status_dates ON subscriptions(school_id, subscription_status, starts_on, ends_on);
