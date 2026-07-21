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

    const leads = State.professionals || [];
    const leadOptions = leads.map(l => `
        <option value="${l.id}" ${l.id === selectedLeadId ? 'selected' : ''}>
            ${l.name} (${l.category || l.parent_category || 'Business'}, ${l.rating || 'N/A'}⭐ - ${l.review_count || 0} reviews)
        </option>
    `).join('');

    return `
        <div class="call-script-generator-container" style="display: flex; flex-direction: column; gap: 24px; padding: 24px; color: white; font-family: var(--font-body);">
            
            <!-- Top Quota & Intro Header -->
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 280px;">
                    <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; border-radius: 99px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; font-size: 11.5px; font-weight: 700; font-family: var(--font-mono); margin-bottom: 12px;">
                        📞 AI Tele-Sales & Cold Calling Script Engine
                    </div>
                    <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 6px 0; font-family: var(--font-heading);">
                        High-Converting Phone Scripts & Live Objection Rebuttals
                    </h2>
                    <p style="color: var(--text-secondary); font-size: 13.5px; margin: 0; max-width: 680px; line-height: 1.5;">
                        Generate category-specific cold calling teleprompter scripts and live objection response cards tailored for local Indian business owners (Dentists, Decorators, Salons, Coaching Centers).
                    </p>
                </div>
                
                <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 20px; text-align: right; flex-shrink: 0; min-width: 180px;">
                    <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 4px;">Monthly Script Quota</div>
                    <div style="font-size: 20px; font-weight: 700; color: #10b981; font-family: var(--font-mono);">
                        ${used} / ${limit === 0 ? '0 (Free)' : limit === 999999 ? 'Unlimited' : limit}
                    </div>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
                        Plan: <strong style="text-transform: capitalize; color: white;">${userTier}</strong>
                    </div>
                </div>
            </div>

            <!-- Lead Selection Form -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-md);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; font-family: var(--font-mono);">
                            SELECT TARGET BUSINESS LEAD:
                        </label>
                        <select id="scriptLeadSelect" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none;">
                            ${leadOptions.length > 0 ? leadOptions : '<option value="">-- No directory leads loaded. Please search in Browse Directory --</option>'}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; font-family: var(--font-mono);">
                            SELECT PRIMARY CALL ANGLE:
                        </label>
                        <select id="scriptCallAngle" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none;">
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
                            ⚠️ Monthly call script limit reached. <a href="#/checkout" style="color: var(--accent-gold); text-decoration: underline;">Upgrade plan ↗</a>
                        </div>
                    ` : ''}
                    <button id="generateCallScriptBtn" class="brand-btn" style="padding: 12px 24px; font-size: 14px; font-weight: 600; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 8px; cursor: pointer;" ${isAtLimit ? 'disabled' : ''}>
                        <i data-lucide="phone-call" style="width: 16px; height: 16px;"></i>
                        Generate Call Script & Objection Guide
                    </button>
                </div>
            </div>

            <!-- Dynamic Animated Step Loader -->
            <div id="scriptStepLoader" style="display: none; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 40px 24px; text-align: center;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; margin-bottom: 20px;">
                    <i data-lucide="loader-2" style="width: 28px; height: 28px; animation: spin 1s linear infinite;"></i>
                </div>
                <h3 id="scriptLoaderTitle" style="font-size: 18px; font-weight: 700; margin: 0 0 8px 0; font-family: var(--font-heading);">
                    Analyzing target business metrics & Google profile...
                </h3>
                <p id="scriptLoaderSub" style="color: var(--text-muted); font-size: 13.5px; margin: 0 0 24px 0;">
                    Crafting 30-second pattern interrupt and live objection rebuttals...
                </p>
                <div style="max-width: 480px; margin: 0 auto; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; border: 1px solid var(--border);">
                    <div id="scriptProgressBar" style="width: 25%; height: 100%; background: linear-gradient(90deg, #10b981, #34d399); transition: width 0.4s ease;"></div>
                </div>
            </div>

            <!-- Output Call Script Display Area -->
            <div id="callScriptResultContainer" style="display: none; flex-direction: column; gap: 24px;"></div>
        </div>
    `;
}

export function bindCallScriptGeneratorEvents() {
    window._callScriptCache = window._callScriptCache || {};
    window._activeCallScriptPromises = window._activeCallScriptPromises || {};

    const btn = document.getElementById('generateCallScriptBtn');
    const leadSelect = document.getElementById('scriptLeadSelect');
    const loader = document.getElementById('scriptStepLoader');
    const resultContainer = document.getElementById('callScriptResultContainer');

    const currentLeadId = leadSelect ? leadSelect.value : null;

    // Restore cached result if available for this lead
    if (currentLeadId && window._callScriptCache[currentLeadId] && resultContainer) {
        const cached = window._callScriptCache[currentLeadId];
        renderCallScriptOutputCard(cached.call_script, cached.slug, cached.public_url);
    }

    // Restore in-flight step loader if background promise is running
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

        // Store promise globally to prevent tab switch interruption
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

    // Render objection tabs & response card
    const objTabsHTML = objList.map((o, idx) => `
        <button class="objection-tab-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}" style="padding: 10px 14px; font-size: 12px; font-weight: 600; border-radius: var(--radius-sm); border: 1px solid ${idx === 0 ? 'var(--accent-gold)' : 'var(--border)'}; background: ${idx === 0 ? 'rgba(217, 119, 6, 0.15)' : 'rgba(255,255,255,0.02)'}; color: ${idx === 0 ? 'var(--accent-gold)' : 'white'}; cursor: pointer; text-align: left;">
            ${o.objection_title}
        </button>
    `).join('');

    container.innerHTML = `
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            
            <!-- Top Action Toolbar -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 18px; flex-wrap: wrap; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="padding: 4px 8px; border-radius: 4px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; font-size: 11px; font-weight: 700; font-family: var(--font-mono);">
                        ● TELEPROMPTER SCRIPT ACTIVE
                    </span>
                    <span style="color: var(--text-muted); font-size: 12px; font-family: var(--font-mono);">Lead: ${script.business_name}</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button id="copyWaFollowupBtn" class="brand-btn" style="padding: 8px 16px; font-size: 12.5px; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px; font-weight: 600; cursor: pointer; border: none;">
                        <i data-lucide="message-square" style="width: 14px; height: 14px;"></i> Copy WhatsApp Follow-up
                    </button>

                    <button id="copyFullScriptBtn" class="secondary-btn" style="padding: 8px 14px; font-size: 12.5px; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px; cursor: pointer;">
                        <i data-lucide="copy" style="width: 14px; height: 14px;"></i> Copy Full Script
                    </button>

                    <button id="printScriptSheetBtn" class="secondary-btn" style="padding: 8px 14px; font-size: 12.5px; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px; cursor: pointer;">
                        <i data-lucide="printer" style="width: 14px; height: 14px;"></i> Print Teleprompter
                    </button>
                </div>
            </div>

            <!-- LIVE CALL TELEPROMPTER VIEW -->
            <div id="printableScriptContainer" style="background: #0b0c10; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 28px; display: flex; flex-direction: column; gap: 24px;">
                
                <!-- SECTION 1: 30-SECOND PATTERN INTERRUPT -->
                <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px;">
                    <div style="font-size: 11px; color: var(--accent-gold); font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 8px;">
                        STEP 1 • 30-SECOND PATTERN INTERRUPT OPENING
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 18px; font-size: 15px; line-height: 1.6; color: white; font-family: var(--font-body);">
                        "${opening.script_text}"
                    </div>
                    <div style="font-size: 11.5px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 6px;">
                        💡 Coaching Tip: ${opening.coaching_tip || 'Speak naturally and give a brief pause.'}
                    </div>
                </div>

                <!-- SECTION 2: DATA-DRIVEN HOOK & EMPATHY PROBE -->
                <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px;">
                    <div style="font-size: 11px; color: var(--accent-gold); font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 8px;">
                        STEP 2 • DATA OBSERVATION HOOK & EMPATHY QUESTION
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 18px; font-size: 15px; line-height: 1.6; color: white; margin-bottom: 12px;">
                        "${obs.script_text}"
                    </div>
                    <div style="background: rgba(217, 119, 6, 0.08); border: 1px solid rgba(217, 119, 6, 0.2); border-radius: var(--radius-sm); padding: 16px; font-size: 14.5px; line-height: 1.6; color: var(--accent-gold);">
                        <strong>Empathy Question:</strong> "${emp.script_text}"
                    </div>
                </div>

                <!-- SECTION 3: VALUE PITCH & CONCEPT PROTOTYPE MENTION -->
                <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px;">
                    <div style="font-size: 11px; color: var(--accent-gold); font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 8px;">
                        STEP 3 • CONCEPT PROTOTYPE PITCH
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 18px; font-size: 15px; line-height: 1.6; color: white;">
                        "${val.script_text} ${val.concept_url_mention || ''}"
                    </div>
                </div>

                <!-- SECTION 4: LIVE INTERACTIVE OBJECTION HANDLING CARDS -->
                <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px;">
                    <div style="font-size: 11px; color: #10b981; font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 12px;">
                        STEP 4 • LIVE INTERACTIVE OBJECTION REBUTTAL CARDS (CLICK TO TOGGLE)
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
                        ${objTabsHTML}
                    </div>

                    <!-- Active Rebuttal Display Box -->
                    <div id="activeRebuttalBox" style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 20px;">
                        <div id="rebuttalTitle" style="font-size: 13px; font-weight: 700; color: #10b981; margin-bottom: 8px; font-family: var(--font-heading);">
                            ${objList[0]?.objection_title || 'Objection Response'}
                        </div>
                        <div id="rebuttalText" style="font-size: 15px; line-height: 1.6; color: white; margin-bottom: 10px;">
                            "${objList[0]?.rebuttal_script || ''}"
                        </div>
                        <div id="rebuttalAngle" style="font-size: 11.5px; color: var(--text-muted); font-family: var(--font-mono);">
                            🎯 Strategic Angle: ${objList[0]?.strategic_angle || ''}
                        </div>
                    </div>
                </div>

                <!-- SECTION 5: CALL CLOSING & CONSULTATION BOOKING -->
                <div>
                    <div style="font-size: 11px; color: var(--accent-gold); font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 8px;">
                        STEP 5 • CALL CLOSING & STRATEGY SESSION LOCK-IN
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 18px; font-size: 15px; line-height: 1.6; color: white;">
                        "${closing.script_text}"
                    </div>
                </div>

            </div>

            <!-- WHATSAPP FOLLOW-UP MESSAGE BOX -->
            <div style="background: rgba(37, 211, 102, 0.05); border: 1px solid rgba(37, 211, 102, 0.2); border-radius: var(--radius-md); padding: 20px;">
                <div style="font-size: 12px; font-weight: 700; color: #25D366; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <i data-lucide="message-square" style="width: 14px; height: 14px;"></i>
                    PRE-FORMATTED WHATSAPP FOLLOW-UP MESSAGE (POST-CALL)
                </div>
                <div id="waFollowupText" style="font-size: 13.5px; line-height: 1.5; color: white; font-family: var(--font-mono); background: rgba(0,0,0,0.3); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                    ${waMsg}
                </div>
            </div>

        </div>
    `;

    container.style.display = 'flex';
    if (window.refreshLucideIcons) window.refreshLucideIcons();

    // Bind interactive objection tabs
    const tabs = container.querySelectorAll('.objection-tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.style.borderColor = 'var(--border)';
                t.style.background = 'rgba(255,255,255,0.02)';
                t.style.color = 'white';
            });
            tab.style.borderColor = 'var(--accent-gold)';
            tab.style.background = 'rgba(217, 119, 6, 0.15)';
            tab.style.color = 'var(--accent-gold)';

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

    // Toolbar handlers
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
                            body { font-family: Arial, sans-serif; background: #0b0c10; color: white; padding: 30px; }
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
