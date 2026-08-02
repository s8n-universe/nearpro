import { supabase } from '../supabase.js';
import { State } from '../state.js';
import { safeApiCall, atomicDecrement } from './apiHelpers.js';

export const EnrichmentApi = {
    // 1. Fetch available enrichment providers
    async getProviders() {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('enrichment_providers')
                    .select('*')
                    .order('priority', { ascending: true });
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Providers' }
        );
    },

    // 2. Save user-specific API key for a provider
    async saveUserApiKey(providerId, apiKey) {
        if (!State.user) throw new Error("User must be logged in to configure keys");
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('user_enrichment_keys')
                    .upsert([{
                        user_id: State.user.id,
                        provider_id: providerId,
                        encrypted_api_key: apiKey, // Simulated client transit
                        is_active: true,
                        last_used_at: new Date().toISOString()
                    }], { onConflict: 'user_id,provider_id' })
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Save API Key' }
        );
    },

    // 3. Fetch connected API keys
    async getUserKeys() {
        if (!State.user) return [];
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('user_enrichment_keys')
                    .select('*')
                    .eq('user_id', State.user.id);
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Connected Keys' }
        );
    },

    // 4. Fetch recent enrichment jobs
    async getEnrichmentJobs() {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('enrichment_jobs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50); // Pagination guard
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Enrichment Jobs' }
        );
    },

    // 5. Create an enrichment job with budget/credits validation & atomic operations
    async createEnrichmentJob(jobType, totalLeads) {
        if (!State.user) throw new Error("User must be logged in to create jobs");
        
        // Hardening: Pre-check credit limit budget
        const currentCredits = State.profile?.enrichment_credits || 0;
        if (currentCredits < totalLeads) {
            throw new Error(`Insufficient credits. Required: ${totalLeads}, Available: ${currentCredits}. Please upgrade your tier.`);
        }

        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('enrichment_jobs')
                    .insert([{
                        user_id: State.user.id,
                        job_type: jobType,
                        status: 'pending',
                        total_leads: totalLeads,
                        credits_consumed: totalLeads
                    }])
                    .select()
                    .single();
                if (error) throw error;

                // Autohealing: Atomic credit decrement helper
                await atomicDecrement('profiles', State.user.id, 'enrichment_credits', totalLeads);
                
                // Update local state budget to prevent mismatch
                if (State.profile) {
                    State.profile.enrichment_credits = Math.max(0, currentCredits - totalLeads);
                    State.notify();
                }

                // Add ledger record for auditable tracking
                await supabase
                    .from('enrichment_credit_ledger')
                    .insert([{
                        user_id: State.user.id,
                        amount: -totalLeads,
                        transaction_type: 'USAGE',
                        reference_job_id: data.id,
                        balance_after: Math.max(0, currentCredits - totalLeads)
                    }]);

                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Create Enrichment Job' }
        );
    },

    // 6. Update enrichment job details
    async updateEnrichmentJob(id, patch) {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('enrichment_jobs')
                    .update(patch)
                    .eq('id', id)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Update Enrichment Job' }
        );
    },

    // 7. Get enrichment stats overview
    async getEnrichmentStats() {
        if (!State.user) return null;
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .rpc('get_enrichment_stats', { p_user_id: State.user.id });
                if (error) throw error;
                return data;
            },
            null,
            { contextName: 'Fetch Enrichment Stats' }
        );
    },

    // 8. Run Waterfall Enrichment Simulation (with master table pollution safeguards)
    async runWaterfallEnrichment(jobId, leads) {
        if (!State.user) throw new Error("User must be logged in to run enrichment");

        return safeApiCall(
            async () => {
                // 1. Get active keys to see what providers the user has configured
                const keys = await this.getUserKeys();
                const activeProviderIds = keys.map(k => k.provider_id);

                // 2. Fetch all providers to establish the cascade order
                const providers = await this.getProviders();

                const results = [];
                let enrichedCount = 0;
                let failedCount = 0;
                let skippedCount = 0;

                for (const lead of leads) {
                    const p = lead.professionals || lead;
                    
                    // Skip if lead is already complete
                    if (p.email && p.phone) {
                        skippedCount++;
                        continue;
                    }

                    let foundEmail = p.email || null;
                    let foundPhone = p.phone || null;
                    const trail = [];

                    // Run waterfall cascade
                    for (const provider of providers) {
                        if (provider.name === 'smtp_validator' && !foundEmail) {
                            const start = performance.now();
                            // Simulated lookup if free provider is active
                            foundEmail = `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`;
                            trail.push({ provider: provider.display_name, field: 'email', found: true, ms: Math.round(performance.now() - start) });
                        }

                        if (provider.name === 'hunter' && activeProviderIds.includes(provider.id) && !foundEmail) {
                            const start = performance.now();
                            foundEmail = `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@${p.website ? p.website.replace('www.', '').trim() : 'domain.com'}`;
                            trail.push({ provider: provider.display_name, field: 'email', found: true, ms: Math.round(performance.now() - start) });
                        }

                        if (provider.name === 'apollo' && activeProviderIds.includes(provider.id) && !foundEmail) {
                            const start = performance.now();
                            foundEmail = `contact@${p.website ? p.website.replace('www.', '').trim() : 'domain.com'}`;
                            trail.push({ provider: provider.display_name, field: 'email', found: true, ms: Math.round(performance.now() - start) });
                        }
                    }

                    const isSuccess = !!(foundEmail || foundPhone);
                    if (isSuccess) {
                        enrichedCount++;
                    } else {
                        failedCount++;
                    }

                    // Save detailed results to enrichment_results table
                    const { data: res } = await supabase
                        .from('enrichment_results')
                        .insert([{
                            job_id: jobId,
                            professional_id: p.id,
                            user_id: State.user.id,
                            enriched_email: foundEmail,
                            enriched_phone: foundPhone,
                            confidence_score: isSuccess ? 85 : 0,
                            provider_trail: trail,
                            status: isSuccess ? 'enriched' : 'no_data',
                            enriched_at: new Date().toISOString()
                        }])
                        .select()
                        .single();
                    
                    // Autohealing: Update saved_leads (the user's private workspace view) 
                    // instead of polluting the master professionals table with mock simulated emails.
                    if (lead.saved_lead_id || lead.id) {
                        const targetId = lead.saved_lead_id || lead.id;
                        await supabase
                            .from('saved_leads')
                            .update({
                                notes: `[Clay Waterfall Enrichment] Enriched Email: ${foundEmail || 'N/A'}. Confidence: 85%`,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', targetId);
                    }

                    // For the shared professionals table, we only flag the metadata status to prevent data contamination
                    await supabase
                        .from('professionals')
                        .update({
                            enrichment_status: isSuccess ? 'enriched' : 'failed',
                            enrichment_confidence: isSuccess ? 85 : 0,
                            last_enriched_at: new Date().toISOString()
                        })
                        .eq('id', p.id);

                    results.push(res);
                }

                // Update job status
                await this.updateEnrichmentJob(jobId, {
                    status: 'completed',
                    enriched_count: enrichedCount,
                    failed_count: failedCount,
                    skipped_count: skippedCount,
                    completed_at: new Date().toISOString()
                });

                return results;
            },
            [],
            { shouldThrow: true, contextName: 'Execute Enrichment waterfall' }
        );
    }
};
