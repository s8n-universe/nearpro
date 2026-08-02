-- NearPro v14: Production Hardening and Autohealing Migration

-- 1. Hardening domain_health_reports table
-- First, resolve duplicate rows if any exist
DELETE FROM public.domain_health_reports a USING public.domain_health_reports b
WHERE a.id < b.id AND a.user_id = b.user_id AND a.domain = b.domain;

-- Add user_id + domain unique constraint
ALTER TABLE public.domain_health_reports DROP CONSTRAINT IF EXISTS domain_health_reports_user_id_domain_key;
ALTER TABLE public.domain_health_reports ADD CONSTRAINT domain_health_reports_user_id_domain_key UNIQUE(user_id, domain);


-- 2. Hardening research_reports table
-- First, resolve duplicate rows if any exist
DELETE FROM public.research_reports a USING public.research_reports b
WHERE a.id < b.id AND a.professional_id = b.professional_id AND a.user_id = b.user_id;

-- Add professional_id + user_id unique constraint
ALTER TABLE public.research_reports DROP CONSTRAINT IF EXISTS research_reports_professional_id_user_id_key;
ALTER TABLE public.research_reports ADD CONSTRAINT research_reports_professional_id_user_id_key UNIQUE(professional_id, user_id);


-- 3. Update warmup_interactions RLS policies to allow full CRUD
DROP POLICY IF EXISTS "Users view own warmup interactions" ON public.warmup_interactions;
CREATE POLICY "Users manage own warmup interactions" ON public.warmup_interactions
    FOR ALL USING (
        account_id IN (SELECT id FROM public.email_accounts WHERE user_id = auth.uid())
    ) WITH CHECK (
        account_id IN (SELECT id FROM public.email_accounts WHERE user_id = auth.uid())
    );


-- 4. Update ai_usage_log RLS policies to allow full CRUD
DROP POLICY IF EXISTS "Users view own usage" ON public.ai_usage_log;
CREATE POLICY "Users manage own usage" ON public.ai_usage_log
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 5. Atomic calculation RPC functions
CREATE OR REPLACE FUNCTION public.atomic_increment(p_table TEXT, p_id UUID, p_column TEXT, p_amount INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    EXECUTE format('UPDATE public.%I SET %I = COALESCE(%I, 0) + %L WHERE id = %L', p_table, p_column, p_column, p_amount, p_id);
END; $$;

CREATE OR REPLACE FUNCTION public.atomic_decrement(p_table TEXT, p_id UUID, p_column TEXT, p_amount INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    EXECUTE format('UPDATE public.%I SET %I = GREATEST(0, COALESCE(%I, 0) - %L) WHERE id = %L', p_table, p_column, p_column, p_amount, p_id);
END; $$;


-- 6. Safe Update Professionals intent scoring and signal metrics RPC (bypasses direct client write checks)
CREATE OR REPLACE FUNCTION public.safe_update_professional_signals(p_professional_id UUID, p_score_diff INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.professionals 
    SET intent_score = LEAST(100, GREATEST(0, COALESCE(intent_score, 40) + p_score_diff)),
        active_signals_count = COALESCE(active_signals_count, 0) + 1,
        last_signal_detected_at = NOW()
    WHERE id = p_professional_id;
END; $$;
