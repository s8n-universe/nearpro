# Feature 5: AI Research Agent (Browser-Based)

## Overview
An autonomous AI agent that, given a lead, browses their website, social media, news articles, and public directories to extract deep intelligence — tech stack, recent news, team size, pain points, funding status — before the user even looks at the lead. This is NearPro's version of Clay's "Claygent."

---

## 1. Database Schema (Supabase PostgreSQL)

### New Tables

```sql
-- 5a. Research jobs
CREATE TABLE IF NOT EXISTS research_jobs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    status              TEXT DEFAULT 'queued',        -- queued | researching | completed | failed
    agent_model         TEXT DEFAULT 'gemini-2.5-flash', -- LLM used for analysis
    
    -- Research scope
    scope               JSONB DEFAULT '["website","social","news","tech"]',
    -- ["website", "social", "news", "tech", "reviews", "competitors"]
    
    -- Timing
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    duration_ms         INTEGER,
    pages_visited       INTEGER DEFAULT 0,
    
    -- Cost
    credits_charged     INTEGER DEFAULT 1,
    tokens_used         INTEGER DEFAULT 0,
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5b. Research reports — the intelligence output
CREATE TABLE IF NOT EXISTS research_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              UUID NOT NULL REFERENCES research_jobs(id) ON DELETE CASCADE,
    professional_id     UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Company Intelligence
    company_summary     TEXT,                         -- 2-3 sentence summary
    industry_vertical   TEXT,                         -- Specific vertical
    founding_year       INTEGER,
    team_size_estimate  TEXT,                         -- '1-5', '6-20', '21-50', '50+'
    key_people          JSONB DEFAULT '[]',           -- [{name, title, linkedin}]
    
    -- Digital Presence
    tech_stack          JSONB DEFAULT '[]',           -- ['WordPress', 'WooCommerce', 'Google Analytics']
    cms_platform        TEXT,                         -- wordpress | shopify | wix | custom
    has_blog            BOOLEAN,
    has_ecommerce       BOOLEAN,
    ssl_valid           BOOLEAN,
    mobile_responsive   BOOLEAN,
    last_updated_est    TEXT,                         -- 'Recently', '6+ months ago'
    
    -- Social Presence
    social_profiles     JSONB DEFAULT '{}',           -- {instagram: {url, followers, last_post}}
    total_social_reach  INTEGER DEFAULT 0,
    social_activity     TEXT DEFAULT 'unknown',       -- active | moderate | dormant | none
    
    -- Business Signals (Buying Intent)
    recent_news         JSONB DEFAULT '[]',           -- [{title, url, date, sentiment}]
    hiring_signals      JSONB DEFAULT '[]',           -- [{role, platform, posted_date}]
    funding_signals     JSONB DEFAULT '[]',           -- [{amount, round, date, source}]
    growth_indicators   JSONB DEFAULT '[]',           -- ["New location opened", "Product launch"]
    
    -- Pain Points (for outreach personalization)
    identified_pain_points JSONB DEFAULT '[]',        -- ["Slow website", "No online booking"]
    outreach_angles     JSONB DEFAULT '[]',           -- ["Offer website redesign", "Propose SEO audit"]
    
    -- Competitive Landscape
    competitors         JSONB DEFAULT '[]',           -- [{name, url, advantage}]
    market_position     TEXT,                         -- leader | challenger | niche | emerging
    
    -- Review Intelligence
    review_sentiment    TEXT DEFAULT 'neutral',       -- positive | neutral | negative | mixed
    common_complaints   JSONB DEFAULT '[]',           -- ["Long wait times", "Parking issues"]
    common_praises      JSONB DEFAULT '[]',           -- ["Great staff", "Affordable"]
    
    -- AI-Generated Scores
    intent_score        INTEGER DEFAULT 0,            -- 0-100: How likely they need your service
    readiness_score     INTEGER DEFAULT 0,            -- 0-100: How ready they are to buy
    
    -- Raw Data
    raw_browsing_log    JSONB DEFAULT '[]',           -- [{url, extracted_data, timestamp}]
    
    -- State
    expires_at          TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Add research credits to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_research_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_research_limit INTEGER DEFAULT 0;
-- Free: 3, Scout: 25, Hunter: 100, Agency: 500
```

### RLS Policies
```sql
ALTER TABLE research_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own research jobs" ON research_jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own reports" ON research_reports FOR ALL USING (auth.uid() = user_id);
```

---

## 2. UI Design — NearPro Integration

### 2a. Integration Points (No Separate Page — Contextual)

The AI Research Agent doesn't get its own sidebar item. Instead, it integrates into existing lead views:

#### On Lead Card (`ProfessionalCard.js`)
```
┌── Lead Card ───────────────────────────────┐
│  Dr. Mehta Clinic  ⭐ 4.5 (120 reviews)    │
│  Healthcare • Andheri West                  │
│  📱 +91 98765 43210                         │
│  [🤖 AI Research] [📧 Outreach] [📊 Audit]  │  ← NEW button
└─────────────────────────────────────────────┘
```

#### On Lead Modal (`ProfessionalModal.js`) — Research Tab
```
┌─────────────────────────────────────────────────────────────┐
│  Dr. Mehta Clinic                                    [×]    │
│  [Details] [Audit] [Outreach] [🤖 AI Research]              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Company Intelligence ─────────────────────────────┐    │
│  │  "Multi-specialty clinic established in 2012.       │    │
│  │   4 doctors, 2 locations. Specializes in            │    │
│  │   dermatology and general medicine."                │    │
│  │                                                     │    │
│  │  👥 Team: 10-20 employees                           │    │
│  │  📅 Founded: 2012                                   │    │
│  │  🏢 Type: Multi-location practice                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ Digital Presence ────────────────────────────────┐     │
│  │  🌐 Website: mehtaclinic.in (WordPress 6.2)       │     │
│  │  📱 Mobile: ⚠️ Not responsive                      │     │
│  │  🔒 SSL: ✅ Valid                                   │     │
│  │  📊 Tech: WordPress, Starter theme, No analytics   │     │
│  │  📝 Blog: ❌ None                                   │     │
│  │  🛒 E-commerce: ❌                                  │     │
│  │  ⏰ Last updated: ~6 months ago                     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  ┌─ 🔥 Buying Signals ──────────────────────────────┐      │
│  │  Intent Score: ████████░░ 78/100  HIGH INTENT     │      │
│  │                                                    │      │
│  │  📢 Hiring a "Digital Marketing Executive" (3d ago)│      │
│  │  📰 Opened new Borivali branch (IndiaMART, 2w ago)│      │
│  │  ⚠️ Website down 3 times last week (uptime check)  │      │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  ┌─ 😤 Pain Points Detected ────────────────────────┐      │
│  │  1. "Slow website (3.2s load time)"               │      │
│  │  2. "No online appointment booking system"        │      │
│  │  3. "Google reviews mention 'hard to find online'"│      │
│  │  4. "Competitor Dr. Shah has 200+ Google reviews"  │      │
│  │                                                    │      │
│  │  🎯 Best Outreach Angle:                           │      │
│  │  "Pitch website redesign + online booking.         │      │
│  │   Reference competitor Dr. Shah's online presence  │      │
│  │   as the benchmark they should target."            │      │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  ┌─ 📣 Social Presence ─────────────────────────────┐      │
│  │  📸 Instagram: @mehtaclinic (450 followers, active)│     │
│  │  📘 Facebook: /mehtaclinic (320 likes, dormant)   │      │
│  │  ❌ LinkedIn: Not found                            │      │
│  │  ❌ Twitter: Not found                             │      │
│  │  Social Activity: MODERATE                         │      │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  [🔄 Re-Research]  [📧 Generate Pitch Using Research]       │
└─────────────────────────────────────────────────────────────┘
```

#### View 2: Research in Progress (Live Feed)
```
┌─────────────────────────────────────────────────────────────┐
│  🤖 AI Agent Researching: Dr. Mehta Clinic                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─ Live Agent Activity ────────────────────────────┐      │
│  │  ✅ Visiting mehtaclinic.in...                    │      │
│  │     → Detected: WordPress 6.2, PHP 8.1           │      │
│  │     → Found: 12 pages, no blog                   │      │
│  │  ✅ Checking Google Reviews...                    │      │
│  │     → 120 reviews, 4.5 avg, sentiment: positive  │      │
│  │     → Top complaint: "long wait times"            │      │
│  │  ⏳ Searching social media profiles...             │      │
│  │     → Instagram found: @mehtaclinic              │      │
│  │     → Checking Facebook...                        │      │
│  │  ⏳ Scanning for hiring signals...                 │      │
│  │     → Checking LinkedIn Jobs...                   │      │
│  │  ○  Analyzing competitors (queued)                │      │
│  │  ○  Generating pain points (queued)               │      │
│  └───────────────────────────────────────────────────┘      │
│                                                             │
│  Progress: ████████████████░░░░░░  65%  (4/6 tasks done)   │
│  Estimated: ~30 seconds remaining                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. User Walkthrough Flow

1. **Trigger**: User clicks "🤖 AI Research" on any lead card
2. **Scope Selection**: Quick modal: "What should I research?"
   - ☑ Website & tech stack
   - ☑ Social media profiles
   - ☑ Hiring signals
   - ☐ Competitor analysis (extra 1 credit)
3. **Live Feed**: Agent shows real-time progress as it browses
4. **Report**: Full intelligence report appears in lead modal
5. **Action**: User clicks "Generate Pitch Using Research" → AI Outreach uses research data to craft hyper-personalized message
6. **Cache**: Research results cached for 30 days (re-research costs another credit)

---

## 4. Backend Architecture

### Edge Function: `run-research-agent`
```
Input: professional_id, user_id, scope[]
Flow:
1. Load professional data from DB (name, website, address, category)
2. If website exists:
   a. Fetch homepage HTML (via serverless browser or fetch API)
   b. Extract: tech stack, CMS, meta tags, social links, blog presence
   c. Run Lighthouse-lite for mobile/speed assessment
3. Search Google: "{business_name} {area} {category}" 
   a. Extract: news articles, mentions, directory listings
4. Search for social profiles:
   a. Instagram: search by business name
   b. Facebook: search by business name  
   c. LinkedIn: search by business name
5. Check hiring:
   a. Search LinkedIn Jobs / Indeed for company
6. Analyze Google Reviews:
   a. Extract review text, sentiment analysis via Gemini
   b. Identify common complaints and praises
7. Gemini Analysis:
   a. Input: all gathered data
   b. Output: company_summary, pain_points, outreach_angles, intent_score
8. Save to research_reports table
9. Return report to frontend
```

---

## 5. Animation & Engagement Design

| Element | Animation | Details |
|:---|:---|:---|
| Research button | AI sparkle shimmer | Gradient shimmer sweeps across button text |
| Live feed items | Typewriter text + check marks | Text types in, ✅ pops in with scale bounce |
| Progress bar | Smooth gradient fill | Gold-to-pink gradient fills left to right |
| Intent score | Animated radial gauge | SVG arc draws from 0 to score with color gradient |
| Pain point cards | Staggered slide-in | Cards slide in from left with 100ms delay each |
| Social profile icons | Bounce-in | Icon lands with tiny bounce effect |
| Re-research button | Rotate icon | 🔄 icon does 360° spin on click |
| Report sections | Accordion expand | Sections expand with smooth height transition |

---

## 6. Tier Gating

| Tier | Monthly Research | Competitor Analysis | Batch Research | Auto-Research |
|:---|:---|:---|:---|:---|
| Free | 3 | ❌ | ❌ | ❌ |
| Scout | 25 | ❌ | 5 at a time | ❌ |
| Hunter | 100 | ✅ | 20 at a time | ❌ |
| Agency | 500 | ✅ | 50 at a time | ✅ (on CRM add) |

---

## 7. Innovation

- **Auto-Research on CRM Save**: Agency users can toggle "Auto-research every lead I save" — enrichment report ready by the time they open the lead.
- **Outreach-Research Fusion**: The "Generate Pitch Using Research" button feeds ALL research data into the outreach prompt, creating hyper-personalized messages that reference specific pain points, competitor data, and hiring signals.
- **Research Digest Email**: Weekly email to user: "Here are your top 5 highest-intent leads this week" with mini research summaries.
- **Competitive Heat Map**: For leads with competitor data, show a visual heat map of how the lead compares to their competitors across digital presence, reviews, and social reach.
- **Research History Timeline**: Track how a business changes over time — "3 months ago they had 80 reviews, now they have 120. Growth signal detected!"
