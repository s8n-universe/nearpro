import { supabase } from '../supabase.js';
import { State } from '../state.js';
import { safeApiCall } from './apiHelpers.js';

export const DealsApi = {
    // 1. Fetch deal intelligence reports for a lead (Fixed M3 fake intelligence fallback)
    async getDealIntelligence(savedLeadId) {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('deal_intelligence')
                    .select('*')
                    .eq('saved_lead_id', savedLeadId)
                    .maybeSingle();
                if (error) throw error;
                
                // Hardening: Return null instead of fake intelligence metrics,
                // allowing the UI component (LeadCRM.js) to show a real pending state.
                return data || null;
            },
            null,
            { contextName: 'Fetch Deal Intelligence' }
        );
    },

    // 2. Fetch pipeline aggregated summary statistics (Fixed M3 fake balance fallback)
    async getPipelineSummary() {
        if (!State.user) return null;
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('pipeline_summary')
                    .select('*')
                    .eq('user_id', State.user.id)
                    .maybeSingle();
                if (error) throw error;

                // Hardening: Return a zeroed/default state if no pipeline records exist,
                // instead of fake hardcoded 420,000 INR balances.
                if (!data) {
                    return {
                        total_pipeline_value: 0,
                        weighted_pipeline: 0,
                        win_rate: 0,
                        forecast_revenue: 0,
                        is_empty: true
                    };
                }
                return data;
            },
            null,
            { contextName: 'Fetch Pipeline Summary' }
        );
    },

    // 3. Fetch deal activity log (Fixed M3 fake log fallback)
    async getDealActivityLog(savedLeadId) {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('deal_activity_log')
                    .select('*')
                    .eq('saved_lead_id', savedLeadId)
                    .order('created_at', { ascending: false })
                    .limit(50); // Pagination guard
                if (error) throw error;

                // Hardening: Return real empty logs if none exist instead of fake timeline events.
                return data || [];
            },
            [],
            { contextName: 'Fetch Deal Activity' }
        );
    },

    // 4. Update deal metrics inside Supabase
    async updateLeadDealMetrics(savedLeadId, metrics) {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('saved_leads')
                    .update({
                        deal_value: metrics.deal_value,
                        expected_close_date: metrics.expected_close_date
                    })
                    .eq('id', savedLeadId)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Update Deal Metrics' }
        );
    }
};
