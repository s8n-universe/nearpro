# Feature 4: MCP Plugin Architecture

## Overview
Transform NearPro from a monolithic app into an extensible platform. Every NearPro feature (audits, outreach, enrichment) becomes an MCP server, and users can install community/third-party MCP plugins — like a "Shopify App Store" for B2B sales automation. This is the architectural foundation that separates a product from a platform.

---

## 1. Database Schema (Supabase PostgreSQL)

### New Tables

```sql
-- 4a. Plugin registry — all available MCP servers/plugins
CREATE TABLE IF NOT EXISTS mcp_plugins (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                TEXT NOT NULL UNIQUE,         -- 'nearpro-auditor', 'hunter-enrichment'
    name                TEXT NOT NULL,                -- 'Website Auditor'
    description         TEXT,
    long_description    TEXT,                         -- Markdown-formatted detailed description
    version             TEXT DEFAULT '1.0.0',
    author_name         TEXT,
    author_url          TEXT,
    icon_url            TEXT,                         -- Plugin icon
    banner_url          TEXT,                         -- Plugin banner for marketplace
    
    -- Classification
    category            TEXT DEFAULT 'utility',       -- enrichment | outreach | analytics | integration | utility
    tags                TEXT[] DEFAULT '{}',          -- ['email', 'crm', 'ai']
    
    -- MCP Server Config
    transport_type      TEXT DEFAULT 'stdio',         -- stdio | http | sse
    server_url          TEXT,                         -- For remote HTTP MCP servers
    command             TEXT,                         -- For stdio: 'npx -y @nearpro/mcp-auditor'
    args                TEXT[] DEFAULT '{}',
    env_vars            JSONB DEFAULT '{}',           -- Required environment variables
    
    -- Capabilities declared
    tools_provided      JSONB DEFAULT '[]',           -- [{name, description, inputSchema}]
    resources_provided  JSONB DEFAULT '[]',           -- [{uri, name, description}]
    prompts_provided    JSONB DEFAULT '[]',           -- [{name, description, arguments}]
    
    -- Marketplace
    is_official         BOOLEAN DEFAULT FALSE,        -- NearPro built-in
    is_verified         BOOLEAN DEFAULT FALSE,        -- Community verified
    is_free             BOOLEAN DEFAULT TRUE,
    price_inr           NUMERIC(10,2) DEFAULT 0,
    min_tier            TEXT DEFAULT 'free',          -- Minimum subscription tier
    install_count       INTEGER DEFAULT 0,
    avg_rating          NUMERIC(3,2) DEFAULT 0,
    total_ratings       INTEGER DEFAULT 0,
    
    -- State
    is_active           BOOLEAN DEFAULT TRUE,
    published_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4b. User plugin installations
CREATE TABLE IF NOT EXISTS user_plugin_installations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plugin_id           UUID NOT NULL REFERENCES mcp_plugins(id) ON DELETE CASCADE,
    status              TEXT DEFAULT 'installed',     -- installed | disabled | error
    config              JSONB DEFAULT '{}',           -- User-specific config (API keys, preferences)
    encrypted_secrets   JSONB DEFAULT '{}',           -- Encrypted sensitive config values
    last_used_at        TIMESTAMPTZ,
    error_message       TEXT,
    installed_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, plugin_id)
);

-- 4c. Plugin execution log
CREATE TABLE IF NOT EXISTS plugin_execution_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plugin_id           UUID NOT NULL REFERENCES mcp_plugins(id) ON DELETE CASCADE,
    tool_name           TEXT NOT NULL,                -- The MCP tool that was called
    input_params        JSONB DEFAULT '{}',
    output_result       JSONB DEFAULT '{}',
    execution_ms        INTEGER,
    status              TEXT DEFAULT 'success',       -- success | error | timeout
    error_message       TEXT,
    credits_charged     INTEGER DEFAULT 0,
    executed_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 4d. Plugin ratings & reviews
CREATE TABLE IF NOT EXISTS plugin_reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plugin_id           UUID NOT NULL REFERENCES mcp_plugins(id) ON DELETE CASCADE,
    rating              INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, plugin_id)
);

-- 4e. Plugin credits system
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plugin_credits INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_plugin_executions_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_plugin_executions_limit INTEGER DEFAULT 0;
-- Free: 10, Scout: 100, Hunter: 500, Agency: Unlimited
```

### Pre-seed Official Plugins
```sql
-- Seed NearPro's built-in features as official MCP plugins
INSERT INTO mcp_plugins (slug, name, description, category, is_official, is_verified, is_free, tools_provided)
VALUES
('nearpro-lead-directory', 'Lead Directory', 'Access NearPro verified B2B lead database', 'utility', true, true, true,
 '[{"name":"search_leads","description":"Search leads by category, area, rating"},{"name":"get_lead_details","description":"Get full details of a specific lead"}]'),

('nearpro-website-auditor', 'Website Auditor', 'Run PageSpeed and business health audits', 'analytics', true, true, true,
 '[{"name":"audit_website","description":"Run a comprehensive website audit"},{"name":"get_audit_report","description":"Retrieve cached audit results"}]'),

('nearpro-ai-outreach', 'AI Outreach Generator', 'Generate multi-channel cold outreach messages', 'outreach', true, true, true,
 '[{"name":"generate_pitch","description":"Create personalized cold pitch for a lead"},{"name":"generate_sequence","description":"Create multi-step outreach sequence"}]'),

('nearpro-proposal-gen', 'Proposal Generator', 'Generate PDF business proposals', 'utility', true, true, true,
 '[{"name":"generate_proposal","description":"Create 3-page customized PDF proposal"}]'),

('nearpro-call-scripts', 'Call Script Engine', 'Generate cold-calling teleprompter scripts', 'outreach', true, true, true,
 '[{"name":"generate_call_script","description":"Create structured cold call script with objection handling"}]')
ON CONFLICT (slug) DO NOTHING;
```

### RLS Policies
```sql
ALTER TABLE mcp_plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plugin_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read plugins" ON mcp_plugins FOR SELECT USING (true);
CREATE POLICY "Users manage own installations" ON user_plugin_installations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own logs" ON plugin_execution_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own reviews" ON plugin_reviews FOR ALL USING (auth.uid() = user_id);
```

---

## 2. UI Design — NearPro Integration

### 2a. Dashboard Sidebar
```javascript
{ id: 'plugins', label: 'Plugin Marketplace', requiredTier: 'free', icon: 'puzzle' }
```

### 2b. Route
```javascript
Router.on('#/dashboard/plugins', () => renderDashboardLayout('plugins'));
Router.on('#/dashboard/plugins/:slug', (slug) => renderDashboardLayout('plugin-detail', slug));
```

### 2c. UI Screens

#### View 1: Plugin Marketplace
```
┌─────────────────────────────────────────────────────────────┐
│  🧩 Plugin Marketplace                                      │
│  [All] [Installed] [Enrichment] [Outreach] [Analytics]      │
│  🔍 Search plugins...                                       │
├─────────────────────────────────────────────────────────────┤
│  ⭐ Official NearPro Plugins                                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │  🔍    │ │  📊    │ │  ✉️    │ │  📄    │ │  📞    │  │
│  │ Lead   │ │Website │ │  AI    │ │Proposal│ │  Call  │  │
│  │ Dir.   │ │Auditor │ │Outreach│ │  Gen   │ │Scripts │  │
│  │Installed│ │Installed│ │Installed│ │Installed│ │Installed│  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘  │
├─────────────────────────────────────────────────────────────┤
│  🌍 Community Plugins                                       │
│  ┌──────────────────────────────────────────────┐          │
│  │ 🔗 HubSpot CRM Sync              ⭐ 4.8     │          │
│  │    Push leads directly to HubSpot  |  FREE    │          │
│  │    by @s8n  |  234 installs                   │          │
│  │    [Install]                                  │          │
│  └──────────────────────────────────────────────┘          │
│  ┌──────────────────────────────────────────────┐          │
│  │ 📊 Google Sheets Export           ⭐ 4.5     │          │
│  │    Auto-sync leads to Sheets  |  FREE         │          │
│  │    by @community  |  189 installs             │          │
│  │    [Install]                                  │          │
│  └──────────────────────────────────────────────┘          │
│  ┌──────────────────────────────────────────────┐          │
│  │ 🤖 Slack Notifications            ⭐ 4.6     │          │
│  │    Get deal alerts in Slack  |  FREE          │          │
│  │    by @community  |  156 installs             │          │
│  │    [Install]                                  │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

#### View 2: Plugin Detail Page
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Marketplace                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Banner Image]                                       │  │
│  │  🔗 HubSpot CRM Sync                    [Installed ✅] │  │
│  │  by @s8n  •  v2.1.0  •  234 installs  •  ⭐ 4.8      │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  [Overview] [Tools] [Configuration] [Reviews]               │
│                                                             │
│  Available Tools:                                           │
│  ┌──────────────────────────────────────────────┐          │
│  │ 🔧 push_lead_to_hubspot                      │          │
│  │    Push a NearPro lead to HubSpot contacts    │          │
│  │    Input: lead_id, pipeline_stage             │          │
│  │    [Test Tool →]                              │          │
│  └──────────────────────────────────────────────┘          │
│  ┌──────────────────────────────────────────────┐          │
│  │ 🔧 sync_deal_status                           │          │
│  │    Sync CRM deal status back to NearPro       │          │
│  │    Input: deal_id                             │          │
│  │    [Test Tool →]                              │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  Configuration:                                             │
│  HubSpot API Key: [••••••••••••••]   [Save]                │
│  Default Pipeline: [Sales Pipeline ▼]                       │
└─────────────────────────────────────────────────────────────┘
```

#### View 3: Plugin Toolbar (Floating Command Bar)
A persistent floating bar at the bottom of dashboard that lets users invoke any plugin tool:
```
┌─────────────────────────────────────────────────────────────┐
│  ⌘ [Type a command... or / to see available tools]          │
│  ┌──────────────────────────────────────────────┐          │
│  │ /audit https://example.com                    │  → Runs  │
│  │ /enrich "Dr. Mehta Clinic"                    │  → Runs  │
│  │ /pitch "Fresh Bites" email hinglish           │  → Runs  │
│  │ /hubspot push "Sharma & Sons"                 │  → Runs  │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│              NearPro Frontend (SPA)              │
│    ┌──────────────────────────────────────┐     │
│    │       MCP Client Hub (JS)            │     │
│    │  - Discovers installed plugins       │     │
│    │  - Routes tool calls to servers      │     │
│    │  - Renders plugin UIs dynamically    │     │
│    └─────────────┬────────────────────────┘     │
│                  │                               │
└──────────────────┼───────────────────────────────┘
                   │ HTTP/SSE/Stdio
     ┌─────────────┼─────────────────────────┐
     │             │                          │
     ▼             ▼                          ▼
┌─────────┐  ┌──────────┐  ┌─────────────────────┐
│Official │  │Community │  │  Supabase Edge       │
│MCP      │  │MCP       │  │  Function Proxy      │
│Servers  │  │Servers   │  │  (for stdio MCP)     │
│         │  │          │  │                      │
│- Auditor│  │- HubSpot │  │  Spawns MCP server   │
│- Outreach│ │- Sheets  │  │  process, proxies    │
│- Enrich │  │- Slack   │  │  JSON-RPC over HTTP  │
└─────────┘  └──────────┘  └─────────────────────┘
```

---

## 4. User Walkthrough Flow

1. **Entry**: User clicks "Plugin Marketplace" in sidebar
2. **Browse**: See official + community plugins organized by category
3. **Install**: One-click install → Plugin appears in "Installed" tab
4. **Configure**: Some plugins need API keys → Guided setup modal
5. **Use - UI**: Plugin tools appear in relevant contexts:
   - Enrichment plugins → on lead cards
   - CRM plugins → in pipeline view
   - Analytics plugins → in insights dashboard
6. **Use - Command Bar**: Press `/` anywhere → type tool name → execute
7. **Monitor**: Plugin execution log shows all tool calls, latencies, errors

---

## 5. Animation & Engagement Design

| Element | Animation | Details |
|:---|:---|:---|
| Marketplace cards | 3D tilt on hover | `perspective(1000px) rotateY(5deg)` on mouse move |
| Install button | Morph to checkmark | Button text fades, checkmark draws in with path animation |
| Plugin icons | Subtle float | `translateY` keyframe loop, each icon offset |
| Command bar | Slide-up + focus glow | Keyboard shortcut `/` triggers slide-up animation |
| Tool execution | Live loading pulse | Dot-dot-dot loading with result fade-in |
| Install counter | +1 increment animation | Number bumps up with tiny burst |
| Category tabs | Underline slide | Active indicator slides between tabs |
| Plugin cards grid | Masonry layout | Staggered fade-in as cards load |

---

## 6. Tier Gating

| Tier | Installable Plugins | Executions/Month | Custom Plugins | Command Bar |
|:---|:---|:---|:---|:---|
| Free | 3 (official only) | 10 | ❌ | ❌ |
| Scout | 5 | 100 | ❌ | ✅ |
| Hunter | 15 | 500 | ✅ (3 custom) | ✅ |
| Agency | Unlimited | Unlimited | ✅ (unlimited) | ✅ |

---

## 7. Innovation

- **AI Plugin Builder**: Agency-tier users can describe a plugin in natural language ("I want a plugin that checks if a lead's Google review count increased in the last month") and NearPro's AI generates the MCP server code.
- **Plugin Chaining**: Connect plugins in sequence — e.g., "When Enrichment finds an email → auto-run Outreach → auto-push to HubSpot". Visual pipeline builder.
- **Revenue Share for Plugin Authors**: Community developers earn 80% of paid plugin revenue (NearPro takes 20%). Create an ecosystem incentive.
- **Plugin Sandbox**: All community plugins run in a sandboxed Supabase Edge Function with no access to user's raw credentials — security first.
- **Context-Aware Suggestions**: When viewing a lead card, NearPro suggests relevant plugin tools: "You have 'HubSpot Sync' installed — push this lead?"
