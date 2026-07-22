"""
NearPro Zoho Integration Schema Migration
Adds Zoho CRM sync fields and secures refresh tokens in a private credentials table.
"""
import psycopg2
import sys

DB_CONFIG = {
    "host": "db.qlpopdudfomjuwagjizy.supabase.co",
    "port": 5432,
    "dbname": "postgres",
    "user": "postgres",
    "password": "NearPro@210105",
}

SQL_MIGRATION = """
-- 1. Add Zoho columns to saved_leads
ALTER TABLE public.saved_leads ADD COLUMN IF NOT EXISTS zoho_lead_id TEXT;
ALTER TABLE public.saved_leads ADD COLUMN IF NOT EXISTS zoho_last_synced_at TIMESTAMPTZ;
ALTER TABLE public.saved_leads ADD COLUMN IF NOT EXISTS zoho_deal_stage TEXT;

-- 2. Add Zoho configuration columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zoho_auto_sync_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zoho_region TEXT DEFAULT 'in';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zoho_sync_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zoho_last_sync_at TIMESTAMPTZ;

-- 3. Create private table for credentials
CREATE TABLE IF NOT EXISTS public.zoho_credentials (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL,
    access_token TEXT,
    access_token_expires_at TIMESTAMPTZ,
    region TEXT DEFAULT 'in',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.zoho_credentials ENABLE ROW LEVEL SECURITY;
-- Note: No policies are created on zoho_credentials, so only the service role can access it.
"""

def execute_migration():
    print("Connecting to Supabase Database...")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = False
        cur = conn.cursor()
        
        print("Running SQL migration instructions...")
        cur.execute(SQL_MIGRATION)
        
        conn.commit()
        print("SQL migration executed and committed successfully!")
        
        # Verify columns exist
        print("Verifying saved_leads columns...")
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'saved_leads'")
        cols = [r[0] for r in cur.fetchall()]
        print(f"saved_leads columns: {cols}")
        
        print("Verifying profiles columns...")
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles'")
        prof_cols = [r[0] for r in cur.fetchall()]
        print(f"profiles columns: {prof_cols}")
        
        print("Verifying zoho_credentials exists and has RLS enabled...")
        cur.execute("SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'zoho_credentials'")
        row = cur.fetchone()
        if row:
            print(f"Table '{row[0]}' security status: RLS Enabled = {bool(row[1])}")
        else:
            print("ERROR: Table zoho_credentials was not created.")
            sys.exit(1)
            
        conn.close()
        print("Migration process finished successfully.")
        
    except Exception as err:
        print(f"Migration execution failed with error: {err}")
        sys.exit(1)

if __name__ == "__main__":
    execute_migration()
