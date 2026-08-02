import { State } from '../state.js';
import { Api } from '../api.js';
import { SignalsApi } from '../api/signals.js';

let detectedSignals = [];
let watchlists = [];

export function renderIntentSignals() {
    const list = detectedSignals || [];
    const watch = watchlists || [];

    // Calculate count by status
    const activeList = list.filter(s => s.status === 'new');
    
    const feedCardsHTML = activeList.length === 0 ? `
        <div style="grid-column: 1 / -1; padding: 60px 24px; text-align: center; border: 1px dashed #cbd5e1; border-radius: var(--radius-lg); background: #ffffff;">
            <div style="font-size: 48px; margin-bottom: 20px;">🔥</div>
            <h3 style="color: #0f172a; font-family: var(--font-heading); font-size: 18px; margin-bottom: 8px;">No Active Intent Signals</h3>
            <p style="color: #475569; font-size: 13.5px; max-width: 440px; margin: 0 auto 24px auto; line-height: 1.5;">
                We are scanning local hiring pages and corporate announcements. Run a manual signal check scan to check updates instantly.
            </p>
            <button class="brand-btn" id="signalsRunScanBtn" style="background: #2563eb; color: white;">Run Live Signal Scan</button>
        </div>
    ` : activeList.map(s => {
        const lead = s.professionals || {};
        const isHigh = s.signal_strength === 'critical' || s.signal_strength === 'high';
        const badgeColor = isHigh ? '#ef4444' : s.signal_strength === 'medium' ? 'var(--accent-gold)' : '#22c55e';
        const progressPct = lead.intent_score || 50;

        return `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 14px; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                
                <!-- Card Header -->
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 16px;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <span style="font-size: 10px; font-weight: 800; font-family: var(--font-mono); background: ${badgeColor}20; color: ${badgeColor}; border: 1px solid ${badgeColor}35; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
                                ${s.signal_strength.toUpperCase()}
                            </span>
                            <span style="font-size: 11.5px; color: #475569;">Detected ${new Date(s.detected_at).toLocaleTimeString()}</span>
                        </div>
                        <h4 style="margin: 0; color: #0f172a; font-family: var(--font-heading); font-size: 15px; font-weight: 800;">
                            ${s.title}
                        </h4>
                        <p style="margin: 4px 0 0 0; color: #475569; font-size: 12.5px; line-height: 1.4;">
                            ${lead.name || 'Lead Name'} in ${lead.area || 'Mumbai'}
                        </p>
                    </div>
                    
                    <!-- Score gauge -->
                    <div style="text-align: right;">
                        <span style="font-size: 12.5px; color: ${progressPct >= 75 ? '#ef4444' : 'var(--accent-gold)'}; font-weight: 800; font-family: var(--font-mono);">
                            Intent: ${progressPct}%
                        </span>
                        <div style="width: 80px; height: 4px; background: #cbd5e1; border-radius: 10px; overflow: hidden; margin-top: 4px;">
                            <div style="width: ${progressPct}%; height: 100%; background: ${progressPct >= 75 ? '#ef4444' : 'var(--accent-gold)'};"></div>
                        </div>
                    </div>
                </div>

                <!-- Info detail -->
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 12.5px; color: #475569; line-height: 1.4;">
                    ${s.description || 'No additional details.'}
                    <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
                        Source: ${s.source_name || 'Web indexer'} • Confidence: ${s.confidence}%
                    </div>
                </div>

                <!-- Actions footer -->
                <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                    <button class="brand-btn signal-action-btn view-lead" data-id="${lead.id}" style="padding: 6px 12px; font-size: 11.5px; font-weight: 700; background: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a;">
                        View Lead Details
                    </button>
                    <a href="#/dashboard/sequences" class="brand-btn" style="padding: 6px 12px; font-size: 11.5px; font-weight: 700; background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.25); color: #3b82f6; text-decoration: none; display: inline-flex; align-items: center;">
                        Email Sequence Outreach
                    </a>
                    <button class="brand-btn signal-action-btn dismiss-signal" data-id="${s.id}" style="padding: 6px 12px; font-size: 11.5px; font-weight: 700; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #22c55e;">
                        ✓ Acknowledge
                    </button>
                </div>

            </div>
        `;
    }).join('');

    // Watchlists HTML list
    const watchlistsHTML = watch.length === 0 ? `
        <div style="color: #475569; font-size: 12.5px; padding: 20px 0; text-align: center;">
            No watchlists created yet.
        </div>
    ` : watch.map(w => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 10px;">
            <div style="font-size: 13.5px; font-weight: 700; color: #0f172a;">🎯 ${w.name}</div>
            <div style="font-size: 11.5px; color: #475569; margin-top: 4px;">
                Frequency: ${w.check_frequency} • Signals: ${w.signal_types.length} tracked
            </div>
        </div>
    `).join('');

    return `
        <div style="max-width: 1200px; display: flex; flex-direction: column; gap: 24px; color: #0f172a; padding-bottom: 40px;">
            
            <!-- Header Welcome banner -->
            <div style="background: linear-gradient(135deg, rgba(239,68,68,0.04) 0%, rgba(37,99,235,0.01) 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; box-shadow: 0 4px 30px rgba(0,0,0,0.02);">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <h3 style="margin: 0; font-size: 20px; font-weight: 800; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px; color: #0f172a;">
                        <span>🔥 Intent & Buying Signals</span>
                        <span style="font-size: 10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; font-weight: 800; padding: 2px 8px; border-radius: 50px; text-transform: uppercase; font-family: var(--font-mono);">Scout Gated</span>
                    </h3>
                    <p style="margin: 0; font-size: 13.5px; color: #475569;">Track real-time hiring changes, news mentions, reviews spikes, and trigger optimized outreach pitches instantly.</p>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button class="brand-btn" id="signalsRunScanBtn" style="background: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 800; padding: 10px 18px;">
                        Check Active Updates
                    </button>
                    <button class="brand-btn" id="signalsCreateWatchlistBtn" style="background: #2563eb; color: white; font-weight: 800; padding: 10px 18px;">
                        + New Watchlist
                    </button>
                </div>
            </div>

            <!-- Dashboard Split screen: Feed vs Watchlists -->
            <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; align-items: start; flex-wrap: wrap;">
                
                <!-- Left: Signals Feed -->
                <div>
                    <h3 style="margin: 0 0 16px 0; font-size: 17px; font-family: var(--font-heading); font-weight: 800; display:flex; align-items:center; gap:8px; color: #0f172a;">
                        <span>Live Signals Feed</span>
                        <span style="font-size: 11px; background:#ef4444; color:white; font-weight:800; padding:1px 8px; border-radius:10px;">${activeList.length} new</span>
                    </h3>
                    
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        ${feedCardsHTML}
                    </div>
                </div>

                <!-- Right: Watchlists -->
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <h3 style="margin: 0 0 16px 0; font-size: 16px; font-family: var(--font-heading); font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; color: #0f172a;">
                        🎯 Signal Watchlists
                    </h3>
                    <div style="display: flex; flex-direction: column;">
                        ${watchlistsHTML}
                    </div>
                </div>

            </div>

        </div>

        <!-- Create Watchlist Modal Overlay -->
        <div id="watchlistModalOverlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 10000; align-items: center; justify-content: center; padding: 24px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 440px; width: 100%; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1); color: #0f172a;">
                <div style="padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin:0; font-size: 16px; font-weight:800; font-family:var(--font-heading); color:#0f172a;">Create Signal Watchlist</h3>
                    <button class="brand-btn" id="closeWatchlistModal" style="background:none; border:none; padding:4px; font-size:18px; line-height:1; color:#475569; cursor:pointer;">×</button>
                </div>
                
                <div style="padding: 20px; display: flex; flex-direction: column; gap: 14px;">
                    <div>
                        <label style="display: block; font-size: 12.5px; font-weight: 700; color: #475569; margin-bottom: 6px;">Watchlist Name</label>
                        <input type="text" id="watchNameInput" placeholder="e.g. Bandra Clinic Leads" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none;" />
                    </div>

                    <div>
                        <label style="display: block; font-size: 12.5px; font-weight: 700; color: #475569; margin-bottom: 6px;">Description</label>
                        <textarea id="watchDescInput" placeholder="Optional notes..." style="width: 100%; height: 80px; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13px; outline: none; resize: none;"></textarea>
                    </div>

                    <div>
                        <label style="display: block; font-size: 12.5px; font-weight: 700; color: #475569; margin-bottom: 6px;">Scan Check Frequency</label>
                        <select id="watchFreqSelect" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none;">
                            <option value="daily">daily check updates</option>
                            <option value="hourly">hourly updates scan (Agency tier only)</option>
                            <option value="weekly">weekly batch report</option>
                        </select>
                    </div>
                </div>

                <div style="padding: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="brand-btn" id="cancelWatchlistBtn" style="padding: 8px 16px; font-size:12.5px; background:#f8fafc; color:#0f172a; border: 1px solid #cbd5e1;">Cancel</button>
                    <button class="brand-btn" id="confirmWatchlistBtn" style="padding: 8px 16px; font-size:12.5px; background:#2563eb; color:white; border:none;">Create Watchlist</button>
                </div>
            </div>
        </div>
    `;
}

export function bindIntentSignalsEvents() {
    // 1. Run Live Simulated Check Scan
    const runScanBtn = document.getElementById('signalsRunScanBtn');
    if (runScanBtn) {
        runScanBtn.addEventListener('click', async () => {
            runScanBtn.disabled = true;
            runScanBtn.innerText = 'Scanning...';

            try {
                const newSignals = await SignalsApi.runSimulatedSignalScan();
                alert(`✨ Signal scan complete! Found ${newSignals.length} new buying signals indicators.`);
                await loadSignalsData();
                refreshView();
            } catch (err) {
                console.error("Signal scan failed:", err);
                alert(`Scan failed: ${err.message}`);
                runScanBtn.disabled = false;
                runScanBtn.innerText = 'Check Active Updates';
            }
        });
    }

    // 2. Open create watchlist overlay modal
    const createBtn = document.getElementById('signalsCreateWatchlistBtn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            const modal = document.getElementById('watchlistModalOverlay');
            if (modal) modal.style.display = 'flex';
        });
    }

    const closeBtn = document.getElementById('closeWatchlistModal') || document.getElementById('cancelWatchlistBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('watchlistModalOverlay');
            if (modal) modal.style.display = 'none';
        });
    }

    // Confirm create watchlist
    const confirmBtn = document.getElementById('confirmWatchlistBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            const name = document.getElementById('watchNameInput')?.value.trim();
            const desc = document.getElementById('watchDescInput')?.value.trim();
            const freq = document.getElementById('watchFreqSelect')?.value;

            if (!name) {
                alert("Please specify a watchlist name.");
                return;
            }

            confirmBtn.disabled = true;
            confirmBtn.innerText = 'Creating...';

            try {
                await SignalsApi.createWatchlist({
                    name,
                    description: desc,
                    check_frequency: freq
                });
                alert("✨ Signal watchlist created successfully!");
                const modal = document.getElementById('watchlistModalOverlay');
                if (modal) modal.style.display = 'none';

                await loadSignalsData();
                refreshView();
            } catch (err) {
                alert(`Creation failed: ${err.message}`);
                confirmBtn.disabled = false;
                confirmBtn.innerText = 'Create Watchlist';
            }
        });
    }

    // 3. Acknowledge and dismiss signal card
    document.querySelectorAll('.signal-action-btn.dismiss-signal').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const signalId = btn.getAttribute('data-id');
            try {
                await SignalsApi.acknowledgeSignal(signalId);
                if (window.showToast) window.showToast("✓ Signal acknowledged and archived", "success");
                await loadSignalsData();
                refreshView();
            } catch (err) {
                alert(`Action failed: ${err.message}`);
            }
        });
    });

    // 4. View Lead details modal
    document.querySelectorAll('.signal-action-btn.view-lead').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const leadId = btn.getAttribute('data-id');
            if (window.showDetailModal) {
                window.showDetailModal(leadId);
            }
        });
    });
}

async function loadSignalsData() {
    try {
        detectedSignals = await SignalsApi.getDetectedSignals();
        watchlists = await SignalsApi.getWatchlists();
    } catch (e) {
        console.warn("Failed to load intent signals data:", e);
        detectedSignals = [];
    }
}

function refreshView() {
    const content = document.getElementById('dashboardContent');
    if (content) {
        content.innerHTML = renderIntentSignals();
        bindIntentSignalsEvents();
        if (window.refreshLucideIcons) window.refreshLucideIcons();
    }
}

// Fetch lists on mount
(async () => {
    await loadSignalsData();
})();
