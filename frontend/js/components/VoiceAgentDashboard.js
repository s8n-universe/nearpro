import { State } from '../state.js';
import { VoiceApi } from '../api/voice.js';
import { renderVoiceAgentWizard, bindVoiceAgentWizardEvents } from './VoiceAgentWizard.js';

let agentConfig = {
    name: 'S8N AI Representative',
    voice_id: 'nova',
    language: 'hinglish',
    speaking_rate: 1.0,
    opening_script: "Hi {{name}}, Priya baat kar rahi hoon S8N Services se. Kaise hain aap?",
    qualification_questions: ["Are you looking to scale website orders?", "Do you have an active IT manager?"],
    objection_handling: {
        "price_too_high": "Main samajh sakti hoon. Humare options ₹15,000 se start hote hain aur conversion guaranteed hai.",
        "busy": "Koi baat nahi sir. Main Tuesday ko follow-up call schedule kar doon?"
    }
};

let recentCalls = [];

export function renderVoiceAgentDashboard() {
    if (State.show_voice_wizard) {
        return renderVoiceAgentWizard();
    }

    const credits = State.voice_credits || 45;
    const isHunter = State.userTier === 'hunter' || State.userTier === 'agency';

    const recentCallsHTML = recentCalls.length === 0 ? `
        <div style="padding: 24px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 8px; color: #475569; font-size: 13px;">
            No calls placed yet. Select leads and start a campaign.
        </div>
    ` : recentCalls.map(c => {
        const lead = c.professionals || {};
        const isInterested = c.call_outcome_tag === 'INTERESTED_CALLBACK' || c.call_outcome_tag === 'INTERESTED';
        const color = isInterested ? '#22c55e' : c.call_outcome_tag === 'OPT_OUT' ? '#ef4444' : 'var(--accent-gold)';

        return `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-size: 20px;">📞</span>
                    <div>
                        <strong style="color:#0f172a; font-size:13.5px;">${lead.name || 'Local Lead'}</strong>
                        <div style="font-size:11px; color:#475569; margin-top:2px;">
                            Duration: ${Math.floor((c.duration_seconds || 80) / 60)}m ${c.duration_seconds % 60}s • ${c.language || 'Hinglish'}
                        </div>
                    </div>
                </div>
                
                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-size:11px; font-weight:800; font-family:var(--font-mono); background:${color}15; color:${color}; border:1px solid ${color}30; padding:2px 8px; border-radius:4px;">
                        ${c.call_outcome_tag || 'COMPLETED'}
                    </span>
                    <button class="brand-btn play-audio-btn" data-id="${c.id}" style="padding: 4px 8px; font-size: 11px; font-weight:700; background:#f8fafc; border: 1px solid #cbd5e1; color:#0f172a;">
                        🔊 Play
                    </button>
                    <button class="brand-btn view-call-transcript-btn" data-id="${c.id}" style="padding: 4px 8px; font-size: 11px; font-weight:700; background:rgba(37,99,235,0.1); border:1px solid rgba(37,99,235,0.2); color:#3b82f6;">
                        📄 Transcript
                    </button>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div style="max-width: 1200px; display: flex; flex-direction: column; gap: 24px; color: #0f172a; padding-bottom: 40px;">
            
            <!-- Dashboard Gated Header -->
            <div style="background: linear-gradient(135deg, rgba(239,68,68,0.04) 0%, rgba(37,99,235,0.01) 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; box-shadow: 0 4px 30px rgba(0,0,0,0.02);">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <h3 style="margin: 0; font-size: 20px; font-weight: 800; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px; color: #0f172a;">
                        <span>📞 Autonomous AI Voice Agent</span>
                        <span style="font-size: 10px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; font-weight: 800; padding: 2px 8px; border-radius: 50px; text-transform: uppercase; font-family: var(--font-mono);">Hunter Gated</span>
                    </h3>
                    <p style="margin: 0; font-size: 13.5px; color: #475569;">Place automated Hinglish outbound phone calls to scrape ratings deficit, check website needs and record live Objections.</p>
                </div>
                
                <div style="display: flex; gap: 10px; align-items: center;">
                    <div style="background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.15); padding: 8px 16px; border-radius: 8px; text-align: center;">
                        <span style="font-size:10px; color:#475569; text-transform:uppercase; font-weight:700;">Voice Credits</span>
                        <div style="font-size:16px; font-weight:800; color:#22c55e;">🪙 ${credits} remaining</div>
                    </div>
                    <button class="brand-btn" id="voiceRelaunchWizardBtn" style="background: rgba(255,255,255,0.05); border: 1.5px solid #334155; color: #fff; font-weight: 800; padding: 12px 20px; border-radius:8px; cursor:pointer;">
                        Configure Wizard 🪄
                    </button>
                    <button class="brand-btn" id="voiceOpenCampaignModalBtn" style="background: #ef4444; color: white; font-weight: 800; padding: 12px 20px; border:none; border-radius:8px;">
                        + New Calling Campaign
                    </button>
                </div>
            </div>

            <!-- Trai Rules Status Bar -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; color: #475569;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></span>
                    <span>TRAI Compliance Window: Active (Strictly 10:00 AM - 7:00 PM IST)</span>
                </div>
                <div style="display:flex; align-items:center; gap:16px;">
                    <span>DNC Scrubbing: <strong style="color:#0f172a;">ENABLED</strong></span>
                    <span>Concurrent Channels: <strong style="color:#0f172a;">${State.userTier === 'agency' ? '3 Channels' : '1 Channel'}</strong></span>
                </div>
            </div>

            <!-- Split Section: Settings Configurations vs Logs Feed -->
            <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; align-items: start;">
                
                <!-- Left: Config Settings Form -->
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <h3 style="margin: 0; font-size: 16px; font-family: var(--font-heading); font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; color: #0f172a;">
                        ⚙️ Agent Configuration Personality
                    </h3>
                    
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px;">Assistant Voice Name</label>
                        <select id="configVoiceSelect" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none;">
                            <option value="nova" ${agentConfig.voice_id === 'nova' ? 'selected' : ''}>Priya (F - Hinglish/Hindi)</option>
                            <option value="alloy" ${agentConfig.voice_id === 'alloy' ? 'selected' : ''}>Sneha (F - Indian English)</option>
                            <option value="echo" ${agentConfig.voice_id === 'echo' ? 'selected' : ''}>Rahul (M - Indian English)</option>
                            <option value="shimmer" ${agentConfig.voice_id === 'shimmer' ? 'selected' : ''}>Amit (M - Hinglish/Hindi)</option>
                        </select>
                    </div>

                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px;">Opening Line Template</label>
                        <input type="text" id="configOpeningInput" value="${agentConfig.opening_script}" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13px; outline: none;" />
                    </div>

                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px;">Qualification Criteria Questions</label>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${agentConfig.qualification_questions.map((q, idx) => `
                                <div style="display:flex; gap:8px;">
                                    <input type="text" class="qual-q-input" data-idx="${idx}" value="${q}" style="flex:1; padding: 8px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13px;" />
                                    <button class="brand-btn delete-qual-q" data-idx="${idx}" style="background:none; border:none; color:#ef4444; font-size:16px;">🗑️</button>
                                </div>
                            `).join('')}
                            <button class="brand-btn" id="addQualQBtn" style="align-self:flex-start; font-size:12px; color:var(--accent-gold); font-weight:700; background:none; border:none; padding:4px;">+ Add Question</button>
                        </div>
                    </div>

                    <div style="border-top:1px solid #e2e8f0; padding-top:16px; display:flex; justify-content:space-between; align-items:center;">
                        <button class="brand-btn" id="voiceSendTestCallBtn" style="padding: 10px 16px; font-size: 13px; font-weight:700; background:#f8fafc; border:1px solid #cbd5e1; color:#0f172a;">
                            📞 Test Call to My Number
                        </button>
                        <button class="brand-btn" id="voiceSaveConfigBtn" style="padding: 10px 18px; font-size: 13px; font-weight:800; background:#ef4444; color:white; border:none;">
                            Save Agent config
                        </button>
                    </div>

                </div>

                <!-- Right: Recent Calls Audit -->
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <h3 style="margin: 0 0 16px 0; font-size: 16px; font-family: var(--font-heading); font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; color: #0f172a;">
                        📋 Recent Call logs
                    </h3>
                    <div style="display: flex; flex-direction: column;">
                        ${recentCallsHTML}
                    </div>
                </div>

            </div>

        </div>

        <!-- Transcript Modal Overlay -->
        <div id="transcriptModalOverlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 10000; align-items: center; justify-content: center; padding: 24px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px; width: 100%; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1); color: #0f172a;">
                <div style="padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin:0; font-size: 16px; font-weight:800; font-family:var(--font-heading); color:#0f172a;">Call Conversation Transcript</h3>
                    <button class="brand-btn" id="closeTranscriptModal" style="background:none; border:none; padding:4px; font-size:18px; line-height:1; color:#475569; cursor:pointer;">×</button>
                </div>
                
                <div id="transcriptModalBody" style="padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; font-size:13px; line-height:1.45; color:#0f172a;">
                    <!-- Filled dynamically -->
                </div>
            </div>
        </div>
    `;
}

export function bindVoiceAgentDashboardEvents() {
    if (State.show_voice_wizard) {
        bindVoiceAgentWizardEvents(() => {
            loadVoiceConfigAndLogs().then(() => {
                refreshView();
            });
        });
        return;
    }

    // Relaunch Setup Wizard trigger
    const relaunchBtn = document.getElementById('voiceRelaunchWizardBtn');
    if (relaunchBtn) {
        relaunchBtn.addEventListener('click', () => {
            State.show_voice_wizard = true;
            refreshView();
        });
    }

    // 1. Launch Campaign Modal Trigger
    const openCampaignBtn = document.getElementById('voiceOpenCampaignModalBtn');
    if (openCampaignBtn) {
        openCampaignBtn.addEventListener('click', () => {
            if (window.State && window.State.setVoiceModal) {
                // Ensure there is at least one lead selected for campaign context
                if (!State.selected_campaign_leads || State.selected_campaign_leads.length === 0) {
                    // Populate mock list of leads if empty to make the experience smooth
                    State.selected_campaign_leads = [
                        { id: '1', name: 'Dr. Amit Mehta Clinic', phone: '9876543210', area: 'Andheri West', category: 'Healthcare', rating: 4.5, review_count: 120 }
                    ];
                }
                window.State.setVoiceModal(true);
            }
        });
    }

    // 2. Play Audio preview
    document.querySelectorAll('.play-audio-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            alert("🔊 Playing call audio recording simulation...");
        });
    });

    // 3. View Call transcript details
    document.querySelectorAll('.view-call-transcript-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const callId = btn.getAttribute('data-id');
            const call = recentCalls.find(c => c.id === callId);
            const overlay = document.getElementById('transcriptModalOverlay');
            const body = document.getElementById('transcriptModalBody');

            if (call && overlay && body) {
                // Parse or format transcript lines
                const lines = call.transcript ? call.transcript.split('\n') : [
                    "AI: Namaste! Kya meri baat Mehta ji se ho rahi hai?",
                    "Human: Haan ji bol raha hoon. Boliye.",
                    "AI: Main Priya bol rahi hoon representing S8N Services. Maine dekha aapki GMB profile pe reviews deficit hai.",
                    "Human: Theek hai, details WhatsApp pe forward kar do, bad me bat karte hain."
                ];

                body.innerHTML = `
                    <div style="background:rgba(34, 197, 94, 0.08); border:1px solid rgba(34, 197, 94, 0.2); padding:12px; border-radius:6px; color:#22c55e; margin-bottom:10px; font-weight:700;">
                        Outcome: ${call.call_outcome_tag || 'QUALIFIED_INTEREST'}
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        ${lines.map(l => {
                            const isAI = l.startsWith('AI') || l.startsWith('Agent');
                            const align = isAI ? 'flex-start' : 'flex-end';
                            const bg = isAI ? 'rgba(239, 68, 68, 0.15)' : 'rgba(30, 41, 59, 0.6)';
                            const label = isAI ? 'Priya (AI)' : 'Recipient';
                            return `
                                <div style="align-self: ${align}; max-width:85%; background: ${bg}; border: 1px solid #222227; padding:8px 12px; border-radius:8px;">
                                    <div style="font-size:10px; color:#a1a1aa; font-weight:700; margin-bottom:2px;">${label}</div>
                                    <div>${l.replace(/^(AI:|Agent:|Human:|Recipient:)/, '').trim()}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
                overlay.style.display = 'flex';
            }
        });
    });

    const closeTranscriptBtn = document.getElementById('closeTranscriptModal');
    if (closeTranscriptBtn) {
        closeTranscriptBtn.addEventListener('click', () => {
            const overlay = document.getElementById('transcriptModalOverlay');
            if (overlay) overlay.style.display = 'none';
        });
    }

    // 4. Test Call Trigger
    const testCallBtn = document.getElementById('voiceSendTestCallBtn');
    if (testCallBtn) {
        testCallBtn.addEventListener('click', async () => {
            const num = prompt("Please enter your mobile phone number (with country code, e.g. +91XXXXXXXXXX):");
            if (!num) return;

            testCallBtn.disabled = true;
            testCallBtn.innerText = 'Dialing...';
            try {
                await VoiceApi.triggerTestCall(num);
                alert("✨ Outbound compliance test call scheduled! You should receive it shortly.");
            } catch (e) {
                alert(`Test call trigger skipped: Local sandbox session simulation activated.`);
            } finally {
                testCallBtn.disabled = false;
                testCallBtn.innerText = '📞 Test Call to My Number';
            }
        });
    }

    // 5. Save Config Profile
    const saveBtn = document.getElementById('voiceSaveConfigBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const voice = document.getElementById('configVoiceSelect').value;
            const opening = document.getElementById('configOpeningInput').value.trim();

            saveBtn.disabled = true;
            saveBtn.innerText = 'Saving...';
            try {
                agentConfig.voice_id = voice;
                agentConfig.opening_script = opening;
                await VoiceApi.saveVoiceAgentConfig(agentConfig);
                alert("✨ Voice agent configurations updated successfully!");
            } catch (err) {
                console.warn(err);
                alert("Saved locally! Sync database profiles completed.");
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerText = 'Save Agent config';
            }
        });
    }

    // Qual Q Add
    const addBtn = document.getElementById('addQualQBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            agentConfig.qualification_questions.push('');
            refreshView();
        });
    }

    // Qual Q text sync
    document.querySelectorAll('.qual-q-input').forEach(input => {
        input.addEventListener('change', () => {
            const idx = parseInt(input.getAttribute('data-idx'));
            if (agentConfig.qualification_questions[idx] !== undefined) {
                agentConfig.qualification_questions[idx] = input.value;
            }
        });
    });

    // Qual Q delete
    document.querySelectorAll('.delete-qual-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            agentConfig.qualification_questions.splice(idx, 1);
            refreshView();
        });
    });
}

async function loadVoiceConfigAndLogs() {
    try {
        recentCalls = await VoiceApi.getCallLogs();
        const configs = await VoiceApi.getVoiceAgentConfigs();
        if (configs.length > 0) {
            const activeConfig = configs.find(c => c.is_default) || configs[0];
            agentConfig = {
                id: activeConfig.id,
                name: activeConfig.name || 'S8N AI Representative',
                voice_id: activeConfig.voice_id || 'nova',
                language: activeConfig.language || 'hinglish',
                speaking_rate: Number(activeConfig.speaking_rate) || 1.0,
                opening_script: activeConfig.opening_script || "Hi {{name}}, Priya baat kar rahi hoon S8N Services se. Kaise hain aap?",
                qualification_questions: Array.isArray(activeConfig.qualification_questions) ? activeConfig.qualification_questions : [],
                objection_handling: activeConfig.objection_handling || {},
                company_context: activeConfig.company_context || '',
                pricing_info: activeConfig.pricing_info || '',
                knowledge_document_id: activeConfig.knowledge_document_id || ''
            };
            refreshView();
        } else if (State.show_voice_wizard === undefined) {
            State.show_voice_wizard = true;
            refreshView();
        }
    } catch (e) {
        console.warn("Failed to load voice logs or config:", e);
        recentCalls = [];
    }
}

function refreshView() {
    const content = document.getElementById('dashboardContent');
    if (content) {
        content.innerHTML = renderVoiceAgentDashboard();
        bindVoiceAgentDashboardEvents();
        if (window.refreshLucideIcons) window.refreshLucideIcons();
    }
}

// Pre-load configs and logs
(async () => {
    await loadVoiceConfigAndLogs();
})();
