# Feature 2: Email Warmup & Deliverability Infrastructure

## Overview
Without email warmup, cold emails land in spam. This feature provides automated inbox warming, SPF/DKIM/DMARC validation, domain reputation monitoring, and inbox rotation — turning NearPro into a deliverability-first platform that competes with Instantly.ai.

---

## 1. Database Schema (Supabase PostgreSQL)

### New Tables

```sql
-- 2a. Connected email accounts
CREATE TABLE IF NOT EXISTS email_accounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    email_address       TEXT NOT NULL,
    display_name        TEXT,
    provider            TEXT DEFAULT 'smtp',    -- smtp | gmail | outlook | zoho
    smtp_host           TEXT,
    smtp_port           INTEGER DEFAULT 587,
    imap_host           TEXT,
    imap_port           INTEGER DEFAULT 993,
    encrypted_password  TEXT,                   -- AES-256 encrypted at rest
    oauth_token         TEXT,                   -- For Gmail/Outlook OAuth
    oauth_refresh_token TEXT,
    
    -- Warmup State
    warmup_status       TEXT DEFAULT 'not_started', -- not_started | warming | warmed | paused | error
    warmup_started_at   TIMESTAMPTZ,
    warmup_day          INTEGER DEFAULT 0,       -- Current warmup day (0-30)
    daily_send_limit    INTEGER DEFAULT 5,       -- Starts at 5, ramps to 50
    daily_sends_today   INTEGER DEFAULT 0,
    warmup_target_daily INTEGER DEFAULT 50,      -- Goal daily send capacity
    
    -- Health Metrics
    reputation_score    INTEGER DEFAULT 50,      -- 0-100 composite score
    bounce_rate         NUMERIC(5,2) DEFAULT 0,
    spam_complaint_rate NUMERIC(5,2) DEFAULT 0,
    last_health_check   TIMESTAMPTZ,
    
    -- DNS Validation
    spf_valid           BOOLEAN,
    dkim_valid          BOOLEAN,
    dmarc_valid         BOOLEAN,
    dns_checked_at      TIMESTAMPTZ,
    
    -- Rotation
    is_active           BOOLEAN DEFAULT TRUE,
    priority            INTEGER DEFAULT 1,       -- For weighted rotation
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, email_address)
);

-- 2b. Warmup interaction log
CREATE TABLE IF NOT EXISTS warmup_interactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id          UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    interaction_type    TEXT NOT NULL,            -- sent | received | opened | replied
    partner_email       TEXT NOT NULL,            -- The other warmup email involved
    subject             TEXT,
    message_id          TEXT,                     -- Email Message-ID header for threading
    sent_at             TIMESTAMPTZ DEFAULT NOW(),
    opened_at           TIMESTAMPTZ,
    replied_at          TIMESTAMPTZ,
    moved_to_inbox      BOOLEAN DEFAULT FALSE    -- Whether reply was rescued from spam
);

-- 2c. Domain health reports
CREATE TABLE IF NOT EXISTS domain_health_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    domain              TEXT NOT NULL,
    
    -- DNS Records
    spf_record          TEXT,
    spf_status          TEXT,                    -- pass | fail | missing
    dkim_selector       TEXT,
    dkim_status         TEXT,                    -- pass | fail | missing
    dmarc_record        TEXT,
    dmarc_policy        TEXT,                    -- none | quarantine | reject
    dmarc_status        TEXT,
    mx_records          JSONB DEFAULT '[]',
    
    -- Blacklist Check
    blacklist_results   JSONB DEFAULT '{}',      -- { "spamhaus": false, "barracuda": true }
    blacklisted_count   INTEGER DEFAULT 0,
    total_lists_checked INTEGER DEFAULT 0,
    
    -- Overall
    health_score        INTEGER DEFAULT 0,       -- 0-100
    recommendations     JSONB DEFAULT '[]',      -- Actionable fix suggestions
    checked_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2d. Inbox rotation config
CREATE TABLE IF NOT EXISTS inbox_rotation_config (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rotation_strategy   TEXT DEFAULT 'round_robin', -- round_robin | weighted | random
    max_daily_per_inbox INTEGER DEFAULT 30,
    cool_down_minutes   INTEGER DEFAULT 60,        -- Min gap between sends from same inbox
    enabled             BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies
```sql
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE warmup_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_rotation_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own accounts" ON email_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own warmup" ON warmup_interactions FOR SELECT USING (
    account_id IN (SELECT id FROM email_accounts WHERE user_id = auth.uid())
);
CREATE POLICY "Users manage own health reports" ON domain_health_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own rotation config" ON inbox_rotation_config FOR ALL USING (auth.uid() = user_id);
```

---

## 2. UI Design — NearPro Integration

### 2a. Dashboard Sidebar
```javascript
// Add under 'sequences' in sidebarItems:
{ id: 'deliverability', label: 'Deliverability Hub', requiredTier: 'scout', icon: 'shield-check' }
```

### 2b. Route
```javascript
Router.on('#/dashboard/deliverability', () => renderDashboardLayout('deliverability'));
```

### 2c. UI Screens (3 Views)

#### View 1: Deliverability Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  🛡️ Deliverability Hub                    [+ Add Account]   │
├─────────────────────────────────────────────────────────────┤
│  Overall Health Score                                       │
│  ┌──────────────────────────────────────────────┐          │
│  │        ┌─────────────┐                       │          │
│  │        │    85/100    │  GOOD                 │          │
│  │        │  ●●●●●●●●●○ │  "Your emails are     │          │
│  │        └─────────────┘   landing in inbox"    │          │
│  └──────────────────────────────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Connected Accounts                                         │
│  ┌─────────────────────────────────────────────────┐       │
│  │ 📧 shri@s8n.in              Reputation: 92     │       │
│  │    Warmup: Day 24/30  ████████████████████████░ │       │
│  │    Today: 42/50 sends • SPF ✅ DKIM ✅ DMARC ✅  │       │
│  │    [Pause Warmup]  [Check DNS]  [View Stats]    │       │
│  └─────────────────────────────────────────────────┘       │
│  ┌─────────────────────────────────────────────────┐       │
│  │ 📧 outreach@nearpro.com      Reputation: 67    │       │
│  │    Warmup: Day 12/30  ████████████░░░░░░░░░░░░░ │       │
│  │    Today: 15/20 sends • SPF ✅ DKIM ❌ DMARC ⚠️  │       │
│  │    ⚠️ Fix DKIM: Add TXT record to DNS           │       │
│  │    [Resume Warmup]  [Fix DNS →]  [View Stats]   │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

#### View 2: Add Account Modal
```
┌─────────────────────────────────────────────────────────────┐
│  Connect Email Account                              [×]     │
├─────────────────────────────────────────────────────────────┤
│  Provider:                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│  │Gmail │ │Outlook│ │ Zoho │ │Custom │                     │
│  │  ○   │ │  ○   │ │  ○   │ │  ●   │                      │
│  └──────┘ └──────┘ └──────┘ └──────┘                      │
│                                                             │
│  SMTP Host:  [smtp.example.com        ]                    │
│  SMTP Port:  [587                     ]                    │
│  Email:      [you@example.com         ]                    │
│  Password:   [••••••••••              ]  🔒 AES-256        │
│  IMAP Host:  [imap.example.com        ]                    │
│                                                             │
│  ☑ Start warmup immediately after connection               │
│  ☑ Auto-validate DNS records                               │
│                                                             │
│  [Test Connection]    [Connect & Start Warmup →]           │
└─────────────────────────────────────────────────────────────┘
```

#### View 3: Domain Health Check
```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Domain Health: s8n.in                                   │
├─────────────────────────────────────────────────────────────┤
│  DNS Authentication                                         │
│  ┌─────────────────────────────────────────────┐           │
│  │ SPF   ✅ PASS   v=spf1 include:_spf.google  │           │
│  │ DKIM  ✅ PASS   Selector: google             │           │
│  │ DMARC ✅ PASS   p=quarantine; rua=...        │           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
│  Blacklist Check (12 lists scanned)                         │
│  ┌─────────────────────────────────────────────┐           │
│  │ Spamhaus     ✅ Clean                        │           │
│  │ Barracuda    ✅ Clean                        │           │
│  │ SORBS        ✅ Clean                        │           │
│  │ SpamCop      ✅ Clean                        │           │
│  │ ... 8 more   ✅ All Clean                    │           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
│  Warmup Progress (30-Day Ramp)                              │
│  Day  1-5:   5 emails/day   ███░░░░░░░░░░░░░               │
│  Day  6-10: 10 emails/day   ██████░░░░░░░░░░               │
│  Day 11-15: 20 emails/day   ████████████░░░░               │
│  Day 16-25: 35 emails/day   ██████████████████              │
│  Day 26-30: 50 emails/day   ████████████████████ ← You are │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. User Walkthrough Flow

1. **Entry**: User clicks "Deliverability Hub" in sidebar
2. **First Time**: Animated empty state with illustration
   - "Your emails are going to spam. Let's fix that."
   - "Connect your email in 30 seconds →"
3. **Connect**: User enters SMTP/IMAP credentials → System tests connection
4. **DNS Check**: Automatic DNS scan → Shows SPF/DKIM/DMARC status
   - If issues found → Copy-pasteable DNS records to fix
5. **Warmup Starts**: 30-day automated ramp begins
   - System sends/receives realistic emails between warmup pool
   - Daily progress bar updates
6. **Monitoring**: User sees reputation score change over time
7. **Ready**: After 30 days, account shows "WARMED" badge
   - Can now be used in Email Sequences feature

---

## 4. Animation & Engagement Design

| Element | Animation | Details |
|:---|:---|:---|
| Health score ring | Animated SVG arc draw | Counts from 0 to current score with color gradient |
| Warmup progress | Daily bar growth animation | New bar segment glows gold when it appears |
| DNS status icons | Staggered check marks | ✅ icons pop in one-by-one with 200ms delay |
| Reputation graph | Line chart draw animation | SVG path animated with `stroke-dashoffset` |
| Account cards | Hover lift + glow | `transform: translateY(-2px)` + `box-shadow` glow |
| Blacklist check | Sequential scanning animation | Each list shows "Checking..." → ✅ with 150ms intervals |
| Fix DNS section | Pulse attention animation | Amber glow pulse on DKIM/DMARC fix required items |
| Connection test | Spinner → Success burst | Loading spinner → green checkmark with ripple |

---

## 5. Backend Architecture

### Edge Function: `email-warmup-tick`
```
Trigger: Supabase pg_cron every 30 minutes
Flow:
1. Query email_accounts WHERE warmup_status = 'warming'
2. For each warming account:
   a. Calculate today's send limit based on warmup_day
   b. If daily_sends_today < daily_send_limit:
      - Generate realistic email content (weather, news snippets)
      - Send to warmup partner pool (other NearPro users' warmup accounts)
      - Log in warmup_interactions
   c. Check IMAP for received warmup emails:
      - If found in spam → Move to inbox (increases reputation)
      - Reply to received warmup emails (simulates engagement)
   d. Increment warmup_day if 24h elapsed since last increment
3. Update reputation_score based on: bounce rate, spam complaints, open rate

Warmup Schedule:
Day 1-5:   5 emails/day
Day 6-10: 10 emails/day
Day 11-15: 20 emails/day
Day 16-20: 30 emails/day
Day 21-25: 40 emails/day
Day 26-30: 50 emails/day
```

### Edge Function: `check-domain-health`
```
Trigger: On-demand (user clicks "Check DNS") or weekly CRON
Flow:
1. DNS lookup: Resolve SPF, DKIM, DMARC TXT records
2. MX record validation
3. Blacklist check: Query 12 DNSBL services
4. Calculate health_score (weighted formula)
5. Generate actionable recommendations
6. Upsert into domain_health_reports
```

---

## 6. Tier Gating

| Tier | Connected Accounts | Warmup | DNS Checks | Inbox Rotation |
|:---|:---|:---|:---|:---|
| Free | 0 | ❌ | ❌ | ❌ |
| Scout | 2 | ✅ (manual) | 1/week | ❌ |
| Hunter | 5 | ✅ (auto) | Unlimited | ✅ |
| Agency | 20 | ✅ (auto) | Unlimited | ✅ + Custom Strategy |

---

## 7. Innovation

- **Warmup Pool Network**: NearPro users' warmup accounts interact with each other — building a private warmup network. More users = better warmup quality.
- **One-Click DNS Fix Generator**: For each DNS issue, generate the exact TXT/CNAME record + hosting-provider-specific instructions (GoDaddy, Hostinger, Cloudflare, etc.).
- **Reputation Alerts**: Real-time push notification if reputation drops below 70 — "Your s8n.in reputation dropped! 2 bounces detected. Pause sequences?"
- **Smart Rotation**: When multiple accounts are connected, auto-rotate sending across them to distribute volume and maximize deliverability.
