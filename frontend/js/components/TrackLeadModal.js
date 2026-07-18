import { State } from '../state.js';
import { Api } from '../api.js';
import { currentUserHasAccess, getUserTier } from '../auth.js';

// Tier-based limits per V3 spec Section 3
const TIER_LIMITS = {
    free:   { maxLists: 1, maxLeadsPerList: 5 },
    scout:  { maxLists: 5, maxLeadsPerList: 50 },
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
            // Present select dropdown
            const options = lists.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
            body.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; margin-bottom: 6px;">Select Smart List</label>
                    <select id="trackLeadListSelect" style="width: 100%; padding: 10px; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px;">
                        ${options}
                    </select>
                </div>
                <div id="trackLeadError" style="color: var(--accent-pink); font-size: 12px; margin-bottom: 12px; display: none;"></div>
                <button class="brand-btn" id="submitTrackLeadBtn" style="width: 100%; padding: 10px;">
                    Save to List
                </button>
            `;

            document.getElementById('submitTrackLeadBtn').addEventListener('click', async () => {
                const listId = document.getElementById('trackLeadListSelect').value;
                const errEl = document.getElementById('trackLeadError');
                errEl.style.display = 'none';

                const tier = getUserTier();
                const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;

                try {
                    // Fetch existing leads in this list to check limits
                    const existingLeads = await Api.getSavedLeads(listId);
                    if (existingLeads.length >= limits.maxLeadsPerList) {
                        alert(`You have reached the maximum number of leads allowed per list on the ${TIER_NAMES[tier] || 'Explorer'} plan (${limits.maxLeadsPerList}). Please upgrade to save more leads.`);
                        State.setPricingModal(true);
                        return;
                    }

                    await Api.saveLead(listId, professionalId);
                    
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
                    if (err.message && err.message.includes("unique_dedup")) {
                        errEl.innerText = "This lead is already saved in your pipeline.";
                    } else {
                        errEl.innerText = "Error tracking lead. It might already be tracked.";
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
