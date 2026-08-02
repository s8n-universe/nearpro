# Feature 8: AI Voice Calling Agent

## Overview
Upgrade NearPro from displaying teleprompter scripts to actually making AI-powered phone calls. An AI agent calls leads, speaks naturally in English/Hindi, handles objections, qualifies interest, and logs outcomes — making NearPro the FIRST Indian B2B platform with autonomous AI calling.

---

## 1. Database Schema (Supabase PostgreSQL)

### Extends Existing Voice Agent Tables
The voice agent migration (`v3_voice_agent_migration.sql`) already created: `voice_campaigns`, `global_dnc_suppression_list`, `voice_credit_ledger`, `call_audit_log`. We extend these:

```sql
-- 8a. AI Voice agent configurations
CREATE TABLE IF NOT EXISTS voice_agent_configs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name                TEXT NOT NULL DEFAULT 'Default Agent',
    
    -- Voice Personality
    voice_id            TEXT DEFAULT 'alloy',         -- TTS voice: alloy | echo | nova | shimmer (or ElevenLabs IDs)
    voice_provider      TEXT DEFAULT 'openai',        -- openai | elevenlabs | deepgram
    language            TEXT DEFAULT 'en-IN',         -- en-IN | hi-IN | hinglish
    speaking_rate       NUMERIC(3,2) DEFAULT 1.0,
    
    -- Agent Behavior
    agent_persona       TEXT DEFAULT 'professional',  -- professional | friendly | consultative
    opening_script      TEXT,                         -- Custom opening line template
    qualification_questions JSONB DEFAULT '[]',       -- ["Are you the business owner?", "Do you have a website?"]
    objection_handling  JSONB DEFAULT '{}',           -- {"too_expensive": "response...", "not_interested": "response..."}
    max_call_duration_s INTEGER DEFAULT 180,          -- 3 min max
    
    -- Knowledge Base
    company_context     TEXT,                         -- "I'm calling from S8N Technologies, we help..."
    services_offered    JSONB DEFAULT '[]',           -- ["Website Development", "SEO", "Digital Marketing"]
    pricing_info        TEXT,                         -- "Our packages start from ₹15,000..."
    
    -- LLM Config
    llm_model           TEXT DEFAULT 'gemini-2.5-flash',
    system_prompt       TEXT,                         -- Full system prompt for the agent
    temperature         NUMERIC(3,2) DEFAULT 0.7,
    
    is_default          BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 8b. Call transcripts (detailed)
CREATE TABLE IF NOT EXISTS call_transcripts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_log_id         UUID NOT NULL REFERENCES call_audit_log(id) ON DELETE CASCADE,
    
    -- Full conversation
    transcript          JSONB DEFAULT '[]',           -- [{role: "agent"|"human", text: "...", timestamp_ms: 1200}]
    
    -- AI Analysis
    sentiment_overall   TEXT DEFAULT 'neutral',       -- positive | neutral | negative
    interest_level      TEXT DEFAULT 'unknown',       -- hot | warm | cold | not_interested
    key_objections      JSONB DEFAULT '[]',           -- ["Price too high", "Already have a vendor"]
    action_items        JSONB DEFAULT '[]',           -- ["Send proposal", "Call back Wednesday"]
    summary             TEXT,                         -- AI-generated call summary
    
    -- Quality Metrics
    agent_talk_ratio    NUMERIC(5,2),                 -- % of time agent spoke vs. human
    interruptions       INTEGER DEFAULT 0,
    avg_response_ms     INTEGER,                      -- Agent response latency
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 8c. Call scheduling
CREATE TABLE IF NOT EXISTS scheduled_calls (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id         UUID REFERENCES voice_campaigns(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    agent_config_id     UUID REFERENCES voice_agent_configs(id),
    
    -- Scheduling
    scheduled_for       TIMESTAMPTZ NOT NULL,
    time_zone           TEXT DEFAULT 'Asia/Kolkata',
    
    -- TRAI Compliance
    calling_window_start TEXT DEFAULT '10:00',        -- IST
    calling_window_end  TEXT DEFAULT '19:00',         -- IST
    
    status              TEXT DEFAULT 'scheduled',     -- scheduled | dialing | completed | failed | cancelled
    call_log_id         UUID REFERENCES call_audit_log(id),
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies
```sql
ALTER TABLE voice_agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own configs" ON voice_agent_configs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own transcripts" ON call_transcripts FOR SELECT USING (
    call_log_id IN (SELECT id FROM call_audit_log WHERE initiated_by_user = auth.uid())
);
CREATE POLICY "Users manage own scheduled calls" ON scheduled_calls FOR ALL USING (auth.uid() = user_id);
```

---

## 2. UI Design — NearPro Integration

### 2a. Enhances Existing Voice Agent Modal (`VoiceAgentModal.js`)
Plus a new dashboard section.

### 2b. Dashboard Sidebar
```javascript
{ id: 'voice-agent', label: 'AI Voice Agent', requiredTier: 'hunter', icon: 'phone-call' }
```

### 2c. UI Screens

#### View 1: Voice Agent Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  📞 AI Voice Agent                    [+ New Campaign]      │
├─────────────────────────────────────────────────────────────┤
│  Credits: 🪙 45 call credits remaining                      │
│  Today's Window: 10:00 AM - 7:00 PM IST                    │
├─────────────────────────────────────────────────────────────┤
│  Agent Config: "S8N Web Services Agent" ✅ Active            │
│  Voice: Nova (Female, Professional) • Language: Hinglish     │
│  [Configure Agent →]                                        │
├─────────────────────────────────────────────────────────────┤
│  Active Campaign: "Restaurant Website Pitch"                 │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Total: 25 leads  |  Dialed: 18  |  Answered: 12 │     │
│  │  Interested: 4  |  Callback: 3  |  Not Int: 5    │     │
│  │  ████████████████████████████████░░░░░ 72% done   │     │
│  │                                                    │     │
│  │  [Pause] [View Results] [Download Report]          │     │
│  └──────────────────────────────────────────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  Recent Call Log                                            │
│  ┌─────────────────────────────────────────────────┐       │
│  │ 🟢 Dr. Mehta  | 2:45 min | INTERESTED           │       │
│  │    "Wants proposal by Friday" | [Play 🔊] [📄]   │       │
│  │ 🔵 Sharma Law | 1:20 min | CALLBACK              │       │
│  │    "Call back Wednesday 3PM" | [Play 🔊] [📄]    │       │
│  │ 🔴 Fresh Bites | 0:15 min | NOT INTERESTED       │       │
│  │    "Already has a vendor" | [Play 🔊] [📄]       │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

#### View 2: Agent Configuration
```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Configure Voice Agent                            [×]    │
├─────────────────────────────────────────────────────────────┤
│  Agent Name: [S8N Web Services Agent          ]             │
│                                                             │
│  Voice:                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│  │ Nova │ │Alloy │ │ Echo │ │Shimmer│                      │
│  │  ♀️  │ │  ⚡  │ │  ♂️  │ │  ♀️  │                      │
│  │[Play]│ │[Play]│ │[Play]│ │[Play] │                      │
│  └──────┘ └──────┘ └──────┘ └──────┘                      │
│                                                             │
│  Language: [Hinglish ▼]  Speed: [Normal ▼]                  │
│                                                             │
│  Opening Line:                                              │
│  [Hi {{name}}, I'm calling from S8N Technologies.     ]     │
│  [We help businesses like {{category}} build their    ]     │
│  [online presence. Do you have 2 minutes?             ]     │
│                                                             │
│  Qualification Questions:                                   │
│  1. [Are you the owner/decision maker?        ] [🗑️]       │
│  2. [Do you currently have a website?         ] [🗑️]       │
│  3. [How do customers usually find you?       ] [🗑️]       │
│  [+ Add Question]                                           │
│                                                             │
│  Objection Handling:                                        │
│  "Not interested" → [I understand. Many of our         ]    │
│                      [clients felt the same way before  ]    │
│                      [seeing the ROI. Would a free      ]    │
│                      [website audit change your mind?   ]    │
│  [+ Add Objection]                                          │
│                                                             │
│  [Test Call to My Number →]  [Save Configuration]           │
└─────────────────────────────────────────────────────────────┘
```

#### View 3: Live Call View
```
┌─────────────────────────────────────────────────────────────┐
│  📞 LIVE CALL — Dr. Mehta Clinic                            │
│  Duration: 1:45  •  Status: ANSWERED  •  Sentiment: 😊      │
├─────────────────────────────────────────────────────────────┤
│  ┌─ Live Transcript ──────────────────────────────────┐    │
│  │  🤖 Agent: "Hi Dr. Mehta, I'm calling from S8N     │    │
│  │     Technologies. We help healthcare practices      │    │
│  │     build their online presence..."                 │    │
│  │                                                     │    │
│  │  👤 Dr. Mehta: "Yes, tell me more. We've been       │    │
│  │     thinking about getting a website."              │    │
│  │                                                     │    │
│  │  🤖 Agent: "That's great to hear! We actually       │    │
│  │     analyzed your Google listing and noticed        │    │
│  │     you have 120 reviews with a 4.5 rating..."     │    │
│  │                                                     │    │
│  │  👤 Dr. Mehta: "How much would it cost?"            │    │
│  │                                                     │    │
│  │  🤖 Agent: "Our healthcare website packages         │    │
│  │     start from ₹15,000..."  ⏳ typing...            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  AI Suggestions: [Mention competitor has website]           │
│                  [Offer free audit]                          │
│                                                             │
│  [🔇 Mute] [⏸️ Pause Agent] [📝 Add Note] [🔴 End Call]    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. User Walkthrough Flow

1. **Setup**: Configure agent voice, persona, opening script, objection handling
2. **Test**: "Test Call to My Number" — user receives AI call to experience it
3. **Campaign**: Create campaign → Select leads → Set schedule
4. **TRAI Check**: System validates calling hours (10AM-7PM IST), checks DNC registry
5. **Execute**: AI calls leads autonomously during business hours
6. **Monitor**: Live transcript view for ongoing calls
7. **Results**: Full transcript, sentiment analysis, action items per call
8. **Auto-CRM**: Interested leads auto-moved to "Interested" in CRM pipeline

---

## 4. Animation & Engagement Design

| Element | Animation | Details |
|:---|:---|:---|
| Live transcript | Typewriter with cursor blink | Text appears word-by-word during live call |
| Voice waveform | Real-time audio visualization | Animated bars responding to voice amplitude |
| Sentiment emoji | Smooth morph | 😐→😊→😄 transitions smoothly based on sentiment |
| Call status ring | Pulsing ring | Green pulse during connected call |
| Campaign progress | Animated donut chart | Segments fill as calls complete |
| Credit deduction | Coin drop animation | 🪙 icon drops and counter decrements |
| Test call button | Phone ring animation | 📞 icon shakes like a ringing phone |
| Agent config voices | Audio preview waveform | Play button shows mini waveform animation |

---

## 5. Tier Gating

| Tier | Voice Credits/Month | Concurrent Calls | Agent Configs | Live Monitoring |
|:---|:---|:---|:---|:---|
| Free | 0 | — | — | ❌ |
| Scout | 0 (scripts only) | — | — | ❌ |
| Hunter | 25 | 1 | 2 | ✅ |
| Agency | 100 | 3 | Unlimited | ✅ + Coaching |

---

## 6. Innovation

- **Human Takeover**: During a live AI call, the user can click "Take Over" to seamlessly switch from AI to human mid-conversation — the AI hands off context.
- **Call-to-Sequence Bridge**: When AI identifies interest, auto-enroll lead into email sequence with reference: "As discussed on our call..."
- **Hinglish Natural Speech**: Train voice agent to naturally code-switch between Hindi and English — how Indian business conversations actually happen.
- **Post-Call Auto-Actions**: Based on call outcome: Interested → auto-generate proposal PDF; Callback → auto-schedule follow-up; Not Interested → remove from campaign.
- **Call Analytics Dashboard**: Track which opening lines, objection responses, and qualification questions perform best across all campaigns.
