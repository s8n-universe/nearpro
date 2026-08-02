import { State } from '../state.js';
import { Api } from '../api.js';
import { SequencesApi } from '../api/sequences.js';
import { OrchestratorApi } from '../api/orchestrator.js';

// Local UI state for editor
let activeView = 'list'; // 'list' | 'build' | 'analytics'
let currentSequence = null; 
let sequenceSteps = []; 
let leadLists = []; 
let selectedLeads = []; 
let analyticsData = null; 
let channelAccounts = [];
let channelPerformances = [];

export function renderEmailSequences() {
    if (activeView === 'build') {
        return renderSequenceBuilder();
    } else if (activeView === 'analytics') {
        return renderSequenceAnalytics();
    } else if (activeView === 'diagnostics') {
        return renderSequenceDiagnostics();
    }
    return renderSequencesDashboard();
}

function renderSequencesDashboard() {
    const list = window._cachedSequences || [];
    const stats = analyticsData || {
        total_sequences: 0,
        active_sequences: 0,
        total_enrolled: 0,
        total_replied: 0,
        avg_open_rate: 0,
        avg_reply_rate: 0
    };

    // Mailbox warning banner mimicking Apollo's alerts
    const alertBannerHTML = `
        <div style="background: #fff7ed; border: 1.5px solid #ffedd5; border-radius: 8px; padding: 12px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 2px 8px rgba(249,115,22,0.04);">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #c2410c; font-weight: 500;">
                <span style="font-size: 16px;">⚠️</span>
                <span>You have no mailboxes linked. Please connect your email account to start managing and sending emails via NearPro.</span>
            </div>
            <a href="#/dashboard/deliverability" style="font-size: 12px; font-weight: 800; color: #c2410c; text-decoration: underline; white-space: nowrap;">Link mailbox</a>
        </div>
    `;

    // Horizontal Sub-Tabs under page title
    const subtabsHTML = `
        <div style="display: flex; gap: 20px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 0px; margin-bottom: 20px; align-items: center;">
            <button onclick="activeView = 'list'; refreshSequencesView();" style="background: none; border: none; font-size: 12.5px; font-weight: 700; color: ${activeView === 'list' ? '#2563eb' : '#475569'}; padding: 0 0 10px 0; border-bottom: 2px solid ${activeView === 'list' ? '#2563eb' : 'transparent'}; cursor: pointer; transition: all 0.2s; font-family: var(--font-heading);">
                All Sequences
            </button>
            <button onclick="activeView = 'analytics'; refreshSequencesView();" style="background: none; border: none; font-size: 12.5px; font-weight: 700; color: ${activeView === 'analytics' ? '#2563eb' : '#475569'}; padding: 0 0 10px 0; border-bottom: 2px solid ${activeView === 'analytics' ? '#2563eb' : 'transparent'}; cursor: pointer; transition: all 0.2s; font-family: var(--font-heading);">
                Analytics
            </button>
            <button onclick="activeView = 'diagnostics'; refreshSequencesView();" style="background: none; border: none; font-size: 12.5px; font-weight: 700; color: ${activeView === 'diagnostics' ? '#2563eb' : '#475569'}; padding: 0 0 10px 0; border-bottom: 2px solid ${activeView === 'diagnostics' ? '#2563eb' : 'transparent'}; cursor: pointer; transition: all 0.2s; font-family: var(--font-heading);">
                Diagnostics
            </button>
        </div>
    `;

    const cardsHTML = list.length === 0 ? `
        <div style="grid-column: 1 / -1; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px 24px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.03); max-width:820px; margin: 0 auto; width:100%;">
            <div style="display:inline-block; border-radius: 8px; border: 1px solid #e2e8f0; padding:12px; background:#f8fafc; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                <!-- Simulated flow video thumbnail -->
                <div style="width: 280px; height: 130px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 6px; display: flex; align-items: center; justify-content: center; position: relative; color: white;">
                    <span style="font-size: 12px; font-family: var(--font-mono); font-weight:700; background:rgba(0,0,0,0.4); padding: 4px 10px; border-radius:4px;">Outreach Sequencer Guide</span>
                    <div style="position: absolute; bottom: 8px; left: 8px; font-size: 10px; font-family: var(--font-mono); background: rgba(0,0,0,0.6); padding: 2px 6px; border-radius: 4px;">▶ 1:05</div>
                </div>
            </div>
            <h3 style="color: #0f172a; font-family: var(--font-heading); font-size: 18px; font-weight:800; margin: 0 0 8px 0;">Create your first sequence</h3>
            <p style="color: #475569; font-size: 12.5px; max-width: 440px; margin: 0 auto 24px auto; line-height: 1.5;">
                Build custom campaigns to automate emails, set more meetings, and convert more customers with AI-crafted drafts.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button class="secondary-btn" id="adminCreateSeqScratch" style="padding: 10px 18px; font-size: 12.5px; border-radius: 6px; font-weight: 700; border: 1px solid #cbd5e1; color: #0f172a; background:#f8fafc;">Create sequence</button>
                <button class="brand-btn" id="adminCreateSeqAI" style="padding: 10px 18px; font-size: 12.5px; border-radius: 6px; font-weight: 700; background: #2563eb; color: white; display: flex; align-items: center; gap: 6px;">
                    ✨ Create with AI
                </button>
            </div>
        </div>
    ` : list.map(seq => {
        const isLive = seq.status === 'active';
        const openRate = seq.open_rate || 0;
        const replyRate = seq.reply_rate || 0;

        return `
            <div class="sequence-card-item" data-id="${seq.id}" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <span style="font-size: 10px; background: ${isLive ? 'rgba(34,197,94,0.1)' : '#f8fafc'}; border: 1px solid ${isLive ? 'rgba(34,197,94,0.2)' : '#cbd5e1'}; color: ${isLive ? '#22c55e' : '#475569'}; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
                            ${seq.status}
                        </span>
                        <span style="font-size: 12px; color: #475569; font-family: var(--font-mono, monospace); font-weight: 600;">
                            ${seq.total_steps} steps
                        </span>
                    </div>

                    <h4 style="margin: 0 0 6px 0; color: #0f172a; font-family: var(--font-heading); font-size: 16px; font-weight: 800;">${seq.name}</h4>
                    <p style="margin: 0 0 16px 0; color: #475569; font-size: 12.5px; line-height: 1.4;">${seq.description || 'No description provided.'}</p>
                </div>

                <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #475569; margin-bottom: 8px; font-weight: 600;">
                        <span>Enrolled: ${seq.total_enrolled}</span>
                        <span>Replies: ${seq.total_replied}</span>
                    </div>

                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 16px;">
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                            <span style="font-size: 10px; color: #475569;">Response Index</span>
                            <div style="height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; position: relative;">
                                <div style="width: ${openRate}%; height: 100%; background: var(--accent-gold); border-radius: 10px;"></div>
                            </div>
                        </div>
                        <div style="font-family: var(--font-mono, monospace); font-size: 11px; font-weight: 800; color: #0f172a; margin-top: 12px;">${openRate}%</div>
                    </div>

                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button class="brand-btn seq-action-btn edit" data-id="${seq.id}" style="padding: 6px 12px; font-size: 12px; font-weight: 700; background: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a; border-radius: 6px;">Edit</button>
                        <button class="brand-btn seq-action-btn enroll" data-id="${seq.id}" style="padding: 6px 12px; font-size: 12px; font-weight: 700; background: #2563eb; color: white; border: none; border-radius: 6px;">Enroll Leads</button>
                        <button class="brand-btn seq-action-btn analytics" data-id="${seq.id}" style="padding: 6px 12px; font-size: 12px; font-weight: 700; background: rgba(255,160,0,0.1); border: 1px solid rgba(255,160,0,0.25); color: var(--accent-gold); border-radius: 6px;">Stats</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div style="max-width: 1200px; display: flex; flex-direction: column; gap: 20px; color: #0f172a; padding-bottom: 40px;">
            
            <!-- Mailbox Warning Alert -->
            ${alertBannerHTML}

            <!-- Page Title Header section -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 800; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px; color: #0f172a;">
                        <span>Sequences</span>
                    </h3>
                    <p style="margin: 0; font-size: 12.5px; color: #475569;">Set up automated cross-channel drip sequences, schedule follow-ups, and monitor open/reply metrics.</p>
                </div>
                <button class="brand-btn" id="dashboardNewSeqBtn" style="background: #2563eb; color: white; font-weight: 700; padding: 9px 18px; font-size:12.5px; border-radius:6px;">
                    Create sequence
                </button>
            </div>

            <!-- Tabs list -->
            ${subtabsHTML}

            <!-- Dashboard Analytics Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <div style="font-size: 10px; color: #475569; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Total Sequences</div>
                    <div style="font-size: 20px; font-weight: 800; font-family: var(--font-mono); color: #0f172a;">${stats.total_sequences}</div>
                </div>
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <div style="font-size: 10px; color: #475569; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Active Campaigns</div>
                    <div style="font-size: 20px; font-weight: 800; font-family: var(--font-mono); color: #22c55e;">${stats.active_sequences}</div>
                </div>
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <div style="font-size: 10px; color: #475569; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Enrolled Leads</div>
                    <div style="font-size: 20px; font-weight: 800; font-family: var(--font-mono); color: #0f172a;">${stats.total_enrolled}</div>
                </div>
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <div style="font-size: 10px; color: #475569; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Average Open Rate</div>
                    <div style="font-size: 20px; font-weight: 800; font-family: var(--font-mono); color: var(--accent-gold);">${Math.round(stats.avg_open_rate)}%</div>
                </div>
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <div style="font-size: 10px; color: #475569; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Average Reply Rate</div>
                    <div style="font-size: 20px; font-weight: 800; font-family: var(--font-mono); color: #ec4899;">${Math.round(stats.avg_reply_rate)}%</div>
                </div>
            </div>

            <!-- Sequences List Grid -->
            <div>
                <h3 style="margin: 0 0 16px 0; font-size: 15px; font-family: var(--font-heading); font-weight: 800; color: #0f172a;">My Sequences</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                    ${cardsHTML}
                </div>
            </div>

        </div>

        <!-- Enrollment Modal overlay -->
        <div id="watchlistModalOverlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 10000; align-items: center; justify-content: center; padding: 24px;">
            <!-- Dummy element fallback mapping to match overlay variables -->
        </div>
        
        <div id="enrollmentModalOverlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 10000; align-items: center; justify-content: center; padding: 24px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1); color: #0f172a;">
                <div style="padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin:0; font-size: 16px; font-weight:800; font-family:var(--font-heading); color:#0f172a;">Enroll Leads in Sequence</h3>
                    <button class="brand-btn" id="closeEnrollmentModal" style="background:none; border:none; padding:4px; font-size:18px; line-height:1; color:#475569; cursor:pointer;">×</button>
                </div>
                
                <div style="padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px;">
                    <div>
                        <label style="display: block; font-size: 12.5px; font-weight:700; color:#475569; margin-bottom: 6px;">Select Lead Source List</label>
                        <select id="enrollLeadListSelect" style="width:100%; padding: 10px 14px; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; color:#0f172a; font-size:13.5px; outline:none;">
                            <option value="">-- Choose List --</option>
                            ${leadLists.map(l => `<option value="${l.id}">${l.name} (${l.total_leads || 0} leads)</option>`).join('')}
                        </select>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="display: block; font-size: 12.5px; font-weight:700; color:#475569;">Leads Checklist</label>
                        <div id="enrollLeadsListWrapper" style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; max-height: 200px; overflow-y: auto; background:#f8fafc; display:flex; flex-direction:column; gap:8px;">
                            <div style="color:#475569; font-size:12.5px; text-align:center; padding:12px;">Choose a source list first...</div>
                        </div>
                    </div>
                </div>

                <div style="padding: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="brand-btn" id="cancelEnrollBtn" style="padding: 8px 16px; font-size:12.5px; background:#f8fafc; color:#0f172a; border: 1px solid #cbd5e1;">Cancel</button>
                    <button class="brand-btn" id="confirmEnrollBtn" style="padding: 8px 16px; font-size:12.5px; background:#2563eb; color:white; border:none;" disabled>Enroll Selected Leads</button>
                </div>
            </div>
        </div>
    `;
}

function renderSequenceBuilder() {
    const isNew = !currentSequence;
    const name = currentSequence ? currentSequence.name : '';
    const desc = currentSequence ? currentSequence.description : '';

    const stepsHTML = sequenceSteps.length === 0 ? `
        <div style="text-align: center; padding: 32px 16px; border: 1.5px dashed #cbd5e1; border-radius: 8px; background: #f8fafc; margin-bottom: 20px;">
            <p style="color: #475569; font-size: 13px; margin-bottom: 12px;">No campaign steps created. Add your first step to define the drip outreach.</p>
            <button class="brand-btn" id="builderAddFirstStepBtn" style="background: rgba(255,160,0,0.1); border: 1px solid rgba(255,160,0,0.25); color: var(--accent-gold); font-size: 12.5px; font-weight: 700; padding: 8px 16px;">
                + Add Step 1 (Email)
            </button>
        </div>
    ` : sequenceSteps.map((step, idx) => {
        const type = step.step_type || 'email';
        const accentColor = type === 'whatsapp' ? '#22c55e' : type === 'phone' ? '#a855f7' : type === 'linkedin' ? '#f97316' : '#2563eb';

        return `
            <div class="builder-step-node" data-idx="${idx}" style="background: #ffffff; border: 1.5px solid ${accentColor}; border-radius: 8px; padding: 20px; position: relative; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); color: #0f172a; transition: border-color 0.3s ease;">
                
                <!-- Remove Step button -->
                <button class="builder-remove-step-btn" data-idx="${idx}" style="position: absolute; top: 12px; right: 12px; background: none; border: none; font-size: 16px; color: #475569; cursor: pointer;">×</button>

                <!-- Step Header Node -->
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 16px;">
                    <span style="font-family: var(--font-mono, monospace); font-size: 11px; background: ${accentColor}; color: #fff; font-weight: 800; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        ${idx + 1}
                    </span>
                    <h4 style="margin: 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a;">
                        Step ${idx + 1}: ${idx === 0 ? 'First Touch' : 'Follow Up'}
                    </h4>
                </div>

                <!-- Step Body Inputs -->
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    
                    <!-- Channel Selector -->
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 4px;">Outreach Channel Type</label>
                        <select class="step-channel-select" data-idx="${idx}" style="width: 100%; padding: 8px 12px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13px; outline: none; font-weight:600;">
                            <option value="email" ${type === 'email' ? 'selected' : ''}>📧 SMTP Email Message</option>
                            <option value="whatsapp" ${type === 'whatsapp' ? 'selected' : ''}>💬 WhatsApp Template Message</option>
                            <option value="phone" ${type === 'phone' ? 'selected' : ''}>📞 Manual Phone Call (Script reminder task)</option>
                            <option value="linkedin" ${type === 'linkedin' ? 'selected' : ''}>🔗 LinkedIn Connection Request (Task)</option>
                        </select>
                    </div>

                    ${type === 'email' ? `
                        <div>
                            <label style="display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 4px;">Email Subject Line</label>
                            <input type="text" class="step-subject-input" data-idx="${idx}" value="${step.subject_line || ''}" placeholder="e.g. Hey {{name}}, noticed your page is loading slowly..." style="width: 100%; padding: 10px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13px; outline: none;" />
                        </div>
                    ` : ''}
                    
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <label style="display: block; font-size: 12px; font-weight: 700; color: #475569;">Message Content Template</label>
                            <span style="font-size: 11px; color: var(--accent-gold); font-weight: 700;">Tip: Type {{ to insert dynamic placeholders</span>
                        </div>
                        <textarea class="step-body-textarea" data-idx="${idx}" placeholder="Write your template. Use {{name}}, {{area}}, {{category}}, {{website}}, or {{rating}} variables." style="width: 100%; height: 120px; padding: 12px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13px; font-family: inherit; line-height: 1.5; resize: vertical; outline: none;">${step.body_template || ''}</textarea>
                    </div>

                    <!-- Wait/Delay Options -->
                    ${idx > 0 ? `
                        <div style="display: flex; align-items: center; gap: 10px; background: #f8fafc; padding: 10px 14px; border-radius: 6px; border: 1px solid #cbd5e1; margin-top: 4px;">
                            <span style="font-size: 12px; font-weight: 700; color: #475569;">⏱ Delay sending step:</span>
                            <input type="number" class="step-delay-input" data-idx="${idx}" value="${step.delay_days || 3}" min="1" max="30" style="width: 50px; padding: 6px; background:#ffffff; border:1px solid #cbd5e1; border-radius:4px; color:#0f172a; font-size:12.5px; font-weight:700; text-align:center;" />
                            <span style="font-size: 12.5px; color:#475569; font-weight:600;">days after previous step.</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Inter-node Connector Line -->
                ${idx < sequenceSteps.length - 1 ? `
                    <div style="width: 2px; height: 24px; background: #cbd5e1; margin: 12px auto -36px auto; position: relative; z-index: 1;"></div>
                ` : ''}
            </div>
        `;
    }).join('');

    return `
        <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; color: #0f172a; padding-bottom: 40px;">
            
            <!-- Builder Nav Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px;">
                <button class="brand-btn" id="builderBackToDashboard" style="padding: 6px 14px; font-size: 12.5px; background: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700;">
                    ← Back to Dashboard
                </button>
                <div style="display: flex; gap: 10px;">
                    <button class="brand-btn" id="builderSaveDraftBtn" style="padding: 8px 16px; font-size: 13px; font-weight: 700; background: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a;">
                        Save Draft
                    </button>
                    <button class="brand-btn" id="builderActivateBtn" style="padding: 8px 16px; font-size: 13px; font-weight: 800; background: #2563eb; color: white; border: none;">
                        Launch Campaign 🚀
                    </button>
                </div>
            </div>

            <!-- Sequence settings inputs -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                <h3 style="margin: 0; font-size: 16px; font-weight: 800; font-family: var(--font-heading); color: #0f172a;">
                    ${isNew ? 'New Multi-Channel Blueprint' : 'Modify Campaign Blueprint'}
                </h3>
                
                <div>
                    <label style="display: block; font-size: 12.5px; font-weight: 700; color: #475569; margin-bottom: 6px;">Sequence Name</label>
                    <input type="text" id="builderSequenceName" value="${name}" placeholder="e.g. Cold Restaurant Outbound (Juhu)" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none; font-weight: 600;" />
                </div>
                
                <div>
                    <label style="display: block; font-size: 12.5px; font-weight: 700; color: #475569; margin-bottom: 6px;">Campaign Description</label>
                    <textarea id="builderSequenceDesc" placeholder="Describe the goal of this automated sequence..." style="width: 100%; height: 80px; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; font-family: inherit; line-height: 1.4; resize: none; outline: none;">${desc}</textarea>
                </div>
            </div>

            <!-- Steps Editor Container -->
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="margin: 0; font-size: 16px; font-family: var(--font-heading); font-weight: 800; color: #0f172a;">Campaign Sequence Steps</h3>
                    <button class="brand-btn" id="builderAddStepBtn" style="padding: 6px 14px; font-size: 12.5px; background: rgba(255,160,0,0.1); border: 1px solid rgba(255,160,0,0.25); color: var(--accent-gold); font-weight: 700;">
                        + Add Next Step
                    </button>
                </div>

                <div id="builderStepsStack">
                    ${stepsHTML}
                </div>
            </div>

        </div>
    `;
}

function renderSequenceAnalytics() {
    const seq = currentSequence;
    if (!seq) return '';

    const replyRate = seq.reply_rate || 0;

    // Seeding mock channel performances layout
    const performancesHTML = channelPerformances.map(perf => {
        const rate = perf.total_sent > 0 ? Math.round((perf.total_replied / perf.total_sent) * 100) : 0;
        const color = perf.channel_type === 'whatsapp' ? '#22c55e' : '#2563eb';

        return `
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:20px;">${perf.channel_type === 'whatsapp' ? '💬' : '📧'}</span>
                    <div>
                        <div style="font-size:13.5px; font-weight:700; color:#0f172a; text-transform:uppercase;">${perf.channel_type} Channel</div>
                        <div style="font-size:11px; color:#475569; margin-top:2px;">Sent: ${perf.total_sent} • Delivered: ${perf.total_delivered}</div>
                    </div>
                </div>
                
                <div style="text-align:right;">
                    <div style="font-family:var(--font-mono); font-size:14.5px; font-weight:800; color:${color};">${rate}% Reply Rate</div>
                    <div style="font-size:11px; color:#475569; margin-top:2px;">Avg Response: ${perf.avg_response_time_h}h</div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div style="max-width: 1000px; display: flex; flex-direction: column; gap: 24px; color: #0f172a; padding-bottom: 40px;">
            
            <!-- Analytics Nav Header -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <button class="brand-btn" id="analyticsBackToDashboard" style="padding: 6px 14px; font-size: 12.5px; background: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700;">
                    ← Back to Dashboard
                </button>
                <div style="font-size: 13.5px; color: #475569; font-weight: 500;">
                    Inspecting: <strong style="color: #0f172a;">${seq.name}</strong>
                </div>
            </div>

            <!-- Performance Numbers Overview Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <div style="font-size: 11px; color: #475569; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Total Enrolled</div>
                    <div style="font-size: 26px; font-weight: 800; font-family: var(--font-mono); color: #0f172a;">${seq.total_enrolled}</div>
                </div>
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <div style="font-size: 11px; color: #475569; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Replies Received</div>
                    <div style="font-size: 26px; font-weight: 800; font-family: var(--font-mono); color: #22c55e;">${seq.total_replied}</div>
                </div>
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <div style="font-size: 11px; color: #475569; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Replies Rate</div>
                    <div style="font-size: 26px; font-weight: 800; font-family: var(--font-mono); color: #ec4899;">${Math.round(replyRate)}%</div>
                </div>
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <div style="font-size: 11px; color: #475569; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Bounces Detected</div>
                    <div style="font-size: 26px; font-weight: 800; font-family: var(--font-mono); color: #ef4444;">${seq.total_bounced}</div>
                </div>
            </div>

            <!-- Conversion Funnel & Channel comparison -->
            <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; align-items: start;">
                
                <!-- Left: Funnel details -->
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); color: #0f172a;">
                    <h4 style="margin: 0 0 16px 0; font-size: 16px; color: #0f172a; font-family: var(--font-heading); font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
                        📈 Campaign Conversion Funnel
                    </h4>
                    
                    <div style="display: flex; flex-direction: column; gap: 16px; padding: 10px 0;">
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 6px; font-weight: 600;">
                                <span>Step 1: First Touch Pitch</span>
                                <span>${seq.total_enrolled} sent (100%)</span>
                            </div>
                            <div style="height: 24px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; position: relative;">
                                <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%); display: flex; align-items: center; padding-left: 12px; font-size: 11px; font-weight: 700; color: white;">ENROLLED PITCH</div>
                            </div>
                        </div>

                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 6px; font-weight: 600;">
                                <span>Replies Log</span>
                                <span>${seq.total_replied} replies (${Math.round(replyRate)}%)</span>
                            </div>
                            <div style="height: 24px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; position: relative;">
                                <div style="width: ${replyRate}%; height: 100%; background: linear-gradient(90deg, #ec4899 0%, #be185d 100%); display: flex; align-items: center; padding-left: 12px; font-size: 11px; font-weight: 700; color: white;">REPLIES RESPONSE</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Channel comparisons -->
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); color: #0f172a;">
                    <h4 style="margin: 0 0 16px 0; font-size: 16px; color: #0f172a; font-family: var(--font-heading); font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
                        📊 Channel Performance Index
                    </h4>
                    
                    <div style="display: flex; flex-direction: column;">
                        ${performancesHTML}
                    </div>
                </div>

            </div>

        </div>
    `;
}

export function bindEmailSequencesEvents() {
    // 1. New sequence scratch trigger
    const scratchBtn = document.getElementById('adminCreateSeqScratch') || document.getElementById('dashboardNewSeqBtn');
    if (scratchBtn) {
        scratchBtn.addEventListener('click', () => {
            currentSequence = null;
            sequenceSteps = [
                {
                    step_number: 1,
                    step_type: 'email',
                    subject_line: '',
                    body_template: '',
                    delay_days: 0,
                    delay_hours: 0,
                    send_time_window: '10:00-18:00',
                    ab_variant: 'A',
                    is_active: true
                }
            ];
            activeView = 'build';
            refreshView();
        });
    }

    // 2. Edit sequence details
    document.querySelectorAll('.seq-action-btn.edit').forEach(btn => {
        btn.addEventListener('click', async () => {
            const seqId = btn.getAttribute('data-id');
            const seq = window._cachedSequences.find(s => s.id === seqId);
            if (seq) {
                currentSequence = seq;
                try {
                    sequenceSteps = await SequencesApi.getSequenceSteps(seqId);
                    if (sequenceSteps.length === 0) {
                        sequenceSteps = [
                            { step_number: 1, step_type: 'email', subject_line: '', body_template: '', delay_days: 0, delay_hours: 0, send_time_window: '10:00-18:00', ab_variant: 'A', is_active: true }
                        ];
                    }
                } catch (e) {
                    console.warn("Failed to load steps, starting fresh", e);
                    sequenceSteps = [];
                }
                activeView = 'build';
                refreshView();
            }
        });
    });

    // 3. Inspect Campaign Analytics
    document.querySelectorAll('.seq-action-btn.analytics').forEach(btn => {
        btn.addEventListener('click', () => {
            const seqId = btn.getAttribute('data-id');
            const seq = window._cachedSequences.find(s => s.id === seqId);
            if (seq) {
                currentSequence = seq;
                activeView = 'analytics';
                refreshView();
            }
        });
    });

    // 4. Enroll leads modal triggers
    document.querySelectorAll('.seq-action-btn.enroll').forEach(btn => {
        btn.addEventListener('click', async () => {
            const seqId = btn.getAttribute('data-id');
            const seq = window._cachedSequences.find(s => s.id === seqId);
            if (seq) {
                currentSequence = seq;
                selectedLeads = [];
                
                // Show modal overlay
                const modal = document.getElementById('enrollmentModalOverlay');
                if (modal) {
                    modal.style.display = 'flex';
                }

                // Retrieve lists asynchronously
                try {
                    leadLists = await Api.getLeadLists();
                    const listSelect = document.getElementById('enrollLeadListSelect');
                    if (listSelect) {
                        listSelect.innerHTML = `<option value="">-- Choose List --</option>` + leadLists.map(l => `<option value="${l.id}">${l.name} (${l.total_leads || 0} leads)</option>`).join('');
                    }
                } catch (e) {
                    console.warn("Failed to load lead lists:", e);
                }
            }
        });
    });

    // Modal Events
    const modalSelect = document.getElementById('enrollLeadListSelect');
    if (modalSelect) {
        modalSelect.addEventListener('change', async () => {
            const listId = modalSelect.value;
            const container = document.getElementById('enrollLeadsListWrapper');
            const enrollBtn = document.getElementById('confirmEnrollBtn');
            
            if (!listId) {
                if (container) container.innerHTML = `<div style="color:#a1a1aa; font-size:12.5px; text-align:center; padding:12px;">Choose a source list first...</div>`;
                if (enrollBtn) enrollBtn.disabled = true;
                return;
            }

            if (container) container.innerHTML = `<div style="color:var(--accent-gold); font-size:12px; text-align:center; padding:12px;">Retrieving list leads...</div>`;

            try {
                const leads = await Api.getSavedLeads(listId);
                const listItems = leads || [];
                
                if (listItems.length === 0) {
                    if (container) container.innerHTML = `<div style="color:#a1a1aa; font-size:12.5px; text-align:center; padding:12px;">No leads found in this list.</div>`;
                    if (enrollBtn) enrollBtn.disabled = true;
                    return;
                }

                if (container) {
                    container.innerHTML = listItems.map((item, idx) => {
                        const p = item.professionals || {};
                        return `
                            <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:13px; color:#0f172a; padding: 4px 0;">
                                <input type="checkbox" class="enrollment-lead-checkbox" data-id="${p.id}" checked />
                                <span>${p.name || 'Lead'} (${p.category || 'N/A'} - ${p.area || 'Mumbai'})</span>
                            </label>
                        `;
                    }).join('');
                }

                // Populate initially selected
                selectedLeads = listItems.map(item => ({ professional_id: item.professionals?.id, saved_lead_id: item.id }));
                if (enrollBtn) enrollBtn.disabled = selectedLeads.length === 0;

                // Listen checkbox changes
                document.querySelectorAll('.enrollment-lead-checkbox').forEach(cb => {
                    cb.addEventListener('change', () => {
                        const leadId = cb.getAttribute('data-id');
                        const isChecked = cb.checked;
                        const matchItem = listItems.find(item => item.professionals?.id === leadId);
                        
                        if (isChecked) {
                            if (!selectedLeads.find(l => l.professional_id === leadId)) {
                                selectedLeads.push({ professional_id: leadId, saved_lead_id: matchItem?.id });
                            }
                        } else {
                            selectedLeads = selectedLeads.filter(l => l.professional_id !== leadId);
                        }
                        if (enrollBtn) enrollBtn.disabled = selectedLeads.length === 0;
                    });
                });

            } catch (err) {
                console.warn("Failed to load list details:", err);
                if (container) container.innerHTML = `<div style="color:var(--accent-pink); font-size:12.5px; text-align:center; padding:12px;">Failed to retrieve leads.</div>`;
            }
        });
    }

    const closeOverlayBtn = document.getElementById('closeEnrollmentModal') || document.getElementById('cancelEnrollBtn');
    if (closeOverlayBtn) {
        closeOverlayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('enrollmentModalOverlay');
            if (modal) modal.style.display = 'none';
        });
    }

    const confirmEnrollBtn = document.getElementById('confirmEnrollBtn');
    if (confirmEnrollBtn) {
        confirmEnrollBtn.addEventListener('click', async () => {
            if (selectedLeads.length === 0 || !currentSequence) return;
            confirmEnrollBtn.disabled = true;
            confirmEnrollBtn.innerText = 'Enrolling...';

            try {
                await SequencesApi.enrollLeads(currentSequence.id, selectedLeads);
                alert(`✨ Successfully enrolled ${selectedLeads.length} leads in campaign!`);
                const modal = document.getElementById('enrollmentModalOverlay');
                if (modal) modal.style.display = 'none';
                
                // Refresh data
                await loadCampaignData();
                activeView = 'list';
                refreshView();
            } catch (err) {
                console.error("Enrollment failed:", err);
                alert(`Enrollment failed: ${err.message}`);
                confirmEnrollBtn.disabled = false;
                confirmEnrollBtn.innerText = 'Enroll Selected Leads';
            }
        });
    }

    // Builder Inputs Actions
    const builderBackBtn = document.getElementById('builderBackToDashboard') || document.getElementById('analyticsBackToDashboard');
    if (builderBackBtn) {
        builderBackBtn.addEventListener('click', () => {
            activeView = 'list';
            currentSequence = null;
            sequenceSteps = [];
            refreshView();
        });
    }

    const addStepBtn = document.getElementById('builderAddStepBtn') || document.getElementById('builderAddFirstStepBtn');
    if (addStepBtn) {
        addStepBtn.addEventListener('click', () => {
            const nextIdx = sequenceSteps.length + 1;
            sequenceSteps.push({
                step_number: nextIdx,
                step_type: 'email',
                subject_line: '',
                body_template: '',
                delay_days: 3,
                delay_hours: 0,
                send_time_window: '10:00-18:00',
                ab_variant: 'A',
                is_active: true
            });
            refreshView();
        });
    }

    document.querySelectorAll('.builder-remove-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            sequenceSteps.splice(idx, 1);
            
            // Re-order step numbers
            sequenceSteps = sequenceSteps.map((step, index) => ({
                ...step,
                step_number: index + 1
            }));
            refreshView();
        });
    });

    // Handle channel type changes
    document.querySelectorAll('.step-channel-select').forEach(select => {
        select.addEventListener('change', () => {
            const idx = parseInt(select.getAttribute('data-idx'));
            const type = select.value;
            if (sequenceSteps[idx]) {
                sequenceSteps[idx].step_type = type;
                if (type !== 'email') {
                    sequenceSteps[idx].subject_line = 'N/A'; // Subject not needed for WhatsApp/SMS/calls
                } else if (sequenceSteps[idx].subject_line === 'N/A') {
                    sequenceSteps[idx].subject_line = '';
                }
                refreshView();
            }
        });
    });

    // Handle builder inputs synchronization on local changes before save
    document.querySelectorAll('.step-subject-input').forEach(input => {
        input.addEventListener('input', () => {
            const idx = parseInt(input.getAttribute('data-idx'));
            if (sequenceSteps[idx]) {
                sequenceSteps[idx].subject_line = input.value;
            }
        });
    });

    document.querySelectorAll('.step-body-textarea').forEach(textarea => {
        textarea.addEventListener('input', () => {
            const idx = parseInt(textarea.getAttribute('data-idx'));
            if (sequenceSteps[idx]) {
                sequenceSteps[idx].body_template = textarea.value;
            }
        });
    });

    document.querySelectorAll('.step-delay-input').forEach(input => {
        input.addEventListener('change', () => {
            const idx = parseInt(input.getAttribute('data-idx'));
            if (sequenceSteps[idx]) {
                sequenceSteps[idx].delay_days = parseInt(input.value) || 0;
            }
        });
    });

    // Save Action
    const saveDraftBtn = document.getElementById('builderSaveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', async () => {
            await performSaveAction('draft');
        });
    }

    const activateBtn = document.getElementById('builderActivateBtn');
    if (activateBtn) {
        activateBtn.addEventListener('click', async () => {
            await performSaveAction('active');
        });
    }
}

async function performSaveAction(targetStatus) {
    const nameInput = document.getElementById('builderSequenceName');
    const descInput = document.getElementById('builderSequenceDesc');
    const name = nameInput ? nameInput.value.trim() : '';
    const desc = descInput ? descInput.value.trim() : '';

    if (!name) {
        alert("Please enter a sequence campaign name.");
        return;
    }

    if (sequenceSteps.length === 0) {
        alert("Please create at least one step in the campaign sequence.");
        return;
    }

    // Verify all steps have content
    const invalid = sequenceSteps.find(s => !s.body_template.trim() || !s.subject_line.trim());
    if (invalid) {
        alert(`Step ${invalid.step_number} has an empty subject line or message content. Please fill it out.`);
        return;
    }

    try {
        let seq = currentSequence;
        if (!seq) {
            // Create sequence details
            seq = await SequencesApi.createSequence(name, desc);
        } else {
            // Update sequence info
            seq = await SequencesApi.updateSequence(seq.id, { name, description: desc, status: targetStatus });
        }

        // Save steps manifest details
        await SequencesApi.saveSequenceSteps(seq.id, sequenceSteps);
        
        // Finalize state
        await SequencesApi.updateSequence(seq.id, { status: targetStatus });

        alert(targetStatus === 'active' ? "🚀 Sequence campaign activated successfully!" : "✨ Sequence campaign saved draft.");
        
        // Refresh and load dashboard
        await loadCampaignData();
        activeView = 'list';
        currentSequence = null;
        sequenceSteps = [];
        refreshView();
    } catch (err) {
        console.error("Save action failed:", err);
        alert(`Failed to save sequence: ${err.message}`);
    }
}

async function loadCampaignData() {
    try {
        window._cachedSequences = await SequencesApi.getSequences();
        analyticsData = await SequencesApi.getSequenceAnalytics();
        channelAccounts = await OrchestratorApi.getChannelAccounts();
        channelPerformances = await OrchestratorApi.getChannelPerformance();
    } catch (e) {
        console.warn("Failed to retrieve sequences logs", e);
        window._cachedSequences = [];
    }
}

function renderSequenceDiagnostics() {
    const subtabsHTML = `
        <div style="display: flex; gap: 20px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 0px; margin-bottom: 20px; align-items: center;">
            <button onclick="activeView = 'list'; refreshSequencesView();" style="background: none; border: none; font-size: 12.5px; font-weight: 700; color: ${activeView === 'list' ? '#2563eb' : '#475569'}; padding: 0 0 10px 0; border-bottom: 2px solid ${activeView === 'list' ? '#2563eb' : 'transparent'}; cursor: pointer; transition: all 0.2s; font-family: var(--font-heading);">
                All Sequences
            </button>
            <button onclick="activeView = 'analytics'; refreshSequencesView();" style="background: none; border: none; font-size: 12.5px; font-weight: 700; color: ${activeView === 'analytics' ? '#2563eb' : '#475569'}; padding: 0 0 10px 0; border-bottom: 2px solid ${activeView === 'analytics' ? '#2563eb' : 'transparent'}; cursor: pointer; transition: all 0.2s; font-family: var(--font-heading);">
                Analytics
            </button>
            <button onclick="activeView = 'diagnostics'; refreshSequencesView();" style="background: none; border: none; font-size: 12.5px; font-weight: 700; color: ${activeView === 'diagnostics' ? '#2563eb' : '#475569'}; padding: 0 0 10px 0; border-bottom: 2px solid ${activeView === 'diagnostics' ? '#2563eb' : 'transparent'}; cursor: pointer; transition: all 0.2s; font-family: var(--font-heading);">
                Diagnostics
            </button>
        </div>
    `;

    return `
        <div style="max-width: 1200px; display: flex; flex-direction: column; gap: 20px; color: #0f172a; padding-bottom: 40px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 800; font-family: var(--font-heading); color: #0f172a;">
                        Sequences
                    </h3>
                    <p style="margin: 0; font-size: 12.5px; color: #475569;">Set up automated cross-channel drip sequences, schedule follow-ups, and monitor open/reply metrics.</p>
                </div>
            </div>

            ${subtabsHTML}

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                <h3 style="margin: 0 0 8px 0; font-size: 15px; font-family: var(--font-heading); font-weight: 800; color: #0f172a;">Domain Health Scan & Diagnostics</h3>
                <p style="margin: 0 0 20px 0; font-size: 12px; color: #475569; line-height:1.5;">Check authentication tags status, tracking domains setup, and DMARC enforcement level configurations across connected inboxes.</p>
                
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-size:13.5px; font-weight:700; color:#0f172a;">cloudripple.org</div>
                            <div style="font-size:11.5px; color:#475569; margin-top:4px;">Mailboxes connected: 2 • Tracking Domain: Active</div>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <span style="font-size:11px; background:#ecfdf5; border:1px solid #a7f3d0; color:#059669; font-weight:700; padding:2px 6px; border-radius:4px; font-family:var(--font-mono);">SPF: PASS</span>
                            <span style="font-size:11px; background:#ecfdf5; border:1px solid #a7f3d0; color:#059669; font-weight:700; padding:2px 6px; border-radius:4px; font-family:var(--font-mono);">DKIM: PASS</span>
                            <span style="font-size:11px; background:#ecfdf5; border:1px solid #a7f3d0; color:#059669; font-weight:700; padding:2px 6px; border-radius:4px; font-family:var(--font-mono);">DMARC: PASS</span>
                        </div>
                    </div>
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-size:13.5px; font-weight:700; color:#0f172a;">apollo.io</div>
                            <div style="font-size:11.5px; color:#475569; margin-top:4px;">Mailboxes connected: 3 • Tracking Domain: Needs Setup</div>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <span style="font-size:11px; background:#ecfdf5; border:1px solid #a7f3d0; color:#059669; font-weight:700; padding:2px 6px; border-radius:4px; font-family:var(--font-mono);">SPF: PASS</span>
                            <span style="font-size:11px; background:#ecfdf5; border:1px solid #a7f3d0; color:#059669; font-weight:700; padding:2px 6px; border-radius:4px; font-family:var(--font-mono);">DKIM: PASS</span>
                            <span style="font-size:11px; background:#fff7ed; border:1px solid #fed7aa; color:#c2410c; font-weight:700; padding:2px 6px; border-radius:4px; font-family:var(--font-mono);">DMARC: WARNING</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function refreshView() {
    const content = document.getElementById('dashboardContent');
    if (content) {
        content.innerHTML = renderEmailSequences();
        bindEmailSequencesEvents();
        if (window.refreshLucideIcons) window.refreshLucideIcons();
    }
}
window.refreshSequencesView = refreshView;

// Initial fetch on mount
(async () => {
    await loadCampaignData();
})();
