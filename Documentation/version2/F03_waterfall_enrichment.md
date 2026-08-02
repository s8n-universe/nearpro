# Feature 3: Waterfall Data Enrichment Engine

## Overview
Replace static scraped-only data with a multi-provider enrichment pipeline. When a lead is missing an email, phone, or other data point, NearPro chains through multiple free/low-cost providers sequentially until the data is found — exactly like Clay.com's waterfall architecture, but built natively into NearPro.

---

## 1. Database Schema (Supabase PostgreSQL)

### New Tables

```sql
-- 3a. Enrichment provider configuration
CREATE TABLE IF NOT EXISTS enrichment_providers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL UNIQUE,        -- 'hunter', 'apollo', 'clearbit', 'google_maps'
    display_name        TEXT NOT NULL,               -- 'Hunter.io'
    provider_type       TEXT NOT NULL,               -- email | phone | company | social | tech_stack
    api_base_url        TEXT,
    priority            INTEGER DEFAULT 1,           -- Lower = tried first
    cost_per_lookup     NUMERIC(8,4) DEFAULT 0,     -- In INR
    monthly_free_quota  INTEGER DEFAULT 0,           -- Free tier allowance
    is_active           BOOLEAN DEFAULT TRUE,
    config_schema       JSONB DEFAULT '{}',          -- Expected config fields for setup
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3b. User-specific provider API keys
CREATE TABLE IF NOT EXISTS user_enrichment_keys (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider_id         UUID NOT NULL REFERENCES enrichment_providers(id) ON DELETE CASCADE,
    encrypted_api_key   TEXT NOT NULL,               -- AES-256 encrypted
    monthly_used        INTEGER DEFAULT 0,
    monthly_limit       INTEGER,                     -- User's plan limit
    is_active           BOOLEAN DEFAULT TRUE,
    last_used_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider_id)
);

-- 3c. Enrichment jobs
CREATE TABLE IF NOT EXISTS enrichment_jobs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    job_type            TEXT DEFAULT 'single',       -- single | batch | auto
    status              TEXT DEFAULT 'pending',      -- pending | running | completed | failed
    total_leads         INTEGER DEFAULT 0,
    enriched_count      INTEGER DEFAULT 0,
    failed_count        INTEGER DEFAULT 0,
    skipped_count       INTEGER DEFAULT 0,
    credits_consumed    INTEGER DEFAULT 0,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3d. Per-lead enrichment results
CREATE TABLE IF NOT EXISTS enrichment_results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              UUID REFERENCES enrichment_jobs(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Data found
    enriched_email      TEXT,
    enriched_phone      TEXT,
    enriched_linkedin   TEXT,
    enriched_facebook   TEXT,
    enriched_instagram  TEXT,
    enriched_twitter    TEXT,
    company_size        TEXT,                        -- '1-10', '11-50', etc.
    annual_revenue_est  TEXT,
    tech_stack          JSONB DEFAULT '[]',          -- ['wordpress', 'shopify', 'react']
    founded_year        INTEGER,
    employee_count      INTEGER,
    industry_tags       JSONB DEFAULT '[]',
    
    -- Verification
    email_verified      BOOLEAN,
    email_verify_method TEXT,                        -- smtp_check | api_verified | guessed
    phone_verified      BOOLEAN,
    confidence_score    INTEGER DEFAULT 0,           -- 0-100
    
    -- Provider trail (which provider found what)
    provider_trail      JSONB DEFAULT '[]',          -- [{"provider":"hunter","field":"email","found":true,"ms":320}]
    
    -- State
    status              TEXT DEFAULT 'pending',      -- pending | enriched | partial | failed | no_data
    enriched_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3e. Enrichment credit ledger
CREATE TABLE IF NOT EXISTS enrichment_credit_ledger (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount              INTEGER NOT NULL,             -- Positive = purchase, Negative = usage
    transaction_type    TEXT NOT NULL,                -- PURCHASE | USAGE | REFUND | MONTHLY_RESET
    reference_job_id    UUID REFERENCES enrichment_jobs(id),
    balance_after       INTEGER NOT NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### Modify Existing professionals Table
```sql
-- Add enrichment tracking columns to professionals
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'raw';
-- raw | enriched | partial | failed
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS enriched_email TEXT;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS enriched_phone TEXT;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS tech_stack JSONB DEFAULT '[]';
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS social_profiles JSONB DEFAULT '{}';
-- {"linkedin": "...", "facebook": "...", "instagram": "..."}
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS enrichment_confidence INTEGER DEFAULT 0;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS last_enriched_at TIMESTAMPTZ;

-- Modify profiles for enrichment credits
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enrichment_credits INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_enrichments_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_enrichments_limit INTEGER DEFAULT 0;
-- Free: 0, Scout: 50, Hunter: 200, Agency: 1000
```

### RLS Policies
```sql
ALTER TABLE enrichment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_enrichment_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_credit_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read providers" ON enrichment_providers FOR SELECT USING (true);
CREATE POLICY "Users manage own keys" ON user_enrichment_keys FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own jobs" ON enrichment_jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own results" ON enrichment_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own ledger" ON enrichment_credit_ledger FOR SELECT USING (auth.uid() = user_id);
```

### RPC Functions
```sql
-- Get enrichment stats for dashboard
CREATE OR REPLACE FUNCTION get_enrichment_stats(p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'credits_remaining', (SELECT COALESCE(enrichment_credits, 0) FROM profiles WHERE id = p_user_id),
            'total_enriched', (SELECT COUNT(*) FROM enrichment_results WHERE user_id = p_user_id AND status = 'enriched'),
            'emails_found', (SELECT COUNT(*) FROM enrichment_results WHERE user_id = p_user_id AND enriched_email IS NOT NULL),
            'phones_found', (SELECT COUNT(*) FROM enrichment_results WHERE user_id = p_user_id AND enriched_phone IS NOT NULL),
            'avg_confidence', (SELECT COALESCE(AVG(confidence_score), 0) FROM enrichment_results WHERE user_id = p_user_id AND status = 'enriched'),
            'active_jobs', (SELECT COUNT(*) FROM enrichment_jobs WHERE user_id = p_user_id AND status = 'running')
        )
    );
END; $$;
```

---

## 2. UI Design — NearPro Integration

### 2a. Dashboard Sidebar
```javascript
{ id: 'enrichment', label: 'Data Enrichment', requiredTier: 'scout', icon: 'database' }
```

### 2b. Route
```javascript
Router.on('#/dashboard/enrichment', () => renderDashboardLayout('enrichment'));
```

### 2c. UI Screens

#### View 1: Enrichment Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  🔬 Data Enrichment Engine                [Enrich Leads →]  │
├─────────────────────────────────────────────────────────────┤
│  Credits: 🪙 147 remaining / 200 monthly                    │
│  ████████████████████████████████████░░░░  73.5% used       │
├─────────────────────────────────────────────────────────────┤
│  Quick Stats (animated counters)                            │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ 📧 312 │ │ 📱 189 │ │ 💼 94  │ │ 🎯 87% │              │
│  │ Emails │ │ Phones │ │ Social │ │ Avg    │              │
│  │ Found  │ │ Found  │ │ Found  │ │ Conf.  │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
├─────────────────────────────────────────────────────────────┤
│  Provider Waterfall Configuration                           │
│  ┌──────────────────────────────────────────────┐          │
│  │  1. 🗺️ Google Maps (built-in)     ✅ Active  │ ═══╗    │
│  │  2. 🔍 Hunter.io (50 free/mo)     ✅ Active  │ ═══╬═╗  │
│  │  3. 🚀 Apollo.io (free tier)      ⬚ Setup   │ ═══╝ ║  │
│  │  4. 📧 SMTP Verify                ✅ Active  │ ═════╝  │
│  │  [+ Add Provider]  [Reorder ↕]               │          │
│  └──────────────────────────────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Recent Enrichment Jobs                                     │
│  ┌──────────────────────────────────────────────┐          │
│  │ 🟢 Batch #47  |  32 leads  |  28 enriched   │          │
│  │    4 partial  |  0 failed  |  87% success    │          │
│  │    Providers: Maps→Hunter→SMTP  |  12 min ago│          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

#### View 2: Enrich Leads Panel
```
┌─────────────────────────────────────────────────────────────┐
│  Enrich Selected Leads                              [×]     │
├─────────────────────────────────────────────────────────────┤
│  Source: [CRM Pipeline ▼] [Smart List ▼] [All Directory ▼] │
│  Showing leads missing data:                                │
│                                                             │
│  ☑ Dr. Mehta Clinic     📧 ✗  📱 ✓  🌐 ✗   Confidence: — │
│  ☑ Sharma & Sons        📧 ✗  📱 ✗  🌐 ✓   Confidence: — │
│  ☑ Fresh Bites          📧 ✗  📱 ✓  🌐 ✓   Confidence: — │
│  ☐ Perfect Cuts (skip)  📧 ✓  📱 ✓  🌐 ✓   Already 100%  │
│                                                             │
│  Enrichment Fields:                                         │
│  ☑ Email  ☑ Phone  ☐ Social Links  ☐ Tech Stack           │
│                                                             │
│  Estimated Cost: 3 credits (3 leads × 1 credit/lead)       │
│  Balance After: 144 credits                                 │
│                                                             │
│  [Cancel]        [🔬 Enrich 3 Leads →]                      │
└─────────────────────────────────────────────────────────────┘
```

#### View 3: Enrichment Results Live Feed
```
┌─────────────────────────────────────────────────────────────┐
│  🔬 Enriching Batch #48 — LIVE                              │
├─────────────────────────────────────────────────────────────┤
│  Progress: ██████████████████░░░░  3 / 4 leads done        │
│                                                             │
│  Lead 1: Dr. Mehta Clinic                                   │
│  ├─ 🗺️ Google Maps ... phone found ✅ (120ms)               │
│  ├─ 🔍 Hunter.io ... email found ✅ (340ms)                  │
│  │     → drmehta@mehtaclinic.in (verified ✅, conf: 94%)    │
│  └─ Result: 📧 ✅ 📱 ✅ 🌐 ✗  Confidence: 94%               │
│                                                             │
│  Lead 2: Sharma & Sons                                      │
│  ├─ 🗺️ Google Maps ... no email ❌                           │
│  ├─ 🔍 Hunter.io ... no result ❌                            │
│  ├─ 🚀 Apollo ... email found ✅ (520ms)                     │
│  │     → contact@sharmasonslaw.com (unverified ⚠️, conf: 62%)│
│  ├─ 📧 SMTP Verify ... valid ✅                              │
│  └─ Result: 📧 ✅ 📱 ✗ 🌐 ✓  Confidence: 78%               │
│                                                             │
│  Lead 3: Fresh Bites                                        │
│  ├─ 🔍 Hunter.io ... searching...  ⏳                        │
│  └─ (in progress)                                           │
│                                                             │
│  Lead 4: Queued...                                          │
└─────────────────────────────────────────────────────────────┘
```

#### View 4: Inline Enrichment on Lead Card
On the existing `ProfessionalCard.js` and `ProfessionalModal.js`, add an enrichment button:
```
┌─ Lead Card (existing) ──────────────────────┐
│  Dr. Mehta Clinic  ⭐ 4.5 (120 reviews)     │
│  Healthcare • Andheri West                   │
│  📱 +91 98765 43210   📧 —                   │
│  🌐 —                                        │
│  [🔬 Enrich] [📧 Outreach] [📊 Audit]        │  ← NEW
└──────────────────────────────────────────────┘
```

---

## 3. User Walkthrough Flow

1. **Discovery**: User sees "🔬 Enrich" button on any lead card missing data
2. **One-Click Enrich**: Click triggers single-lead waterfall enrichment
   - Real-time status: Provider 1 → Provider 2 → Verify → Done
   - Results appear on the card with confidence score
3. **Batch Enrich**: From CRM or List view, select multiple leads → "Enrich Selected"
4. **Setup Providers**: First-time users guided to add API keys
   - Built-in Google Maps data = always free
   - Hunter.io = 50 free/month → link explains how to get API key
   - Apollo = generous free tier → guided setup
5. **Results**: Enriched data automatically updates lead cards + CRM
6. **Auto-Enrich**: Agency users can enable "Auto-enrich on save to CRM"

---

## 4. Waterfall Logic (Core Algorithm)

```
Input: professional_id, fields_needed = [email, phone]

for each field in fields_needed:
    for each provider in user's active providers (sorted by priority):
        if provider.monthly_used < provider.monthly_limit:
            result = call_provider_api(provider, professional)
            log_to_provider_trail(provider, field, result, latency_ms)
            
            if result.found and result.confidence >= 60:
                save_enriched_field(professional_id, field, result.value)
                if field == 'email':
                    smtp_verify(result.value)  // Always verify emails
                BREAK  // Stop waterfall for this field
            else:
                CONTINUE to next provider
        else:
            SKIP (quota exhausted)

calculate_overall_confidence()
update_professionals_table()
deduct_credits()
```

---

## 5. Animation & Engagement Design

| Element | Animation | Details |
|:---|:---|:---|
| Waterfall diagram | Animated flow lines | SVG pipes that light up gold as data flows through |
| Provider chain | Sequential activation | Each provider card glows as it's being queried |
| Live enrichment feed | Typewriter effect | Results appear character-by-character like a live terminal |
| Confidence meter | Animated arc fill | Circular progress from 0% to final confidence |
| Enrich button | Shimmer on hover | Rainbow shimmer effect suggesting hidden data |
| Credit counter | Odometer roll-down | Numbers roll like a slot machine when credits change |
| Batch progress | Particle trail | Tiny data particles flow from provider icons to lead cards |
| Success state | Data explosion | Brief particle burst when field is found |

---

## 6. Tier Gating

| Tier | Monthly Credits | Providers | Auto-Enrich | Batch Size |
|:---|:---|:---|:---|:---|
| Free | 5 (trial) | 1 (Google Maps only) | ❌ | 1 |
| Scout | 50 | 2 | ❌ | 10 |
| Hunter | 200 | 4 | ✅ | 50 |
| Agency | 1000 | Unlimited | ✅ | 200 |

---

## 7. Innovation

- **Smart Priority**: System auto-reorders providers based on historical success rate per category. If Hunter.io finds 80% of healthcare emails but only 30% of restaurants, prioritize it higher for healthcare leads.
- **Community Enrichment**: When one user enriches a lead and data is verified, cache it for other users (with privacy controls). Builds a collective intelligence layer.
- **Tech Stack Detection**: For leads with websites, automatically detect their tech stack (WordPress, Shopify, React, etc.) using Wappalyzer-like analysis — feeds directly into outreach personalization.
- **Enrichment Score Badge**: Each lead gets a visible "Enrichment Level" badge (Bronze/Silver/Gold/Platinum) based on how complete their data is — gamifies the enrichment process.
