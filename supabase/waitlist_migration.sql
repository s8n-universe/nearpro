-- Create city waitlist table for NearPro expansion tracking
CREATE TABLE IF NOT EXISTS public.city_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    requested_city TEXT NOT NULL,
    user_role TEXT DEFAULT 'Freelancer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_email_city UNIQUE (email, requested_city)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.city_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public insert access so guests and logged-in users can join the waitlist
CREATE POLICY "Allow public insert access to city_waitlist" ON public.city_waitlist
    FOR INSERT WITH CHECK (true);

-- Allow public select access to waitlist entries
CREATE POLICY "Allow public read access to city_waitlist" ON public.city_waitlist
    FOR SELECT USING (true);
