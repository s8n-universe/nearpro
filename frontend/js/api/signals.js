import { supabase } from '../supabase.js';
import { State } from '../state.js';
import { safeApiCall, safeUpdateProfessionalSignals } from './apiHelpers.js';

export const SignalsApi = {
    // 1. Fetch live detected signals feed
    async getDetectedSignals() {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('detected_signals')
                    .select(`
                        *,
                        professionals (
                            id,
                            name,
                            area,
                            category,
                            intent_score,
                            phone,
                            website
                        )
                    `)
                    .order('detected_at', { ascending: false })
                    .limit(100); // Pagination guard
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Detected Signals' }
        );
    },

    // 2. Fetch watchlists
    async getWatchlists() {
        if (!State.user) return [];
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('signal_watchlists')
                    .select('*')
                    .eq('user_id', State.user.id);
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Watchlists' }
        );
    },

    // 3. Create a watchlist
    async createWatchlist(watchlist) {
        if (!State.user) throw new Error("User must be logged in to create watchlists");
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('signal_watchlists')
                    .insert([{
                        user_id: State.user.id,
                        name: watchlist.name,
                        description: watchlist.description || '',
                        check_frequency: watchlist.check_frequency || 'daily',
                        signal_types: watchlist.signal_types || ['hiring', 'funding', 'tech', 'review', 'news']
                    }])
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Create Watchlist' }
        );
    },

    // 4. Add lead to watchlist
    async addLeadToWatchlist(watchlistId, professionalId) {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('watchlist_leads')
                    .insert([{
                        watchlist_id: watchlistId,
                        professional_id: professionalId
                    }], { onConflict: 'watchlist_id,professional_id' }) // Handle duplicate inserts gracefully
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Add Lead to Watchlist' }
        );
    },

    // 5. Acknowledge a signal (archives it or marks read)
    async acknowledgeSignal(signalId) {
        if (!State.user) throw new Error("User must be logged in to dismiss signals");
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('detected_signals')
                    .update({
                        status: 'acknowledged',
                        acknowledged_by: State.user.id,
                        acknowledged_at: new Date().toISOString()
                    })
                    .eq('id', signalId)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Dismiss Signal' }
        );
    },

    // 6. Simulate a background check to discover new signal indicators (Fixed H4 RLS write block)
    async runSimulatedSignalScan() {
        if (!State.user) throw new Error("User must be logged in to scan signals");
        
        return safeApiCall(
            async () => {
                // Fetch all definitions to link
                const { data: defs } = await supabase.from('signal_definitions').select('*');
                if (!defs || defs.length === 0) return [];

                // Fetch user's professionals to link
                const { data: leads } = await supabase.from('professionals').select('*').limit(3);
                if (!leads || leads.length === 0) return [];

                const outputs = [];
                
                // Select random definition & lead to mock new signal
                for (let i = 0; i < Math.min(leads.length, 2); i++) {
                    const lead = leads[i];
                    const def = defs[Math.floor(Math.random() * defs.length)];
                    
                    const signal = {
                        professional_id: lead.id,
                        signal_def_id: def.id,
                        title: `${def.icon} ${lead.name} ${def.display_name}`,
                        description: `Simulated intent signal detected via background monitoring. Confidence score evaluated at 85%.`,
                        source_name: def.data_source === 'google_news' ? 'Google News Indexer' : 'LinkedIn Crawler',
                        source_url: 'https://google.com',
                        signal_strength: def.weight >= 80 ? 'high' : 'medium',
                        confidence: 85,
                        status: 'new'
                    };

                    const { data: inserted, error } = await supabase
                        .from('detected_signals')
                        .insert([signal])
                        .select()
                        .single();
                        
                    if (!error && inserted) {
                        // Fixed: Instead of direct user UPDATE on public professionals table which triggers RLS errors,
                        // we invoke our database secure RPC which bypasses writing limitations safely.
                        await safeUpdateProfessionalSignals(lead.id, Math.round(def.weight * 0.3));
                        outputs.push(inserted);
                    }
                }
                return outputs;
            },
            [],
            { contextName: 'Background Scan' }
        );
    }
};
