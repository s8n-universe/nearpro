-- NearPro v10: Multi-Channel Sequence Orchestrator Migration

-- 1. Create channel_accounts table
CREATE TABLE IF NOT EXISTS public.channel_accounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel_type        TEXT NOT NULL,               -- email | whatsapp | linkedin | phone | sms
    account_name        TEXT NOT NULL,               -- "My Gmail", "WhatsApp Business"
    
    config              JSONB DEFAULT '{}',
    encrypted_secrets   JSONB DEFAULT '{}',
    
    status              TEXT DEFAULT 'connected',    -- connected | disconnected | error | warming
    daily_limit         INTEGER DEFAULT 50,
    daily_used          INTEGER DEFAULT 0,
    
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, channel_type, account_name)
);

-- 2. Create orchestration_events table
CREATE TABLE IF NOT EXISTS public.orchestration_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id       UUID NOT NULL REFERENCES public.sequence_enrollments(id) ON DELETE CASCADE,
    step_id             UUID REFERENCES public.sequence_steps(id) ON DELETE SET NULL,
    channel_type        TEXT NOT NULL,
    event_type          TEXT NOT NULL,                -- sent | delivered | opened | clicked | replied | bounced | failed | connected | called
    
    metadata            JSONB DEFAULT '{}',
    occurred_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create channel_performance table
CREATE TABLE IF NOT EXISTS public.channel_performance (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel_type        TEXT NOT NULL,
    period              TEXT NOT NULL,                -- '2026-08'
    total_sent          INTEGER DEFAULT 0,
    total_delivered     INTEGER DEFAULT 0,
    total_opened        INTEGER DEFAULT 0,
    total_replied       INTEGER DEFAULT 0,
    total_bounced       INTEGER DEFAULT 0,
    avg_response_time_h NUMERIC(8,2) DEFAULT 0,
    calculated_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, channel_type, period)
);

-- 4. Alter sequence_steps table to add multi-channel support
ALTER TABLE public.sequence_steps ADD COLUMN IF NOT EXISTS channel_type TEXT DEFAULT 'email';
ALTER TABLE public.sequence_steps ADD COLUMN IF NOT EXISTS channel_account_id UUID REFERENCES public.channel_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.sequence_steps ADD COLUMN IF NOT EXISTS condition_type TEXT DEFAULT 'no_reply';
ALTER TABLE public.sequence_steps ADD COLUMN IF NOT EXISTS condition_config JSONB DEFAULT '{}';

-- Enable RLS
ALTER TABLE public.channel_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orchestration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_performance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Users manage own channels" ON public.channel_accounts;
DROP POLICY IF EXISTS "Users view own orchestration events" ON public.orchestration_events;
DROP POLICY IF EXISTS "Users view own channel performance" ON public.channel_performance;

-- Define Policies
CREATE POLICY "Users manage own channels" ON public.channel_accounts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own orchestration events" ON public.orchestration_events
    FOR SELECT USING (
        enrollment_id IN (SELECT id FROM public.sequence_enrollments WHERE user_id = auth.uid())
    );

CREATE POLICY "Users view own channel performance" ON public.channel_performance
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
