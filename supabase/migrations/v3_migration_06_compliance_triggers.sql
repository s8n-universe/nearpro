-- Migration: Compliance Triggers, Unique Constraints, and Reset Functions (DPDP & Security)
-- Run order: Execute after v3_migration_05_opt_out_requests.sql

-- 1. Prevent duplicate spamming on opt-out request submissions (Fix H2)
ALTER TABLE IF EXISTS public.opt_out_requests 
ADD CONSTRAINT opt_out_requests_phone_email_key UNIQUE (phone, email);

-- 2. Compliance Auto-Redaction function & trigger
-- Automatically redacts private contact details in professionals table when opt-out is approved (status = 'completed')
CREATE OR REPLACE FUNCTION public.process_opt_out_redaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Redact listing phone and email matching the opt-out ticket
        UPDATE public.professionals
        SET phone = NULL,
            email = NULL
        WHERE (phone = NEW.phone AND NEW.phone IS NOT NULL AND NEW.phone != '')
           OR (email = NEW.email AND NEW.email IS NOT NULL AND NEW.email != '')
           OR (name ILIKE NEW.business_name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create target trigger
DROP TRIGGER IF EXISTS opt_out_redaction_trigger ON public.opt_out_requests;
CREATE TRIGGER opt_out_redaction_trigger
    AFTER UPDATE OF status ON public.opt_out_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.process_opt_out_redaction();

-- 3. Reset monthly export usage counts for subscriptions (Fix M3)
CREATE OR REPLACE FUNCTION public.reset_monthly_subscription_usages()
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET monthly_export_rows_used = 0,
        monthly_lead_unlocks_used = 0
    WHERE subscription_status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verify subscription expiry dates and revert expired tiers to free (Fix M4)
CREATE OR REPLACE FUNCTION public.check_expired_subscriptions()
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET tier = 'free',
        subscription_tier = 'free',
        subscription_status = 'expired'
    WHERE subscription_status = 'active'
      AND subscription_ends_at IS NOT NULL
      AND subscription_ends_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
