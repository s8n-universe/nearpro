import { supabase } from '../supabase.js';
import { State } from '../state.js';
import { safeApiCall } from './apiHelpers.js';

export const WarmupApi = {
    // 1. Fetch connected email accounts
    async getEmailAccounts() {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('email_accounts')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(100); // Pagination guard
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Email Accounts' }
        );
    },

    // 2. Add email account
    async createEmailAccount(account) {
        if (!State.user) throw new Error("User must be logged in to connect accounts");
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('email_accounts')
                    .insert([{
                        user_id: State.user.id,
                        email_address: account.email_address,
                        display_name: account.display_name || '',
                        provider: account.provider || 'smtp',
                        smtp_host: account.smtp_host || '',
                        smtp_port: parseInt(account.smtp_port) || 587,
                        imap_host: account.imap_host || '',
                        imap_port: parseInt(account.imap_port) || 993,
                        encrypted_password: account.encrypted_password || '', // AES simulated
                        warmup_status: account.start_warmup ? 'warming' : 'not_started',
                        warmup_started_at: account.start_warmup ? new Date().toISOString() : null,
                        dns_checked_at: new Date().toISOString()
                    }])
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Connect Email Account' }
        );
    },

    // 3. Update account parameters (e.g. status)
    async updateEmailAccount(id, patch) {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('email_accounts')
                    .update({ ...patch, updated_at: new Date().toISOString() })
                    .eq('id', id)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Update Email Account' }
        );
    },

    // 4. Delete email account
    async deleteEmailAccount(id) {
        return safeApiCall(
            async () => {
                const { error } = await supabase
                    .from('email_accounts')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
                return true;
            },
            false,
            { shouldThrow: true, contextName: 'Delete Email Account' }
        );
    },

    // 5. Query domain health checks
    async getDomainHealthReports() {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('domain_health_reports')
                    .select('*')
                    .order('checked_at', { ascending: false })
                    .limit(100); // Pagination guard
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Domain Health Reports' }
        );
    },

    // 6. Request a live simulated DNS checklist (Fixed UNIQUE constraint mismatch)
    async runSimulatedDNSCheck(domain) {
        if (!State.user) throw new Error("User must be logged in to scan domains");
        const targetDomain = domain.trim().toLowerCase();
        
        return safeApiCall(
            async () => {
                // Generate mock standard DNS settings
                const report = {
                    user_id: State.user.id,
                    domain: targetDomain,
                    spf_record: `v=spf1 include:_spf.google.com ~all`,
                    spf_status: 'pass',
                    dkim_selector: 'google',
                    dkim_status: Math.random() > 0.3 ? 'pass' : 'fail', // Introduce mock variations
                    dmarc_record: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${targetDomain}`,
                    dmarc_policy: 'quarantine',
                    dmarc_status: 'pass',
                    mx_records: [
                        { host: `aspmx.l.google.com`, priority: 1 },
                        { host: `alt1.aspmx.l.google.com`, priority: 5 }
                    ],
                    blacklist_results: {
                        Spamhaus: 'clean',
                        Barracuda: 'clean',
                        SORBS: 'clean',
                        SpamCop: 'clean'
                    },
                    blacklisted_count: 0,
                    total_lists_checked: 4,
                    health_score: 95,
                    recommendations: []
                };

                if (report.dkim_status === 'fail') {
                    report.health_score -= 25;
                    report.recommendations.push({
                        title: 'Missing DKIM configuration',
                        action: `Add a TXT record for selector 'google._domainkey.${targetDomain}' containing your DKIM public key tag.`
                    });
                }

                // Fixed: uses 'user_id,domain' to match the UNIQUE constraint added in v14 hardening
                const { data, error } = await supabase
                    .from('domain_health_reports')
                    .upsert([report], { onConflict: 'user_id,domain' })
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            null,
            { shouldThrow: true, contextName: 'DNS Analysis' }
        );
    },

    // 7. Get or update rotation configuration
    async getRotationConfig() {
        if (!State.user) return null;
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('inbox_rotation_config')
                    .select('*')
                    .eq('user_id', State.user.id)
                    .maybeSingle();
                if (error) throw error;
                
                if (!data) {
                    // Seed a default config
                    const { data: seeded, error: seedError } = await supabase
                        .from('inbox_rotation_config')
                        .insert([{
                            user_id: State.user.id,
                            rotation_strategy: 'round_robin',
                            max_daily_per_inbox: 30,
                            cool_down_minutes: 60,
                            enabled: true
                        }])
                        .select()
                        .single();
                    if (seedError) throw seedError;
                    return seeded;
                }
                return data;
            },
            null,
            { contextName: 'Fetch Rotation Config' }
        );
    },

    // 8. Update rotation settings
    async updateRotationConfig(id, patch) {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('inbox_rotation_config')
                    .update(patch)
                    .eq('id', id)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Update Rotation Config' }
        );
    }
};
