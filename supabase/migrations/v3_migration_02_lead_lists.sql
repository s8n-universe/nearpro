-- v3_migration_02_lead_lists.sql
-- User created collections of saved professionals

CREATE TABLE IF NOT EXISTS lead_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#ffa000',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lead_lists ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users manage own lists"
        ON lead_lists FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
