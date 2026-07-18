-- Migration 00: Ensure anonymous_trials table exists (needed by existing code)
-- and add the tier column to profiles that the current frontend expects.

-- anonymous_trials table
CREATE TABLE IF NOT EXISTS public.anonymous_trials (
    fingerprint TEXT PRIMARY KEY,
    started_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.anonymous_trials ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Allow public read access to trials" ON public.anonymous_trials
        FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public insert access to trials" ON public.anonymous_trials
        FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add tier column to profiles (the current frontend already references it)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';
