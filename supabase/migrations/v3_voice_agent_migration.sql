-- Add voice_call_credits column to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS voice_call_credits INTEGER DEFAULT 0;

-- 1. VOICE CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS voice_campaigns (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount                INTEGER NOT NULL,            -- Positive for purchase, negative for deduction
  transaction_type      TEXT NOT NULL,               -- PURCHASE | DEDUCTION | REFUND | BONUS
  reference_call_id     UUID,
  balance_after         INTEGER NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TRAI COMPLIANCE AUDIT LOG
CREATE TABLE IF NOT EXISTS call_audit_log (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id           UUID REFERENCES voice_campaigns(id) ON DELETE SET NULL,
  called_number_hash    TEXT NOT NULL,               -- SHA-256 for DPDP privacy
  initiated_by_user     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id       UUID REFERENCES professionals(id) ON DELETE SET NULL,
  saved_lead_id         UUID REFERENCES saved_leads(id) ON DELETE SET NULL,
  
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
  opt_out_requested     BOOLEAN DEFAULT FALSE,
  opt_out_at            TIMESTAMPTZ
);

-- SECURITY & RLS POLICIES
ALTER TABLE voice_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_dnc_suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_audit_log ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation RLS Policies (Safely drop existing before creating)
DROP POLICY IF EXISTS "Users view own campaigns" ON voice_campaigns;
CREATE POLICY "Users view own campaigns" ON voice_campaigns FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own credit ledger" ON voice_credit_ledger;
CREATE POLICY "Users view own credit ledger" ON voice_credit_ledger FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own call logs" ON call_audit_log;
CREATE POLICY "Users view own call logs" ON call_audit_log FOR SELECT USING (auth.uid() = initiated_by_user);

DROP POLICY IF EXISTS "Global DNC viewable by pre-call gate" ON global_dnc_suppression_list;
CREATE POLICY "Global DNC viewable by pre-call gate" ON global_dnc_suppression_list FOR SELECT USING (true);

-- Service Role Full Access Policies
DROP POLICY IF EXISTS "Service Role full access campaigns" ON voice_campaigns;
CREATE POLICY "Service Role full access campaigns" ON voice_campaigns USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role full access ledger" ON voice_credit_ledger;
CREATE POLICY "Service Role full access ledger" ON voice_credit_ledger USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role full access logs" ON call_audit_log;
CREATE POLICY "Service Role full access logs" ON call_audit_log USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role full access DNC" ON global_dnc_suppression_list;
CREATE POLICY "Service Role full access DNC" ON global_dnc_suppression_list USING (true) WITH CHECK (true);

-- Compliance & audit log performance indexes
CREATE INDEX IF NOT EXISTS idx_call_audit_user ON call_audit_log(initiated_by_user, initiated_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_audit_number ON call_audit_log(called_number_hash, initiated_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_audit_status ON call_audit_log(call_status, initiated_at DESC);

-- GIN full-text index on transcript search (using path or transcript field)
CREATE INDEX IF NOT EXISTS idx_call_transcript_fts ON call_audit_log USING GIN(to_tsvector('english', coalesce(transcript_path, '')));

-- decrement_credits RPC function
CREATE OR REPLACE FUNCTION decrement_credits(amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance integer;
BEGIN
  UPDATE profiles
  SET voice_call_credits = COALESCE(voice_call_credits, 0) - amount
  WHERE id = auth.uid()
  RETURNING voice_call_credits INTO new_balance;
  RETURN new_balance;
END;
$$;

-- Campaign Counter RPC Functions
CREATE OR REPLACE FUNCTION increment_campaign_dialed(campaign_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE voice_campaigns
  SET dialed_count = COALESCE(dialed_count, 0) + 1
  WHERE id = campaign_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION increment_campaign_answered(campaign_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE voice_campaigns
  SET answered_count = COALESCE(answered_count, 0) + 1
  WHERE id = campaign_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION increment_campaign_interested(campaign_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE voice_campaigns
  SET interested_count = COALESCE(interested_count, 0) + 1
  WHERE id = campaign_uuid;
END;
$$;


