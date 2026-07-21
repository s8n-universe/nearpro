import { State } from '../state.js';
import { Api } from '../api.js';

export function renderCallScriptGeneratorLayout(selectedLeadId = null) {
    const userTier = (State.profile?.subscription_tier || State.profile?.tier || 'free').toLowerCase();
    const used = State.profile?.monthly_call_scripts_used || 0;
    
    let limit = 0;
    if (userTier === 'scout') limit = 5;
    else if (userTier === 'hunter') limit = 30;
    else if (userTier === 'agency') limit = 100;
    else if (userTier === 'enterprise') limit = 999999;

    const isAtLimit = limit > 0 ? (used >= limit) : (userTier === 'free');

    return `
        <div class="call-script-generator-container" style="display: flex; flex-direction: column; gap: 20px; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            
            <!-- Compact Enterprise Header Bar -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                        <h2 style="font-size: 19px; font-weight: 800; margin: 0; color: #0f172a; font-family: var(--font-heading);">
                            📞 AI Tele-Sales Cold Calling Teleprompter
                        </h2>
                        <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700;">
                            LIVE OBJECTION REBUTTALS
                        </span>
                    </div>
                    <p style="color: #475569; font-size: 13.5px; margin: 0; line-height: 1.4;">
                        Category-specific cold calling teleprompter scripts and live objection response cards tailored for local business owners.
                    </p>
                </div>
                
                <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 14px;">
                    <span style="font-size: 12px; color: #475569; font-weight: 600;">Monthly Script Quota:</span>
                    <strong style="font-size: 14px; color: #059669;">${used} / ${limit === 0 ? '0 (Free)' : limit === 999999 ? 'Unlimited' : limit}</strong>
                    <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">
                        ${userTier}
                    </span>
                </div>
            </div>

            <!-- KNOWLEDGE GUIDE: HOW TO USE TELE-SALES SCRIPTS -->
            <details style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px 24px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);" open>
                <summary style="font-weight: 700; color: #0f172a; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 14.5px; font-family: var(--font-heading);">
                    <span style="display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="phone-call" style="width: 16px; height: 16px; color: #059669;"></i>
                        📖 How to Conduct Cold Calls & Handle Objections Live
                    </span>
                    <span style="font-size: 11.5px; color: #059669; font-family: var(--font-mono); font-weight: 700;">Click to Expand / Collapse</span>
                </summary>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 16px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
                        <div style="font-size: 11.5px; font-weight: 700; color: #059669; font-family: var(--font-mono); margin-bottom: 4px;">1. 30-SEC PATTERN INTERRUPT</div>
                        <div style="font-size: 13px; color: #475569; line-height: 1.45;">Deliver the warm 30-second intro without rushing. Pause for 2 seconds after asking for 30 seconds.</div>
                    </div>
                    
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
                        <div style="font-size: 11.5px; font-weight: 700; color: #059669; font-family: var(--font-mono); margin-bottom: 4px;">2. LIVE OBJECTION TABS</div>
                        <div style="font-size: 13px; color: #475569; line-height: 1.45;">When the lead raises an objection, click any objection button for instant rebuttal scripts.</div>
                    </div>

                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
                        <div style="font-size: 11.5px; font-weight: 700; color: #059669; font-family: var(--font-mono); margin-bottom: 4px;">3. POST-CALL WHATSAPP</div>
                        <div style="font-size: 13px; color: #475569; line-height: 1.45;">Use 1-click WhatsApp follow-up to send your custom PDF proposal link right after ending the call.</div>
                    </div>
                </div>
            </details>

            <!-- Lead Selection Form -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label style="font-size: 12px; font-weight: 700; color: #334155; font-family: var(--font-mono);">
                                SELECT TARGET BUSINESS LEAD:
                            </label>
                            <a href="#/dashboard/crm" style="font-size: 11.5px; color: #059669; text-decoration: underline; font-family: var(--font-mono); font-weight: 600;">
                                Manage Tracked Leads in CRM ↗
                            </a>
                        </div>
                        <select id="scriptLeadSelect" data-selected-id="${selectedLeadId || ''}" style="width: 100%; padding: 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; font-size: 13.5px; outline: none;">
                            <option value="">-- Loading your tracked leads & directory... --</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px; font-family: var(--font-mono);">
                            SELECT PRIMARY CALL ANGLE:
                        </label>
                        <select id="scriptCallAngle" style="width: 100%; padding: 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; font-size: 13.5px; outline: none;">
                            <option value="REPUTATION_AND_REVENUE">Review Deficit Paradox & Lost Revenue Angle</option>
                            <option value="NO_WEBSITE_VISIBILITY">Missing Web Presence & Mobile Funnel Angle</option>
                            <option value="MOBILE_CONVERSION_LEAK">Slow Mobile Speed & Drop-off Leak Angle</option>
                            <option value="LOCAL_SEARCH_DOMINANCE">Google Maps Rank Takeover Angle</option>
                        </select>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 16px;">
                    ${isAtLimit ? `
                        <div style="color: #ef4444; font-size: 12.5px; font-family: var(--font-mono);">
                            ⚠️ Monthly call script limit reached. <a href="#/checkout" style="color: #2563eb; text-decoration: underline;">Upgrade plan ↗</a>
                        </div>
                    ` : ''}
                    <button id="generateCallScriptBtn" style="background: #059669; color: white; border: none; padding: 12px 26px; font-size: 14px; font-weight: 700; border-radius: 8px; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);" ${isAtLimit ? 'disabled' : ''}>
                        <i data-lucide="phone-call" style="width: 16px; height: 16px;"></i>
                        Generate Call Script & Objection Guide
                    </button>
                </div>
            </div>

            <!-- Dynamic Animated Step Loader -->
            <div id="scriptStepLoader" style="display: none; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px 24px; text-align: center; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; margin-bottom: 20px;">
                    <i data-lucide="loader-2" style="width: 28px; height: 28px; animation: spin 1s linear infinite;"></i>
                </div>
                <h3 id="scriptLoaderTitle" style="font-size: 18px; font-weight: 700; margin: 0 0 8px 0; font-family: var(--font-heading); color: #0f172a;">
                    Analyzing target business metrics & Google profile...
                </h3>
                <p id="scriptLoaderSub" style="color: #64748b; font-size: 13.5px; margin: 0 0 24px 0;">
                    Crafting 30-second pattern interrupt and live objection rebuttals...
                </p>
                <div style="max-width: 480px; margin: 0 auto; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div id="scriptProgressBar" style="width: 25%; height: 100%; background: linear-gradient(90deg, #059669, #34d399); transition: width 0.4s ease;"></div>
                </div>
            </div>

            <!-- Output Call Script Display Area -->
            <div id="callScriptResultContainer" style="display: none; flex-direction: column; gap: 24px;"></div>
        </div>
    `;
}

export async function populateLeadDropdownOptions(selectEl, selectedLeadId = null) {
    if (!selectEl) return;

    let savedLeads = [];
    try {
        savedLeads = await Api.getSavedLeads();
    } catch (e) {
        console.warn("Failed to load saved leads:", e);
    }

    const trackedProfessionals = savedLeads
        .map(sl => sl.professionals)
        .filter(p => p && p.id);

    const directoryLeads = State.professionals || [];

    const trackedIds = new Set(trackedProfessionals.map(p => p.id));
    const otherLeads = directoryLeads.filter(p => p.id && !trackedIds.has(p.id));

    let optionsHTML = '';

    if (trackedProfessionals.length > 0) {
        optionsHTML += `<optgroup label="📍 YOUR TRACKED LEADS (CRM PIPELINE)">`;
        optionsHTML += trackedProfessionals.map(p => `
            <option value="${p.id}" ${p.id === selectedLeadId ? 'selected' : ''}>
                ⭐ ${p.name} (${p.category || p.parent_category || 'Business'} - ${p.rating || 'N/A'}★, ${p.review_count || 0} reviews)
            </option>
        `).join('');
        optionsHTML += `</optgroup>`;
    }

    if (otherLeads.length > 0) {
        optionsHTML += `<optgroup label="🔍 UNLOCKED DIRECTORY LEADS">`;
        optionsHTML += otherLeads.map(p => `
            <option value="${p.id}" ${p.id === selectedLeadId ? 'selected' : ''}>
                ${p.name} (${p.category || p.parent_category || 'Business'} - ${p.rating || 'N/A'}★)
            </option>
        `).join('');
        optionsHTML += `</optgroup>`;
    }

    if (!optionsHTML) {
        optionsHTML = `<option value="">-- No leads found. Please unlock leads in Browse Directory --</option>`;
    }

    selectEl.innerHTML = optionsHTML;
}

export function bindCallScriptGeneratorEvents() {
    window._callScriptCache = window._callScriptCache || {};
    window._activeCallScriptPromises = window._activeCallScriptPromises || {};

    const btn = document.getElementById('generateCallScriptBtn');
    const leadSelect = document.getElementById('scriptLeadSelect');
    const loader = document.getElementById('scriptStepLoader');
    const resultContainer = document.getElementById('callScriptResultContainer');

    const preSelectedId = leadSelect ? leadSelect.dataset.selectedId : null;

    if (leadSelect) {
        populateLeadDropdownOptions(leadSelect, preSelectedId);
    }

    const currentLeadId = leadSelect ? (leadSelect.value || preSelectedId) : null;

    if (currentLeadId && window._callScriptCache[currentLeadId] && resultContainer) {
        const cached = window._callScriptCache[currentLeadId];
        renderCallScriptOutputCard(cached.call_script, cached.slug, cached.public_url);
    }

    if (currentLeadId && window._activeCallScriptPromises[currentLeadId] && loader) {
        loader.style.display = 'block';
        if (btn) btn.disabled = true;

        window._activeCallScriptPromises[currentLeadId].then(res => {
            if (loader) loader.style.display = 'none';
            if (btn) btn.disabled = false;
            if (res && res.call_script) {
                renderCallScriptOutputCard(res.call_script, res.slug, res.public_url);
            }
        }).catch(err => {
            if (loader) loader.style.display = 'none';
            if (btn) btn.disabled = false;
        });
    }

    if (!btn) return;

    btn.addEventListener('click', async () => {
        const angleSelect = document.getElementById('scriptCallAngle');
        const titleEl = document.getElementById('scriptLoaderTitle');
        const subEl = document.getElementById('scriptLoaderSub');
        const barEl = document.getElementById('scriptProgressBar');

        const leadId = leadSelect ? leadSelect.value : null;
        if (!leadId) {
            if (window.showToast) window.showToast("Please select a target lead from the dropdown", "error");
            return;
        }

        const callAngle = angleSelect ? angleSelect.value : 'REPUTATION_AND_REVENUE';

        btn.disabled = true;
        if (resultContainer) resultContainer.style.display = 'none';
        if (loader) loader.style.display = 'block';

        const steps = [
            { pct: '25%', title: '🔍 Step 1/4: Analyzing business rating, reviews & location...', sub: 'Formulating opening pattern interrupt statement...' },
            { pct: '50%', title: '🗣️ Step 2/4: Drafting curiosity-based observation & empathy question...', sub: 'Building value pitch for Indian business owners...' },
            { pct: '75%', title: '💡 Step 3/4: Generating 4 live objection response cards...', sub: 'Crafting rebuttals for Word-of-Mouth, Website, Budget, and WhatsApp objections...' },
            { pct: '95%', title: '📱 Step 4/4: Structuring Teleprompter view & WhatsApp follow-up...', sub: 'Finalizing live tele-sales calling sheet...' }
        ];

        let stepIdx = 0;
        const stepInterval = setInterval(() => {
            stepIdx = (stepIdx + 1) % steps.length;
            const currentTitle = document.getElementById('scriptLoaderTitle');
            const currentSub = document.getElementById('scriptLoaderSub');
            const currentBar = document.getElementById('scriptProgressBar');
            if (currentTitle) currentTitle.innerText = steps[stepIdx].title;
            if (currentSub) currentSub.innerText = steps[stepIdx].sub;
            if (currentBar) currentBar.style.width = steps[stepIdx].pct;
        }, 1100);

        const promise = Api.generateCallScript(leadId, callAngle);
        window._activeCallScriptPromises[leadId] = promise;

        try {
            const res = await promise;
            clearInterval(stepInterval);
            delete window._activeCallScriptPromises[leadId];

            if (res && res.call_script) {
                window._callScriptCache[leadId] = res;
                if (res.quota && State.profile) {
                    State.profile.monthly_call_scripts_used = res.quota.used;
                }

                const currentLoader = document.getElementById('scriptStepLoader');
                const currentBtn = document.getElementById('generateCallScriptBtn');
                if (currentLoader) currentLoader.style.display = 'none';
                if (currentBtn) currentBtn.disabled = false;

                if (window.showToast) window.showToast("✨ Tele-Sales Cold Call Script ready!", "success");
                renderCallScriptOutputCard(res.call_script, res.slug, res.public_url);
            }
        } catch (err) {
            clearInterval(stepInterval);
            delete window._activeCallScriptPromises[leadId];
            const currentLoader = document.getElementById('scriptStepLoader');
            const currentBtn = document.getElementById('generateCallScriptBtn');
            if (currentLoader) currentLoader.style.display = 'none';
            if (currentBtn) currentBtn.disabled = false;
            console.error("Call script generation failed:", err);
            if (window.showToast) {
                window.showToast(`Generation failed: ${err.message}`, "error");
            } else {
                alert(`Generation failed: ${err.message}`);
            }
        }
    });
}

function renderCallScriptOutputCard(script, slug, publicUrl) {
    const container = document.getElementById('callScriptResultContainer');
    if (!container) return;

    const opening = script.opening_pattern_interrupt || {};
    const obs = script.observation_hook || {};
    const emp = script.empathy_question || {};
    const val = script.value_pitch || {};
    const objList = script.objection_handlers || [];
    const closing = script.call_closing || {};
    const waMsg = script.whatsapp_followup_message || '';

    const objTabsHTML = objList.map((o, idx) => `
        <button class="objection-tab-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}" style="padding: 10px 14px; font-size: 12.5px; font-weight: 700; border-radius: 6px; border: 1px solid ${idx === 0 ? '#059669' : '#cbd5e1'}; background: ${idx === 0 ? '#ecfdf5' : '#ffffff'}; color: ${idx === 0 ? '#059669' : '#0f172a'}; cursor: pointer; text-align: left;">
            ${o.objection_title}
        </button>
    `).join('');

    container.innerHTML = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 24px; box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);">
            
            <!-- Top Action Toolbar -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 18px; flex-wrap: wrap; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="padding: 4px 10px; border-radius: 99px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; font-size: 11px; font-weight: 700; font-family: var(--font-mono);">
                        ● TELEPROMPTER SCRIPT ACTIVE
                    </span>
                    <span style="color: #64748b; font-size: 12px; font-family: var(--font-mono);">Lead: ${script.business_name}</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button id="copyWaFollowupBtn" style="background: #25D366; color: white; border: none; padding: 8px 16px; font-size: 12.5px; border-radius: 6px; display: flex; align-items: center; gap: 6px; font-weight: 700; cursor: pointer;">
                        <i data-lucide="message-square" style="width: 14px; height: 14px;"></i> Copy WhatsApp Follow-up
                    </button>

                    <button id="copyFullScriptBtn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; padding: 8px 14px; font-size: 12.5px; border-radius: 6px; display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 600;">
                        <i data-lucide="copy" style="width: 14px; height: 14px;"></i> Copy Full Script
                    </button>

                    <button id="printScriptSheetBtn" style="background: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; padding: 8px 14px; font-size: 12.5px; border-radius: 6px; display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 600;">
                        <i data-lucide="printer" style="width: 14px; height: 14px;"></i> Print Teleprompter
                    </button>
                </div>
            </div>

            <!-- LIVE CALL TELEPROMPTER VIEW -->
            <div id="printableScriptContainer" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; display: flex; flex-direction: column; gap: 24px;">
                
                <!-- SECTION 1: 30-SECOND PATTERN INTERRUPT -->
                <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
                    <div style="font-size: 11px; color: #059669; font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 8px;">
                        STEP 1 • 30-SECOND PATTERN INTERRUPT OPENING
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; font-size: 15px; line-height: 1.6; color: #0f172a; font-family: var(--font-body);">
                        "${opening.script_text}"
                    </div>
                    <div style="font-size: 12px; color: #64748b; font-family: var(--font-mono); margin-top: 6px;">
                        💡 Coaching Tip: ${opening.coaching_tip || 'Speak naturally and give a brief pause.'}
                    </div>
                </div>

                <!-- SECTION 2: DATA-DRIVEN HOOK & EMPATHY PROBE -->
                <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
                    <div style="font-size: 11px; color: #059669; font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 8px;">
                        STEP 2 • DATA OBSERVATION HOOK & EMPATHY QUESTION
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; font-size: 15px; line-height: 1.6; color: #0f172a; margin-bottom: 12px;">
                        "${obs.script_text}"
                    </div>
                    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; font-size: 14.5px; line-height: 1.6; color: #065f46;">
                        <strong>Empathy Question:</strong> "${emp.script_text}"
                    </div>
                </div>

                <!-- SECTION 3: VALUE PITCH & CONCEPT PROTOTYPE MENTION -->
                <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
                    <div style="font-size: 11px; color: #059669; font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 8px;">
                        STEP 3 • CONCEPT PROTOTYPE PITCH
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; font-size: 15px; line-height: 1.6; color: #0f172a;">
                        "${val.script_text} ${val.concept_url_mention || ''}"
                    </div>
                </div>

                <!-- SECTION 4: LIVE INTERACTIVE OBJECTION HANDLING CARDS -->
                <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
                    <div style="font-size: 11px; color: #059669; font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 12px;">
                        STEP 4 • LIVE INTERACTIVE OBJECTION REBUTTAL CARDS (CLICK TO TOGGLE)
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
                        ${objTabsHTML}
                    </div>

                    <!-- Active Rebuttal Display Box -->
                    <div id="activeRebuttalBox" style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px;">
                        <div id="rebuttalTitle" style="font-size: 13.5px; font-weight: 800; color: #065f46; margin-bottom: 8px; font-family: var(--font-heading);">
                            ${objList[0]?.objection_title || 'Objection Response'}
                        </div>
                        <div id="rebuttalText" style="font-size: 15px; line-height: 1.6; color: #0f172a; margin-bottom: 10px;">
                            "${objList[0]?.rebuttal_script || ''}"
                        </div>
                        <div id="rebuttalAngle" style="font-size: 12px; color: #047857; font-family: var(--font-mono); font-weight: 600;">
                            🎯 Strategic Angle: ${objList[0]?.strategic_angle || ''}
                        </div>
                    </div>
                </div>

                <!-- SECTION 5: CALL CLOSING & CONSULTATION BOOKING -->
                <div>
                    <div style="font-size: 11px; color: #059669; font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 8px;">
                        STEP 5 • CALL CLOSING & STRATEGY SESSION LOCK-IN
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; font-size: 15px; line-height: 1.6; color: #0f172a;">
                        "${closing.script_text}"
                    </div>
                </div>

            </div>

            <!-- WHATSAPP FOLLOW-UP MESSAGE BOX -->
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px;">
                <div style="font-size: 12px; font-weight: 700; color: #15803d; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <i data-lucide="message-square" style="width: 14px; height: 14px;"></i>
                    PRE-FORMATTED WHATSAPP FOLLOW-UP MESSAGE (POST-CALL)
                </div>
                <div id="waFollowupText" style="font-size: 13.5px; line-height: 1.5; color: #0f172a; font-family: var(--font-mono); background: #ffffff; padding: 14px; border-radius: 8px; border: 1px solid #cbd5e1;">
                    ${waMsg}
                </div>
            </div>

        </div>
    `;

    container.style.display = 'flex';
    if (window.refreshLucideIcons) window.refreshLucideIcons();

    const tabs = container.querySelectorAll('.objection-tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.style.borderColor = '#cbd5e1';
                t.style.background = '#ffffff';
                t.style.color = '#0f172a';
            });
            tab.style.borderColor = '#059669';
            tab.style.background = '#ecfdf5';
            tab.style.color = '#059669';

            const idx = parseInt(tab.dataset.idx, 10);
            const targetObj = objList[idx];
            if (targetObj) {
                const titleEl = document.getElementById('rebuttalTitle');
                const textEl = document.getElementById('rebuttalText');
                const angleEl = document.getElementById('rebuttalAngle');

                if (titleEl) titleEl.innerText = targetObj.objection_title;
                if (textEl) textEl.innerText = `"${targetObj.rebuttal_script}"`;
                if (angleEl) angleEl.innerText = `🎯 Strategic Angle: ${targetObj.strategic_angle}`;
            }
        });
    });

    const waBtn = document.getElementById('copyWaFollowupBtn');
    if (waBtn) {
        waBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(waMsg).then(() => {
                if (window.showToast) window.showToast("💬 WhatsApp follow-up copied to clipboard!", "success");
            });
        });
    }

    const fullBtn = document.getElementById('copyFullScriptBtn');
    if (fullBtn) {
        fullBtn.addEventListener('click', () => {
            const fullScriptText = `
COLD CALLING TELEPROMPTER SCRIPT - ${script.business_name}
1. OPENING:
${opening.script_text}

2. OBSERVATION & EMPATHY:
${obs.script_text}
${emp.script_text}

3. CONCEPT PITCH:
${val.script_text}

4. OBJECTION REBUTTALS:
${objList.map(o => `${o.objection_title}:\n${o.rebuttal_script}`).join('\n\n')}

5. CLOSING:
${closing.script_text}
            `.trim();

            navigator.clipboard.writeText(fullScriptText).then(() => {
                if (window.showToast) window.showToast("📋 Full Call Script copied to clipboard!", "success");
            });
        });
    }

    const printBtn = document.getElementById('printScriptSheetBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            const printContent = document.getElementById('printableScriptContainer');
            if (!printContent) return;
            const win = window.open('', '', 'width=900,height=1000');
            win.document.write(`
                <html>
                    <head>
                        <title>Call_Script_${script.business_name.replace(/\s+/g, '_')}</title>
                        <style>
                            body { font-family: Arial, sans-serif; background: #ffffff; color: #0f172a; padding: 30px; }
                            @media print { body { background: white; color: black; } }
                        </style>
                    </head>
                    <body>
                        ${printContent.innerHTML}
                    </body>
                </html>
            `);
            win.document.close();
            win.focus();
            setTimeout(() => {
                win.print();
                win.close();
            }, 500);
        });
    }
}
