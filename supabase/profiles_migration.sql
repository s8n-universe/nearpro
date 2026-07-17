-- Create profiles table referencing auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT,
    is_premium  BOOLEAN DEFAULT FALSE,
    tier        TEXT DEFAULT 'free',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Select policy: anyone can view profile statuses
CREATE POLICY "Allow public read access to profiles" ON public.profiles
    FOR SELECT USING (true);

-- Update policy: users can modify their own details
CREATE POLICY "Allow users to update their own profiles" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Trigger function to create a profile automatically on auth registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, is_premium, tier)
    VALUES (new.id, new.email, false, 'free');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hook trigger to auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
