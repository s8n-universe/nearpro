# Feature 7: Multi-Channel Sequence Orchestrator

## Overview
Instead of single-channel outreach (just email or just WhatsApp), orchestrate cross-channel sequences: Email Day 1 → WhatsApp Day 3 → LinkedIn Connect Day 5 → Phone Call Day 7 → Email Follow-up Day 10. Multi-channel sequences achieve 3-5x higher response rates than single-channel.

---

## 1. Database Schema (Supabase PostgreSQL)

### Extends Feature 1 (Email Sequences) with Multi-Channel Support

```sql
-- 7a. Channel accounts — unified registry of all outreach channels
CREATE TABLE IF NOT EXISTS channel_accounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    channel_type        TEXT NOT NULL,               -- email | whatsapp | linkedin | phone | sms
    account_name        TEXT NOT NULL,               -- "My Gmail", "WhatsApp Business"
    
    -- Connection details (varies by channel)
    config              JSONB DEFAULT '{}',          -- Channel-specific config
    -- Email: {smtp_host, smtp_port, imap_host, email}
    -- WhatsApp: {api_key, phone_number_id, waba_id}
    -- LinkedIn: {session_cookie} (manual)
    -- Phone: {twilio_sid, twilio_token, from_number}
    
    encrypted_secrets   JSONB DEFAULT '{}',
    
    -- Status
    status              TEXT DEFAULT 'connected',    -- connected | disconnected | error | warming
    daily_limit         INTEGER DEFAULT 50,
    daily_used          INTEGER DEFAULT 0,
    
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, channel_type, account_name)
);

-- 7b. Extend sequence_steps for multi-channel
ALTER TABLE sequence_steps ADD COLUMN IF NOT EXISTS channel_type TEXT DEFAULT 'email';
-- email | whatsapp | linkedin_connect | linkedin_message | phone_call | sms | task
ALTER TABLE sequence_steps ADD COLUMN IF NOT EXISTS channel_account_id UUID REFERENCES channel_accounts(id);
ALTER TABLE sequence_steps ADD COLUMN IF NOT EXISTS condition_type TEXT DEFAULT 'no_reply';
-- no_reply | no_open | always | replied | custom
ALTER TABLE sequence_steps ADD COLUMN IF NOT EXISTS condition_config JSONB DEFAULT '{}';
-- For custom: {"if": "step_1_opened", "and_not": "step_2_replied"}

-- 7c. Orchestration events — tracks all cross-channel activity
CREATE TABLE IF NOT EXISTS orchestration_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id       UUID NOT NULL REFERENCES sequence_enrollments(id) ON DELETE CASCADE,
    step_id             UUID REFERENCES sequence_steps(id),
    channel_type        TEXT NOT NULL,
    event_type          TEXT NOT NULL,                -- sent | delivered | opened | clicked | replied | bounced | failed | connected | called
    
    -- Channel-specific metadata
    metadata            JSONB DEFAULT '{}',
    -- Email: {message_id, subject}
    -- WhatsApp: {wa_message_id, delivery_status}
    -- LinkedIn: {connection_status}
    -- Phone: {call_duration, amd_result, outcome}
    
    occurred_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 7d. Channel performance analytics
CREATE TABLE IF NOT EXISTS channel_performance (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    channel_type        TEXT NOT NULL,
    period              TEXT NOT NULL,                -- '2026-08' (monthly)
    total_sent          INTEGER DEFAULT 0,
    total_delivered     INTEGER DEFAULT 0,
    total_opened        INTEGER DEFAULT 0,
    total_replied       INTEGER DEFAULT 0,
    total_bounced       INTEGER DEFAULT 0,
    avg_response_time_h NUMERIC(8,2),
    calculated_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, channel_type, period)
);
```

### RLS Policies
```sql
ALTER TABLE channel_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own channels" ON channel_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own events" ON orchestration_events FOR SELECT USING (
    enrollment_id IN (SELECT id FROM sequence_enrollments WHERE user_id = auth.uid())
);
CREATE POLICY "Users view own performance" ON channel_performance FOR SELECT USING (auth.uid() = user_id);
```

---

## 2. UI Design — NearPro Integration

### 2a. Enhances Existing Sequences Tab (Feature 1)
No new sidebar item — multi-channel is a capability upgrade to the Sequence Builder.

### 2b. UI Screens

#### View 1: Multi-Channel Sequence Builder
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back    "Restaurant Owner Full Funnel"  [Save] [Launch]  │
├─────────────────────────────────────────────────────────────┤
│  Channel Badges: [📧 Email ✅] [💬 WhatsApp ✅] [📞 Phone ⬚]│
│                                                             │
│  ┌─── Step 1: Email Introduction ───────────────────┐      │
│  │ 📧 via: shri@s8n.in                              │      │
│  │ Subject: "{{name}}, your competitors are online"  │      │
│  │ Body: [Editor...]                                 │      │
│  │ Trigger: Immediately                              │      │
│  └──────────────────────────────────────────────────┘      │
│                    │                                        │
│            [IF no reply after 3 days]                       │
│                    │                                        │
│  ┌─── Step 2: WhatsApp Follow-Up ───────────────────┐      │
│  │ 💬 via: +91 98765 XXXXX                           │      │
│  │ Message: "Hi {{name}}, sent you an email about..." │      │
│  │ Template: Approved WhatsApp Business template      │      │
│  └──────────────────────────────────────────────────┘      │
│                    │                                        │
│            [IF no reply after 2 days]                       │
│                    │                                        │
│  ┌─── Step 3: Manual Task — LinkedIn Connect ───────┐      │
│  │ 🔗 Task: Send LinkedIn connection request          │      │
│  │ Note: "Hi {{name}}, I recently visited your..."   │      │
│  │ ⚠️ Manual step — you'll get a reminder             │      │
│  └──────────────────────────────────────────────────┘      │
│                    │                                        │
│            [IF no reply after 4 days]                       │
│                    │                                        │
│  ┌─── Step 4: Phone Call ───────────────────────────┐      │
│  │ 📞 Manual call with teleprompter script            │      │
│  │ Script: Auto-generated from sequence context       │      │
│  │ ⚠️ Manual step — call script will open on due date │      │
│  └──────────────────────────────────────────────────┘      │
│                    │                                        │
│            [IF no reply after 3 days]                       │
│                    │                                        │
│  ┌─── Step 5: Break-Up Email ───────────────────────┐      │
│  │ 📧 via: shri@s8n.in                              │      │
│  │ Subject: "Last message, {{name}}"                 │      │
│  │ Body: "If now isn't the right time..."            │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  [+ Add Step]  Step Types: [📧 Email] [💬 WhatsApp]         │
│                [📞 Phone] [🔗 LinkedIn] [📋 Task]            │
└─────────────────────────────────────────────────────────────┘
```

#### View 2: Channel Performance Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  📊 Channel Performance (August 2026)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐       │
│  │         Sent   Open%   Reply%   Best Time       │       │
│  │ 📧 Email  247   62%    12%     10:30 AM IST     │       │
│  │ 💬 WA     89    95%    28%      2:00 PM IST     │       │
│  │ 📞 Phone  12    —      42%      4:30 PM IST     │       │
│  │ 🔗 LI     34    —      18%     11:00 AM IST     │       │
│  └─────────────────────────────────────────────────┘       │
│                                                             │
│  Channel Comparison Bar Chart (animated)                    │
│  Reply Rate:                                                │
│  📞 Phone ████████████████████████████████████████ 42%      │
│  💬 WA    ██████████████████████████████ 28%                │
│  🔗 LI   ██████████████████ 18%                            │
│  📧 Email ████████████ 12%                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. User Walkthrough Flow

1. **Entry**: User goes to Sequences → "+ New Sequence"
2. **Channel Setup**: Connect channels (Email is default, add WhatsApp/LinkedIn)
3. **Build**: Drag-and-drop steps with different channel icons
4. **Conditions**: Set branching: "If email opened but not replied → WhatsApp"
5. **Manual Steps**: LinkedIn connects and phone calls marked as tasks with reminders
6. **Launch**: Review full flow → Confirm → Sequence runs automatically
7. **Task Reminders**: For manual steps, user gets notification: "Call Dr. Mehta today (Step 4)"
8. **Performance**: View which channel drives most replies for data-driven optimization

---

## 4. Animation & Engagement Design

| Element | Animation | Details |
|:---|:---|:---|
| Channel icons in builder | Color-coded pulse | Each channel has its own color: email=blue, WA=green, phone=purple |
| Condition branches | Animated split lines | SVG path splits into two branches with fade |
| Step timeline | Vertical connector draw | SVG line draws downward between steps |
| Channel switch in builder | Morph transition | Step card morphs color scheme when channel changes |
| Performance bars | Staggered width animation | Bars grow from left, each delayed by 100ms |
| Manual task reminder | Bell ring animation | 🔔 icon shakes when task is due |
| Step completion | Check mark draw | SVG checkmark path draws with green glow |

---

## 5. Tier Gating

| Tier | Channels | Steps/Sequence | Conditions | Manual Tasks |
|:---|:---|:---|:---|:---|
| Free | Email only | 2 | ❌ | ❌ |
| Scout | Email + WhatsApp | 4 | Basic (no reply) | ✅ |
| Hunter | All 4 channels | 7 | Advanced (opened, clicked) | ✅ |
| Agency | All + Custom | 10 | Full logic builder | ✅ + Auto-assign |

---

## 6. Innovation

- **AI-Recommended Channel Order**: Based on the lead's available contact info and industry, AI suggests the optimal channel sequence ("Restaurants respond 3x more on WhatsApp than email").
- **Cross-Channel Reply Detection**: If a lead replies on WhatsApp to Step 2, pause ALL future steps (email Step 3, etc.) — unified cross-channel awareness.
- **Smart Escalation**: If email bounces, auto-promote next WhatsApp step forward. If phone is DNC, auto-skip to next email step.
- **Hinglish WhatsApp Templates**: Pre-approved WhatsApp Business API message templates in Hinglish, ready to use with no setup.
