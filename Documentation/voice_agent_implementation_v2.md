# NearPro AI Voice Agent — Production Implementation Plan
## Version 2.0 | Full Compliance Audit + Strategic Enhancements
## July 2026

---

## AUDIT FINDINGS — READ BEFORE ANYTHING ELSE

This section documents exactly what was wrong in Version 1 and why.
Every item below is either a legal risk, a technical bug, or a strategic mistake.
Version 2 of this plan corrects all of them.

---

### CRITICAL ISSUE 1 — "Indistinguishable from Human" Is Illegal and Counterproductive

**Version 1 framing:** The checklist item reads "Human Naturalness & Credibility" and states
calls are "indistinguishable from human callers." The architecture includes "12dB office
background noise mixed into PSTN stream" specifically to reinforce this deception.

**Why this is wrong:**
TRAI is actively moving toward mandatory AI disclosure for automated calls.
Current enforcement guidance already requires AI calls to identify themselves as automated
within the first 30 seconds. Building a system specifically designed to defeat this
disclosure is the exact behavior regulators are targeting.

Beyond legality: sophisticated Indian business owners (the people NearPro's users are
calling) will detect an AI within 2-3 sentences if the conversation goes off-script.
The moment they realize they were deceived, trust is destroyed — not just for this call,
but for the NearPro user's entire business relationship with that prospect.

**Version 2 correction:** Remove "indistinguishable from human" entirely. Replace with
"natural-sounding AI that discloses itself immediately." This is both legally safer and
converts better — businesses that know they're speaking to an AI for an initial
qualification are more willing to have a frank conversation.

Remove the background noise injection. There is no legitimate use for fake office noise
in a transparent AI call.

---

### CRITICAL ISSUE 2 — No DLT Registration Pathway in the Plan

**Version 1 gap:** Phase 2 includes "TRAI DND Scrubbing" as a single 4-day task.
This dramatically understates the compliance requirement.

**The actual requirement:**
Before placing a single commercial call in India, NearPro (as the Principal Entity)
AND the telemarketer platform (LiveKit/Exotel) must both be registered on TRAI's
blockchain DLT (Distributed Ledger Technology) platform. Registration involves:
- Formal Principal Entity registration with TRAI DLT
- Linkage of the PE registration to the telemarketer
- Registration of approved call script templates
- Assignment of 140-series numbers for promotional calls

This is not a 4-day task. It takes 2-4 weeks and requires legal documentation.

**Good news for NearPro's B2B use case:** Since NearPro's voice calls target
registered businesses (not individual consumers), these calls technically fall
outside the strictest TCCCPR consumer protection framework. B2B calls have more
regulatory flexibility. However, DLT registration and 140-series number use are
still required for any commercial voice outreach at scale.

**Version 2 correction:** Add Phase 0 (Regulatory Groundwork) as a prerequisite
to all technical development. No production calls until registration is complete.

---

### CRITICAL ISSUE 3 — Financial Economics Are Incomplete

**Version 1 omissions:**

**Exotel pricing:** Version 1 shows Exotel as ₹0.60/minute. Exotel does not offer
pure pay-per-minute pricing for API/SIP trunk access. Their actual structure:
- Minimum plan: ₹3,000-5,000/month + per-minute rates
- SIP trunking for AI platforms: requires an enterprise agreement
- Budget ₹5,000-8,000/month just for Exotel minimum commitment (before per-call costs)

**DLT registration and platform fees:**
- DLT platform registration fee: ₹500-1,500/month (ongoing, not one-time)
- This is missing from the cost model entirely

**Failed call costs:**
- Numbers that ring out, go to voicemail, or are declined still incur PSTN termination fees
- Realistic answer rate for AI cold calls in India: 8-20% on 140-series numbers
- This means paying for 5-12 call attempts to get one answered call
- True cost per *answered* 2-minute call: ₹18-44, not ₹3.66

**Corrected cost model:**

| Cost Component | Per Minute | Per 2-Min Call | Notes |
|----------------|-----------|----------------|-------|
| Deepgram Nova-2 STT | ₹0.35 | ₹0.70 | Only on answered calls |
| Groq Llama 3.3 70B | ₹0.08 | ₹0.16 | Only on answered calls |
| Cartesia Sonic TTS | ₹0.40 | ₹0.80 | Only on answered calls |
| Exotel SIP (PSTN) | ₹0.60 | ₹1.20 | ALL attempts, not just answered |
| LiveKit Cloud | ₹0.40 | ₹0.80 | Only on answered calls |
| **Per-answered-call AI cost** | | **₹3.66** | |
| **PSTN cost for 8 attempts to get 1 answer** | | **₹9.60** | At 12.5% answer rate |
| **True cost per qualified answered call** | | **₹13.26** | |
| DLT fixed/monthly amortized | | ₹0.50 | At 10K calls/month |
| **Total realistic cost** | | **~₹14-18** | |

**Revised margin structure:**
- NearPro cost per answered call: ₹14-18
- Recommended selling price: ₹25-35 per call credit
- Realistic gross margin: 40-55% (not the 75-82% stated in Version 1)

This is still a strong margin but must be modeled honestly.

---

### CRITICAL ISSUE 4 — Data Residency Gap

**LiveKit Cloud:** US-based infrastructure. Call audio streams through US servers.
Under DPDP Act 2023, voice recordings containing conversations are personal data.
Sending this through non-India infrastructure needs a Data Processing Agreement
and explicit disclosure in the Privacy Policy.

**Groq API:** US-based. Call transcript text passes through Groq's US servers.
Same DPDP implication.

**Deepgram:** US-based. Audio passes through their servers for transcription.

**Version 2 correction:**
- Use LiveKit's India/Singapore region option (they have South Asia deployments)
- Add Deepgram and Groq to the Privacy Policy as data processors
- Add standard data processing agreements with all three
- Store all call recordings and transcripts in Supabase Mumbai region (AWS ap-south-1)
  which NearPro already uses — this part is already compliant

---

### BUG — Mid-Call LLM Failover Is Operationally Wrong

**Version 1 shows:** Groq → Claude Haiku failover if Groq is rate-limited.

**The problem:** Switching LLMs mid-conversation doesn't just change the response
generator — it resets the entire context window. The AI "forgets" everything said
so far in the call. The recipient hears a sudden change in behavior.
The correct failover architecture is at call INITIATION (before connecting),
not during an active call.

**Version 2 correction:** Failover happens at the session setup stage.
If Groq is unavailable when a call is being initiated, use Claude Haiku from the start.
Once a call is active, the same model handles it to completion regardless of load.

---

## 1. Revised Architecture Overview

### Design Philosophy Change

Version 1: "Build an AI that sounds human"
Version 2: "Build an AI that sounds natural, moves fast, and is transparently AI"

The conversion insight: NearPro's users are calling businesses for B2B outreach.
These are professional conversations, not consumer sales calls.
A business owner who receives a well-structured AI call for a relevant service
responds better than to a deceptive human-impersonation call — because they know
the AI is efficient, gets to the point, and they can ask direct questions.

### Revised Stack

```
NearPro Frontend (Vercel SPA)
    │
    ▼
Voice Campaign Builder (VoiceAgentModal.js)
    │
    ▼
Supabase Edge Function: voice-agent-orchestrator
    │
    ├── Pre-call compliance check:
    │   ├── DND/NCPR registry scrub
    │   ├── Consent artefact verification
    │   ├── TRAI calling hours check (9 AM - 9 PM local)
    │   ├── Call attempt count check (max 3/day, max 7/campaign)
    │   └── Credit balance check (deduct on answer, not on dial)
    │
    ├── Model selection (at initiation, not mid-call):
    │   Primary:  Groq Llama 3.3 70B (120ms TTFT)
    │   Fallback:  Anthropic Claude Haiku (if Groq unavailable at initiation)
    │
    ▼
LiveKit Cloud Agent (South Asia region)
    │
    ├── STT: Deepgram Nova-2 (100ms, streaming)
    │   Fallback (at session start): Faster-Whisper via Modal serverless
    │
    ├── LLM: Groq Llama 3.3 70B (120ms TTFT)
    │   Fallback (at session start): Claude 3.5 Haiku
    │
    ├── TTS: Cartesia Sonic (130ms) Indian voice
    │   Fallback (at session start): Kokoro-82M via Modal
    │
    └── VAD: Silero (80ms barge-in detection)
    │
    ▼
Exotel SIP Trunk (140-series numbers, India PSTN)
    │
    ▼
Business Lead Phone
    │
    ▼
Post-call pipeline (within 3 seconds of call end):
    ├── Transcript → Supabase (Mumbai region)
    ├── Recording → Supabase Storage (Mumbai)
    ├── Sentiment classification → call outcome tag
    ├── saved_leads.status update (CRM sync)
    ├── Credit deduction (on answered call confirmation)
    └── Audit log entry (TRAI compliance record)
```

---

## 2. Phase 0: Regulatory Groundwork (Do This FIRST)
**Duration: 3-4 weeks | Must complete before any production calls**

This phase has no code. It is entirely legal and operational setup.
Do not start Phase 1 technical work until Phase 0 is complete.

### Step 0.1: DLT Principal Entity Registration

Register S8N as a Principal Entity (PE) on TRAI's DLT platform.
DLT providers (choose one): Vodafone Idea DLT, Airtel DLT, BSNL DLT, or
any TRAI-approved DLT partner.

Documents required:
- GST Certificate of S8N
- Registered address proof
- Aadhaar/PAN of authorized signatory
- Business registration certificate

Timeline: 5-10 working days after document submission.
Fee: ₹500-1,500/month (ongoing).
Output: PE Registration ID (required for all commercial calls).

### Step 0.2: Telemarketer Registration Linkage

Register LiveKit/Exotel as your telemarketer on the DLT platform and
link them to your PE Registration ID.

Note: Exotel has their own DLT registration. This step links your PE to their
telemarketer registration. Exotel's enterprise team handles this — contact them
directly. Timeline: 3-5 working days.

### Step 0.3: 140-Series Number Provisioning

Request 140-series numbers from Exotel for your SIP trunk.
These are mandatory for promotional/commercial AI calls.

Note on answer rates: 140-series numbers have 8-20% answer rates because
Indian consumers recognize the prefix as commercial. This is priced into
the corrected financial model in Section 6.

Alternative strategy: For warm follow-up calls (leads that have already
visited NearPro, used the free trial, or responded to outreach), use the
calling from a known/branded number. Warm leads answer at 40-65%.
This dramatically improves unit economics.

### Step 0.4: Call Template Registration on DLT

Register your standard call scripts as approved templates on the DLT platform.
Variable fields (business name, category, area) must be declared in the template.
Static parts of the script are fixed and reviewed.

This is why the AI cannot be fully generative in its opener — the opening
script must match the registered template. After the opener, natural
conversation can continue freely.

### Step 0.5: NCPR/DND API Access

Apply for NCPR (National Customer Preference Register) API access to scrub
numbers before each campaign. Access is provided by TRAI's designated
DLT partner.

For NearPro's B2B use case: most businesses are registered on their telecom
account as businesses (not individuals), which technically exempts them from
the DND consumer protection framework. Voluntary scrubbing is still recommended
for brand protection.

---

## 3. Phase 1: Engine Architecture
**Duration: 2 weeks | Starts after Phase 0 DLT registration is in progress**

### 1.1 LiveKit Cloud Setup (South Asia Region)

```typescript
// supabase/functions/voice-agent-orchestrator/livekit.ts

import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

const livekitClient = new RoomServiceClient(
  process.env.LIVEKIT_API_URL,        // Use ap-southeast-1 or ap-south-1 region
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET,
);

export async function createCallSession(callParams: CallParams) {
  // Create isolated room per call (multi-tenant isolation)
  const roomName = `call_${callParams.userId}_${Date.now()}`;
  
  await livekitClient.createRoom({
    name: roomName,
    emptyTimeout: 300,        // Auto-delete after 5 min of silence
    maxParticipants: 2,       // Agent + lead (no third parties)
  });

  return roomName;
}
```

### 1.2 Pre-Call Compliance Gate

**This function runs before EVERY call attempt. No exceptions.**

```typescript
// supabase/functions/voice-agent-orchestrator/compliance.ts

interface ComplianceCheck {
  passed: boolean;
  reason?: string;
  code?: 'DND_REGISTERED' | 'OUTSIDE_HOURS' | 'MAX_ATTEMPTS' | 
          'INSUFFICIENT_CREDITS' | 'CONSENT_EXPIRED';
}

export async function preCallComplianceCheck(
  phone: string,
  userId: string,
  leadId: string
): Promise<ComplianceCheck> {

  // Check 1: Calling hours (9 AM - 9 PM IST, mandatory)
  const now = new Date();
  const istHour = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"})).getHours();
  if (istHour < 9 || istHour >= 21) {
    return { passed: false, reason: "Outside permitted calling hours (9AM-9PM IST)", code: 'OUTSIDE_HOURS' };
  }

  // Check 2: Max call attempts per number per day
  const { count } = await supabase
    .from('call_audit_log')
    .select('id', { count: 'exact' })
    .eq('called_number_hash', hashPhone(phone))
    .eq('initiated_by_user', userId)
    .gte('created_at', new Date(Date.now() - 86400000).toISOString());

  if ((count || 0) >= 3) {
    return { passed: false, reason: "Max 3 attempts per number per day reached", code: 'MAX_ATTEMPTS' };
  }

  // Check 3: User credit balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('voice_call_credits')
    .eq('id', userId)
    .single();

  if (!profile || profile.voice_call_credits < 1) {
    return { passed: false, reason: "Insufficient call credits", code: 'INSUFFICIENT_CREDITS' };
  }

  // Check 4: DND scrub (async, cached per number for 24 hours)
  // For B2B numbers: implement as best-effort, not blocking
  // Business numbers are generally exempt from consumer DND framework
  const isDND = await checkDNDCache(phone);
  if (isDND) {
    return { passed: false, reason: "Number registered on DND (voluntary compliance)", code: 'DND_REGISTERED' };
  }

  return { passed: true };
}
```

### 1.3 AI Agent Persona — Transparent AI, Natural Conversation

**Remove:** "indistinguishable from human" goal
**Remove:** Background office noise injection
**Add:** Mandatory AI disclosure in the first 5 seconds

```typescript
// The system prompt for the AI agent

const AGENT_SYSTEM_PROMPT = (params: CallParams) => `
You are Priya, a professional AI assistant calling on behalf of ${params.callerCompany}.

MANDATORY OPENING (say this FIRST, before anything else):
"Hello, am I speaking with ${params.leadName || 'someone at ' + params.leadBusinessName}? 
My name is Priya — I'm an AI assistant representing ${params.callerCompany}. 
This call is being recorded for quality purposes. I have a quick 60-second question for you."

CONTEXT:
- Business you're calling: ${params.leadBusinessName}
- Their location: ${params.leadArea}, Mumbai  
- Their category: ${params.leadCategory}
- Their Google rating: ${params.leadRating} stars with ${params.leadReviews} reviews
- Caller's service: ${params.callerService}
- Caller's goal: ${params.callGoal}

CONVERSATION RULES:
1. Always confirm you are an AI if asked directly. Never deny it.
2. Keep each response under 30 words unless asking a clarifying question.
3. Primary goal: qualify interest in ONE sentence, then ask if they want to speak with
   the actual ${params.callerCompany} team member.
4. If not interested: thank them warmly, ask if there's a better time to call back,
   and log the outcome. Do not argue or push.
5. If interested: take their preferred callback time and confirm it.
6. If voicemail: do NOT leave a message. Hang up silently.
7. NEVER discuss pricing. NEVER make commitments. ONLY qualify interest.

OPT-OUT: If they say "stop calling", "don't call again", "DND", or similar:
Say "Absolutely, I've noted that. You won't receive calls from us again. Thank you."
Then immediately trigger the OPT_OUT function.

CALL OUTCOME TAGS (use these exactly to log outcome):
- INTERESTED_CALLBACK: They want a call back from the actual human
- INTERESTED_NOW: They want to talk now (warm transfer request)
- NOT_INTERESTED: Clear no
- CALL_BACK_LATER: Not now but open to future contact
- VOICEMAIL: Reached voicemail/IVR
- WRONG_NUMBER: Number doesn't match the business
- OPT_OUT: Requested no further calls
- NO_ANSWER: Rang out

Voice: ${params.voiceName} (Indian English, professional, warm)
Language: ${params.language === 'hinglish' ? 'Hinglish (natural mix of Hindi and English, use "Aap" not "Tum")' : 'Professional English'}
`;
```

### 1.4 TRAI Audit Log Table (Mandatory)

```sql
-- Every commercial call must be logged for TRAI compliance audit
-- This table must be retained for minimum 2 years

CREATE TABLE IF NOT EXISTS call_audit_log (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity (never store raw phone — use hash for privacy)
  called_number_hash    TEXT NOT NULL,     -- SHA-256 of normalized phone
  initiated_by_user     UUID NOT NULL REFERENCES profiles(id),
  professional_id       UUID REFERENCES professionals(id),
  saved_lead_id         UUID REFERENCES saved_leads(id),
  
  -- Compliance fields (required by TRAI for audit)
  pe_registration_id    TEXT,             -- S8N's DLT PE ID
  dlt_template_id       TEXT,             -- Registered script template ID
  number_series         TEXT DEFAULT '140', -- '140' for promotional
  dnd_status_at_call    TEXT DEFAULT 'NOT_DND',  -- DND check result
  calling_hour_ist      INTEGER,          -- Hour of call (9-21 range check)
  consent_reference     TEXT,             -- Consent artefact ID if applicable
  
  -- Call outcome
  call_status           TEXT,             -- INITIATED | ANSWERED | NO_ANSWER | FAILED
  call_outcome_tag      TEXT,             -- From agent: INTERESTED_CALLBACK etc.
  duration_seconds      INTEGER DEFAULT 0,
  
  -- Timing
  initiated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at           TIMESTAMPTZ,
  ended_at              TIMESTAMPTZ,
  
  -- Content references (stored separately in Supabase Storage)
  transcript_path       TEXT,             -- Path in Supabase Storage
  recording_path        TEXT,             -- Path in Supabase Storage
  
  -- Credits (deducted only on answered calls)
  credits_charged       INTEGER DEFAULT 0,
  
  -- Opt-out tracking
  opt_out_requested     BOOLEAN DEFAULT FALSE,
  opt_out_at            TIMESTAMPTZ
);

-- Do not expose raw audit data to users (internal compliance use only)
ALTER TABLE call_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can see their own call history (not raw compliance fields)
CREATE POLICY "Users see own call logs"
  ON call_audit_log FOR SELECT
  USING (auth.uid() = initiated_by_user);

-- Service role only for full audit access
-- Index for compliance queries
CREATE INDEX idx_call_audit_user ON call_audit_log(initiated_by_user, initiated_at DESC);
CREATE INDEX idx_call_audit_number ON call_audit_log(called_number_hash, initiated_at DESC);
CREATE INDEX idx_call_audit_status ON call_audit_log(call_status, initiated_at DESC);
```

---

## 4. Phase 2: Telephony Integration
**Duration: 2 weeks**

### 2.1 Exotel Integration (Correct Setup)

Exotel SIP trunk configuration for AI calling:
- Request 140-series DIDs explicitly when signing up (not standard DIDs)
- Enable: SIP trunk for LiveKit integration
- Configure: webhook for call status updates (answered, ended, failed)
- Set: max concurrent calls per DID (start at 5, scale to 20)

**Exotel realistic pricing for planning:**
- Starter plan: ₹3,000-5,000/month minimum (includes call minutes)
- Per-minute India local call: ₹0.40-0.60 depending on plan tier
- SIP trunk setup fee: typically waived on enterprise plans

### 2.2 IVR Navigation (Missing in V1)

Many Indian businesses have IVR systems ("Press 1 for sales, Press 2 for service").
The AI must detect IVR and handle it gracefully:

```typescript
// In the LiveKit agent

async function detectIVR(audioStream: Stream): Promise<boolean> {
  // Pattern: repetitive audio, low variance in pitch, automated voice detected
  // Deepgram's confidence score drops on synthetic IVR voices
  // If confidence < 0.6 and transcript contains "press", "dial", "option"
  // → IVR detected
  
  const transcript = await deepgramTranscribe(audioStream);
  const ivrKeywords = ['press', 'dial', 'option', 'department', 'connect you'];
  const isIVR = ivrKeywords.some(k => transcript.toLowerCase().includes(k));
  
  if (isIVR) {
    // Attempt to navigate: press 0 for operator, or hang up and log as IVR
    // For NearPro V1: hang up and log as VOICEMAIL, don't attempt IVR navigation
    return true;
  }
  return false;
}
```

### 2.3 Voicemail Detection

```typescript
// Detect voicemail within first 3 seconds of connection
// Typical Indian voicemail patterns:
// "The number you have called is not available..."
// "Please leave a message after the tone..."
// Airtel/Jio/BSNL voicemail detection phrases

const VOICEMAIL_PATTERNS = [
  "not available", "please leave", "after the tone",
  "mailbox", "voicemail", "press star", "record your message",
  "upalabdha nahi hai"  // Hindi: "not available"
];

async function isVoicemail(initialTranscript: string): Promise<boolean> {
  return VOICEMAIL_PATTERNS.some(p =>
    initialTranscript.toLowerCase().includes(p)
  );
}
// If voicemail: log as VOICEMAIL, do not charge credits, hang up
```

---

## 5. Phase 3: NearPro UI Integration
**Duration: 2 weeks**

### 5.1 Voice Campaign Builder (VoiceAgentModal.js)

**New UI component replacing the concept from V1:**

The UI should make compliance visible to users — it builds trust and prevents misuse.

```
┌─────────────────────────────────────────────────────────┐
│  AI Voice Call Campaign                                  │
│                                                          │
│  Selected Leads: 12 (from saved list "Bandra Dentists")  │
│  Estimated Credits: 12                                   │
│  Estimated answered calls: 2-3 (at 20% answer rate)     │
│                                                          │
│  CAMPAIGN SETTINGS                                       │
│  ─────────────────                                       │
│  Voice:     [Priya (F, Hinglish)] ▾                     │
│  Language:  [○ Hinglish  ○ English]                      │
│  Goal:      [○ Qualify Interest  ○ Book Appointment]    │
│  Callback:  [Your Phone: +91-XXXXX-XXXXX]               │
│                                                          │
│  YOUR INFO (for the AI to represent you)                 │
│  ─────────────────────────────────────                   │
│  Your Name:    [Rahul Sharma           ]                 │
│  Your Company: [DigitalRoots Agency    ]                 │
│  Your Service: [Website Design & Dev   ]                 │
│                                                          │
│  SMART SCHEDULING                                        │
│  ─────────────────                                       │
│  ● Call during business hours only (9AM-9PM IST)        │
│  ● Skip leads closed today (using their hours data)     │  
│  ● Skip Monday before 10AM (low answer rates)           │
│                                                          │
│  COMPLIANCE                                              │
│  ───────────                                             │
│  ✓ DND check will run before each call                  │
│  ✓ AI will disclose it is automated                     │
│  ✓ Max 3 attempts per number per day                    │
│  ✓ Opt-out requests automatically honored               │
│                                                          │
│  [ Preview Script ] [ Launch Campaign ]                  │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Smart Scheduling Using NearPro's Existing Hours Data

This is the single most powerful differentiator in the entire feature set.
NearPro already has business hours data for every scraped business.
No other AI calling platform knows when the leads are actually open.

```typescript
// frontend/js/components/VoiceAgentModal.js

function filterCallableLeads(leads: BusinessLead[]): BusinessLead[] {
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = dayNames[istTime.getDay()];
  const currentHour = istTime.getHours();

  return leads.filter(lead => {
    // Skip if no hours data (can't verify)
    if (!lead.hours) return true; // Attempt call anyway

    // Skip if explicitly closed today
    const todayHours = lead.hours[today];
    if (!todayHours || todayHours.toLowerCase() === 'closed') {
      return false; // Don't waste a call credit on a closed business
    }

    // Parse opening time and skip if not yet open or already closed
    // (Basic implementation — full parser in cleaner.py is the reference)
    return true; // Full parsing adds 30 min of dev, defer to Sprint 2
  });
}

// Show the user before launching:
// "4 of your 12 leads are closed today. Scheduling those for tomorrow."
```

### 5.3 WhatsApp Fallback After Failed Calls

If a call attempt results in NO_ANSWER or VOICEMAIL, automatically trigger a
WhatsApp message as a fallback within 30 minutes. This is India-specific behavior
that doubles effective contact rates.

```typescript
// voice-agent-orchestrator/index.ts

async function triggerWhatsAppFallback(
  lead: BusinessLead,
  userId: string,
  callAttemptId: string
) {
  // Only if user has WhatsApp integration configured
  const { data: profile } = await supabase
    .from('profiles')
    .select('n8n_webhook_url, whatsapp_fallback_enabled')
    .eq('id', userId)
    .single();

  if (!profile?.whatsapp_fallback_enabled || !profile?.n8n_webhook_url) return;

  // Trigger n8n webhook → n8n sends WhatsApp via existing outreach pipeline
  await fetch(profile.n8n_webhook_url, {
    method: 'POST',
    body: JSON.stringify({
      trigger: 'voice_call_fallback',
      lead_id: lead.id,
      lead_name: lead.name,
      lead_phone: lead.phone,
      call_attempt_id: callAttemptId,
      message_type: 'post_missed_call_whatsapp'
    })
  });
}
```

### 5.4 Real-Time Call Monitoring Dashboard

Add to LeadCRM.js — visible for active campaigns:

```
ACTIVE CAMPAIGN — Bandra Dentists
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
12 leads | 3 attempted | 1 in progress | 8 queued | 1 fallback WhatsApp

Dr. Sharma Dental Clinic  ← In Progress ● LIVE
[Live transcript scrolling...]
"Hello, yes who is this?" → "My name is Priya, I'm an AI assistant..."
Duration: 0:47 | Sentiment: Neutral

Sunshine Dental, Bandra   ← ✅ Interested (Callback Requested)
Rang at 14:23 | Duration: 1:42 | Outcome: Wants call at 4 PM today

Bandra Dental House       ← ℹ️ Voicemail — WhatsApp sent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Credits remaining: 9
```

### 5.5 Call Outcome CRM Integration

After every call, the outcome tag from the AI agent automatically updates
the `saved_leads` status:

| AI Outcome Tag | CRM Status | Action |
|----------------|-----------|--------|
| INTERESTED_CALLBACK | `responded` | Set follow-up reminder for callback time |
| INTERESTED_NOW | `responded` | Alert user immediately via notification |
| NOT_INTERESTED | `not_interested` | Remove from future call campaigns |
| CALL_BACK_LATER | `contacted` | Queue for callback in 3 days |
| VOICEMAIL | `contacted` | Trigger WhatsApp fallback, queue retry in 24h |
| WRONG_NUMBER | `closed` | Flag for data team to verify/remove |
| OPT_OUT | `not_interested` | Add to permanent do-not-call list |
| NO_ANSWER | stays as-is | Queue retry in 4+ hours |

---

## 6. Phase 4: Credit System & Billing
**Duration: 1 week**

### 6.1 Credit Package Structure (Razorpay One-Time Payments)

Voice credits are NOT subscription-based — they are prepaid credits.
This protects NearPro from chargebacks (used credits cannot be disputed
as easily as recurring subscriptions).

| Package | Credits | Price | Per-Call Cost | Bonus |
|---------|---------|-------|---------------|-------|
| Starter | 25 credits | ₹499 | ₹20/call | — |
| Growth | 100 credits | ₹1,499 | ₹15/call | 20% savings |
| Agency | 300 credits | ₹3,999 | ₹13.33/call | 33% savings |
| Enterprise | Custom | Custom | Negotiated | Custom |

**1 credit = 1 answered call (up to 3 minutes)**
Credits are deducted ONLY when a call is answered — not on attempted dials.
Unanswered calls, voicemails, and IVR responses consume zero credits.
This is the correct and user-friendly model.

### 6.2 Credit Deduction Logic

```typescript
// Credit is held at call initiation, deducted at answer confirmation

async function handleCallAnswered(callId: string, userId: string) {
  // Confirm the call was genuinely answered (not a false positive from Exotel)
  const call = await supabase.from('call_audit_log')
    .select('*').eq('id', callId).single();

  // Only deduct if call lasted >5 seconds (prevents billing on accidental answers)
  const duration = (new Date().getTime() - new Date(call.data.answered_at).getTime()) / 1000;

  if (duration > 5) {
    await supabase.from('profiles')
      .update({ voice_call_credits: supabase.rpc('decrement_credits', { amount: 1 }) })
      .eq('id', userId);

    await supabase.from('call_audit_log')
      .update({ credits_charged: 1 })
      .eq('id', callId);
  }
}
```

### 6.3 Fraud Prevention

Without this, users will claim calls didn't connect to avoid credit deduction:
- Store Exotel's call SID + answered status as the authoritative source
- Only accept credit disputes with an Exotel SID showing NO_ANSWER status
- Implement rate limiting: max 50 credits consumed per user per day
- Flag accounts consuming >100 credits in <1 hour for manual review

---

## 7. Revised Financial Economics

### Corrected Cost Model (Realistic)

| Scenario | Cost | Notes |
|----------|------|-------|
| Cold call (140-series, ~12% answer rate) | ₹14-18 per answered call | 8 dials to get 1 answer |
| Warm follow-up call (known number, ~45% answer rate) | ₹7-9 per answered call | 2-3 dials to get 1 answer |
| NearPro credit price | ₹15-20 per credit | |
| **Cold call gross margin** | **~20-30%** | Thin but viable at volume |
| **Warm call gross margin** | **~55-65%** | Good margin |

**Strategic conclusion:** Position voice calls primarily for WARM outreach
(leads in the CRM pipeline who have been contacted before, not cold lists).
Cold calling works but margin is thin. Warm calls are where NearPro makes money.

**Monthly fixed costs to plan for:**
- Exotel enterprise plan: ₹5,000-8,000/month
- DLT platform fee: ₹500-1,500/month
- LiveKit Cloud base cost: ~₹500/month (for base infra)
- **Total fixed overhead: ~₹6,000-10,000/month**

These fixed costs require approximately 400-700 answered calls/month to break even
at the Starter credit price. 50 Agency-tier customers making 10 calls each per month
= 500 calls = break-even coverage.

---

## 8. Revised Implementation Roadmap

```
PHASE 0: Regulatory Groundwork (3-4 weeks)
────────────────────────────────────────────────────────────
Week 1-2: DLT Principal Entity registration (S8N)
Week 2-3: Exotel enterprise agreement + 140-series provisioning
Week 3-4: DLT template registration + NCPR API access setup

PHASE 1: Engine Architecture (2 weeks, parallel with Phase 0)
────────────────────────────────────────────────────────────
Week 1: LiveKit Cloud (South Asia) + Groq + Deepgram + Cartesia integration
Week 2: Pre-call compliance gate + Failover logic + Audit log schema

PHASE 2: Telephony Integration (2 weeks)
────────────────────────────────────────────────────────────
Week 1: Exotel SIP trunk + 140-series number routing
Week 2: IVR detection + Voicemail detection + Post-call pipeline

PHASE 3: NearPro UI Integration (2 weeks)
────────────────────────────────────────────────────────────
Week 1: VoiceAgentModal.js + Smart scheduling + LeadCRM integration
Week 2: Real-time monitoring dashboard + WhatsApp fallback trigger

PHASE 4: Billing + Hardening (1 week)
────────────────────────────────────────────────────────────
Week 1: Credit package system (Razorpay) + Fraud prevention + Load testing

PRODUCTION BETA (Week after Phase 4)
────────────────────────────────────────────────────────────
50 Agency-tier users, max 500 calls total, manual oversight
Monitor: answer rates, call quality, opt-out rate, credit disputes
```

---

## 9. Additional Features V1 Did Not Include

### Feature A: Call Quality Scoring (Auto-computed post-call)

```typescript
interface CallQualityScore {
  duration_seconds: number;     // Longer = more engaged
  barge_in_count: number;        // Lead interrupted AI = interested
  response_length: number;       // Longer lead responses = engaged
  sentiment: 'positive' | 'neutral' | 'negative';
  qualified: boolean;
  qualification_confidence: number; // 0.0 to 1.0
}
```

Use this to auto-update `saved_leads.conversion_score` in the CRM.

### Feature B: Callback Scheduling Integration

When a lead says "call me back at 4 PM" during an AI call, the agent:
1. Confirms the time ("Perfect, I'll have [Caller Name] call you at 4 PM today")
2. Creates a reminder in `saved_leads.follow_up_due_at`
3. Sends a push/email notification to the NearPro user at 3:45 PM
4. Optionally triggers a second AI call at 4 PM with context from the first call

### Feature C: Multi-Language Routing

When expanding beyond Mumbai (Pune, Delhi, Bangalore):
Detect the area code prefix of the lead's phone number and route to the
appropriate language AI persona:
- Mumbai/Pune (+91 22/20): Hinglish default
- Bangalore (+91 80): Kannada/English option
- Chennai (+91 44): Tamil/English option
- Hyderabad (+91 40): Telugu/English option

Cartesia and ElevenLabs both support Indian regional language voices.

### Feature D: Call Transcript Search

```sql
-- Add GIN full-text index on transcript storage
-- Allow users to search across all their call transcripts
-- "Show me all calls where the lead mentioned 'price' or 'budget'"
CREATE INDEX idx_call_transcript_fts ON call_audit_log
USING GIN(to_tsvector('english', transcript_path));
```

---

## 10. Risk Registry

| Risk | Probability | Impact | Mitigation |
|------|-----------|--------|------------|
| TRAI enforcement action | LOW (B2B exempt, but not zero) | HIGH | DLT registration, 140-series, AI disclosure |
| Exotel account suspension for TCCCPR violation | MEDIUM (if not careful) | HIGH | Pre-call DND scrub, strict hour compliance |
| Answer rate lower than forecast (8-12% cold) | HIGH | MEDIUM | Position primarily for warm calls |
| LiveKit latency spikes causing call quality issues | MEDIUM | MEDIUM | South Asia region selection, failover |
| User fraud (claiming calls failed to avoid credit deduction) | MEDIUM | LOW | Exotel SID verification as authoritative record |
| Groq rate limiting at peak hours | LOW | MEDIUM | Claude Haiku fallback at call initiation |
| DPDP Act enforcement on call recordings | LOW (B2B) | MEDIUM | India data residency for recordings |
| Low conversion from call to actual qualified lead | HIGH (normal for cold) | LOW | Set realistic expectations in UI |

---

## Final Verdict

**Will this plan work technically?** Yes, with the corrected architecture.

**Will it work legally?** Only after Phase 0 (DLT registration) is complete.
Starting production calls before DLT registration is a direct TRAI violation.

**The biggest single change from V1 to V2:** Reposition from
"cold calling AI that sounds human" to "warm follow-up AI that discloses itself
and converts better because of it." This change simultaneously reduces legal risk,
improves conversion rates on leads that are already warm, and builds trust with
the business owners being called. It is not a compromise — it is a better product.

**Timeline to first production call:** Phase 0 takes 3-4 weeks. Technical phases
take 7 weeks. Total: approximately 10-11 weeks from today to production launch.
Start Phase 0 paperwork immediately while building Phase 1 in parallel.
