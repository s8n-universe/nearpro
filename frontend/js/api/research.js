import { supabase } from '../supabase.js';
import { State } from '../state.js';
import { safeApiCall, atomicIncrement, atomicDecrement } from './apiHelpers.js';

export const ResearchApi = {
    // 1. Fetch existing research report
    async getResearchReport(professionalId) {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('research_reports')
                    .select('*')
                    .eq('professional_id', professionalId)
                    .maybeSingle();
                if (error) throw error;
                return data;
            },
            null,
            { contextName: 'Fetch Research Report' }
        );
    },

    // 2. Fetch recent jobs
    async getResearchJobs(professionalId) {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('research_jobs')
                    .select('*')
                    .eq('professional_id', professionalId)
                    .order('created_at', { ascending: false })
                    .limit(20); // Pagination guard
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Research Jobs' }
        );
    },

    // 3. Start a new research job
    async startResearchJob(professionalId, scope = ["website", "social", "news", "tech"]) {
        if (!State.user) throw new Error("User must be logged in to trigger research");

        // Hardening: Pre-check monthly research quota
        const used = State.profile?.monthly_research_used || 0;
        const limit = State.profile?.monthly_research_limit || 25;
        if (used >= limit) {
            throw new Error(`Monthly research quota exceeded (${used}/${limit}). Please upgrade your plan.`);
        }

        return safeApiCall(
            async () => {
                // Insert job record
                const { data: job, error: jobError } = await supabase
                    .from('research_jobs')
                    .insert([{
                        user_id: State.user.id,
                        professional_id: professionalId,
                        status: 'researching',
                        scope,
                        started_at: new Date().toISOString()
                    }])
                    .select()
                    .single();
                if (jobError) throw jobError;

                // Autohealing: Atomic increment of monthly_research_used
                await atomicIncrement('profiles', State.user.id, 'monthly_research_used', 1);
                
                if (State.profile) {
                    State.profile.monthly_research_used = used + 1;
                    State.notify();
                }

                return job;
            },
            null,
            { shouldThrow: true, contextName: 'Start Research Job' }
        );
    },

    // 4. Refund research credits on job failure
    async refundResearchCredit() {
        if (!State.user) return;
        return safeApiCall(
            async () => {
                await atomicDecrement('profiles', State.user.id, 'monthly_research_used', 1);
                if (State.profile) {
                    State.profile.monthly_research_used = Math.max(0, (State.profile.monthly_research_used || 1) - 1);
                    State.notify();
                }
            },
            null,
            { silent: true, contextName: 'Refund Research Credit' }
        );
    },

    // 5. Simulate Drip Crawler agent logic steps and save findings report
    async saveCompletedResearchReport(jobId, professionalId, businessName, website) {
        if (!State.user) throw new Error("User must be logged in to save reports");

        const cleanDomain = website ? website.replace('www.', '').replace('https://', '').replace('http://', '').split('/')[0].trim() : 'domain.com';

        return safeApiCall(
            async () => {
                const report = {
                    job_id: jobId,
                    professional_id: professionalId,
                    user_id: State.user.id,
                    company_summary: `Established enterprise specializing in local services. Located in Mumbai with a highly active customer footprint and solid reputation indicators.`,
                    industry_vertical: 'Local Business Services',
                    founding_year: 2016,
                    team_size_estimate: '6-20 employees',
                    key_people: [
                        { name: 'Karan Sharma', title: 'Managing Director', linkedin: `https://linkedin.com/in/karan-sharma-${cleanDomain.split('.')[0]}` }
                    ],
                    tech_stack: ['WordPress', 'Elementor Builder', 'Google Tag Manager', 'Google Fonts'],
                    cms_platform: 'wordpress',
                    has_blog: false,
                    has_ecommerce: false,
                    ssl_valid: true,
                    mobile_responsive: Math.random() > 0.3,
                    last_updated_est: 'Recently updated (within 30 days)',
                    social_profiles: {
                        instagram: { url: `https://instagram.com/${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`, followers: 1240, active: true },
                        facebook: { url: `https://facebook.com/${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`, followers: 480, active: false }
                    },
                    total_social_reach: 1720,
                    social_activity: 'moderate',
                    recent_news: [
                        { title: `${businessName} expands service branches across suburban Mumbai region.`, sentiment: 'positive', date: '1 month ago' }
                    ],
                    hiring_signals: [
                        { role: 'Customer Relationship Executive', platform: 'Indeed', posted_date: '5 days ago' }
                    ],
                    identified_pain_points: [
                        'Slow mobile page load speeds (takes over 4 seconds on 4G networks)',
                        'No visible digital appointment scheduler or contact booking form on the homepage',
                        'Minimal posting activity on their Facebook page (dormant since 4 months ago)'
                    ],
                    outreach_angles: [
                        'Propose an optimized mobile page speed redesign using React/Vite to reduce bounce rates.',
                        'Pitch custom integration of Calendly or Google Calendar booking widgets directly on the hero panel.',
                        'Offer social media management packages for Facebook reels to capture local lead referrals.'
                    ],
                    competitors: [
                        { name: `${businessName.split(' ')[0]} Hub`, advantage: 'Stronger organic local SEO rankings.' }
                    ],
                    market_position: 'niche',
                    review_sentiment: 'positive',
                    common_praises: ['Professional customer service', 'Reasonable rates', 'Courteous staff members'],
                    common_complaints: ['Slightly delayed peak hours waiting times', 'Parking spaces availability'],
                    intent_score: 75,
                    readiness_score: 68
                };

                try {
                    // Hardening: Upsert with 'professional_id,user_id' matching the new UNIQUE constraint
                    const { data: res, error: reportError } = await supabase
                        .from('research_reports')
                        .upsert([report], { onConflict: 'professional_id,user_id' })
                        .select()
                        .single();
                    if (reportError) throw reportError;

                    // Mark job as completed
                    await supabase
                        .from('research_jobs')
                        .update({
                            status: 'completed',
                            completed_at: new Date().toISOString(),
                            duration_ms: 8000,
                            pages_visited: 4
                        })
                        .eq('id', jobId);

                    return res;
                } catch (err) {
                    // AUTOHEALING: If saving report fails, mark job failed and refund credit
                    console.error("[Autohealing] Refunding research credit due to report completion failure:", err);
                    await supabase
                        .from('research_jobs')
                        .update({
                            status: 'failed',
                            completed_at: new Date().toISOString()
                        })
                        .eq('id', jobId);
                    await this.refundResearchCredit();
                    throw err; // Re-throw to inform client
                }
            },
            null,
            { shouldThrow: true, contextName: 'Complete Research Report' }
        );
    }
};
