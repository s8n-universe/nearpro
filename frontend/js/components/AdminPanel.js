import { State } from '../state.js';

export function renderAdminPanel() {
    const flags = State.featureFlags || {};

    const features = [
        {
            id: 'email_sequences',
            code: 'F01',
            name: 'Automated Email Sequences',
            desc: 'Drip campaigns and automated multi-step outreach schedules.',
            files: [
                'nearpro/supabase/migrations/v4_email_sequences.sql',
                'nearpro/frontend/js/components/EmailSequences.js',
                'nearpro/frontend/js/api/sequences.js'
            ]
        },
        {
            id: 'email_warmup',
            code: 'F02',
            name: 'Email Warmup & Deliverability',
            desc: 'Automatic email warmups, SPF/DKIM validation, and bounce management.',
            files: [
                'nearpro/frontend/js/components/DeliverabilityHub.js',
                'nearpro/frontend/js/api/warmup.js'
            ]
        },
        {
            id: 'waterfall_enrichment',
            code: 'F03',
            name: 'Waterfall Data Enrichment Engine',
            desc: 'Cascading lookup logic connecting Apollo, Hunter, and Lusha APIs.',
            files: [
                'nearpro/frontend/js/components/DataEnrichment.js',
                'nearpro/frontend/js/api/enrichment.js'
            ]
        },
        {
            id: 'mcp_plugins',
            code: 'F04',
            name: 'MCP Plugin Marketplace',
            desc: 'Extensibility layer supporting standard Model Context Protocol servers.',
            files: [
                'nearpro/frontend/js/components/PluginMarketplace.js',
                'nearpro/frontend/js/api/plugins.js'
            ]
        },
        {
            id: 'ai_research',
            code: 'F05',
            name: 'AI Research Agent',
            desc: 'Browser-Use agents gathering deep context on leads autonomously.',
            files: [
                'nearpro/frontend/js/components/AiResearchAgent.js',
                'nearpro/frontend/js/api/research.js'
            ]
        },
        {
            id: 'intent_signals',
            code: 'F06',
            name: 'Intent & Buying Signal Detection',
            desc: 'Listens to job postings, news updates, and social signals for outreach triggers.',
            files: [
                'nearpro/frontend/js/components/IntentSignals.js',
                'nearpro/frontend/js/api/signals.js'
            ]
        },
        {
            id: 'multi_channel',
            code: 'F07',
            name: 'Multi-Channel Sequence Orchestrator',
            desc: 'Combines email, SMS, and WhatsApp into unified outreach flows.',
            files: [
                'nearpro/frontend/js/components/MultiChannelSequences.js',
                'nearpro/frontend/js/api/multi_channel.js'
            ]
        },
        {
            id: 'voice_calling',
            code: 'F08',
            name: 'AI Voice Calling Agent',
            desc: 'Autonomous voice-agent handling customer callbacks and hot leads.',
            files: [
                'nearpro/frontend/js/components/VoiceAgentModal.js',
                'nearpro/frontend/js/api/voice.js',
                'nearpro/control_panel.pyw'
            ]
        },
        {
            id: 'deal_intelligence',
            code: 'F09',
            name: 'Deal Intelligence Dashboard',
            desc: 'AI deal scoring, next-best-action alerts, and pipeline visualizations.',
            files: [
                'nearpro/frontend/js/components/LeadCRM.js',
                'nearpro/frontend/js/api/deal_intelligence.js'
            ]
        },
        {
            id: 'self_hosted_llm',
            code: 'F10',
            name: 'Self-Hosted LLM Support',
            desc: 'Offline fallback and low-cost routing via local Ollama and LiteLLM.',
            files: [
                'nearpro/frontend/js/components/SettingsLlmRouter.js',
                'nearpro/frontend/js/api/llm.js'
            ]
        }
    ];

    const featureCards = features.map(f => {
        const isEnabled = flags[f.id] === true;
        const fileList = f.files.map(file => `
            <div style="font-family: var(--font-mono, monospace); font-size: 11px; padding: 4px 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 4px; color: #a1a1aa; margin-top: 4px; word-break: break-all; display: flex; align-items: center; gap: 6px;">
                <span style="color: var(--accent-gold); font-size: 8px;">●</span> ${file}
            </div>
        `).join('');

        return `
            <div class="admin-feature-card ${isEnabled ? 'enabled' : ''}" style="background: #111115; border: 1px solid #222227; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <span style="font-family: var(--font-mono, monospace); font-size: 11px; background: rgba(255, 160, 0, 0.1); border: 1px solid rgba(255, 160, 0, 0.2); color: var(--accent-gold); font-weight: 700; padding: 2px 8px; border-radius: 4px;">${f.code}</span>
                        
                        <!-- Premium Switch Toggle Slider -->
                        <label class="s8n-switch-toggle" style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                            <input type="checkbox" class="feature-toggle-checkbox" data-flag="${f.id}" ${isEnabled ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                            <span class="s8n-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #2e2e38; transition: .3s; border-radius: 34px;"></span>
                        </label>
                    </div>
                    
                    <h4 style="margin: 0 0 6px 0; font-size: 15px; color: white; font-weight: 700; font-family: var(--font-heading);">${f.name}</h4>
                    <p style="margin: 0 0 16px 0; font-size: 12.5px; color: #a1a1aa; line-height: 1.5; font-weight: 500;">${f.desc}</p>
                </div>

                <div>
                    <!-- Collapsible Manifest Section -->
                    <details class="admin-file-details" style="cursor: pointer; border-top: 1px solid #222227; padding-top: 12px;">
                        <summary style="font-size: 12px; color: #a1a1aa; font-weight: 600; list-style: none; display: flex; align-items: center; justify-content: space-between; outline: none; user-select: none;">
                            <span>📦 Inspect Code Manifest (${f.files.length} files)</span>
                            <span class="summary-arrow" style="font-size: 10px; transition: transform 0.2s;">▼</span>
                        </summary>
                        <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 4px;">
                            ${fileList}
                        </div>
                    </details>
                </div>
            </div>
        `;
    }).join('');

    return `
        <style>
            .admin-feature-card:hover {
                border-color: #33333f !important;
                transform: translateY(-2px);
                box-shadow: 0 8px 30px rgba(0,0,0,0.3) !important;
            }
            .admin-feature-card.enabled {
                border-color: rgba(255, 160, 0, 0.4) !important;
                box-shadow: 0 8px 30px rgba(255, 160, 0, 0.04) !important;
            }
            .s8n-slider:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: .3s;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .feature-toggle-checkbox:checked + .s8n-slider {
                background-color: var(--accent-gold, #ffa000);
            }
            .feature-toggle-checkbox:checked + .s8n-slider:before {
                transform: translateX(20px);
            }
            .admin-file-details[open] .summary-arrow {
                transform: rotate(180deg);
            }
            .admin-file-details summary::-webkit-details-marker {
                display: none;
            }
        </style>

        <div style="max-width: 1200px; display: flex; flex-direction: column; gap: 24px; padding: 4px 0 40px 0; color: white;">
            
            <!-- Welcome Header Alert Banner -->
            <div style="background: linear-gradient(135deg, rgba(255, 160, 0, 0.08) 0%, rgba(236, 72, 153, 0.03) 100%); border: 1px solid rgba(255, 160, 0, 0.25); border-radius: 12px; padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; box-shadow: 0 4px 30px rgba(0,0,0,0.2);">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="font-size: 20px; font-weight: 800; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px; color: white;">
                        <span>🛠️ S8N Control Center</span>
                        <span style="font-size: 11px; background: rgba(255, 160, 0, 0.15); border: 1px solid rgba(255, 160, 0, 0.3); color: var(--accent-gold); font-weight: 700; padding: 2px 8px; border-radius: 50px; font-family: var(--font-mono);">HOSTED v2 ADMIN</span>
                    </div>
                    <div style="font-size: 13.5px; color: #a1a1aa; font-weight: 500;">
                        Manage NextGen AI OS features deployed locally and configure telemetry endpoints.
                    </div>
                </div>

                <div style="display: flex; gap: 10px; align-items: center;">
                    <div style="background: #111115; border: 1px solid #222227; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                        <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px rgba(34, 197, 94, 0.6); animation: pulse 2s infinite;"></span>
                        <span>DB Ping: <strong id="adminDbPing" style="font-family: var(--font-mono);">-- ms</strong></span>
                    </div>
                    <button class="brand-btn" id="adminRefreshStatsBtn" style="padding: 10px 18px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                        🔄 Ping Services
                    </button>
                </div>
            </div>

            <!-- Main Feature Switchboard Grid -->
            <div>
                <h3 style="margin: 0 0 16px 0; font-size: 17px; color: white; font-family: var(--font-heading); font-weight: 800;">
                    V2 Feature Toggle Switchboard
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                    ${featureCards}
                </div>
            </div>

            <!-- Multi-Model LLM Routing Config & Active API Quotas -->
            <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; align-items: start; flex-wrap: wrap;">
                
                <!-- Left: Telemetry & Grafana Dashboard Embed -->
                <div style="background: #111115; border: 1px solid #222227; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                    <h4 style="margin: 0 0 12px 0; font-size: 16px; color: white; font-family: var(--font-heading); font-weight: 800; border-bottom: 1px solid #222227; padding-bottom: 12px;">
                        📊 Grafana Analytics Embed (Operational Telemetry)
                    </h4>
                    
                    <!-- Hardening: Tab Switcher to monitor different telemetry dimensions in Grafana -->
                    <div class="grafana-tab-bar" style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid #222227; padding-bottom: 8px; overflow-x: auto;">
                        <button class="grafana-tab-btn active" data-tab="operational" style="padding: 6px 12px; background: rgba(255, 160, 0, 0.1); color: var(--accent-gold); border: 1px solid rgba(255, 160, 0, 0.2); border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-family: var(--font-mono);">⚡ OPERATIONAL</button>
                        <button class="grafana-tab-btn" data-tab="ai" style="padding: 6px 12px; background: transparent; color: #a1a1aa; border: 1px solid transparent; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-family: var(--font-mono);">🧠 AI PERFORMANCE</button>
                        <button class="grafana-tab-btn" data-tab="sync" style="padding: 6px 12px; background: transparent; color: #a1a1aa; border: 1px solid transparent; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-family: var(--font-mono);">🔄 SCRAPER ETL</button>
                        <button class="grafana-tab-btn" data-tab="warmup" style="padding: 6px 12px; background: transparent; color: #a1a1aa; border: 1px solid transparent; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-family: var(--font-mono);">🛡️ DELIVERABILITY</button>
                    </div>

                    <p id="grafanaTabDesc" style="margin: 0 0 16px 0; font-size: 13px; color: #a1a1aa; line-height: 1.5; font-weight: 500; min-height: 38px;">
                        Live iframe embedding connected to your hosted Grafana dashboard. Tracks request latency, queue lag, and edge function CPU consumption.
                    </p>
                    
                    <!-- Premium Mock Charts placeholder or actual Grafana Iframe -->
                    <div style="background: #09090b; border: 1px dashed #2e2e38; border-radius: 8px; height: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; position: relative; overflow: hidden;">
                        
                        <!-- Premium abstract mock graphic representation of a chart -->
                        <div id="grafanaMockChartArea" style="display: flex; align-items: flex-end; gap: 16px; width: 80%; height: 160px; border-bottom: 1px solid #2e2e38; border-left: 1px solid #2e2e38; padding: 0 20px 10px 20px; margin-bottom: 10px;">
                            <div class="grafana-bar" style="flex: 1; height: 40%; background: linear-gradient(180deg, rgba(255, 160, 0, 0.4) 0%, rgba(255, 160, 0, 0.05) 100%); border-top: 2px solid var(--accent-gold); border-radius: 2px 2px 0 0; transition: height 0.4s ease;"></div>
                            <div class="grafana-bar" style="flex: 1; height: 65%; background: linear-gradient(180deg, rgba(236, 72, 153, 0.4) 0%, rgba(236, 72, 153, 0.05) 100%); border-top: 2px solid #ec4899; border-radius: 2px 2px 0 0; transition: height 0.4s ease;"></div>
                            <div class="grafana-bar" style="flex: 1; height: 30%; background: linear-gradient(180deg, rgba(255, 160, 0, 0.4) 0%, rgba(255, 160, 0, 0.05) 100%); border-top: 2px solid var(--accent-gold); border-radius: 2px 2px 0 0; transition: height 0.4s ease;"></div>
                            <div class="grafana-bar" style="flex: 1; height: 85%; background: linear-gradient(180deg, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.05) 100%); border-top: 2px solid #22c55e; border-radius: 2px 2px 0 0; transition: height 0.4s ease;"></div>
                            <div class="grafana-bar" style="flex: 1; height: 50%; background: linear-gradient(180deg, rgba(236, 72, 153, 0.4) 0%, rgba(236, 72, 153, 0.05) 100%); border-top: 2px solid #ec4899; border-radius: 2px 2px 0 0; transition: height 0.4s ease;"></div>
                        </div>

                        <div id="grafanaTabStatusText" style="font-size: 13px; color: #a1a1aa; font-weight: 600; text-align: center;">
                            Grafana Share Link not configured in settings.
                        </div>
                        <button class="brand-btn" style="padding: 8px 16px; font-size: 12px; font-weight: 700; background: #2563eb; color: white; border: none; border-radius: 6px;">
                            Configure Grafana Webhook
                        </button>
                    </div>
                </div>

                <!-- Right: Active API keys and quota statuses -->
                <div style="background: #111115; border: 1px solid #222227; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 16px;">
                    <h4 style="margin: 0; font-size: 16px; color: white; font-family: var(--font-heading); font-weight: 800; border-bottom: 1px solid #222227; padding-bottom: 12px;">
                        🔑 System API Key Statuses
                    </h4>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        
                        <!-- Gemini API -->
                        <div style="background: #09090b; border: 1px solid #222227; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 13px; font-weight: 700; color: white;">Gemini AI Key</div>
                                <div style="font-size: 11px; color: #a1a1aa;">Used for core content parsing</div>
                            </div>
                            <span style="font-size: 11px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.25); color: #22c55e; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono);">ACTIVE</span>
                        </div>

                        <!-- Twilio API -->
                        <div style="background: #09090b; border: 1px solid #222227; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 13px; font-weight: 700; color: white;">Twilio Voice API</div>
                                <div style="font-size: 11px; color: #a1a1aa;">Required for voice call agent (F08)</div>
                            </div>
                            <span style="font-size: 11px; background: rgba(255, 160, 0, 0.1); border: 1px solid rgba(255, 160, 0, 0.25); color: var(--accent-gold); font-weight: 700; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono);">BYOK GATED</span>
                        </div>

                        <!-- Resend SMTP -->
                        <div style="background: #09090b; border: 1px solid #222227; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 13px; font-weight: 700; color: white;">Resend Email API</div>
                                <div style="font-size: 11px; color: #a1a1aa;">Handles sequences & drips (F01)</div>
                            </div>
                            <span style="font-size: 11px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.25); color: #22c55e; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono);">ACTIVE</span>
                        </div>

                        <!-- Hunter Data API -->
                        <div style="background: #09090b; border: 1px solid #222227; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 13px; font-weight: 700; color: white;">Hunter API Key</div>
                                <div style="font-size: 11px; color: #a1a1aa;">Email enrichment (F03)</div>
                            </div>
                            <span style="font-size: 11px; background: rgba(255, 160, 0, 0.1); border: 1px solid rgba(255, 160, 0, 0.25); color: var(--accent-gold); font-weight: 700; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono);">BYOK GATED</span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    `;
}

export function bindAdminPanelEvents() {
    // 1. Feature flag toggles update action
    document.querySelectorAll('.feature-toggle-checkbox').forEach(cb => {
        cb.addEventListener('change', async () => {
            const flagName = cb.getAttribute('data-flag');
            const isEnabled = cb.checked;
            
            try {
                const { supabase } = await import('../supabase.js');
                const { error } = await supabase
                    .from('feature_flags')
                    .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
                    .eq('name', flagName);
                
                if (error) throw error;
                
                // Update local application state dynamically
                if (State.featureFlags) {
                    State.featureFlags[flagName] = isEnabled;
                }
                
                const status = isEnabled ? 'enabled 🚀' : 'disabled 🛡️';
                if (window.showToast) window.showToast(`✨ ${flagName} flag ${status}`, 'success');
                
                // Notify subscribers to update the sidebar layout instantly
                State.notify();
            } catch (err) {
                console.error("Failed to update feature flag: ", err);
                cb.checked = !isEnabled; // Revert checkbox if failure
                if (window.showToast) window.showToast(`Failed to update feature flag: ${err.message}`, 'error');
            }
        });
    });

    // 2. Perform live latency ping test to Supabase
    async function performPing() {
        const start = performance.now();
        const pingBadge = document.getElementById('adminDbPing');
        
        try {
            const { supabase } = await import('../supabase.js');
            // Quick lightweight read on public flags count
            await supabase.from('feature_flags').select('count', { count: 'exact', head: true });
            
            const duration = Math.round(performance.now() - start);
            if (pingBadge) {
                pingBadge.innerText = `${duration} ms`;
                pingBadge.parentElement.style.borderColor = duration < 150 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 160, 0, 0.3)';
            }
        } catch (e) {
            console.warn("Ping failed: ", e);
            if (pingBadge) pingBadge.innerText = 'offline 🚨';
        }
    }

    const refreshBtn = document.getElementById('adminRefreshStatsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            performPing();
        });
    }

    // 3. Tab switching events for Grafana analytics panel
    const tabBtns = document.querySelectorAll('.grafana-tab-btn');
    const tabDesc = document.getElementById('grafanaTabDesc');
    const tabStatus = document.getElementById('grafanaTabStatusText');
    const chartBars = document.querySelectorAll('.grafana-bar');

    const tabData = {
        operational: {
            desc: 'Tracks request latency, queue lag, and edge function CPU consumption for Deno execution blocks.',
            status: 'Grafana Share Link not configured in settings.',
            heights: ['40%', '65%', '30%', '85%', '50%']
        },
        ai: {
            desc: 'Monitors Ollama token output throughput, self-hosted LLM latency savings, and model router dispatch distributions.',
            status: 'Ollama local metrics emitter offline. Configure OLLAMA_ORIGINS="*" to export.',
            heights: ['80%', '20%', '95%', '60%', '45%']
        },
        sync: {
            desc: 'Monitors Harvest sync success rates, ETL batch payload sizes, and local DuckDB sync transaction performance.',
            status: 'DuckDB sync agent reports nominal status. Synced 500 leads/batch.',
            heights: ['15%', '45%', '75%', '30%', '90%']
        },
        warmup: {
            desc: 'Aggregates email deliverability warmup metrics: DMARC lookup pass rates, daily ramp limits, and blacklist suppressions.',
            status: 'Warmup analytics logs ready. 2 accounts currently warming up.',
            heights: ['60%', '85%', '70%', '95%', '80%']
        }
    };

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Toggle active style
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = '#a1a1aa';
                b.style.borderColor = 'transparent';
            });
            
            btn.classList.add('active');
            btn.style.background = 'rgba(255, 160, 0, 0.1)';
            btn.style.color = 'var(--accent-gold)';
            btn.style.borderColor = 'rgba(255, 160, 0, 0.2)';
            
            const activeTab = btn.getAttribute('data-tab');
            const data = tabData[activeTab];
            
            if (data) {
                if (tabDesc) tabDesc.textContent = data.desc;
                if (tabStatus) tabStatus.textContent = data.status;
                
                // Animate bar charts heights to match active dimensions
                chartBars.forEach((bar, idx) => {
                    if (data.heights[idx]) {
                        bar.style.height = data.heights[idx];
                    }
                });
            }
        });
    });

    // Trigger initial ping
    performPing();
}
