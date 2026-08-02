-- NearPro v7: MCP Plugin Marketplace Migration

-- 1. Create mcp_plugins table
CREATE TABLE IF NOT EXISTS public.mcp_plugins (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                TEXT NOT NULL UNIQUE,         -- 'nearpro-auditor', 'hubspot-sync'
    name                TEXT NOT NULL,
    description         TEXT,
    long_description    TEXT,
    version             TEXT DEFAULT '1.0.0',
    author_name         TEXT,
    author_url          TEXT,
    icon_url            TEXT,
    banner_url          TEXT,
    
    -- Classification
    category            TEXT DEFAULT 'utility',       -- enrichment | outreach | analytics | integration | utility
    tags                TEXT[] DEFAULT '{}',
    
    -- MCP Server Config
    transport_type      TEXT DEFAULT 'stdio',         -- stdio | http | sse
    server_url          TEXT,
    command             TEXT,
    args                TEXT[] DEFAULT '{}',
    env_vars            JSONB DEFAULT '{}',
    
    -- Capabilities declared
    tools_provided      JSONB DEFAULT '[]',
    resources_provided  JSONB DEFAULT '[]',
    prompts_provided    JSONB DEFAULT '[]',
    
    -- Marketplace
    is_official         BOOLEAN DEFAULT FALSE,
    is_verified         BOOLEAN DEFAULT FALSE,
    is_free             BOOLEAN DEFAULT TRUE,
    price_inr           NUMERIC(10,2) DEFAULT 0,
    min_tier            TEXT DEFAULT 'free',
    install_count       INTEGER DEFAULT 0,
    avg_rating          NUMERIC(3,2) DEFAULT 0,
    total_ratings       INTEGER DEFAULT 0,
    
    -- State
    is_active           BOOLEAN DEFAULT TRUE,
    published_at        TIMESTAMPTZ DEFAULT NOW(),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create user_plugin_installations table
CREATE TABLE IF NOT EXISTS public.user_plugin_installations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plugin_id           UUID NOT NULL REFERENCES public.mcp_plugins(id) ON DELETE CASCADE,
    status              TEXT DEFAULT 'installed',     -- installed | disabled | error
    config              JSONB DEFAULT '{}',
    encrypted_secrets   JSONB DEFAULT '{}',
    last_used_at        TIMESTAMPTZ,
    error_message       TEXT,
    installed_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, plugin_id)
);

-- 3. Create plugin_execution_log table
CREATE TABLE IF NOT EXISTS public.plugin_execution_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plugin_id           UUID NOT NULL REFERENCES public.mcp_plugins(id) ON DELETE CASCADE,
    tool_name           TEXT NOT NULL,
    input_params        JSONB DEFAULT '{}',
    output_result       JSONB DEFAULT '{}',
    execution_ms        INTEGER,
    status              TEXT DEFAULT 'success',
    error_message       TEXT,
    credits_charged     INTEGER DEFAULT 0,
    executed_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create plugin_reviews table
CREATE TABLE IF NOT EXISTS public.plugin_reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plugin_id           UUID NOT NULL REFERENCES public.mcp_plugins(id) ON DELETE CASCADE,
    rating              INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, plugin_id)
);

-- 5. Add plugin credits columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plugin_credits INTEGER DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_plugin_executions_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_plugin_executions_limit INTEGER DEFAULT 100; -- Free allowance limit

-- Enable RLS
ALTER TABLE public.mcp_plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plugin_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Public read mcp_plugins" ON public.mcp_plugins;
DROP POLICY IF EXISTS "Users manage own installations" ON public.user_plugin_installations;
DROP POLICY IF EXISTS "Users view own plugin logs" ON public.plugin_execution_log;
DROP POLICY IF EXISTS "Users manage own reviews" ON public.plugin_reviews;

-- Define Policies
CREATE POLICY "Public read mcp_plugins" ON public.mcp_plugins FOR SELECT USING (true);
CREATE POLICY "Users manage own installations" ON public.user_plugin_installations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own plugin logs" ON public.plugin_execution_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own reviews" ON public.plugin_reviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Seed official plugins
INSERT INTO public.mcp_plugins (slug, name, description, category, is_official, is_verified, is_free, tools_provided)
VALUES
('nearpro-lead-directory', 'Lead Directory Core', 'Access NearPro verified B2B lead database endpoints directly.', 'utility', true, true, true,
 '[{"name":"search_leads","description":"Search leads by category, area, rating"},{"name":"get_lead_details","description":"Get full details of a specific lead"}]'),

('nearpro-website-auditor', 'Website Auditor Core', 'Run PageSpeed, optimization checklists, and SEO diagnostics.', 'analytics', true, true, true,
 '[{"name":"audit_website","description":"Run a comprehensive website audit"},{"name":"get_audit_report","description":"Retrieve cached audit results"}]'),

('nearpro-ai-outreach', 'AI Outreach Studio Core', 'Generate tailored Hinglish sales copies, emails, and WhatsApp pitches.', 'outreach', true, true, true,
 '[{"name":"generate_pitch","description":"Create personalized cold pitch for a lead"},{"name":"generate_sequence","description":"Create multi-step outreach sequence"}]')
ON CONFLICT (slug) DO NOTHING;

-- Seed community plugins
INSERT INTO public.mcp_plugins (slug, name, description, category, is_official, is_verified, is_free, tools_provided, author_name, install_count, avg_rating)
VALUES
('hubspot-crm-sync', 'HubSpot CRM Sync', 'Instantly push enriched B2B leads from NearPro into HubSpot contact pipelines.', 'integration', false, true, true,
 '[{"name":"push_lead_to_hubspot","description":"Push a NearPro lead into HubSpot Contacts list"},{"name":"sync_deal_status","description":"Sync deal pipelines status back to NearPro CRM"}]', 'S8N AI Services', 247, 4.80),

('google-sheets-export', 'Google Sheets Auto-Sync', 'Stream lead intelligence results straight into designated target Sheets.', 'utility', false, true, true,
 '[{"name":"export_leads_to_sheet","description":"Write selected lists into a designated Google Spreadsheet"}]', 'NearPro Community', 189, 4.50),

('slack-deal-notifier', 'Slack Deal Alerts', 'Get instant alerts when leads reply, open pitches, or schedules booking calls.', 'integration', false, true, true,
 '[{"name":"send_slack_alert","description":"Post a message alert into a Slack channel"}]', 'NearPro Community', 156, 4.60)
ON CONFLICT (slug) DO NOTHING;
