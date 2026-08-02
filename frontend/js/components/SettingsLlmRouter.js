import { LlmApi } from '../api/llm.js';
import { State } from '../state.js';

export function renderSettingsLlmRouter() {
    return `
        <div class="settings-llm-container" style="max-width: 1100px; display: flex; flex-direction: column; gap: 24px; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            
            <!-- Header Metrics Hub -->
            <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-radius: 16px; padding: 28px; color: white; box-shadow: 0 10px 25px -5px rgba(30, 27, 75, 0.2); border: 1px solid #312e81; position: relative; overflow: hidden;">
                <!-- Decorative background light -->
                <div style="position: absolute; top: -50px; right: -50px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%); pointer-events: none;"></div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; position: relative; z-index: 2;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                            <h3 style="margin: 0; font-size: 22px; font-family: var(--font-heading); font-weight: 800; display: flex; align-items: center; gap: 10px;">
                                🧠 S8N AI Model Routing Center
                            </h3>
                            <span style="background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); border: none; color: #78350f; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 99px; text-transform: uppercase; box-shadow: 0 4px 10px rgba(217, 119, 6, 0.2);">
                                Beta
                            </span>
                        </div>
                        <p style="color: #94a3b8; font-size: 13.5px; margin: 0; max-width: 650px; line-height: 1.5;">
                            Save on API costs and enable offline operations by routing individual NearPro features to your local Ollama server or LiteLLM proxy gateway.
                        </p>
                    </div>

                    <!-- Savings Odometer Widget -->
                    <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px 24px; text-align: right; min-width: 220px; backdrop-filter: blur(10px);">
                        <div style="font-size: 11px; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; font-weight: 700; margin-bottom: 4px; letter-spacing: 0.5px;">
                            💰 Estimated INR Savings
                        </div>
                        <div style="display: flex; align-items: baseline; justify-content: flex-end; gap: 4px;">
                            <span style="font-size: 16px; color: #34d399; font-weight: 700;">₹</span>
                            <span id="aiSavingsOdometer" style="font-size: 28px; font-weight: 900; color: #34d399; font-family: var(--font-mono); transition: all 1s ease;">0</span>
                        </div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 500;">
                            Using local models instead of cloud
                        </div>
                    </div>
                </div>

                <!-- Usage Gauge Bar -->
                <div style="margin-top: 24px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); padding: 16px 20px; border-radius: 10px; position: relative; z-index: 2;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 8px;">
                        <span>Monthly Cloud Token Usage: <strong id="llmMonthlyUsageLabel" style="color: white; font-family: var(--font-mono);">0 / 10,000</strong></span>
                        <span id="llmUsagePercentageLabel" style="font-family: var(--font-mono);">0%</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden;">
                        <div id="llmUsageBarFill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%); border-radius: 99px; transition: width 0.6s ease;"></div>
                    </div>
                </div>
            </div>

            <!-- Main Work Split Grid -->
            <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; align-items: start;">
                
                <!-- Left: Providers & Add Provider -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.02);">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 18px;">
                            <h4 style="margin: 0; color: #0f172a; font-family: var(--font-heading); font-size: 16px; font-weight: 800;">
                                Connected AI Providers
                            </h4>
                            <button id="addLlmProviderBtn" class="brand-btn" style="padding: 8px 16px; font-size: 12.5px; font-weight: 700; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                ➕ Add Provider
                            </button>
                        </div>

                        <!-- Providers List Stack -->
                        <div id="llmProvidersContainer" style="display: flex; flex-direction: column; gap: 14px;">
                            <div style="text-align: center; color: #64748b; font-size: 13.5px; padding: 30px 0;">
                                Loading providers...
                            </div>
                        </div>
                    </div>

                    <!-- Feature Mappings assignment Grid -->
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.02);">
                        <h4 style="margin: 0 0 14px 0; color: #0f172a; font-family: var(--font-heading); font-size: 16px; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
                            Feature-Level AI Model Assignment
                        </h4>

                        <div id="fallbackBanner" style="display: none; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin-bottom: 18px; align-items: center; gap: 10px; font-size: 12.5px; color: #b45309; font-weight: 600;">
                            <span style="font-size: 16px;">⚠️</span>
                            <span>One or more features are mapped to offline/unresponsive local models. Fallback routes will automatically redirect queries to cloud Gemini APIs.</span>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 16px;" id="llmRoutingGrid">
                            <!-- Feature assignment rows will be inserted here dynamically -->
                        </div>

                        <button id="saveLlmRoutingBtn" class="brand-btn" style="width: 100%; padding: 12px; font-weight: 800; cursor: pointer; font-size: 13.5px; background: #2563eb; color: white; border: none; border-radius: 8px; margin-top: 20px; box-shadow: 0 4px 12px rgba(37,99,235,0.2);">
                            Save Model Mappings
                        </button>
                    </div>

                </div>

                <!-- Right: Interactive Benchmarking suite -->
                <div style="display: flex; flex-direction: column; gap: 20px; position: sticky; top: 20px;">
                    
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.02);">
                        <h4 style="margin: 0 0 4px 0; color: #0f172a; font-family: var(--font-heading); font-size: 16px; font-weight: 800;">
                            📊 Model Benchmarking Suite
                        </h4>
                        <p style="color: #64748b; font-size: 12.5px; margin: 0 0 16px 0; line-height: 1.4;">
                            Run standard generation latency & quality checks to compare cloud and local model performances side-by-side.
                        </p>

                        <!-- Benchmark List Stack -->
                        <div id="llmBenchmarkList" style="display: flex; flex-direction: column; gap: 16px;">
                            <!-- Benchmark entries dynamically rendered -->
                        </div>

                        <div id="benchmarkLoadingOverlay" style="display: none; text-align: center; padding: 20px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; margin-top: 14px;">
                            <div class="benchmark-radar-pulse" style="width: 24px; height: 24px; border: 3px solid #2563eb; border-radius: 50%; border-top-color: transparent; animation: spin 0.8s linear infinite; margin: 0 auto 10px auto;"></div>
                            <span style="font-size: 12.5px; color: #475569; font-weight: 600;" id="benchmarkStatusText">Auto-evaluating Hinglish response...</span>
                        </div>

                        <!-- Recommendations Recommendation Box -->
                        <div id="benchmarkRecommendationBox" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-top: 16px; font-size: 13px; color: #166534; font-weight: 600; line-height: 1.45;">
                            <!-- Populated with benchmark feedback -->
                        </div>
                    </div>

                    <!-- Marketplace teaser card -->
                    <div style="background: #ffffff; border-radius: 12px; padding: 20px; color: #0f172a; border: 1px solid #cbd5e1; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                        <span style="position: absolute; top: 12px; right: 12px; background: #f8fafc; border: 1px solid #cbd5e1; font-size: 10px; font-family: var(--font-mono); padding: 2px 8px; border-radius: 4px; font-weight: 700; color: #475569;">Local registry</span>
                        <h5 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 800; font-family: var(--font-heading); color: #0f172a;">🦙 Ollama Model Registry</h5>
                        <p style="font-size: 12px; color: #475569; line-height: 1.4; margin: 0 0 12px 0;">
                            Get optimal hinges/English speeds using the latest small models:
                        </p>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; justify-content: space-between; font-size: 11.5px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 6px; color: #0f172a;">
                                <span>llama3.2:1b (Fast Hinglish)</span>
                                <strong style="color: #16a34a;">1.3 GB</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 11.5px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 6px; color: #0f172a;">
                                <span>gemma2:2b (Google Local)</span>
                                <strong style="color: #16a34a;">1.6 GB</strong>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <!-- Modal for Adding Provider -->
            <div id="addProviderModal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 10000; align-items: center; justify-content: center;">
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 500px; width: 90%; padding: 28px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0; font-size: 18px; font-weight: 800; font-family: var(--font-heading);">Add AI Provider</h3>
                        <button id="closeAddProviderModal" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b;">&times;</button>
                    </div>

                    <!-- Provider Selection Cards Grid -->
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">SELECT PROVIDER TYPE:</label>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                        <div class="provider-type-card active" data-type="ollama" style="border: 2px solid #2563eb; background: #eff6ff; padding: 12px; border-radius: 8px; text-align: center; cursor: pointer;">
                            <span style="font-size: 20px; display: block; margin-bottom: 4px;">🦙</span>
                            <span style="font-size: 12px; font-weight: 700; color: #1e3a8a;">Ollama</span>
                        </div>
                        <div class="provider-type-card" data-type="gemini" style="border: 1px solid #cbd5e1; background: #ffffff; padding: 12px; border-radius: 8px; text-align: center; cursor: pointer;">
                            <span style="font-size: 20px; display: block; margin-bottom: 4px;">✨</span>
                            <span style="font-size: 12px; font-weight: 700; color: #475569;">Gemini</span>
                        </div>
                        <div class="provider-type-card" data-type="litellm" style="border: 1px solid #cbd5e1; background: #ffffff; padding: 12px; border-radius: 8px; text-align: center; cursor: pointer;">
                            <span style="font-size: 20px; display: block; margin-bottom: 4px;">⚡</span>
                            <span style="font-size: 12px; font-weight: 700; color: #475569;">LiteLLM</span>
                        </div>
                    </div>

                    <!-- Conditional Form Content -->
                    <div style="display: flex; flex-direction: column; gap: 16px;" id="addProviderFormFields">
                        
                        <!-- Base URL -->
                        <div id="providerUrlContainer">
                            <label style="display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 6px;">Server Endpoint URL</label>
                            <input type="text" id="providerBaseUrl" value="http://localhost:11434" placeholder="http://localhost:11434" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: var(--radius-sm); color: #0f172a; font-size: 13.5px; font-weight: 600;" />
                        </div>

                        <!-- API Key -->
                        <div id="providerKeyContainer" style="display: none;">
                            <label style="display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 6px;">API Key</label>
                            <input type="password" id="providerApiKey" placeholder="Enter provider api secret key..." style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: var(--radius-sm); color: #0f172a; font-size: 13.5px; font-weight: 600;" />
                        </div>

                        <!-- Detect Models (Ollama specific) -->
                        <div id="ollamaDetectContainer" style="margin-top: 4px;">
                            <button id="detectOllamaModelsBtn" class="secondary-btn" style="width: 100%; padding: 8px 12px; font-size: 12px; font-weight: 700; border: 1px solid #cbd5e1; border-radius: 6px; background: white; cursor: pointer; color: #334155;">
                                🔍 Auto-Detect Downloaded Models
                            </button>
                        </div>

                        <!-- Model Selection -->
                        <div>
                            <label style="display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 6px;">Model Identifier</label>
                            <select id="providerModelSelect" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: var(--radius-sm); color: #0f172a; font-size: 13.5px; font-weight: 600;">
                                <option value="llama3.1:8b">llama3.1:8b (Default)</option>
                                <option value="gemma2:9b">gemma2:9b</option>
                                <option value="mistral:7b">mistral:7b</option>
                            </select>
                            <input type="text" id="providerModelInput" placeholder="e.g. llama3.1:8b" style="display: none; width: 100%; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: var(--radius-sm); color: #0f172a; font-size: 13.5px; font-weight: 600;" />
                        </div>

                        <!-- Friendly Name -->
                        <div>
                            <label style="display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 6px;">Configuration Name</label>
                            <input type="text" id="providerFriendlyName" placeholder="e.g. My Local Llama" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: var(--radius-sm); color: #0f172a; font-size: 13.5px; font-weight: 600;" />
                        </div>

                    </div>

                    <!-- Connect / Status Actions -->
                    <div style="margin-top: 24px; display: flex; gap: 12px; justify-content: flex-end;">
                        <button id="testNewProviderBtn" style="padding: 10px 18px; font-size: 13px; font-weight: 700; background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; border-radius: 8px; cursor: pointer;">
                            Test Connection
                        </button>
                        <button id="saveNewProviderBtn" style="padding: 10px 18px; font-size: 13px; font-weight: 700; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                            Add Provider
                        </button>
                    </div>
                </div>
            </div>

        </div>
    `;
}

export async function initSettingsLlmRouter() {
    let providers = [];
    let stats = { logs: [], totalSavings: 0, tokensUsed: 0, tokensLimit: 10000 };
    
    // Feature List configuration
    const features = [
        { id: 'outreach', label: 'AI Outreach Generation' },
        { id: 'scripts', label: 'Tele-Sales Cold Call Scripts' },
        { id: 'proposals', label: 'PDF Proposal Generation' },
        { id: 'research', label: 'AI Market Research & Scraping' },
        { id: 'crm', label: 'CRM Objection Rebuttals' },
        { id: 'voice', label: 'AI Voice Calling Agent' }
    ];

    // Reload all data
    const refreshData = async () => {
        try {
            providers = await LlmApi.getProviders();
            stats = await LlmApi.getUsageStats();
            
            updateMetricsHub();
            renderProvidersList();
            renderRoutingGrid();
            renderBenchmarkView();
        } catch (e) {
            console.error("Failed to load AI providers settings:", e);
        }
    };

    // Update the visual metrics gauges and savings counter
    const updateMetricsHub = () => {
        // Roll-up animation for savings
        const savingsEl = document.getElementById('aiSavingsOdometer');
        if (savingsEl) {
            let start = 0;
            const end = Math.round(stats.totalSavings);
            if (end > 0) {
                const duration = 1000; // 1s
                const stepTime = Math.max(Math.floor(duration / end), 10);
                const timer = setInterval(() => {
                    start += Math.ceil(end / 40);
                    if (start >= end) {
                        savingsEl.innerText = end.toLocaleString('en-IN');
                        clearInterval(timer);
                    } else {
                        savingsEl.innerText = start.toLocaleString('en-IN');
                    }
                }, stepTime);
            } else {
                savingsEl.innerText = '0';
            }
        }

        // Token usage gauge
        const limit = stats.tokensLimit || 10000;
        const used = stats.tokensUsed || 0;
        const pct = Math.min(Math.round((used / limit) * 100), 100);
        
        const usageLabel = document.getElementById('llmMonthlyUsageLabel');
        const percentageLabel = document.getElementById('llmUsagePercentageLabel');
        const fill = document.getElementById('llmUsageBarFill');

        if (usageLabel) usageLabel.innerText = `${used.toLocaleString()} / ${limit.toLocaleString()} tokens`;
        if (percentageLabel) percentageLabel.innerText = `${pct}%`;
        if (fill) fill.style.width = `${pct}%`;
    };

    // Render list of connected provider cards
    const renderProvidersList = () => {
        const container = document.getElementById('llmProvidersContainer');
        if (!container) return;

        if (providers.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; border: 1.5px dashed #cbd5e1; border-radius: 8px; padding: 30px; background: #f8fafc;">
                    <div style="font-size: 24px; margin-bottom: 8px;">🧠</div>
                    <div style="font-weight: 700; color: #334155; font-size: 14px; margin-bottom: 4px;">No custom providers configured</div>
                    <div style="color: #64748b; font-size: 12px; max-width: 320px; margin: 0 auto 12px auto; line-height: 1.45;">
                        NearPro routes all requests directly to the cloud Gemini 2.5 Flash API by default.
                    </div>
                    <button class="secondary-btn" id="emptyProvidersAddBtn" style="padding: 6px 14px; border: 1px solid #2563eb; color: #2563eb; background: white; font-weight: 700; border-radius: 6px;">
                        Connect Ollama (Local)
                    </button>
                </div>
            `;
            document.getElementById('emptyProvidersAddBtn')?.addEventListener('click', () => {
                document.getElementById('addProviderModal').style.display = 'flex';
            });
            return;
        }

        container.innerHTML = providers.map(p => {
            const isOllama = p.provider_type === 'ollama';
            const statusLight = p.health_status === 'healthy' ? '#10b981' : p.health_status === 'slow' ? '#f59e0b' : '#ef4444';
            
            return `
                <div style="border: 1px solid ${p.is_default ? '#bfdbfe' : '#e2e8f0'}; background: ${p.is_default ? '#eff6ff' : '#ffffff'}; padding: 18px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; position: relative;">
                    ${p.is_default ? `<span style="position: absolute; top: -10px; right: 14px; background: #2563eb; color: white; font-size: 10px; font-weight: 800; font-family: var(--font-mono); padding: 2px 10px; border-radius: 20px; border: 1.5px solid white;">DEFAULT</span>` : ''}
                    
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${statusLight}; display: inline-block; box-shadow: 0 0 8px ${statusLight};"></span>
                            <strong style="font-size: 15px; color: #0f172a; font-family: var(--font-heading);">${p.name}</strong>
                            <span style="font-size: 11px; background: #e2e8f0; color: #475569; padding: 2px 6px; border-radius: 4px; font-weight: 700; text-transform: uppercase;">
                                ${p.provider_type}
                            </span>
                        </div>
                        <div style="font-size: 12.5px; color: #64748b; font-weight: 500;">
                            ${isOllama ? `Host: <code>${p.base_url}</code>` : 'Cloud Integration Platform'}
                        </div>
                        <div style="font-size: 12px; color: #475569; font-weight: 600; margin-top: 6px; display: flex; gap: 14px;">
                            <span>Model ID: <code style="background: rgba(0,0,0,0.04); padding: 1px 4px; border-radius: 3px;">${p.model_id}</code></span>
                            ${p.avg_latency_ms ? `<span>Latency: <strong>${p.avg_latency_ms}ms</strong></span>` : ''}
                        </div>
                    </div>

                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="secondary-btn test-prov-btn" data-id="${p.id}" style="padding: 6px 12px; font-size: 12px; font-weight: 700; border: 1px solid #cbd5e1; border-radius: 6px; background: white; cursor: pointer; color: #334155;">
                            Test
                        </button>
                        ${!p.is_default ? `
                            <button class="secondary-btn def-prov-btn" data-id="${p.id}" style="padding: 6px 12px; font-size: 12px; font-weight: 700; border: 1px solid #cbd5e1; border-radius: 6px; background: white; cursor: pointer; color: #334155;">
                                Set Default
                            </button>
                        ` : ''}
                        <button class="secondary-btn del-prov-btn" data-id="${p.id}" style="padding: 6px 12px; font-size: 12px; font-weight: 700; border: 1px solid #fee2e2; border-radius: 6px; background: white; cursor: pointer; color: #ef4444;">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Bind list buttons
        container.querySelectorAll('.test-prov-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const prov = providers.find(x => x.id === id);
                if (!prov) return;
                
                btn.innerText = 'Testing...';
                const res = await LlmApi.testConnection(prov);
                btn.innerText = 'Test';
                
                // Update configuration status lights
                await LlmApi.saveProvider({ ...prov, health_status: res.status, avg_latency_ms: res.latency_ms || null });
                refreshData();

                alert(res.success 
                    ? `🟢 Connection verified successfully! Latency: ${res.latency_ms}ms.` 
                    : `🔴 Connection check failed: ${res.message}`
                );
            });
        });

        container.querySelectorAll('.def-prov-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const prov = providers.find(x => x.id === id);
                if (!prov) return;
                await LlmApi.saveProvider({ ...prov, is_default: true });
                refreshData();
            });
        });

        container.querySelectorAll('.del-prov-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm("Are you sure you want to remove this AI provider configuration?")) return;
                const id = btn.getAttribute('data-id');
                await LlmApi.deleteProvider(id);
                refreshData();
            });
        });
    };

    // Render feature-to-model routing table dropdown rows
    const renderRoutingGrid = () => {
        const grid = document.getElementById('llmRoutingGrid');
        if (!grid) return;

        // Check if any active configuration has error health status
        const hasOffline = providers.some(p => p.health_status === 'error' || p.health_status === 'offline');
        document.getElementById('fallbackBanner').style.display = hasOffline ? 'flex' : 'none';

        grid.innerHTML = features.map(f => {
            // Find which provider maps to this feature
            let selectedProviderId = ''; // Empty defaults to Cloud Gemini
            providers.forEach(p => {
                let useList = [];
                try {
                    useList = typeof p.use_for === 'string' ? JSON.parse(p.use_for) : p.use_for || [];
                } catch(e){}
                if (useList.includes(f.id)) {
                    selectedProviderId = p.id;
                }
            });

            const options = providers.map(p => `
                <option value="${p.id}" ${selectedProviderId === p.id ? 'selected' : ''}>
                    ${p.provider_type === 'ollama' ? '🦙' : '⚡'} ${p.name} (${p.model_id})
                </option>
            `).join('');

            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <div style="font-weight: 700; color: #0f172a; font-size: 14px; font-family: var(--font-heading);">${f.label}</div>
                        <div style="font-size: 11.5px; color: #64748b; font-weight: 500;">AI model executing request tasks</div>
                    </div>
                    <div>
                        <select class="feature-route-select" data-feature="${f.id}" style="padding: 8px 12px; background: white; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 13px; font-weight: 600; color: #334155; outline: none; min-width: 240px;">
                            <option value="">✨ Gemini 2.5 Flash (Global Cloud Default)</option>
                            ${options}
                        </select>
                    </div>
                </div>
            `;
        }).join('');
    };

    // Render benchmark rows
    const renderBenchmarkView = () => {
        const benchmarkContainer = document.getElementById('llmBenchmarkList');
        if (!benchmarkContainer) return;

        if (providers.length === 0) {
            benchmarkContainer.innerHTML = `
                <div style="text-align: center; color: #94a3b8; font-size: 12px; padding: 20px 0;">
                    Connect a provider to enable live benchmarking comparisons.
                </div>
            `;
            return;
        }

        // Render comparisons
        benchmarkContainer.innerHTML = providers.map(p => {
            const isGemini = p.provider_type === 'gemini';
            const latencyVal = p.avg_latency_ms || (isGemini ? 320 : 180);
            const scoreVal = isGemini ? 9.2 : 7.8;
            
            // Map percentage bar calculations
            const speedPct = Math.min(Math.round((300 / latencyVal) * 100), 100);
            const qualityPct = Math.round(scoreVal * 10);

            return `
                <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #ffffff;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 13.5px; font-weight: 700; color: #334155;">${p.name} (${p.model_id})</span>
                        <button class="secondary-btn run-bench-btn" data-id="${p.id}" style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border: 1px solid #2563eb; color: #2563eb; background: white; border-radius: 4px; cursor: pointer;">
                            Benchmark
                        </button>
                    </div>
                    
                    <!-- Latency Speed Bar -->
                    <div style="margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: #64748b; margin-bottom: 4px;">
                            <span>Speed (Response Latency)</span>
                            <strong>${latencyVal}ms</strong>
                        </div>
                        <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden;">
                            <div style="width: ${speedPct}%; height: 100%; background: #3b82f6; border-radius: 10px;"></div>
                        </div>
                    </div>

                    <!-- Quality Bar -->
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: #64748b; margin-bottom: 4px;">
                            <span>Quality (Hinglish/English Accuracy)</span>
                            <strong>${scoreVal}/10</strong>
                        </div>
                        <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden;">
                            <div style="width: ${qualityPct}%; height: 100%; background: #10b981; border-radius: 10px;"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Bind benchmarks
        benchmarkContainer.querySelectorAll('.run-bench-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const prov = providers.find(x => x.id === id);
                if (!prov) return;

                const overlay = document.getElementById('benchmarkLoadingOverlay');
                const recommend = document.getElementById('benchmarkRecommendationBox');
                
                if (overlay) overlay.style.display = 'block';
                if (recommend) recommend.style.display = 'none';

                const res = await LlmApi.runBenchmark(prov, 'outreach');

                if (overlay) overlay.style.display = 'none';

                if (res.success) {
                    if (recommend) {
                        recommend.style.display = 'block';
                        recommend.innerHTML = `
                            <strong>💡 Benchmark Recommendation:</strong><br/>
                            Performance check completed! Response compiled in <strong>${res.latency_ms}ms</strong> with Hinglish compatibility rating of <strong>${res.quality_score}/10</strong>.<br/>
                            ${res.recommended ? `✅ Highly recommended to assign this model to <strong>AI Outreach</strong> and <strong>Scripts</strong> features to save costs.` : '⚠️ This model has high response delays. Recommend keeping cloud Gemini as default fallback.'}
                        `;
                    }
                    refreshData();
                } else {
                    alert(`Benchmark evaluation failed: ${res.error}`);
                }
            });
        });
    };

    // Save mapping assignments
    const saveMappings = async () => {
        const selects = document.querySelectorAll('.feature-route-select');
        const assignments = {};
        
        // Build assignments lists
        providers.forEach(p => {
            assignments[p.id] = [];
        });

        selects.forEach(sel => {
            const providerId = sel.value;
            const featureId = sel.getAttribute('data-feature');
            if (providerId && assignments[providerId]) {
                assignments[providerId].push(featureId);
            }
        });

        const saveBtn = document.getElementById('saveLlmRoutingBtn');
        if (saveBtn) saveBtn.innerText = 'Saving Mappings...';

        try {
            await LlmApi.saveFeatureAssignments(assignments);
            if (saveBtn) saveBtn.innerText = 'Save Model Mappings';
            alert("🟢 Model routing configurations saved successfully!");
            refreshData();
        } catch (e) {
            if (saveBtn) saveBtn.innerText = 'Save Model Mappings';
            alert(`🔴 Mapping failed: ${e.message}`);
        }
    };

    // Connect top header add button
    document.getElementById('addLlmProviderBtn')?.addEventListener('click', () => {
        document.getElementById('addProviderModal').style.display = 'flex';
    });

    document.getElementById('closeAddProviderModal')?.addEventListener('click', () => {
        document.getElementById('addProviderModal').style.display = 'none';
    });

    // Handle provider type switcher in modal
    const typeCards = document.querySelectorAll('.provider-type-card');
    const urlContainer = document.getElementById('providerUrlContainer');
    const keyContainer = document.getElementById('providerKeyContainer');
    const detectContainer = document.getElementById('ollamaDetectContainer');
    const modelSelect = document.getElementById('providerModelSelect');
    const modelInput = document.getElementById('providerModelInput');

    typeCards.forEach(card => {
        card.addEventListener('click', () => {
            typeCards.forEach(c => {
                c.classList.remove('active');
                c.style.border = '1px solid #cbd5e1';
                c.style.background = '#ffffff';
                c.style.color = '#475569';
            });
            card.classList.add('active');
            card.style.border = '2px solid #2563eb';
            card.style.background = '#eff6ff';
            card.style.color = '#1e3a8a';

            const type = card.getAttribute('data-type');
            if (type === 'ollama') {
                urlContainer.style.display = 'block';
                keyContainer.style.display = 'none';
                detectContainer.style.display = 'block';
                modelSelect.style.display = 'block';
                modelInput.style.display = 'none';
                document.getElementById('providerBaseUrl').value = 'http://localhost:11434';
            } else {
                urlContainer.style.display = type === 'litellm' ? 'block' : 'none';
                keyContainer.style.display = 'block';
                detectContainer.style.display = 'none';
                modelSelect.style.display = 'none';
                modelInput.style.display = 'block';
                if (type === 'gemini') {
                    document.getElementById('providerModelInput').value = 'gemini-2.5-flash';
                } else if (type === 'litellm') {
                    document.getElementById('providerBaseUrl').value = '';
                    document.getElementById('providerModelInput').value = '';
                }
            }
        });
    });

    // Detect Ollama models action
    document.getElementById('detectOllamaModelsBtn')?.addEventListener('click', async () => {
        const url = document.getElementById('providerBaseUrl').value.trim();
        const btn = document.getElementById('detectOllamaModelsBtn');
        btn.innerText = 'Detecting registry...';
        
        const models = await LlmApi.detectOllamaModels(url);
        btn.innerText = 'Auto-Detect Downloaded Models';

        if (models.length > 0) {
            modelSelect.innerHTML = models.map(m => `
                <option value="${m.name}">${m.name} (${(m.size / 1e9).toFixed(1)} GB)</option>
            `).join('');
            alert(`🟢 Detected ${models.length} models locally! Updated options.`);
        } else {
            alert("⚠️ No models detected. Ensure Ollama is running locally and origins/CORS allows connections.");
        }
    });

    // Test connectivity of provider inside modal
    document.getElementById('testNewProviderBtn')?.addEventListener('click', async () => {
        const activeCard = document.querySelector('.provider-type-card.active');
        const type = activeCard ? activeCard.getAttribute('data-type') : 'ollama';
        const url = document.getElementById('providerBaseUrl').value.trim();
        const key = document.getElementById('providerApiKey').value.trim();
        const model = type === 'ollama' ? modelSelect.value : modelInput.value.trim();
        
        const testConfig = { provider_type: type, base_url: url, encrypted_api_key: key, model_id: model };
        
        const btn = document.getElementById('testNewProviderBtn');
        btn.innerText = 'Testing...';
        const res = await LlmApi.testConnection(testConfig);
        btn.innerText = 'Test Connection';

        alert(res.success 
            ? `🟢 Connection verified! Latency: ${res.latency_ms}ms.` 
            : `🔴 Test connection failed: ${res.message}`
        );
    });

    // Save provider inside modal
    document.getElementById('saveNewProviderBtn')?.addEventListener('click', async () => {
        const activeCard = document.querySelector('.provider-type-card.active');
        const type = activeCard ? activeCard.getAttribute('data-type') : 'ollama';
        const url = document.getElementById('providerBaseUrl').value.trim();
        const key = document.getElementById('providerApiKey').value.trim();
        const model = type === 'ollama' ? modelSelect.value : modelInput.value.trim();
        const name = document.getElementById('providerFriendlyName').value.trim() || `${type.toUpperCase()} - ${model}`;

        if (!model) {
            alert("Model identifier is required!");
            return;
        }

        try {
            await LlmApi.saveProvider({
                name,
                provider_type: type,
                base_url: url || null,
                model_id: model,
                encrypted_api_key: key || null,
                is_active: true
            });

            document.getElementById('addProviderModal').style.display = 'none';
            
            // Clear inputs
            document.getElementById('providerFriendlyName').value = '';
            document.getElementById('providerApiKey').value = '';
            
            refreshData();
        } catch (err) {
            alert(`Error saving provider: ${err.message}`);
        }
    });

    document.getElementById('saveLlmRoutingBtn')?.addEventListener('click', saveMappings);

    // Load initial data
    await refreshData();
}
