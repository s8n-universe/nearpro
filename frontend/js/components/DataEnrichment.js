import { State } from '../state.js';
import { Api } from '../api.js';
import { EnrichmentApi } from '../api/enrichment.js';

let providers = [];
let configuredKeys = [];
let recentJobs = [];
let enrichmentStats = null;
let currentListLeads = [];
let selectedListLeads = [];

export function renderDataEnrichment() {
    const stats = enrichmentStats || {
        credits_remaining: 50,
        total_enriched: 0,
        emails_found: 0,
        phones_found: 0,
        avg_confidence: 0,
        active_jobs: 0
    };

    const monthlyLimit = State.profile?.monthly_enrichments_limit || 50;
    const creditPct = Math.min(100, Math.round((stats.credits_remaining / monthlyLimit) * 100));

    // Providers waterfall HTML list
    const waterfallHTML = providers.map((prov, idx) => {
        const hasKey = configuredKeys.find(k => k.provider_id === prov.id);
        const isActive = prov.name === 'maps' || prov.name === 'smtp_validator' || hasKey;

        return `
            <div style="background:#09090b; border:1px solid #222227; border-radius:8px; padding:16px; display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-family:var(--font-mono, monospace); font-size:12px; color:#a1a1aa; font-weight:800; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                        ${idx + 1}
                    </span>
                    <div>
                        <div style="font-size:13.5px; font-weight:700; color:white;">${prov.display_name}</div>
                        <div style="font-size:11px; color:#a1a1aa; margin-top:2px;">Type: ${prov.provider_type.toUpperCase()} • Cost: Free (BYOK)</div>
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-size:11px; background:${isActive ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)'}; border:1px solid ${isActive ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)'}; color:${isActive ? '#22c55e' : '#a1a1aa'}; font-weight:700; padding:2px 8px; border-radius:4px;">
                        ${isActive ? 'ACTIVE' : 'SETUP REQUIRED'}
                    </span>
                    ${prov.name !== 'maps' && prov.name !== 'smtp_validator' ? `
                        <button class="brand-btn configure-key-btn" data-id="${prov.id}" data-name="${prov.display_name}" style="padding:6px 12px; font-size:11.5px; font-weight:700; background:rgba(255,160,0,0.1); border:1px solid rgba(255,160,0,0.25); color:var(--accent-gold);">
                            ${hasKey ? 'Edit Key' : 'Configure'}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    // Jobs list
    const jobsHTML = recentJobs.length === 0 ? `
        <div style="text-align:center; padding:20px; color:#a1a1aa; font-size:12.5px;">No recent batch enrichment jobs executed.</div>
    ` : recentJobs.map(job => {
        const isCompleted = job.status === 'completed';
        const total = job.total_leads || 0;
        const rate = total > 0 ? Math.round((job.enriched_count / total) * 100) : 0;

        return `
            <div style="background:#111115; border:1px solid #222227; border-radius:8px; padding:14px; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div>
                    <div style="font-size:13.5px; font-weight:700; color:white; display:flex; align-items:center; gap:6px;">
                        <span>Enrich Job #${job.id.substring(0,6)}</span>
                        <span style="font-size:10px; background:${isCompleted ? 'rgba(34,197,94,0.1)' : 'rgba(255,160,0,0.1)'}; color:${isCompleted ? '#22c55e' : 'var(--accent-gold)'}; padding:2px 6px; border-radius:4px;">
                            ${job.status.toUpperCase()}
                        </span>
                    </div>
                    <div style="font-size:11.5px; color:#a1a1aa; margin-top:4px;">
                        Processed: ${total} leads • Success: ${job.enriched_count} enriched • Skipped: ${job.skipped_count}
                    </div>
                </div>

                <div style="text-align:right;">
                    <div style="font-family:var(--font-mono, monospace); font-size:14px; font-weight:800; color:${rate > 70 ? '#22c55e' : 'var(--accent-gold)'};">
                        ${rate}% Success
                    </div>
                    <div style="font-size:11px; color:#a1a1aa; margin-top:2px;">
                        ${new Date(job.created_at).toLocaleTimeString()}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div style="max-width: 1200px; display: flex; flex-direction: column; gap: 24px; color: white; padding-bottom: 40px;">
            
            <!-- Header section -->
            <div style="background: linear-gradient(135deg, rgba(255,160,0,0.06) 0%, rgba(236,72,153,0.02) 100%); border: 1px solid #222227; border-radius: 12px; padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <h3 style="margin: 0; font-size: 20px; font-weight: 800; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px;">
                        <span>🔬 Data Enrichment Engine</span>
                        <span style="font-size: 10px; background: rgba(255, 160, 0, 0.15); border: 1px solid rgba(255, 160, 0, 0.3); color: var(--accent-gold); font-weight: 800; padding: 2px 8px; border-radius: 50px; text-transform: uppercase; font-family: var(--font-mono);">Scout Gated</span>
                    </h3>
                    <p style="margin: 0; font-size: 13.5px; color: #a1a1aa;">Setup provider waterfall cascading lookups to automatically enrich missing emails, phone numbers, and social links.</p>
                </div>
                <button class="brand-btn" id="enrichLeadsActionBtn" style="background: #2563eb; color: white; font-weight: 800; padding: 10px 20px;">
                    Enrich Leads Batch
                </button>
            </div>

            <!-- Credits Card + Stats Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 20px; flex-wrap: wrap; align-items: start;">
                
                <!-- Credit Balance Progress -->
                <div style="background: #111115; border: 1px solid #222227; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 12.5px; color:#a1a1aa; font-weight:700; text-transform:uppercase;">Enrichment Credit Balance</span>
                        <span style="font-family:var(--font-mono, monospace); font-size:14px; font-weight:800; color:white;">🪙 ${stats.credits_remaining} / ${monthlyLimit}</span>
                    </div>

                    <div style="height: 8px; background: #09090b; border-radius: 10px; overflow: hidden; position: relative;">
                        <div style="width: ${creditPct}%; height: 100%; background: linear-gradient(90deg, #d97706 0%, #2563eb 100%); border-radius: 10px;"></div>
                    </div>
                    
                    <div style="font-size: 12px; color: #a1a1aa; line-height: 1.4;">
                        Credits reset monthly. Gated lookups deduct 1 credit per successfully enriched business.
                    </div>
                </div>

                <!-- Stats Summary -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                    <div style="background:#111115; border:1px solid #222227; border-radius:8px; padding:16px; text-align:center;">
                        <div style="font-size: 10px; color:#a1a1aa; font-weight:700; text-transform:uppercase; margin-bottom:4px;">Emails Found</div>
                        <div style="font-size: 20px; font-weight: 800; font-family: var(--font-mono); color: white;">${stats.emails_found}</div>
                    </div>
                    <div style="background:#111115; border:1px solid #222227; border-radius:8px; padding:16px; text-align:center;">
                        <div style="font-size: 10px; color:#a1a1aa; font-weight:700; text-transform:uppercase; margin-bottom:4px;">Phones Found</div>
                        <div style="font-size: 20px; font-weight: 800; font-family: var(--font-mono); color: #22c55e;">${stats.phones_found}</div>
                    </div>
                    <div style="background:#111115; border:1px solid #222227; border-radius:8px; padding:16px; text-align:center;">
                        <div style="font-size: 10px; color:#a1a1aa; font-weight:700; text-transform:uppercase; margin-bottom:4px;">Avg Match Score</div>
                        <div style="font-size: 20px; font-weight: 800; font-family: var(--font-mono); color: var(--accent-gold);">${Math.round(stats.avg_confidence)}%</div>
                    </div>
                </div>

            </div>

            <!-- Waterfall Setup Configuration & Recent Jobs -->
            <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; align-items: start; flex-wrap: wrap;">
                
                <!-- Left: Waterfall list -->
                <div style="background: #111115; border: 1px solid #222227; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                    <h3 style="margin: 0 0 16px 0; font-size: 16px; font-family: var(--font-heading); font-weight: 800; border-bottom:1px solid #222227; padding-bottom:12px;">
                        Provider Waterfall Chain Order (Cascading Logic)
                    </h3>
                    <div style="display: flex; flex-direction: column;">
                        ${waterfallHTML}
                    </div>
                </div>

                <!-- Right: Recent jobs -->
                <div style="background: #111115; border: 1px solid #222227; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                    <h3 style="margin: 0 0 16px 0; font-size: 16px; font-family: var(--font-heading); font-weight: 800; border-bottom:1px solid #222227; padding-bottom:12px;">
                        Recent Enrichment Batches
                    </h3>
                    <div style="display: flex; flex-direction: column;">
                        ${jobsHTML}
                    </div>
                </div>

            </div>

        </div>

        <!-- Configure API Key Modal overlay -->
        <div id="configureKeyModalOverlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; align-items: center; justify-content: center; padding: 24px;">
            <div style="background: #111115; border: 1px solid #222227; border-radius: 12px; max-width: 440px; width: 100%; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                <div style="padding: 20px; border-bottom: 1px solid #222227; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin:0; font-size: 16px; font-weight:800; font-family:var(--font-heading);" id="configModalTitle">Configure API Key</h3>
                    <button class="brand-btn" id="closeConfigKeyModal" style="background:none; border:none; padding:4px; font-size:18px; line-height:1; color:#a1a1aa; cursor:pointer;">×</button>
                </div>
                
                <div style="padding: 20px; display: flex; flex-direction: column; gap: 14px;">
                    <p style="margin: 0; font-size: 12.5px; color:#a1a1aa; line-height: 1.4;">
                        Enter your personal developer credential keys. Lookups will use your key and bypass platform-side credits constraints (BYOK Model).
                    </p>
                    
                    <div>
                        <label style="display: block; font-size: 12.5px; font-weight:700; color:#a1a1aa; margin-bottom: 6px;">Provider API Key / Authentication Token</label>
                        <input type="password" id="configApiKeyInput" placeholder="Enter key..." style="width: 100%; padding: 10px 14px; background: #09090b; border: 1.5px solid #222227; border-radius: 6px; color: white; font-size: 13.5px; outline: none;" />
                    </div>
                </div>

                <div style="padding: 20px; border-top: 1px solid #222227; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="brand-btn" id="cancelConfigKeyBtn" style="padding: 8px 16px; font-size:12.5px; background:rgba(255,255,255,0.06); color:white; border: 1px solid rgba(255,255,255,0.08);">Cancel</button>
                    <button class="brand-btn" id="confirmConfigKeyBtn" style="padding: 8px 16px; font-size:12.5px; background:#2563eb; color:white; border:none;">Save Key</button>
                </div>
            </div>
        </div>

        <!-- Run Enrichment batch Modal overlay -->
        <div id="batchEnrichModalOverlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; align-items: center; justify-content: center; padding: 24px;">
            <div style="background: #111115; border: 1px solid #222227; border-radius: 12px; max-width: 500px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                <div style="padding: 20px; border-bottom: 1px solid #222227; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin:0; font-size: 16px; font-weight:800; font-family:var(--font-heading);">Run Batch Enrichment</h3>
                    <button class="brand-btn" id="closeBatchEnrichModal" style="background:none; border:none; padding:4px; font-size:18px; line-height:1; color:#a1a1aa; cursor:pointer;">×</button>
                </div>
                
                <div style="padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px;">
                    <div>
                        <label style="display: block; font-size: 12.5px; font-weight:700; color:#a1a1aa; margin-bottom: 6px;">Select Lead Source List</label>
                        <select id="batchEnrichSourceSelect" style="width:100%; padding: 10px 14px; background:#09090b; border:1px solid #222227; border-radius:6px; color:white; font-size:13.5px; outline:none;">
                            <option value="">-- Choose List --</option>
                            ${leadLists.map(l => `<option value="${l.id}">${l.name} (${l.total_leads || 0} leads)</option>`).join('')}
                        </select>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="display: block; font-size: 12.5px; font-weight:700; color:#a1a1aa;">Leads checklist preview</label>
                        <div id="batchEnrichLeadsListWrapper" style="border: 1px solid #222227; border-radius: 6px; padding: 10px; max-height: 200px; overflow-y: auto; background:#09090b; display:flex; flex-direction:column; gap:8px;">
                            <div style="color:#a1a1aa; font-size:12.5px; text-align:center; padding:12px;">Choose a source list first...</div>
                        </div>
                    </div>
                </div>

                <div style="padding: 20px; border-top: 1px solid #222227; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="brand-btn" id="cancelBatchEnrichBtn" style="padding: 8px 16px; font-size:12.5px; background:rgba(255,255,255,0.06); color:white; border: 1px solid rgba(255,255,255,0.08);">Cancel</button>
                    <button class="brand-btn" id="confirmBatchEnrichBtn" style="padding: 8px 16px; font-size:12.5px; background:#2563eb; color:white; border:none;" disabled>Confirm & Deduct Credits</button>
                </div>
            </div>
        </div>
    `;
}

export function bindDataEnrichmentEvents() {
    let selectedProviderIdForConfig = null;

    // 1. Configure key modal open
    document.querySelectorAll('.configure-key-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const provId = btn.getAttribute('data-id');
            const provName = btn.getAttribute('data-name');
            selectedProviderIdForConfig = provId;
            
            const title = document.getElementById('configModalTitle');
            if (title) title.innerText = `Configure Key: ${provName}`;
            
            const input = document.getElementById('configApiKeyInput');
            if (input) {
                const hasKey = configuredKeys.find(k => k.provider_id === provId);
                input.value = hasKey ? '••••••••••••••••' : '';
            }

            const modal = document.getElementById('configureKeyModalOverlay');
            if (modal) modal.style.display = 'flex';
        });
    });

    const closeConfigBtn = document.getElementById('closeConfigKeyModal') || document.getElementById('cancelConfigKeyBtn');
    if (closeConfigBtn) {
        closeConfigBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('configureKeyModalOverlay');
            if (modal) modal.style.display = 'none';
        });
    }

    // Save key
    const confirmKeyBtn = document.getElementById('confirmConfigKeyBtn');
    if (confirmKeyBtn) {
        confirmKeyBtn.addEventListener('click', async () => {
            const keyInput = document.getElementById('configApiKeyInput')?.value.trim();
            if (!keyInput) {
                alert("Please enter a valid API key.");
                return;
            }

            confirmKeyBtn.disabled = true;
            confirmKeyBtn.innerText = 'Saving...';

            try {
                await EnrichmentApi.saveUserApiKey(selectedProviderIdForConfig, keyInput);
                alert("✨ API key configured successfully!");
                const modal = document.getElementById('configureKeyModalOverlay');
                if (modal) modal.style.display = 'none';
                
                await loadEnrichmentData();
                refreshView();
            } catch (err) {
                console.error("Save API key failed:", err);
                alert(`Save failed: ${err.message}`);
            } finally {
                confirmKeyBtn.disabled = false;
                confirmKeyBtn.innerText = 'Save Key';
            }
        });
    }

    // 2. Open Batch Enrichment Modal
    const runBatchBtn = document.getElementById('enrichLeadsActionBtn');
    if (runBatchBtn) {
        runBatchBtn.addEventListener('click', async () => {
            const modal = document.getElementById('batchEnrichModalOverlay');
            if (modal) modal.style.display = 'flex';

            try {
                // Populate Smart Lists
                leadLists = await Api.getLeadLists();
                const listSelect = document.getElementById('batchEnrichSourceSelect');
                if (listSelect) {
                    listSelect.innerHTML = `<option value="">-- Choose List --</option>` + leadLists.map(l => `<option value="${l.id}">${l.name} (${l.total_leads || 0} leads)</option>`).join('');
                }
            } catch (e) {
                console.warn("Failed to load lead lists:", e);
            }
        });
    }

    const closeBatchBtn = document.getElementById('closeBatchEnrichModal') || document.getElementById('cancelBatchEnrichBtn');
    if (closeBatchBtn) {
        closeBatchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('batchEnrichModalOverlay');
            if (modal) modal.style.display = 'none';
        });
    }

    // Select Source list
    const sourceSelect = document.getElementById('batchEnrichSourceSelect');
    if (sourceSelect) {
        sourceSelect.addEventListener('change', async () => {
            const listId = sourceSelect.value;
            const container = document.getElementById('batchEnrichLeadsListWrapper');
            const confirmBtn = document.getElementById('confirmBatchEnrichBtn');
            
            if (!listId) {
                if (container) container.innerHTML = `<div style="color:#a1a1aa; font-size:12.5px; text-align:center; padding:12px;">Choose a source list first...</div>`;
                if (confirmBtn) confirmBtn.disabled = true;
                return;
            }

            if (container) container.innerHTML = `<div style="color:var(--accent-gold); font-size:12px; text-align:center; padding:12px;">Retrieving list leads...</div>`;

            try {
                const leads = await Api.getSavedLeads(listId);
                currentListLeads = leads || [];
                
                // Filter leads that are missing either email OR phone
                selectedListLeads = currentListLeads.filter(item => {
                    const p = item.professionals || {};
                    return !p.email || !p.phone;
                });

                if (currentListLeads.length === 0) {
                    if (container) container.innerHTML = `<div style="color:#a1a1aa; font-size:12.5px; text-align:center; padding:12px;">No leads found in this list.</div>`;
                    if (confirmBtn) confirmBtn.disabled = true;
                    return;
                }

                if (selectedListLeads.length === 0) {
                    if (container) container.innerHTML = `<div style="color:#22c55e; font-size:12.5px; text-align:center; padding:12px;">🎉 All leads in this list are already 100% complete!</div>`;
                    if (confirmBtn) confirmBtn.disabled = true;
                    return;
                }

                if (container) {
                    container.innerHTML = selectedListLeads.map((item) => {
                        const p = item.professionals || {};
                        return `
                            <div style="font-size:12px; color:white; padding: 4px 0; display:flex; justify-content:space-between;">
                                <span>${p.name || 'Lead'}</span>
                                <span style="color:#a1a1aa;">Missing: ${!p.email ? 'Email 📧' : ''} ${!p.phone ? 'Phone 📱' : ''}</span>
                            </div>
                        `;
                    }).join('');
                }

                if (confirmBtn) {
                    confirmBtn.disabled = false;
                    confirmBtn.innerText = `Confirm & Deduct ${selectedListLeads.length} Credits`;
                }

            } catch (err) {
                console.warn("Failed to load list details:", err);
                if (container) container.innerHTML = `<div style="color:var(--accent-pink); font-size:12.5px; text-align:center; padding:12px;">Failed to retrieve leads.</div>`;
            }
        });
    }

    // Run cascade waterfall enrichment batch
    const confirmBatchBtn = document.getElementById('confirmBatchEnrichBtn');
    if (confirmBatchBtn) {
        confirmBatchBtn.addEventListener('click', async () => {
            if (selectedListLeads.length === 0) return;
            
            // Check credit limit
            const currentCredits = State.profile?.enrichment_credits || 0;
            if (currentCredits < selectedListLeads.length) {
                alert(`🚫 Insufficient balance: You need ${selectedListLeads.length} credits, but you only have ${currentCredits} remaining. Please upgrade your plan.`);
                return;
            }

            confirmBatchBtn.disabled = true;
            confirmBatchBtn.innerText = 'Enriching...';

            try {
                // 1. Create a job
                const job = await EnrichmentApi.createEnrichmentJob('batch', selectedListLeads.length);
                
                // 2. Trigger simulated waterfall cascading lookups
                await EnrichmentApi.runWaterfallEnrichment(job.id, selectedListLeads);
                
                alert(`✨ Enrichment batch complete! Refreshed directory profiles.`);
                const modal = document.getElementById('batchEnrichModalOverlay');
                if (modal) modal.style.display = 'none';

                await loadEnrichmentData();
                refreshView();
            } catch (err) {
                console.error("Enrichment run failed:", err);
                alert(`Enrichment failed: ${err.message}`);
                confirmBatchBtn.disabled = false;
                confirmBatchBtn.innerText = 'Confirm & Deduct Credits';
            }
        });
    }
}

async function loadEnrichmentData() {
    try {
        providers = await EnrichmentApi.getProviders();
        configuredKeys = await EnrichmentApi.getUserKeys();
        recentJobs = await EnrichmentApi.getEnrichmentJobs();
        enrichmentStats = await EnrichmentApi.getEnrichmentStats();
    } catch (e) {
        console.warn("Failed to load enrichment data:", e);
        providers = [];
    }
}

function refreshView() {
    const content = document.getElementById('dashboardContent');
    if (content) {
        content.innerHTML = renderDataEnrichment();
        bindDataEnrichmentEvents();
        if (window.refreshLucideIcons) window.refreshLucideIcons();
    }
}

// Fetch lists on mount
(async () => {
    await loadEnrichmentData();
})();
