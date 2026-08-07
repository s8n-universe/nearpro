-- Migration: Add onboarding progress tracking columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_tasks_completed TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_credits_awarded BOOLEAN DEFAULT FALSE;
