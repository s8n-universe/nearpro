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
            <div class="list-card" data-id="${list.id}" style="border-left: 4px solid ${list.color || '#2563eb'}; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; min-height: 150px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);">
                <div class="list-card-header" style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; gap: 12px;">
                    <h4 class="list-card-title" style="margin: 0; font-size: 16px; font-weight: 700; font-family: var(--font-heading); color: #0f172a;">${list.name}</h4>
                    <span class="list-color-dot" style="width: 10px; height: 10px; border-radius: 50%; background: ${list.color || '#2563eb'}; flex-shrink: 0; margin-top: 4px;"></span>
                </div>
                <p class="list-card-desc" style="font-size: 13px; color: #475569; margin: 0; line-height: 1.5; flex: 1;">${list.description || 'No description provided.'}</p>
                <div class="list-card-footer" style="margin-top: 16px; font-size: 11.5px; color: #64748b; font-weight: 500;">
                    <span>Last modified: ${formattedDate}</span>
                </div>
            </div>
        `;
    }).join('');

    const emptyStateHTML = listsData.length === 0 ? `
        <div style="grid-column: 1 / -1; padding: 60px; text-align: center; border: 2px dashed #cbd5e1; border-radius: 12px; background: #ffffff;">
            <div style="margin-bottom: 12px; display: flex; justify-content: center;">
                <i data-lucide="folder" style="width: 36px; height: 36px; color: #94a3b8; stroke-width: 1.5px;"></i>
            </div>
            <h4 style="color: #0f172a; margin-bottom: 6px; font-size: 18px; font-weight: 700;">No Smart Lists Found</h4>
            <p style="color: #64748b; font-size: 13.5px; margin-bottom: 20px;">Smart Lists allow you to group verified business contacts by campaign or niche.</p>
            <button class="brand-btn" id="createListBtnEmpty" style="padding: 10px 20px; font-size: 13.5px; background: #2563eb; color: white; border: none; font-weight: 700; border-radius: 6px; cursor: pointer;">Create New List</button>
        </div>
    ` : '';

    return `
        <div class="lists-workspace-container" style="padding: 32px; background: #f8fafc; color: #0f172a; border-radius: var(--radius-lg); border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div class="lists-workspace" style="display: flex; flex-direction: column; gap: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <h3 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; font-family: var(--font-heading);">Smart Lists</h3>
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
                <div class="modal-card" style="max-width: 420px; padding: 28px; background: #ffffff !important; color: #0f172a !important; border: 1px solid #cbd5e1 !important; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3);">
                    <h3 style="font-size: 18px; color: #0f172a; margin-bottom: 16px; font-family: var(--font-heading); font-weight: 800;">Create New Smart List</h3>
                    <form id="createListForm">
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #475569; text-transform: uppercase; margin-bottom: 6px; font-weight: 700;">List Name</label>
                            <input type="text" id="listNameInput" required placeholder="Mumbai Dentists Campaign" style="width: 100%; padding: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13px; font-weight: 500;">
                        </div>
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #475569; text-transform: uppercase; margin-bottom: 6px; font-weight: 700;">Description</label>
                            <input type="text" id="listDescInput" placeholder="High priority targets with bad website speeds" style="width: 100%; padding: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13px; font-weight: 500;">
                        </div>
                        <div style="margin-bottom: 24px;">
                            <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #475569; text-transform: uppercase; margin-bottom: 6px; font-weight: 700;">Color Tag</label>
                            <div style="display: flex; gap: 12px;">
                                <label style="cursor: pointer;"><input type="radio" name="listColor" value="#3b82f6" checked> <span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#3b82f6;"></span></label>
                                <label style="cursor: pointer;"><input type="radio" name="listColor" value="#ec4899"> <span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#ec4899;"></span></label>
                                <label style="cursor: pointer;"><input type="radio" name="listColor" value="#10b981"> <span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#10b981;"></span></label>
                                <label style="cursor: pointer;"><input type="radio" name="listColor" value="#ffa000"> <span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#ffa000;"></span></label>
                                <label style="cursor: pointer;"><input type="radio" name="listColor" value="#a855f7"> <span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#a855f7;"></span></label>
                            </div>
                        </div>
                        <div style="display: flex; gap: 12px; justify-content: flex-end;">
                            <button type="button" class="secondary-btn" id="closeCreateListBtn" style="padding: 8px 16px; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; font-weight: 600;">Cancel</button>
                            <button type="submit" class="brand-btn" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; font-weight: 700;">Create List</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function renderListDetailView(listId, listsData, listLeads) {
    const list = listsData.find(l => l.id === listId);
    if (!list) return `<div style="padding: 40px; color: #dc2626; background: #ffffff; border-radius: 12px; border: 1px solid #fca5a5;">Smart list not found.</div>`;

    const leadsHTML = listLeads.map(lead => {
        const p = lead.professionals || {};
        
        // Status tag helper
        let statusTag = '';
        if (lead.status === 'new') statusTag = '<span style="display: inline-block; padding: 3px 10px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 12px; font-size: 11.5px; font-weight: 700;">New Lead</span>';
        else if (lead.status === 'contacted') statusTag = '<span style="display: inline-block; padding: 3px 10px; background: #fffbeb; color: #d97706; border: 1px solid #fde68a; border-radius: 12px; font-size: 11.5px; font-weight: 700;">Contacted</span>';
        else if (lead.status === 'responded') statusTag = '<span style="display: inline-block; padding: 3px 10px; background: #f3e8ff; color: #9333ea; border: 1px solid #e9d5ff; border-radius: 12px; font-size: 11.5px; font-weight: 700;">Responded</span>';
        else if (lead.status === 'converted') statusTag = '<span style="display: inline-block; padding: 3px 10px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; border-radius: 12px; font-size: 11.5px; font-weight: 700;">Converted</span>';
        else statusTag = `<span style="display: inline-block; padding: 3px 10px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 11.5px; font-weight: 700;">${lead.status}</span>`;

        return `
            <tr class="list-lead-row" data-id="${lead.id}" style="border-bottom: 1px solid #f1f5f9; background: #ffffff;">
                <td style="padding: 14px 16px;"><input type="checkbox" class="lead-select-checkbox" value="${lead.id}"></td>
                <td style="padding: 14px 16px; color: #0f172a; font-weight: 700; font-size: 14px;">${p.name || 'Business Lead'}</td>
                <td style="padding: 14px 16px;"><span style="display: inline-block; padding: 4px 10px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 20px; font-size: 12px; font-weight: 700;">${p.category || p.parent_category || 'General'}</span></td>
                <td style="padding: 14px 16px; color: #334155; font-size: 13.5px; font-weight: 600;">📍 ${p.area || 'Mumbai'}</td>
                <td style="padding: 14px 16px;">${p.phone ? `<a href="tel:${p.phone}" style="color: #2563eb; text-decoration: none; font-weight: 700; background: #eff6ff; padding: 4px 10px; border-radius: 6px; border: 1px solid #dbeafe; font-size: 12.5px;">📞 ${p.phone}</a>` : '<span style="color: #94a3b8; font-size: 12.5px;">Not Listed</span>'}</td>
                <td style="padding: 14px 16px;">${statusTag}</td>
                <td style="padding: 14px 16px; text-align: right;">
                    <button class="crm-action-btn delete-list-lead-btn" data-id="${lead.id}" style="color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    const emptyStateHTML = listLeads.length === 0 ? `
        <tr>
            <td colspan="7" style="padding: 60px; text-align: center; color: #64748b; background: #ffffff;">
                <div style="margin-bottom: 12px; display: flex; justify-content: center;">
                    <i data-lucide="folder" style="width: 32px; height: 32px; color: #94a3b8; stroke-width: 1.5px;"></i>
                </div>
                <h4 style="color: #0f172a; margin-bottom: 6px; font-size: 16px; font-weight: 700;">This smart list is currently empty</h4>
                <p style="color: #64748b; font-size: 13px; margin: 0;">Go to the <a href="#/dashboard/directory" style="color: #2563eb; font-weight: 700; text-decoration: underline;">Browse Directory</a> page to find leads and save them here.</p>
            </td>
        </tr>
    ` : '';

    return `
        <div class="lists-workspace-container" style="padding: 32px; background: #f8fafc; color: #0f172a; border-radius: var(--radius-lg); border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div class="list-detail-workspace">
                <div style="margin-bottom: 24px;">
                    <a href="#/dashboard/lists" class="secondary-btn" style="padding: 8px 16px; font-size: 13px; background: #ffffff; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                        &larr; Back to Smart Lists
                    </a>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <h3 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; font-family: var(--font-heading);">${list.name}</h3>
                                <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background: ${list.color || '#2563eb'};"></span>
                            </div>
                            <p style="margin: 4px 0 0 0; font-size: 13.5px; color: #475569;">${list.description || 'No description provided.'}</p>
                        </div>
                        
                        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                            <button class="brand-btn" id="bulkExportCSVBtn" style="padding: 10px 18px; font-size: 13px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; font-weight: 700; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
                                <i data-lucide="file-spreadsheet" style="width:14px; height:14px;"></i> Export Verified Leads to Excel
                            </button>
                            <button class="brand-btn" id="deleteEntireListBtn" style="padding: 10px 18px; font-size: 13px; background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; font-weight: 700; border-radius: 6px; cursor: pointer;">
                                Delete List
                            </button>
                        </div>
                    </div>
                </div>

                <div class="list-detail-table-wrap" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px; background: #ffffff;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                                <th style="padding: 14px 16px; width: 40px;"><input type="checkbox" id="selectAllLeadsCheckbox"></th>
                                <th style="padding: 14px 16px; color: #475569;">Business Name</th>
                                <th style="padding: 14px 16px; color: #475569;">Category</th>
                                <th style="padding: 14px 16px; color: #475569;">Area</th>
                                <th style="padding: 14px 16px; color: #475569;">Phone</th>
                                <th style="padding: 14px 16px; color: #475569;">CRM Status</th>
                                <th style="padding: 14px 16px; text-align: right; color: #475569;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${leadsHTML}
                            ${emptyStateHTML}
                        </tbody>
                    </table>
                </div>
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
