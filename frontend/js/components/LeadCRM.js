import { State } from '../state.js';
import { Api } from '../api.js';

export function renderLeadCRM(pipelineData, stats) {
    // Pipeline statuses mapping
    const columns = [
        { id: 'new', title: 'New Leads', color: '#3b82f6' },
        { id: 'contacted', title: 'Contacted', color: '#eab308' },
        { id: 'responded', title: 'Responded', color: '#06b6d4' },
        { id: 'converted', title: 'Converted', color: '#10b981' },
        { id: 'closed', title: 'Closed', color: '#6b7280' }
    ];

    // Map pipeline data by status
    const leadsByStatus = {
        new: [],
        contacted: [],
        responded: [],
        converted: [],
        closed: []
    };

    pipelineData.forEach(row => {
        const status = row.status || 'new';
        if (leadsByStatus[status]) {
            leadsByStatus[status] = row.leads || [];
        }
    });

    // Check for follow ups due today or overdue
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const dueTodayLeads = [];
    
    pipelineData.forEach(row => {
        (row.leads || []).forEach(lead => {
            if (lead.follow_up_due_at) {
                const dueDate = lead.follow_up_due_at.slice(0, 10);
                if (dueDate <= todayStr) {
                    dueTodayLeads.push(lead);
                }
            }
        });
    });

    // Render Stats Row
    const totalCount = stats.saved_leads_total || 0;
    const contactedCount = stats.contacted_count || 0;
    const convertedCount = stats.converted_count || 0;
    const convRate = stats.conversion_rate || 0;

    const statsHTML = `
        <div class="crm-stats-row">
            <div class="crm-stat-card">
                <span class="crm-stat-value">${totalCount}</span>
                <span class="crm-stat-label">Total Tracked</span>
            </div>
            <div class="crm-stat-card">
                <span class="crm-stat-value">${contactedCount}</span>
                <span class="crm-stat-label">Contacted</span>
            </div>
            <div class="crm-stat-card">
                <span class="crm-stat-value">${convertedCount}</span>
                <span class="crm-stat-label">Converted</span>
            </div>
            <div class="crm-stat-card">
                <span class="crm-stat-value">${convRate}%</span>
                <span class="crm-stat-label">Conversion Rate</span>
            </div>
        </div>
    `;

    // Render Due Today Section
    let dueTodayHTML = '';
    if (dueTodayLeads.length > 0) {
        const itemsHTML = dueTodayLeads.map(lead => {
            const dateObj = new Date(lead.follow_up_due_at);
            const formattedDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            const isOverdue = lead.follow_up_due_at.slice(0, 10) < todayStr;
            const badgeClass = isOverdue ? 'overdue' : 'today';
            const label = isOverdue ? 'Overdue' : 'Due Today';

            return `
                <div class="due-item" data-id="${lead.saved_lead_id}">
                    <div style="flex: 1;">
                        <h5 style="margin: 0 0 2px 0; font-size: 13px; color: white;">${lead.name}</h5>
                        <p style="margin: 0; font-size: 11px; color: var(--text-muted);">${lead.category} &middot; ${lead.area}</p>
                    </div>
                    <div style="text-align: right; display: flex; align-items: center; gap: 12px;">
                        <span class="due-badge ${badgeClass}">${label} (${formattedDate})</span>
                        <button class="crm-action-btn wa-quick-btn" data-phone="${lead.phone || ''}" data-name="${lead.name}" style="background: rgba(34, 197, 94, 0.1); color: #22c55e; border-color: rgba(34, 197, 94, 0.2);">
                            WhatsApp Quick outreach
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        dueTodayHTML = `
            <div class="due-today-section">
                <h4 class="due-today-title">⚠️ Due Today or Overdue</h4>
                <div class="due-items-grid">
                    ${itemsHTML}
                </div>
            </div>
        `;
    }

    // Render Kanban Board columns
    const columnsHTML = columns.map(col => {
        const leads = leadsByStatus[col.id] || [];
        const cardsHTML = leads.map(lead => {
            // Stars generator
            const rating = lead.rating || 0;
            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.floor(rating)) starsHTML += '★';
                else if (i - 0.5 <= rating) starsHTML += '½';
                else starsHTML += '☆';
            }

            // Follow up label
            let followUpHTML = '';
            if (lead.follow_up_due_at) {
                const isOverdue = lead.follow_up_due_at.slice(0, 10) < todayStr;
                const dateVal = new Date(lead.follow_up_due_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                followUpHTML = `<span class="card-followup ${isOverdue ? 'overdue' : ''}">⏰ ${dateVal}</span>`;
            }

            // Completeness score HTML
            const compScore = lead.completeness_score || 0;
            let compDots = '';
            for (let i = 0; i < 5; i++) {
                compDots += `<span class="crm-dot ${i < compScore ? 'filled' : ''}"></span>`;
            }

            // Outreach channel icon
            let channelIcon = '';
            if (lead.outreach_channel) {
                const icon = lead.outreach_channel === 'whatsapp' ? '💬' : lead.outreach_channel === 'email' ? '📧' : '✉️';
                channelIcon = `<span class="card-channel-icon" title="Outreach via ${lead.outreach_channel}">${icon}</span>`;
            }

            return `
                <div class="crm-lead-card" draggable="true" id="lead-card-${lead.saved_lead_id}" data-id="${lead.saved_lead_id}">
                    <div class="card-drag-handle">⋮⋮</div>
                    <h4 class="card-name">${lead.name}</h4>
                    <p class="card-meta">${lead.category} &middot; ${lead.area}</p>
                    
                    <div class="card-rating-wrap">
                        <span class="card-stars">${starsHTML}</span>
                        <span class="card-rating-num">${rating}</span>
                    </div>
                    
                    <div class="card-footer-row">
                        <div class="card-completeness">${compDots}</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${channelIcon}
                            ${followUpHTML}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="crm-column" data-status="${col.id}" style="border-top: 3px solid ${col.color};">
                <div class="crm-column-header">
                    <span class="column-title">${col.title}</span>
                    <span class="column-count">${leads.length}</span>
                </div>
                <div class="crm-column-cards">
                    ${cardsHTML}
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="crm-workspace">
            ${statsHTML}
            ${dueTodayHTML}
            
            <div class="crm-kanban-board">
                ${columnsHTML}
            </div>
            
            <!-- Sliding Detail Panel -->
            <div class="crm-detail-panel" id="crmDetailPanel">
                <div class="panel-header">
                    <h3>Lead Details</h3>
                    <button class="close-panel-btn" id="closeDetailPanelBtn">&times;</button>
                </div>
                <div class="panel-body" id="crmPanelBody">
                    <p style="color: var(--text-muted);">Click a lead card to view details, update follow ups, and edit notes.</p>
                </div>
            </div>
        </div>
    `;
}

export function bindCRMWorkspaceEvents(onUpdateCallback) {
    const cards = document.querySelectorAll('.crm-lead-card');
    const columns = document.querySelectorAll('.crm-column');
    const detailPanel = document.getElementById('crmDetailPanel');
    const panelBody = document.getElementById('crmPanelBody');
    const closePanelBtn = document.getElementById('closeDetailPanelBtn');

    let draggedCardId = null;

    // HTML5 Drag and Drop Handlers
    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedCardId = card.id;
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', card.id);
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            draggedCardId = null;
        });

        // Click to open detail panel
        card.addEventListener('click', (e) => {
            // Prevent if dragging or click handles
            if (e.target.classList.contains('card-drag-handle')) return;
            const savedLeadId = card.getAttribute('data-id');
            openDetailPanel(savedLeadId, onUpdateCallback);
        });
    });

    columns.forEach(col => {
        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            col.classList.add('dragover');
        });

        col.addEventListener('dragleave', () => {
            col.classList.remove('dragover');
        });

        col.addEventListener('drop', async (e) => {
            e.preventDefault();
            col.classList.remove('dragover');
            
            const cardId = e.dataTransfer.getData('text/plain');
            const cardEl = document.getElementById(cardId);
            if (!cardEl) return;

            const container = col.querySelector('.crm-column-cards');
            container.appendChild(cardEl);

            const savedLeadId = cardEl.getAttribute('data-id');
            const targetStatus = col.getAttribute('data-status');

            try {
                await Api.updateLeadStatus(savedLeadId, targetStatus);
                if (onUpdateCallback) onUpdateCallback();
            } catch (err) {
                console.error("Failed to update status on drop: ", err);
            }
        });
    });

    // Close detail panel
    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', () => {
            detailPanel.classList.remove('open');
        });
    }

    // Quick WhatsApp outreach click
    const quickWaBtns = document.querySelectorAll('.wa-quick-btn');
    quickWaBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const phone = btn.getAttribute('data-phone');
            const name = btn.getAttribute('data-name');
            if (!phone) {
                alert("No phone number available for this business");
                return;
            }
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            const msg = `Hello ${name}, this is regarding your business listing profile. We wanted to connect about your digital visibility.`;
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
        });
    });
}

async function openDetailPanel(savedLeadId, onUpdateCallback) {
    const detailPanel = document.getElementById('crmDetailPanel');
    const panelBody = document.getElementById('crmPanelBody');
    if (!detailPanel || !panelBody) return;

    detailPanel.classList.add('open');
    panelBody.innerHTML = `
        <div style="text-align: center; padding: 40px 0;">
            <div class="spinner"></div>
            <p style="margin-top: 12px; color: var(--text-muted);">Loading lead information...</p>
        </div>
    `;

    try {
        // Fetch detailed list of all saved leads to find the matching one
        // We fetch the individual lead details by retrieving details from Supabase
        const { data, error } = await Api.supabase
            .from('saved_leads')
            .select('*, professionals(*)')
            .eq('id', savedLeadId)
            .single();

        if (error) throw error;
        const lead = data;
        const prof = lead.professionals;

        const dateVal = lead.follow_up_due_at ? lead.follow_up_due_at.slice(0, 10) : '';
        const notes = lead.notes || '';

        panelBody.innerHTML = `
            <div class="crm-detail-content">
                <h4 style="font-size: 16px; margin: 0 0 4px 0; color: white;">${prof.name}</h4>
                <p style="font-size: 12px; color: var(--text-muted); margin: 0 0 16px 0;">${prof.category} &middot; ${prof.area}</p>
                
                <div class="detail-section">
                    <label class="detail-label">Outreach Channel</label>
                    <div style="display: flex; gap: 8px; margin-top: 6px;">
                        <button class="channel-toggle-btn ${lead.outreach_channel === 'whatsapp' ? 'active' : ''}" data-channel="whatsapp">💬 WhatsApp</button>
                        <button class="channel-toggle-btn ${lead.outreach_channel === 'email' ? 'active' : ''}" data-channel="email">📧 Email</button>
                    </div>
                </div>

                <div class="detail-section">
                    <label class="detail-label" for="detailFollowUp">Follow up Date</label>
                    <input type="date" id="detailFollowUp" class="detail-input" value="${dateVal}" style="width: 100%; margin-top: 6px;">
                </div>

                <div class="detail-section">
                    <label class="detail-label" for="detailNotes">Notes</label>
                    <textarea id="detailNotes" class="detail-input" style="width: 100%; height: 120px; margin-top: 6px; resize: none; font-size: 13px;">${notes}</textarea>
                </div>
                
                <div style="margin-top: 24px; display: flex; gap: 12px;">
                    <button class="brand-btn" id="saveCrmDetailsBtn" style="flex: 1; padding: 10px;">Save Changes</button>
                    <button class="secondary-btn" id="deleteCrmLeadBtn" style="padding: 10px; border-color: rgba(239, 68, 68, 0.2); color: #ef4444; background: rgba(239, 68, 68, 0.05);">Remove</button>
                </div>
            </div>
        `;

        // Channel selector events
        const channelBtns = panelBody.querySelectorAll('.channel-toggle-btn');
        let selectedChannel = lead.outreach_channel;
        channelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                channelBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedChannel = btn.getAttribute('data-channel');
            });
        });

        // Save Details Button event
        document.getElementById('saveCrmDetailsBtn').addEventListener('click', async () => {
            const newDate = document.getElementById('detailFollowUp').value;
            const newNotes = document.getElementById('detailNotes').value;
            
            try {
                // Update notes, follow up date, and channel
                await Api.supabase
                    .from('saved_leads')
                    .update({ 
                        notes: newNotes, 
                        follow_up_due_at: newDate ? newDate : null,
                        outreach_channel: selectedChannel,
                        updated_at: new Date().toISOString() 
                    })
                    .eq('id', savedLeadId);

                detailPanel.classList.remove('open');
                if (onUpdateCallback) onUpdateCallback();
            } catch (err) {
                console.error("Failed to save lead updates: ", err);
                alert("Error updating details");
            }
        });

        // Delete Saved Lead event
        document.getElementById('deleteCrmLeadBtn').addEventListener('click', async () => {
            if (confirm("Are you sure you want to stop tracking this lead?")) {
                try {
                    await Api.deleteSavedLead(savedLeadId);
                    detailPanel.classList.remove('open');
                    if (onUpdateCallback) onUpdateCallback();
                } catch (err) {
                    console.error("Failed to delete lead: ", err);
                    alert("Error deleting lead");
                }
            }
        });

    } catch (err) {
        console.error("Failed to load details: ", err);
        panelBody.innerHTML = `<div style="color: var(--accent-pink); text-align: center; padding: 20px;">Failed to load lead details.</div>`;
    }
}
