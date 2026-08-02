-- NearPro v6: Waterfall Data Enrichment Engine Migration

-- 1. Create enrichment_providers table
CREATE TABLE IF NOT EXISTS public.enrichment_providers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL UNIQUE,        -- 'hunter', 'apollo', 'clearbit', 'smtp_validator'
    display_name        TEXT NOT NULL,               -- 'Hunter.io'
    provider_type       TEXT NOT NULL,               -- email | phone | company | social
    api_base_url        TEXT,
    priority            INTEGER DEFAULT 1,
    cost_per_lookup     NUMERIC(8,4) DEFAULT 0,
    monthly_free_quota  INTEGER DEFAULT 0,
    is_active           BOOLEAN DEFAULT TRUE,
    config_schema       JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create user_enrichment_keys table
CREATE TABLE IF NOT EXISTS public.user_enrichment_keys (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider_id         UUID NOT NULL REFERENCES public.enrichment_providers(id) ON DELETE CASCADE,
    encrypted_api_key   TEXT NOT NULL,
    monthly_used        INTEGER DEFAULT 0,
    monthly_limit       INTEGER,
    is_active           BOOLEAN DEFAULT TRUE,
    last_used_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider_id)
);

-- 3. Create enrichment_jobs table
CREATE TABLE IF NOT EXISTS public.enrichment_jobs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_type            TEXT DEFAULT 'single',       -- single | batch | auto
    status              TEXT DEFAULT 'pending',      -- pending | running | completed | failed
    total_leads         INTEGER DEFAULT 0,
    enriched_count      INTEGER DEFAULT 0,
    failed_count        INTEGER DEFAULT 0,
    skipped_count       INTEGER DEFAULT 0,
    credits_consumed    INTEGER DEFAULT 0,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create enrichment_results table
CREATE TABLE IF NOT EXISTS public.enrichment_results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              UUID REFERENCES public.enrichment_jobs(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Data found
    enriched_email      TEXT,
    enriched_phone      TEXT,
    enriched_linkedin   TEXT,
    enriched_facebook   TEXT,
    enriched_instagram  TEXT,
    enriched_twitter    TEXT,
    company_size        TEXT,
    annual_revenue_est  TEXT,
    tech_stack          JSONB DEFAULT '[]',
    founded_year        INTEGER,
    employee_count      INTEGER,
    industry_tags       JSONB DEFAULT '[]',
    
    -- Verification
    email_verified      BOOLEAN,
    email_verify_method TEXT,
    phone_verified      BOOLEAN,
    confidence_score    INTEGER DEFAULT 0,
    
    -- Provider trail
    provider_trail      JSONB DEFAULT '[]',
    
    -- State
    status              TEXT DEFAULT 'pending',      -- pending | enriched | partial | failed | no_data
    enriched_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create enrichment_credit_ledger table
CREATE TABLE IF NOT EXISTS public.enrichment_credit_ledger (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount              INTEGER NOT NULL,
    transaction_type    TEXT NOT NULL,                -- PURCHASE | USAGE | REFUND | MONTHLY_RESET
    reference_job_id    UUID REFERENCES public.enrichment_jobs(id),
    balance_after       INTEGER NOT NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Alter professionals and profiles table to include data points
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'raw';
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS enriched_email TEXT;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS enriched_phone TEXT;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS tech_stack JSONB DEFAULT '[]';
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS social_profiles JSONB DEFAULT '{}';
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS enrichment_confidence INTEGER DEFAULT 0;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS last_enriched_at TIMESTAMPTZ;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enrichment_credits INTEGER DEFAULT 50; -- Default free allowance
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_enrichments_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_enrichments_limit INTEGER DEFAULT 50;

-- Enable RLS
ALTER TABLE public.enrichment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_enrichment_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_credit_ledger ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Public read providers" ON public.enrichment_providers;
DROP POLICY IF EXISTS "Users manage own keys" ON public.user_enrichment_keys;
DROP POLICY IF EXISTS "Users manage own jobs" ON public.enrichment_jobs;
DROP POLICY IF EXISTS "Users manage own results" ON public.enrichment_results;
DROP POLICY IF EXISTS "Users view own ledger" ON public.enrichment_credit_ledger;

-- Define Policies
CREATE POLICY "Public read providers" ON public.enrichment_providers FOR SELECT USING (true);
CREATE POLICY "Users manage own keys" ON public.user_enrichment_keys FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own jobs" ON public.enrichment_jobs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own results" ON public.enrichment_results FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own ledger" ON public.enrichment_credit_ledger FOR SELECT USING (auth.uid() = user_id);

-- Seed default providers
INSERT INTO public.enrichment_providers (name, display_name, provider_type, api_base_url, priority, cost_per_lookup, monthly_free_quota) VALUES
('maps', 'Google Maps Scraping (built-in)', 'company', '', 1, 0, 1000),
('hunter', 'Hunter.io (Email Finder)', 'email', 'https://api.hunter.io/v2', 2, 0.5, 50),
('apollo', 'Apollo.io (Data Search)', 'email', 'https://api.apollo.io/v1', 3, 0.3, 100),
('smtp_validator', 'NearPro SMTP Ping (built-in)', 'email', '', 4, 0, 1000)
ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name, provider_type = EXCLUDED.provider_type;

-- 7. Add analytics RPC
CREATE OR REPLACE FUNCTION public.get_enrichment_stats(p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'credits_remaining', (SELECT COALESCE(enrichment_credits, 0) FROM public.profiles WHERE id = p_user_id),
            'total_enriched', (SELECT COUNT(*) FROM public.enrichment_results WHERE user_id = p_user_id AND status = 'enriched'),
            'emails_found', (SELECT COUNT(*) FROM public.enrichment_results WHERE user_id = p_user_id AND enriched_email IS NOT NULL),
            'phones_found', (SELECT COUNT(*) FROM public.enrichment_results WHERE user_id = p_user_id AND enriched_phone IS NOT NULL),
            'avg_confidence', (SELECT COALESCE(AVG(confidence_score), 0) FROM public.enrichment_results WHERE user_id = p_user_id AND status = 'enriched'),
            'active_jobs', (SELECT COUNT(*) FROM public.enrichment_jobs WHERE user_id = p_user_id AND status = 'running')
        )
    );
END; $$;
