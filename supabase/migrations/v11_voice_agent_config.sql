-- NearPro v11: AI Voice Agent Migration

-- 1. Create voice_agent_configs table
CREATE TABLE IF NOT EXISTS public.voice_agent_configs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name                TEXT NOT NULL DEFAULT 'Default Agent',
    
    -- Voice Personality
    voice_id            TEXT DEFAULT 'alloy',         -- alloy | echo | nova | shimmer
    voice_provider      TEXT DEFAULT 'openai',        -- openai | elevenlabs | deepgram
    language            TEXT DEFAULT 'en-IN',         -- en-IN | hi-IN | hinglish
    speaking_rate       NUMERIC(3,2) DEFAULT 1.0,
    
    -- Agent Behavior
    agent_persona       TEXT DEFAULT 'professional',  -- professional | friendly | consultative
    opening_script      TEXT,                         -- Custom opening line template
    qualification_questions JSONB DEFAULT '[]',
    objection_handling  JSONB DEFAULT '{}',
    max_call_duration_s INTEGER DEFAULT 180,
    
    -- Knowledge Base
    company_context     TEXT,
    services_offered    JSONB DEFAULT '[]',
    pricing_info        TEXT,
    
    -- LLM Config
    llm_model           TEXT DEFAULT 'gemini-2.5-flash',
    system_prompt       TEXT,
    temperature         NUMERIC(3,2) DEFAULT 0.7,
    
    knowledge_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    is_default          BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create call_transcripts table
CREATE TABLE IF NOT EXISTS public.call_transcripts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_log_id         UUID NOT NULL REFERENCES public.call_audit_log(id) ON DELETE CASCADE,
    
    -- Full conversation transcript
    transcript          JSONB DEFAULT '[]',
    
    -- AI Analysis
    sentiment_overall   TEXT DEFAULT 'neutral',       -- positive | neutral | negative
    interest_level      TEXT DEFAULT 'unknown',       -- hot | warm | cold | not_interested
    key_objections      JSONB DEFAULT '[]',
    action_items        JSONB DEFAULT '[]',
    summary             TEXT,
    
    -- Quality Metrics
    agent_talk_ratio    NUMERIC(5,2) DEFAULT 50.00,
    interruptions       INTEGER DEFAULT 0,
    avg_response_ms     INTEGER DEFAULT 800,
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create scheduled_calls table
CREATE TABLE IF NOT EXISTS public.scheduled_calls (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id         UUID REFERENCES public.voice_campaigns(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    agent_config_id     UUID REFERENCES public.voice_agent_configs(id) ON DELETE SET NULL,
    
    -- Scheduling
    scheduled_for       TIMESTAMPTZ NOT NULL,
    time_zone           TEXT DEFAULT 'Asia/Kolkata',
    
    -- TRAI Compliance
    calling_window_start TEXT DEFAULT '10:00',
    calling_window_end  TEXT DEFAULT '19:00',
    
    status              TEXT DEFAULT 'scheduled',     -- scheduled | dialing | completed | failed | cancelled
    call_log_id         UUID REFERENCES public.call_audit_log(id) ON DELETE SET NULL,
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.voice_agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_calls ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Users manage own configs" ON public.voice_agent_configs;
DROP POLICY IF EXISTS "Users view own transcripts" ON public.call_transcripts;
DROP POLICY IF EXISTS "Users manage own scheduled calls" ON public.scheduled_calls;

-- Define Policies
CREATE POLICY "Users manage own configs" ON public.voice_agent_configs
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own transcripts" ON public.call_transcripts
    FOR SELECT USING (
        call_log_id IN (SELECT id FROM public.call_audit_log WHERE initiated_by_user = auth.uid())
    );

CREATE POLICY "Users manage own scheduled calls" ON public.scheduled_calls
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
