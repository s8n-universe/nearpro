-- NearPro v8: AI Research Agent Migration

-- 1. Create research_jobs table
CREATE TABLE IF NOT EXISTS public.research_jobs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    status              TEXT DEFAULT 'queued',        -- queued | researching | completed | failed
    agent_model         TEXT DEFAULT 'gemini-2.5-flash',
    
    scope               JSONB DEFAULT '["website","social","news","tech"]',
    
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    duration_ms         INTEGER,
    pages_visited       INTEGER DEFAULT 0,
    
    credits_charged     INTEGER DEFAULT 1,
    tokens_used         INTEGER DEFAULT 0,
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create research_reports table
CREATE TABLE IF NOT EXISTS public.research_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              UUID NOT NULL REFERENCES public.research_jobs(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Company Intelligence
    company_summary     TEXT,
    industry_vertical   TEXT,
    founding_year       INTEGER,
    team_size_estimate  TEXT,                         -- '1-5', '6-20', '21-50', '50+'
    key_people          JSONB DEFAULT '[]',
    
    -- Digital Presence
    tech_stack          JSONB DEFAULT '[]',
    cms_platform        TEXT,
    has_blog            BOOLEAN DEFAULT FALSE,
    has_ecommerce       BOOLEAN DEFAULT FALSE,
    ssl_valid           BOOLEAN DEFAULT TRUE,
    mobile_responsive   BOOLEAN DEFAULT TRUE,
    last_updated_est    TEXT,
    
    -- Social Presence
    social_profiles     JSONB DEFAULT '{}',
    total_social_reach  INTEGER DEFAULT 0,
    social_activity     TEXT DEFAULT 'moderate',
    
    -- Business Signals (Buying Intent)
    recent_news         JSONB DEFAULT '[]',
    hiring_signals      JSONB DEFAULT '[]',
    funding_signals     JSONB DEFAULT '[]',
    growth_indicators   JSONB DEFAULT '[]',
    
    -- Pain Points
    identified_pain_points JSONB DEFAULT '[]',
    outreach_angles     JSONB DEFAULT '[]',
    
    -- Competitive Landscape
    competitors         JSONB DEFAULT '[]',
    market_position     TEXT DEFAULT 'challenger',
    
    -- Review Intelligence
    review_sentiment    TEXT DEFAULT 'positive',
    common_complaints   JSONB DEFAULT '[]',
    common_praises      JSONB DEFAULT '[]',
    
    -- AI-Generated Scores
    intent_score        INTEGER DEFAULT 70,
    readiness_score     INTEGER DEFAULT 65,
    
    -- Raw Data
    raw_browsing_log    JSONB DEFAULT '[]',
    
    expires_at          TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add monthly limit tracking columns onto profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_research_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_research_limit INTEGER DEFAULT 25; -- Free/Scout tier default limits

-- Enable RLS
ALTER TABLE public.research_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Users manage own research jobs" ON public.research_jobs;
DROP POLICY IF EXISTS "Users manage own reports" ON public.research_reports;

-- Define Policies
CREATE POLICY "Users manage own research jobs" ON public.research_jobs
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own reports" ON public.research_reports
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
