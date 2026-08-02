import { supabase } from '../supabase.js';
import { State } from '../state.js';
import { safeApiCall, atomicIncrement } from './apiHelpers.js';

export const PluginsApi = {
    // 1. Fetch available plugins
    async getPlugins() {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('mcp_plugins')
                    .select('*')
                    .eq('is_active', true)
                    .order('is_official', { ascending: false })
                    .limit(50); // Pagination guard
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Plugins' }
        );
    },

    // 2. Fetch user connected plugin installations
    async getInstallations() {
        if (!State.user) return [];
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('user_plugin_installations')
                    .select('*')
                    .eq('user_id', State.user.id);
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Installed Plugins' }
        );
    },

    // 3. Install a plugin (with atomic installation count increments)
    async installPlugin(pluginId) {
        if (!State.user) throw new Error("User must be logged in to install plugins");
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('user_plugin_installations')
                    .upsert([{
                        user_id: State.user.id,
                        plugin_id: pluginId,
                        status: 'installed',
                        config: {},
                        installed_at: new Date().toISOString()
                    }], { onConflict: 'user_id,plugin_id' })
                    .select()
                    .single();
                if (error) throw error;

                // Autohealing: Atomic install count increment to avoid race conditions
                await atomicIncrement('mcp_plugins', pluginId, 'install_count', 1);

                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Install Plugin' }
        );
    },

    // 4. Uninstall a plugin
    async uninstallPlugin(pluginId) {
        if (!State.user) throw new Error("User must be logged in to uninstall plugins");
        return safeApiCall(
            async () => {
                const { error } = await supabase
                    .from('user_plugin_installations')
                    .delete()
                    .eq('user_id', State.user.id)
                    .eq('plugin_id', pluginId);
                if (error) throw error;
                return true;
            },
            false,
            { shouldThrow: true, contextName: 'Uninstall Plugin' }
        );
    },

    // 5. Save config settings for a plugin (e.g. HubSpot API keys)
    async savePluginConfig(pluginId, config) {
        if (!State.user) throw new Error("User must be logged in to configure plugins");
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('user_plugin_installations')
                    .update({ config, last_used_at: new Date().toISOString() })
                    .eq('user_id', State.user.id)
                    .eq('plugin_id', pluginId)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Save Plugin Config' }
        );
    }
};
