import { State } from '../state.js';
import { Api } from '../api.js';
import { currentUserHasAccess, getUserTier } from '../auth.js';

// Tier-based limits per V3 spec Section 3
const TIER_LIMITS = {
    free:   { maxLists: 1, maxLeadsPerList: 10 },
    scout:  { maxLists: 5, maxLeadsPerList: 100 },
    hunter: { maxLists: 20, maxLeadsPerList: Infinity },
    agency: { maxLists: Infinity, maxLeadsPerList: Infinity }
};

export function showTrackLeadModal(professionalId, onSavedCallback) {
    if (!State.user) {
        // Not logged in -> open login modal
        State.setAuthModal(true);
        return;
    }

    // Check if modal already exists, remove it
    const existing = document.getElementById('trackLeadModalOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'trackLeadModalOverlay';
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '10002';

    overlay.innerHTML = `
        <div class="modal-card" style="max-width: 400px; padding: 28px; text-align: left; position: relative;">
            <button class="modal-close-btn" id="closeTrackLeadModalBtn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer;">&times;</button>
            
            <h3 style="font-size: 18px; color: white; margin-bottom: 16px; font-family: var(--font-heading);">Track This Lead</h3>
            
            <div id="trackLeadModalBody">
                <div style="text-align: center; padding: 20px 0;">
                    <div class="spinner"></div>
                    <p style="margin-top: 12px; color: var(--text-muted); font-size: 13px;">Loading smart lists...</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('closeTrackLeadModalBtn');
    closeBtn.addEventListener('click', () => overlay.remove());

    // Fetch lists and populate
    Api.getLeadLists().then(async (lists) => {
        const body = document.getElementById('trackLeadModalBody');
        if (!body) return;

        const tier = getUserTier();
        const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;

        if (lists.length === 0) {
            // No lists -> offer to auto create one (always allowed, first list)
            body.innerHTML = `
                <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px;">
                    You do not have any smart lists created yet. Create a default list to start tracking leads.
                </p>
                <button class="brand-btn" id="createDefaultListBtn" style="width: 100%; padding: 10px;">
                    Create default List and Track Lead
                </button>
            `;

            document.getElementById('createDefaultListBtn').addEventListener('click', async () => {
                body.innerHTML = `
                    <div style="text-align: center; padding: 20px 0;">
                        <div class="spinner"></div>
                        <p style="margin-top: 12px; color: var(--text-muted); font-size: 13px;">Creating smart list...</p>
                    </div>
                `;
                try {
                    const defaultList = await Api.createLeadList("My Smart List", "Default segment for saved contacts", "#ffa000");
                    await Api.saveLead(defaultList.id, professionalId);
                    
                    // Update state tracking
                    if (!State.saved_lead_ids) State.saved_lead_ids = [];
                    State.saved_lead_ids.push(professionalId);
                    State.notify();

                    body.innerHTML = `
                        <div style="text-align: center; padding: 20px 0;">
                            <span style="font-size: 32px;">✓</span>
                            <h4 style="color: white; margin: 12px 0 6px 0;">Lead Tracked!</h4>
                            <p style="color: var(--text-muted); font-size: 12px; margin-bottom: 20px;">Saved to My Smart List.</p>
                            <button class="brand-btn" id="finishTrackLeadBtn" style="width: 100%; padding: 10px;">Done</button>
                        </div>
                    `;

                    document.getElementById('finishTrackLeadBtn').addEventListener('click', () => {
                        overlay.remove();
                        if (onSavedCallback) onSavedCallback();
                    });
                } catch (err) {
                    console.error("Failed to auto create list: ", err);
                    body.innerHTML = `<p style="color: var(--accent-pink); font-size: 13px;">Error saving lead. Please try again.</p>`;
                }
            });
        } else {
            // Present select dropdown + inline '+' new list toggle
            const options = lists.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
            body.innerHTML = `
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase;">Select Smart List</label>
                        <button id="toggleNewListFormBtn" style="background: rgba(37,99,235,0.15); border: 1px solid rgba(37,99,235,0.4); color: #60a5fa; font-size: 11px; font-weight: 700; border-radius: 6px; padding: 2px 8px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                            <span style="font-size: 13px;">+</span> Create New List
                        </button>
                    </div>
                    
                    <div id="existingListContainer">
                        <select id="trackLeadListSelect" style="width: 100%; padding: 10px; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px;">
                            ${options}
                        </select>
                    </div>

                    <div id="newListInputContainer" style="display: none; flex-direction: column; gap: 8px; margin-top: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
                        <label style="font-size: 11px; color: var(--text-secondary); font-weight: 600;">NEW LIST NAME:</label>
                        <input type="text" id="newListNameInput" placeholder="e.g. Converted, Closed, High Value..." style="width: 100%; padding: 8px 12px; background: var(--bg-base); border: 1px solid var(--border); border-radius: 6px; color: white; font-size: 13px; outline: none;" />
                        
                        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px;">
                            <span class="quick-tag-btn" data-tag="Converted" style="font-size: 10.5px; background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); border-radius: 4px; padding: 2px 6px; cursor: pointer; font-weight: 600;">+ Converted</span>
                            <span class="quick-tag-btn" data-tag="Closed" style="font-size: 10.5px; background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); border-radius: 4px; padding: 2px 6px; cursor: pointer; font-weight: 600;">+ Closed</span>
                            <span class="quick-tag-btn" data-tag="Hot Leads" style="font-size: 10.5px; background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); border-radius: 4px; padding: 2px 6px; cursor: pointer; font-weight: 600;">+ Hot Leads</span>
                        </div>
                    </div>
                </div>

                <div id="trackLeadError" style="color: var(--accent-pink); font-size: 12px; margin-bottom: 12px; display: none;"></div>
                
                <button class="brand-btn" id="submitTrackLeadBtn" style="width: 100%; padding: 10px;">
                    Save to List
                </button>
            `;

            let isCreatingNew = false;
            const toggleBtn = document.getElementById('toggleNewListFormBtn');
            const existingContainer = document.getElementById('existingListContainer');
            const newContainer = document.getElementById('newListInputContainer');
            const submitBtn = document.getElementById('submitTrackLeadBtn');
            const nameInput = document.getElementById('newListNameInput');

            toggleBtn.addEventListener('click', () => {
                isCreatingNew = !isCreatingNew;
                if (isCreatingNew) {
                    existingContainer.style.display = 'none';
                    newContainer.style.display = 'flex';
                    toggleBtn.innerHTML = '← Select Existing List';
                    submitBtn.innerText = 'Create & Save Lead';
                    nameInput.focus();
                } else {
                    existingContainer.style.display = 'block';
                    newContainer.style.display = 'none';
                    toggleBtn.innerHTML = '<span style="font-size: 13px;">+</span> Create New List';
                    submitBtn.innerText = 'Save to List';
                }
            });

            document.querySelectorAll('.quick-tag-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    nameInput.value = btn.getAttribute('data-tag');
                });
            });

            submitBtn.addEventListener('click', async () => {
                const errEl = document.getElementById('trackLeadError');
                errEl.style.display = 'none';

                const tier = getUserTier();
                const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;

                try {
                    let targetListId = null;

                    if (isCreatingNew) {
                        const newName = (nameInput.value || '').trim();
                        if (!newName) {
                            errEl.innerText = "Please enter a name for your new Smart List.";
                            errEl.style.display = 'block';
                            return;
                        }
                        submitBtn.innerText = "Creating list...";
                        submitBtn.disabled = true;

                        const newList = await Api.createLeadList(newName, "Custom segment created from pipeline", "#2563eb");
                        targetListId = newList.id;
                    } else {
                        targetListId = document.getElementById('trackLeadListSelect').value;
                    }

                    // Fetch existing leads in target list to check limits
                    const existingLeads = await Api.getSavedLeads(targetListId);
                    if (existingLeads.length >= limits.maxLeadsPerList) {
                        alert(`You have reached the maximum number of leads allowed per list on your plan (${limits.maxLeadsPerList}). Please upgrade to save more leads.`);
                        State.setPricingModal(true);
                        submitBtn.disabled = false;
                        return;
                    }

                    submitBtn.innerText = "Saving lead...";
                    submitBtn.disabled = true;

                    await Api.saveLead(targetListId, professionalId);
                    
                    // Update state tracking
                    if (!State.saved_lead_ids) State.saved_lead_ids = [];
                    if (!State.saved_lead_ids.includes(professionalId)) {
                        State.saved_lead_ids.push(professionalId);
                    }
                    State.notify();

                    body.innerHTML = `
                        <div style="text-align: center; padding: 20px 0;">
                            <span style="font-size: 32px;">✓</span>
                            <h4 style="color: white; margin: 12px 0 6px 0;">Lead Tracked!</h4>
                            <p style="color: var(--text-muted); font-size: 12px; margin-bottom: 20px;">Successfully added to list.</p>
                            <button class="brand-btn" id="finishTrackLeadBtn" style="width: 100%; padding: 10px;">Done</button>
                        </div>
                    `;

                    document.getElementById('finishTrackLeadBtn').addEventListener('click', () => {
                        overlay.remove();
                        if (onSavedCallback) onSavedCallback();
                    });
                } catch (err) {
                    console.error("Failed to track lead: ", err);
                    submitBtn.disabled = false;
                    submitBtn.innerText = isCreatingNew ? 'Create & Save Lead' : 'Save to List';
                    if (err.message && err.message.includes("unique_dedup")) {
                        errEl.innerText = "This lead is already saved in your pipeline.";
                    } else {
                        errEl.innerText = err.message || "Error tracking lead. Please try again.";
                    }
                    errEl.style.display = 'block';
                }
            });
        }
    }).catch(err => {
        console.error("Failed to load lists for modal: ", err);
        const body = document.getElementById('trackLeadModalBody');
        if (body) {
            body.innerHTML = `<p style="color: var(--accent-pink); font-size: 13px;">Failed to load lists. Please check network.</p>`;
        }
    });
}
