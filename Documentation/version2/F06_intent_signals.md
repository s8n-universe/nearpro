# Feature 6: Intent Signal & Buying Signal Detection

## Overview
Monitor target companies for "buying signals" — job postings (they're growing), funding rounds (they have budget), leadership changes (new decision-makers), tech stack changes (they need migration help), new reviews (business is active). Transform NearPro from "here's a list" to "here are businesses READY TO BUY RIGHT NOW."

---

## 1. Database Schema (Supabase PostgreSQL)

### New Tables

```sql
-- 6a. Signal definitions — what signals to monitor
CREATE TABLE IF NOT EXISTS signal_definitions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL UNIQUE,         -- 'hiring_surge', 'new_funding', 'tech_change'
    display_name        TEXT NOT NULL,                -- 'Hiring Surge'
    description         TEXT,
    signal_type         TEXT NOT NULL,                -- hiring | funding | tech | review | news | expansion
    icon                TEXT DEFAULT '📊',
    weight              INTEGER DEFAULT 50,           -- Contribution to intent score (0-100)
    data_source         TEXT,                         -- 'linkedin_jobs', 'google_news', 'builtwith'
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 6b. Detected signals for specific leads
CREATE TABLE IF NOT EXISTS detected_signals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id     UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    signal_def_id       UUID NOT NULL REFERENCES signal_definitions(id) ON DELETE CASCADE,
    
    -- Signal details
    title               TEXT NOT NULL,                -- "Hiring 'Web Developer' on LinkedIn"
    description         TEXT,                         -- Full detail
    source_url          TEXT,                         -- Link to original source
    source_name         TEXT,                         -- 'LinkedIn Jobs', 'Google News'
    raw_data            JSONB DEFAULT '{}',           -- Raw extracted data
    
    -- Scoring
    signal_strength     TEXT DEFAULT 'medium',        -- low | medium | high | critical
    confidence          INTEGER DEFAULT 70,           -- 0-100
    
    -- State
    status              TEXT DEFAULT 'new',           -- new | acknowledged | acted_on | expired
    detected_at         TIMESTAMPTZ DEFAULT NOW(),
    expires_at          TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    acknowledged_by     UUID REFERENCES profiles(id),
    acknowledged_at     TIMESTAMPTZ
);

-- 6c. Signal monitoring watchlists
CREATE TABLE IF NOT EXISTS signal_watchlists (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,                -- "My Top Prospects"
    description         TEXT,
    
    -- Monitoring config
    check_frequency     TEXT DEFAULT 'daily',         -- hourly | daily | weekly
    signal_types        TEXT[] DEFAULT '{hiring,funding,tech,review,news}',
    notification_method TEXT DEFAULT 'in_app',        -- in_app | email | both
    
    is_active           BOOLEAN DEFAULT TRUE,
    last_checked_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 6d. Leads in watchlists
CREATE TABLE IF NOT EXISTS watchlist_leads (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id        UUID NOT NULL REFERENCES signal_watchlists(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    added_at            TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(watchlist_id, professional_id)
);

-- 6e. Signal notifications
CREATE TABLE IF NOT EXISTS signal_notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    signal_id           UUID NOT NULL REFERENCES detected_signals(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES professionals(id),
    title               TEXT NOT NULL,
    body                TEXT,
    is_read             BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Add intent columns to professionals
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS intent_score INTEGER DEFAULT 0;
-- 0-100 composite score based on detected signals
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS active_signals_count INTEGER DEFAULT 0;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS last_signal_detected_at TIMESTAMPTZ;

-- Add signal monitoring limits to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_signal_checks_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_signal_checks_limit INTEGER DEFAULT 0;
-- Free: 0, Scout: 50, Hunter: 200, Agency: 1000
```

### Pre-seed Signal Definitions
```sql
INSERT INTO signal_definitions (name, display_name, signal_type, icon, weight, data_source) VALUES
('hiring_web_dev', 'Hiring Web Developer', 'hiring', '👨‍💻', 90, 'linkedin_jobs'),
('hiring_marketing', 'Hiring Marketing Role', 'hiring', '📢', 85, 'linkedin_jobs'),
('hiring_any', 'New Job Posting', 'hiring', '💼', 60, 'linkedin_jobs'),
('new_funding', 'Received Funding', 'funding', '💰', 95, 'google_news'),
('expansion', 'Opening New Location', 'expansion', '🏢', 80, 'google_news'),
('tech_stack_change', 'Tech Stack Change', 'tech', '⚡', 75, 'builtwith'),
('negative_reviews_spike', 'Negative Review Spike', 'review', '😤', 70, 'google_maps'),
('review_volume_growth', 'Review Count Growing', 'review', '📈', 50, 'google_maps'),
('leadership_change', 'New Leadership', 'news', '👔', 80, 'google_news'),
('competitor_exit', 'Competitor Closed', 'news', '🚪', 85, 'google_maps')
ON CONFLICT (name) DO NOTHING;
```

### RLS Policies
```sql
ALTER TABLE signal_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read signals" ON signal_definitions FOR SELECT USING (true);
CREATE POLICY "Public read detected signals" ON detected_signals FOR SELECT USING (true);
CREATE POLICY "Users manage own watchlists" ON signal_watchlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage watchlist leads" ON watchlist_leads FOR ALL USING (
    watchlist_id IN (SELECT id FROM signal_watchlists WHERE user_id = auth.uid())
);
CREATE POLICY "Users manage own notifications" ON signal_notifications FOR ALL USING (auth.uid() = user_id);
```

---

## 2. UI Design — NearPro Integration

### 2a. Dashboard Sidebar
```javascript
{ id: 'signals', label: '🔥 Intent Signals', requiredTier: 'scout', icon: 'trending-up' }
```

### 2b. Route
```javascript
Router.on('#/dashboard/signals', () => renderDashboardLayout('signals'));
```

### 2c. UI Screens

#### View 1: Signal Feed Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  🔥 Intent Signals                    [+ New Watchlist]     │
├─────────────────────────────────────────────────────────────┤
│  Signal Feed (Live, most recent first)                      │
│                                                             │
│  🔴 HIGH INTENT — 2 hours ago                               │
│  ┌──────────────────────────────────────────────┐          │
│  │ 💰 Mehta Clinic received ₹50L seed funding   │          │
│  │    Source: VCCircle News  |  Confidence: 92%  │          │
│  │    Intent Score: 78 → 94 (+16)  ████████████░ │          │
│  │    [View Lead] [📧 Send Pitch] [✓ Acknowledge] │         │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  🟡 MEDIUM — 5 hours ago                                    │
│  ┌──────────────────────────────────────────────┐          │
│  │ 👨‍💻 Sharma Law Firm hiring "Web Developer"    │          │
│  │    Source: LinkedIn Jobs  |  Confidence: 85%  │          │
│  │    Intent Score: 45 → 72 (+27)  █████████░░░░ │          │
│  │    [View Lead] [📧 Send Pitch] [✓ Acknowledge] │         │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  🟢 LOW — 1 day ago                                         │
│  ┌──────────────────────────────────────────────┐          │
│  │ 📈 Fresh Bites: 15 new reviews this week      │          │
│  │    Source: Google Maps  |  Confidence: 90%    │          │
│  │    Intent Score: 30 → 42 (+12)  █████░░░░░░░░ │          │
│  │    [View Lead] [📧 Send Pitch] [✓ Acknowledge] │         │
│  └──────────────────────────────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Watchlists                                                 │
│  ┌─────────────────────────────────────┐                   │
│  │ "Top 20 Restaurant Leads"  20 leads │                   │
│  │  Last checked: 4h ago  |  3 signals │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

#### View 2: Intent Score on Lead Cards (Inline Badge)
On existing `ProfessionalCard.js`, add intent indicator:
```
┌── Lead Card ───────────────────────────────┐
│  Dr. Mehta Clinic  ⭐ 4.5  🔥 94 INTENT    │  ← NEW badge
│  Healthcare • Andheri West                  │
│  📱 +91 98765 43210                         │
│  🔔 2 active signals                        │  ← NEW indicator
│  [📧 Outreach] [📊 Audit] [🤖 Research]     │
└─────────────────────────────────────────────┘
```

---

## 3. User Walkthrough Flow

1. **Entry**: User clicks "🔥 Intent Signals" in sidebar
2. **First Time**: Onboarding: "Never miss a hot lead again"
   - Create first watchlist → Add leads from CRM/Directory
3. **Signal Feed**: Real-time feed of detected signals, sorted by recency
4. **Intent Score**: Each lead gets a 0-100 intent score visible on cards
5. **Act**: Click "Send Pitch" directly from signal → AI outreach pre-loaded with signal context
6. **Watchlist**: Create watchlists to monitor specific leads
7. **Notifications**: Get in-app + email alerts for high-intent signals

---

## 4. Animation & Engagement Design

| Element | Animation | Details |
|:---|:---|:---|
| Signal feed entries | Slide-in from right | New signals slide in with gold glow border |
| Intent score badge | Pulsing fire glow | 🔥 icon pulses when score > 80 |
| Score change | Counter increment | Old score → new score with color flash |
| High intent alert | Banner drop-down | Gold gradient banner drops from top of dashboard |
| Signal type icons | Bounce on appear | 💰👨‍💻📈 icons bounce-in when signal loads |
| Watchlist cards | Subtle shimmer | Glassmorphism cards with ambient shimmer |
| Notification bell | Badge counter bump | Number increments with spring animation |
| Timeline connector | Animated dashed line | Vertical timeline line draws downward |

---

## 5. Tier Gating

| Tier | Watchlists | Leads/Watchlist | Signal Types | Notifications |
|:---|:---|:---|:---|:---|
| Free | 0 | — | — | ❌ |
| Scout | 2 | 25 | Reviews only | In-app |
| Hunter | 5 | 50 | All types | In-app + Email |
| Agency | Unlimited | 200 | All types + Custom | In-app + Email + Webhook |

---

## 6. Innovation

- **Signal-Triggered Sequences**: When a high-intent signal is detected, automatically enroll the lead into a relevant email sequence — zero human intervention from signal to outreach.
- **Intent Score Sort**: Add "Sort by Intent Score" to the directory view — surface the hottest leads first.
- **Competitor Closure Alerts**: When a competitor closes or gets bad reviews, alert users watching leads in the same area/category — "Window of opportunity!"
- **Review Velocity Tracking**: Track not just review count but velocity — a business going from 2 reviews/week to 10 reviews/week signals rapid growth.
