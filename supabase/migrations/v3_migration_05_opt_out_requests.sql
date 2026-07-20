-- Migration: Create Opt-Out Requests Table for DPDP 2023 Compliance
CREATE TABLE IF NOT EXISTS public.opt_out_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    request_category TEXT NOT NULL DEFAULT 'sole_proprietor',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'under_review', 'completed', 'rejected'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by ticket_id or status
CREATE INDEX IF NOT EXISTS idx_opt_out_ticket_id ON public.opt_out_requests(ticket_id);
CREATE INDEX IF NOT EXISTS idx_opt_out_status ON public.opt_out_requests(status);
CREATE INDEX IF NOT EXISTS idx_opt_out_phone ON public.opt_out_requests(phone);

-- Enable Row Level Security
ALTER TABLE public.opt_out_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert an opt-out request (Public form access)
CREATE POLICY "Allow public insert to opt_out_requests" 
    ON public.opt_out_requests 
    FOR INSERT 
    WITH CHECK (true);

-- Policy: Only service role / authenticated admins can view requests
CREATE POLICY "Allow admin read access to opt_out_requests" 
    ON public.opt_out_requests 
    FOR SELECT 
    USING (auth.role() = 'authenticated');
