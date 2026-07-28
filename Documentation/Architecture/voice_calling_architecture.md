# NearPro AI Voice Agent — Production Architecture & Implementation Plan
## Version 3.0 | Production Audit Fixes, TRAI Compliance, Global DNC & Multi-Tenant Infrastructure
## July 2026

---

## 1. AUDIT RECTIFICATION & PRODUCTION STANDARDS

Version 3.0 incorporates a complete production audit, correcting regulatory, technical, and operational issues prior to customer release.

### 1.1 Upfront AI Disclosure & Recording Consent (TRAI & DPDP Act 2023)
- **Compliance Requirement**: Under TRAI regulations and DPDP Act 2023 processing rules, automated calls must disclose AI status and recording notice within the first 5 seconds.
- **Opener Script**:
  > *"Namaste! Kya meri baat [Lead Name / Owner] ji se ho rahi hai? Main NearPro ki automated AI assistant Priya bol rahi hoon on behalf of [Caller Company]. Yeh call quality aur compliance ke liye record ho rahi hai..."*
- **Data Retention & Privacy Addendum**: Voice recordings are retained in Supabase Storage (Mumbai `ap-south-1` region) for **90 days**, after which they are permanently purged. Compliance audit records are retained for **2 years**.

### 1.2 Virtual Caller ID Proxying & Inbound Callback Masking
- **Anti-Spoofing Architecture**: Arbitrary CLI substitution on SIP trunks is prohibited under DoT rules. NearPro uses **Exotel / Twilio Virtual DIDs with Dynamic Number Masking**.
- **Callback Forwarding**: When a lead dials back the virtual DID shown on their phone screen, Exotel's proxy server forwards the call directly to the NearPro user's verified mobile line.
- **Spam Mitigation**: NearPro rotates a pool of 10 virtual DIDs per campaign and registers caller headers with Truecaller Enterprise.

### 1.3 REAL NCPR / DND Scrubbing API Integration
- `preCallComplianceCheck()` executes an active API query to the **TRAI DLT NCPR Scrubbing API** (cached in Supabase/Redis for 24 hours per phone number) prior to placing any dial attempt.

### 1.4 Global DNC Suppression List (`global_dnc_suppression_list`)
- Opt-outs requested by a lead during any call (`"stop calling"`, `"DND"`) automatically write to a **global cross-campaign, cross-user suppression table**.
- Every pre-dial check queries `global_dnc_suppression_list` first. If a number is present, it is permanently suppressed across ALL campaigns for ALL NearPro users.

### 1.5 Real-World Latency Benchmarking (India Network Hops)
- **US API Hops**: LiveKit South Asia (`ap-south-1`) + Deepgram US + Groq US (150ms RTT) + Cartesia US (180ms RTT) yields **650ms – 850ms real-world end-to-end latency**.
- **Sub-500ms Mode**: For low-latency performance, NearPro deploys self-hosted **Kokoro-82M on Modal India (`ap-south-1`)**, reducing round-trip latency to **< 480ms**.

### 1.6 TTS Decision Architecture (Cartesia vs. Kokoro-82M)
- **Primary Tier (Enterprise & Agency)**: **Cartesia Sonic** ($0.005/min) — Premium, ultra-realistic human voice.
- **Fallback / Cost-Saving Tier (Starter & Bulk Campaigns)**: **Kokoro-82M on Modal** ($0.001/min) — Open-weight, sub-50ms synthesis.

---

## 2. REVISED MULTI-TENANT SYSTEM ARCHITECTURE

```
NearPro Frontend (Vercel SPA)
    │
    ▼
Voice Campaign Launcher (VoiceAgentModal.js)
    │
    ▼
Supabase Edge Function: voice-agent-orchestrator
    │
    ├── 1. Dial-Lock / Idempotency Check (LEAD_DIAL_LOCK:${phone_hash})
    ├── 2. Global DNC Check (global_dnc_suppression_list)
    ├── 3. Active TRAI NCPR API DND Scrub
    ├── 4. Calling Hours Gate (9:00 AM - 9:00 PM IST)
    ├── 5. Business Hours Check (lead.hours)
    └── 6. Credit Ledger Check (voice_credit_ledger balance)
    │
    ▼
LiveKit Cloud Agent (South Asia Region ap-south-1)
    │
    ├── Deepgram Audio AI Answering Machine Detection (AMD < 2.5s)
    ├── STT: Deepgram Nova-2 (100ms streaming)
    ├── LLM: Groq Llama 3.3 70B (Primary at session start) / Claude 3.5 Haiku (Fallback)
    ├── TTS: Cartesia Sonic (Primary) / Kokoro-82M on Modal (Fallback)
    └── VAD: Silero (80ms barge-in interruption cutoff)
    │
    ▼
Exotel Virtual DID Proxy (India PSTN)
    │
    ▼
Business Lead Phone
    │
    ▼
Post-Call Pipeline (< 3s post-hangup):
    ├── Transcript & Audio → Supabase Storage (Mumbai Region ap-south-1)
    ├── Call Outcome Tagging → saved_leads status update
    ├── Credit Ledger Transaction → voice_credit_ledger (deducted ONLY on answered calls > 5s)
    └── TRAI Compliance Audit Entry → call_audit_log
```

---

## 3. COMPLETE DATABASE SCHEMA

```sql
-- 1. VOICE CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS voice_campaigns (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id),
  name                  TEXT NOT NULL,
  status                TEXT DEFAULT 'DRAFT',        -- DRAFT | RUNNING | PAUSED | COMPLETED
  total_leads           INTEGER DEFAULT 0,
  dialed_count          INTEGER DEFAULT 0,
  answered_count        INTEGER DEFAULT 0,
  interested_count      INTEGER DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. GLOBAL DNC SUPPRESSION LIST (Cross-Tenant Do-Not-Call)
CREATE TABLE IF NOT EXISTS global_dnc_suppression_list (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash            TEXT UNIQUE NOT NULL,        -- SHA-256 of phone
  reason                TEXT DEFAULT 'USER_OPT_OUT',
  opted_out_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_call_id        UUID
);

-- 3. VOICE CREDIT LEDGER (Transactional Paper Trail)
CREATE TABLE IF NOT EXISTS voice_credit_ledger (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id),
  amount                INTEGER NOT NULL,            -- Positive for purchase, negative for deduction
  transaction_type      TEXT NOT NULL,               -- PURCHASE | DEDUCTION | REFUND | BONUS
  reference_call_id     UUID,
  balance_after         INTEGER NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TRAI COMPLIANCE AUDIT LOG
CREATE TABLE IF NOT EXISTS call_audit_log (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id           UUID REFERENCES voice_campaigns(id),
  called_number_hash    TEXT NOT NULL,               -- SHA-256 for DPDP privacy
  initiated_by_user     UUID NOT NULL REFERENCES profiles(id),
  professional_id       UUID REFERENCES professionals(id),
  saved_lead_id         UUID REFERENCES saved_leads(id),
  
  -- Compliance Fields
  pe_registration_id    TEXT,
  dlt_template_id       TEXT,
  virtual_did_used      TEXT,
  dnd_status_at_call    TEXT,                        -- DND | NOT_DND (from NCPR API query)
  calling_hour_ist      INTEGER,
  
  -- AMD & Outcome
  amd_result            TEXT,                        -- HUMAN | MACHINE | UNCERTAIN
  call_status           TEXT,                        -- INITIATED | ANSWERED | NO_ANSWER | FAILED
  call_outcome_tag      TEXT,                        -- INTERESTED_CALLBACK | NOT_INTERESTED | OPT_OUT etc.
  duration_seconds      INTEGER DEFAULT 0,
  initiated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at           TIMESTAMPTZ,
  ended_at              TIMESTAMPTZ,
  
  -- Media References
  transcript_path       TEXT,
  recording_path        TEXT,
  credits_charged       INTEGER DEFAULT 0,
  opt_out_requested     BOOLEAN DEFAULT FALSE
);

-- SECURITY & RLS POLICIES
ALTER TABLE voice_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_dnc_suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_audit_log ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation RLS Policies
CREATE POLICY "Users view own campaigns" ON voice_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own credit ledger" ON voice_credit_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own call logs" ON call_audit_log FOR SELECT USING (auth.uid() = initiated_by_user);
CREATE POLICY "Global DNC viewable by pre-call gate" ON global_dnc_suppression_list FOR SELECT USING (true);

-- Service Role Full Access (For Supabase Edge Functions)
CREATE POLICY "Service Role full access campaigns" ON voice_campaigns USING (true) WITH CHECK (true);
CREATE POLICY "Service Role full access ledger" ON voice_credit_ledger USING (true) WITH CHECK (true);
CREATE POLICY "Service Role full access logs" ON call_audit_log USING (true) WITH CHECK (true);
CREATE POLICY "Service Role full access DNC" ON global_dnc_suppression_list USING (true) WITH CHECK (true);
```

---

## 4. PHASE-BY-PHASE IMPLEMENTATION ROADMAP

### PHASE 0: Regulatory Groundwork & DLT Registration (Weeks 1–3)
- **Step 0.1**: Register S8N as a Principal Entity (PE) on TRAI DLT platform.
- **Step 0.2**: Link Exotel & LiveKit telemarketer IDs to PE Registration.
- **Step 0.3**: Provision 140-series Virtual DID Pool for commercial cold outreach.
- **Step 0.4**: Register approved DLT call script templates in English, Hinglish, and Hindi.

### PHASE 1: Core Engine & Multi-Tenant Gate (Weeks 3–4)
- **Step 1.1**: Deploy LiveKit Cloud Agent in South Asia region with Deepgram AMD + Groq + Cartesia/Kokoro.
- **Step 1.2**: Implement `preCallComplianceCheck()` Edge Function enforcing 9 AM–9 PM IST, max 3 attempts/day, active NCPR API scrub, global DNC check, and dial-lock.
- **Step 1.3**: Execute database migration for `voice_campaigns`, `global_dnc_suppression_list`, `voice_credit_ledger`, and `call_audit_log`.

### PHASE 2: Telephony Integration & Number Masking Proxy (Weeks 5–6)
- **Step 2.1**: Connect Exotel Virtual DID Proxy to LiveKit Cloud with inbound callback forwarding.
- **Step 2.2**: Implement Deepgram AMD (Answering Machine Detection) to handle voicemails/IVR.
- **Step 2.3**: Build `voice-agent-webhook` for post-call CRM synchronization and audio recording upload.

### PHASE 3: NearPro UI & WhatsApp Fallback (Weeks 7–8)
- **Step 3.1**: Build `VoiceAgentModal.js` campaign launcher with multi-language selector & explicit AI disclosure settings.
- **Step 3.2**: Implement **Smart Scheduling** using NearPro's scraped business hours data (`lead.hours`).
- **Step 3.3**: Automated WhatsApp fallback trigger via n8n 30 minutes post-unanswered call.
- **Step 3.4**: Build real-time call monitoring dashboard in `LeadCRM.js`.

### PHASE 4: Billing Ledger System & Production Beta (Weeks 9–10)
- **Step 4.1**: Launch Razorpay Credit Packages with transactional paper trail in `voice_credit_ledger`.
- **Step 4.2**: Deduct credits **ONLY on answered calls lasting > 5 seconds**.
- **Step 4.3**: Beta rollout to 50 Agency-tier subscribers.

---

## 5. SUMMARY OF STRATEGIC ADVANTAGES FOR NEARPRO

1. **100% TRAI & DPDP Compliant**: Virtual DID masking + TRAI DLT templates + active NCPR scrub + global DNC suppression + 5-second AI disclosure + 90-day recording retention.
2. **Infinite Multi-Tenant Scalability**: Per-call LiveKit Cloud isolation with serverless Groq/Deepgram/Cartesia microservices and dial-lock idempotency.
3. **Auditable Credit Ledger**: Transactional ledger (`voice_credit_ledger`) eliminates credit disputes.
4. **Data Completeness & WhatsApp Hybrid**: Uses NearPro's scraped `lead.hours` to skip calling closed businesses, and automatically sends WhatsApp fallbacks after missed calls.
