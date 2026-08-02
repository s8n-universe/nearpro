# Feature 1: Automated Multi-Step Email Sequences

## Overview
Transform NearPro from manual copy-paste outreach into a fully automated drip campaign engine. Users create multi-step sequences (Email → Wait → Email → Wait → Final Email) that run autonomously once launched.

---

## 1. Database Schema (Supabase PostgreSQL)

### New Tables

```sql
-- 1a. Sequence Templates — reusable blueprints for multi-step drip campaigns
CREATE TABLE IF NOT EXISTS email_sequences (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    description         TEXT,
    status              TEXT DEFAULT 'draft',  -- draft | active | paused | completed | archived
    channel             TEXT DEFAULT 'email',  -- email | whatsapp | multi
    language            TEXT DEFAULT 'hinglish',
    total_steps         INTEGER DEFAULT 0,
    total_enrolled      INTEGER DEFAULT 0,
    total_replied       INTEGER DEFAULT 0,
    total_bounced       INTEGER DEFAULT 0,
    open_rate           NUMERIC(5,2) DEFAULT 0,
    reply_rate          NUMERIC(5,2) DEFAULT 0,
    ab_test_enabled     BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 1b. Steps inside a sequence
CREATE TABLE IF NOT EXISTS sequence_steps (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id         UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
    step_number         INTEGER NOT NULL,        -- 1, 2, 3...
    step_type           TEXT DEFAULT 'email',    -- email | whatsapp | delay | condition
    subject_line        TEXT,                    -- email subject
    body_template       TEXT NOT NULL,           -- message body with {{placeholders}}
    delay_days          INTEGER DEFAULT 3,       -- wait N days before this step fires
    delay_hours         INTEGER DEFAULT 0,       -- additional hours
    send_time_window    TEXT DEFAULT '10:00-18:00', -- IST window to send
    ab_variant          TEXT DEFAULT 'A',        -- A or B for A/B testing
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 1c. Enrollment — which leads are in which sequence
CREATE TABLE IF NOT EXISTS sequence_enrollments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id         UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    saved_lead_id       UUID REFERENCES saved_leads(id) ON DELETE SET NULL,
    current_step        INTEGER DEFAULT 1,
    status              TEXT DEFAULT 'active',   -- active | paused | completed | replied | bounced | unsubscribed
    enrolled_at         TIMESTAMPTZ DEFAULT NOW(),
    last_step_sent_at   TIMESTAMPTZ,
    next_step_due_at    TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    reply_received_at   TIMESTAMPTZ,
    UNIQUE(sequence_id, professional_id, user_id)
);

-- 1d. Send Log — every individual message sent
CREATE TABLE IF NOT EXISTS sequence_send_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id       UUID NOT NULL REFERENCES sequence_enrollments(id) ON DELETE CASCADE,
    step_id             UUID NOT NULL REFERENCES sequence_steps(id) ON DELETE CASCADE,
    step_number         INTEGER NOT NULL,
    channel             TEXT NOT NULL,            -- email | whatsapp
    recipient_email     TEXT,
    recipient_phone     TEXT,
    subject_rendered     TEXT,
    body_rendered        TEXT,
    status              TEXT DEFAULT 'queued',    -- queued | sent | delivered | opened | replied | bounced | failed
    opened_at           TIMESTAMPTZ,
    replied_at          TIMESTAMPTZ,
    bounced_at          TIMESTAMPTZ,
    sent_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies
```sql
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sequences" ON email_sequences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own steps" ON sequence_steps FOR ALL USING (
    sequence_id IN (SELECT id FROM email_sequences WHERE user_id = auth.uid())
);
CREATE POLICY "Users manage own enrollments" ON sequence_enrollments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own send logs" ON sequence_send_log FOR SELECT USING (
    enrollment_id IN (SELECT id FROM sequence_enrollments WHERE user_id = auth.uid())
);
```

### RPC Functions
```sql
-- Get sequence analytics dashboard
CREATE OR REPLACE FUNCTION get_sequence_analytics(p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'total_sequences', (SELECT COUNT(*) FROM email_sequences WHERE user_id = p_user_id),
            'active_sequences', (SELECT COUNT(*) FROM email_sequences WHERE user_id = p_user_id AND status = 'active'),
            'total_enrolled', (SELECT COUNT(*) FROM sequence_enrollments WHERE user_id = p_user_id),
            'total_replied', (SELECT COUNT(*) FROM sequence_enrollments WHERE user_id = p_user_id AND status = 'replied'),
            'avg_open_rate', (SELECT COALESCE(AVG(open_rate), 0) FROM email_sequences WHERE user_id = p_user_id AND status IN ('active', 'completed')),
            'avg_reply_rate', (SELECT COALESCE(AVG(reply_rate), 0) FROM email_sequences WHERE user_id = p_user_id AND status IN ('active', 'completed'))
        )
    );
END; $$;
```

### Existing Table Modifications
```sql
-- Add sequence tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_sequence_sends_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_sequence_sends_limit INTEGER DEFAULT 0;
-- Free: 0, Scout: 100, Hunter: 500, Agency: 2000

-- Add connected email config to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smtp_host TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smtp_user TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smtp_encrypted_pass TEXT;  -- AES-256 encrypted
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sender_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_signature TEXT;
```

---

## 2. UI Design — NearPro Integration

### 2a. New Dashboard Sidebar Item
```javascript
// In DashboardShell.js sidebarItems array, add after 'outreach':
{ id: 'sequences', label: 'Email Sequences', requiredTier: 'scout', icon: 'git-branch' }
```

### 2b. Route Registration
```javascript
// In app.js initRoutes():
Router.on('#/dashboard/sequences', () => renderDashboardLayout('sequences'));
```

### 2c. UI Screens (4 Views)

#### View 1: Sequence Dashboard (List View)
```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ Email Sequences                          [+ New Sequence]│
├─────────────────────────────────────────────────────────────┤
│  📊 Analytics Bar                                           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│  │Active│ │Sent  │ │Opens │ │Replies│ │Bounce│             │
│  │  3   │ │ 247  │ │ 62%  │ │ 12%  │ │ 2.1% │             │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘             │
├─────────────────────────────────────────────────────────────┤
│  Sequence Card (glassmorphism)                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │ 🔥 "Web Dev Cold Outreach"        [Active] ●     │      │
│  │ 3 steps • 45 enrolled • 8 replied               │      │
│  │ ████████████████░░░░ 62% open rate               │      │
│  │ [Pause] [Edit] [Duplicate] [Analytics]           │      │
│  └──────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │ 📧 "Restaurant Website Pitch"     [Draft] ○      │      │
│  │ 2 steps • 0 enrolled • Not started              │      │
│  │ [Launch] [Edit] [Delete]                         │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

#### View 2: Sequence Builder (Visual Editor)
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back    "Web Dev Cold Outreach"     [Save Draft] [Launch]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─── Step 1: First Touch ──────────────────────────┐      │
│  │ 📧 Email                                          │      │
│  │ Subject: Hey {{name}}, your site is losing ₹...   │      │
│  │ Body: [Rich Text Editor]                          │      │
│  │ Send: Immediately on enrollment                   │      │
│  │ A/B: [Variant A ✓] [Variant B]                    │      │
│  └──────────────────────────────────────────────────┘      │
│                    │                                        │
│                    ▼  ⏱ Wait 3 days                         │
│                    │                                        │
│  ┌─── Step 2: Follow Up ────────────────────────────┐      │
│  │ 📧 Email                                          │      │
│  │ Subject: Quick follow-up, {{name}}                │      │
│  │ Body: [Rich Text Editor]                          │      │
│  │ Condition: IF Step 1 not replied                  │      │
│  └──────────────────────────────────────────────────┘      │
│                    │                                        │
│                    ▼  ⏱ Wait 2 days                         │
│                    │                                        │
│  ┌─── Step 3: Break-Up ────────────────────────────┐       │
│  │ 💬 WhatsApp                                       │      │
│  │ Body: Last msg {{name}}, if not interested...     │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  [+ Add Step]                                               │
└─────────────────────────────────────────────────────────────┘
```

#### View 3: Enrollment Panel (Select Leads)
```
┌─────────────────────────────────────────────────────────────┐
│  Enroll Leads into "Web Dev Cold Outreach"                  │
├─────────────────────────────────────────────────────────────┤
│  Source: [From CRM ▼] [From List ▼] [From Directory ▼]     │
│  Filter: Businesses without website • Rating 4.0+           │
├─────────────────────────────────────────────────────────────┤
│  ☑ Dr. Mehta Clinic (Healthcare, Andheri)      📧 ✓ 📱 ✓  │
│  ☑ Sharma & Sons (Legal, Bandra)               📧 ✓ 📱 ✓  │
│  ☑ Fresh Bites Restaurant (Food, Juhu)          📧 ✗ 📱 ✓  │
│  ☐ Perfect Cuts Salon (Beauty, Dadar)           📧 ✓ 📱 ✗  │
├─────────────────────────────────────────────────────────────┤
│  Selected: 3 leads    [Cancel]  [Enroll 3 Leads →]         │
└─────────────────────────────────────────────────────────────┘
```

#### View 4: Sequence Analytics (Per-Sequence)
```
┌─────────────────────────────────────────────────────────────┐
│  📊 "Web Dev Cold Outreach" Analytics                       │
├─────────────────────────────────────────────────────────────┤
│  Funnel Visualization (animated bar chart)                  │
│  Step 1 ████████████████████████████████ 45 sent (100%)     │
│  Step 2 ██████████████████████░░░░░░░░░░ 32 sent (71%)     │
│  Step 3 ████████████░░░░░░░░░░░░░░░░░░░ 18 sent (40%)     │
│  Replied ████████░░░░░░░░░░░░░░░░░░░░░░░  8 (18%)          │
├─────────────────────────────────────────────────────────────┤
│  A/B Test Results (if enabled)                              │
│  Variant A: 58% open, 14% reply                            │
│  Variant B: 67% open, 11% reply   ← Winner: Variant B      │
├─────────────────────────────────────────────────────────────┤
│  Lead Activity Timeline                                     │
│  🟢 Dr. Mehta opened email (2h ago)                         │
│  🔵 Sharma replied "Interested!" (5h ago) → Auto-paused    │
│  🔴 Fresh Bites bounced (1d ago) → Removed                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. User Walkthrough Flow

1. **Entry**: User clicks "Email Sequences" in dashboard sidebar
2. **Empty State**: If no sequences exist, show animated onboarding card:
   - "Create your first automated outreach sequence in 60 seconds"
   - Quick-start templates: "Cold Website Pitch", "Restaurant Owner", "Doctor Clinic"
3. **Create**: User clicks "+ New Sequence" → Builder opens
4. **Build**: User writes Step 1 subject + body, sets delay, adds Step 2
5. **Variables**: Typing `{{` triggers autocomplete dropdown:
   - `{{name}}` — Business name
   - `{{category}}` — Business type
   - `{{area}}` — Location
   - `{{rating}}` — Star rating
   - `{{website}}` — Website URL (if exists)
   - `{{audit_score}}` — PageSpeed score (if audited)
   - `{{revenue_loss}}` — Estimated monthly loss
6. **Enroll**: User selects leads from CRM/Lists/Directory
7. **Launch**: Confirmation modal with summary → Sequence starts
8. **Monitor**: Dashboard shows real-time open/reply tracking
9. **Auto-Pause**: When lead replies, sequence auto-pauses and creates CRM alert

---

## 4. Animation & Engagement Design

| Element | Animation | CSS Implementation |
|:---|:---|:---|
| Sequence cards | Staggered fade-in on load | `animation: fadeInUp 0.4s ease calc(var(--index) * 0.08s) both` |
| Step nodes | Pulse glow when active | `@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 var(--glow-gold) } 50% { box-shadow: 0 0 20px 4px var(--glow-gold) } }` |
| Connector lines | Animated dash flow | `stroke-dashoffset` animation on SVG lines between steps |
| Analytics bars | Count-up on scroll into view | IntersectionObserver + CSS `width` transition from 0% |
| Status badges | Color-coded dot with micro-pulse | Green=active, Gold=paused, Gray=draft, Pink=completed |
| Enroll modal | Slide-up from bottom | `transform: translateY(100%)` → `translateY(0)` |
| Reply notification | Toast with confetti burst | Brand gradient toast + subtle particle effect |
| Empty state | Floating envelope animation | CSS-only bouncing envelope with trail |

---

## 5. Backend Architecture (Edge Function)

### New Supabase Edge Function: `process-sequence-queue`
```
Trigger: Supabase CRON job (every 15 minutes) OR n8n webhook
Flow:
1. Query sequence_enrollments WHERE next_step_due_at <= NOW() AND status = 'active'
2. For each due enrollment:
   a. Render template with lead data (replace {{placeholders}})
   b. Send via Resend API (email) or WhatsApp Business API
   c. Insert into sequence_send_log
   d. Update enrollment.current_step++, calculate next_step_due_at
   e. If final step → mark enrollment as 'completed'
3. Check for bounces/replies via Resend webhooks
4. Auto-pause enrollments where reply detected
```

---

## 6. Tier Gating

| Tier | Sequences | Steps/Seq | Enrollments/Month | A/B Testing |
|:---|:---|:---|:---|:---|
| Free | 0 | — | — | ❌ |
| Scout | 3 | 3 | 100 | ❌ |
| Hunter | 10 | 5 | 500 | ✅ |
| Agency | Unlimited | 7 | 2000 | ✅ |

---

## 7. Innovation

- **AI Auto-Sequence**: One-click "Generate Sequence" button that uses Gemini to create a full 3-step sequence based on the lead's category, existing outreach templates, and audit data.
- **Smart Send Time**: Analyze open rate data to auto-schedule sends at the time each lead is most likely to open (IST business hours by default, learning over time).
- **Reply Sentiment Detection**: When a reply comes in, Gemini classifies it as "Interested", "Not Interested", "Ask Later", "Angry" — auto-updates CRM status accordingly.
- **Sequence Library**: Pre-built sequence templates for common Indian agency scenarios (Web Dev → Restaurant, Digital Marketing → Clinic, SEO → Law Firm).
