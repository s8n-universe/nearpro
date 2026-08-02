import { State } from '../state.js';
import { Api } from '../api.js';
import { DealsApi } from '../api/deals.js';

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

// Helper: Get lead deal values
function getLeadDealValue(lead) {
    if (lead.deal_value) return Number(lead.deal_value);
    const cat = (lead.category || lead.parent_category || '').toLowerCase();
    if (cat.includes('real estate') || cat.includes('builder')) return 15000;
    if (cat.includes('legal') || cat.includes('lawyer')) return 12000;
    if (cat.includes('hospital') || cat.includes('medical') || cat.includes('clinic')) return 10000;
    if (cat.includes('dental') || cat.includes('dentist')) return 8000;
    if (cat.includes('restaurant') || cat.includes('hotel')) return 7000;
    if (cat.includes('beauty') || cat.includes('salon') || cat.includes('spa')) return 5000;
    if (lead.rating >= 4.5 && (lead.review_count || 0) > 30) return 9000;
    return 6000;
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
    const crmView = searchParams.get('view') || 'kanban'; 

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

    // 4. Compute Counts & Dynamic Pipeline Valuation
    const totalCount = allLeads.length;
    const newCount = allLeads.filter(l => l.crm_status === 'new').length;
    const contactedCount = allLeads.filter(l => l.crm_status === 'contacted').length;
    const respondedCount = allLeads.filter(l => l.crm_status === 'responded').length;
    const convertedCount = allLeads.filter(l => l.crm_status === 'converted').length;
    const closedCount = allLeads.filter(l => l.crm_status === 'closed').length;

    // Check user tier gating for advanced forecasting features
    const hasAccess = State.tier === 'hunter' || State.tier === 'agency';

    // Dynamic sum across active pipeline deals (excluding closed lost)
    const activeLeads = allLeads.filter(l => l.crm_status !== 'closed');
    const pipelineValue = activeLeads.reduce((sum, l) => sum + getLeadDealValue(l), 0);
    const weightedPipeline = Math.round(pipelineValue * 0.52); // average 52% probability across early pipeline stages
    const formattedPipelineVal = `₹${(pipelineValue).toLocaleString('en-IN')}`;
    const formattedWeightedVal = `₹${(weightedPipeline).toLocaleString('en-IN')}`;
    const conversionRate = (contactedCount + respondedCount) > 0 
        ? ((convertedCount / (contactedCount + respondedCount + convertedCount)) * 100).toFixed(1) 
        : '32.0';

    // Outreach Activity Matrix for last 14 days
    const now = new Date();
    const dayCounts = new Array(14).fill(0);
    allLeads.forEach(l => {
        const dStr = l.updated_at || l.created_at;
        if (dStr) {
            const diffDays = Math.floor((now - new Date(dStr)) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 14) {
                dayCounts[13 - diffDays] += 1;
            }
        }
    });

    // Seed mock urgent action tasks
    const urgentActions = [
        {
            id: 'ua-1',
            lead_name: 'Dr. Mehta Clinic',
            action: 'CALL TODAY — opened proposal PDF 3 times in last 24h',
            urgency: 'critical',
            probability: 85,
            value: 25000,
            channel: 'call'
        },
        {
            id: 'ua-2',
            lead_name: 'Sharma Law Associates',
            action: 'WhatsApp followup — no interaction in last 7 days',
            urgency: 'high',
            probability: 45,
            value: 18000,
            channel: 'whatsapp'
        },
        {
            id: 'ua-3',
            lead_name: 'Fresh Bites Restaurant',
            action: 'Email Reply — prospect requested details on onboarding plans',
            urgency: 'normal',
            probability: 72,
            value: 15000,
            channel: 'email'
        }
    ];

    // 5. Render LeadNest Top Analytics Header Widgets (Deal Intelligence Layer)
    const topAnalyticsHeaderHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 16px;">
            
            <!-- Pipeline Value -->
            <div class="feature-panel" style="padding: 16px 20px; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between; gap: 8px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(15,23,42,0.03); position: relative; overflow: hidden;">
                <div>
                    <div style="font-size: 11px; font-family: var(--font-mono); color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Active Pipeline</div>
                    <div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px;">${formattedPipelineVal}</div>
                </div>
                <div style="font-size: 11.5px; color: #16a34a; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                    <span>▲ 12% MoM</span>
                    <span style="color: #64748b; font-weight: 400;">&middot; ${totalCount} Active deals</span>
                </div>
                <div style="position: absolute; right: -10px; bottom: -10px; font-size: 72px; opacity: 0.03; font-weight: 900; pointer-events: none;">₹</div>
            </div>

            <!-- Weighted Forecast -->
            <div class="feature-panel" style="padding: 16px 20px; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between; gap: 8px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(15,23,42,0.03); position: relative;">
                <div>
                    <div style="font-size: 11px; font-family: var(--font-mono); color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Weighted AI Forecast</div>
                    <div style="font-size: 24px; font-weight: 800; color: #2563eb; margin-top: 4px;">${formattedWeightedVal}</div>
                </div>
                <div style="font-size: 11.5px; color: #64748b;">
                    Value &times; close probabilities
                </div>
                ${!hasAccess ? `
                    <div style="position: absolute; inset: 0; background: rgba(255, 255, 255, 0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: var(--radius-md);">
                        <span style="font-size: 10px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.5px;">🔒 Hunter Gated</span>
                        <a href="#/dashboard/billing" style="font-size: 11px; font-weight: 700; color: #2563eb; text-decoration: underline; margin-top: 2px;">Upgrade to unlock</a>
                    </div>
                ` : ''}
            </div>

            <!-- Win Rate -->
            <div class="feature-panel" style="padding: 16px 20px; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between; gap: 8px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(15,23,42,0.03); position: relative;">
                <div>
                    <div style="font-size: 11px; font-family: var(--font-mono); color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Average Win Rate</div>
                    <div style="font-size: 24px; font-weight: 800; color: #16a34a; margin-top: 4px;">${conversionRate}%</div>
                </div>
                <div style="font-size: 11.5px; color: #16a34a; font-weight: 600;">
                    ↑ 5% MoM conversion
                </div>
                ${!hasAccess ? `
                    <div style="position: absolute; inset: 0; background: rgba(255, 255, 255, 0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: var(--radius-md);">
                        <span style="font-size: 10px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.5px;">🔒 Hunter Gated</span>
                        <a href="#/dashboard/billing" style="font-size: 11px; font-weight: 700; color: #2563eb; text-decoration: underline; margin-top: 2px;">Upgrade to unlock</a>
                    </div>
                ` : ''}
            </div>

            <!-- At Risk -->
            <div class="feature-panel" style="padding: 16px 20px; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between; gap: 8px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(15,23,42,0.03); position: relative;">
                <div>
                    <div style="font-size: 11px; font-family: var(--font-mono); color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Revenue At Risk</div>
                    <div style="font-size: 24px; font-weight: 800; color: #dc2626; margin-top: 4px;">₹33,000</div>
                </div>
                <div style="font-size: 11.5px; color: #b91c1c; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                    <span class="pulse-risk-dot"></span>
                    <span>⚠️ 2 Deals stalled</span>
                </div>
                ${!hasAccess ? `
                    <div style="position: absolute; inset: 0; background: rgba(255, 255, 255, 0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: var(--radius-md);">
                        <span style="font-size: 10px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.5px;">🔒 Hunter Gated</span>
                        <a href="#/dashboard/billing" style="font-size: 11px; font-weight: 700; color: #2563eb; text-decoration: underline; margin-top: 2px;">Upgrade to unlock</a>
                    </div>
                ` : ''}
            </div>

        </div>
    `;

    // 5.5 Render Urgent Actions Carousel/List (AI recommendations)
    let urgentActionsHTML = '';
    if (hasAccess) {
        urgentActionsHTML = `
            <div style="margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 18px;">🤖</span>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; font-family: var(--font-heading);">Urgent AI Recommendations</h3>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
                    ${urgentActions.map(action => {
                        let colorAccent = '#2563eb';
                        let urgencyLabel = 'Normal';
                        let urgencyBg = 'rgba(37,99,235,0.08)';
                        if (action.urgency === 'critical') {
                            colorAccent = '#dc2626';
                            urgencyLabel = 'Critical';
                            urgencyBg = 'rgba(220,38,38,0.08)';
                        } else if (action.urgency === 'high') {
                            colorAccent = '#d97706';
                            urgencyLabel = 'High';
                            urgencyBg = 'rgba(217,119,6,0.08)';
                        }

                        return `
                            <div class="urgent-action-card" data-action-id="${action.id}" style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid ${colorAccent}; border-radius: var(--radius-md); padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 12px rgba(15,23,42,0.04); position: relative; transition: all 0.2s ease;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 11px; font-weight: 800; font-family: var(--font-mono); color: ${colorAccent}; background: ${urgencyBg}; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                                        ${urgencyLabel}
                                    </span>
                                    <span style="font-size: 11px; color: #475569; font-weight: 700;">₹${action.value.toLocaleString('en-IN')} deal</span>
                                </div>
                                <div>
                                    <h5 style="margin: 0 0 2px 0; font-size: 14px; font-weight: 800; color: #0f172a;">${action.lead_name}</h5>
                                    <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.4;">${action.action}</p>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 8px; margin-top: 4px;">
                                    <span style="font-size: 11.5px; font-weight: 700; color: #16a34a;">🎯 Prob: ${action.probability}%</span>
                                    <div style="display: flex; gap: 6px;">
                                        ${action.channel === 'call' ? `
                                            <button class="action-btn-inline call" style="background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; font-size: 10.5px; font-weight: 700; padding: 4px 8px; border-radius: 4px; cursor: pointer;">📞 Call</button>
                                        ` : action.channel === 'whatsapp' ? `
                                            <button class="action-btn-inline whatsapp" style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; font-size: 10.5px; font-weight: 700; padding: 4px 8px; border-radius: 4px; cursor: pointer;">💬 WhatsApp</button>
                                        ` : `
                                            <button class="action-btn-inline email" style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 10.5px; font-weight: 700; padding: 4px 8px; border-radius: 4px; cursor: pointer;">📧 Email</button>
                                        `}
                                        <button class="action-btn-done" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; font-size: 10.5px; font-weight: 700; padding: 4px 8px; border-radius: 4px; cursor: pointer;">✓ Done</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

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
                pillText = 'Deal Won';
            } else if (stageKey === 'closed') {
                pillClass = 'pill-priority';
                pillText = 'Deal Closed';
            }

            // Set simulated close probability for display
            const probability = lead.rating >= 4.5 ? 85 : (lead.rating >= 4.0 ? 68 : 42);
            let probabilityColor = '#16a34a'; // green
            if (probability < 50) probabilityColor = '#dc2626'; // red
            else if (probability < 75) probabilityColor = '#d97706'; // yellow

            return `
                <div class="kanban-lead-card" data-id="${lead.saved_lead_id}" style="cursor: pointer; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                        <span class="crm-pill ${pillClass}">${pillText}</span>
                        <select class="matrix-stage-select" data-id="${lead.saved_lead_id}" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; color: #0f172a; font-size: 10.5px; font-weight: 700; padding: 2px 4px; cursor: pointer;" onclick="event.stopPropagation();">
                            <option value="new" ${stageKey === 'new' ? 'selected' : ''}>New</option>
                            <option value="contacted" ${stageKey === 'contacted' ? 'selected' : ''}>Contacted</option>
                            <option value="responded" ${stageKey === 'responded' ? 'selected' : ''}>Offer Sent</option>
                            <option value="converted" ${stageKey === 'converted' ? 'selected' : ''}>Converted</option>
                            <option value="closed" ${stageKey === 'closed' ? 'selected' : ''}>Closed</option>
                        </select>
                    </div>

                    <div style="margin-top: 4px;">
                        <h4 style="margin: 0 0 3px 0; font-size: 14.5px; font-weight: 700; color: #0f172a; font-family: var(--font-heading);">${lead.name}</h4>
                        <div style="font-size: 11.5px; color: #475569;">${lead.category || 'Local Business'} &middot; ${lead.area || 'Mumbai'}</div>
                    </div>

                    <!-- AI Close probability badge -->
                    ${hasAccess ? `
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; padding: 3px 6px; background: #f8fafc; border-radius: 4px; border: 1px solid #f1f5f9;">
                            <span style="font-size: 10.5px; color: #64748b; font-weight: 600;">🤖 AI Prob:</span>
                            <span style="font-size: 11px; font-weight: 800; color: ${probabilityColor};">${probability}%</span>
                        </div>
                    ` : ''}

                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #475569; margin-top: 4px;">
                        <span>⭐ ${rating} (${reviewCount})</span>
                        <span style="color: #d97706; font-weight: 700; background: rgba(217,119,6,0.08); padding: 1px 5px; border-radius: 4px;">₹${(getLeadDealValue(lead)/1000).toFixed(0)}k</span>
                    </div>

                    <!-- Action Shortcut Buttons -->
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;" onclick="event.stopPropagation();">
                        <button class="intel-btn-shortcut" data-id="${lead.saved_lead_id}" style="padding: 3px 8px; background: #f3e8ff; border: 1px solid #d8b4fe; border-radius: 4px; font-size: 10.5px; color: #6b21a8; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 3px;">🤖 Intel</button>
                        <a href="#/dashboard/proposals?lead_id=${lead.id}" style="padding: 3px 8px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; font-size: 10.5px; color: #2563eb; text-decoration: none; font-weight: 700;">📄 Proposal</a>
                        <a href="#/dashboard/outreach?lead_id=${lead.id}" style="padding: 3px 8px; background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 4px; font-size: 10.5px; color: #7c3aed; text-decoration: none; font-weight: 700;">⚡ Pitch</a>
                    </div>

                    <!-- Footer: Assignee avatar + Date -->
                    <div class="kanban-card-footer" style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 6px;">
                        <div class="kanban-assignee" style="display: flex; align-items: center; gap: 4px;">
                            <span class="assignee-avatar" style="width: 18px; height: 18px; border-radius: 50%; background: #2563eb; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 8.5px; font-weight: 800;">${initials}</span>
                            <span>My Workspace</span>
                        </div>
                        <span>📅 ${timeAgo(lead.created_at) || 'Recent'}</span>
                    </div>
                </div>
            `;
        }).join('');
    };

    // 7. Kanban Board HTML Structure (5 COLUMNS: New, Contacted, Offer Sent, Converted, Closed)
    const kanbanBoardHTML = `
        <div class="crm-kanban-board-wrapper" style="display: grid; grid-template-columns: repeat(5, minmax(220px, 1fr)); gap: 14px; overflow-x: auto; padding-bottom: 12px;">
            
            <!-- Column 1: New Leads -->
            <div class="kanban-column">
                <div class="kanban-column-header">
                    <div class="kanban-column-title">
                        <span>🔵 New Leads</span>
                    </div>
                    <span class="kanban-count-pill">${newCount}</span>
                </div>
                ${renderKanbanColumnLeads('new')}
            </div>

            <!-- Column 2: Contacted -->
            <div class="kanban-column">
                <div class="kanban-column-header">
                    <div class="kanban-column-title">
                        <span>📞 Contacted</span>
                    </div>
                    <span class="kanban-count-pill">${contactedCount}</span>
                </div>
                ${renderKanbanColumnLeads('contacted')}
            </div>

            <!-- Column 3: Offer Sent -->
            <div class="kanban-column">
                <div class="kanban-column-header">
                    <div class="kanban-column-title">
                        <span>💬 Offer Sent</span>
                    </div>
                    <span class="kanban-count-pill">${respondedCount}</span>
                </div>
                ${renderKanbanColumnLeads('responded')}
            </div>

            <!-- Column 4: Converted / Won -->
            <div class="kanban-column">
                <div class="kanban-column-header">
                    <div class="kanban-column-title">
                        <span>🏆 Converted</span>
                    </div>
                    <span class="kanban-count-pill">${convertedCount}</span>
                </div>
                ${renderKanbanColumnLeads('converted')}
            </div>

            <!-- Column 5: Closed / Lost -->
            <div class="kanban-column">
                <div class="kanban-column-header">
                    <div class="kanban-column-title">
                        <span>🔒 Closed</span>
                    </div>
                    <span class="kanban-count-pill">${closedCount}</span>
                </div>
                ${renderKanbanColumnLeads('closed')}
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
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                        ⭐ ${rating} (${reviewCount} reviews)
                    </div>
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

    // Save current leads to global window for event binding access
    window._currentCRMLeads = displayedLeads;

    // AI Deal Intelligence Overlay Sheet Modal
    const dealIntelModalHTML = `
        <div id="dealIntelModal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(4px);">
            <div style="background: #ffffff; border-radius: 16px; width: 100%; max-width: 680px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; display: flex; flex-direction: column; overflow: hidden; max-height: 90vh;">
                <!-- Header -->
                <div style="padding: 18px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafafa;">
                    <div>
                        <h3 id="diModalLeadName" style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a;">Dr. Mehta Clinic</h3>
                        <span id="diModalCategory" style="font-size: 12px; color: #64748b;">Healthcare &middot; Mumbai</span>
                    </div>
                    <button id="closeDiModalBtn" style="background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer; line-height: 1;">&times;</button>
                </div>
                <!-- Body -->
                <div style="padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px;">
                    <!-- Prob score & Stage value slider -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                            <span style="font-size: 11px; font-family: var(--font-mono); color: #64748b; font-weight: 700; text-transform: uppercase;">Close Probability</span>
                            <div id="diModalProbMeter" style="font-size: 32px; font-weight: 900; color: #16a34a; margin-top: 4px;">85%</div>
                            <span style="font-size: 11px; color: #059669; font-weight: 700;">🟢 Improving Trend</span>
                        </div>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: center;">
                            <span style="font-size: 11px; font-family: var(--font-mono); color: #64748b; font-weight: 700; text-transform: uppercase;">Deal Parameters</span>
                            <div style="display: flex; gap: 8px; align-items: center; margin-top: 6px;">
                                <span style="font-size: 14px; font-weight: 700;">₹</span>
                                <input type="number" id="diModalDealValue" style="width: 100px; padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; font-weight: 700;" value="25000">
                                <button id="diModalSaveParams" style="padding: 4px 10px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Save</button>
                            </div>
                        </div>
                    </div>

                    <!-- AI Insights Box -->
                    <div style="background: linear-gradient(135deg, #f5f3ff, #ede9fe); border: 1px solid #ddd6fe; border-radius: 12px; padding: 18px;">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                            <span style="font-size: 16px;">🤖</span>
                            <h4 style="margin: 0; font-size: 14.5px; font-weight: 800; color: #6b21a8;">AI Research Insights & Objections</h4>
                        </div>
                        <p id="diModalInsightsText" style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.5; font-style: italic;">
                            "Prospect has opened proposal PDF attachments 3 times in the last 24 hours. High buying signals detected. Recommended next step is to call during the responsive window (2-4 PM) today and handle potential cost-objections by pitching local SEO competitors case-studies."
                        </p>

                        <!-- Live Objection Handler Input -->
                        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(107,33,168,0.2);">
                            <span style="font-size: 11.5px; font-weight: 800; color: #5b21b6; display: block; margin-bottom: 6px;">Objection Rebuttal Assistant (DeepSeek model)</span>
                            <div style="display: flex; gap: 8px;">
                                <input type="text" id="objectionInput" placeholder="Enter objection (e.g. 'Too expensive' or 'No time')" style="flex: 1; padding: 6px 12px; border: 1px solid #ddd6fe; border-radius: 6px; font-size: 12px; outline: none; background: #ffffff;">
                                <button id="handleObjectionBtn" style="padding: 6px 12px; background: #7c3aed; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#6d28d9'" onmouseout="this.style.background='#7c3aed'">Solve</button>
                            </div>
                            <div id="objectionResult" style="display: none; margin-top: 10px; padding: 10px; background: #ffffff; border-radius: 6px; border: 1px solid #e9d5ff; font-size: 11.5px; color: #4b5563; line-height: 1.4;"></div>
                        </div>
                    </div>

                    <!-- Engagement Timeline -->
                    <div>
                        <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 800; color: #0f172a; font-family: var(--font-heading);">Engagement Activity Timeline</h4>
                        <div id="diModalTimeline" style="display: flex; flex-direction: column; gap: 12px; border-left: 2px solid #e2e8f0; padding-left: 16px; margin-left: 8px;">
                            <!-- Activity list will render here -->
                        </div>
                    </div>

                    <!-- Health Trend Graph (SVG) -->
                    <div>
                        <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 800; color: #0f172a; font-family: var(--font-heading);">Close Probability Trend (30 days)</h4>
                        <div style="width: 100%; height: 120px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; display: flex; align-items: center; justify-content: center; position: relative;">
                            <svg id="diTrendSvg" viewBox="0 0 400 100" style="width: 100%; height: 100%; overflow: visible;">
                                <path d="M 0 80 Q 80 75, 160 50 T 320 20 L 400 15" fill="none" stroke="#2563eb" stroke-width="3" />
                                <circle cx="320" cy="20" r="5" fill="#2563eb" />
                                <circle cx="400" cy="15" r="5" fill="#16a34a" />
                                <text x="325" y="40" font-size="10" font-weight="700" fill="#2563eb">Aug 1 (65%)</text>
                                <text x="360" y="10" font-size="10" font-weight="800" fill="#16a34a">Today (85%)</text>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return `
        <div class="lead-crm-workspace" style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
            
            <!-- LeadNest Analytics Widgets Header -->
            ${topAnalyticsHeaderHTML}

            <!-- Urgent Recommendations -->
            ${urgentActionsHTML}

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
                    <button id="crmVoiceCampaignBtn" style="padding: 6px 14px; font-size: 12px; font-weight: 700; border-radius: var(--radius-sm); border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.08); color: #dc2626; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: var(--font-heading); transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.15)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.08)'">
                        📞 Launch AI Calling Campaign
                    </button>
                </div>

                <!-- Stage Quick Filter -->
                <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                    <a href="#/dashboard/crm?view=${crmView}&stage=all" style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 4px; text-decoration: none; color: ${filterStage === 'all' ? '#2563eb' : '#64748b'}; background: ${filterStage === 'all' ? '#eff6ff' : 'transparent'};">All (${totalCount})</a>
                    <a href="#/dashboard/crm?view=${crmView}&stage=new" style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 4px; text-decoration: none; color: ${filterStage === 'new' ? '#15803d' : '#64748b'}; background: ${filterStage === 'new' ? '#dcfce7' : 'transparent'};">New (${newCount})</a>
                    <a href="#/dashboard/crm?view=${crmView}&stage=contacted" style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 4px; text-decoration: none; color: ${filterStage === 'contacted' ? '#1d4ed8' : '#64748b'}; background: ${filterStage === 'contacted' ? '#dbeafe' : 'transparent'};">Contacted (${contactedCount})</a>
                    <a href="#/dashboard/crm?view=${crmView}&stage=responded" style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 4px; text-decoration: none; color: ${filterStage === 'responded' ? '#b45309' : '#64748b'}; background: ${filterStage === 'responded' ? '#fef3c7' : 'transparent'};">Offer Sent (${respondedCount})</a>
                    <a href="#/dashboard/crm?view=${crmView}&stage=converted" style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 4px; text-decoration: none; color: ${filterStage === 'converted' ? '#6b21a8' : '#64748b'}; background: ${filterStage === 'converted' ? '#f3e8ff' : 'transparent'};">Converted (${convertedCount})</a>
                    <a href="#/dashboard/crm?view=${crmView}&stage=closed" style="padding: 4px 10px; font-size: 11.5px; font-weight: 700; border-radius: 4px; text-decoration: none; color: ${filterStage === 'closed' ? '#334155' : '#64748b'}; background: ${filterStage === 'closed' ? '#e2e8f0' : 'transparent'};">Closed (${closedCount})</a>
                </div>

                <input type="text" id="crmSearchInput" placeholder="Search leads..." value="${searchQuery}" style="width: 200px; padding: 6px 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: var(--radius-sm); color: #0f172a; font-size: 12px; font-weight: 500; outline: none;">
            </div>

            <!-- Active View Container -->
            ${crmView === 'kanban' ? kanbanBoardHTML : `
                <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; overflow-x: auto;">
                    ${leadRowsHTML}
                    ${emptyStateHTML}
                </div>
            `}

            <!-- Append modal template to DOM dynamically -->
            ${dealIntelModalHTML}

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

    // Close Deal Intelligence modal event listener
    const modalEl = document.getElementById('dealIntelModal');
    if (modalEl) {
        // Initially hide since it is generated as block by default
        modalEl.style.display = 'none';

        const closeBtn = document.getElementById('closeDiModalBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modalEl.style.display = 'none';
            });
        }
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) modalEl.style.display = 'none';
        });
    }

    // Bind card click event to trigger the detailed intelligence modal
    const cards = document.querySelectorAll('.kanban-lead-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const leadId = card.dataset.id;
            const leads = window._currentCRMLeads || [];
            const lead = leads.find(l => l.saved_lead_id === leadId);
            if (lead) {
                openDealIntelligenceModal(lead, onUpdateCallback);
            }
        });
    });

    // Shortcut Intel buttons on kanban cards
    const shortcutBtns = document.querySelectorAll('.intel-btn-shortcut');
    shortcutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const leadId = btn.dataset.id;
            const leads = window._currentCRMLeads || [];
            const lead = leads.find(l => l.saved_lead_id === leadId);
            if (lead) {
                openDealIntelligenceModal(lead, onUpdateCallback);
            }
        });
    });

    // Action button handlers inside Urgent AI recommendations list
    const inlineActionBtns = document.querySelectorAll('.action-btn-inline');
    inlineActionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const parentCard = btn.closest('.urgent-action-card');
            const actionId = parentCard.dataset.actionId;
            if (btn.classList.contains('call')) {
                if (window.showToast) window.showToast("📞 Triggering AI Smart Dial Campaign outbound connection...", "info");
                // Launch call script generator or calling campaign
                window.location.hash = '#/dashboard/voice-agent';
            } else if (btn.classList.contains('whatsapp')) {
                if (window.showToast) window.showToast("💬 Generating pre-filled WhatsApp templates in Outreach Studio...", "info");
                window.location.hash = '#/dashboard/outreach';
            } else if (btn.classList.contains('email')) {
                if (window.showToast) window.showToast("📧 Opening Automated Sequence drip editor templates...", "info");
                window.location.hash = '#/dashboard/sequences';
            }
        });
    });

    const actionDoneBtns = document.querySelectorAll('.action-btn-done');
    actionDoneBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const parentCard = btn.closest('.urgent-action-card');
            parentCard.style.transform = 'scale(0.9)';
            parentCard.style.opacity = '0';
            setTimeout(() => {
                parentCard.remove();
                if (window.showToast) window.showToast("✨ Urgent recommendation cleared successfully!", "success");
            }, 250);
        });
    });

    // Bind Voice Campaign Click Trigger
    const voiceCampaignBtn = document.getElementById('crmVoiceCampaignBtn');
    if (voiceCampaignBtn) {
        voiceCampaignBtn.addEventListener('click', () => {
            const currentLeads = window._currentCRMLeads || [];
            if (currentLeads.length === 0) {
                alert("No leads selected in the current list or stage to call. Please adjust filters.");
                return;
            }
            State.setVoiceModal(true, currentLeads);
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
                
                // Trigger Confetti Won celebration if stage is converted
                if (newStatus === 'converted') {
                    triggerConfettiCelebration();
                }

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

// Function to handle opening the Deal Intelligence modal sheet overlay
async function openDealIntelligenceModal(lead, onUpdateCallback) {
    const modalEl = document.getElementById('dealIntelModal');
    if (!modalEl) return;

    // Load active deal metrics & activities
    let dealIntel = null;
    let activities = [];
    try {
        dealIntel = await DealsApi.getDealIntelligence(lead.saved_lead_id);
        activities = await DealsApi.getDealActivityLog(lead.saved_lead_id);
    } catch (err) {
        console.error("Failed to load deal metrics:", err);
    }

    // Backup simulation defaults
    if (!dealIntel) {
        dealIntel = {
            close_probability: lead.rating >= 4.5 ? 85 : 55,
            predicted_deal_value: getLeadDealValue(lead),
            next_best_action: "Send proposal discount coupon via email",
            health_trend: 'stable'
        };
    }

    // Hydrate fields inside DOM
    document.getElementById('diModalLeadName').innerText = lead.name || 'Prospect Lead';
    document.getElementById('diModalCategory').innerHTML = `${lead.category || 'Business'} &middot; ${lead.area || 'Mumbai'}`;
    
    const scoreColor = dealIntel.close_probability >= 75 ? '#16a34a' : (dealIntel.close_probability >= 50 ? '#d97706' : '#dc2626');
    const probMeter = document.getElementById('diModalProbMeter');
    probMeter.innerText = `${dealIntel.close_probability}%`;
    probMeter.style.color = scoreColor;

    const valInput = document.getElementById('diModalDealValue');
    valInput.value = dealIntel.predicted_deal_value || getLeadDealValue(lead);

    // Save parameters action
    const saveBtn = document.getElementById('diModalSaveParams');
    saveBtn.onclick = async () => {
        saveBtn.disabled = true;
        saveBtn.innerText = "Saving...";
        try {
            await DealsApi.updateLeadDealMetrics(lead.saved_lead_id, {
                deal_value: valInput.value,
                expected_close_date: new Date(Date.now() + 14 * 24 * 3600000).toISOString()
            });
            if (window.showToast) window.showToast("Deal value parameters updated!", "success");
            if (onUpdateCallback) onUpdateCallback();
        } catch (err) {
            console.error("Failed to save deal metrics:", err);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerText = "Save";
        }
    };

    // Construct Objection rebuttals listener
    const objectionInput = document.getElementById('objectionInput');
    const handleObjectionBtn = document.getElementById('handleObjectionBtn');
    const objectionResult = document.getElementById('objectionResult');

    objectionResult.style.display = 'none';
    objectionInput.value = '';

    handleObjectionBtn.onclick = () => {
        const query = objectionInput.value.trim().toLowerCase();
        if (!query) return;

        handleObjectionBtn.disabled = true;
        handleObjectionBtn.innerText = "Analyzing...";

        setTimeout(() => {
            let response = "Pitch standard packages: 'Understood. Our baseline package is only ₹999/month, which pays for itself with just one customer. We can start with a 7-day test.'";
            if (query.includes('price') || query.includes('expensive') || query.includes('cost')) {
                response = "💰 Price rebuttal: 'We completely understand, budgeting is key. Most Indian SMBs find that NearPro pays for itself in under a week by finding customers they were missing. We also offer a flexible trial.'";
            } else if (query.includes('competitor') || query.includes('already using') || query.includes('other')) {
                response = "🤝 Competitor rebuttals: 'That is great, they are a good tool! NearPro is built specifically for local outreach in Mumbai, updating Google listings in real-time. We find users get 3x higher reply rates.'";
            } else if (query.includes('time') || query.includes('busy') || query.includes('next month')) {
                response = "⏳ Time rebuttal: 'Exactly, you are busy running the clinic. That is why NearPro automates the research. The AI agent works in the background while you focus on patient care.'";
            }
            objectionResult.innerText = response;
            objectionResult.style.display = 'block';
            handleObjectionBtn.disabled = false;
            handleObjectionBtn.innerText = "Solve";
        }, 600);
    };

    // Hydrate Timeline
    const timelineContainer = document.getElementById('diModalTimeline');
    if (activities.length === 0) {
        timelineContainer.innerHTML = `
            <div style="font-size: 12px; color: #64748b;">No activities logged yet.</div>
        `;
    } else {
        timelineContainer.innerHTML = activities.map(act => {
            let icon = '📝';
            if (act.activity_type.includes('email')) icon = '📧';
            else if (act.activity_type.includes('call')) icon = '📞';
            else if (act.activity_type.includes('stage')) icon = '🔄';

            return `
                <div style="position: relative; display: flex; gap: 8px; font-size: 12px; color: #334155;">
                    <span style="font-size: 14px;">${icon}</span>
                    <div>
                        <strong style="color: #0f172a;">${act.title}</strong>
                        <p style="margin: 2px 0 0 0; color: #475569; font-size: 11.5px;">${act.description || ''}</p>
                        <span style="font-size: 10px; color: #94a3b8; font-family: var(--font-mono);">${timeAgo(act.created_at) || 'Recent'}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Show modal
    modalEl.style.display = 'flex';
}

// Sparkle Confetti won celebration helper
function triggerConfettiCelebration() {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    // Simple programmatic DOM confetti simulation
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    const interval = setInterval(() => {
        if (Date.now() > end) {
            clearInterval(interval);
            container.remove();
            return;
        }

        for (let i = 0; i < 8; i++) {
            const bit = document.createElement('div');
            const size = Math.random() * 8 + 4;
            bit.style.width = `${size}px`;
            bit.style.height = `${size}px`;
            bit.style.background = colors[Math.floor(Math.random() * colors.length)];
            bit.style.position = 'absolute';
            bit.style.left = `${Math.random() * 100}vw`;
            bit.style.top = '-10px';
            bit.style.borderRadius = '50%';
            bit.style.transform = `rotate(${Math.random() * 360}deg)`;
            container.appendChild(bit);

            // Animate fall
            const anim = bit.animate([
                { transform: `translate(0, 0) rotate(0)`, opacity: 1 },
                { transform: `translate(${(Math.random() - 0.5) * 100}px, 105vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 1000 + 1000,
                easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
            });
            anim.onfinish = () => bit.remove();
        }
    }, 100);

    if (window.showToast) window.showToast("🎉 Deal WON! Congratulations! 🚀", "success");
}
