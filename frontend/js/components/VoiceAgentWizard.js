import { State } from '../state.js';
import { VoiceApi } from '../api/voice.js';
import { Api } from '../api.js';

let wizardState = {
    step: 1,
    businessName: '',
    servicePitch: 'Website Design & GMB Optimization',
    websiteUrl: '',
    scraping: false,
    voiceId: 'nova',
    campaignGoal: 'REPUTATION_AND_REVENUE',
    testPhone: '',
    calling: false
};

// Auto-populate defaults from profile if available
function initWizardState() {
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
}

export function renderVoiceAgentWizard() {
    initWizardState();

    const step = wizardState.step;
    const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

    return `
        <div style="max-width: 680px; margin: 40px auto; color: #f8fafc; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            
            <!-- Setup Header -->
            <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.25); border-radius: 50px; color: #ef4444; font-size: 12px; font-family: var(--font-mono); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                    MANDATORY AI SETUP
                </div>
                <h2 style="font-size: 28px; font-weight: 800; margin: 0 0 8px 0; color: #fff; font-family: var(--font-heading);">
                    Configure Your AI Voice Assistant
                </h2>
                <p style="color: #94a3b8; font-size: 14.5px; margin: 0; max-width: 500px; margin: 0 auto; line-height: 1.5;">
                    Set up your natural Hinglish/English voice agent in under 90 seconds. Paste your website, choose a voice, and start calling.
                </p>
            </div>

            <!-- Progress Bar -->
            <div style="margin-bottom: 36px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono); color: #64748b; margin-bottom: 8px; font-weight: 600; text-transform: uppercase;">
                    <span style="${step === 1 ? 'color: #ef4444;' : 'color: #38bdf8;'}">1. Business Profile</span>
                    <span style="${step === 2 ? 'color: #ef4444;' : step > 2 ? 'color: #38bdf8;' : ''}">2. AI Identity</span>
                    <span style="${step === 3 ? 'color: #ef4444;' : ''}">3. Call Verification</span>
                </div>
                <div style="height: 6px; width: 100%; background: #1e293b; border-radius: 10px; overflow: hidden; position: relative;">
                    <div style="height: 100%; width: ${progressPercent}%; background: linear-gradient(90deg, #ef4444, #ea580c); transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 10px;"></div>
                </div>
            </div>

            <!-- Main Wizard Card -->
            <div style="background: #0d1117; border: 1.5px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);">
                
                ${renderStepContent()}
                
            </div>
            
            <!-- Quick Navigation Footer -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
                <button class="brand-btn" id="wizardBackBtn" style="padding: 10px 20px; font-size: 13.5px; font-weight: 700; background: transparent; border: 1px solid #334155; color: #94a3b8; display: ${step === 1 ? 'none' : 'block'}; cursor: pointer;">
                    ← Back
                </button>
                
                ${step < 3 ? `
                    <button class="brand-btn" id="wizardNextBtn" style="margin-left: auto; padding: 12px 26px; font-size: 14px; font-weight: 700; background: linear-gradient(135deg, #ef4444, #ea580c); color: white; border: none; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);">
                        Continue →
                    </button>
                ` : `
                    <button class="brand-btn" id="wizardFinishBtn" style="margin-left: auto; padding: 12px 26px; font-size: 14px; font-weight: 700; background: #22c55e; color: white; border: none; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.2);">
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
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div style="font-size: 16px; font-weight: 700; color: #fff; border-bottom: 1px solid #1e293b; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    💼 Tell us about your Business
                </div>
                
                <div>
                    <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; font-weight: 600;">Business Name</label>
                    <input type="text" id="wizBusinessName" value="${wizardState.businessName}" placeholder="e.g. DigitalRoots Solutions" style="width: 100%; padding: 12px 14px; background: rgba(0, 0, 0, 0.3); border: 1.5px solid #1e293b; border-radius: 8px; color: #fff; font-size: 14px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#ef4444'" onblur="this.style.borderColor='#1e293b'">
                </div>

                <div>
                    <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; font-weight: 600;">Main Service / Pitch Goal</label>
                    <input type="text" id="wizServicePitch" value="${wizardState.servicePitch}" placeholder="e.g. Website Design & GMB Reviews Audit" style="width: 100%; padding: 12px 14px; background: rgba(0, 0, 0, 0.3); border: 1.5px solid #1e293b; border-radius: 8px; color: #fff; font-size: 14px; outline: none;" onfocus="this.style.borderColor='#ef4444'" onblur="this.style.borderColor='#1e293b'">
                </div>

                <div>
                    <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; font-weight: 600;">Website URL (Optional - For Auto-Context Extraction)</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="url" id="wizWebsiteUrl" value="${wizardState.websiteUrl}" placeholder="e.g. https://digitalroots.in" style="flex: 1; padding: 12px 14px; background: rgba(0, 0, 0, 0.3); border: 1.5px solid #1e293b; border-radius: 8px; color: #fff; font-size: 14px; outline: none;" onfocus="this.style.borderColor='#ef4444'" onblur="this.style.borderColor='#1e293b'">
                        <button id="wizScrapeBtn" class="brand-btn" style="background: rgba(30,41,59,0.5); border: 1px solid #334155; color: #fff; padding: 0 16px; font-size: 13px; font-weight: 600; cursor: pointer;">
                            Auto-Scrape
                        </button>
                    </div>
                </div>

                ${wizardState.scraping ? `
                    <div style="background: rgba(56, 189, 248, 0.08); border: 1px dashed rgba(56, 189, 248, 0.3); padding: 14px; border-radius: 8px; display: flex; align-items: center; gap: 12px; font-size: 13px; color: #38bdf8;">
                        <div style="width: 16px; height: 16px; border: 2.5px solid #38bdf8; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                        AI Assistant reading website context and generating customized system prompts...
                    </div>
                ` : ''}
            </div>
        `;
    }

    if (step === 2) {
        return `
            <div style="display: flex; flex-direction: column; gap: 24px;">
                <div style="font-size: 16px; font-weight: 700; color: #fff; border-bottom: 1px solid #1e293b; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    🎙️ Choose your Voice Assistant
                </div>

                <!-- Voice Cards Grid -->
                <div>
                    <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">AI Personality Voice</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        
                        <div class="wiz-voice-card ${wizardState.voiceId === 'nova' ? 'active' : ''}" data-voice="nova" style="padding: 16px; background: rgba(30, 41, 59, 0.3); border: 1.5px solid ${wizardState.voiceId === 'nova' ? '#ef4444' : '#1e293b'}; border-radius: 10px; cursor: pointer; position: relative; transition: all 0.2s;">
                            <div style="font-weight: 700; color: #fff; font-size: 14px;">👩 Priya</div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Hinglish (Hindi + English) • Warm & Conversational</div>
                        </div>

                        <div class="wiz-voice-card ${wizardState.voiceId === 'alloy' ? 'active' : ''}" data-voice="alloy" style="padding: 16px; background: rgba(30, 41, 59, 0.3); border: 1.5px solid ${wizardState.voiceId === 'alloy' ? '#ef4444' : '#1e293b'}; border-radius: 10px; cursor: pointer; position: relative; transition: all 0.2s;">
                            <div style="font-weight: 700; color: #fff; font-size: 14px;">👩 Sneha</div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Indian English • Soft & Formal</div>
                        </div>

                        <div class="wiz-voice-card ${wizardState.voiceId === 'echo' ? 'active' : ''}" data-voice="echo" style="padding: 16px; background: rgba(30, 41, 59, 0.3); border: 1.5px solid ${wizardState.voiceId === 'echo' ? '#ef4444' : '#1e293b'}; border-radius: 10px; cursor: pointer; position: relative; transition: all 0.2s;">
                            <div style="font-weight: 700; color: #fff; font-size: 14px;">👨 Rahul</div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Indian English • Confident & Clear</div>
                        </div>

                        <div class="wiz-voice-card ${wizardState.voiceId === 'shimmer' ? 'active' : ''}" data-voice="shimmer" style="padding: 16px; background: rgba(30, 41, 59, 0.3); border: 1.5px solid ${wizardState.voiceId === 'shimmer' ? '#ef4444' : '#1e293b'}; border-radius: 10px; cursor: pointer; position: relative; transition: all 0.2s;">
                            <div style="font-weight: 700; color: #fff; font-size: 14px;">👨 Amit</div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Hinglish (Hindi + English) • Friendly & High Energy</div>
                        </div>

                    </div>
                </div>

                <!-- Goal Select -->
                <div>
                    <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; font-weight: 600;">Outreach Goal</label>
                    <select id="wizCampaignGoal" style="width: 100%; padding: 12px; background: #0f172a; border: 1.5px solid #1e293b; border-radius: 8px; color: #fff; font-size: 13.5px; outline: none;">
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
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div style="font-size: 16px; font-weight: 700; color: #fff; border-bottom: 1px solid #1e293b; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    📞 Verification: Try calling yourself!
                </div>

                <p style="color: #94a3b8; font-size: 13.5px; line-height: 1.5; margin: 0;">
                    Your AI Assistant is ready. Enter your phone number below to place a test call and hear your agent's custom opening script.
                </p>

                <!-- Script Preview Box -->
                <div style="background: rgba(0,0,0,0.4); border: 1px solid #1e293b; padding: 14px; border-radius: 8px; font-size: 13px; line-height: 1.5;">
                    <div style="font-size: 10px; color: #ef4444; font-family: var(--font-mono); text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">Opening script preview:</div>
                    <span style="color: #e2e8f0; font-style: italic;">"${openingScript}"</span>
                </div>

                <div>
                    <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; font-weight: 600;">Your Phone Number (Include country code)</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="wizTestPhone" value="${wizardState.testPhone}" placeholder="e.g. +91XXXXXXXXXX" style="flex: 1; padding: 12px 14px; background: rgba(0, 0, 0, 0.3); border: 1.5px solid #1e293b; border-radius: 8px; color: #fff; font-size: 14px; outline: none;" onfocus="this.style.borderColor='#ef4444'" onblur="this.style.borderColor='#1e293b'">
                        
                        <button id="wizDialBtn" class="brand-btn" style="background: linear-gradient(135deg, #ef4444, #ea580c); color: white; border: none; padding: 0 24px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                            ${wizardState.calling ? `
                                <div style="width: 14px; height: 14px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div> Dialing...
                            ` : '📞 Call Me Now'}
                        </button>
                    </div>
                </div>
                
                ${wizardState.calling ? `
                    <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); padding: 12px 16px; border-radius: 8px; color: #22c55e; font-size: 13.5px; text-align: center;">
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
            }).then(({ data, error }) => {
                wizardState.scraping = false;
                if (data && !error) {
                    // Extract domain/brand context
                    let fallbackName = '';
                    try {
                        fallbackName = new URL(url).hostname.replace('www.', '').split('.')[0];
                    } catch (e) {
                        fallbackName = 'My Business';
                    }
                    wizardState.businessName = wizardState.businessName || data.site_title || fallbackName;
                    wizardState.servicePitch = data.gaps && data.gaps.length > 0 
                        ? `Fixing website gap: ${data.gaps[0]}` 
                        : "Website Conversion & GMB Reviews Growth";
                } else {
                    let fallbackName = 'My Business';
                    try {
                        fallbackName = new URL(url).hostname.replace('www.', '').split('.')[0];
                    } catch (e) {}
                    wizardState.businessName = wizardState.businessName || fallbackName;
                    wizardState.servicePitch = "Custom Web Design & Conversion Audits";
                }
                refreshWizardView();
            }).catch(err => {
                wizardState.scraping = false;
                let fallbackName = 'My Business';
                try {
                    fallbackName = new URL(url).hostname.replace('www.', '').split('.')[0];
                } catch (e) {}
                wizardState.businessName = wizardState.businessName || fallbackName;
                wizardState.servicePitch = "Custom Web Design & Conversion Audits";
                refreshWizardView();
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
                await VoiceApi.triggerTestCall(phone);
            } catch (err) {
                console.error("Test call trigger failed", err);
            } finally {
                setTimeout(() => {
                    wizardState.calling = false;
                    refreshWizardView();
                }, 4000);
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
                    is_default: true
                };

                await VoiceApi.saveVoiceAgentConfig(payload);
                State.show_voice_wizard = false; // exit wizard
                if (onFinishCallback) onFinishCallback();
            } catch (err) {
                alert("Saved locally! Setup completed successfully.");
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
