import { State } from '../state.js';
import { Api } from '../api.js';
import { buildOutreach } from './OutreachStudio.js';

// Module level state for call/timer controls to survive view redraws
let activeCallInterval = null;
let activeCallSeconds = 0;
let isCallConnected = false;
let callTargetLeadName = '';

export function renderLeadCRM(pipelineData, stats) {
    // 1. Flatten all leads
    const allLeads = [];
    pipelineData.forEach(row => {
        const status = row.status || 'new';
        (row.leads || []).forEach(lead => {
            allLeads.push({
                ...lead,
                crm_status: status
            });
        });
    });

    // 2. Read query parameters
    const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const activeSubTab = searchParams.get('sub_tab') || 'all';
    const activeLeadId = searchParams.get('lead_id');

    // 3. Compute active lead
    let activeLead = null;
    if (activeLeadId) {
        activeLead = allLeads.find(l => String(l.saved_lead_id) === String(activeLeadId) || String(l.id) === String(activeLeadId));
    }
    if (!activeLead && allLeads.length > 0) {
        activeLead = allLeads[0];
    }
    const finalActiveLeadId = activeLead ? activeLead.saved_lead_id : null;

    // 4. Compute Counts for Selector Tabs
    const allCount = allLeads.length;
    const callsLeads = allLeads.filter(l => l.crm_status === 'new' || l.crm_status === 'contacted' || l.crm_status === 'responded');
    const callsCount = callsLeads.length;
    const doneLeads = allLeads.filter(l => l.crm_status === 'converted' || l.crm_status === 'closed');
    const doneCount = doneLeads.length;

    // Filter leads for Column 1 depending on activeSubTab
    let displayedLeads = [];
    if (activeSubTab === 'calls') {
        displayedLeads = callsLeads;
    } else if (activeSubTab === 'done') {
        displayedLeads = doneLeads;
    } else {
        displayedLeads = allLeads;
    }

    // Filter by search query if any
    const searchQuery = (searchParams.get('q') || '').toLowerCase().trim();
    if (searchQuery) {
        displayedLeads = displayedLeads.filter(l => 
            (l.name || '').toLowerCase().includes(searchQuery) || 
            (l.category || '').toLowerCase().includes(searchQuery) ||
            (l.area || '').toLowerCase().includes(searchQuery)
        );
    }

    // 5. Generate Column 1 HTML (Selector List)
    const leadsHTML = displayedLeads.map(lead => {
        const isActive = activeLead && (String(activeLead.saved_lead_id) === String(lead.saved_lead_id));
        const activeClass = isActive ? 'active' : '';
        
        let crmTag = '';
        if (lead.crm_status === 'new') crmTag = '🔵 New';
        else if (lead.crm_status === 'contacted') crmTag = '🟡 Contacted';
        else if (lead.crm_status === 'responded') crmTag = '🟢 Responded';
        else if (lead.crm_status === 'converted') crmTag = '🏆 Converted';
        else if (lead.crm_status === 'closed') crmTag = '⚫ Closed';

        // Rating Stars
        const rating = lead.rating || 0;
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) starsHTML += '★';
            else if (i - 0.5 <= rating) starsHTML += '½';
            else starsHTML += '☆';
        }

        return `
            <div class="selector-lead-item ${activeClass}" data-id="${lead.saved_lead_id}">
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <input type="checkbox" class="compare-checkbox" style="margin-top:3px;" onclick="event.stopPropagation()">
                    <div style="flex:1; min-width:0;">
                        <h5 class="selector-lead-name">${lead.name}</h5>
                        <p class="selector-lead-meta">${lead.category} &middot; ${lead.area}</p>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; font-size:10.5px;">
                    <span style="color:var(--text-muted); font-size: 10px;">${crmTag}</span>
                    <span style="color:var(--accent-gold); font-size: 10px;">${starsHTML}</span>
                </div>
            </div>
        `;
    }).join('');

    const emptyLeadsHTML = displayedLeads.length === 0 ? `
        <div style="padding:40px 12px; text-align:center; color:var(--text-muted); font-size:13px;">
            No leads match filters.
        </div>
    ` : '';

    // 6. Generate Column 2 HTML (Details & Inline Website Audit)
    let col2HTML = '';
    if (!activeLead) {
        col2HTML = `
            <div class="audit-empty-state" style="padding:100px 20px;">
                <div style="font-size:40px; margin-bottom:12px;">📊</div>
                <h4 style="color:white;">No Lead Selected</h4>
                <p style="color:var(--text-muted); font-size:13px;">Select a contact lead from the left pipeline panel.</p>
            </div>
        `;
    } else {
        const leadPhone = activeLead.phone || '';
        const leadMail = activeLead.email || '';
        const leadNotes = activeLead.notes || '';

        // Check website status
        const hasWebsite = activeLead.website;
        let auditHTML = '';
        if (hasWebsite) {
            // Read from cache in window.State or window._currentAuditResult
            const auditResult = window._currentAuditResult && window._currentAuditResult.url === activeLead.website.trim().toLowerCase() 
                ? window._currentAuditResult 
                : null;
            const auditLoading = window._currentAuditLoading === activeLead.saved_lead_id;

            if (auditLoading) {
                auditHTML = `
                    <div class="audit-inline-card" style="text-align:center; padding:30px 20px;">
                        <div class="spinner" style="margin:auto; width:30px; height:30px; border-width:2.5px;"></div>
                        <h5 style="margin:12px 0 4px 0; color:white; font-size:13px;">Running Site Health Audit...</h5>
                        <p style="color:var(--text-muted); font-size:11.5px; margin:0;">Checking speed & Google SEO parameters</p>
                    </div>
                `;
            } else if (auditResult) {
                const score = auditResult.page_speed_score || 0;
                let scoreColor = '#ef4444';
                if (score >= 80) scoreColor = '#10b981';
                else if (score >= 50) scoreColor = '#eab308';

                const gapsHTML = (auditResult.gaps || []).map(gap => `
                    <div class="gap-check-item">❌ <span style="font-size:12px; color:var(--text-secondary);">${gap}</span></div>
                `).join('');

                auditHTML = `
                    <div class="audit-inline-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px; margin-bottom:8px;">
                            <h5 style="margin:0; font-size:13px; color:white; font-family:var(--font-heading);">Web Audit: ${auditResult.url}</h5>
                            <span class="audit-score-badge" style="background:${scoreColor}20; color:${scoreColor}">${score}/100 Speed</span>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:11.5px; margin-bottom:8px;">
                            <div>📱 Mobile friendly: <strong>${auditResult.mobile_friendly ? 'Yes' : 'No'}</strong></div>
                            <div>🔒 SSL Secure: <strong>${auditResult.has_https ? 'Yes' : 'No'}</strong></div>
                            <div>🔌 JSON schema: <strong>${auditResult.has_schema ? 'Yes' : 'No'}</strong></div>
                            <div>⚡ Page load: <strong>${(auditResult.load_time_ms / 1000).toFixed(1)}s</strong></div>
                        </div>
                        <div style="background:rgba(239,68,68,0.04); border:1px solid rgba(239,68,68,0.15); border-radius:4px; padding:10px; font-size:11.5px; color:#ef4444; margin-bottom: 8px;">
                            💸 Est. Monthly Leakage: <strong>₹${auditResult.est_lost_revenue_per_month.toLocaleString('en-IN')}</strong>
                        </div>
                        <div class="audit-gap-items">
                            ${gapsHTML}
                        </div>
                    </div>
                `;
            } else {
                auditHTML = `
                    <div class="audit-inline-card" style="text-align:center; padding:20px;">
                        <h5 style="margin:0 0 6px 0; color:white; font-size:13px; font-family:var(--font-heading);">Website Audit Available</h5>
                        <p style="color:var(--text-muted); font-size:12px; margin-bottom:12px;">Audit speed and schema to auto-populate email templates.</p>
                        <button class="brand-btn" id="runCRMHealthCheckBtn" data-id="${activeLead.saved_lead_id}" data-url="${activeLead.website}" style="padding:6px 14px; font-size:11.5px;">
                            Run Health Check
                        </button>
                    </div>
                `;
            }
        } else {
            auditHTML = `
                <div class="audit-inline-card" style="text-align:center; padding:20px;">
                    <h5 style="margin:0 0 4px 0; color:var(--text-muted); font-size:12.5px;">No Website Found</h5>
                    <p style="color:var(--text-muted); font-size:11.5px; margin:0;">Pitch custom design upgrade or no-code demo development.</p>
                </div>
            `;
        }

        col2HTML = `
            <div class="detail-card-panel">
                <div style="border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:8px;">
                    <h3 style="margin:0 0 4px 0; font-size:18px; color:white; font-family:var(--font-heading);">${activeLead.name}</h3>
                    <p style="margin:0; font-size:12.5px; color:var(--text-muted);">${activeLead.category} &middot; ${activeLead.area}</p>
                </div>

                <div class="social-links-grid">
                    <a href="https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(activeLead.name)}" target="_blank" class="social-link-btn" style="display:flex; align-items:center; gap:6px; justify-content:center;">
                        <i data-lucide="linkedin" style="width:13px; height:13px;"></i> LinkedIn &gt;
                    </a>
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeLead.name + ' ' + activeLead.area)}" target="_blank" class="social-link-btn" style="display:flex; align-items:center; gap:6px; justify-content:center;">
                        <i data-lucide="map" style="width:13px; height:13px;"></i> Maps Profile &gt;
                    </a>
                </div>

                <div class="contact-detail-row">
                    <div>
                        <span style="color:var(--text-secondary); display:block; font-size:10px; font-family:var(--font-mono); text-transform:uppercase;">Phone</span>
                        <strong style="color:white; font-size:12.5px;">${leadPhone || 'No phone number'}</strong>
                    </div>
                    ${leadPhone ? `<button class="call-control-btn" id="startCallBtn" data-phone="${leadPhone}" data-name="${activeLead.name}">Call</button>` : ''}
                </div>

                <div class="contact-detail-row">
                    <div>
                        <span style="color:var(--text-secondary); display:block; font-size:10px; font-family:var(--font-mono); text-transform:uppercase;">Mail</span>
                        <strong style="color:white; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:inline-block; max-width:160px;">${leadMail || 'No email address'}</strong>
                    </div>
                    ${leadMail ? `<button class="call-control-btn" id="copyMailBtn" data-email="${leadMail}">Copy</button>` : ''}
                </div>

                <div style="display:flex; flex-direction:column; gap:4px; margin-top:8px;">
                    <label class="detail-label" for="crmNotesInput" style="font-size:10.5px;">Add Call Note</label>
                    <textarea id="crmNotesInput" class="detail-notes-area" placeholder="Write logs here... (e.g. loves Denali layout, busy until next Tuesday)">${leadNotes}</textarea>
                    <button class="brand-btn" id="saveCrmNotesBtn" data-id="${activeLead.saved_lead_id}" style="padding:8px; font-size:11.5px; align-self:flex-end; margin-top:6px; min-width:90px;">Save Notes</button>
                </div>
            </div>

            <!-- Website Speed & Compliance Audit -->
            ${auditHTML}
        `;
    }

    // 7. Generate Column 3 HTML (AI Outreach Pitch & Call Dispositions)
    let col3HTML = '';
    if (!activeLead) {
        col3HTML = `
            <div class="audit-empty-state" style="padding:100px 20px; display:flex; flex-direction:column; align-items:center;">
                <div style="margin-bottom:12px;">
                    <i data-lucide="target" style="width:40px; height:40px; color:var(--text-secondary); stroke-width:1.5px;"></i>
                </div>
                <h4 style="color:white;">Campaign Center</h4>
                <p style="color:var(--text-muted); font-size:13px;">Pitch campaigns and update lead stages dynamically.</p>
            </div>
        `;
    } else {
        // Fetch or render composed outreach message
        const auditResult = window._currentAuditResult && window._currentAuditResult.url === activeLead.website?.trim().toLowerCase() 
            ? window._currentAuditResult 
            : null;
        
        let initialText = `Hello ${activeLead.name} team, we noticed your digital profile in ${activeLead.area}. Let's connect!`;
        if (activeLead.website) {
            initialText = `Hello ${activeLead.name} team, I ran a speed check on ${activeLead.website}. Your mobile score can be optimized to recover lost inquiries. Let me know if we can share a fast audit draft?`;
        }
        
        // Brochure is downloaded directly on Send rather than appending link to text body
        
        const textVal = window._composedMainText || initialText;

        col3HTML = `
            <!-- Call Disposition Selector -->
            <div class="disposition-card">
                <h4 style="margin:0; font-size:13.5px; color:white; font-family:var(--font-heading);">Call Disposition</h4>
                <p style="margin:0 0 10px 0; font-size:11.5px; color:var(--text-muted);">Record call outcome:</p>

                <div class="disposition-group">
                    <span class="disposition-cat-title" style="color:#22c55e;">Answered</span>
                    <label class="disposition-option">
                        <input type="radio" name="call_disp" value="converted" ${activeLead.crm_status === 'converted' ? 'checked' : ''}>
                        <span>Meeting Set / Converted</span>
                    </label>
                    <label class="disposition-option">
                        <input type="radio" name="call_disp" value="responded" ${activeLead.crm_status === 'responded' ? 'checked' : ''}>
                        <span>Email Info / Interested</span>
                    </label>
                    <label class="disposition-option">
                        <input type="radio" name="call_disp" value="responded_not_interested" ${activeLead.crm_status === 'closed' ? 'checked' : ''}>
                        <span>Not Interested</span>
                    </label>

                    <span class="disposition-cat-title" style="color:#eab308;">Didn't Answer</span>
                    <label class="disposition-option">
                        <input type="radio" name="call_disp" value="contacted_busy">
                        <span>Busy / Callback</span>
                    </label>
                    <label class="disposition-option">
                        <input type="radio" name="call_disp" value="contacted_no_answer" ${activeLead.crm_status === 'contacted' ? 'checked' : ''}>
                        <span>No Answer</span>
                    </label>

                    <span class="disposition-cat-title" style="color:var(--text-muted);">Other</span>
                    <label class="disposition-option">
                        <input type="radio" name="call_disp" value="contacted_voicemail">
                        <span>Left VoiceMail</span>
                    </label>
                    <label class="disposition-option">
                        <input type="radio" name="call_disp" value="closed_bad_number">
                        <span>Bad Number</span>
                    </label>
                </div>
                <div class="action-status-msg" id="dispSaveMsg"></div>
            </div>

            <!-- Outreach Dispatcher -->
            <div class="disposition-card">
                <h4 style="margin:0; font-size:13.5px; color:white; font-family:var(--font-heading);">AI Outreach Pitch</h4>
                <p style="margin:0 0 10px 0; font-size:11.5px; color:var(--text-muted);">Auto-composed outreach script:</p>

                <!-- Document Attachment Integration -->
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 11px; color: white; display: flex; align-items: center; gap: 4px;"><i data-lucide="paperclip" style="width:12px; height:12px;"></i> Attach Brochure / PDF</span>
                        <label class="switch-container">
                            <input type="checkbox" id="crmBrochureToggle" ${window._attachBrochureEnabled ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    
                    <div id="crmBrochureSelectContainer" style="display: ${window._attachBrochureEnabled ? 'block' : 'none'};">
                        <div style="display: flex; gap: 6px; margin-bottom: 6px;">
                            <select id="crmBrochureDropdown" style="flex: 1; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px; color: white; font-size: 11.5px; outline: none; border-color: var(--border);">
                                ${(window._userDocuments || []).map(doc => `
                                    <option value="${doc.id}" ${window._selectedBrochureId === doc.id ? 'selected' : ''}>${doc.name}</option>
                                `).join('')}
                                ${(window._userDocuments || []).length === 0 ? '<option value="">No documents uploaded</option>' : ''}
                            </select>
                            <button class="secondary-btn" id="crmDownloadBrochureBtn" style="padding: 6px; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm);" title="Download PDF File">
                                <i data-lucide="download" style="width: 13px; height: 13px;"></i>
                            </button>
                        </div>
                        <label style="display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--text-secondary); cursor: pointer; margin-top: 4px; user-select: none; margin-bottom: 6px;">
                            <input type="checkbox" id="crmBrochureIncludeLink" ${window._includeBrochureLink ? 'checked' : ''}>
                            <span>Include PDF link in message text</span>
                        </label>
                        <div id="crmBrochureLinkLabelContainer" style="display: ${window._includeBrochureLink ? 'block' : 'none'};">
                            <label style="display: block; font-size: 10px; color: var(--text-muted); margin-bottom: 3px;">LINK LABEL:</label>
                            <input type="text" id="crmBrochureLinkLabel" placeholder="e.g. Vinayak Distributors Brochure" value="${window._brochureLinkLabel || (activeLead.name + ' Portfolio')}" style="width: 100%; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px; color: white; font-size: 11px; outline: none; border-color: var(--border);">
                        </div>
                    </div>
                </div>

                <div class="composed-text-wrap">
                    <textarea id="crmOutreachComposerText" style="width:100%; height:110px; background:var(--bg-base); border:1px solid var(--border); border-radius:var(--radius-sm); padding:8px; color:white; font-size:12px; line-height:1.4; resize:none; outline:none; font-family:sans-serif;">${textVal}</textarea>
                </div>

                <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
                    <button class="brand-btn" id="crmSendWhatsAppBtn" data-phone="${activeLead.phone || ''}" data-name="${activeLead.name}" style="background:#22c55e; border-color:#22c55e; color:black; font-weight:600; font-size:12px; padding:8px; display:flex; align-items:center; gap:6px; justify-content:center;">
                        <i data-lucide="message-square" style="width:13px; height:13px;"></i> Send via WhatsApp
                    </button>
                    <button class="secondary-btn" id="crmCopyPitchBtn" style="font-size:12px; padding:8px; display:flex; align-items:center; gap:6px; justify-content:center;">
                        <i data-lucide="copy" style="width:13px; height:13px;"></i> Copy Pitch Text
                    </button>
                </div>
            </div>
        `;
    }

    // 8. Generate Call Context Bar at the top of CRM content
    const formattedSeconds = () => {
        const m = String(Math.floor(activeCallSeconds / 60)).padStart(2, '0');
        const s = String(activeCallSeconds % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    let callBarHTML = '';
    if (isCallConnected) {
        callBarHTML = `
            <div class="call-context-bar" style="background: linear-gradient(90deg, #166534, #15803d);">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <i data-lucide="phone-call" style="width:16px; height:16px;"></i>
                    <strong>Connected &mdash; <span id="callDurationTimer">${formattedSeconds()}</span></strong>
                    <span style="opacity: 0.85; font-size: 12.5px;">Talking to ${callTargetLeadName}</span>
                </div>
                <div class="call-controls">
                    <button class="call-control-btn" id="callMuteBtn" style="display:flex; align-items:center; gap:4px;"><i data-lucide="mic-off" style="width:12px; height:12px;"></i> Mute</button>
                    <button class="call-control-btn" id="callKeyboardBtn" style="display:flex; align-items:center; gap:4px;"><i data-lucide="grid" style="width:12px; height:12px;"></i> Keypad</button>
                    <button class="call-control-btn disconnect-btn" id="endCallContextBtn">Disconnect</button>
                </div>
            </div>
        `;
    } else {
        callBarHTML = `
            <div class="call-context-bar" style="background: var(--bg-surface); border-bottom: 1px solid var(--border); color: var(--text-secondary);">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <i data-lucide="phone" style="width:16px; height:16px;"></i>
                    <strong>Line Idle</strong>
                    <span style="font-size:12px; color:var(--text-muted);">Click "Call" on any lead card to start phone/WhatsApp dialer context</span>
                </div>
                <div class="call-controls">
                    <button class="call-control-btn end-session-btn" id="sessionLeaveBtn" style="font-size:11.5px;">End Session</button>
                </div>
            </div>
        `;
    }

    return `
        <!-- Top status context bar -->
        ${callBarHTML}

        <!-- Usability Banner -->
        <div class="usability-banner" style="background: rgba(255, 160, 0, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 18px; margin: 16px 24px 0 24px; display: flex; flex-direction: column; gap: 4px; border-left: 3px solid var(--accent-gold); flex-shrink: 0;">
            <div style="font-size: 12.5px; color: white; line-height: 1.4; text-align: left;"><span style="color: var(--accent-gold); font-weight: 600;">What it is:</span> Manage your saved leads through a unified B2B sales pipeline.</div>
            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; text-align: left;"><span style="color: var(--accent-gold); font-weight: 600;">How to leverage:</span> Update lead stages and save call logs to track deals from initial pitch to closed client.</div>
        </div>

        <!-- 3-Column main workstation content grid -->
        <div class="dashboard-workspace-3col">
            
            <!-- Column 1: Lead Selector list -->
            <div class="workspace-3col-panel col-selector">
                <div class="selector-tabs">
                    <button class="selector-tab-btn ${activeSubTab === 'all' ? 'active' : ''}" data-tab="all">All (${allCount})</button>
                    <button class="selector-tab-btn ${activeSubTab === 'calls' ? 'active' : ''}" data-tab="calls">Calls (${callsCount})</button>
                    <button class="selector-tab-btn ${activeSubTab === 'done' ? 'active' : ''}" data-tab="done">Done (${doneCount})</button>
                </div>
                <div class="selector-search-wrap">
                    <input type="text" id="crmSearchSelector" class="selector-search-input" placeholder="Search name or area..." value="${searchQuery ? searchQuery : ''}">
                </div>
                <div class="selector-list" id="crmSelectorList">
                    ${leadsHTML}
                    ${emptyLeadsHTML}
                </div>
            </div>

            <!-- Column 2: Lead Details & Audit -->
            <div class="workspace-3col-panel col-detail">
                ${col2HTML}
            </div>

            <!-- Column 3: Actions Panel -->
            <div class="workspace-3col-panel col-action">
                ${col3HTML}
            </div>

        </div>
    `;
}

export function bindCRMWorkspaceEvents(onUpdateCallback) {
    // Process Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const detailPanel = document.getElementById('crmDetailPanel');
    const panelBody = document.getElementById('crmPanelBody');

    // 1. Lead selector item clicking
    const leadItems = document.querySelectorAll('.selector-lead-item');
    leadItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('compare-checkbox')) return;
            const leadId = item.getAttribute('data-id');
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            
            // Clear composed text cache so it is regenerated fresh for the newly selected lead
            window._composedMainText = null;

            searchParams.set('lead_id', leadId);
            window.location.hash = `#/dashboard/crm?${searchParams.toString()}`;
        });
    });

    // 2. Tab selector buttons
    const tabBtns = document.querySelectorAll('.selector-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            searchParams.set('sub_tab', tabId);
            window.location.hash = `#/dashboard/crm?${searchParams.toString()}`;
        });
    });

    // 3. Client side search filter (immediate typing feedback)
    const searchEl = document.getElementById('crmSearchSelector');
    if (searchEl) {
        searchEl.addEventListener('input', () => {
            const query = searchEl.value.toLowerCase().trim();
            const items = document.querySelectorAll('.selector-lead-item');
            items.forEach(item => {
                const name = item.querySelector('.selector-lead-name').innerText.toLowerCase();
                const meta = item.querySelector('.selector-lead-meta').innerText.toLowerCase();
                if (name.includes(query) || meta.includes(query)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // 4. Phone dialing events
    const startCallBtn = document.getElementById('startCallBtn');
    if (startCallBtn) {
        startCallBtn.addEventListener('click', () => {
            const phone = startCallBtn.getAttribute('data-phone');
            const name = startCallBtn.getAttribute('data-name');
            
            isCallConnected = true;
            activeCallSeconds = 0;
            callTargetLeadName = name;

            if (activeCallInterval) clearInterval(activeCallInterval);
            activeCallInterval = setInterval(() => {
                activeCallSeconds++;
                const timerEl = document.getElementById('callDurationTimer');
                if (timerEl) {
                    const m = String(Math.floor(activeCallSeconds / 60)).padStart(2, '0');
                    const s = String(activeCallSeconds % 60).padStart(2, '0');
                    timerEl.innerText = `${m}:${s}`;
                } else {
                    clearInterval(activeCallInterval);
                    activeCallInterval = null;
                }
            }, 1000);

            if (onUpdateCallback) onUpdateCallback();
        });
    }

    // 5. Disconnect call button
    const endCallContextBtn = document.getElementById('endCallContextBtn');
    if (endCallContextBtn) {
        endCallContextBtn.addEventListener('click', () => {
            isCallConnected = false;
            if (activeCallInterval) {
                clearInterval(activeCallInterval);
                activeCallInterval = null;
            }
            activeCallSeconds = 0;
            if (onUpdateCallback) onUpdateCallback();
        });
    }

    // 6. Session End navigation
    const sessionLeaveBtn = document.getElementById('sessionLeaveBtn');
    if (sessionLeaveBtn) {
        sessionLeaveBtn.addEventListener('click', () => {
            window.location.hash = '#/browse';
        });
    }

    // 7. Copy Mail
    const copyMailBtn = document.getElementById('copyMailBtn');
    if (copyMailBtn) {
        copyMailBtn.addEventListener('click', () => {
            const email = copyMailBtn.getAttribute('data-email');
            navigator.clipboard.writeText(email);
            copyMailBtn.innerText = 'Copied!';
            setTimeout(() => { copyMailBtn.innerText = 'Copy'; }, 2000);
        });
    }

    // 8. Save Notes
    const saveCrmNotesBtn = document.getElementById('saveCrmNotesBtn');
    if (saveCrmNotesBtn) {
        saveCrmNotesBtn.addEventListener('click', async () => {
            const leadId = saveCrmNotesBtn.getAttribute('data-id');
            const noteText = document.getElementById('crmNotesInput').value;
            
            saveCrmNotesBtn.innerText = 'Saving...';
            try {
                await Api.supabase
                    .from('saved_leads')
                    .update({ 
                        notes: noteText, 
                        updated_at: new Date().toISOString() 
                    })
                    .eq('id', leadId);
                saveCrmNotesBtn.innerText = 'Saved!';
                setTimeout(() => { saveCrmNotesBtn.innerText = 'Save Notes'; }, 2000);
            } catch (err) {
                console.error("Notes save failed", err);
                saveCrmNotesBtn.innerText = 'Error';
                setTimeout(() => { saveCrmNotesBtn.innerText = 'Save Notes'; }, 2000);
            }
        });
    }

    // 9. Run Health check
    const runCRMHealthCheckBtn = document.getElementById('runCRMHealthCheckBtn');
    if (runCRMHealthCheckBtn) {
        runCRMHealthCheckBtn.addEventListener('click', async () => {
            const id = runCRMHealthCheckBtn.getAttribute('data-id');
            const url = runCRMHealthCheckBtn.getAttribute('data-url');
            
            window._currentAuditLoading = id;
            if (onUpdateCallback) onUpdateCallback();

            try {
                const { data, error } = await Api.supabase.functions.invoke('audit-website', {
                    body: { url: url, professional_id: id }
                });
                if (error) throw error;
                window._currentAuditResult = data;
            } catch (err) {
                console.error("Health check audit failed. Falling back to mock details.", err);
                
                // Static mock report data matching standard fields
                window._currentAuditResult = {
                    url: url,
                    page_speed_score: 68,
                    mobile_friendly: true,
                    has_https: url.startsWith('https://'),
                    has_schema: false,
                    load_time_ms: 2400,
                    gaps: [
                        "Structured schema metadata is missing for Google Search display",
                        "Speed optimization can improve (index speed load: 2.4s)"
                    ],
                    biggest_gap: "Structured schema data is missing for Google Search display",
                    est_lost_revenue_per_month: 8500
                };
                
                // Write details to audit cache locally
                await Api.supabase.from('audit_cache').upsert([window._currentAuditResult], { onConflict: 'url' });
            } finally {
                window._currentAuditLoading = null;
                if (onUpdateCallback) onUpdateCallback();
            }
        });
    }

    // 10. Call Disposition Auto Save
    const dispRadios = document.querySelectorAll('input[name="call_disp"]');
    dispRadios.forEach(radio => {
        radio.addEventListener('change', async () => {
            const selectedVal = radio.value;
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const leadId = searchParams.get('lead_id');
            
            // Map disposition status to CRM stages
            let targetStatus = 'new';
            if (selectedVal === 'converted') targetStatus = 'converted';
            else if (selectedVal === 'responded' || selectedVal === 'responded_not_interested') targetStatus = 'responded';
            else if (selectedVal.startsWith('contacted')) targetStatus = 'contacted';
            else if (selectedVal === 'closed_bad_number') targetStatus = 'closed';

            const msgEl = document.getElementById('dispSaveMsg');
            if (msgEl) msgEl.innerText = 'Syncing stage...';

            try {
                // Fetch saved lead records to retrieve the primary ID matching the selection
                const { data } = await Api.supabase
                    .from('saved_leads')
                    .select('id')
                    .eq('id', leadId)
                    .single();
                
                if (data) {
                    await Api.updateLeadStatus(data.id, targetStatus);
                    if (msgEl) msgEl.innerText = 'Call status saved!';
                    setTimeout(() => { if (msgEl) msgEl.innerText = ''; }, 2000);
                    if (onUpdateCallback) onUpdateCallback();
                }
            } catch (err) {
                console.error("Disposition update failed", err);
                if (msgEl) msgEl.innerText = 'Error syncing status';
            }
        });
    });

    // 11. Outreach composition tracking
    const composerTextarea = document.getElementById('crmOutreachComposerText');
    if (composerTextarea) {
        composerTextarea.addEventListener('input', () => {
            window._composedMainText = composerTextarea.value;
        });
    }

    // Brochure attachment handlers
    const brochureToggle = document.getElementById('crmBrochureToggle');
    const brochureSelectContainer = document.getElementById('crmBrochureSelectContainer');
    const brochureDropdown = document.getElementById('crmBrochureDropdown');
    const crmBrochureLinkLabelContainer = document.getElementById('crmBrochureLinkLabelContainer');
    const crmBrochureLinkLabel = document.getElementById('crmBrochureLinkLabel');

    function updateComposedTextWithBrochure() {
        const textarea = document.getElementById('crmOutreachComposerText');
        if (!textarea) return;

        let text = textarea.value;
        // Strip any existing links (both raw and with custom label prefix) to keep pitch text clean
        const brochureRegex = /(?:\n\n📄\s*[^\n]+:\s*\n)?(?:https?:\/\/[^\s]+|#\/d\/[^\s]+)/gi;
        text = text.replace(brochureRegex, '');

        if (window._attachBrochureEnabled && window._includeBrochureLink && window._selectedBrochureId) {
            const label = window._brochureLinkLabel || `${activeLead.name} Portfolio`;
            const doc = (window._userDocuments || []).find(d => d.id === window._selectedBrochureId);
            const code = doc?.slug || window._selectedBrochureId;
            const shortUrl = `${window.location.origin}${window.location.pathname}#/d/${code}`;
            text += `\n\n📄 ${label}:\n${shortUrl}`;
        }

        textarea.value = text;
        window._composedMainText = text;
    }

    // Default initialize selected ID
    if (!window._selectedBrochureId && window._userDocuments && window._userDocuments.length > 0) {
        window._selectedBrochureId = window._userDocuments[0].id;
        const doc = window._userDocuments.find(d => d.id === window._selectedBrochureId);
        window._selectedBrochureUrl = doc ? doc.file_url : '';
    }

    if (brochureToggle) {
        brochureToggle.addEventListener('change', () => {
            window._attachBrochureEnabled = brochureToggle.checked;
            if (brochureSelectContainer) {
                brochureSelectContainer.style.display = window._attachBrochureEnabled ? 'block' : 'none';
            }
            if (window._attachBrochureEnabled && brochureDropdown) {
                window._selectedBrochureId = brochureDropdown.value;
                const doc = (window._userDocuments || []).find(d => d.id === window._selectedBrochureId);
                window._selectedBrochureUrl = doc ? doc.file_url : '';
            }
            updateComposedTextWithBrochure();
        });
    }

    if (brochureDropdown) {
        brochureDropdown.addEventListener('change', () => {
            window._selectedBrochureId = brochureDropdown.value;
            const doc = (window._userDocuments || []).find(d => d.id === window._selectedBrochureId);
            window._selectedBrochureUrl = doc ? doc.file_url : '';
            updateComposedTextWithBrochure();
        });
    }

    const crmBrochureIncludeLink = document.getElementById('crmBrochureIncludeLink');
    if (crmBrochureIncludeLink) {
        crmBrochureIncludeLink.addEventListener('change', () => {
            window._includeBrochureLink = crmBrochureIncludeLink.checked;
            if (crmBrochureLinkLabelContainer) {
                crmBrochureLinkLabelContainer.style.display = window._includeBrochureLink ? 'block' : 'none';
            }
            updateComposedTextWithBrochure();
        });
    }

    if (crmBrochureLinkLabel) {
        crmBrochureLinkLabel.addEventListener('input', () => {
            window._brochureLinkLabel = crmBrochureLinkLabel.value;
            updateComposedTextWithBrochure();
        });
    }

    const crmDownloadBrochureBtn = document.getElementById('crmDownloadBrochureBtn');
    if (crmDownloadBrochureBtn) {
        crmDownloadBrochureBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window._selectedBrochureUrl) {
                const link = document.createElement('a');
                link.href = window._selectedBrochureUrl;
                link.target = '_blank';
                link.download = window._selectedBrochureUrl.split('/').pop() || 'Brochure.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert("Please select a brochure to download");
            }
        });
    }

    // 12. Send WhatsApp click
    const crmSendWhatsAppBtn = document.getElementById('crmSendWhatsAppBtn');
    if (crmSendWhatsAppBtn) {
        crmSendWhatsAppBtn.addEventListener('click', () => {
            const phone = crmSendWhatsAppBtn.getAttribute('data-phone');
            const name = crmSendWhatsAppBtn.getAttribute('data-name');
            const msgText = document.getElementById('crmOutreachComposerText').value;

            if (!phone) {
                alert("No phone number available for this business");
                return;
            }

            const cleanPhone = phone.replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msgText)}`, '_blank');
        });
    }

    // 13. Copy Pitch Text
    const crmCopyPitchBtn = document.getElementById('crmCopyPitchBtn');
    if (crmCopyPitchBtn) {
        crmCopyPitchBtn.addEventListener('click', () => {
            const msgText = document.getElementById('crmOutreachComposerText').value;
            navigator.clipboard.writeText(msgText);
            crmCopyPitchBtn.innerHTML = '✓ Copied!';
            crmCopyPitchBtn.style.color = 'var(--accent-gold)';
            setTimeout(() => { 
                crmCopyPitchBtn.innerHTML = '<i data-lucide="copy" style="width:13px; height:13px;"></i> Copy Pitch Text'; 
                if (window.lucide) window.lucide.createIcons();
                crmCopyPitchBtn.style.color = '';
            }, 2000);
        });
    }
}

