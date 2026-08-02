-- NearPro v4: Automated Multi-Step Email Sequences Migration

-- 1. Create email_sequences table
CREATE TABLE IF NOT EXISTS public.email_sequences (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    description         TEXT,
    status              TEXT DEFAULT 'draft',  -- draft | active | paused | completed | archived
    channel             TEXT DEFAULT 'email',  -- email | whatsapp | multi
    language            TEXT DEFAULT 'hinglish',
    total_steps         INTEGER DEFAULT 0,
    total_enrolled      INTEGER DEFAULT 0,
    total_replied       INTEGER DEFAULT 0,
    total_bounced       INTEGER DEFAULT 0,
    open_rate           NUMERIC(5,2) DEFAULT 0,
    reply_rate          NUMERIC(5,2) DEFAULT 0,
    ab_test_enabled     BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create sequence_steps table
CREATE TABLE IF NOT EXISTS public.sequence_steps (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id         UUID NOT NULL REFERENCES public.email_sequences(id) ON DELETE CASCADE,
    step_number         INTEGER NOT NULL,        -- 1, 2, 3...
    step_type           TEXT DEFAULT 'email',    -- email | whatsapp | delay | condition
    subject_line        TEXT,                    -- email subject
    body_template       TEXT NOT NULL,           -- message body with {{placeholders}}
    delay_days          INTEGER DEFAULT 3,       -- wait N days before this step fires
    delay_hours         INTEGER DEFAULT 0,       -- additional hours
    send_time_window    TEXT DEFAULT '10:00-18:00', -- IST window to send
    ab_variant          TEXT DEFAULT 'A',        -- A or B for A/B testing
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create sequence_enrollments table
CREATE TABLE IF NOT EXISTS public.sequence_enrollments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id         UUID NOT NULL REFERENCES public.email_sequences(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    saved_lead_id       UUID REFERENCES public.saved_leads(id) ON DELETE SET NULL,
    current_step        INTEGER DEFAULT 1,
    status              TEXT DEFAULT 'active',   -- active | paused | completed | replied | bounced | unsubscribed
    enrolled_at         TIMESTAMPTZ DEFAULT NOW(),
    last_step_sent_at   TIMESTAMPTZ,
    next_step_due_at    TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    reply_received_at   TIMESTAMPTZ,
    UNIQUE(sequence_id, professional_id, user_id)
);

-- 4. Create sequence_send_log table
CREATE TABLE IF NOT EXISTS public.sequence_send_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id       UUID NOT NULL REFERENCES public.sequence_enrollments(id) ON DELETE CASCADE,
    step_id             UUID NOT NULL REFERENCES public.sequence_steps(id) ON DELETE CASCADE,
    step_number         INTEGER NOT NULL,
    channel             TEXT NOT NULL,            -- email | whatsapp
    recipient_email     TEXT,
    recipient_phone     TEXT,
    subject_rendered     TEXT,
    body_rendered        TEXT,
    status              TEXT DEFAULT 'queued',    -- queued | sent | delivered | opened | replied | bounced | failed
    opened_at           TIMESTAMPTZ,
    replied_at          TIMESTAMPTZ,
    bounced_at          TIMESTAMPTZ,
    sent_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Add custom connection and sequence statistics columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_sequence_sends_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_sequence_sends_limit INTEGER DEFAULT 100; -- Default Scout limit
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_host TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_user TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smtp_encrypted_pass TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sender_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_signature TEXT;

-- Enable RLS
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_send_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Users manage own sequences" ON public.email_sequences;
DROP POLICY IF EXISTS "Users manage own steps" ON public.sequence_steps;
DROP POLICY IF EXISTS "Users manage own enrollments" ON public.sequence_enrollments;
DROP POLICY IF EXISTS "Users view own send logs" ON public.sequence_send_log;

-- Configure RLS Policies
CREATE POLICY "Users manage own sequences" ON public.email_sequences
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own steps" ON public.sequence_steps
    FOR ALL USING (
        sequence_id IN (SELECT id FROM public.email_sequences WHERE user_id = auth.uid())
    ) WITH CHECK (
        sequence_id IN (SELECT id FROM public.email_sequences WHERE user_id = auth.uid())
    );

CREATE POLICY "Users manage own enrollments" ON public.sequence_enrollments
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own send logs" ON public.sequence_send_log
    FOR ALL USING (
        enrollment_id IN (SELECT id FROM public.sequence_enrollments WHERE user_id = auth.uid())
    ) WITH CHECK (
        enrollment_id IN (SELECT id FROM public.sequence_enrollments WHERE user_id = auth.uid())
    );

-- 6. Add aggregation helper RPC for dashboard metrics
CREATE OR REPLACE FUNCTION public.get_sequence_analytics(p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'total_sequences', (SELECT COUNT(*) FROM public.email_sequences WHERE user_id = p_user_id),
            'active_sequences', (SELECT COUNT(*) FROM public.email_sequences WHERE user_id = p_user_id AND status = 'active'),
            'total_enrolled', (SELECT COUNT(*) FROM public.sequence_enrollments WHERE user_id = p_user_id),
            'total_replied', (SELECT COUNT(*) FROM public.sequence_enrollments WHERE user_id = p_user_id AND status = 'replied'),
            'avg_open_rate', (SELECT COALESCE(AVG(open_rate), 0) FROM public.email_sequences WHERE user_id = p_user_id AND status IN ('active', 'completed')),
            'avg_reply_rate', (SELECT COALESCE(AVG(reply_rate), 0) FROM public.email_sequences WHERE user_id = p_user_id AND status IN ('active', 'completed'))
        )
    );
END; $$;
