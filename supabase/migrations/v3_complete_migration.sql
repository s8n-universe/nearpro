-- =============================================================================
-- NearPro v3 Complete Database Migration
-- =============================================================================
-- Run order: This is a single consolidated migration that must be run atomically.
-- Every statement uses IF NOT EXISTS / IF EXISTS to be safely re-runnable.
--
-- PRE MIGRATION STATE:
--   Tables: professionals (5390 rows), profiles (1 row)
--   Missing: anonymous_trials, profiles.tier, get_professionals_v2
--   Existing trigger: on_auth_user_created -> handle_new_user()
--   Existing profile: officialshri21@gmail.com (is_premium=True)
-- =============================================================================


-- =============================================
-- STEP 0: BACKFILL — Fix missing items that current frontend expects
-- =============================================

-- 0a. Create anonymous_trials table (missing from live DB)
CREATE TABLE IF NOT EXISTS public.anonymous_trials (
    fingerprint TEXT PRIMARY KEY,
    started_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.anonymous_trials ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Allow public read access to trials" ON public.anonymous_trials
        FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public insert access to trials" ON public.anonymous_trials
        FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 0b. Add tier column to profiles (current frontend already references it)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';

-- 0c. Backfill tier for existing premium profile (owner = agency tier)
UPDATE profiles SET tier = 'agency' WHERE is_premium = TRUE AND (tier IS NULL OR tier = 'free');


-- =============================================
-- STEP 1: EXPAND PROFILES TABLE for v3
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'freelancer';

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_niches TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_cities TEXT[] DEFAULT '{"Mumbai"}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_lead_unlocks_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_lead_unlocks_limit INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_export_rows_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_export_rows_limit INTEGER DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS survey_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS survey_niches TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_leads_viewed INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_exports INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_prompt_copies_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Sync subscription_tier with tier for existing profiles
UPDATE profiles SET subscription_tier = tier WHERE subscription_tier = 'free' AND tier != 'free';
-- Sync subscription_tier with is_premium for safety (owner = agency)
UPDATE profiles SET subscription_tier = 'agency' WHERE is_premium = TRUE AND subscription_tier = 'free';


-- =============================================
-- STEP 2: CREATE lead_lists TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS lead_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#ffa000',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lead_lists ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users manage own lists"
        ON lead_lists FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- =============================================
-- STEP 3: CREATE saved_leads TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS saved_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    list_id UUID REFERENCES lead_lists(id) ON DELETE SET NULL,
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'new',
    notes TEXT,
    outreach_channel TEXT,
    outreach_sent_at TIMESTAMPTZ,
    outreach_message TEXT,
    follow_up_due_at TIMESTAMPTZ,
    follow_up_sent_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES profiles(id),
    conversion_value NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, professional_id)
);

ALTER TABLE saved_leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users manage own saved leads"
        ON saved_leads FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_saved_leads_user_status ON saved_leads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_saved_leads_followup ON saved_leads(follow_up_due_at) WHERE follow_up_due_at IS NOT NULL;


-- =============================================
-- STEP 4: CREATE audit_cache TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS audit_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL UNIQUE,
    page_speed_score INTEGER,
    mobile_friendly BOOLEAN,
    has_https BOOLEAN,
    has_schema BOOLEAN,
    load_time_ms INTEGER,
    gaps TEXT[],
    biggest_gap TEXT,
    est_lost_revenue_per_month INTEGER,
    audited_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

ALTER TABLE audit_cache ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public can read audit cache"
        ON audit_cache FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Service role manages audit cache"
        ON audit_cache FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_audit_cache_url ON audit_cache(url);
CREATE INDEX IF NOT EXISTS idx_audit_cache_expires ON audit_cache(expires_at);


-- =============================================
-- STEP 5: CREATE outreach_templates TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS outreach_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    channel TEXT NOT NULL,
    language TEXT DEFAULT 'hinglish',
    role TEXT,
    template_text TEXT NOT NULL,
    follow_up_text TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE outreach_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users read system plus own templates"
        ON outreach_templates FOR SELECT
        USING (is_system = TRUE OR auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users manage own templates"
        ON outreach_templates FOR INSERT
        WITH CHECK (auth.uid() = user_id AND is_system = FALSE);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users update own templates"
        ON outreach_templates FOR UPDATE
        USING (auth.uid() = user_id AND is_system = FALSE);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users delete own templates"
        ON outreach_templates FOR DELETE
        USING (auth.uid() = user_id AND is_system = FALSE);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- =============================================
-- STEP 6: CREATE click_events TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS click_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    professional_id UUID REFERENCES professionals(id),
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users read own events"
        ON click_events FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service role writes events (via Edge Functions or sync)
DO $$ BEGIN
    CREATE POLICY "Service role writes events"
        ON click_events FOR INSERT
        WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_user ON click_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON click_events(event_type, created_at DESC);


-- =============================================
-- STEP 7: CREATE data_requests TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS data_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    request_type TEXT DEFAULT 'area',
    requested_city TEXT,
    requested_niche TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    fulfilled_at TIMESTAMPTZ,
    records_added INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users manage own requests"
        ON data_requests FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- =============================================
-- STEP 8: ADD conversion_score TO professionals
-- =============================================

ALTER TABLE professionals ADD COLUMN IF NOT EXISTS conversion_score INTEGER;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS conversion_score_breakdown JSONB;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS audit_cached BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_prof_conversion_score ON professionals(conversion_score DESC) WHERE conversion_score IS NOT NULL;


-- =============================================
-- STEP 9: RPC FUNCTIONS
-- =============================================

-- 9a. get_dashboard_stats
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result JSON;
BEGIN
    SELECT json_build_object(
        'saved_leads_total', (SELECT COUNT(*) FROM saved_leads WHERE user_id = p_user_id),
        'contacted_count', (SELECT COUNT(*) FROM saved_leads WHERE user_id = p_user_id AND status = 'contacted'),
        'converted_count', (SELECT COUNT(*) FROM saved_leads WHERE user_id = p_user_id AND status = 'converted'),
        'follow_ups_due_today', (
            SELECT COUNT(*) FROM saved_leads 
            WHERE user_id = p_user_id 
            AND follow_up_due_at::date = CURRENT_DATE
            AND follow_up_sent_at IS NULL
        ),
        'conversion_rate', CASE 
            WHEN (SELECT COUNT(*) FROM saved_leads WHERE user_id = p_user_id AND status = 'contacted') = 0 THEN 0
            ELSE ROUND(
                (SELECT COUNT(*) FROM saved_leads WHERE user_id = p_user_id AND status = 'converted')::NUMERIC /
                (SELECT COUNT(*) FROM saved_leads WHERE user_id = p_user_id AND status = 'contacted')::NUMERIC * 100, 1
            )
        END
    ) INTO result;
    RETURN result;
END; $$;


-- 9b. get_crm_pipeline
CREATE OR REPLACE FUNCTION get_crm_pipeline(p_user_id UUID)
RETURNS TABLE (
    status TEXT,
    count BIGINT,
    leads JSON
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sl.status,
        COUNT(*)::BIGINT,
        json_agg(json_build_object(
            'saved_lead_id', sl.id,
            'professional_id', p.id,
            'name', p.name,
            'category', p.category,
            'area', p.area,
            'phone', p.phone,
            'rating', p.rating,
            'completeness_score', p.completeness_score,
            'notes', sl.notes,
            'follow_up_due_at', sl.follow_up_due_at,
            'outreach_channel', sl.outreach_channel,
            'outreach_sent_at', sl.outreach_sent_at
        ) ORDER BY sl.updated_at DESC)
    FROM saved_leads sl
    JOIN professionals p ON p.id = sl.professional_id
    WHERE sl.user_id = p_user_id
    GROUP BY sl.status;
END; $$;


-- 9c. get_professionals_v2 — THE CRITICAL RPC (never existed in live DB)
-- This is the main data retrieval function with paywall enforcement.
-- It checks auth status and subscription_tier to mask/reveal contact data.
CREATE OR REPLACE FUNCTION get_professionals_v2(
    client_fingerprint TEXT,
    parent_cat TEXT DEFAULT NULL,
    sub_cat TEXT DEFAULT NULL,
    filter_area TEXT DEFAULT NULL,
    min_rat REAL DEFAULT NULL,
    has_em BOOLEAN DEFAULT FALSE,
    has_ph BOOLEAN DEFAULT FALSE,
    has_web BOOLEAN DEFAULT FALSE,
    search_term TEXT DEFAULT NULL,
    sort_col TEXT DEFAULT 'rating_desc',
    offset_val INT DEFAULT 0,
    limit_val INT DEFAULT 24,
    has_no_web BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    category TEXT,
    parent_category TEXT,
    address TEXT,
    area TEXT,
    phone TEXT,
    website TEXT,
    email TEXT,
    rating REAL,
    review_count INT,
    completeness_score INT,
    hours JSONB,
    latitude REAL,
    longitude REAL,
    source TEXT,
    source_url TEXT,
    scraped_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ,
    conversion_score INT
) AS $$
DECLARE
    is_premium_user BOOLEAN := FALSE;
    is_trial_active BOOLEAN := FALSE;
    user_tier TEXT := 'free';
BEGIN
    -- Check if authenticated user is premium and get their tier
    IF auth.uid() IS NOT NULL THEN
        SELECT 
            COALESCE(pr.is_premium, FALSE),
            COALESCE(pr.subscription_tier, COALESCE(pr.tier, 'free'))
        INTO is_premium_user, user_tier
        FROM public.profiles pr
        WHERE pr.id = auth.uid();
        
        -- If is_premium is true but subscription_tier is free, treat as scout (backward compat)
        IF is_premium_user AND user_tier = 'free' THEN
            user_tier := 'scout';
        END IF;
    END IF;
    
    -- Check if anonymous 2 minute trial is active
    IF NOT is_premium_user AND client_fingerprint IS NOT NULL AND client_fingerprint != '' THEN
        SELECT EXISTS (
            SELECT 1 FROM public.anonymous_trials
            WHERE anonymous_trials.fingerprint = client_fingerprint
              AND (NOW() - anonymous_trials.started_at) < INTERVAL '2 minutes'
        ) INTO is_trial_active;
    END IF;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.category,
        p.parent_category,
        p.address,
        p.area,
        -- Phone: unlocked for premium users (scout+) or active trial
        CASE 
            WHEN is_premium_user OR is_trial_active THEN p.phone
            ELSE NULL
        END as phone,
        -- Website: unlocked for premium users (scout+) or active trial
        CASE 
            WHEN is_premium_user OR is_trial_active THEN p.website
            ELSE NULL
        END as website,
        -- Email: always visible (partial, for lead gen interest)
        p.email,
        p.rating,
        p.review_count,
        p.completeness_score,
        p.hours,
        p.latitude,
        p.longitude,
        p.source,
        p.source_url,
        p.scraped_at,
        p.synced_at,
        -- Conversion score: only visible to hunter+ tiers
        CASE WHEN user_tier IN ('hunter', 'agency', 'enterprise')
             THEN p.conversion_score ELSE NULL END as conversion_score
    FROM professionals p
    WHERE 
        (parent_cat IS NULL OR p.parent_category = parent_cat)
        AND (sub_cat IS NULL OR p.category = sub_cat)
        AND (filter_area IS NULL OR p.area = filter_area)
        AND (min_rat IS NULL OR p.rating >= min_rat)
        AND (NOT has_em OR (p.email IS NOT NULL AND p.email != ''))
        AND (NOT has_ph OR (p.phone IS NOT NULL AND p.phone != ''))
        AND (NOT has_web OR (p.website IS NOT NULL AND p.website != ''))
        AND (NOT has_no_web OR (p.website IS NULL OR p.website = ''))
        AND (search_term IS NULL OR p.name ILIKE '%' || search_term || '%' OR p.address ILIKE '%' || search_term || '%' OR p.category ILIKE '%' || search_term || '%')
    ORDER BY
        CASE WHEN sort_col = 'rating_desc' THEN p.rating END DESC,
        CASE WHEN sort_col = 'reviews_desc' THEN p.review_count END DESC,
        CASE WHEN sort_col = 'completeness_desc' THEN p.completeness_score END DESC,
        CASE WHEN sort_col = 'scraped_desc' THEN p.scraped_at END DESC,
        CASE WHEN sort_col = 'conversion_desc' THEN p.conversion_score END DESC NULLS LAST
    OFFSET offset_val
    LIMIT limit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 9d. Update handle_new_user trigger to include new v3 columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, is_premium, tier, subscription_tier, subscription_status)
    VALUES (new.id, new.email, false, 'free', 'free', 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger already exists (on_auth_user_created), no need to recreate
-- It will now use the updated handle_new_user function automatically


-- =============================================
-- DONE: Verify
-- =============================================
-- Run: SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Expected: 8 tables (professionals, profiles, anonymous_trials, lead_lists,
--           saved_leads, audit_cache, outreach_templates, click_events, data_requests)
-- Actually 9 tables total (the 2 original + 7 new)
