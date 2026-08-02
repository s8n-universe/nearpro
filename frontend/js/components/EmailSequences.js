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

    const cardsHTML = list.length === 0 ? `
        <div style="grid-column: 1 / -1; padding: 60px 24px; text-align: center; border: 1px dashed rgba(255,255,255,0.08); border-radius: var(--radius-lg); background: #111115;">
            <div style="font-size: 48px; margin-bottom: 20px; animation: bounce 2s infinite;">✉️</div>
            <h3 style="color: white; font-family: var(--font-heading); font-size: 18px; margin-bottom: 8px;">Create Your First Multi-Channel Sequence</h3>
            <p style="color: var(--text-muted); font-size: 13.5px; max-width: 440px; margin: 0 auto 24px auto; line-height: 1.5;">
                Engage prospects via Email, WhatsApp messages, LinkedIn connection tasks, and manual twilio scripts automatically.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button class="brand-btn" id="adminCreateSeqScratch" style="background: #2563eb; color: white;">Start From Scratch</button>
            </div>
        </div>
    ` : list.map(seq => {
        const isLive = seq.status === 'active';
        const openRate = seq.open_rate || 0;
        const replyRate = seq.reply_rate || 0;

        return `
            <div class="sequence-card-item" data-id="${seq.id}" style="background: #111115; border: 1px solid #222227; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease;">
                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <span style="font-size: 10px; background: ${isLive ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)'}; border: 1px solid ${isLive ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)'}; color: ${isLive ? '#22c55e' : '#a1a1aa'}; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
                            ${seq.status}
                        </span>
                        <span style="font-size: 12px; color: #a1a1aa; font-family: var(--font-mono, monospace); font-weight: 600;">
                            ${seq.total_steps} steps
                        </span>
                    </div>

                    <h4 style="margin: 0 0 6px 0; color: white; font-family: var(--font-heading); font-size: 16px; font-weight: 800;">${seq.name}</h4>
                    <p style="margin: 0 0 16px 0; color: #a1a1aa; font-size: 12.5px; line-height: 1.4;">${seq.description || 'No description provided.'}</p>
                </div>

                <div style="border-top: 1px solid #222227; padding-top: 16px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #a1a1aa; margin-bottom: 8px; font-weight: 600;">
                        <span>Enrolled: ${seq.total_enrolled}</span>
                        <span>Replies: ${seq.total_replied}</span>
                    </div>

                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 16px;">
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                            <span style="font-size: 10px; color: #a1a1aa;">Response Index</span>
                            <div style="height: 6px; background: #222227; border-radius: 10px; overflow: hidden; position: relative;">
                                <div style="width: ${openRate}%; height: 100%; background: var(--accent-gold); border-radius: 10px;"></div>
                            </div>
                        </div>
                        <div style="font-family: var(--font-mono, monospace); font-size: 11px; font-weight: 800; color: white; margin-top: 12px;">${openRate}%</div>
                    </div>

                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button class="brand-btn seq-action-btn edit" data-id="${seq.id}" style="padding: 6px 12px; font-size: 12px; font-weight: 700; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: white;">Edit</button>
                        <button class="brand-btn seq-action-btn enroll" data-id="${seq.id}" style="padding: 6px 12px; font-size: 12px; font-weight: 700; background: #2563eb; color: white; border: none;">Enroll Leads</button>
                        <button class="brand-btn seq-action-btn analytics" data-id="${seq.id}" style="padding: 6px 12px; font-size: 12px; font-weight: 700; background: rgba(255,160,0,0.1); border: 1px solid rgba(255,160,0,0.25); color: var(--accent-gold);">Stats</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div style="max-width: 1200px; display: flex; flex-direction: column; gap: 24px; color: white; padding-bottom: 40px;">
            
            <!-- Dashboard Stats Overview Banner -->
            <div style="background: linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(236,72,153,0.02) 100%); border: 1px solid #222227; border-radius: 12px; padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <h3 style="margin: 0; font-size: 20px; font-weight: 800; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px;">
                        <span>✉️ Multi-Channel Outreach Dashboard</span>
                        <span style="font-size: 10px; background: rgba(37,99,235,0.15); border: 1px solid rgba(37,99,235,0.3); color: #3b82f6; font-weight: 800; padding: 2px 8px; border-radius: 50px; text-transform: uppercase; font-family: var(--font-mono);">Scout Gated</span>
                    </h3>
                    <p style="margin: 0; font-size: 13.5px; color: #a1a1aa;">Set up automated cross-channel drip sequences, schedule follow-ups, and monitor deliverability rates.</p>
                </div>
                <button class="brand-btn" id="dashboardNewSeqBtn" style="background: #2563eb; color: white; font-weight: 800; padding: 10px 20px;">
                    + New Sequence
                </button>
            </div>

            <!-- Dashboard Analytics Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
                <div style="background: #111115; border: 1px solid #222227; border-radius: 8px; padding: 16px; text-align: center;">
                    <div style="font-size: 11px; color: #a1a1aa; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Total Sequences</div>
                    <div style="font-size: 24px; font-weight: 800; font-family: var(--font-mono); color: white;">${stats.total_sequences}</div>
                </div>
                <div style="background: #111115; border: 1px solid #222227; border-radius: 8px; padding: 16px; text-align: center;">
                    <div style="font-size: 11px; color: #a1a1aa; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Active Campaigns</div>
                    <div style="font-size: 24px; font-weight: 800; font-family: var(--font-mono); color: #22c55e;">${stats.active_sequences}</div>
                </div>
                <div style="background: #111115; border: 1px solid #222227; border-radius: 8px; padding: 16px; text-align: center;">
                    <div style="font-size: 11px; color: #a1a1aa; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Enrolled Leads</div>
                    <div style="font-size: 24px; font-weight: 800; font-family: var(--font-mono); color: white;">${stats.total_enrolled}</div>
                </div>
                <div style="background: #111115; border: 1px solid #222227; border-radius: 8px; padding: 16px; text-align: center;">
                    <div style="font-size: 11px; color: #a1a1aa; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Average Open Rate</div>
                    <div style="font-size: 24px; font-weight: 800; font-family: var(--font-mono); color: var(--accent-gold);">${Math.round(stats.avg_open_rate)}%</div>
                </div>
                <div style="background: #111115; border: 1px solid #222227; border-radius: 8px; padding: 16px; text-align: center;">
                    <div style="font-size: 11px; color: #a1a1aa; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Average Reply Rate</div>
                    <div style="font-size: 24px; font-weight: 800; font-family: var(--font-mono); color: #ec4899;">${Math.round(stats.avg_reply_rate)}%</div>
                </div>
            </div>

            <!-- Sequences List Grid -->
            <div>
                <h3 style="margin: 0 0 16px 0; font-size: 17px; font-family: var(--font-heading); font-weight: 800;">My Sequences</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                    ${cardsHTML}
                </div>
            </div>

        </div>

        <!-- Enrollment Modal overlay -->
        <div id="enrollmentModalOverlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10000; align-items: center; justify-content: center; padding: 24px;">
            <div style="background: #111115; border: 1px solid #222227; border-radius: 12px; max-width: 500px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                <div style="padding: 20px; border-bottom: 1px solid #222227; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin:0; font-size: 16px; font-weight:800; font-family:var(--font-heading);">Enroll Leads in Sequence</h3>
                    <button class="brand-btn" id="closeEnrollmentModal" style="background:none; border:none; padding:4px; font-size:18px; line-height:1; color:#a1a1aa; cursor:pointer;">×</button>
                </div>
                
                <div style="padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px;">
                    <div>
                        <label style="display: block; font-size: 12.5px; font-weight:700; color:#a1a1aa; margin-bottom: 6px;">Select Lead Source List</label>
                        <select id="enrollLeadListSelect" style="width:100%; padding: 10px 14px; background:#09090b; border:1px solid #222227; border-radius:6px; color:white; font-size:13.5px; outline:none;">
                            <option value="">-- Choose List --</option>
                            ${leadLists.map(l => `<option value="${l.id}">${l.name} (${l.total_leads || 0} leads)</option>`).join('')}
                        </select>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="display: block; font-size: 12.5px; font-weight:700; color:#a1a1aa;">Leads Checklist</label>
                        <div id="enrollLeadsListWrapper" style="border: 1px solid #222227; border-radius: 6px; padding: 10px; max-height: 200px; overflow-y: auto; background:#09090b; display:flex; flex-direction:column; gap:8px;">
                            <div style="color:#a1a1aa; font-size:12.5px; text-align:center; padding:12px;">Choose a source list first...</div>
                        </div>
                    </div>
                </div>

                <div style="padding: 20px; border-top: 1px solid #222227; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="brand-btn" id="cancelEnrollBtn" style="padding: 8px 16px; font-size:12.5px; background:rgba(255,255,255,0.06); color:white; border: 1px solid rgba(255,255,255,0.08);">Cancel</button>
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
        <div style="text-align: center; padding: 32px 16px; border: 1.5px dashed rgba(255,255,255,0.06); border-radius: 8px; background: rgba(0,0,0,0.1); margin-bottom: 20px;">
            <p style="color: #a1a1aa; font-size: 13px; margin-bottom: 12px;">No campaign steps created. Add your first step to define the drip outreach.</p>
            <button class="brand-btn" id="builderAddFirstStepBtn" style="background: rgba(255,160,0,0.1); border: 1px solid rgba(255,160,0,0.25); color: var(--accent-gold); font-size: 12.5px; font-weight: 700; padding: 8px 16px;">
                + Add Step 1 (Email)
            </button>
        </div>
    ` : sequenceSteps.map((step, idx) => {
        const type = step.step_type || 'email';
        const accentColor = type === 'whatsapp' ? '#22c55e' : type === 'phone' ? '#a855f7' : type === 'linkedin' ? '#f97316' : '#2563eb';

        return `
            <div class="builder-step-node" data-idx="${idx}" style="background: #111115; border: 1.5px solid ${accentColor}; border-radius: 8px; padding: 20px; position: relative; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: border-color 0.3s ease;">
                
                <!-- Remove Step button -->
                <button class="builder-remove-step-btn" data-idx="${idx}" style="position: absolute; top: 12px; right: 12px; background: none; border: none; font-size: 16px; color: #a1a1aa; cursor: pointer;">×</button>

                <!-- Step Header Node -->
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 16px;">
                    <span style="font-family: var(--font-mono, monospace); font-size: 11px; background: ${accentColor}; color: #fff; font-weight: 800; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        ${idx + 1}
                    </span>
                    <h4 style="margin: 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                        Step ${idx + 1}: ${idx === 0 ? 'First Touch' : 'Follow Up'}
                    </h4>
                </div>

                <!-- Step Body Inputs -->
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    
                    <!-- Channel Selector -->
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 700; color: #a1a1aa; margin-bottom: 4px;">Outreach Channel Type</label>
                        <select class="step-channel-select" data-idx="${idx}" style="width: 100%; padding: 8px 12px; background: #09090b; border: 1.5px solid #222227; border-radius: 6px; color: white; font-size: 13px; outline: none; font-weight:600;">
                            <option value="email" ${type === 'email' ? 'selected' : ''}>📧 SMTP Email Message</option>
                            <option value="whatsapp" ${type === 'whatsapp' ? 'selected' : ''}>💬 WhatsApp Template Message</option>
                            <option value="phone" ${type === 'phone' ? 'selected' : ''}>📞 Manual Phone Call (Script reminder task)</option>
                            <option value="linkedin" ${type === 'linkedin' ? 'selected' : ''}>🔗 LinkedIn Connection Request (Task)</option>
                        </select>
                    </div>

                    ${type === 'email' ? `
                        <div>
                            <label style="display: block; font-size: 12px; font-weight: 700; color: #a1a1aa; margin-bottom: 4px;">Email Subject Line</label>
                            <input type="text" class="step-subject-input" data-idx="${idx}" value="${step.subject_line || ''}" placeholder="e.g. Hey {{name}}, noticed your page is loading slowly..." style="width: 100%; padding: 10px; background: #09090b; border: 1.5px solid #222227; border-radius: 6px; color: white; font-size: 13px; outline: none;" />
                        </div>
                    ` : ''}
                    
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <label style="display: block; font-size: 12px; font-weight: 700; color: #a1a1aa;">Message Content Template</label>
                            <span style="font-size: 11px; color: var(--accent-gold); font-weight: 700;">Tip: Type {{ to insert dynamic placeholders</span>
                        </div>
                        <textarea class="step-body-textarea" data-idx="${idx}" placeholder="Write your template. Use {{name}}, {{area}}, {{category}}, {{website}}, or {{rating}} variables." style="width: 100%; height: 120px; padding: 12px; background: #09090b; border: 1.5px solid #222227; border-radius: 6px; color: white; font-size: 13px; font-family: inherit; line-height: 1.5; resize: vertical; outline: none;">${step.body_template || ''}</textarea>
                    </div>

                    <!-- Wait/Delay Options -->
                    ${idx > 0 ? `
                        <div style="display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.15); padding: 10px 14px; border-radius: 6px; border: 1px solid #222227; margin-top: 4px;">
                            <span style="font-size: 12px; font-weight: 700; color: #a1a1aa;">⏱ Delay sending step:</span>
                            <input type="number" class="step-delay-input" data-idx="${idx}" value="${step.delay_days || 3}" min="1" max="30" style="width: 50px; padding: 6px; background:#09090b; border:1px solid #222227; border-radius:4px; color:white; font-size:12.5px; font-weight:700; text-align:center;" />
                            <span style="font-size: 12.5px; color:#a1a1aa; font-weight:600;">days after previous step.</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Inter-node Connector Line -->
                ${idx < sequenceSteps.length - 1 ? `
                    <div style="width: 2px; height: 24px; background: #222227; margin: 12px auto -36px auto; position: relative; z-index: 1;"></div>
                ` : ''}
            </div>
        `;
    }).join('');

    return `
        <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; color: white; padding-bottom: 40px;">
            
            <!-- Builder Nav Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222227; padding-bottom: 16px;">
                <button class="brand-btn" id="builderBackToDashboard" style="padding: 6px 14px; font-size: 12.5px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: white; font-weight: 700;">
                    ← Back to Dashboard
                </button>
                <div style="display: flex; gap: 10px;">
                    <button class="brand-btn" id="builderSaveDraftBtn" style="padding: 8px 16px; font-size: 13px; font-weight: 700; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: white;">
                        Save Draft
                    </button>
                    <button class="brand-btn" id="builderActivateBtn" style="padding: 8px 16px; font-size: 13px; font-weight: 800; background: #2563eb; color: white; border: none;">
                        Launch Campaign 🚀
                    </button>
                </div>
            </div>

            <!-- Sequence settings inputs -->
            <div style="background: #111115; border: 1px solid #222227; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 16px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 800; font-family: var(--font-heading);">
                    ${isNew ? 'New Multi-Channel Blueprint' : 'Modify Campaign Blueprint'}
                </h3>
                
                <div>
                    <label style="display: block; font-size: 12.5px; font-weight: 700; color: #a1a1aa; margin-bottom: 6px;">Sequence Name</label>
                    <input type="text" id="builderSequenceName" value="${name}" placeholder="e.g. Cold Restaurant Outbound (Juhu)" style="width: 100%; padding: 10px 14px; background: #09090b; border: 1.5px solid #222227; border-radius: 6px; color: white; font-size: 13.5px; outline: none; font-weight: 600;" />
                </div>
                
                <div>
                    <label style="display: block; font-size: 12.5px; font-weight: 700; color: #a1a1aa; margin-bottom: 6px;">Campaign Description</label>
                    <textarea id="builderSequenceDesc" placeholder="Describe the goal of this automated sequence..." style="width: 100%; height: 80px; padding: 10px 14px; background: #09090b; border: 1.5px solid #222227; border-radius: 6px; color: white; font-size: 13.5px; font-family: inherit; line-height: 1.4; resize: none; outline: none;">${desc}</textarea>
                </div>
            </div>

            <!-- Steps Editor Container -->
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="margin: 0; font-size: 16px; font-family: var(--font-heading); font-weight: 800;">Campaign Sequence Steps</h3>
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
            <div style="background: #09090b; border: 1px solid #222227; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:20px;">${perf.channel_type === 'whatsapp' ? '💬' : '📧'}</span>
                    <div>
                        <div style="font-size:13.5px; font-weight:700; color:white; text-transform:uppercase;">${perf.channel_type} Channel</div>
                        <div style="font-size:11px; color:#a1a1aa; margin-top:2px;">Sent: ${perf.total_sent} • Delivered: ${perf.total_delivered}</div>
                    </div>
                </div>
                
                <div style="text-align:right;">
                    <div style="font-family:var(--font-mono); font-size:14.5px; font-weight:800; color:${color};">${rate}% Reply Rate</div>
                    <div style="font-size:11px; color:#a1a1aa; margin-top:2px;">Avg Response: ${perf.avg_response_time_h}h</div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div style="max-width: 1000px; display: flex; flex-direction: column; gap: 24px; color: white; padding-bottom: 40px;">
            
            <!-- Analytics Nav Header -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <button class="brand-btn" id="analyticsBackToDashboard" style="padding: 6px 14px; font-size: 12.5px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: white; font-weight: 700;">
                    ← Back to Dashboard
                </button>
                <div style="font-size: 13.5px; color: #a1a1aa; font-weight: 500;">
                    Inspecting: <strong style="color: white;">${seq.name}</strong>
                </div>
            </div>

            <!-- Performance Numbers Overview Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div style="background: #111115; border: 1px solid #222227; border-radius: 8px; padding: 20px; text-align: center;">
                    <div style="font-size: 11px; color: #a1a1aa; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Total Enrolled</div>
                    <div style="font-size: 26px; font-weight: 800; font-family: var(--font-mono); color: white;">${seq.total_enrolled}</div>
                </div>
                <div style="background: #111115; border: 1px solid #222227; border-radius: 8px; padding: 20px; text-align: center;">
                    <div style="font-size: 11px; color: #a1a1aa; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Replies Received</div>
                    <div style="font-size: 26px; font-weight: 800; font-family: var(--font-mono); color: #22c55e;">${seq.total_replied}</div>
                </div>
                <div style="background: #111115; border: 1px solid #222227; border-radius: 8px; padding: 20px; text-align: center;">
                    <div style="font-size: 11px; color: #a1a1aa; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Replies Rate</div>
                    <div style="font-size: 26px; font-weight: 800; font-family: var(--font-mono); color: #ec4899;">${Math.round(replyRate)}%</div>
                </div>
                <div style="background: #111115; border: 1px solid #222227; border-radius: 8px; padding: 20px; text-align: center;">
                    <div style="font-size: 11px; color: #a1a1aa; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Bounces Detected</div>
                    <div style="font-size: 26px; font-weight: 800; font-family: var(--font-mono); color: #ef4444;">${seq.total_bounced}</div>
                </div>
            </div>

            <!-- Conversion Funnel & Channel comparison -->
            <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; align-items: start;">
                
                <!-- Left: Funnel details -->
                <div style="background: #111115; border: 1px solid #222227; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                    <h4 style="margin: 0 0 16px 0; font-size: 16px; color: white; font-family: var(--font-heading); font-weight: 800; border-bottom: 1px solid #222227; padding-bottom: 12px;">
                        📈 Campaign Conversion Funnel
                    </h4>
                    
                    <div style="display: flex; flex-direction: column; gap: 16px; padding: 10px 0;">
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #a1a1aa; margin-bottom: 6px; font-weight: 600;">
                                <span>Step 1: First Touch Pitch</span>
                                <span>${seq.total_enrolled} sent (100%)</span>
                            </div>
                            <div style="height: 24px; background: #09090b; border: 1px solid #222227; border-radius: 6px; overflow: hidden; position: relative;">
                                <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%); display: flex; align-items: center; padding-left: 12px; font-size: 11px; font-weight: 700; color: white;">ENROLLED PITCH</div>
                            </div>
                        </div>

                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #a1a1aa; margin-bottom: 6px; font-weight: 600;">
                                <span>Replies Log</span>
                                <span>${seq.total_replied} replies (${Math.round(replyRate)}%)</span>
                            </div>
                            <div style="height: 24px; background: #09090b; border: 1px solid #222227; border-radius: 6px; overflow: hidden; position: relative;">
                                <div style="width: ${replyRate}%; height: 100%; background: linear-gradient(90deg, #ec4899 0%, #be185d 100%); display: flex; align-items: center; padding-left: 12px; font-size: 11px; font-weight: 700; color: white;">REPLIES RESPONSE</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Channel comparisons -->
                <div style="background: #111115; border: 1px solid #222227; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                    <h4 style="margin: 0 0 16px 0; font-size: 16px; color: white; font-family: var(--font-heading); font-weight: 800; border-bottom: 1px solid #222227; padding-bottom: 12px;">
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
                            <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:13px; color:white; padding: 4px 0;">
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

function refreshView() {
    const content = document.getElementById('dashboardContent');
    if (content) {
        content.innerHTML = renderEmailSequences();
        bindEmailSequencesEvents();
        if (window.refreshLucideIcons) window.refreshLucideIcons();
    }
}

// Initial fetch on mount
(async () => {
    await loadCampaignData();
})();
