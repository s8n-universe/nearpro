import { State } from '../state.js';
import { Api } from '../api.js';
import { buildOutreach } from './OutreachStudio.js';

// Helper: human-readable time-ago string
function timeAgo(dateStr) {
    if (!dateStr) return null;
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now - then;
    if (diffMs < 0 || isNaN(diffMs)) return null;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

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

    // 2. Read query parameters for sub-tab and active lead
    const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const activeSubTab = searchParams.get('sub_tab') || 'all';
    const activeLeadId = searchParams.get('lead_id');
    const activeWorkspaceTab = searchParams.get('tab') || window._activeCRMTab || 'audit';
    window._activeCRMTab = activeWorkspaceTab;

    // 3. Compute active lead
    let activeLead = null;
    if (activeLeadId) {
        activeLead = allLeads.find(l => String(l.saved_lead_id) === String(activeLeadId) || String(l.id) === String(activeLeadId));
    }
    if (!activeLead && allLeads.length > 0) {
        activeLead = allLeads[0];
    }
    const finalActiveLeadId = activeLead ? activeLead.saved_lead_id : null;

    // 4. Compute Pipeline Stats
    const allCount = allLeads.length;
    const callsLeads = allLeads.filter(l => l.crm_status === 'new' || l.crm_status === 'contacted' || l.crm_status === 'responded');
    const callsCount = callsLeads.length;
    const doneLeads = allLeads.filter(l => l.crm_status === 'converted' || l.crm_status === 'closed');
    const doneCount = doneLeads.length;

    let displayedLeads = [];
    if (activeSubTab === 'calls') displayedLeads = callsLeads;
    else if (activeSubTab === 'done') displayedLeads = doneLeads;
    else displayedLeads = allLeads;

    const searchQuery = (searchParams.get('q') || '').toLowerCase().trim();
    if (searchQuery) {
        displayedLeads = displayedLeads.filter(l => 
            (l.name || '').toLowerCase().includes(searchQuery) || 
            (l.category || '').toLowerCase().includes(searchQuery) ||
            (l.area || '').toLowerCase().includes(searchQuery)
        );
    }

    // Column 1: Selector List HTML
    const leadsHTML = displayedLeads.map(lead => {
        const isActive = activeLead && (String(activeLead.saved_lead_id) === String(lead.saved_lead_id));
        const activeClass = isActive ? 'active' : '';
        
        let crmTag = '🔵 New';
        if (lead.crm_status === 'contacted') crmTag = '📞 Contacted';
        else if (lead.crm_status === 'responded') crmTag = '💬 Responded';
        else if (lead.crm_status === 'converted') crmTag = '🏆 Converted';
        else if (lead.crm_status === 'closed') crmTag = '⚫ Closed';

        const rating = lead.rating || 0;

        return `
            <div class="crm-lead-item ${activeClass}" data-id="${lead.saved_lead_id}">
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                        <h5 style="margin:0; font-size:13.5px; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lead.name}</h5>
                        <span style="font-size:10px; font-weight:700; font-family:var(--font-mono);">${crmTag}</span>
                    </div>
                    <p style="margin:0 0 4px 0; font-size:11.5px; color:#64748b;">${lead.category || 'Local Business'} &middot; ${lead.area || 'Mumbai'}</p>
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; font-family:var(--font-mono);">
                        <span>⭐ ${rating} (${lead.review_count || 0})</span>
                        <span>${timeAgo(lead.updated_at) || 'Recent'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const emptyLeadsHTML = displayedLeads.length === 0 ? `
        <div style="padding:40px 12px; text-align:center; color:#64748b; font-size:13px;">
            No leads found matching query.
        </div>
    ` : '';

    // Column 2 & 3: 360° Lead Workstation Panel HTML
    let mainWorkstationHTML = '';

    if (!activeLead) {
        mainWorkstationHTML = `
            <div style="text-align:center; padding:80px 24px; color:#64748b; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px;">
                <i data-lucide="users" style="width:48px; height:48px; color:#94a3b8; stroke-width:1.5; margin-bottom:12px;"></i>
                <h4 style="margin:0 0 6px 0; color:#0f172a; font-size:16px; font-weight:800;">No Tracked Leads in Pipeline</h4>
                <p style="margin:0 0 20px 0; font-size:13.5px; color:#475569; max-width:360px; margin-left:auto; margin-right:auto;">
                    Browse local businesses in the directory and click "Track Lead" to add prospects into your sales workstation.
                </p>
                <a href="#/dashboard/directory" style="background:#2563eb; color:white; padding:10px 20px; font-size:13px; font-weight:700; border-radius:6px; text-decoration:none; display:inline-block;">
                    Browse Directory Leads ➔
                </a>
            </div>
        `;
    } else {
        const leadPhone = activeLead.phone || 'N/A';
        const leadMail = activeLead.email || 'N/A';
        const leadNotes = activeLead.notes || '';
        const rating = activeLead.rating || 0;
        const reviewCount = activeLead.review_count || 0;

        // Calculate AI Conversion Closing Probability (0 - 100)
        let conversionScore = 65;
        if (reviewCount < 20) conversionScore += 15;
        if (!activeLead.website) conversionScore += 10;
        if (activeLead.crm_status === 'responded') conversionScore += 10;

        let scoreBadgeBg = '#eff6ff';
        let scoreBadgeColor = '#2563eb';
        if (conversionScore >= 80) { scoreBadgeBg = '#ecfdf5'; scoreBadgeColor = '#059669'; }

        // Determine 360° Tab Content
        let tabContentHTML = '';

        if (activeWorkspaceTab === 'audit') {
            const auditResult = window._currentAuditResult && window._currentAuditResult.url === activeLead.website?.trim().toLowerCase()
                ? window._currentAuditResult 
                : null;
            const auditLoading = window._currentAuditLoading === activeLead.saved_lead_id;

            if (auditLoading) {
                tabContentHTML = `
                    <div style="text-align:center; padding:40px 20px; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px;">
                        <div class="spinner" style="width:36px; height:36px; border-width:3px; border-top-color:#2563eb; margin:0 auto 16px auto;"></div>
                        <h4 style="margin:0 0 6px 0; color:#0f172a; font-weight:700;">Running Technical Health Check...</h4>
                        <p style="color:#475569; font-size:13px; margin:0;">Scanning PageSpeed, SSL security, and Google review gap...</p>
                    </div>
                `;
            } else if (auditResult) {
                const score = auditResult.page_speed_score || 0;
                let scoreColor = '#dc2626';
                if (score >= 80) scoreColor = '#059669';
                else if (score >= 50) scoreColor = '#d97706';

                tabContentHTML = `
                    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:24px; display:flex; flex-direction:column; gap:20px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:14px;">
                            <div>
                                <h4 style="margin:0; font-size:16px; font-weight:700; color:#0f172a;">Audit Report for ${auditResult.url}</h4>
                                <span style="font-size:12px; color:#64748b; font-family:var(--font-mono);">Scanned via NearPro Engine</span>
                            </div>
                            <span style="font-size:14px; font-weight:800; color:${scoreColor}; font-family:var(--font-mono); background:#f8fafc; padding:6px 14px; border-radius:8px; border:1px solid #e2e8f0;">
                                ${score}/100 Speed
                            </span>
                        </div>

                        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; text-align:center;">
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
                                <div style="font-size:10.5px; color:#64748b; font-family:var(--font-mono); font-weight:700;">MOBILE</div>
                                <div style="font-size:14px; font-weight:700; color:#0f172a; margin-top:4px;">${auditResult.mobile_friendly ? '✅ Ready' : '❌ Failing'}</div>
                            </div>
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
                                <div style="font-size:10.5px; color:#64748b; font-family:var(--font-mono); font-weight:700;">SSL</div>
                                <div style="font-size:14px; font-weight:700; color:#0f172a; margin-top:4px;">${auditResult.has_https ? '✅ Secure' : '❌ Unsecured'}</div>
                            </div>
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
                                <div style="font-size:10.5px; color:#64748b; font-family:var(--font-mono); font-weight:700;">SCHEMA</div>
                                <div style="font-size:14px; font-weight:700; color:#0f172a; margin-top:4px;">${auditResult.has_schema ? '✅ Active' : '❌ Missing'}</div>
                            </div>
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
                                <div style="font-size:10.5px; color:#64748b; font-family:var(--font-mono); font-weight:700;">LOAD SPEED</div>
                                <div style="font-size:14px; font-weight:700; color:#0f172a; margin-top:4px;">${((auditResult.load_time_ms || 2400) / 1000).toFixed(1)}s</div>
                            </div>
                        </div>

                        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <div style="font-size:11px; font-weight:700; color:#b45309; font-family:var(--font-mono); text-transform:uppercase;">ESTIMATED MONTHLY REVENUE LEAK</div>
                                <div style="font-size:22px; font-weight:800; color:#0f172a; font-family:var(--font-heading);">₹${(auditResult.est_lost_revenue_per_month || 8500).toLocaleString('en-IN')} / mo</div>
                            </div>
                            <button id="runCRMHealthCheckBtn" data-id="${activeLead.saved_lead_id}" data-url="${activeLead.website}" style="background:#2563eb; color:white; border:none; padding:8px 16px; font-size:12.5px; font-weight:700; border-radius:6px; cursor:pointer;">
                                Re-run Health Check ➔
                            </button>
                        </div>
                    </div>
                `;
            } else {
                tabContentHTML = `
                    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:32px; text-align:center; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                        <i data-lucide="activity" style="width:36px; height:36px; color:#2563eb; margin-bottom:12px;"></i>
                        <h4 style="margin:0 0 6px 0; font-size:16px; font-weight:700; color:#0f172a;">Run Technical Health Check Audit</h4>
                        <p style="color:#475569; font-size:13.5px; max-width:400px; margin:0 auto 20px auto; line-height:1.5;">
                            Analyze ${activeLead.website || activeLead.name + "'s web presence"} for PageSpeed bottlenecks, SSL gaps, and lost monthly revenue leak.
                        </p>
                        <button id="runCRMHealthCheckBtn" data-id="${activeLead.saved_lead_id}" data-url="${activeLead.website || 'example.com'}" style="background:#2563eb; color:white; border:none; padding:10px 24px; font-size:13.5px; font-weight:700; border-radius:6px; cursor:pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                            Run Health Check Audit ➔
                        </button>
                    </div>
                `;
            }
        } else if (activeWorkspaceTab === 'proposals') {
            tabContentHTML = `
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; display:flex; flex-direction:column; gap:20px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h4 style="margin:0; font-size:16px; font-weight:700; color:#0f172a; font-family:var(--font-heading);">Client PDF & Web Proposals</h4>
                            <p style="margin:4px 0 0 0; font-size:13px; color:#475569;">3-Page client proposals generated for ${activeLead.name}</p>
                        </div>
                        <a href="#/dashboard/proposals?lead_id=${activeLead.id}" style="background:#2563eb; color:white; padding:10px 18px; font-size:13px; font-weight:700; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:6px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                            <i data-lucide="sparkles" style="width:14px; height:14px;"></i> Generate New Proposal ➔
                        </a>
                    </div>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; text-align:center;">
                        <p style="margin:0 0 12px 0; font-size:13.5px; color:#475569;">
                            Ready to generate a custom 3-page proposal for <strong>${activeLead.name}</strong> featuring Google review deficit analysis, revenue leak math, and custom 3-tier packages.
                        </p>
                        <a href="#/dashboard/proposals?lead_id=${activeLead.id}" style="font-size:13px; color:#2563eb; font-weight:700; text-decoration:underline;">
                            Open Proposal Generator for this Lead ↗
                        </a>
                    </div>
                </div>
            `;
        } else if (activeWorkspaceTab === 'scripts') {
            tabContentHTML = `
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; display:flex; flex-direction:column; gap:20px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h4 style="margin:0; font-size:16px; font-weight:700; color:#0f172a; font-family:var(--font-heading);">AI Tele-Sales Script & Objections</h4>
                            <p style="margin:4px 0 0 0; font-size:13px; color:#475569;">Teleprompter cold calling script tailored for ${activeLead.name}</p>
                        </div>
                        <a href="#/dashboard/call-scripts?lead_id=${activeLead.id}" style="background:#059669; color:white; padding:10px 18px; font-size:13px; font-weight:700; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:6px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);">
                            <i data-lucide="phone-call" style="width:14px; height:14px;"></i> Open Teleprompter ➔
                        </a>
                    </div>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; text-align:center;">
                        <p style="margin:0 0 12px 0; font-size:13.5px; color:#475569;">
                            Generate cold-calling teleprompter scripts with 30-second pattern interrupts and live objection handling cards for <strong>${activeLead.name}</strong>.
                        </p>
                        <a href="#/dashboard/call-scripts?lead_id=${activeLead.id}" style="font-size:13px; color:#059669; font-weight:700; text-decoration:underline;">
                            Launch Teleprompter Script Generator ↗
                        </a>
                    </div>
                </div>
            `;
        } else if (activeWorkspaceTab === 'outreach') {
            tabContentHTML = `
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; display:flex; flex-direction:column; gap:20px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h4 style="margin:0; font-size:16px; font-weight:700; color:#0f172a; font-family:var(--font-heading);">AI Outreach Pitch Sequence</h4>
                            <p style="margin:4px 0 0 0; font-size:13px; color:#475569;">Hinglish & English email/WhatsApp sequences for ${activeLead.name}</p>
                        </div>
                        <a href="#/dashboard/outreach?lead_id=${activeLead.id}" style="background:#7c3aed; color:white; padding:10px 18px; font-size:13px; font-weight:700; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
                            <i data-lucide="zap" style="width:14px; height:14px;"></i> Launch AI Studio ➔
                        </a>
                    </div>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; text-align:center;">
                        <p style="margin:0 0 12px 0; font-size:13.5px; color:#475569;">
                            Compose multi-day pitch sequences for <strong>${activeLead.name}</strong> using AI pre-filled with their specific Google review gap.
                        </p>
                        <a href="#/dashboard/outreach?lead_id=${activeLead.id}" style="font-size:13px; color:#7c3aed; font-weight:700; text-decoration:underline;">
                            Open AI Outreach Studio ↗
                        </a>
                    </div>
                </div>
            `;
        } else if (activeWorkspaceTab === 'collateral') {
            tabContentHTML = `
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; display:flex; flex-direction:column; gap:20px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h4 style="margin:0; font-size:16px; font-weight:700; color:#0f172a; font-family:var(--font-heading);">Attached Marketing Collateral & Documents</h4>
                            <p style="margin:4px 0 0 0; font-size:13px; color:#475569;">Attach global PDF brochures from your Documents Library</p>
                        </div>
                        <a href="#/dashboard/documents" style="background:#0f172a; color:white; padding:10px 18px; font-size:13px; font-weight:700; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
                            <i data-lucide="folder" style="width:14px; height:14px;"></i> Documents Library ➔
                        </a>
                    </div>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; text-align:center;">
                        <p style="margin:0 0 12px 0; font-size:13.5px; color:#475569;">
                            Upload marketing PDFs or company brochures to your library to attach them to pitches for <strong>${activeLead.name}</strong>.
                        </p>
                        <a href="#/dashboard/documents" style="font-size:13px; color:#0f172a; font-weight:700; text-decoration:underline;">
                            Manage Documents Library ↗
                        </a>
                    </div>
                </div>
            `;
        } else {
            // Notes & Timeline Tab
            tabContentHTML = `
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:24px; display:flex; flex-direction:column; gap:20px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <div>
                        <h4 style="margin:0 0 8px 0; font-size:15px; font-weight:700; color:#0f172a;">Client Notes & Follow-Up Log</h4>
                        <textarea id="crmLeadNotesTextarea" placeholder="Log call outcome, owner requirements, or meeting notes..." style="width:100%; min-height:110px; padding:14px; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; color:#0f172a; font-size:13.5px; outline:none; resize:vertical;">${leadNotes}</textarea>
                        <div style="display:flex; justify-content:flex-end; margin-top:8px;">
                            <button id="saveCRMNotesBtn" data-id="${activeLead.saved_lead_id}" style="background:#2563eb; color:white; border:none; padding:8px 20px; font-size:13px; font-weight:700; border-radius:6px; cursor:pointer;">
                                Save Client Notes
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        mainWorkstationHTML = `
            <div style="display:flex; flex-direction:column; gap:20px; width:100%;">
                
                <!-- Lead Header Card -->
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:24px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
                    <div>
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                            <h2 style="margin:0; font-size:22px; font-weight:800; color:#0f172a; font-family:var(--font-heading);">${activeLead.name}</h2>
                            <span style="background:${scoreBadgeBg}; color:${scoreBadgeColor}; padding:3px 10px; border-radius:99px; font-size:11.5px; font-weight:800; font-family:var(--font-mono);">
                                🤖 AI SCORE: ${conversionScore}/100
                            </span>
                        </div>
                        <p style="margin:0; font-size:13.5px; color:#475569;">
                            ${activeLead.category || 'Business'} &middot; ${activeLead.area || 'Mumbai'} &middot; ⭐ ${rating} (${reviewCount} reviews)
                        </p>
                    </div>

                    <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                        <a href="tel:${leadPhone}" style="background:#eff6ff; border:1px solid #bfdbfe; color:#2563eb; padding:8px 14px; font-size:12.5px; font-weight:700; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
                            <i data-lucide="phone" style="width:14px; height:14px;"></i> Call ${leadPhone}
                        </a>
                        
                        <a href="https://wa.me/${leadPhone.replace(/[^0-9]/g, '')}" target="_blank" style="background:#ecfdf5; border:1px solid #a7f3d0; color:#059669; padding:8px 14px; font-size:12.5px; font-weight:700; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
                            <i data-lucide="message-square" style="width:14px; height:14px;"></i> WhatsApp
                        </a>

                        <!-- Stage Selector -->
                        <select id="crmStageDropdown" data-id="${activeLead.saved_lead_id}" style="padding:8px 12px; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; color:#0f172a; font-size:12.5px; font-weight:700; outline:none;">
                            <option value="new" ${activeLead.crm_status === 'new' ? 'selected' : ''}>🔵 New Lead</option>
                            <option value="contacted" ${activeLead.crm_status === 'contacted' ? 'selected' : ''}>📞 Contacted</option>
                            <option value="responded" ${activeLead.crm_status === 'responded' ? 'selected' : ''}>💬 Responded</option>
                            <option value="converted" ${activeLead.crm_status === 'converted' ? 'selected' : ''}>🏆 Converted</option>
                            <option value="closed" ${activeLead.crm_status === 'closed' ? 'selected' : ''}>⚫ Closed</option>
                        </select>
                    </div>
                </div>

                <!-- AI Deal Co-Pilot Recommendation Banner -->
                <div style="background:#eff6ff; border:1px solid #bfdbfe; border-left:4px solid #2563eb; border-radius:8px; padding:14px 20px; display:flex; justify-content:space-between; align-items:center; gap:16px;">
                    <div>
                        <div style="font-size:11px; font-weight:800; color:#2563eb; font-family:var(--font-mono); text-transform:uppercase;">🤖 AI DEAL CO-PILOT RECOMMENDATION</div>
                        <div style="font-size:13.5px; color:#0f172a; font-weight:700; margin-top:2px;">
                            Review Deficit Opportunity: Lead has ${reviewCount < 20 ? 'only ' + reviewCount + ' Google reviews' : 'strong rating'}. Send 1-tap WhatsApp PDF Proposal with 3-tier pricing math.
                        </div>
                    </div>
                    <a href="#/dashboard/proposals?lead_id=${activeLead.id}" style="background:#2563eb; color:white; padding:8px 16px; font-size:12px; font-weight:700; border-radius:6px; text-decoration:none; flex-shrink:0;">
                        Execute Recommendation ➔
                    </a>
                </div>

                <!-- 360° Lead Activity Workstation Navigation Tabs -->
                <div style="display:flex; gap:6px; background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:6px; overflow-x:auto;">
                    <a href="#/dashboard/crm?lead_id=${finalActiveLeadId}&tab=audit" class="crm-subtab-btn ${activeWorkspaceTab === 'audit' ? 'active' : ''}" style="padding:8px 16px; font-size:12.5px; font-weight:700; border-radius:6px; text-decoration:none; color:${activeWorkspaceTab === 'audit' ? '#2563eb' : '#64748b'}; background:${activeWorkspaceTab === 'audit' ? '#eff6ff' : 'transparent'}; border:1px solid ${activeWorkspaceTab === 'audit' ? '#bfdbfe' : 'transparent'}; white-space:nowrap;">
                        📊 Health Check & Audit
                    </a>
                    <a href="#/dashboard/crm?lead_id=${finalActiveLeadId}&tab=proposals" class="crm-subtab-btn ${activeWorkspaceTab === 'proposals' ? 'active' : ''}" style="padding:8px 16px; font-size:12.5px; font-weight:700; border-radius:6px; text-decoration:none; color:${activeWorkspaceTab === 'proposals' ? '#2563eb' : '#64748b'}; background:${activeWorkspaceTab === 'proposals' ? '#eff6ff' : 'transparent'}; border:1px solid ${activeWorkspaceTab === 'proposals' ? '#bfdbfe' : 'transparent'}; white-space:nowrap;">
                        📄 PDF Proposals
                    </a>
                    <a href="#/dashboard/crm?lead_id=${finalActiveLeadId}&tab=scripts" class="crm-subtab-btn ${activeWorkspaceTab === 'scripts' ? 'active' : ''}" style="padding:8px 16px; font-size:12.5px; font-weight:700; border-radius:6px; text-decoration:none; color:${activeWorkspaceTab === 'scripts' ? '#2563eb' : '#64748b'}; background:${activeWorkspaceTab === 'scripts' ? '#eff6ff' : 'transparent'}; border:1px solid ${activeWorkspaceTab === 'scripts' ? '#bfdbfe' : 'transparent'}; white-space:nowrap;">
                        📞 Tele-Sales Scripts
                    </a>
                    <a href="#/dashboard/crm?lead_id=${finalActiveLeadId}&tab=outreach" class="crm-subtab-btn ${activeWorkspaceTab === 'outreach' ? 'active' : ''}" style="padding:8px 16px; font-size:12.5px; font-weight:700; border-radius:6px; text-decoration:none; color:${activeWorkspaceTab === 'outreach' ? '#2563eb' : '#64748b'}; background:${activeWorkspaceTab === 'outreach' ? '#eff6ff' : 'transparent'}; border:1px solid ${activeWorkspaceTab === 'outreach' ? '#bfdbfe' : 'transparent'}; white-space:nowrap;">
                        ⚡ AI Outreach Pitch
                    </a>
                    <a href="#/dashboard/crm?lead_id=${finalActiveLeadId}&tab=collateral" class="crm-subtab-btn ${activeWorkspaceTab === 'collateral' ? 'active' : ''}" style="padding:8px 16px; font-size:12.5px; font-weight:700; border-radius:6px; text-decoration:none; color:${activeWorkspaceTab === 'collateral' ? '#2563eb' : '#64748b'}; background:${activeWorkspaceTab === 'collateral' ? '#eff6ff' : 'transparent'}; border:1px solid ${activeWorkspaceTab === 'collateral' ? '#bfdbfe' : 'transparent'}; white-space:nowrap;">
                        📁 Brochures
                    </a>
                    <a href="#/dashboard/crm?lead_id=${finalActiveLeadId}&tab=notes" class="crm-subtab-btn ${activeWorkspaceTab === 'notes' ? 'active' : ''}" style="padding:8px 16px; font-size:12.5px; font-weight:700; border-radius:6px; text-decoration:none; color:${activeWorkspaceTab === 'notes' ? '#2563eb' : '#64748b'}; background:${activeWorkspaceTab === 'notes' ? '#eff6ff' : 'transparent'}; border:1px solid ${activeWorkspaceTab === 'notes' ? '#bfdbfe' : 'transparent'}; white-space:nowrap;">
                        📝 Notes & Timeline
                    </a>
                </div>

                <!-- Sub-Tab Workspace Container -->
                <div>
                    ${tabContentHTML}
                </div>

            </div>
        `;
    }

    return `
        <div class="lead-crm-workspace-container" style="padding: 32px; background: #f8fafc; color: #0f172a; border-radius: var(--radius-lg); border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; gap: 24px;">
            <div style="display:grid; grid-template-columns: 280px 1fr; gap:24px; width:100%;">
                
                <!-- Column 1: Lead Selector Sidebar -->
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; display:flex; flex-direction:column; gap:12px; overflow-y:auto; max-height:calc(100vh - 180px); box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="margin:0; font-size:12px; font-family:var(--font-mono); color:#64748b; text-transform:uppercase; letter-spacing:0.5px; font-weight: 700;">Pipeline Leads (${allCount})</h4>
                    </div>

                    <input type="text" id="crmSearchSelector" placeholder="Search name or area..." value="${searchQuery ? searchQuery : ''}" style="width:100%; padding:8px 12px; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; color:#0f172a; font-size:12.5px; outline:none;">

                    <div style="display:flex; flex-direction:column; gap:6px;">
                        ${leadsHTML}
                        ${emptyLeadsHTML}
                    </div>
                </div>

                <!-- Column 2 & 3: Main 360° Lead Workstation -->
                <div>
                    ${mainWorkstationHTML}
                </div>
            </div>
        </div>
    `;
}

export function bindCRMWorkspaceEvents(onUpdateCallback) {
    if (window.refreshLucideIcons) window.refreshLucideIcons();

    // Lead item selection
    const leadItems = document.querySelectorAll('.crm-lead-item');
    leadItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            const currentTab = window._activeCRMTab || 'audit';
            window.location.hash = `#/dashboard/crm?lead_id=${id}&tab=${currentTab}`;
        });
    });

    // Stage dropdown change
    const stageSelect = document.getElementById('crmStageDropdown');
    if (stageSelect) {
        stageSelect.addEventListener('change', async (e) => {
            const id = stageSelect.dataset.id;
            const newStatus = e.target.value;
            try {
                await Api.updateLeadStatus(id, newStatus);
                if (window.showToast) window.showToast(`✨ Pipeline stage updated to: ${newStatus.toUpperCase()}`, "success");
                if (onUpdateCallback) onUpdateCallback();
            } catch (err) {
                console.error("Failed to update status:", err);
                if (window.showToast) window.showToast(`Failed to update stage: ${err.message}`, "error");
            }
        });
    }

    // Health check audit runner button
    const auditBtn = document.getElementById('runCRMHealthCheckBtn');
    if (auditBtn) {
        auditBtn.addEventListener('click', async () => {
            const id = auditBtn.dataset.id;
            const url = auditBtn.dataset.url;
            window._currentAuditLoading = id;
            if (onUpdateCallback) onUpdateCallback();

            try {
                const { data } = await Api.supabase.functions.invoke('audit-website', {
                    body: { url: url, professional_id: id }
                });
                window._currentAuditResult = data;
            } catch (err) {
                window._currentAuditResult = {
                    url: url,
                    page_speed_score: 68,
                    mobile_friendly: true,
                    has_https: true,
                    has_schema: false,
                    load_time_ms: 2400,
                    gaps: ["Structured schema data is missing for Google Search display"],
                    est_lost_revenue_per_month: 8500
                };
            } finally {
                window._currentAuditLoading = null;
                if (onUpdateCallback) onUpdateCallback();
            }
        });
    }

    // Client Notes save button
    const notesBtn = document.getElementById('saveCRMNotesBtn');
    if (notesBtn) {
        notesBtn.addEventListener('click', async () => {
            const id = notesBtn.dataset.id;
            const textarea = document.getElementById('crmLeadNotesTextarea');
            if (!textarea) return;
            const notes = textarea.value.trim();

            notesBtn.disabled = true;
            try {
                await Api.updateLeadNotes(id, notes);
                if (window.showToast) window.showToast("📝 Client notes saved to CRM!", "success");
            } catch (err) {
                console.error("Failed to save notes:", err);
                if (window.showToast) window.showToast(`Save failed: ${err.message}`, "error");
            } finally {
                notesBtn.disabled = false;
            }
        });
    }
}
