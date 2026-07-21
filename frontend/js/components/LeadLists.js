import { State } from '../state.js';
import { Api } from '../api.js';
import { getUserTier, TIER_NAMES } from '../auth.js';

// Tier-based limits per V3 spec Section 3
const TIER_LIMITS = {
    free:   { maxLists: 1, maxLeadsPerList: 5 },
    scout:  { maxLists: 5, maxLeadsPerList: 50 },
    hunter: { maxLists: 20, maxLeadsPerList: Infinity },
    agency: { maxLists: Infinity, maxLeadsPerList: Infinity }
};

export function renderLeadLists(listsData, activeListId = null, listLeads = []) {
    if (activeListId) {
        return renderListDetailView(activeListId, listsData, listLeads);
    }

    // Grid view listing all collections
    const listCardsHTML = listsData.map(list => {
        const dateObj = new Date(list.updated_at);
        const formattedDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        
        return `
            <div class="list-card" data-id="${list.id}" style="border-left: 4px solid ${list.color || '#ffa000'};">
                <div class="list-card-header">
                    <h4 class="list-card-title">${list.name}</h4>
                    <span class="list-color-dot" style="background: ${list.color || '#ffa000'};"></span>
                </div>
                <p class="list-card-desc">${list.description || 'No description provided.'}</p>
                <div class="list-card-footer">
                    <span>Last modified: ${formattedDate}</span>
                </div>
            </div>
        `;
    }).join('');

    const emptyStateHTML = listsData.length === 0 ? `
        <div style="grid-column: 1 / -1; padding: 60px; text-align: center; border: 1px dashed var(--border); border-radius: var(--radius-lg);">
            <div style="margin-bottom: 12px; display: flex; justify-content: center;">
                <i data-lucide="folder" style="width: 36px; height: 36px; color: var(--text-muted); stroke-width: 1.5px;"></i>
            </div>
            <h4 style="color: white; margin-bottom: 6px;">No Smart Lists Found</h4>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 16px;">Smart Lists allow you to group verified business contacts by campaign or niche.</p>
            <button class="brand-btn" id="createListBtnEmpty" style="padding: 8px 16px; font-size: 13px;">Create New List</button>
        </div>
    ` : '';

    return `
        <div class="lists-workspace-container" style="padding: 32px; background: #f8fafc; color: #0f172a; border-radius: var(--radius-lg); border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div class="lists-workspace" style="display: flex; flex-direction: column; gap: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <h3 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; font-family: var(--font-heading);">Smart Lists</h3>
                        <p style="margin: 4px 0 0 0; font-size: 13.5px; color: #475569;">Manage your segments and database selections</p>
                    </div>
                    <button class="brand-btn" id="openCreateListModalBtn" style="padding: 10px 18px; font-size: 13px; background: #2563eb; color: white; border: none; font-weight: 700; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                        Create New List ➔
                    </button>
                </div>
                
                <!-- Usability Banner -->
                <div class="usability-banner" style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; border-radius: 8px; padding: 14px 20px; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <div style="font-size: 13px; color: #0f172a; line-height: 1.4; font-weight: 700;"><span style="color: #2563eb; font-weight: 800;">What it is:</span> Segment and group your business leads into distinct target lists.</div>
                    <div style="font-size: 12.5px; color: #475569; line-height: 1.4;"><span style="color: #2563eb; font-weight: 800;">How to leverage:</span> Export segments to CSV files or sheet webhooks to feed external cold email campaigns.</div>
                </div>
                
                <div class="lists-grid">
                    ${listCardsHTML}
                    ${emptyStateHTML}
                </div>
            </div>

            <!-- Create List Modal Popup -->
            <div class="modal-overlay" id="createListModalOverlay" style="z-index: 10001;">
                <div class="modal-card" style="max-width: 420px; padding: 28px;">
                    <h3 style="font-size: 18px; color: white; margin-bottom: 16px; font-family: var(--font-heading);">Create New Smart List</h3>
                    <form id="createListForm">
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; margin-bottom: 6px;">List Name</label>
                            <input type="text" id="listNameInput" required placeholder="Mumbai Dentists Campaign" style="width: 100%; padding: 10px; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px;">
                        </div>
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; margin-bottom: 6px;">Description</label>
                            <input type="text" id="listDescInput" placeholder="High priority targets with bad website speeds" style="width: 100%; padding: 10px; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px;">
                        </div>
                        <div style="margin-bottom: 24px;">
                            <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; margin-bottom: 6px;">Color Tag</label>
                            <div style="display: flex; gap: 10px;">
                                <label style="cursor: pointer;"><input type="radio" name="listColor" value="#3b82f6" checked> <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#3b82f6;"></span></label>
                                <label style="cursor: pointer;"><input type="radio" name="listColor" value="#ec4899"> <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#ec4899;"></span></label>
                                <label style="cursor: pointer;"><input type="radio" name="listColor" value="#10b981"> <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#10b981;"></span></label>
                                <label style="cursor: pointer;"><input type="radio" name="listColor" value="#ffa000"> <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#ffa000;"></span></label>
                                <label style="cursor: pointer;"><input type="radio" name="listColor" value="#a855f7"> <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#a855f7;"></span></label>
                            </div>
                        </div>
                        <div style="display: flex; gap: 12px; justify-content: flex-end;">
                            <button type="button" class="secondary-btn" id="closeCreateListBtn" style="padding: 8px 16px;">Cancel</button>
                            <button type="submit" class="brand-btn" style="padding: 8px 16px;">Create List</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function renderListDetailView(listId, listsData, listLeads) {
    const list = listsData.find(l => l.id === listId);
    if (!list) return `<div style="padding: 40px; color: var(--accent-pink);">List not found.</div>`;

    const leadsHTML = listLeads.map(lead => {
        const p = lead.professionals || {};
        
        // Status tag helper
        let statusTag = '';
        if (lead.status === 'new') statusTag = '<span class="status-tag status-new">New</span>';
        else if (lead.status === 'contacted') statusTag = '<span class="status-tag status-contacted">Contacted</span>';
        else if (lead.status === 'responded') statusTag = '<span class="status-tag status-responded">Responded</span>';
        else if (lead.status === 'converted') statusTag = '<span class="status-tag status-converted">Converted</span>';
        else statusTag = `<span class="status-tag">${lead.status}</span>`;

        return `
            <tr class="list-lead-row" data-id="${lead.id}">
                <td style="padding: 12px;"><input type="checkbox" class="lead-select-checkbox" value="${lead.id}"></td>
                <td style="padding: 12px; color: white; font-weight: 500;">${p.name}</td>
                <td style="padding: 12px;">${p.category || 'General'}</td>
                <td style="padding: 12px;">${p.area || 'Mumbai'}</td>
                <td style="padding: 12px; font-family: var(--font-mono); font-size: 12px;">${p.phone || 'Masked'}</td>
                <td style="padding: 12px;">${statusTag}</td>
                <td style="padding: 12px; text-align: right;">
                    <button class="crm-action-btn delete-list-lead-btn" data-id="${lead.id}" style="color: var(--accent-pink); background: rgba(244, 63, 94, 0.05); border-color: rgba(244, 63, 94, 0.1);">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    const emptyStateHTML = listLeads.length === 0 ? `
        <tr>
            <td colspan="7" style="padding: 60px; text-align: center; color: var(--text-muted);">
                <div style="margin-bottom: 8px; display: flex; justify-content: center;">
                    <i data-lucide="folder" style="width: 24px; height: 24px; color: var(--text-muted); stroke-width: 1.5px;"></i>
                </div>
                This list is empty. Go to the Browse Directory page to find leads and save them here.
            </td>
        </tr>
    ` : '';

    return `
        <div class="list-detail-workspace">
            <div style="margin-bottom: 24px;">
                <a href="#/dashboard/lists" class="secondary-btn" style="padding: 6px 12px; font-size: 12px; display: inline-block; margin-bottom: 16px;">
                    &larr; Back to Lists
                </a>
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <h3 style="margin: 0; font-size: 20px; color: white;">${list.name}</h3>
                            <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background: ${list.color || '#ffa000'};"></span>
                        </div>
                        <p style="margin: 4px 0 0 0; font-size: 13px; color: var(--text-secondary);">${list.description || 'No description.'}</p>
                    </div>
                    
                    <div style="display: flex; gap: 12px;">
                        <button class="brand-btn" id="bulkExportCSVBtn" style="padding: 10px 16px; font-size: 13px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
                            <i data-lucide="file-spreadsheet" style="width:14px; height:14px;"></i> Export Verified Leads to Excel
                        </button>
                        <button class="brand-btn" id="deleteEntireListBtn" style="padding: 10px 16px; font-size: 13px; background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #ef4444;">
                            Delete List
                        </button>
                    </div>
                </div>
            </div>

            <div class="list-detail-table-wrap" style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                    <thead>
                        <tr style="background: rgba(255, 255, 255, 0.02); border-bottom: 1px solid var(--border); color: var(--text-secondary);">
                            <th style="padding: 12px; width: 40px;"><input type="checkbox" id="selectAllLeadsCheckbox"></th>
                            <th style="padding: 12px;">Business Name</th>
                            <th style="padding: 12px;">Category</th>
                            <th style="padding: 12px;">Area</th>
                            <th style="padding: 12px;">Phone</th>
                            <th style="padding: 12px;">CRM Status</th>
                            <th style="padding: 12px; text-align: right;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${leadsHTML}
                        ${emptyStateHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

export function bindLeadListsEvents(onUpdateCallback, listsCount = 0) {
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const listCards = document.querySelectorAll('.list-card');
    const openModalBtn = document.getElementById('openCreateListModalBtn');
    const createListEmptyBtn = document.getElementById('createListBtnEmpty');
    const modalOverlay = document.getElementById('createListModalOverlay');
    const closeCreateBtn = document.getElementById('closeCreateListBtn');
    const form = document.getElementById('createListForm');
    
    // View detail click
    listCards.forEach(card => {
        card.addEventListener('click', () => {
            const listId = card.getAttribute('data-id');
            window.location.hash = `#/dashboard/lists?id=${listId}`;
        });
    });

    const openModal = () => {
        const tier = getUserTier();
        const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
        if (listsCount >= limits.maxLists) {
            alert(`You have reached the maximum number of Smart Lists allowed on the ${TIER_NAMES[tier] || 'Explorer'} plan (${limits.maxLists}). Please upgrade to create more lists.`);
            State.setPricingModal(true);
            return;
        }
        if (modalOverlay) modalOverlay.classList.add('open');
    };

    const closeModal = () => {
        if (modalOverlay) modalOverlay.classList.remove('open');
    };

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (createListEmptyBtn) createListEmptyBtn.addEventListener('click', openModal);
    if (closeCreateBtn) closeCreateBtn.addEventListener('click', closeModal);

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('listNameInput').value.trim();
            const desc = document.getElementById('listDescInput').value.trim();
            const color = form.querySelector('input[name="listColor"]:checked').value;

            const tier = getUserTier();
            const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
            if (listsCount >= limits.maxLists) {
                alert(`You have reached the maximum number of Smart Lists allowed on the ${TIER_NAMES[tier] || 'Explorer'} plan (${limits.maxLists}). Please upgrade to create more lists.`);
                State.setPricingModal(true);
                return;
            }

            try {
                await Api.createLeadList(name, desc, color);
                closeModal();
                if (onUpdateCallback) onUpdateCallback();
            } catch (err) {
                console.error("Failed to create list: ", err);
                alert("Error creating list");
            }
        });
    }
}

export function bindListDetailEvents(listId, listLeads, onUpdateCallback) {
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const selectAllCheckbox = document.getElementById('selectAllLeadsCheckbox');
    const rowCheckboxes = document.querySelectorAll('.lead-select-checkbox');
    const bulkExportBtn = document.getElementById('bulkExportCSVBtn');
    const deleteListBtn = document.getElementById('deleteEntireListBtn');
    const deleteRowBtns = document.querySelectorAll('.delete-list-lead-btn');

    // Check all row checkboxes on head checkbox select
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            rowCheckboxes.forEach(cb => {
                cb.checked = selectAllCheckbox.checked;
            });
        });
    }

    // CSV Exporter logic for selected items
    if (bulkExportBtn) {
        bulkExportBtn.addEventListener('click', () => {
            const selectedIds = Array.from(rowCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            if (selectedIds.length === 0) {
                alert("Please select at least one contact to export");
                return;
            }

            const leadsToExport = listLeads
                .filter(item => selectedIds.includes(item.id))
                .map(item => item.professionals);

            Api.exportToCSV(leadsToExport);
        });
    }

    // Delete Entire List
    if (deleteListBtn) {
        deleteListBtn.addEventListener('click', async () => {
            if (confirm("Are you sure you want to delete this list? Leads inside will be untracked but not deleted from the directory.")) {
                try {
                    await Api.supabase.from('lead_lists').delete().eq('id', listId);
                    window.location.hash = '#/dashboard/lists';
                } catch (err) {
                    console.error("Failed to delete list: ", err);
                    alert("Error deleting list");
                }
            }
        });
    }

    // Delete lead row from list
    deleteRowBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const savedLeadId = btn.getAttribute('data-id');
            if (confirm("Remove this lead from this smart list?")) {
                try {
                    await Api.deleteSavedLead(savedLeadId);
                    if (onUpdateCallback) onUpdateCallback();
                } catch (err) {
                    console.error("Failed to remove lead from list: ", err);
                    alert("Error removing lead");
                }
            }
        });
    });
}
