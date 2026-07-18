-- v3_migration_03_saved_leads.sql
-- Individual lead saved to a list with CRM tracking

CREATE TABLE IF NOT EXISTS saved_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    list_id UUID REFERENCES lead_lists(id) ON DELETE SET NULL,
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'new',
    -- status values: 'new', 'contacted', 'responded', 'converted', 'not_interested', 'follow_up'
    notes TEXT,
    outreach_channel TEXT,
    -- values: 'whatsapp', 'email', 'instagram', 'phone', 'in_person'
    outreach_sent_at TIMESTAMPTZ,
    outreach_message TEXT,
    follow_up_due_at TIMESTAMPTZ,
    follow_up_sent_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES profiles(id),
    conversion_value NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, professional_id)
);

ALTER TABLE saved_leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users manage own saved leads"
        ON saved_leads FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Index for CRM pipeline queries
CREATE INDEX IF NOT EXISTS idx_saved_leads_user_status ON saved_leads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_saved_leads_followup ON saved_leads(follow_up_due_at) WHERE follow_up_due_at IS NOT NULL;
