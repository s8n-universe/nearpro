# Feature 10: Self-Hosted LLM Support (Ollama + LiteLLM Integration)

## Overview
Allow NearPro users to connect their own local LLM (via Ollama) or any AI provider (via LiteLLM proxy) instead of relying solely on Gemini API. All AI features — outreach, scripts, proposals, research, voice — work with ANY model. This eliminates API cost concerns for Indian agencies and enables offline operation.

---

## 1. Database Schema (Supabase PostgreSQL)

### New Tables

```sql
-- 10a. AI provider configurations
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
    -- Which NearPro features should use this model
    
    -- Priority
    priority            INTEGER DEFAULT 1,           -- Lower = preferred
    is_default          BOOLEAN DEFAULT FALSE,
    is_active           BOOLEAN DEFAULT TRUE,
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- 10b. AI usage tracking
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

-- 10c. Model performance benchmarks (per user, per model)
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

-- Add AI preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_ai_provider UUID REFERENCES ai_provider_configs(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_cost_savings_total NUMERIC(12,2) DEFAULT 0;
-- Running total of estimated savings from using local models
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_ai_tokens_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_ai_tokens_limit INTEGER DEFAULT 0;
-- Free: 10k, Scout: 100k, Hunter: 500k, Agency: Unlimited (with local)
```

### RLS Policies
```sql
ALTER TABLE ai_provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own configs" ON ai_provider_configs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own usage" ON ai_usage_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own benchmarks" ON model_benchmarks FOR ALL USING (auth.uid() = user_id);
```

---

## 2. UI Design — NearPro Integration

### 2a. Dashboard Sidebar (Under Settings)
```javascript
{ id: 'settings', label: 'Settings', requiredTier: 'free', icon: 'settings' }
// AI Provider Config is a sub-tab within Settings
```

### 2b. Route
```javascript
Router.on('#/dashboard/settings/ai', () => renderDashboardLayout('settings-ai'));
```

### 2c. UI Screens

#### View 1: AI Settings Panel (within Settings page)
```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Settings > 🧠 AI Configuration                         │
├─────────────────────────────────────────────────────────────┤
│  Active Model: 🟢 Gemini 2.5 Flash (Cloud)                  │
│  This Month: 42,000 tokens used  |  Est. Cost: ₹12         │
│  💰 Savings from local models: ₹247 this month              │
├─────────────────────────────────────────────────────────────┤
│  Connected AI Providers                   [+ Add Provider]  │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │ 🟢 Gemini 2.5 Flash  (Default)                   │      │
│  │    Provider: Google AI  |  Cloud                  │      │
│  │    Latency: ~320ms  |  Quality: ⭐⭐⭐⭐⭐          │      │
│  │    Used for: All features                         │      │
│  │    [Configure] [Set Default] [Benchmark]          │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │ 🟢 Ollama — Llama 3.1 8B (Local)                 │      │
│  │    URL: http://localhost:11434                    │      │
│  │    Latency: ~180ms  |  Quality: ⭐⭐⭐⭐            │      │
│  │    Used for: Outreach, Scripts                    │      │
│  │    💰 Cost: ₹0 (local, free forever)              │      │
│  │    [Configure] [Set Default] [Benchmark]          │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │ 🔴 DeepSeek v3 (Cloud, Offline)                   │      │
│  │    Provider: DeepSeek API                         │      │
│  │    Status: Connection failed                      │      │
│  │    [Retry Connection] [Remove]                    │      │
│  └──────────────────────────────────────────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  Feature-Level Model Assignment                             │
│  ┌────────────────────────────────────────────────┐        │
│  │ AI Outreach:       [Gemini 2.5 Flash  ▼]      │        │
│  │ Call Scripts:      [Ollama Llama 3.1   ▼]      │        │
│  │ PDF Proposals:     [Gemini 2.5 Flash  ▼]      │        │
│  │ AI Research:       [Gemini 2.5 Flash  ▼]      │        │
│  │ Deal Intelligence: [Ollama Llama 3.1   ▼]      │        │
│  │ Voice Agent:       [Gemini 2.5 Flash  ▼]      │        │
│  └────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

#### View 2: Add Provider Modal
```
┌─────────────────────────────────────────────────────────────┐
│  Add AI Provider                                     [×]    │
├─────────────────────────────────────────────────────────────┤
│  Provider Type:                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ 🦙     │ │ 🤖     │ │ ✨     │ │ 🧠     │ │ ⚡     │  │
│  │Ollama  │ │OpenAI  │ │Gemini  │ │Claude  │ │Custom  │  │
│  │(Local) │ │(Cloud) │ │(Cloud) │ │(Cloud) │ │(Any)   │  │
│  │  ●     │ │  ○     │ │  ○     │ │  ○     │ │  ○     │  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘  │
│                                                             │
│  ── Ollama Setup ──                                         │
│  Server URL:  [http://localhost:11434    ]                  │
│  [🔍 Detect Available Models]                               │
│                                                             │
│  Available Models:                                          │
│  ┌──────────────────────────────────────────────┐          │
│  │ ☑ llama3.1:8b    (4.7 GB) — General Purpose  │          │
│  │ ☐ mistral:7b     (4.1 GB) — Fast, Efficient  │          │
│  │ ☐ codellama:13b  (7.4 GB) — Code-focused     │          │
│  │ ☐ gemma2:9b      (5.4 GB) — Balanced          │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  Name: [My Local Llama                    ]                │
│                                                             │
│  [Test Connection]    [Add Provider →]                      │
└─────────────────────────────────────────────────────────────┘
```

#### View 3: Model Benchmark Comparison
```
┌─────────────────────────────────────────────────────────────┐
│  📊 Model Benchmark Results                                 │
├─────────────────────────────────────────────────────────────┤
│  Test: Generate cold outreach for 5 sample leads            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Gemini 2.5 Flash   Ollama Llama 3.1     │  │
│  │  Speed        320ms ████████    180ms ████████████   │  │
│  │  Quality      9.2/10 ●●●●●●●●●○ 7.8/10 ●●●●●●●●○○  │  │
│  │  Hindi        ⭐⭐⭐⭐⭐             ⭐⭐⭐              │  │
│  │  Hinglish     ⭐⭐⭐⭐⭐             ⭐⭐⭐⭐             │  │
│  │  Cost/1K tok  ₹0.05              ₹0.00 (FREE)       │  │
│  │                                                      │  │
│  │  Recommendation:                                     │  │
│  │  ✅ Use Gemini for: Research, Proposals (need Hindi)  │  │
│  │  ✅ Use Ollama for: Outreach, Scripts (save ₹200/mo)  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Architecture — Model Router

```
User triggers AI feature (e.g., "Generate Pitch")
           │
           ▼
┌─── Model Router (Frontend) ───────────────────┐
│  1. Check feature → model assignment           │
│     (e.g., outreach → Ollama Llama 3.1)       │
│  2. Check provider health status               │
│  3. If assigned provider is down:              │
│     → Fallback to default provider             │
│  4. Route request to provider                  │
└────────────────┬───────────────────────────────┘
                 │
     ┌───────────┼───────────┐
     │           │           │
     ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌──────────┐
│ Ollama  │ │ Gemini  │ │ OpenAI   │
│ Local   │ │ Cloud   │ │ Cloud    │
│ :11434  │ │ API     │ │ API      │
└─────────┘ └─────────┘ └──────────┘
```

### Implementation in Existing Edge Functions

```javascript
// In generate-ai-outreach Edge Function:
// Replace hardcoded Gemini call with dynamic model routing

const providerConfig = await getProviderForFeature(userId, 'outreach');

if (providerConfig.provider_type === 'ollama') {
    // Call Ollama API directly from Edge Function
    const response = await fetch(`${providerConfig.base_url}/api/chat`, {
        method: 'POST',
        body: JSON.stringify({ model: providerConfig.model_id, messages, stream: false })
    });
} else if (providerConfig.provider_type === 'gemini') {
    // Existing Gemini call
} else {
    // LiteLLM proxy - unified interface for any provider
    const response = await fetch(`${providerConfig.base_url}/chat/completions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${decryptedKey}` },
        body: JSON.stringify({ model: providerConfig.model_id, messages })
    });
}
```

---

## 4. User Walkthrough Flow

1. **Entry**: Settings → AI Configuration
2. **Default**: Gemini 2.5 Flash pre-configured (existing behavior)
3. **Add Ollama**: User installs Ollama locally → enters URL → system detects models
4. **Benchmark**: Run benchmark to compare quality/speed across models
5. **Assign**: Choose which model to use for each NearPro feature
6. **Savings Dashboard**: See running total of ₹ saved by using local models
7. **Fallback**: If local model is down, automatically falls back to cloud

---

## 5. Animation & Engagement Design

| Element | Animation | Details |
|:---|:---|:---|
| Provider cards | Status pulse | 🟢 green pulse for healthy, 🔴 red for offline |
| Model detection | Scanning effect | "Detecting models..." with rotating radar animation |
| Benchmark comparison | Animated bar race | Bars grow side-by-side for each metric |
| Cost savings counter | Odometer roll-up | ₹ savings counter increments in real-time |
| Test connection | Ping animation | Signal waves emanate from server icon |
| Model assignment dropdown | Smooth expand | Dropdown unfolds with model icons |
| Quality stars | Sequential fill | Stars fill left-to-right with gold gradient |
| Fallback indicator | Warning flash | Amber flash when fallback activates |

---

## 6. Tier Gating

| Tier | Cloud Tokens/Month | Local Models | Providers | Model Assignment |
|:---|:---|:---|:---|:---|
| Free | 10,000 (Gemini only) | ❌ | 1 | ❌ (Gemini fixed) |
| Scout | 100,000 | ✅ (1 model) | 2 | ❌ |
| Hunter | 500,000 | ✅ (unlimited) | 5 | ✅ |
| Agency | Unlimited | ✅ (unlimited) | Unlimited | ✅ + Custom routing |

---

## 7. Innovation

- **Cost Savings Leaderboard**: Show users how much they've saved by using local models vs. cloud APIs — gamifies cost optimization.
- **Auto-Benchmark on Connect**: When a new model is connected, NearPro auto-runs a quick benchmark and recommends optimal feature assignments.
- **Model Marketplace Preview**: Show upcoming models in Ollama registry with one-click install: "Try Llama 3.2 — 15% better Hinglish performance!"
- **Offline Mode**: When Ollama is configured, core AI features (outreach, scripts) work without internet — crucial for Indian agencies with inconsistent connectivity.
- **Quality Feedback Loop**: After each AI generation, user rates output (👍/👎) → builds per-model quality scores → auto-optimizes routing over time.
- **LiteLLM Proxy**: For advanced users, support LiteLLM as a unified proxy — one config to route to 100+ LLM providers (DeepSeek, Groq, Together, etc.).
