-- NearPro v12: Deal Intelligence & CRM Analytics Migration

-- 1. Create deal_intelligence table
CREATE TABLE IF NOT EXISTS public.deal_intelligence (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saved_lead_id       UUID NOT NULL REFERENCES public.saved_leads(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    
    -- AI Predictions
    close_probability   INTEGER DEFAULT 0,
    predicted_close_date TIMESTAMPTZ,
    predicted_deal_value NUMERIC(12,2) DEFAULT 0,
    risk_level          TEXT DEFAULT 'unknown',       -- low | medium | high | critical
    risk_factors        JSONB DEFAULT '[]',
    
    -- Engagement Scoring
    engagement_score    INTEGER DEFAULT 0,
    email_opens         INTEGER DEFAULT 0,
    email_replies       INTEGER DEFAULT 0,
    calls_made          INTEGER DEFAULT 0,
    calls_answered      INTEGER DEFAULT 0,
    proposals_sent      INTEGER DEFAULT 0,
    proposals_viewed    INTEGER DEFAULT 0,
    last_interaction    TIMESTAMPTZ,
    days_since_contact  INTEGER DEFAULT 0,
    
    -- AI Recommendations
    next_best_action    TEXT,
    action_urgency      TEXT DEFAULT 'normal',       -- low | normal | high | critical
    action_channel      TEXT,
    
    -- Health Trend
    health_trend        TEXT DEFAULT 'stable',       -- improving | stable | declining | stalled
    score_history       JSONB DEFAULT '[]',
    
    calculated_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(saved_lead_id)
);

-- 2. Create pipeline_summary table
CREATE TABLE IF NOT EXISTS public.pipeline_summary (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    period              TEXT NOT NULL,                -- '2026-08'
    
    -- Pipeline Metrics
    total_pipeline_value NUMERIC(12,2) DEFAULT 0,
    weighted_pipeline    NUMERIC(12,2) DEFAULT 0,
    deals_won_count     INTEGER DEFAULT 0,
    deals_won_value     NUMERIC(12,2) DEFAULT 0,
    deals_lost_count    INTEGER DEFAULT 0,
    deals_lost_value    NUMERIC(12,2) DEFAULT 0,
    avg_deal_size       NUMERIC(12,2) DEFAULT 0,
    avg_cycle_days      INTEGER DEFAULT 0,
    win_rate            NUMERIC(5,2) DEFAULT 0,
    
    -- Velocity
    pipeline_velocity   NUMERIC(12,2) DEFAULT 0,
    
    -- AI Forecast
    forecast_revenue    NUMERIC(12,2) DEFAULT 0,
    forecast_confidence INTEGER DEFAULT 0,
    
    calculated_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period)
);

-- 3. Create deal_activity_log table
CREATE TABLE IF NOT EXISTS public.deal_activity_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saved_lead_id       UUID NOT NULL REFERENCES public.saved_leads(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    activity_type       TEXT NOT NULL,
    title               TEXT NOT NULL,
    description         TEXT,
    metadata            JSONB DEFAULT '{}',
    source              TEXT DEFAULT 'manual',
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Extend saved_leads table
ALTER TABLE public.saved_leads ADD COLUMN IF NOT EXISTS deal_value NUMERIC(12,2) DEFAULT 15000;
ALTER TABLE public.saved_leads ADD COLUMN IF NOT EXISTS deal_currency TEXT DEFAULT 'INR';
ALTER TABLE public.saved_leads ADD COLUMN IF NOT EXISTS expected_close_date TIMESTAMPTZ;
ALTER TABLE public.saved_leads ADD COLUMN IF NOT EXISTS lost_reason TEXT;
ALTER TABLE public.saved_leads ADD COLUMN IF NOT EXISTS won_at TIMESTAMPTZ;
ALTER TABLE public.saved_leads ADD COLUMN IF NOT EXISTS lost_at TIMESTAMPTZ;
ALTER TABLE public.saved_leads ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.saved_leads ADD COLUMN IF NOT EXISTS activity_count INTEGER DEFAULT 0;

-- 5. Extend profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_deal_value NUMERIC(12,2) DEFAULT 15000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pipeline_stages JSONB DEFAULT '["new","contacted","interested","proposal_sent","negotiation","converted","lost"]';

-- Enable RLS
ALTER TABLE public.deal_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Users manage own intelligence" ON public.deal_intelligence;
DROP POLICY IF EXISTS "Users manage own pipeline" ON public.pipeline_summary;
DROP POLICY IF EXISTS "Users manage own activity" ON public.deal_activity_log;

-- Define Policies
CREATE POLICY "Users manage own intelligence" ON public.deal_intelligence
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own pipeline" ON public.pipeline_summary
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own activity" ON public.deal_activity_log
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create Intelligent Pipeline function
CREATE OR REPLACE FUNCTION public.get_intelligent_pipeline(p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'pipeline', (
                SELECT json_agg(json_build_object(
                    'status', sl.status,
                    'count', COUNT(*),
                    'total_value', SUM(COALESCE(sl.deal_value, 0)),
                    'avg_probability', AVG(COALESCE(di.close_probability, 0)),
                    'at_risk_count', COUNT(*) FILTER (WHERE di.risk_level IN ('high', 'critical'))
                ))
                FROM public.saved_leads sl
                LEFT JOIN public.deal_intelligence di ON di.saved_lead_id = sl.id
                WHERE sl.user_id = p_user_id
                GROUP BY sl.status
            ),
            'urgent_actions', (
                SELECT json_agg(json_build_object(
                    'lead_name', p.name,
                    'action', di.next_best_action,
                    'urgency', di.action_urgency,
                    'probability', di.close_probability
                ) ORDER BY 
                    CASE di.action_urgency 
                        WHEN 'critical' THEN 1 WHEN 'high' THEN 2 
                        WHEN 'normal' THEN 3 ELSE 4 END
                )
                FROM public.deal_intelligence di
                JOIN public.saved_leads sl ON sl.id = di.saved_lead_id
                JOIN public.professionals p ON p.id = sl.professional_id
                WHERE di.user_id = p_user_id AND di.next_best_action IS NOT NULL
                LIMIT 5
            ),
            'revenue_at_risk', (
                SELECT COALESCE(SUM(sl.deal_value), 0)
                FROM public.saved_leads sl
                JOIN public.deal_intelligence di ON di.saved_lead_id = sl.id
                WHERE sl.user_id = p_user_id AND di.risk_level IN ('high', 'critical')
            )
        )
    );
END; $$;
