-- Create master coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    code TEXT PRIMARY KEY,
    discount_percent NUMERIC NOT NULL DEFAULT 100.0,
    target_tier TEXT NOT NULL DEFAULT 'scout',
    max_redemptions INT NOT NULL DEFAULT 100,
    redemption_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Allow public read access to coupons
CREATE POLICY "Allow public read access to coupons" ON public.coupons
    FOR SELECT USING (true);

-- Insert master campaign coupon LAUNCH100
INSERT INTO public.coupons (code, discount_percent, target_tier, max_redemptions, redemption_count, is_active)
VALUES ('LAUNCH100', 100.0, 'scout', 100, 0, TRUE)
ON CONFLICT (code) DO UPDATE SET max_redemptions = 100, is_active = TRUE;

-- Create coupon redemptions log table
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_code TEXT REFERENCES public.coupons(code),
    user_id UUID REFERENCES auth.users(id),
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_coupon UNIQUE (coupon_code, user_id)
);

-- Enable RLS
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to redemptions" ON public.coupon_redemptions
    FOR SELECT USING (true);

-- Allow authenticated insert
CREATE POLICY "Allow auth insert to redemptions" ON public.coupon_redemptions
    FOR INSERT WITH CHECK (true);

-- Atomic Function: Get Coupon Status
CREATE OR REPLACE FUNCTION public.get_coupon_status(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_coupon public.coupons%ROWTYPE;
BEGIN
    SELECT * INTO v_coupon FROM public.coupons WHERE UPPER(code) = UPPER(p_code);
    
    IF NOT FOUND OR NOT v_coupon.is_active THEN
        RETURN jsonb_build_object('valid', false, 'message', 'Invalid or expired coupon.');
    END IF;

    RETURN jsonb_build_object(
        'valid', true,
        'code', v_coupon.code,
        'discount_percent', v_coupon.discount_percent,
        'target_tier', v_coupon.target_tier,
        'max_redemptions', v_coupon.max_redemptions,
        'redemption_count', v_coupon.redemption_count,
        'remaining', GREATEST(0, v_coupon.max_redemptions - v_coupon.redemption_count)
    );
END;
$$;

-- Atomic Function: Apply Coupon Code
CREATE OR REPLACE FUNCTION public.apply_coupon_code(p_code TEXT, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_coupon public.coupons%ROWTYPE;
    v_already_used INT;
BEGIN
    -- Lock row for concurrency safety
    SELECT * INTO v_coupon FROM public.coupons WHERE UPPER(code) = UPPER(p_code) FOR UPDATE;

    IF NOT FOUND OR NOT v_coupon.is_active THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid or inactive coupon code.');
    END IF;

    IF v_coupon.redemption_count >= v_coupon.max_redemptions THEN
        RETURN jsonb_build_object('success', false, 'message', 'Coupon limit reached! All 100 free Scout plans have been claimed.');
    END IF;

    SELECT COUNT(*) INTO v_already_used FROM public.coupon_redemptions 
    WHERE coupon_code = v_coupon.code AND user_id = p_user_id;

    IF v_already_used > 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'You have already claimed this free Scout plan coupon!');
    END IF;

    -- Insert redemption log
    INSERT INTO public.coupon_redemptions (coupon_code, user_id) VALUES (v_coupon.code, p_user_id);

    -- Increment usage counter
    UPDATE public.coupons SET redemption_count = redemption_count + 1 WHERE code = v_coupon.code;

    -- Upgrade user tier to Scout in profiles
    UPDATE public.profiles 
    SET subscription_tier = v_coupon.target_tier, tier = v_coupon.target_tier, applied_coupon = v_coupon.code, updated_at = NOW() 
    WHERE id = p_user_id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Congratulations! Coupon LAUNCH100 applied successfully. Scout Plan unlocked for FREE!',
        'tier', v_coupon.target_tier,
        'remaining', GREATEST(0, v_coupon.max_redemptions - (v_coupon.redemption_count + 1))
    );
END;
$$;
