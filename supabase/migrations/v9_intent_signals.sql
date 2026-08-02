-- NearPro v9: Intent Signal & Buying Signal Detection Migration

-- 1. Create signal_definitions table
CREATE TABLE IF NOT EXISTS public.signal_definitions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL UNIQUE,         -- 'hiring_surge', 'new_funding', 'tech_change'
    display_name        TEXT NOT NULL,                -- 'Hiring Surge'
    description         TEXT,
    signal_type         TEXT NOT NULL,                -- hiring | funding | tech | review | news | expansion
    icon                TEXT DEFAULT '📊',
    weight              INTEGER DEFAULT 50,           -- Contribution to intent score (0-100)
    data_source         TEXT,                         -- 'linkedin_jobs', 'google_news', 'builtwith'
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create detected_signals table
CREATE TABLE IF NOT EXISTS public.detected_signals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id     UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    signal_def_id       UUID NOT NULL REFERENCES public.signal_definitions(id) ON DELETE CASCADE,
    
    -- Signal details
    title               TEXT NOT NULL,
    description         TEXT,
    source_url          TEXT,
    source_name         TEXT,
    raw_data            JSONB DEFAULT '{}',
    
    -- Scoring
    signal_strength     TEXT DEFAULT 'medium',        -- low | medium | high | critical
    confidence          INTEGER DEFAULT 70,
    
    -- State
    status              TEXT DEFAULT 'new',           -- new | acknowledged | acted_on | expired
    detected_at         TIMESTAMPTZ DEFAULT NOW(),
    expires_at          TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    acknowledged_by     UUID REFERENCES public.profiles(id),
    acknowledged_at     TIMESTAMPTZ
);

-- 3. Create signal_watchlists table
CREATE TABLE IF NOT EXISTS public.signal_watchlists (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    description         TEXT,
    
    -- Monitoring config
    check_frequency     TEXT DEFAULT 'daily',         -- hourly | daily | weekly
    signal_types        TEXT[] DEFAULT '{hiring,funding,tech,review,news}',
    notification_method TEXT DEFAULT 'in_app',        -- in_app | email | both
    
    is_active           BOOLEAN DEFAULT TRUE,
    last_checked_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create watchlist_leads table
CREATE TABLE IF NOT EXISTS public.watchlist_leads (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id        UUID NOT NULL REFERENCES public.signal_watchlists(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    added_at            TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(watchlist_id, professional_id)
);

-- 5. Create signal_notifications table
CREATE TABLE IF NOT EXISTS public.signal_notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    signal_id           UUID NOT NULL REFERENCES public.detected_signals(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    body                TEXT,
    is_read             BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Add intent columns to professionals and profiles
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS intent_score INTEGER DEFAULT 0;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS active_signals_count INTEGER DEFAULT 0;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS last_signal_detected_at TIMESTAMPTZ;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_signal_checks_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_signal_checks_limit INTEGER DEFAULT 50;

-- Enable RLS
ALTER TABLE public.signal_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detected_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Public read signal definitions" ON public.signal_definitions;
DROP POLICY IF EXISTS "Public read detected signals" ON public.detected_signals;
DROP POLICY IF EXISTS "Users manage own watchlists" ON public.signal_watchlists;
DROP POLICY IF EXISTS "Users manage watchlist leads" ON public.watchlist_leads;
DROP POLICY IF EXISTS "Users manage own signal notifications" ON public.signal_notifications;

-- Define Policies
CREATE POLICY "Public read signal definitions" ON public.signal_definitions FOR SELECT USING (true);
CREATE POLICY "Public read detected signals" ON public.detected_signals FOR SELECT USING (true);
CREATE POLICY "Users manage own watchlists" ON public.signal_watchlists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage watchlist leads" ON public.watchlist_leads FOR ALL USING (
    watchlist_id IN (SELECT id FROM public.signal_watchlists WHERE user_id = auth.uid())
);
CREATE POLICY "Users manage own signal notifications" ON public.signal_notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Seed definitions
INSERT INTO public.signal_definitions (name, display_name, signal_type, icon, weight, data_source) VALUES
('hiring_web_dev', 'Hiring Web Developer', 'hiring', '👨‍💻', 90, 'linkedin_jobs'),
('hiring_marketing', 'Hiring Marketing Role', 'hiring', '📢', 85, 'linkedin_jobs'),
('hiring_any', 'New Job Posting', 'hiring', '💼', 60, 'linkedin_jobs'),
('new_funding', 'Received Funding', 'funding', '💰', 95, 'google_news'),
('expansion', 'Opening New Location', 'expansion', '🏢', 80, 'google_news'),
('tech_stack_change', 'Tech Stack Change', 'tech', '⚡', 75, 'builtwith'),
('negative_reviews_spike', 'Negative Review Spike', 'review', '😤', 70, 'google_maps'),
('review_volume_growth', 'Review Count Growing', 'review', '📈', 50, 'google_maps'),
('leadership_change', 'New Leadership', 'news', '👔', 80, 'google_news'),
('competitor_exit', 'Competitor Closed', 'news', '🚪', 85, 'google_maps')
ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name, icon = EXCLUDED.icon, weight = EXCLUDED.weight;
