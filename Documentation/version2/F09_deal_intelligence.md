# Feature 9: Deal Intelligence Dashboard

## Overview
Replace the basic Kanban CRM with an AI-powered deal intelligence layer that predicts close probability, suggests optimal next actions, detects deal health risks, and provides revenue forecasting. This is NearPro's version of what Gong, Clari, and HubSpot charge ₹50k+/year for — built for Indian SMBs at ₹999/month.

---

## 1. Database Schema (Supabase PostgreSQL)

### New Tables

```sql
-- 9a. Deal intelligence snapshots (computed periodically)
CREATE TABLE IF NOT EXISTS deal_intelligence (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saved_lead_id       UUID NOT NULL REFERENCES saved_leads(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    
    -- AI Predictions
    close_probability   INTEGER DEFAULT 0,           -- 0-100%
    predicted_close_date TIMESTAMPTZ,
    predicted_deal_value NUMERIC(12,2),
    risk_level          TEXT DEFAULT 'unknown',       -- low | medium | high | critical
    risk_factors        JSONB DEFAULT '[]',           -- ["No activity in 7 days", "Competitor mentioned"]
    
    -- Engagement Scoring
    engagement_score    INTEGER DEFAULT 0,            -- 0-100 composite
    email_opens         INTEGER DEFAULT 0,
    email_replies       INTEGER DEFAULT 0,
    calls_made          INTEGER DEFAULT 0,
    calls_answered      INTEGER DEFAULT 0,
    proposals_sent      INTEGER DEFAULT 0,
    proposals_viewed    INTEGER DEFAULT 0,
    last_interaction    TIMESTAMPTZ,
    days_since_contact  INTEGER DEFAULT 0,
    
    -- AI Recommendations
    next_best_action    TEXT,                         -- "Call today — opened proposal 3 times"
    action_urgency      TEXT DEFAULT 'normal',       -- low | normal | high | critical
    action_channel      TEXT,                        -- email | call | whatsapp | meeting
    
    -- Health Trend
    health_trend        TEXT DEFAULT 'stable',       -- improving | stable | declining | stalled
    score_history       JSONB DEFAULT '[]',          -- [{date, score}] last 30 days
    
    -- Calculated
    calculated_at       TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(saved_lead_id)
);

-- 9b. Revenue pipeline summary (aggregated per user)
CREATE TABLE IF NOT EXISTS pipeline_summary (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    period              TEXT NOT NULL,                -- '2026-08'
    
    -- Pipeline Metrics
    total_pipeline_value NUMERIC(12,2) DEFAULT 0,
    weighted_pipeline    NUMERIC(12,2) DEFAULT 0,     -- value × probability
    deals_won_count     INTEGER DEFAULT 0,
    deals_won_value     NUMERIC(12,2) DEFAULT 0,
    deals_lost_count    INTEGER DEFAULT 0,
    deals_lost_value    NUMERIC(12,2) DEFAULT 0,
    avg_deal_size       NUMERIC(12,2) DEFAULT 0,
    avg_cycle_days      INTEGER DEFAULT 0,
    win_rate            NUMERIC(5,2) DEFAULT 0,
    
    -- Velocity
    pipeline_velocity   NUMERIC(12,2) DEFAULT 0,     -- (deals × win_rate × avg_value) / avg_cycle
    
    -- AI Forecast
    forecast_revenue    NUMERIC(12,2) DEFAULT 0,
    forecast_confidence INTEGER DEFAULT 0,
    
    calculated_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period)
);

-- 9c. Activity timeline (unified activity log per deal)
CREATE TABLE IF NOT EXISTS deal_activity_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saved_lead_id       UUID NOT NULL REFERENCES saved_leads(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    activity_type       TEXT NOT NULL,                -- email_sent | email_opened | email_replied | call_made | call_answered | proposal_sent | proposal_viewed | note_added | stage_changed | meeting_scheduled
    title               TEXT NOT NULL,
    description         TEXT,
    metadata            JSONB DEFAULT '{}',
    source              TEXT DEFAULT 'manual',       -- manual | auto | sequence | voice_agent
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Extend saved_leads for deal tracking
ALTER TABLE saved_leads ADD COLUMN IF NOT EXISTS deal_value NUMERIC(12,2);
ALTER TABLE saved_leads ADD COLUMN IF NOT EXISTS deal_currency TEXT DEFAULT 'INR';
ALTER TABLE saved_leads ADD COLUMN IF NOT EXISTS expected_close_date TIMESTAMPTZ;
ALTER TABLE saved_leads ADD COLUMN IF NOT EXISTS lost_reason TEXT;
ALTER TABLE saved_leads ADD COLUMN IF NOT EXISTS won_at TIMESTAMPTZ;
ALTER TABLE saved_leads ADD COLUMN IF NOT EXISTS lost_at TIMESTAMPTZ;
ALTER TABLE saved_leads ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;
ALTER TABLE saved_leads ADD COLUMN IF NOT EXISTS activity_count INTEGER DEFAULT 0;

-- Add pipeline preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_deal_value NUMERIC(12,2) DEFAULT 15000;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pipeline_stages JSONB DEFAULT '["new","contacted","interested","proposal_sent","negotiation","converted","lost"]';
```

### RLS Policies
```sql
ALTER TABLE deal_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own intelligence" ON deal_intelligence FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own pipeline" ON pipeline_summary FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own activity" ON deal_activity_log FOR ALL USING (auth.uid() = user_id);
```

### RPC Functions
```sql
-- Enhanced CRM pipeline with intelligence overlay
CREATE OR REPLACE FUNCTION get_intelligent_pipeline(p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'pipeline', (
                SELECT json_agg(json_build_object(
                    'status', sl.status,
                    'count', COUNT(*),
                    'total_value', SUM(COALESCE(sl.deal_value, 0)),
                    'avg_probability', AVG(COALESCE(di.close_probability, 0)),
                    'at_risk_count', COUNT(*) FILTER (WHERE di.risk_level IN ('high', 'critical'))
                ))
                FROM saved_leads sl
                LEFT JOIN deal_intelligence di ON di.saved_lead_id = sl.id
                WHERE sl.user_id = p_user_id
                GROUP BY sl.status
            ),
            'urgent_actions', (
                SELECT json_agg(json_build_object(
                    'lead_name', p.name,
                    'action', di.next_best_action,
                    'urgency', di.action_urgency,
                    'probability', di.close_probability
                ) ORDER BY 
                    CASE di.action_urgency 
                        WHEN 'critical' THEN 1 WHEN 'high' THEN 2 
                        WHEN 'normal' THEN 3 ELSE 4 END
                )
                FROM deal_intelligence di
                JOIN saved_leads sl ON sl.id = di.saved_lead_id
                JOIN professionals p ON p.id = sl.professional_id
                WHERE di.user_id = p_user_id AND di.next_best_action IS NOT NULL
                LIMIT 5
            ),
            'revenue_at_risk', (
                SELECT COALESCE(SUM(sl.deal_value), 0)
                FROM saved_leads sl
                JOIN deal_intelligence di ON di.saved_lead_id = sl.id
                WHERE sl.user_id = p_user_id AND di.risk_level IN ('high', 'critical')
            )
        )
    );
END; $$;
```

---

## 2. UI Design — NearPro Integration

### 2a. Enhances Existing CRM Tab
Replaces/upgrades the existing `#/dashboard/crm` view.

### 2b. UI Screens

#### View 1: Intelligent Pipeline Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  🤖 360° AI Deal Hub                    [Period: Aug 2026]  │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐│
│  │ Pipeline   │ │ Weighted   │ │ Win Rate   │ │ At Risk  ││
│  │ ₹4.2L     │ │ ₹2.1L     │ │ 32%       │ │ ₹1.8L   ││
│  │ 12 deals  │ │ forecast   │ │ ↑ 5% MoM  │ │ 3 deals  ││
│  │ ▲12% MoM  │ │ ▲8% MoM   │ │           │ │ ⚠️ Urgent ││
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘│
├─────────────────────────────────────────────────────────────┤
│  🔥 Urgent Actions (AI-Recommended)                         │
│  ┌──────────────────────────────────────────────────┐      │
│  │ 🔴 CALL Dr. Mehta TODAY — opened proposal 3x     │      │
│  │    Close probability: 85% | Deal: ₹25,000        │      │
│  │    [📞 Call Now] [📧 Send Email] [✓ Done]         │      │
│  ├──────────────────────────────────────────────────┤      │
│  │ 🟡 Sharma Law — no activity 7 days, declining    │      │
│  │    Close probability: 45% ↓12% | Deal: ₹18,000   │      │
│  │    [💬 WhatsApp] [📧 Send Email] [⏭️ Skip]        │      │
│  ├──────────────────────────────────────────────────┤      │
│  │ 🟢 Fresh Bites — replied "send me more info"     │      │
│  │    Close probability: 72% | Deal: ₹15,000        │      │
│  │    [📄 Send Proposal] [📧 Reply] [✓ Done]        │      │
│  └──────────────────────────────────────────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  Pipeline Kanban (Enhanced)                                 │
│  ┌──────┐ ┌──────────┐ ┌──────────┐ ┌─────┐ ┌────────┐  │
│  │ New  │ │Contacted │ │Interested│ │Prop.│ │Converted│  │
│  │  4   │ │    3     │ │    2     │ │  2  │ │   1    │  │
│  │₹60k  │ │  ₹54k   │ │  ₹36k   │ │₹43k │ │  ₹25k  │  │
│  │      │ │         │ │         │ │     │ │        │  │
│  │[card]│ │ [card]  │ │ [card]  │ │[card]│ │ [card] │  │
│  │ 12%  │ │  34%    │ │  65%    │ │ 78% │ │  Won!  │  │
│  │prob  │ │  prob   │ │  prob   │ │prob  │ │   🎉   │  │
│  └──────┘ └──────────┘ └──────────┘ └─────┘ └────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### View 2: Deal Detail with Intelligence
```
┌─────────────────────────────────────────────────────────────┐
│  Dr. Mehta Clinic — Deal Intelligence                [×]    │
├─────────────────────────────────────────────────────────────┤
│  Close Probability: ████████████████████░░ 85%              │
│  Deal Value: ₹25,000  |  Stage: Proposal Sent              │
│  Health: 🟢 IMPROVING  |  Est. Close: Aug 15               │
│                                                             │
│  ┌─ AI Insights ──────────────────────────────────────┐    │
│  │  "Dr. Mehta has opened the proposal PDF 3 times    │    │
│  │   in the last 24 hours. High buying intent.        │    │
│  │   Recommend calling TODAY between 2-4 PM IST       │    │
│  │   when he's typically most responsive."            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ Engagement Timeline ─────────────────────────────┐     │
│  │  📧 Today 10:30 AM — Opened proposal (3rd time)   │     │
│  │  📧 Yesterday — Opened email, clicked audit link   │     │
│  │  📞 Aug 1 — AI call, 2:45 min, INTERESTED         │     │
│  │  📧 Jul 30 — Email sequence Step 1 sent            │     │
│  │  🔬 Jul 29 — AI Research completed (score: 78)     │     │
│  │  ➕ Jul 28 — Added to CRM from Directory           │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  ┌─ Health Trend (30 days) ─────────────────────────┐      │
│  │  100│                              ╱──●          │      │
│  │   75│                    ╱────────╱              │      │
│  │   50│          ╱────────╱                        │      │
│  │   25│──────────╱                                 │      │
│  │    0├────────────────────────────────            │      │
│  │     Jul 5    Jul 15    Jul 25    Aug 2           │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. User Walkthrough Flow

1. **Entry**: User goes to "360° AI Deal Hub" (existing CRM tab, upgraded)
2. **Overview**: See pipeline metrics, weighted forecast, at-risk deals
3. **Urgent Actions**: AI-recommended actions prominently displayed at top
4. **Act**: Click action button → performs the recommended action inline
5. **Kanban**: Enhanced Kanban shows probability % on each card
6. **Deal Detail**: Click any deal → see full intelligence report + timeline
7. **Revenue Forecast**: Monthly view showing predicted revenue by close date

---

## 4. Animation & Engagement Design

| Element | Animation | Details |
|:---|:---|:---|
| Probability gauge | Animated fill with color | Red (0-30) → Yellow (30-60) → Green (60-100) |
| Pipeline metrics | Count-up on load | Numbers increment from 0 to final value |
| Health trend line | SVG path draw | Line draws left-to-right over 1 second |
| Urgent action cards | Priority pulse | Red cards have subtle red glow pulse |
| Kanban cards | Drag shimmer | Card lifts with shadow when dragging between columns |
| Revenue numbers | Odometer roll | ₹ values roll like a meter counter |
| Deal won celebration | Confetti + success toast | 🎉 confetti burst when deal moves to "Converted" |
| Risk badge | Warning pulse | ⚠️ amber pulse on declining health deals |

---

## 5. Tier Gating

| Tier | Deal Intelligence | AI Actions | Revenue Forecast | Deal Scoring |
|:---|:---|:---|:---|:---|
| Free | Basic Kanban only | ❌ | ❌ | ❌ |
| Scout | Basic Kanban + notes | ❌ | ❌ | ❌ |
| Hunter | Full AI intelligence | ✅ (top 5) | ✅ | ✅ |
| Agency | Full + team view | ✅ (unlimited) | ✅ + Export | ✅ + Custom |

---

## 6. Innovation

- **Sentiment-Driven Stage Updates**: When an email reply is detected, Gemini classifies sentiment → auto-moves deal to appropriate stage (positive reply → "Interested", negative → "Lost").
- **Proposal View Tracking**: Embed tracking pixel in generated proposals → know exactly when and how many times a lead views the proposal.
- **Revenue Coaching**: "To hit your ₹5L/month target, you need 20 more proposals at your current 32% win rate. Current pace: ₹3.2L."
- **Deal Comparison**: "Deals similar to Dr. Mehta (Healthcare, ₹25k, Mumbai) typically close in 14 days. This deal is on Day 12 — on track!"
- **Win/Loss Analysis**: AI analyzes won vs. lost deals to identify patterns: "Your Healthcare deals convert 3x more than Legal. Focus on Healthcare leads."
