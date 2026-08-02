-- NearPro v3: Feature Flags & S8N Control Panel Admin Migration

-- 1. Create feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    name TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Allow public read access to feature_flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Allow admin full access to feature_flags" ON public.feature_flags;

-- 2. Define access policies
-- Read: Open to anyone (authenticated or anonymous) so the frontend can check flags on start
CREATE POLICY "Allow public read access to feature_flags" ON public.feature_flags
    FOR SELECT USING (true);

-- Write: Restricted strictly to the admin account
CREATE POLICY "Allow admin full access to feature_flags" ON public.feature_flags
    FOR ALL USING (auth.jwt() ->> 'email' = 'nearproadmin@gmail.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'nearproadmin@gmail.com');

-- 3. Seed the 10 v2 features as disabled (is_enabled = FALSE)
INSERT INTO public.feature_flags (name, display_name, is_enabled) VALUES
('email_sequences', 'Automated Multi-Step Email Sequences', FALSE),
('email_warmup', 'Email Warmup & Deliverability', FALSE),
('waterfall_enrichment', 'Waterfall Data Enrichment Engine', FALSE),
('mcp_plugins', 'MCP Plugin Marketplace', FALSE),
('ai_research', 'AI Research Agent', FALSE),
('intent_signals', 'Intent & Buying Signal Detection', FALSE),
('multi_channel', 'Multi-Channel Sequence Orchestrator', FALSE),
('voice_calling', 'AI Voice Calling Agent', FALSE),
('deal_intelligence', 'Deal Intelligence Dashboard', FALSE),
('self_hosted_llm', 'Self-Hosted LLM Support', FALSE)
ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name;
