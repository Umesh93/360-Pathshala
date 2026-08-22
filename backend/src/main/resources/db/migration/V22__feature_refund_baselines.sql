ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS entitlement_baseline_snapshot TEXT NULL;
