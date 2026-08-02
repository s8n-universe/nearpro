import { State } from '../state.js';
import { Api } from '../api.js';
import { PluginsApi } from '../api/plugins.js';

let availablePlugins = [];
let userInstallations = [];
let searchFilter = '';
let activeCategoryFilter = 'all';
let selectedPluginSlug = null; // Used for detail inspect page

export function renderPluginMarketplace() {
    if (selectedPluginSlug) {
        return renderPluginDetailPage();
    }
    return renderMarketplaceList();
}

function renderMarketplaceList() {
    const list = availablePlugins || [];
    const installs = userInstallations || [];

    // Filter plugins
    const filtered = list.filter(p => {
        // Category check
        if (activeCategoryFilter !== 'all') {
            if (activeCategoryFilter === 'official' && !p.is_official) return false;
            if (activeCategoryFilter !== 'official' && p.category !== activeCategoryFilter) return false;
        }

        // Search check
        if (searchFilter) {
            const query = searchFilter.toLowerCase();
            return p.name.toLowerCase().includes(query) || (p.description || '').toLowerCase().includes(query);
        }

        return true;
    });

    const pluginCardsHTML = filtered.length === 0 ? `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: #a1a1aa; font-size:13.5px; border: 1px dashed rgba(255,255,255,0.08); border-radius: 8px; background: #111115;">
            No plugins match your search criteria.
        </div>
    ` : filtered.map(p => {
        const isInstalled = installs.find(inst => inst.plugin_id === p.id);
        const icon = p.category === 'integration' ? '🔌' : p.category === 'outreach' ? '✉️' : p.category === 'analytics' ? '📊' : '🧩';

        return `
            <div class="plugin-card-item" data-slug="${p.slug}" style="background: #111115; border: 1px solid #222227; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <span style="font-size: 24px;">${icon}</span>
                        <div style="display: flex; gap: 6px;">
                            ${p.is_official ? `<span style="font-size: 9px; background: rgba(37,99,235,0.15); border: 1px solid rgba(37,99,235,0.3); color: #3b82f6; font-weight: 800; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono);">OFFICIAL</span>` : ''}
                            ${p.is_verified ? `<span style="font-size: 9px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #22c55e; font-weight: 800; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono);">VERIFIED</span>` : ''}
                        </div>
                    </div>

                    <h4 style="margin: 0 0 6px 0; color: white; font-family: var(--font-heading); font-size: 15px; font-weight: 800;">${p.name}</h4>
                    <p style="margin: 0 0 16px 0; color: #a1a1aa; font-size: 12.5px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 35px;">${p.description || ''}</p>
                </div>

                <div style="border-top: 1px solid #222227; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-size: 11px; color:#a1a1aa; font-weight:600;">by ${p.author_name || 'NearPro'}</span>
                        <span style="font-size: 11px; color:var(--accent-gold); margin-top:2px; font-weight:700;">★ ${p.avg_rating || '5.0'} (${p.install_count || 0} installs)</span>
                    </div>

                    <button class="brand-btn plugin-install-toggle-btn" data-id="${p.id}" data-installed="${isInstalled ? 'true' : 'false'}" style="padding: 6px 12px; font-size: 11.5px; font-weight: 700; background: ${isInstalled ? 'rgba(255,255,255,0.06)' : '#2563eb'}; border: ${isInstalled ? '1px solid rgba(255,255,255,0.08)' : 'none'}; color: white;">
                        ${isInstalled ? 'Uninstall' : 'Install'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    const categories = [
        { id: 'all', label: 'All Plugins' },
        { id: 'official', label: 'Official Core' },
        { id: 'enrichment', label: 'Enrichment' },
        { id: 'outreach', label: 'Outreach' },
        { id: 'integration', label: 'Integrations' }
    ];

    const categoryTabsHTML = categories.map(cat => {
        const isActive = activeCategoryFilter === cat.id;
        return `
            <button class="brand-btn cat-filter-btn" data-cat="${cat.id}" style="padding: 8px 16px; font-size: 12.5px; font-weight: 700; background: ${isActive ? 'rgba(255, 160, 0, 0.1)' : 'rgba(255,255,255,0.04)'}; border: 1px solid ${isActive ? 'rgba(255, 160, 0, 0.25)' : 'rgba(255,255,255,0.06)'}; color: ${isActive ? 'var(--accent-gold)' : 'white'};">
                ${cat.label}
            </button>
        `;
    }).join('');

    return `
        <style>
            .plugin-card-item:hover {
                border-color: #33333f !important;
                transform: translateY(-2px);
                box-shadow: 0 8px 30px rgba(0,0,0,0.3) !important;
            }
        </style>
        
        <div style="max-width: 1200px; display: flex; flex-direction: column; gap: 24px; color: white; padding-bottom: 40px;">
            
            <!-- Welcome Banner Header -->
            <div style="background: linear-gradient(135deg, rgba(236,72,153,0.05) 0%, rgba(37,99,235,0.02) 100%); border: 1px solid #222227; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 14px;">
                <h3 style="margin: 0; font-size: 20px; font-weight: 800; font-family: var(--font-heading);">
                    🧩 S8N Plugin Marketplace
                </h3>
                <p style="margin: 0; font-size: 13.5px; color: #a1a1aa; max-width: 800px; line-height: 1.5;">
                    Extend NearPro features. Install first-party & community plugins using the Model Context Protocol (MCP) server architecture.
                </p>
            </div>

            <!-- Categories Tabs + Search bar -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${categoryTabsHTML}
                </div>
                <div style="position: relative; width: 280px;">
                    <input type="text" id="marketplaceSearchInput" value="${searchFilter}" placeholder="Search plugins..." style="width: 100%; padding: 10px 14px; background: #111115; border: 1.5px solid #222227; border-radius: 8px; color: white; font-size: 13px; outline: none;" />
                </div>
            </div>

            <!-- Plugins Grid -->
            <div>
                <h3 style="margin: 0 0 16px 0; font-size: 17px; font-family: var(--font-heading); font-weight: 800;">Available Plugins</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                    ${pluginCardsHTML}
                </div>
            </div>

        </div>
    `;
}

function renderPluginDetailPage() {
    const p = availablePlugins.find(plug => plug.slug === selectedPluginSlug);
    if (!p) return '';

    const isInstalled = userInstallations.find(inst => inst.plugin_id === p.id);
    const tools = typeof p.tools_provided === 'string' ? JSON.parse(p.tools_provided) : p.tools_provided || [];

    const toolsHTML = tools.length === 0 ? `
        <div style="color: #a1a1aa; font-size: 12.5px;">No tools declared by this plugin.</div>
    ` : tools.map(t => `
        <div style="background: #09090b; border: 1px solid #222227; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
            <div style="font-family: var(--font-mono, monospace); font-size: 13px; font-weight: 700; color: var(--accent-gold); margin-bottom: 6px;">
                🔧 ${t.name}
            </div>
            <div style="font-size: 12.5px; color: #a1a1aa; line-height: 1.4;">${t.description}</div>
        </div>
    `).join('');

    const configKeys = p.slug === 'hubspot-crm-sync' ? ['hubspot_access_token', 'hubspot_pipeline_id'] : p.slug === 'slack-deal-notifier' ? ['slack_webhook_url'] : p.slug === 'google-sheets-export' ? ['google_sheet_id'] : [];
    
    const configHTML = !isInstalled ? `
        <div style="text-align: center; color: #a1a1aa; font-size: 13px; padding: 20px;">
            Please install this plugin first to configure its keys.
        </div>
    ` : configKeys.length === 0 ? `
        <div style="text-align: center; color: #a1a1aa; font-size: 13px; padding: 20px;">
            This plugin requires no authentication credentials setup.
        </div>
    ` : `
        <div style="display: flex; flex-direction: column; gap: 14px; max-width: 460px;">
            ${configKeys.map(key => `
                <div>
                    <label style="display: block; font-size: 12.5px; font-weight: 700; color: #a1a1aa; margin-bottom: 6px;">
                        ${key.replace(/_/g, ' ').toUpperCase()}
                    </label>
                    <input type="password" class="plugin-config-input" data-key="${key}" value="${(isInstalled.config || {})[key] || ''}" style="width: 100%; padding: 10px 14px; background: #09090b; border: 1.5px solid #222227; border-radius: 6px; color: white; font-size: 13.5px; outline: none;" />
                </div>
            `).join('')}
            <button class="brand-btn" id="savePluginConfigBtn" data-id="${p.id}" style="background: #2563eb; color: white; font-weight: 800; padding: 10px 20px; align-self: flex-start; margin-top: 8px;">
                Save Configuration
            </button>
        </div>
    `;

    return `
        <div style="max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; color: white; padding-bottom: 40px;">
            
            <!-- Detail Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222227; padding-bottom: 16px;">
                <button class="brand-btn" id="detailBackToMarketplace" style="padding: 6px 14px; font-size: 12.5px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: white; font-weight: 700;">
                    ← Back to Marketplace
                </button>

                <button class="brand-btn detail-install-toggle-btn" data-id="${p.id}" data-installed="${isInstalled ? 'true' : 'false'}" style="padding: 8px 16px; font-size: 13px; font-weight: 800; background: ${isInstalled ? 'rgba(239, 68, 68, 0.1)' : '#2563eb'}; border: ${isInstalled ? '1px solid rgba(239, 68, 68, 0.2)' : 'none'}; color: ${isInstalled ? '#ef4444' : 'white'};">
                    ${isInstalled ? 'Uninstall Plugin' : 'Install Plugin'}
                </button>
            </div>

            <!-- Plugin Metadata Banner -->
            <div style="background: #111115; border: 1px solid #222227; border-radius: 12px; padding: 24px; display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                <div style="font-size: 48px; padding: 16px; background: rgba(255,255,255,0.04); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">🔌</div>
                <div style="flex: 1; min-width: 240px; display: flex; flex-direction: column; gap: 4px;">
                    <div style="font-size: 18px; font-weight: 800; font-family: var(--font-heading);">${p.name}</div>
                    <div style="font-size: 12px; color: #a1a1aa;">
                        Version ${p.version} • Published by ${p.author_name || 'NearPro'} • ${p.install_count || 0} active integrations
                    </div>
                    <div style="font-size: 12px; color: var(--accent-gold); margin-top: 4px; font-weight: 700;">
                        ★ ${p.avg_rating || '5.0'} average community rating
                    </div>
                </div>
            </div>

            <!-- Detail tabs options -->
            <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; align-items: start;">
                
                <!-- Left: Tools & Capabilities list -->
                <div style="background: #111115; border: 1px solid #222227; border-radius: 12px; padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; font-size: 16px; font-family: var(--font-heading); font-weight: 800; border-bottom: 1px solid #222227; padding-bottom: 12px;">
                        🔧 Plugin MCP Tools Provided
                    </h3>
                    ${toolsHTML}
                </div>

                <!-- Right: Config settings -->
                <div style="background: #111115; border: 1px solid #222227; border-radius: 12px; padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; font-size: 16px; font-family: var(--font-heading); font-weight: 800; border-bottom: 1px solid #222227; padding-bottom: 12px;">
                        ⚙️ Integration Configuration
                    </h3>
                    ${configHTML}
                </div>

            </div>

        </div>
    `;
}

export function bindPluginMarketplaceEvents() {
    // 1. Inspect plugin details trigger
    document.querySelectorAll('.plugin-card-item').forEach(card => {
        card.addEventListener('click', (e) => {
            // Ignore click if clicking the toggle button
            if (e.target.classList.contains('plugin-install-toggle-btn')) return;
            
            const slug = card.getAttribute('data-slug');
            selectedPluginSlug = slug;
            refreshView();
        });
    });

    // Back to marketplace
    const backBtn = document.getElementById('detailBackToMarketplace');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            selectedPluginSlug = null;
            refreshView();
        });
    }

    // 2. Install / Uninstall Actions (list & detail page)
    const installBtns = document.querySelectorAll('.plugin-install-toggle-btn, .detail-install-toggle-btn');
    installBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const plugId = btn.getAttribute('data-id');
            const isInstalled = btn.getAttribute('data-installed') === 'true';
            
            btn.disabled = true;
            btn.innerText = isInstalled ? 'Uninstalling...' : 'Installing...';

            try {
                if (isInstalled) {
                    await PluginsApi.uninstallPlugin(plugId);
                    alert("Plugin uninstalled successfully.");
                } else {
                    await PluginsApi.installPlugin(plugId);
                    alert("🎉 Plugin installed successfully! You can now configure credentials.");
                }
                
                await loadMarketplaceData();
                refreshView();
            } catch (err) {
                console.error("Plugin action failed:", err);
                alert(`Action failed: ${err.message}`);
                btn.disabled = false;
                btn.innerText = isInstalled ? 'Uninstall' : 'Install';
            }
        });
    });

    // 3. Save Configuration settings
    const saveConfigBtn = document.getElementById('savePluginConfigBtn');
    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', async () => {
            const plugId = saveConfigBtn.getAttribute('data-id');
            const config = {};
            
            document.querySelectorAll('.plugin-config-input').forEach(input => {
                const key = input.getAttribute('data-key');
                config[key] = input.value.trim();
            });

            saveConfigBtn.disabled = true;
            saveConfigBtn.innerText = 'Saving...';

            try {
                await PluginsApi.savePluginConfig(plugId, config);
                alert("✨ Plugin configurations saved successfully!");
                await loadMarketplaceData();
                refreshView();
            } catch (err) {
                console.error("Save config failed:", err);
                alert(`Save configuration failed: ${err.message}`);
            } finally {
                saveConfigBtn.disabled = false;
                saveConfigBtn.innerText = 'Save Configuration';
            }
        });
    }

    // 4. Search Filter
    const searchInput = document.getElementById('marketplaceSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchFilter = searchInput.value;
            // Delay re-render briefly to avoid stutter
            setTimeout(() => {
                const cards = document.getElementById('dashboardContent');
                if (cards) {
                    cards.innerHTML = renderPluginMarketplace();
                    bindPluginMarketplaceEvents();
                }
            }, 300);
        });
    }

    // 5. Category Tabs Filter
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeCategoryFilter = btn.getAttribute('data-cat');
            refreshView();
        });
    });
}

async function loadMarketplaceData() {
    try {
        availablePlugins = await PluginsApi.getPlugins();
        userInstallations = await PluginsApi.getInstallations();
    } catch (e) {
        console.warn("Failed to load plugin marketplace data:", e);
        availablePlugins = [];
    }
}

function refreshView() {
    const content = document.getElementById('dashboardContent');
    if (content) {
        content.innerHTML = renderPluginMarketplace();
        bindPluginMarketplaceEvents();
        if (window.refreshLucideIcons) window.refreshLucideIcons();
    }
}

// Fetch lists on mount
(async () => {
    await loadMarketplaceData();
})();
