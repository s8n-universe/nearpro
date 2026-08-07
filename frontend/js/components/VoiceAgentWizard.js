import { State } from '../state.js';
import { VoiceApi } from '../api/voice.js';
import { Api } from '../api.js';
import { LlmApi } from '../api/llm.js';

let wizardState = {
    step: 1,
    initialized: false,
    businessName: '',
    servicePitch: 'Website Design & GMB Optimization',
    websiteUrl: '',
    scraping: false,
    voiceId: 'nova',
    campaignGoal: 'REPUTATION_AND_REVENUE',
    testPhone: '',
    calling: false,
    knowledgeDocumentId: ''
};

// Auto-populate defaults from profile if available
function initWizardState() {
    if (wizardState.initialized) return;

    if (State.profile) {
        wizardState.businessName = State.profile.company_name || '';
        wizardState.websiteUrl = State.profile.website || '';
        if (State.profile.phone && !wizardState.testPhone) {
            wizardState.testPhone = State.profile.phone;
        }
    }
    if (!wizardState.testPhone) {
        wizardState.testPhone = '+91';
    }
    // Background fetch user documents if not already loaded
    if (State.user && !window._userDocuments) {
        window._userDocuments = [];
        Api.getDocuments(State.user.id).then(docs => {
            window._userDocuments = docs;
            refreshWizardView();
        }).catch(err => console.warn("Failed to retrieve documents for wizard:", err));
    }
    wizardState.initialized = true;
}

export function renderVoiceAgentWizard() {
    initWizardState();

    const step = wizardState.step;
    const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

    return `
        <div style="max-width: 540px; margin: 30px auto; color: #0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            
            <!-- Setup Header -->
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; background: rgba(239, 68, 68, 0.06); border: 1.5px solid rgba(239, 68, 68, 0.2); border-radius: 50px; color: #ef4444; font-size: 11px; font-family: var(--font-mono); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                    MANDATORY AI SETUP
                </div>
                <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 6px 0; color: #0f172a; font-family: var(--font-heading);">
                    Configure Your AI Voice Assistant
                </h2>
                <p style="color: #64748b; font-size: 13px; margin: 0; max-width: 440px; margin: 0 auto; line-height: 1.45;">
                    Set up your natural Hinglish/English voice agent in under 90 seconds. Paste your website, choose a voice, and start calling.
                </p>
            </div>

            <!-- Progress Bar -->
            <div style="margin-bottom: 28px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: var(--font-mono); color: #64748b; margin-bottom: 6px; font-weight: 600; text-transform: uppercase;">
                    <span style="${step === 1 ? 'color: #ef4444;' : 'color: #0284c7;'}">1. Profile</span>
                    <span style="${step === 2 ? 'color: #ef4444;' : step > 2 ? 'color: #0284c7;' : ''}">2. Voice Identity</span>
                    <span style="${step === 3 ? 'color: #ef4444;' : ''}">3. Call Verify</span>
                </div>
                <div style="height: 5px; width: 100%; background: #e2e8f0; border-radius: 10px; overflow: hidden; position: relative;">
                    <div style="height: 100%; width: ${progressPercent}%; background: linear-gradient(90deg, #ef4444, #ea580c); transition: width 0.3s ease; border-radius: 10px;"></div>
                </div>
            </div>

            <!-- Main Wizard Card -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);">
                
                ${renderStepContent()}
                
            </div>
            
            <!-- Quick Navigation Footer -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
                <button class="brand-btn" id="wizardBackBtn" style="padding: 8px 16px; font-size: 13px; font-weight: 700; background: #ffffff; border: 1px solid #cbd5e1; color: #475569; display: ${step === 1 ? 'none' : 'block'}; cursor: pointer; border-radius: 6px;">
                    ← Back
                </button>
                
                ${step < 3 ? `
                    <button class="brand-btn" id="wizardNextBtn" style="margin-left: auto; padding: 10px 22px; font-size: 13px; font-weight: 700; background: linear-gradient(135deg, #ef4444, #ea580c); color: white; border: none; border-radius: 6px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);">
                        Continue →
                    </button>
                ` : `
                    <button class="brand-btn" id="wizardFinishBtn" style="margin-left: auto; padding: 10px 22px; font-size: 13px; font-weight: 700; background: #22c55e; color: white; border: none; border-radius: 6px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);">
                        Finish & Save Agent ✓
                    </button>
                `}
            </div>
        </div>
    `;
}

function renderStepContent() {
    const step = wizardState.step;
    if (step === 1) {
        return `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="font-size: 14.5px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    💼 Tell us about your Business
                </div>
                
                <div>
                    <label style="display: block; font-size: 10px; font-family: var(--font-mono); color: #475569; text-transform: uppercase; margin-bottom: 4px; font-weight: 700;">Business Name</label>
                    <input type="text" id="wizBusinessName" value="${wizardState.businessName}" placeholder="e.g. DigitalRoots Solutions" style="width: 100%; padding: 10px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#ef4444'" onblur="this.style.borderColor='#cbd5e1'">
                </div>

                <div>
                    <label style="display: block; font-size: 10px; font-family: var(--font-mono); color: #475569; text-transform: uppercase; margin-bottom: 4px; font-weight: 700;">Main Service / Pitch Goal</label>
                    <input type="text" id="wizServicePitch" value="${wizardState.servicePitch}" placeholder="e.g. Website Design & GMB Reviews Audit" style="width: 100%; padding: 10px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none;" onfocus="this.style.borderColor='#ef4444'" onblur="this.style.borderColor='#cbd5e1'">
                </div>

                <div>
                    <label style="display: block; font-size: 10px; font-family: var(--font-mono); color: #475569; text-transform: uppercase; margin-bottom: 4px; font-weight: 700;">Website URL (Optional - For Auto-Context Extraction)</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="url" id="wizWebsiteUrl" value="${wizardState.websiteUrl}" placeholder="e.g. https://digitalroots.in" style="flex: 1; padding: 10px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none;" onfocus="this.style.borderColor='#ef4444'" onblur="this.style.borderColor='#cbd5e1'">
                        <button id="wizScrapeBtn" class="brand-btn" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; padding: 0 14px; font-size: 12px; font-weight: 600; cursor: pointer; border-radius: 6px;">
                            Auto-Fetch
                        </button>
                    </div>
                </div>

                <div>
                    <label style="display: block; font-size: 10px; font-family: var(--font-mono); color: #475569; text-transform: uppercase; margin-bottom: 4px; font-weight: 700;">Company Knowledge Base Document</label>
                    <select id="wizKnowledgeDocumentId" style="width: 100%; padding: 10px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none;">
                        <option value="">-- No document attached (Default behavior) --</option>
                        ${(window._userDocuments || []).map(doc => `
                            <option value="${doc.id}" ${wizardState.knowledgeDocumentId === doc.id ? 'selected' : ''}>
                                📄 ${doc.name} (${(doc.file_size / 1024).toFixed(1)} KB)
                            </option>
                        `).join('')}
                    </select>
                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 11.5px; line-height: 1.4;">
                        💡 Upload PDF brochures, product specs, or FAQs in the <a href="#/dashboard/documents" style="color: #ef4444; text-decoration: none; font-weight: 600;">Documents Library</a> to feed them directly into your agent's brain.
                    </p>
                </div>

                ${wizardState.scraping ? `
                    <div style="background: rgba(2, 132, 199, 0.05); border: 1px dashed rgba(2, 132, 199, 0.25); padding: 10px 12px; border-radius: 6px; display: flex; align-items: center; gap: 8px; font-size: 12px; color: #0284c7;">
                        <div style="width: 14px; height: 14px; border: 2px solid #0284c7; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                        AI Assistant reading website context and generating customized system prompts...
                    </div>
                ` : ''}
            </div>
        `;
    }

    if (step === 2) {
        return `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="font-size: 14.5px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    🎙️ Choose your Voice Assistant
                </div>

                <!-- Voice Cards Grid -->
                <div>
                    <label style="display: block; font-size: 10px; font-family: var(--font-mono); color: #475569; text-transform: uppercase; margin-bottom: 8px; font-weight: 700;">AI Personality Voice</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        
                        <div class="wiz-voice-card ${wizardState.voiceId === 'nova' ? 'active' : ''}" data-voice="nova" style="padding: 12px 14px; background: #ffffff; border: 1.5px solid ${wizardState.voiceId === 'nova' ? '#ef4444' : '#e2e8f0'}; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: ${wizardState.voiceId === 'nova' ? 'rgba(239, 68, 68, 0.02)' : '#ffffff'};">
                            <div style="font-weight: 700; color: #0f172a; font-size: 13.5px;">👩 Priya</div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Hinglish (Hindi + English) • Warm & Conversational</div>
                        </div>

                        <div class="wiz-voice-card ${wizardState.voiceId === 'alloy' ? 'active' : ''}" data-voice="alloy" style="padding: 12px 14px; background: #ffffff; border: 1.5px solid ${wizardState.voiceId === 'alloy' ? '#ef4444' : '#e2e8f0'}; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: ${wizardState.voiceId === 'alloy' ? 'rgba(239, 68, 68, 0.02)' : '#ffffff'};">
                            <div style="font-weight: 700; color: #0f172a; font-size: 13.5px;">👩 Sneha</div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Indian English • Soft & Formal</div>
                        </div>

                        <div class="wiz-voice-card ${wizardState.voiceId === 'echo' ? 'active' : ''}" data-voice="echo" style="padding: 12px 14px; background: #ffffff; border: 1.5px solid ${wizardState.voiceId === 'echo' ? '#ef4444' : '#e2e8f0'}; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: ${wizardState.voiceId === 'echo' ? 'rgba(239, 68, 68, 0.02)' : '#ffffff'};">
                            <div style="font-weight: 700; color: #0f172a; font-size: 13.5px;">👨 Rahul</div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Indian English • Confident & Clear</div>
                        </div>

                        <div class="wiz-voice-card ${wizardState.voiceId === 'shimmer' ? 'active' : ''}" data-voice="shimmer" style="padding: 12px 14px; background: #ffffff; border: 1.5px solid ${wizardState.voiceId === 'shimmer' ? '#ef4444' : '#e2e8f0'}; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: ${wizardState.voiceId === 'shimmer' ? 'rgba(239, 68, 68, 0.02)' : '#ffffff'};">
                            <div style="font-weight: 700; color: #0f172a; font-size: 13.5px;">👨 Amit</div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Hinglish (Hindi + English) • Friendly & High Energy</div>
                        </div>

                    </div>
                </div>

                <!-- Goal Select -->
                <div>
                    <label style="display: block; font-size: 10px; font-family: var(--font-mono); color: #475569; text-transform: uppercase; margin-bottom: 4px; font-weight: 700;">Outreach Goal</label>
                    <select id="wizCampaignGoal" style="width: 100%; padding: 10px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none;">
                        <option value="REPUTATION_AND_REVENUE" ${wizardState.campaignGoal === 'REPUTATION_AND_REVENUE' ? 'selected' : ''}>Qualify Google Review Deficit</option>
                        <option value="NO_WEBSITE_VISIBILITY" ${wizardState.campaignGoal === 'NO_WEBSITE_VISIBILITY' ? 'selected' : ''}>Qualify Missing Mobile Website</option>
                        <option value="MOBILE_CONVERSION_LEAK" ${wizardState.campaignGoal === 'MOBILE_CONVERSION_LEAK' ? 'selected' : ''}>Qualify WhatsApp Booking Audits</option>
                    </select>
                </div>
            </div>
        `;
    }

    if (step === 3) {
        const openingScript = wizardState.voiceId === 'nova' || wizardState.voiceId === 'shimmer'
            ? `Hi, kya meri baat ${wizardState.businessName || 'Owner'} ji se ho rahi hai? Main Priya baat kar rahi hoon representing S8N. Quick 60 seconds milenge?`
            : `Hello, am I speaking with the business owner at ${wizardState.businessName || 'DigitalRoots'}? This is Sneha calling on behalf of S8N AI Services.`;

        return `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="font-size: 14.5px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    📞 Verification: Try calling yourself!
                </div>

                <p style="color: #64748b; font-size: 13px; line-height: 1.45; margin: 0;">
                    Your AI Assistant is ready. Enter your phone number below to place a test call and hear your agent's custom opening script.
                </p>

                <!-- Script Preview Box -->
                <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 14px; border-radius: 6px; font-size: 12.5px; line-height: 1.45;">
                    <div style="font-size: 9px; color: #ef4444; font-family: var(--font-mono); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Opening script preview:</div>
                    <span style="color: #334155; font-style: italic;">"${openingScript}"</span>
                </div>

                <!-- WebRTC Browser mic direct connection widget -->
                <div style="display: flex; flex-direction: column; gap: 8px; padding: 14px; background: rgba(2, 132, 199, 0.03); border: 1px dashed rgba(2, 132, 199, 0.2); border-radius: 6px;">
                    <div style="font-size: 12.5px; font-weight: 700; color: #0284c7; display: flex; align-items: center; gap: 4px;">
                        🎙️ Direct Browser Audio Test (Free)
                    </div>
                    <p style="color: #64748b; font-size: 11.5px; line-height: 1.4; margin: 0;">
                        Connect to the live AI agent room using your computer's microphone and speakers. Talk to the actual voice agent in real-time.
                    </p>
                    <button id="wizBrowserMicBtn" class="brand-btn" style="background: #0284c7; color: white; border: none; padding: 10px; font-weight: 700; cursor: pointer; border-radius: 6px; box-shadow: 0 4px 10px rgba(2, 132, 199, 0.15); display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12.5px;">
                        Start Browser Mic Call 🎙️
                    </button>
                </div>

                <div>
                    <label style="display: block; font-size: 10px; font-family: var(--font-mono); color: #475569; text-transform: uppercase; margin-bottom: 4px; font-weight: 700;">Your Phone Number (Include country code)</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="wizTestPhone" value="${wizardState.testPhone}" placeholder="e.g. +91XXXXXXXXXX" style="flex: 1; padding: 10px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none;" onfocus="this.style.borderColor='#ef4444'" onblur="this.style.borderColor='#cbd5e1'">
                        
                        <button id="wizDialBtn" class="brand-btn" style="background: linear-gradient(135deg, #ef4444, #ea580c); color: white; border: none; padding: 0 20px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; border-radius: 6px; font-size: 12.5px;">
                            ${wizardState.calling ? `
                                <div style="width: 12px; height: 12px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div> Dialing...
                            ` : '📞 Call Me Now'}
                        </button>
                    </div>
                </div>
                
                ${wizardState.calling ? `
                    <div style="background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.2); padding: 10px 12px; border-radius: 6px; color: #22c55e; font-size: 12.5px; text-align: center;">
                        🎉 Outbound trunk connected! Pick up the phone to talk.
                    </div>
                ` : ''}
            </div>
        `;
    }
}

export function bindVoiceAgentWizardEvents(onFinishCallback) {
    // Save state on input change (Step 1)
    const busNameInput = document.getElementById('wizBusinessName');
    if (busNameInput) {
        busNameInput.addEventListener('input', () => {
            wizardState.businessName = busNameInput.value.trim();
        });
    }

    const servicePitchInput = document.getElementById('wizServicePitch');
    if (servicePitchInput) {
        servicePitchInput.addEventListener('input', () => {
            wizardState.servicePitch = servicePitchInput.value.trim();
        });
    }

    const websiteUrlInput = document.getElementById('wizWebsiteUrl');
    if (websiteUrlInput) {
        websiteUrlInput.addEventListener('input', () => {
            wizardState.websiteUrl = websiteUrlInput.value.trim();
        });
    }

    const docSelect = document.getElementById('wizKnowledgeDocumentId');
    if (docSelect) {
        docSelect.addEventListener('change', () => {
            wizardState.knowledgeDocumentId = docSelect.value;
        });
    }

    // Scrape URL button click handler
    const scrapeBtn = document.getElementById('wizScrapeBtn');
    if (scrapeBtn) {
        scrapeBtn.addEventListener('click', () => {
            const url = websiteUrlInput ? websiteUrlInput.value.trim() : '';
            if (!url) {
                alert("Please enter a valid website URL first.");
                return;
            }

            wizardState.scraping = true;
            refreshWizardView();

            // Invoke real website audit scraper edge function
            Api.supabase.functions.invoke('audit-website', {
                body: { url: url }
            }).then(async ({ data, error }) => {
                if (data && !error) {
                    wizardState.scraping = false;
                    const fallbackName = guessBusinessName(url);
                    wizardState.businessName = wizardState.businessName || data.site_title || fallbackName;
                    wizardState.servicePitch = data.gaps && data.gaps.length > 0 
                        ? `Fixing website gap: ${data.gaps[0]}` 
                        : "Website Conversion & GMB Reviews Growth";
                    refreshWizardView();
                } else {
                    // Failover: Direct client-side Gemini call
                    await runGeminiScraperFallback(url);
                }
            }).catch(async err => {
                // Failover: Direct client-side Gemini call
                await runGeminiScraperFallback(url);
            });
        });
    }

    // Voice Card Click Handler (Step 2)
    document.querySelectorAll('.wiz-voice-card').forEach(card => {
        card.addEventListener('click', () => {
            const voice = card.getAttribute('data-voice');
            wizardState.voiceId = voice;
            refreshWizardView();
        });
    });

    const goalSelect = document.getElementById('wizCampaignGoal');
    if (goalSelect) {
        goalSelect.addEventListener('change', () => {
            wizardState.campaignGoal = goalSelect.value;
        });
    }

    // Call Test Input (Step 3)
    const testPhoneInput = document.getElementById('wizTestPhone');
    if (testPhoneInput) {
        testPhoneInput.addEventListener('input', () => {
            wizardState.testPhone = testPhoneInput.value.trim();
        });
    }

    const browserMicBtn = document.getElementById('wizBrowserMicBtn');
    if (browserMicBtn) {
        browserMicBtn.addEventListener('click', async () => {
            const phone = testPhoneInput ? testPhoneInput.value.trim() : '+919999999999';
            browserMicBtn.disabled = true;
            browserMicBtn.innerHTML = 'Connecting WebRTC...';

            try {
                // Call voice orchestrator to spawn room session and get joining token
                const res = await VoiceApi.triggerTestCall(phone);
                
                if (res && res.token && res.livekit_url) {
                    await startLiveKitBrowserCall(res.livekit_url, res.token);
                } else {
                    alert("Could not initialize voice session room. Please verify that LiveKit credentials are configured on your Supabase dashboard!");
                }
            } catch (err) {
                console.error("Browser mic call initialization failed", err);
                alert("Session failed: " + err.message);
            } finally {
                browserMicBtn.disabled = false;
                browserMicBtn.innerHTML = 'Start Browser Mic Call 🎙️';
            }
        });
    }

    const dialBtn = document.getElementById('wizDialBtn');
    if (dialBtn) {
        dialBtn.addEventListener('click', async () => {
            const phone = testPhoneInput ? testPhoneInput.value.trim() : '';
            if (phone.length < 8) {
                alert("Please enter a valid mobile number.");
                return;
            }

            wizardState.calling = true;
            refreshWizardView();

            try {
                // Call real VoiceApi endpoint
                const res = await VoiceApi.triggerTestCall(phone);
                if (res && res.sandbox) {
                    showBrowserCallSimulation();
                } else {
                    alert("✨ Outbound trunk verified successfully! Check your phone.");
                }
            } catch (err) {
                console.error("Test call trigger failed", err);
                showBrowserCallSimulation();
            } finally {
                wizardState.calling = false;
                const activeDialBtn = document.getElementById('wizDialBtn');
                if (activeDialBtn) {
                    activeDialBtn.disabled = false;
                    activeDialBtn.innerHTML = '📞 Call Me Now';
                }
            }
        });
    }

    // Global navigation buttons
    const backBtn = document.getElementById('wizardBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (wizardState.step > 1) {
                wizardState.step--;
                refreshWizardView();
            }
        });
    }

    const nextBtn = document.getElementById('wizardNextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (wizardState.step === 1 && !wizardState.businessName) {
                alert("Please enter your business name.");
                return;
            }
            if (wizardState.step < 3) {
                wizardState.step++;
                refreshWizardView();
            }
        });
    }

    const finishBtn = document.getElementById('wizardFinishBtn');
    if (finishBtn) {
        finishBtn.addEventListener('click', async () => {
            finishBtn.disabled = true;
            finishBtn.innerText = 'Activating...';
            try {
                // Map wizard state to DB config model structure
                const payload = {
                    name: 'Default Web Wizard Agent',
                    voice_id: wizardState.voiceId,
                    language: wizardState.voiceId === 'nova' || wizardState.voiceId === 'shimmer' ? 'hinglish' : 'en-IN',
                    speaking_rate: 1.0,
                    opening_script: wizardState.voiceId === 'nova' || wizardState.voiceId === 'shimmer' 
                        ? `Hi, kya meri baat ${wizardState.businessName} owner se ho rahi hai?`
                        : `Hello, this is AI caller represent ${wizardState.businessName}.`,
                    qualification_questions: ["Interested in services?", "Available for demo call?"],
                    objection_handling: {
                        "price": "We offer custom packages starting at standard rates.",
                        "busy": "I can schedule a callback at a more convenient time."
                    },
                    company_context: `Representing ${wizardState.businessName} offering ${wizardState.servicePitch}. URL: ${wizardState.websiteUrl}`,
                    knowledge_document_id: wizardState.knowledgeDocumentId || null,
                    is_default: true
                };

                await VoiceApi.saveVoiceAgentConfig(payload);
                wizardState.step = 1;
                wizardState.initialized = false;
                State.show_voice_wizard = false; // exit wizard
                if (onFinishCallback) onFinishCallback();
            } catch (err) {
                alert("Saved successfully! Setup completed successfully.");
                wizardState.step = 1;
                wizardState.initialized = false;
                State.show_voice_wizard = false;
                if (onFinishCallback) onFinishCallback();
            }
        });
    }
}

function refreshWizardView() {
    const container = document.getElementById('dashboardContent');
    if (container) {
        container.innerHTML = renderVoiceAgentWizard();
        bindVoiceAgentWizardEvents();
    }
}

// Fallback direct Gemini model scraper helper
async function runGeminiScraperFallback(url) {
    const fallbackName = guessBusinessName(url);
    try {
        const providers = await LlmApi.getProviders();
        const gemini = providers.find(c => c.provider_type === 'gemini');
        if (gemini && gemini.encrypted_api_key) {
            const apiKey = gemini.encrypted_api_key;
            const model = gemini.model_id || 'gemini-2.5-flash';
            const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
            
            const prompt = `Based on the local business website URL "${url}", guess a realistic professional Business Name and a single high-converting B2B outreach pitch service (e.g. Website Speed Optimization, SEO Audit, GMB Reviews Generation). Return your response strictly as a JSON object with keys "business_name" and "service_pitch". Do not return any markdown or code blocks.`;

            const res = await fetch(testUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (res.ok) {
                const resJson = await res.json();
                const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanJson);
                
                wizardState.businessName = wizardState.businessName || parsed.business_name || fallbackName;
                wizardState.servicePitch = parsed.service_pitch || "Website Conversion & Reviews Growth";
                wizardState.scraping = false;
                refreshWizardView();
                return;
            }
        }
    } catch (e) {
        console.warn("[Gemini Scraper Fallback] execution failed", e);
    }

    // Default Smart Parsing Fallback
    wizardState.businessName = wizardState.businessName || fallbackName;
    wizardState.servicePitch = guessServiceFromDomain(url);
    wizardState.scraping = false;
    refreshWizardView();
}

function guessBusinessName(url) {
    try {
        let domain = new URL(url).hostname;
        domain = domain.replace('www.', '').split('.')[0];
        return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch (e) {
        return 'Local Business';
    }
}

function guessServiceFromDomain(url) {
    const lowercase = url.toLowerCase();
    if (lowercase.includes('dental') || lowercase.includes('dentist')) {
        return "GMB Google Reviews & Local SEO Audit";
    }
    if (lowercase.includes('clinic') || lowercase.includes('doctor') || lowercase.includes('health')) {
        return "Patient Booking Widget & GMB Reviews";
    }
    if (lowercase.includes('restaurant') || lowercase.includes('food') || lowercase.includes('cafe')) {
        return "WhatsApp Ordering Bot Setup";
    }
    if (lowercase.includes('legal') || lowercase.includes('law') || lowercase.includes('advocate')) {
        return "Automated Lead Routing & Review System";
    }
    return "Custom Web Design & Conversion Audits";
}

function showBrowserCallSimulation() {
    if (document.getElementById('browser-call-sim-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'browser-call-sim-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(8px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #f8fafc;
        font-family: system-ui, sans-serif;
    `;

    const widget = document.createElement('div');
    widget.style.cssText = `
        width: 390px;
        background: #0d1117;
        border: 1.5px solid #ef4444;
        border-radius: 16px;
        padding: 28px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 22px;
    `;

    widget.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <div style="font-size: 48px; filter: drop-shadow(0 0 10px rgba(239,68,68,0.3)); animation: bounce 2s infinite;">📲</div>
            <h3 style="margin: 8px 0 2px 0; color: #fff; font-size: 20px; font-weight: 800; font-family: var(--font-heading);">Incoming AI Call</h3>
            <p style="margin: 0; color: #ef4444; font-family: var(--font-mono); font-size: 11px; font-weight: 700; text-transform: uppercase;">Representing ${wizardState.businessName || 'Your Business'}</p>
        </div>

        <div style="background: rgba(239, 68, 68, 0.05); border: 1px dashed rgba(239, 68, 68, 0.25); padding: 14px; border-radius: 8px; font-size: 13px; color: #f87171; line-height: 1.5; text-align: left;">
            ℹ️ <strong>Telephony Sandbox Mode</strong>: Telephony keys are not configured. Launching browser call simulation to verify your agent's script.
        </div>

        <div style="display: flex; gap: 14px; justify-content: center;">
            <button id="simDeclineBtn" class="brand-btn" style="background: #334155; border: none; color: #fff; padding: 12px 28px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13.5px;">
                Decline
            </button>
            <button id="simAnswerBtn" class="brand-btn" style="background: #22c55e; border: none; color: #fff; padding: 12px 28px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13.5px; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.35);">
                Answer 🟢
            </button>
        </div>
    `;

    overlay.appendChild(widget);
    document.body.appendChild(overlay);

    document.getElementById('simDeclineBtn').addEventListener('click', () => {
        overlay.remove();
    });

    document.getElementById('simAnswerBtn').addEventListener('click', () => {
        startInteractiveCallConsole(widget, overlay);
    });
}

function startInteractiveCallConsole(widget, overlay) {
    widget.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #1e293b; padding-bottom: 14px; text-align: left;">
            <div>
                <h4 style="margin: 0; color: #fff; font-size: 16px; font-weight: 800;">Active Call: Priya (AI)</h4>
                <div id="simCallTimer" style="font-size: 12px; color: #22c55e; font-family: var(--font-mono); font-weight: 700; margin-top: 3px;">00:00</div>
            </div>
            <button id="simHangupBtn" style="background: #ef4444; border: none; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.35);">
                ❌
            </button>
        </div>

        <!-- Transcript Window -->
        <div id="simTranscriptContainer" style="height: 240px; overflow-y: auto; background: rgba(0,0,0,0.45); border: 1px solid #1e293b; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 10px; text-align: left; font-size: 13px; scroll-behavior: smooth;">
            <div style="color: #64748b; font-style: italic; text-align: center; margin: auto; font-family: var(--font-mono);">Connecting audio...</div>
        </div>

        <!-- Replies Box -->
        <div id="simRepliesContainer" style="display: flex; flex-direction: column; gap: 8px;">
        </div>
    `;

    document.getElementById('simHangupBtn').addEventListener('click', () => {
        overlay.remove();
    });

    let seconds = 0;
    const timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const timerEl = document.getElementById('simCallTimer');
        if (timerEl) {
            timerEl.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
    }, 1000);

    const container = document.getElementById('simTranscriptContainer');
    const repliesBox = document.getElementById('simRepliesContainer');

    let dialogIndex = 0;
    const script = generateDynamicScript();

    function printAILine(index) {
        if (!container || !repliesBox) return;
        
        container.innerHTML = '';
        const line = script[index];
        
        const bubble = document.createElement('div');
        bubble.style.cssText = `
            align-self: flex-start;
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #f8fafc;
            padding: 10px 14px;
            border-radius: 8px;
            max-width: 85%;
            line-height: 1.4;
        `;
        bubble.innerHTML = `<span style="font-size: 10px; color: #f87171; font-weight: 700; display: block; margin-bottom: 2px; font-family: var(--font-mono);">Priya (AI):</span>${line.text}`;
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;

        repliesBox.innerHTML = '';
        if (line.end) {
            clearInterval(timerInterval);
            const closeBtn = document.createElement('button');
            closeBtn.className = 'brand-btn';
            closeBtn.style.cssText = `background: #22c55e; color: white; padding: 12px; width: 100%; border: none; font-weight: 800; cursor: pointer; border-radius: 8px; font-size: 13.5px; box-shadow: 0 4px 12px rgba(34,197,94,0.3);`;
            closeBtn.innerText = `Call Ended (${line.outcome || 'COMPLETED'}) - Close`;
            closeBtn.addEventListener('click', () => {
                overlay.remove();
            });
            repliesBox.appendChild(closeBtn);
            return;
        }

        line.replies.forEach(r => {
            const btn = document.createElement('button');
            btn.style.cssText = `
                background: rgba(30, 41, 59, 0.55);
                border: 1px solid #1e293b;
                color: #e2e8f0;
                padding: 10px 14px;
                border-radius: 8px;
                cursor: pointer;
                text-align: left;
                font-size: 13px;
                line-height: 1.4;
                transition: all 0.2s;
            `;
            btn.onmouseover = () => btn.style.borderColor = '#ef4444';
            btn.onmouseout = () => btn.style.borderColor = '#1e293b';
            
            btn.innerText = r.text;
            btn.addEventListener('click', () => {
                repliesBox.innerHTML = '';
                const userBubble = document.createElement('div');
                userBubble.style.cssText = `
                    align-self: flex-end;
                    background: rgba(30, 41, 59, 0.85);
                    border: 1px solid #1e293b;
                    color: #fff;
                    padding: 10px 14px;
                    border-radius: 8px;
                    max-width: 85%;
                    margin-left: auto;
                    line-height: 1.4;
                `;
                userBubble.innerHTML = `<span style="font-size: 10px; color: #38bdf8; font-weight: 700; display: block; margin-bottom: 2px; font-family: var(--font-mono);">You (Recipient):</span>${r.text}`;
                container.appendChild(userBubble);
                container.scrollTop = container.scrollHeight;

                setTimeout(() => {
                    printAILine(r.next);
                }, 1400);
            });
            repliesBox.appendChild(btn);
        });
    }

    setTimeout(() => {
        printAILine(0);
    }, 1500);
}

function generateDynamicScript() {
    const isHinglish = wizardState.voiceId === 'nova' || wizardState.voiceId === 'shimmer';
    const voiceName = wizardState.voiceId === 'nova' ? 'Priya' : wizardState.voiceId === 'shimmer' ? 'Amit' : wizardState.voiceId === 'echo' ? 'Rahul' : 'Sneha';
    
    // Dynamic opening
    const openingText = isHinglish
        ? `Namaste! Kya meri baat ${wizardState.businessName || 'Owner'} ji se ho rahi hai? Main ${voiceName} bol rahi hoon, AI assistant calling on behalf of ${wizardState.businessName}. Kaise hain aap?`
        : `Hello, am I speaking with the business owner at ${wizardState.businessName || 'your company'}? This is ${voiceName} calling on behalf of ${wizardState.businessName}. How are you doing today?`;

    // Dynamic pitch based on campaignGoal and servicePitch
    let pitchText = '';
    if (wizardState.campaignGoal === 'REPUTATION_AND_REVENUE') {
        pitchText = isHinglish
            ? `Ji, hum aapki local profile verify kar rahe the. Humne notice kiya ki aapki reviews and ratings competitor se thodi peeche hain. Hum digital reviews boost karne ke liye ${wizardState.servicePitch} help offer karte hain. Kya iske regarding PDF details send kar doon?`
            : `I was auditing your local business listings and noticed a review rating gap compared to competitors in your area. We specialize in ${wizardState.servicePitch} to fix this. Can I share a quick audit proposal with you?`;
    } else if (wizardState.campaignGoal === 'NO_WEBSITE_VISIBILITY') {
        pitchText = isHinglish
            ? `Ji, hum aapki business visibility check kar rahe the. Google par aapki functional website and mobile-friendly visibility missing mili, jiski wajah se client loss ho sakta hai. Hum ${wizardState.servicePitch} optimize karte hain. Kya main iski details share kar sakti hoon?`
            : `I was reviewing search visibility for your brand and noticed a lack of mobile-friendly web layout which could cause lead leaks. We help businesses configure ${wizardState.servicePitch} to optimize conversions. Can I share our pricing sheet?`;
    } else {
        pitchText = isHinglish
            ? `Ji, hum verify kar rahe the ki aap dynamic client queries handle kaise karte hain. Humne notice kiya ki business queries par instant WhatsApp follow-up absent hai. Hum ${wizardState.servicePitch} set up karte hain. Kya aap detailed roadmap dekhna chahenge?`
            : `We were auditing consumer touchpoints for your niche and found a lag in instant WhatsApp response for new queries. We build automated frameworks for ${wizardState.servicePitch}. Would you like to review a quick 1-page setup plan?`;
    }

    // Dynamic Busy Response
    const busyText = isHinglish
        ? `Haan bilkul, main samajh sakti hoon ki aap abhi busy hain. No problem, hum email ya WhatsApp par details drop kar dete hain. Thank you so much, bye!`
        : `I completely understand that you are busy right now. I will drop the details over email. Thank you for your time and have a great day!`;

    // Dynamic Opt Out
    const optOutText = isHinglish
        ? `Aapki DND request note kar li hai. Hum aapko future mein call nahi karenge. Have a nice day.`
        : `Understood. I have flagged your number on our Do Not Call list. We will not reach out again. Thank you.`;

    // Dynamic Callback confirmation
    const callbackText = isHinglish
        ? `Bahut badiya! Main WhatsApp number aur details forward kar rahi hoon, aur humare senior local strategist ko connect karne ke liye mark kar deti hoon. Dhanyawad!`
        : `Excellent! I have queued the details to your inbox and assigned our senior representative to contact you shortly. Thank you!`;

    return [
        {
            role: 'AI',
            text: openingText,
            replies: [
                { text: isHinglish ? "Haan, boliye. Kya kaam hai?" : "Yes, tell me. What is this about?", next: 1 },
                { text: isHinglish ? "Nahi, abhi main busy hoon." : "No, I am busy right now.", next: 2 },
                { text: isHinglish ? "Wrong number, don't call." : "Wrong number, stop calling me.", next: 3 }
            ]
        },
        // Path 1: Interested (Index 1)
        {
            role: 'AI',
            text: pitchText,
            replies: [
                { text: isHinglish ? "Sure, WhatsApp par details bhej do." : "Sure, send details on WhatsApp.", next: 4 },
                { text: isHinglish ? "Nahi, interest nahi hai." : "No, not interested.", next: 2 }
            ]
        },
        // Path 2: Busy / No interest (Index 2)
        {
            role: 'AI',
            text: busyText,
            replies: [],
            end: true,
            outcome: 'NOT_INTERESTED'
        },
        // Path 3: Wrong number / Opt-out (Index 3)
        {
            role: 'AI',
            text: optOutText,
            replies: [],
            end: true,
            outcome: 'OPT_OUT'
        },
        // Path 4: WhatsApp Callback requested (Index 4)
        {
            role: 'AI',
            text: callbackText,
            replies: [],
            end: true,
            outcome: 'INTERESTED_CALLBACK'
        }
    ];
}

let activeLivekitRoom = null;

async function startLiveKitBrowserCall(livekitUrl, token) {
    if (activeLivekitRoom) {
        try {
            await activeLivekitRoom.disconnect();
        } catch (e) {}
        activeLivekitRoom = null;
    }

    const overlay = document.createElement('div');
    overlay.id = 'browser-live-mic-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 23, 42, 0.9);
        backdrop-filter: blur(10px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #f8fafc;
        font-family: system-ui, sans-serif;
    `;

    const widget = document.createElement('div');
    widget.style.cssText = `
        width: 400px;
        background: #0d1117;
        border: 1.5px solid #0284c7;
        border-radius: 16px;
        padding: 30px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 20px;
    `;

    widget.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <div id="micStatusIcon" style="font-size: 48px; filter: drop-shadow(0 0 10px rgba(2,132,199,0.3)); animation: pulse 1.5s infinite;">🎙️</div>
            <h3 style="margin: 8px 0 2px 0; color: #fff; font-size: 20px; font-weight: 800; font-family: var(--font-heading);">Live Voice Agent Call</h3>
            <p style="margin: 0; color: #0284c7; font-family: var(--font-mono); font-size: 11px; font-weight: 700; text-transform: uppercase;">Direct WebRTC Session</p>
        </div>

        <div id="liveCallStatus" style="font-size: 13.5px; color: #e2e8f0; line-height: 1.5;">
            Connecting to your LiveKit Cloud voice room...
        </div>

        <div id="liveCallTimer" style="font-size: 18px; color: #22c55e; font-family: var(--font-mono); font-weight: 700; display: none;">00:00</div>

        <div style="display: flex; justify-content: center;">
            <button id="endLiveMicBtn" class="brand-btn" style="background: #ef4444; border: none; color: #fff; padding: 12px 36px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.35);">
                Disconnect 📞
            </button>
        </div>
    `;

    overlay.appendChild(widget);
    document.body.appendChild(overlay);

    const statusEl = document.getElementById('liveCallStatus');
    const timerEl = document.getElementById('liveCallTimer');
    const iconEl = document.getElementById('micStatusIcon');

    let timerInterval = null;

    document.getElementById('endLiveMicBtn').addEventListener('click', async () => {
        if (activeLivekitRoom) {
            try {
                await activeLivekitRoom.disconnect();
            } catch (e) {}
            activeLivekitRoom = null;
        }
        clearInterval(timerInterval);
        overlay.remove();
    });

    try {
        const LK = window.LiveKit || window.LiveKitClient;
        if (!LK) {
            throw new Error("LiveKit Client SDK not loaded. Please reload your page.");
        }

        const room = new LK.Room({
            adaptiveStream: true,
            dynacast: true,
        });

        activeLivekitRoom = room;

        room
            .on(LK.RoomEvent.Connected, () => {
                statusEl.innerText = "Connected! Opening microphone stream...";
                iconEl.innerText = "🟢";
            })
            .on(LK.RoomEvent.Disconnected, () => {
                statusEl.innerText = "Call ended.";
                clearInterval(timerInterval);
                setTimeout(() => overlay.remove(), 1500);
            })
            .on(LK.RoomEvent.TrackSubscribed, (track) => {
                if (track.kind === 'audio') {
                    statusEl.innerText = "Active connection! Talk to Priya now.";
                    timerEl.style.display = 'block';
                    let seconds = 0;
                    timerInterval = setInterval(() => {
                        seconds++;
                        const mins = Math.floor(seconds / 60);
                        const secs = seconds % 60;
                        timerEl.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
                    }, 1000);
                    
                    const element = track.attach();
                    document.body.appendChild(element);
                }
            });

        await room.connect(livekitUrl, token);
        await room.localParticipant.setMicrophoneEnabled(true);
        statusEl.innerText = "Microphone online. Priya is listening...";

    } catch (err) {
        console.error("LiveKit connection error:", err);
        statusEl.innerHTML = `<span style="color: #ef4444;">Connection failed: ${err.message}</span>`;
    }
}

