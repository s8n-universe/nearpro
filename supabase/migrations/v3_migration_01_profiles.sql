-- v3_migration_01_profiles.sql
-- Expand profiles table for NearPro v3 subscription and user data

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'freelancer';
-- role values: 'freelancer', 'agency', 'sales_team', 'startup', 'enterprise', 'developer', 'ca_finance', 'real_estate', 'general_b2b'

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_niches TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_cities TEXT[] DEFAULT '{"Mumbai"}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
-- values: 'free', 'scout', 'hunter', 'agency', 'enterprise'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
-- values: 'active', 'cancelled', 'past_due', 'trialing'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_lead_unlocks_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_lead_unlocks_limit INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_export_rows_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_export_rows_limit INTEGER DEFAULT 100;
-- free: 0, scout: 100, hunter: 0 (unlimited), agency: 0 (unlimited)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS survey_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS survey_niches TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_leads_viewed INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_exports INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_prompt_copies_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_audits_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Keep is_premium for backward compatibility: is_premium = (subscription_tier != 'free')
