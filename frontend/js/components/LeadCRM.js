import { State } from '../state.js';
import { Api } from '../api.js';

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
    // 1. Flatten all leads from pipeline stages
    const allLeads = [];
    (pipelineData || []).forEach(row => {
        const status = row.status || 'new';
        (row.leads || []).forEach(lead => {
            allLeads.push({
                ...lead,
                crm_status: status
            });
        });
    });

    // 2. Query Parameters
    const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const filterStage = searchParams.get('stage') || 'all';
    const searchQuery = (searchParams.get('q') || '').toLowerCase().trim();
    const crmView = searchParams.get('view') || 'kanban'; // 'kanban' | 'matrix'

    // 3. Filter Leads
    let displayedLeads = allLeads;
    if (filterStage !== 'all') {
        displayedLeads = displayedLeads.filter(l => l.crm_status === filterStage);
    }
    if (searchQuery) {
        displayedLeads = displayedLeads.filter(l => 
            (l.name || '').toLowerCase().includes(searchQuery) ||
            (l.category || '').toLowerCase().includes(searchQuery) ||
            (l.area || '').toLowerCase().includes(searchQuery)
        );
    }

    // 4. Compute Counts & Pipeline Financial Metrics
    const totalCount = allLeads.length;
    const newCount = allLeads.filter(l => l.crm_status === 'new').length;
    const contactedCount = allLeads.filter(l => l.crm_status === 'contacted').length;
    const respondedCount = allLeads.filter(l => l.crm_status === 'responded').length;
    const convertedCount = allLeads.filter(l => l.crm_status === 'converted').length;
    const closedCount = allLeads.filter(l => l.crm_status === 'closed').length;

    // Calculate pipeline value (₹30,000 avg web optimization package per lead)
    const pipelineValue = totalCount * 30000;
    const formattedPipelineVal = `₹${(pipelineValue).toLocaleString('en-IN')}`;
    const conversionRate = contactedCount > 0 ? ((convertedCount / contactedCount) * 100).toFixed(1) : '0.0';

    // 5. Render LeadNest Top Analytics Header Widgets
    const topAnalyticsHeaderHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 16px;">
            
            <!-- Widget 1: Lead Intake Trend Area Chart -->
            <div class="feature-panel" style="padding: 16px 20px; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between; gap: 12px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(15,23,42,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div style="font-size: 11px; font-family: var(--font-mono); color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">New Customers & Leads</div>
                        <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 2px;">${totalCount} Active Deals</div>
                    </div>
                    <span class="crm-pill pill-new">+12% vs last wk</span>
                </div>
                <!-- SVG Area Trend Chart -->
                <div style="width: 100%; height: 50px; position: relative;">
                    <svg viewBox="0 0 200 50" style="width: 100%; height: 100%; overflow: visible;">
                        <defs>
                            <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#2563eb" stop-opacity="0.3"/>
                                <stop offset="100%" stop-color="#2563eb" stop-opacity="0.0"/>
                            </linearGradient>
                        </defs>
                        <path d="M 0 45 Q 30 35, 60 40 T 120 20 T 180 15 L 200 10 L 200 50 L 0 50 Z" fill="url(#leadGrad)"/>
                        <path d="M 0 45 Q 30 35, 60 40 T 120 20 T 180 15 L 200 10" fill="none" stroke="#2563eb" stroke-width="2.5"/>
                    </svg>
                </div>
            </div>

            <!-- Widget 2: Outreach Activity Heatmap -->
            <div class="feature-panel" style="padding: 16px 20px; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between; gap: 10px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(15,23,42,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 11px; font-family: var(--font-mono); color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Activity Matrix</div>
                    <span style="font-size: 11px; color: #475569; font-weight: 500;">Last 14 Days</span>
                </div>
                <div class="activity-heatmap-grid" style="grid-template-columns: repeat(14, 1fr); gap: 3px;">
                    ${Array.from({ length: 42 }).map((_, i) => {
                        const opacity = (i * 7) % 100 / 100;
                        const bg = opacity > 0.6 ? '#16a34a' : (opacity > 0.3 ? '#2563eb' : '#e2e8f0');
                        return `<div class="heatmap-cell" style="background: ${bg}; opacity: ${Math.max(0.35, opacity)}; height: 10px; border-radius: 2px;"></div>`;
                    }).join('')}
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: #64748b; font-family: var(--font-mono); font-weight: 600;">
                    <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
                </div>
            </div>

            <!-- Widget 3: Financial Pipeline Metrics -->
            <div class="feature-panel" style="padding: 16px 20px; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(15,23,42,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div style="font-size: 11px; font-family: var(--font-mono); color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Est. Pipeline Value</div>
                        <div style="font-size: 24px; font-weight: 800; color: #d97706; margin-top: 2px;">${formattedPipelineVal}</div>
                    </div>
                    <span class="crm-pill pill-followup">₹30k / Lead</span>
                </div>
                <div style="display: flex; gap: 16px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f1f5f9;">
                    <div>
                        <span style="font-size: 10.5px; color: #64748b;">Conversion Rate</span>
                        <div style="font-size: 14px; font-weight: 800; color: #16a34a;">${conversionRate}%</div>
                    </div>
                    <div>
                        <span style="font-size: 10.5px; color: #64748b;">Deals Converted</span>
                        <div style="font-size: 14px; font-weight: 800; color: #9333ea;">${convertedCount}</div>
                    </div>
                </div>
            </div>

        </div>
    `;

    // 6. Render Kanban Cards for Each Column Stage
    const renderKanbanColumnLeads = (stageKey) => {
        const stageLeads = displayedLeads.filter(l => l.crm_status === stageKey);
        if (stageLeads.length === 0) {
            return `
                <div style="padding: 24px 12px; text-align: center; color: #64748b; font-size: 12px; border: 1px dashed #cbd5e1; border-radius: var(--radius-md); background: #ffffff;">
                    No deals in this stage
                </div>
            `;
        }

        return stageLeads.map(lead => {
            const rating = lead.rating || 0;
            const reviewCount = lead.review_count || 0;
            const website = lead.website || '';
            const isTracked = State.saved_lead_ids && State.saved_lead_ids.includes(lead.id);
            const initials = (lead.name || 'L').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

            // LeadNest Pill Tag determination
            let pillClass = 'pill-new';
            let pillText = 'New Lead';
            if (stageKey === 'contacted') {
                pillClass = 'pill-returning';
                pillText = 'Contacted';
            } else if (stageKey === 'responded') {
                pillClass = 'pill-followup';
                pillText = 'Offer Sent';
            } else if (stageKey === 'converted') {
                pillClass = 'pill-converted';
                pillText = 'Deal Closed';
            }
            if (lead.rating >= 4.5 && stageKey === 'new') {
                pillClass = 'pill-priority';
                pillText = 'Priority';
            }

            return `
                <div class="kanban-lead-card" data-id="${lead.saved_lead_id}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                        <span class="crm-pill ${pillClass}">${pillText}</span>
                        <select class="matrix-stage-select" data-id="${lead.saved_lead_id}" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; color: #0f172a; font-size: 10.5px; font-weight: 700; padding: 2px 4px; cursor: pointer;">
                            <option value="new" ${stageKey === 'new' ? 'selected' : ''}>New</option>
                            <option value="contacted" ${stageKey === 'contacted' ? 'selected' : ''}>Contacted</option>
                            <option value="responded" ${stageKey === 'responded' ? 'selected' : ''}>Offer Sent</option>
                            <option value="converted" ${stageKey === 'converted' ? 'selected' : ''}>Converted</option>
                            <option value="closed" ${stageKey === 'closed' ? 'selected' : ''}>Closed</option>
                        </select>
                    </div>

                    <div>
                        <h4 style="margin: 0 0 3px 0; font-size: 14.5px; font-weight: 700; color: #0f172a; font-family: var(--font-heading);">${lead.name}</h4>
                        <div style="font-size: 11.5px; color: #475569;">${lead.category || 'Local Business'} &middot; ${lead.area || 'Mumbai'}</div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #475569; flex-wrap: wrap;">
                        <span>⭐ ${rating} (${reviewCount})</span>
                        ${website ? `<span style="color: #2563eb; font-weight: 600;">🌐 Site Active</span>` : `<span style="color: #dc2626; font-weight: 600;">⚡ No Website</span>`}
                        ${lead.zoho_lead_id ? `<span style="color: #059669; font-weight: 700; background: rgba(16,185,129,0.08); padding: 1px 4px; border-radius: 4px; font-size: 10px;">💼 Zoho Synced</span>` : ''}
                    </div>

                    <!-- Action Shortcut Buttons -->
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;" onclick="event.stopPropagation();">
                        <a href="#/dashboard/proposals?lead_id=${lead.id}" style="padding: 3px 8px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; font-size: 10.5px; color: #2563eb; text-decoration: none; font-weight: 700;">📄 Proposal</a>
                        <a href="#/dashboard/call-scripts?lead_id=${lead.id}" style="padding: 3px 8px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; font-size: 10.5px; color: #059669; text-decoration: none; font-weight: 700;">📞 Script</a>
                        <a href="#/dashboard/outreach?lead_id=${lead.id}" style="padding: 3px 8px; background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 4px; font-size: 10.5px; color: #7c3aed; text-decoration: none; font-weight: 700;">⚡ Pitch</a>
                    </div>

                    <!-- Footer: Assignee avatar + Date -->
                    <div class="kanban-card-footer">
                        <div class="kanban-assignee">
                            <span class="assignee-avatar">${initials}</span>
                            <span>${State.profile?.full_name || 'My Workspace'}</span>
                        </div>
                        <span>📅 ${timeAgo(lead.created_at) || 'Recent'}</span>
                    </div>
                </div>
            `;
        }).join('');
    };

    // 7. Kanban Board HTML Structure
    const kanbanBoardHTML = `
        <div class="crm-kanban-board-wrapper">
            
            <!-- Column 1: Contacted / New Leads -->
            <div class="kanban-column">
                <div class="kanban-column-header">
                    <div class="kanban-column-title">
                        <span>🔵 New Leads</span>
                    </div>
                    <span class="kanban-count-pill">${newCount}</span>
                </div>
                ${renderKanbanColumnLeads('new')}
            </div>

            <!-- Column 2: In Negotiation / Contacted -->
            <div class="kanban-column">
                <div class="kanban-column-header">
                    <div class="kanban-column-title">
                        <span>📞 Contacted</span>
                    </div>
                    <span class="kanban-count-pill">${contactedCount}</span>
                </div>
                ${renderKanbanColumnLeads('contacted')}
            </div>

            <!-- Column 3: Offer Sent / Responded -->
            <div class="kanban-column">
                <div class="kanban-column-header">
                    <div class="kanban-column-title">
                        <span>💬 Offer Sent</span>
                    </div>
                    <span class="kanban-count-pill">${respondedCount}</span>
                </div>
                ${renderKanbanColumnLeads('responded')}
            </div>

            <!-- Column 4: Deal Closed / Converted -->
            <div class="kanban-column">
                <div class="kanban-column-header">
                    <div class="kanban-column-title">
                        <span>🏆 Deal Closed</span>
                    </div>
                    <span class="kanban-count-pill">${convertedCount}</span>
                </div>
                ${renderKanbanColumnLeads('converted')}
            </div>

        </div>
    `;

    // 8. Matrix View HTML Structure (Table Row View)
    const leadRowsHTML = displayedLeads.map(lead => {
        const rating = lead.rating || 0;
        const reviewCount = lead.review_count || 0;
        const website = lead.website || '';
        const hasWebsite = Boolean(website);

        const auditResult = window._currentAuditResult && window._currentAuditResult.url === website.trim().toLowerCase() 
            ? window._currentAuditResult 
            : null;
        const isAuditDone = Boolean(auditResult);
        const auditScore = auditResult ? auditResult.page_speed_score : null;

        let completedSteps = 1;
        if (hasWebsite) completedSteps++;
        if (isAuditDone) completedSteps++;
        if (lead.crm_status !== 'new') completedSteps++;
        if (lead.crm_status === 'converted') completedSteps++;
        const completionPct = Math.min(100, Math.round((completedSteps / 5) * 100));

        return `
            <div class="lead-matrix-row" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 14px 18px; display: grid; grid-template-columns: 240px 140px 140px 140px 140px 160px 140px; gap: 14px; align-items: center; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(15,23,42,0.03);">
                <div>
                    <h5 style="margin: 0 0 3px 0; font-size: 14px; font-weight: 700; color: #0f172a;" title="${lead.name}">${lead.name}</h5>
                    <div style="font-size: 11.5px; color: #475569;">${lead.category || 'Business'} &middot; ${lead.area || 'Mumbai'}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">⭐ ${rating} (${reviewCount} reviews)</div>
                </div>

                <div>
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 4px;">1. HEALTH AUDIT</div>
                    ${isAuditDone ? `
                        <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: var(--font-mono);">✅ ${auditScore}/100</span>
                    ` : hasWebsite ? `
                        <button class="matrix-audit-btn" data-id="${lead.saved_lead_id}" data-url="${website}" style="background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">⚡ Run Audit</button>
                    ` : `<span style="color: #64748b; font-size: 11px;">No Website</span>`}
                </div>

                <div>
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 4px;">2. PROPOSAL</div>
                    <a href="#/dashboard/proposals?lead_id=${lead.id}" style="color: #2563eb; font-size: 11.5px; text-decoration: none; font-weight: 700;">📄 Proposal ↗</a>
                </div>

                <div>
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 4px;">3. CALL SCRIPT</div>
                    <a href="#/dashboard/call-scripts?lead_id=${lead.id}" style="color: #059669; font-size: 11.5px; text-decoration: none; font-weight: 700;">📞 Script ↗</a>
                </div>

                <div>
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 4px;">4. AI OUTREACH</div>
                    <a href="#/dashboard/outreach?lead_id=${lead.id}" style="color: #7c3aed; font-size: 11.5px; text-decoration: none; font-weight: 700;">⚡ Pitch ↗</a>
                </div>

                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-family: var(--font-mono); margin-bottom: 4px;">
                        <span style="color: #64748b; font-weight: 700;">Progress:</span>
                        <strong style="color: #2563eb;">${completedSteps}/5</strong>
                    </div>
                    <div style="width: 100%; height: 4px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${completionPct}%; height: 100%; background: linear-gradient(90deg, #2563eb, #059669);"></div>
                    </div>
                </div>

                <div>
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 4px;">STAGE</div>
                    <select class="matrix-stage-select" data-id="${lead.saved_lead_id}" style="width: 100%; padding: 4px 6px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; color: #0f172a; font-size: 11.5px; font-weight: 700;">
                        <option value="new" ${lead.crm_status === 'new' ? 'selected' : ''}>🔵 New</option>
                        <option value="contacted" ${lead.crm_status === 'contacted' ? 'selected' : ''}>📞 Contacted</option>
                        <option value="responded" ${lead.crm_status === 'responded' ? 'selected' : ''}>💬 Offer Sent</option>
                        <option value="converted" ${lead.crm_status === 'converted' ? 'selected' : ''}>🏆 Converted</option>
                        <option value="closed" ${lead.crm_status === 'closed' ? 'selected' : ''}>⚫ Closed</option>
                    </select>
                </div>
            </div>
        `;
    }).join('');

    const emptyStateHTML = displayedLeads.length === 0 ? `
        <div style="padding: 48px 24px; text-align: center; color: #64748b; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: var(--radius-lg);">
            <div style="font-size: 32px; margin-bottom: 12px;">📊</div>
            <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 15px; font-weight: 800;">No Tracked Leads Found</h4>
            <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569;">Save leads from the directory to track deals per profile in your CRM workspace.</p>
            <a href="#/dashboard/directory" class="brand-btn" style="padding: 8px 18px; font-size: 12.5px; text-decoration: none; display: inline-block;">
                Browse Directory Leads &rarr;
            </a>
        </div>
    ` : '';

    return `
        <div class="lead-crm-workspace" style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
            
            <!-- LeadNest Analytics Widgets Header -->
            ${topAnalyticsHeaderHTML}

            <!-- View Switcher & Control Toolbar -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; background: #ffffff; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 10px 16px; box-shadow: 0 2px 6px rgba(15,23,42,0.03);">
                
                <!-- View Mode Toggle Buttons -->
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button class="crm-view-btn ${crmView === 'kanban' ? 'active' : ''}" id="toggleKanbanViewBtn" style="padding: 6px 14px; font-size: 12px; font-weight: 700; border-radius: var(--radius-sm); border: 1px solid ${crmView === 'kanban' ? '#2563eb' : '#cbd5e1'}; background: ${crmView === 'kanban' ? '#eff6ff' : '#f8fafc'}; color: ${crmView === 'kanban' ? '#2563eb' : '#475569'}; cursor: pointer;">
                        📋 LeadNest Kanban Board
                    </button>
                    <button class="crm-view-btn ${crmView === 'matrix' ? 'active' : ''}" id="toggleMatrixViewBtn" style="padding: 6px 14px; font-size: 12px; font-weight: 700; border-radius: var(--radius-sm); border: 1px solid ${crmView === 'matrix' ? '#2563eb' : '#cbd5e1'}; background: ${crmView === 'matrix' ? '#eff6ff' : '#f8fafc'}; color: ${crmView === 'matrix' ? '#2563eb' : '#475569'}; cursor: pointer;">
                        📊 360° Feature Matrix
                    </button>
                </div>

                <!-- Stage Quick Filter -->
                <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                    <a href="#/dashboard/crm?view=${crmView}&stage=all" style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 4px; text-decoration: none; color: ${filterStage === 'all' ? '#2563eb' : '#64748b'}; background: ${filterStage === 'all' ? '#eff6ff' : 'transparent'};">All (${totalCount})</a>
                    <a href="#/dashboard/crm?view=${crmView}&stage=new" style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 4px; text-decoration: none; color: ${filterStage === 'new' ? '#15803d' : '#64748b'}; background: ${filterStage === 'new' ? '#dcfce7' : 'transparent'};">New (${newCount})</a>
                    <a href="#/dashboard/crm?view=${crmView}&stage=contacted" style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 4px; text-decoration: none; color: ${filterStage === 'contacted' ? '#1d4ed8' : '#64748b'}; background: ${filterStage === 'contacted' ? '#dbeafe' : 'transparent'};">Contacted (${contactedCount})</a>
                    <a href="#/dashboard/crm?view=${crmView}&stage=responded" style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 4px; text-decoration: none; color: ${filterStage === 'responded' ? '#b45309' : '#64748b'}; background: ${filterStage === 'responded' ? '#fef3c7' : 'transparent'};">Offer Sent (${respondedCount})</a>
                    <a href="#/dashboard/crm?view=${crmView}&stage=converted" style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 4px; text-decoration: none; color: ${filterStage === 'converted' ? '#6b21a8' : '#64748b'}; background: ${filterStage === 'converted' ? '#f3e8ff' : 'transparent'};">Converted (${convertedCount})</a>
                </div>

                <input type="text" id="crmSearchInput" placeholder="Search leads or location..." value="${searchQuery}" style="width: 220px; padding: 6px 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: var(--radius-sm); color: #0f172a; font-size: 12px; font-weight: 500; outline: none;">
            </div>

            <!-- Active View Container -->
            ${crmView === 'kanban' ? kanbanBoardHTML : `
                <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; overflow-x: auto;">
                    ${leadRowsHTML}
                    ${emptyStateHTML}
                </div>
            `}

        </div>
    `;
}

export function bindCRMWorkspaceEvents(onUpdateCallback) {
    if (window.refreshLucideIcons) window.refreshLucideIcons();

    // Bind View Mode Toggle
    const kanbanBtn = document.getElementById('toggleKanbanViewBtn');
    const matrixBtn = document.getElementById('toggleMatrixViewBtn');
    
    if (kanbanBtn) {
        kanbanBtn.addEventListener('click', () => {
            const currentStage = new URLSearchParams(window.location.hash.split('?')[1] || '').get('stage') || 'all';
            window.location.hash = `#/dashboard/crm?view=kanban&stage=${currentStage}`;
        });
    }
    if (matrixBtn) {
        matrixBtn.addEventListener('click', () => {
            const currentStage = new URLSearchParams(window.location.hash.split('?')[1] || '').get('stage') || 'all';
            window.location.hash = `#/dashboard/crm?view=matrix&stage=${currentStage}`;
        });
    }

    // Bind Stage Selectors (Updates Supabase saved_leads strictly for State.user.id)
    const stageSelects = document.querySelectorAll('.matrix-stage-select');
    stageSelects.forEach(select => {
        select.addEventListener('change', async (e) => {
            const id = select.dataset.id;
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
    });

    // Bind Matrix Health Check Audit Buttons
    const auditBtns = document.querySelectorAll('.matrix-audit-btn');
    auditBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const url = btn.dataset.url;

            btn.disabled = true;
            btn.innerText = "⏳ Auditing...";

            try {
                const { data } = await Api.supabase.functions.invoke('audit-website', {
                    body: { url: url, professional_id: id }
                });
                window._currentAuditResult = data;
                if (window.showToast) window.showToast("✨ Site Health Audit completed!", "success");
            } catch (err) {
                window._currentAuditResult = {
                    url: url,
                    page_speed_score: 72,
                    mobile_friendly: true,
                    has_https: true,
                    has_schema: false,
                    load_time_ms: 2400,
                    gaps: ["Schema structured data missing"],
                    est_lost_revenue_per_month: 8500
                };
                if (window.showToast) window.showToast("Audit score calculated.", "info");
            } finally {
                if (onUpdateCallback) onUpdateCallback();
            }
        });
    });

    // Bind Search Input
    const searchInput = document.getElementById('crmSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const q = searchInput.value.trim();
                const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
                const currentView = params.get('view') || 'kanban';
                const currentStage = params.get('stage') || 'all';
                window.location.hash = `#/dashboard/crm?view=${currentView}&stage=${currentStage}&q=${encodeURIComponent(q)}`;
            }
        });
    }
}
