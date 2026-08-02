-- NearPro v5: Email Warmup & Deliverability Infrastructure Migration

-- 1. Create email_accounts table
CREATE TABLE IF NOT EXISTS public.email_accounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email_address       TEXT NOT NULL,
    display_name        TEXT,
    provider            TEXT DEFAULT 'smtp',    -- smtp | gmail | outlook | zoho
    smtp_host           TEXT,
    smtp_port           INTEGER DEFAULT 587,
    imap_host           TEXT,
    imap_port           INTEGER DEFAULT 993,
    encrypted_password  TEXT,                   -- AES-256 encrypted
    oauth_token         TEXT,
    oauth_refresh_token TEXT,
    
    -- Warmup State
    warmup_status       TEXT DEFAULT 'not_started', -- not_started | warming | warmed | paused | error
    warmup_started_at   TIMESTAMPTZ,
    warmup_day          INTEGER DEFAULT 0,       -- Warmup day (0-30)
    daily_send_limit    INTEGER DEFAULT 5,       -- Starts at 5, ramps to 50
    daily_sends_today   INTEGER DEFAULT 0,
    warmup_target_daily INTEGER DEFAULT 50,      -- Target goal
    
    -- Health Metrics
    reputation_score    INTEGER DEFAULT 85,      -- Composite reputation score
    bounce_rate         NUMERIC(5,2) DEFAULT 0,
    spam_complaint_rate NUMERIC(5,2) DEFAULT 0,
    last_health_check   TIMESTAMPTZ,
    
    -- DNS Validation
    spf_valid           BOOLEAN DEFAULT TRUE,
    dkim_valid          BOOLEAN DEFAULT TRUE,
    dmarc_valid         BOOLEAN DEFAULT TRUE,
    dns_checked_at      TIMESTAMPTZ,
    
    -- Rotation
    is_active           BOOLEAN DEFAULT TRUE,
    priority            INTEGER DEFAULT 1,
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, email_address)
);

-- 2. Create warmup_interactions table
CREATE TABLE IF NOT EXISTS public.warmup_interactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id          UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
    interaction_type    TEXT NOT NULL,            -- sent | received | opened | replied
    partner_email       TEXT NOT NULL,
    subject             TEXT,
    message_id          TEXT,
    sent_at             TIMESTAMPTZ DEFAULT NOW(),
    opened_at           TIMESTAMPTZ,
    replied_at          TIMESTAMPTZ,
    moved_to_inbox      BOOLEAN DEFAULT FALSE
);

-- 3. Create domain_health_reports table
CREATE TABLE IF NOT EXISTS public.domain_health_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    domain              TEXT NOT NULL,
    
    -- DNS Records
    spf_record          TEXT,
    spf_status          TEXT,                    -- pass | fail | missing
    dkim_selector       TEXT,
    dkim_status         TEXT,                    -- pass | fail | missing
    dmarc_record        TEXT,
    dmarc_policy        TEXT,                    -- none | quarantine | reject
    dmarc_status        TEXT,
    mx_records          JSONB DEFAULT '[]',
    
    -- Blacklist Checks
    blacklist_results   JSONB DEFAULT '{}',
    blacklisted_count   INTEGER DEFAULT 0,
    total_lists_checked INTEGER DEFAULT 0,
    
    -- Overall Stats
    health_score        INTEGER DEFAULT 100,
    recommendations     JSONB DEFAULT '[]',
    checked_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create inbox_rotation_config table
CREATE TABLE IF NOT EXISTS public.inbox_rotation_config (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rotation_strategy   TEXT DEFAULT 'round_robin', -- round_robin | weighted | random
    max_daily_per_inbox INTEGER DEFAULT 30,
    cool_down_minutes   INTEGER DEFAULT 60,
    enabled             BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warmup_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_rotation_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Users manage own email accounts" ON public.email_accounts;
DROP POLICY IF EXISTS "Users view own warmup interactions" ON public.warmup_interactions;
DROP POLICY IF EXISTS "Users manage own domain health reports" ON public.domain_health_reports;
DROP POLICY IF EXISTS "Users manage own rotation config" ON public.inbox_rotation_config;

-- Configure RLS Policies
CREATE POLICY "Users manage own email accounts" ON public.email_accounts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own warmup interactions" ON public.warmup_interactions
    FOR SELECT USING (
        account_id IN (SELECT id FROM public.email_accounts WHERE user_id = auth.uid())
    );

CREATE POLICY "Users manage own domain health reports" ON public.domain_health_reports
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own rotation config" ON public.inbox_rotation_config
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
