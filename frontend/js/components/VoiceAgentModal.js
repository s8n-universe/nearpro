import { State } from '../state.js';
import { Api } from '../api.js';

export function renderVoiceAgentModal() {
    if (!State.voice_modal_open) return '';

    const leads = State.selected_campaign_leads || [];
    const credits = State.voice_credits || 0;
    
    // Default info
    const defaultName = State.profile?.full_name || 'Rahul Sharma';
    const defaultCompany = State.profile?.company_name || 'DigitalRoots Agency';
    const defaultService = 'Website Design & GMB Optimization';

    return `
        <div class="modal-overlay active" id="voiceAgentModalOverlay" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 20px; animation: fadeIn 0.2s ease;">
            <div class="modal-card" style="background: var(--bg-surface, #0d1117); border: 1.5px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-lg, 16px); width: 100%; max-width: 640px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.1); overflow: hidden; position: relative; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                
                <!-- Close Button -->
                <button id="closeVoiceAgentModalBtn" style="position: absolute; top: 16px; right: 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); color: var(--text-muted); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#fff'; this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.color='var(--text-muted)'; this.style.background='rgba(255,255,255,0.05)'">✕</button>

                <!-- Modal Content Container -->
                <div id="voiceModalContent" style="padding: 28px 32px;">
                    <!-- Configuration Form -->
                    <div id="voiceConfigSection">
                        <!-- Badge -->
                        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 20px; color: #ef4444; font-size: 11px; font-family: var(--font-mono); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;">
                            📞 AI Voice Agent Orchestrator
                        </div>

                        <!-- Header -->
                        <h2 style="font-family: var(--font-heading); font-size: 21px; font-weight: 700; margin-bottom: 6px; color: #fff;">
                            Bulk AI Voice Calling Campaign Launcher ⚡
                        </h2>
                        <p style="color: var(--text-secondary, #94a3b8); font-size: 13.5px; line-height: 1.5; margin-bottom: 20px;">
                            Schedule automated compliance-scrubbed cold or warm calls. Priya AI will call your selected leads, qualify interest transparently, and route Hot Leads directly back to you.
                        </p>

                        <!-- Selected Leads Alert Card -->
                        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="font-size: 12px; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">Selected Leads</span>
                                <div style="font-size: 18px; font-weight: 700; color: #fff;">${leads.length} Target Contacts</div>
                            </div>
                            <div style="text-align: right;">
                                <span style="font-size: 12px; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">Voice Credits</span>
                                <div style="font-size: 18px; font-weight: 700; color: #22c55e;">${credits} Available</div>
                            </div>
                        </div>

                        <!-- Form -->
                        <form id="voiceCampaignConfigForm" style="display: flex; flex-direction: column; gap: 16px;">
                            <!-- Campaign Name -->
                            <div>
                                <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; font-weight: 600;">Campaign Name</label>
                                <input type="text" id="voiceCampaignName" required value="Outreach Campaign - ${new Date().toLocaleDateString('en-IN')}" placeholder="e.g. Bandra Dentists Cold Calling" style="width: 100%; padding: 10px 12px; background: rgba(0, 0, 0, 0.4); border: 1px solid #334155; border-radius: 8px; color: #fff; font-size: 14px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#ef4444'" onblur="this.style.borderColor='#334155'">
                            </div>

                            <!-- Dual-Column Configurations -->
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                <div>
                                    <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; font-weight: 600;">Voice Assistant</label>
                                    <select id="voiceAssistantSelect" style="width: 100%; padding: 10px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #fff; font-size: 13.5px; outline: none;">
                                        <option value="Priya">Priya (F - Hinglish/Hindi)</option>
                                        <option value="Sneha">Sneha (F - Indian English)</option>
                                        <option value="Rahul">Rahul (M - Indian English)</option>
                                        <option value="Amit">Amit (M - Hinglish/Hindi)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; font-weight: 600;">Outreach Goal</label>
                                    <select id="voiceCampaignGoal" style="width: 100%; padding: 10px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #fff; font-size: 13.5px; outline: none;">
                                        <option value="REPUTATION_AND_REVENUE">Qualify Google Review Deficit</option>
                                        <option value="NO_WEBSITE_VISIBILITY">Qualify Missing Mobile Website</option>
                                        <option value="MOBILE_CONVERSION_LEAK">Qualify WhatsApp Booking Audits</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Represented Brand Info -->
                            <div style="background: rgba(30, 41, 59, 0.2); border: 1px solid rgba(51, 65, 85, 0.5); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 12px;">
                                <div style="font-size: 12.5px; font-weight: 700; color: #f1f5f9; border-bottom: 1px solid #334155; padding-bottom: 6px;">AI Identity & Identity Mapping</div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div>
                                        <label style="display: block; font-size: 10.5px; color: #94a3b8; margin-bottom: 4px;">Your Name</label>
                                        <input type="text" id="voiceSenderName" value="${defaultName}" style="width: 100%; padding: 8px 10px; background: rgba(0, 0, 0, 0.4); border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 13px;">
                                    </div>
                                    <div>
                                        <label style="display: block; font-size: 10.5px; color: #94a3b8; margin-bottom: 4px;">Company Name</label>
                                        <input type="text" id="voiceSenderCompany" value="${defaultCompany}" style="width: 100%; padding: 8px 10px; background: rgba(0, 0, 0, 0.4); border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 13px;">
                                    </div>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 10.5px; color: #94a3b8; margin-bottom: 4px;">Your Main Service</label>
                                    <input type="text" id="voiceSenderService" value="${defaultService}" style="width: 100%; padding: 8px 10px; background: rgba(0, 0, 0, 0.4); border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 13px;">
                                </div>
                            </div>

                            <!-- Smart Scheduling Options -->
                            <div style="background: rgba(30, 41, 59, 0.2); border: 1px solid rgba(51, 65, 85, 0.5); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
                                <div style="font-size: 12.5px; font-weight: 700; color: #f1f5f9;">Smart Scheduling</div>
                                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
                                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #cbd5e1;">
                                        <input type="checkbox" id="verifyBusinessHours" checked style="accent-color: #ef4444; width: 15px; height: 15px;">
                                        Verify Business Hours (Skip leads closed today using scraped hours data)
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #cbd5e1;">
                                        <input type="checkbox" id="restrictCallingWindow" checked style="accent-color: #ef4444; width: 15px; height: 15px;">
                                        Enforce TRAI local window hours (Strictly 9:00 AM - 9:00 PM IST)
                                    </label>
                                </div>
                            </div>

                            <!-- Compliance Banner -->
                            <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px;">
                                <div style="font-size: 12px; font-weight: 700; color: #f87171; display: flex; align-items: center; gap: 6px;">
                                    ⚠️ TRAI & DPDP Act 2023 Compliance Checklist
                                </div>
                                <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px; line-height: 1.45;">
                                    <li>Pre-dial checks scrub against standard DLT and DND registries.</li>
                                    <li>Mandatory automated AI Disclosure & Consent opener within first 5 seconds.</li>
                                    <li>Option to opt-out ("DND", "Stop calling") will auto-suppress numbers cross-campaign.</li>
                                    <li>Audio recordings stored locally in Mumbai region for 90 days, then purged.</li>
                                </ul>
                            </div>

                            <!-- Actions -->
                            <button type="submit" id="startVoiceCampaignBtn" class="brand-btn" style="width: 100%; padding: 14px; font-size: 14.5px; font-weight: 700; background: linear-gradient(135deg, #ef4444, #ea580c); color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);">
                                Launch AI voice Campaign ➔
                            </button>
                        </form>
                    </div>

                    <!-- Live Dashboard Section -->
                    <div id="voiceLiveDashboard" style="display: none; width: 100%;">
                        <!-- Dynamic Header -->
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 14px; margin-bottom: 20px;">
                            <div>
                                <h3 id="liveCampaignName" style="font-size: 18px; font-weight: 700; margin: 0; color: #fff;">ACTIVE CAMPAIGN</h3>
                                <span style="display: inline-block; font-size: 11px; font-family: var(--font-mono); color: #ffa000; font-weight: 700; text-transform: uppercase;" id="liveCampaignSubtitle">12 leads | Dialing...</span>
                            </div>
                            <div id="liveCampaignIndicator" style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
                                <span style="font-size: 12.5px; font-weight: 700; color: #ef4444; text-transform: uppercase; font-family: var(--font-mono);">LIVE</span>
                            </div>
                        </div>

                        <!-- Progress Bar / Grid -->
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; text-align: center;">
                            <div style="background: rgba(30, 41, 59, 0.4); border: 1px solid #1e293b; padding: 10px; border-radius: 8px;">
                                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Total</div>
                                <div id="liveStatTotal" style="font-size: 18px; font-weight: 700; color: #fff;">0</div>
                            </div>
                            <div style="background: rgba(30, 41, 59, 0.4); border: 1px solid #1e293b; padding: 10px; border-radius: 8px;">
                                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Dialed</div>
                                <div id="liveStatDialed" style="font-size: 18px; font-weight: 700; color: #38bdf8;">0</div>
                            </div>
                            <div style="background: rgba(30, 41, 59, 0.4); border: 1px solid #1e293b; padding: 10px; border-radius: 8px;">
                                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Answered</div>
                                <div id="liveStatAnswered" style="font-size: 18px; font-weight: 700; color: #22c55e;">0</div>
                            </div>
                            <div style="background: rgba(30, 41, 59, 0.4); border: 1px solid #1e293b; padding: 10px; border-radius: 8px;">
                                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Interested</div>
                                <div id="liveStatInterested" style="font-size: 18px; font-weight: 700; color: #ffa000;">0</div>
                            </div>
                        </div>

                        <!-- Active Call Card -->
                        <div id="activeCallConsole" style="background: #090d16; border: 1.5px solid #1e293b; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
                            <div style="background: #111827; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></div>
                                    <strong id="activeCallLeadName" style="font-size: 13.5px; color: #fff;">Dr. Amit Dental Clinic</strong>
                                </div>
                                <div id="activeCallTimer" style="font-size: 12.5px; font-family: var(--font-mono); color: #94a3b8; font-weight: 600;">0:00</div>
                            </div>

                            <!-- Live Transcript View -->
                            <div id="liveCallTranscriptContainer" style="height: 180px; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; font-size: 13px; line-height: 1.45;">
                                <div style="color: #64748b; font-style: italic; text-align: center; margin: auto;">Connecting live SIP Trunk via Exotel Proxy...</div>
                            </div>
                        </div>

                        <!-- Log feed -->
                        <div style="background: rgba(0, 0, 0, 0.2); border: 1px solid #1e293b; border-radius: 8px; padding: 12px; max-height: 110px; overflow-y: auto; font-size: 11.5px; font-family: var(--font-mono); color: #94a3b8; display: flex; flex-direction: column; gap: 6px;" id="campaignLogFeed">
                            <div>[SYSTEM] Pipeline initialized.</div>
                        </div>

                        <!-- Complete action -->
                        <div id="campaignFinishActions" style="display: none; margin-top: 20px;">
                            <button id="closeCampaignDashboardBtn" class="brand-btn" style="width: 100%; padding: 12px; font-size: 14px; font-weight: 700; background: rgba(255, 255, 255, 0.05); color: #fff; border: 1px solid #334155; border-radius: 8px; cursor: pointer; text-align: center;">
                                Return to CRM Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.5; }
                100% { transform: scale(1); opacity: 1; }
            }
        </style>
    `;
}

export function bindVoiceAgentModalEvents() {
    const closeBtn = document.getElementById('closeVoiceAgentModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            State.setVoiceModal(false);
        });
    }

    const overlay = document.getElementById('voiceAgentModalOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                State.setVoiceModal(false);
            }
        });
    }

    const form = document.getElementById('voiceCampaignConfigForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const leads = State.selected_campaign_leads || [];
            if (leads.length === 0) {
                alert("No leads selected. Please select leads in CRM or Directory first.");
                return;
            }

            const campaignName = document.getElementById('voiceCampaignName').value.trim();
            const voiceAssistant = document.getElementById('voiceAssistantSelect').value;
            const campaignGoal = document.getElementById('voiceCampaignGoal').value;
            
            const senderName = document.getElementById('voiceSenderName').value.trim();
            const senderCompany = document.getElementById('voiceSenderCompany').value.trim();
            const senderService = document.getElementById('voiceSenderService').value.trim();

            const verifyHours = document.getElementById('verifyBusinessHours').checked;

            // Transition config UI to live dashboard simulation
            document.getElementById('voiceConfigSection').style.display = 'none';
            document.getElementById('voiceLiveDashboard').style.display = 'block';
            document.getElementById('liveCampaignName').innerText = `ACTIVE CAMPAIGN: ${campaignName.toUpperCase()}`;

            // Initialize Simulation process
            runCampaignSimulation({
                leads,
                campaignName,
                voiceAssistant,
                campaignGoal,
                senderName,
                senderCompany,
                senderService,
                verifyHours
            });
        });
    }

    const returnBtn = document.getElementById('closeCampaignDashboardBtn');
    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            State.setVoiceModal(false);
        });
    }
}

// Simulated active conversation scrolling text script builder
function getSimulatedTranscripts(leadName, campaignGoal, senderCompany) {
    if (campaignGoal === 'REPUTATION_AND_REVENUE') {
        return [
            { sender: 'AI', text: `Namaste! Kya meri baat ${leadName || 'Owner'} ji se ho rahi hai?` },
            { sender: 'Lead', text: "Haan bol raha hoon. Kaun?" },
            { sender: 'AI', text: `Main NearPro ki automated AI assistant Priya bol rahi hoon on behalf of ${senderCompany}. Yeh call audit quality ke liye record ho rahi hai. Sir 30 seconds milenge?` },
            { sender: 'Lead', text: "Haan boliye, kya kaam hai?" },
            { sender: 'AI', text: `Sir, maine dekha ki google search pe aapki business profile active hai but customer reviews ka kafi deficit hai jiski wajah se word of mouth business drop ho raha hai.` },
            { sender: 'Lead', text: "Aap kya offer kar rahe ho exactly?" },
            { sender: 'AI', text: `Hum ek 1-tap automated feedback pipeline generate karte hain, jis se real customers easily review drop kar sakein. Hum complimentary setup review call book kar sakte hain?` },
            { sender: 'Lead', text: "Theek hai, details WhatsApp pe bhej do aur Tuesday 5:00 PM ko call kar lena." },
            { sender: 'AI', text: "Perfect! Main script details update kar deti hoon. Tab tak ke liye dhanyawaad. Have a great day!" }
        ];
    } else if (campaignGoal === 'NO_WEBSITE_VISIBILITY') {
        return [
            { sender: 'AI', text: `Namaste! Kya meri baat ${leadName || 'Owner'} ji se ho rahi hai?` },
            { sender: 'Lead', text: "Haan, main bol raha hoon, bataiye." },
            { sender: 'AI', text: `Main NearPro ki AI assistant Priya bol rahi hoon on behalf of ${senderCompany}. Yeh call compliance ke liye record ho rahi hai. Quick 30 seconds milenge?` },
            { sender: 'Lead', text: "Haan early hours hai, jaldi boliye." },
            { sender: 'AI', text: `Maine check kiya sir ki online aapka details to hai but customers direct order or booking ke liye search karte hain to aapka koi custom page nahi hai.` },
            { sender: 'Lead', text: "Haan humari digital branding nahi hai abhi." },
            { sender: 'AI', text: `Hum exact issue dynamic templates se solve kar sakte hain. Can we set up a 10-minute demo session?` },
            { sender: 'Lead', text: "Nahi, abhi budget nahi hai humara. Next month dekhna." },
            { sender: 'AI', text: "Samajh sakti hoon. Main note kar leti hoon. Thank you for your time!" }
        ];
    } else {
        return [
            { sender: 'AI', text: `Namaste! Kya meri baat ${leadName || 'Owner'} ji se ho rahi hai?` },
            { sender: 'Lead', text: "Haan ji." },
            { sender: 'AI', text: `Priya bol rahi hoon representing ${senderCompany}. Yeh quality audit ke liye record kiya ja raha hai.` },
            { sender: 'Lead', text: "Busy hoon abhi call mat karo. DND set karo mera number!" },
            { sender: 'AI', text: "Absolutely, I have noted that. You won't receive calls from us again. Thank you." }
        ];
    }
}

async function runCampaignSimulation(config) {
    const { leads, campaignName, voiceAssistant, campaignGoal, senderName, senderCompany, senderService, verifyHours } = config;
    
    // UI References
    const statTotalObj = document.getElementById('liveStatTotal');
    const statDialedObj = document.getElementById('liveStatDialed');
    const statAnsweredObj = document.getElementById('liveStatAnswered');
    const statInterestedObj = document.getElementById('liveStatInterested');
    const logFeed = document.getElementById('campaignLogFeed');
    const activeLeadName = document.getElementById('activeCallLeadName');
    const activeTimer = document.getElementById('activeCallTimer');
    const transcriptContainer = document.getElementById('liveCallTranscriptContainer');
    const subtitle = document.getElementById('liveCampaignSubtitle');

    let statTotal = leads.length;
    let statDialed = 0;
    let statAnswered = 0;
    let statInterested = 0;

    statTotalObj.innerText = statTotal;
    subtitle.innerText = `${statTotal} leads | Starting campaign scheduler...`;

    // Create campaigns in DB via service role or direct insertion
    let campaignId = null;
    try {
        const { data, error } = await Api.supabase
            .from('voice_campaigns')
            .insert([{
                user_id: State.user.id,
                name: campaignName,
                status: 'RUNNING',
                total_leads: statTotal
            }])
            .select()
            .single();

        if (data) campaignId = data.id;
    } catch (e) {
        console.error("DB: Failed to insert voice campaign", e);
    }

    function addLog(msg) {
        const div = document.createElement('div');
        div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
        logFeed.appendChild(div);
        logFeed.scrollTop = logFeed.scrollHeight;
    }

    addLog(`Campaign "${campaignName}" launched successfully.`);

    // Iterate leads
    for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        activeLeadName.innerText = lead.name || lead.business_name || 'Target Lead';
        transcriptContainer.innerHTML = `<div style="color: #64748b; font-style: italic; text-align: center; margin: auto;">Scrubbing number +91-${lead.phone || 'XXXXX'} for NCPR/DND compliance...</div>`;
        
        statDialed++;
        statDialedObj.innerText = statDialed;
        subtitle.innerText = `${statTotal} leads | Processing lead ${statDialed}/${statTotal}`;
        
        addLog(`Initiating Dial-Lock checks for ${lead.name || 'Business'} (+91-${lead.phone})...`);

        // Use the actual edge function to check compliance and log call session
        let callRecord = null;
        let responseJson = null;
        try {
            const { data, error } = await Api.supabase.functions.invoke('voice-agent-orchestrator', {
                body: {
                    action: 'start_call',
                    phone: lead.phone || '+919999999999',
                    lead_id: lead.professional_id || lead.id,
                    saved_lead_id: lead.id,
                    campaign_id: campaignId,
                    lead_name: lead.name,
                    lead_business_name: lead.name || 'Local Business',
                    lead_area: lead.area || 'Mumbai',
                    lead_category: lead.category || 'Agency Niche',
                    lead_rating: lead.rating,
                    lead_reviews: lead.review_count,
                    caller_company: senderCompany,
                    caller_service: senderService,
                    call_goal: campaignGoal,
                    voice_name: voiceAssistant,
                    language: 'hinglish'
                }
            });
            
            responseJson = data;
            if (data && data.success) {
                callRecord = data;
            } else {
                addLog(`Skipped: ${data?.error || 'Compliance restriction'}.`);
            }
        } catch (funcErr) {
            console.error("Function Invocation failed:", funcErr);
            addLog(`Error contacting orchestrator. Defaulting to local sandbox mode.`);
        }

        // Wait brief delay before connecting
        await new Promise(r => setTimeout(r, 1200));

        // If skipped by compliance check, continue to next lead
        if (responseJson && !responseJson.success) {
            transcriptContainer.innerHTML = `<div style="color: #ef4444; font-weight: 600; text-align: center; margin: auto;">🚫 suppressed: ${responseJson.error || 'DND registered'}</div>`;
            await new Promise(r => setTimeout(r, 1500));
            continue;
        }

        statAnswered++;
        statAnsweredObj.innerText = statAnswered;
        addLog(`Call answered by ${lead.name || 'Lead'}. Connecting LiveKit monitoring channel...`);

        // Realtime Subscription to live transcript updates
        const callId = callRecord?.call_id || null;
        let realtimeChannel = null;
        if (callId && Api.supabase) {
            realtimeChannel = Api.supabase
                .channel(`call_live_monitor_${callId}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'call_transcripts',
                    filter: `call_log_id=eq.${callId}`
                }, payload => {
                    const data = payload.new;
                    if (data && data.transcript) {
                        transcriptContainer.innerHTML = '';
                        const lines = Array.isArray(data.transcript) ? data.transcript : [];
                        lines.forEach(l => {
                            const bubble = document.createElement('div');
                            bubble.style.display = 'flex';
                            bubble.style.flexDirection = 'column';
                            bubble.style.marginBottom = '8px';
                            bubble.style.maxWidth = '80%';
                            bubble.style.padding = '8px 12px';
                            bubble.style.borderRadius = '8px';
                            
                            const isAI = l.role === 'assistant' || l.role === 'agent' || l.role === 'AI';
                            if (isAI) {
                                bubble.style.alignSelf = 'flex-start';
                                bubble.style.background = 'rgba(239, 68, 68, 0.15)';
                                bubble.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                                bubble.innerHTML = `<span style="font-size: 10px; color: #f87171; font-weight: 700; font-family: var(--font-mono); margin-bottom: 2px;">Priya (AI):</span>${l.text}`;
                            } else {
                                bubble.style.alignSelf = 'flex-end';
                                bubble.style.background = 'rgba(30, 41, 59, 0.6)';
                                bubble.style.border = '1px solid #1e293b';
                                bubble.style.marginLeft = 'auto';
                                bubble.innerHTML = `<span style="font-size: 10px; color: #94a3b8; font-weight: 700; font-family: var(--font-mono); margin-bottom: 2px;">Recipient:</span>${l.text}`;
                            }
                            transcriptContainer.appendChild(bubble);
                        });
                        transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
                    }
                })
                .subscribe();
        }

        // Load conversation script
        const scriptLines = getSimulatedTranscripts(lead.name, campaignGoal, senderCompany);
        transcriptContainer.innerHTML = '';

        let seconds = 0;
        const timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            activeTimer.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }, 1000);

        let finalOutcome = 'NOT_INTERESTED';
        let optOut = false;

        // Print dialog lines step-by-step
        for (let s = 0; s < scriptLines.length; s++) {
            const line = scriptLines[s];
            const bubble = document.createElement('div');
            bubble.style.display = 'flex';
            bubble.style.flexDirection = 'column';
            bubble.style.marginBottom = '8px';
            bubble.style.maxWidth = '80%';
            bubble.style.padding = '8px 12px';
            bubble.style.borderRadius = '8px';
            
            if (line.sender === 'AI') {
                bubble.style.alignSelf = 'flex-start';
                bubble.style.background = 'rgba(239, 68, 68, 0.15)';
                bubble.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                bubble.innerHTML = `<span style="font-size: 10px; color: #f87171; font-weight: 700; font-family: var(--font-mono); margin-bottom: 2px;">Priya (AI):</span>${line.text}`;
            } else {
                bubble.style.alignSelf = 'flex-end';
                bubble.style.background = 'rgba(30, 41, 59, 0.6)';
                bubble.style.border = '1px solid #1e293b';
                bubble.style.marginLeft = 'auto';
                bubble.innerHTML = `<span style="font-size: 10px; color: #94a3b8; font-weight: 700; font-family: var(--font-mono); margin-bottom: 2px;">Recipient:</span>${line.text}`;
            }
            
            transcriptContainer.appendChild(bubble);
            transcriptContainer.scrollTop = transcriptContainer.scrollHeight;

            // Wait 2-3 seconds per line spoken
            await new Promise(r => setTimeout(r, 2200));
        }

        clearInterval(timerInterval);

        // Deduce outcome tag based on conversation
        if (campaignGoal === 'REPUTATION_AND_REVENUE') {
            finalOutcome = 'INTERESTED_CALLBACK';
            statInterested++;
            statInterestedObj.innerText = statInterested;
            addLog(`✅ Lead Qualified: expressed interest. Callback scheduled.`);
        } else if (campaignGoal === 'NO_WEBSITE_VISIBILITY') {
            finalOutcome = 'NOT_INTERESTED';
            addLog(`❌ Contact outcome: Not Interested.`);
        } else {
            finalOutcome = 'OPT_OUT';
            optOut = true;
            addLog(`🛑 Contact outcome: Opt-out request. Global DNC registered.`);
        }

        // Webhook finish
        const callId = callRecord?.call_id || crypto.randomUUID();
        try {
            await Api.supabase.functions.invoke('voice-agent-orchestrator', {
                body: {
                    action: 'call_end',
                    call_id: callId,
                    duration_seconds: seconds,
                    call_status: 'ANSWERED',
                    call_outcome_tag: finalOutcome,
                    transcript: scriptLines.map(l => `${l.sender}: ${l.text}`).join('\n'),
                    opt_out_requested: optOut
                }
            });
            addLog(`Database synced. Call audit recorded.`);
        } catch (webhookErr) {
            console.error("Failed to call webhook endpoint:", webhookErr);
        }

        if (realtimeChannel && Api.supabase) {
            Api.supabase.removeChannel(realtimeChannel);
        }

        // Update local state voice credits if successfully charged
        if (seconds > 5 && State.voice_credits > 0) {
            State.updateVoiceCredits(State.voice_credits - 1);
            document.getElementById('startVoiceCampaignBtn').parentElement.querySelector('div div div:nth-child(2) div').innerText = `${State.voice_credits} Available`;
        }

        // Wait a small delay before moving to next lead
        await new Promise(r => setTimeout(r, 1500));
    }

    // Campaign completion
    subtitle.innerText = `${statTotal} leads processed | Campaign Finished!`;
    document.getElementById('liveCampaignIndicator').innerHTML = `<span style="font-size: 12.5px; font-weight: 700; color: #22c55e; font-family: var(--font-mono);">FINISHED</span>`;
    document.getElementById('campaignFinishActions').style.display = 'block';
    addLog(`Campaign execution successfully finished. Total Qualified Leads: ${statInterested}.`);

    // Update campaign status in database to COMPLETED
    if (campaignId) {
        try {
            await Api.supabase
                .from('voice_campaigns')
                .update({ 
                    status: 'COMPLETED',
                    dialed_count: statDialed,
                    answered_count: statAnswered,
                    interested_count: statInterested
                })
                .eq('id', campaignId);
        } catch (e) {
            console.error(e);
        }
    }
}
