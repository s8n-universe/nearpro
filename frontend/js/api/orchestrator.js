import { supabase } from '../supabase.js';
import { State } from '../state.js';
import { safeApiCall } from './apiHelpers.js';

export const OrchestratorApi = {
    // 1. Fetch available outreach channels
    async getChannelAccounts() {
        if (!State.user) return [];
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('channel_accounts')
                    .select('*')
                    .eq('user_id', State.user.id);
                if (error) throw error;

                // Hardening (M1): If no accounts are found in the DB, return demoware placeholders
                // WITHOUT polluting the remote database with permanent auto-inserts.
                if (!data || data.length === 0) {
                    return [
                        {
                            id: 'demo-smtp-channel',
                            user_id: State.user.id,
                            channel_type: 'email',
                            account_name: 'Primary SMTP (hello@domain.com) [DEMO]',
                            status: 'connected',
                            daily_limit: 100,
                            is_demo: true
                        },
                        {
                            id: 'demo-whatsapp-channel',
                            user_id: State.user.id,
                            channel_type: 'whatsapp',
                            account_name: 'WhatsApp Business API (+91 98765 XXXXX) [DEMO]',
                            status: 'connected',
                            daily_limit: 250,
                            is_demo: true
                        }
                    ];
                }

                return data || [];
            },
            [],
            { contextName: 'Fetch Channel Accounts' }
        );
    },

    // 2. Add or update channel accounts configuration
    async saveChannelAccount(account) {
        if (!State.user) throw new Error("User must be logged in to configure channels");
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('channel_accounts')
                    .upsert([{
                        user_id: State.user.id,
                        channel_type: account.channel_type,
                        account_name: account.account_name,
                        config: account.config || {},
                        status: 'connected',
                        daily_limit: account.daily_limit || 50
                    }], { onConflict: 'user_id,channel_type,account_name' })
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Save Channel Account' }
        );
    },

    // 3. Fetch orchestration logs
    async getOrchestrationEvents() {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('orchestration_events')
                    .select('*')
                    .order('occurred_at', { ascending: false })
                    .limit(50); // Pagination guard
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Orchestrator Events' }
        );
    },

    // 4. Fetch performance stats (Dynamic date logic and mock data safety)
    async getChannelPerformance() {
        if (!State.user) return [];
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('channel_performance')
                    .select('*')
                    .eq('user_id', State.user.id);
                if (error) throw error;

                // Hardening (M2, L2): Return simulated data in-memory without database injection.
                // Uses dynamic year-month period string instead of hardcoded 2026-08.
                if (!data || data.length === 0) {
                    const currentPeriod = new Date().toISOString().slice(0, 7); // e.g. "2026-08"
                    return [
                        {
                            user_id: State.user.id,
                            channel_type: 'email',
                            period: currentPeriod,
                            total_sent: 247,
                            total_delivered: 242,
                            total_opened: 153,
                            total_replied: 30,
                            total_bounced: 5,
                            avg_response_time_h: 8.5,
                            is_demo: true
                        },
                        {
                            user_id: State.user.id,
                            channel_type: 'whatsapp',
                            period: currentPeriod,
                            total_sent: 89,
                            total_delivered: 89,
                            total_opened: 85,
                            total_replied: 25,
                            total_bounced: 0,
                            avg_response_time_h: 2.1,
                            is_demo: true
                        }
                    ];
                }

                return data || [];
            },
            [],
            { contextName: 'Fetch Channel Performance' }
        );
    }
};
