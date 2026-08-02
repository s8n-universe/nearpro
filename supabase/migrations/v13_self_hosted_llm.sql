-- 1. AI provider configurations table
CREATE TABLE IF NOT EXISTS ai_provider_configs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,                -- "My Ollama Server", "OpenAI GPT-4o"
    
    -- Provider Details
    provider_type       TEXT NOT NULL,               -- ollama | openai | gemini | anthropic | litellm | custom
    base_url            TEXT,                        -- "http://localhost:11434" for Ollama
    model_id            TEXT NOT NULL,               -- "llama3.1:8b", "gpt-4o", "gemini-2.5-flash"
    encrypted_api_key   TEXT,                        -- For cloud providers (AES-256)
    
    -- Capabilities
    supports_streaming  BOOLEAN DEFAULT TRUE,
    supports_tools      BOOLEAN DEFAULT FALSE,       -- Function calling support
    supports_vision     BOOLEAN DEFAULT FALSE,       -- Image input support
    max_tokens          INTEGER DEFAULT 4096,
    context_window      INTEGER DEFAULT 8192,
    
    -- Performance
    avg_latency_ms      INTEGER,
    avg_tokens_per_sec  NUMERIC(8,2),
    last_health_check   TIMESTAMPTZ,
    health_status       TEXT DEFAULT 'unknown',      -- healthy | slow | error | offline
    
    -- Usage Assignment
    use_for             JSONB DEFAULT '["outreach","scripts","proposals","research"]',
    
    -- Priority
    priority            INTEGER DEFAULT 1,           -- Lower = preferred
    is_default          BOOLEAN DEFAULT FALSE,
    is_active           BOOLEAN DEFAULT TRUE,
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- 2. AI usage tracking log table
CREATE TABLE IF NOT EXISTS ai_usage_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider_config_id  UUID REFERENCES ai_provider_configs(id) ON DELETE SET NULL,
    
    -- Request details
    feature             TEXT NOT NULL,               -- outreach | proposal | script | research | voice | enrichment
    model_used          TEXT NOT NULL,
    provider_type       TEXT NOT NULL,
    
    -- Token usage
    prompt_tokens       INTEGER DEFAULT 0,
    completion_tokens   INTEGER DEFAULT 0,
    total_tokens        INTEGER DEFAULT 0,
    
    -- Cost (estimated)
    estimated_cost_inr  NUMERIC(10,4) DEFAULT 0,    -- ₹0 for Ollama, calculated for cloud
    
    -- Performance
    latency_ms          INTEGER,
    success             BOOLEAN DEFAULT TRUE,
    error_message       TEXT,
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Model performance benchmarks (per user, per model)
CREATE TABLE IF NOT EXISTS model_benchmarks (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider_config_id  UUID NOT NULL REFERENCES ai_provider_configs(id) ON DELETE CASCADE,
    
    -- Quality scores (rated by user or auto-evaluated)
    outreach_quality    INTEGER,                     -- 1-10 rating for outreach generation
    script_quality      INTEGER,                     -- 1-10 for call scripts
    proposal_quality    INTEGER,                     -- 1-10 for proposals
    research_quality    INTEGER,                     -- 1-10 for research analysis
    
    -- Speed
    avg_outreach_ms     INTEGER,
    avg_proposal_ms     INTEGER,
    avg_research_ms     INTEGER,
    
    -- Overall
    overall_score       NUMERIC(4,2),
    total_evaluations   INTEGER DEFAULT 0,
    
    last_evaluated_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider_config_id)
);

-- 4. Add AI preferences and savings/token counters to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_ai_provider UUID REFERENCES ai_provider_configs(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_cost_savings_total NUMERIC(12,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_ai_tokens_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_ai_tokens_limit INTEGER DEFAULT 0;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE ai_provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_benchmarks ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Users manage own configs" ON ai_provider_configs;
CREATE POLICY "Users manage own configs" ON ai_provider_configs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own usage" ON ai_usage_log;
CREATE POLICY "Users view own usage" ON ai_usage_log FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own benchmarks" ON model_benchmarks;
CREATE POLICY "Users manage own benchmarks" ON model_benchmarks FOR ALL USING (auth.uid() = user_id);

-- 7. Helper RPC to resolve active provider for a feature
CREATE OR REPLACE FUNCTION get_active_ai_provider(p_user_id UUID, p_feature TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    provider_type TEXT,
    base_url TEXT,
    model_id TEXT,
    encrypted_api_key TEXT,
    supports_streaming BOOLEAN,
    supports_tools BOOLEAN,
    supports_vision BOOLEAN,
    max_tokens INTEGER,
    context_window INTEGER,
    health_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.provider_type,
        c.base_url,
        c.model_id,
        c.encrypted_api_key,
        c.supports_streaming,
        c.supports_tools,
        c.supports_vision,
        c.max_tokens,
        c.context_window,
        c.health_status
    FROM ai_provider_configs c
    WHERE c.user_id = p_user_id
      AND c.is_active = true
      AND c.use_for ? p_feature
    ORDER BY c.is_default DESC, c.priority ASC, c.created_at ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
