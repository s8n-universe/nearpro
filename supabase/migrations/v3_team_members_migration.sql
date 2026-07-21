-- =============================================================================
-- NearPro v3 — Team Members & Profile Enrichment Migration
-- =============================================================================
-- Adds:
--   1. team_members table for workspace collaboration
--   2. Missing profile columns for integration settings & personalization
-- =============================================================================

-- =============================================
-- STEP 1: CREATE team_members TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS team_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    email           TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'sales',
    status          TEXT NOT NULL DEFAULT 'invited',  -- 'invited', 'active', 'revoked'
    invited_at      TIMESTAMPTZ DEFAULT NOW(),
    accepted_at     TIMESTAMPTZ,
    UNIQUE(workspace_owner_id, email)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Owner can manage their own team members
DO $$ BEGIN
    CREATE POLICY "Owners manage own team members"
        ON team_members FOR ALL
        USING (auth.uid() = workspace_owner_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Team members can read their own invitation rows
DO $$ BEGIN
    CREATE POLICY "Members can read own invitations"
        ON team_members FOR SELECT
        USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_team_members_owner ON team_members(workspace_owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);


-- =============================================
-- STEP 2: ADD MISSING PROFILE COLUMNS
-- =============================================
-- These columns are referenced by Edge Functions and Settings page
-- but were never formally added via migration

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS booking_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sender_service_blurb TEXT;


-- =============================================
-- DONE
-- =============================================
-- Verify: SELECT count(*) FROM information_schema.tables WHERE table_name = 'team_members';
-- Verify: SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('portfolio_url', 'booking_url', 'sender_service_blurb');
