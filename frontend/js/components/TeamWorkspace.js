import { State } from '../state.js';
import { Api } from '../api.js';

export function renderTeamWorkspace(members = [], dataRequests = [], activeTab = 'seats') {
    const userTier = State.profile?.subscription_tier || State.profile?.tier || 'free';
    let seatLimit = 1;
    if (userTier === 'scout') seatLimit = 3;
    else if (userTier === 'hunter') seatLimit = 5;
    else if (userTier === 'agency' || userTier === 'enterprise') seatLimit = 999999;

    const safeMembers = Array.isArray(members) ? members : [];
    const safeRequests = Array.isArray(dataRequests) ? dataRequests : [];
    const currentSeats = safeMembers.length + 1; // including owner

    const membersHTML = safeMembers.map(m => {
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:8px;">
                <div>
                    <h5 style="margin:0 0 2px 0; font-size:13.5px; font-weight:700; color:#0f172a;">${m.email}</h5>
                    <span style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">${m.role}</span>
                </div>
                <button class="secondary-btn remove-member-btn" data-email="${m.email}" style="padding:6px 12px; font-size:12px; font-weight:700; border:1px solid #fca5a5; color:#dc2626; background:#fff1f2; border-radius:6px; cursor:pointer;">Remove</button>
            </div>
        `;
    }).join('');

    const inviteFormHTML = currentSeats < seatLimit ? `
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:20px; display:flex; flex-direction:column; gap:14px; box-shadow:0 2px 8px -2px rgba(15,23,42,0.03);">
            <h5 style="margin:0; font-size:14px; font-weight:800; color:#0f172a; font-family:var(--font-heading);">Invite Workspace Member</h5>
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
                <input type="email" id="inviteMemberEmail" placeholder="colleague@domain.com" style="flex:1; min-width:240px; padding:10px 14px; background:#ffffff; border:1.5px solid #cbd5e1; border-radius:8px; color:#0f172a; font-size:13.5px; font-weight:600; outline:none;">
                <select id="inviteMemberRole" style="padding:10px 14px; background:#ffffff; border:1.5px solid #cbd5e1; border-radius:8px; color:#0f172a; font-size:13.5px; font-weight:600; outline:none;">
                    <option value="sales">Sales Representative</option>
                    <option value="admin">Administrator</option>
                </select>
                <button class="brand-btn" id="submitInviteBtn" style="padding:10px 20px; font-size:13px; font-weight:700; background:#2563eb; color:white; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 12px rgba(37,99,235,0.25);">
                    Invite Member ✉️
                </button>
            </div>
        </div>
    ` : `
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:20px; font-size:13.5px; color:#1e40af; line-height:1.5; display:flex; flex-direction:column; gap:10px; width:100%;">
            <div style="font-weight:800; color:#0f172a; font-size:15px;">Work together with your team 🤝</div>
            <div>Scout plan includes 3 team seats. Upgrade to Agency to invite up to 10 collaborators with full editing and management permissions.</div>
            <button class="brand-btn" onclick="window.State.setPricingModal(true)" style="align-self:flex-start; padding:8px 18px; font-size:12.5px; font-weight:700; background:#2563eb; color:white; border:none; border-radius:6px; cursor:pointer;">
                Upgrade Workspace Seats ↗
            </button>
        </div>
    `;

    const requestsHTML = safeRequests.map(r => {
        const date = new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const statusColor = r.status === 'fulfilled' ? '#059669' : '#d97706';
        return `
            <div style="padding:16px; background:#ffffff; border:1px solid #cbd5e1; border-radius:10px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <h5 style="margin:0; font-size:14px; font-weight:700; color:#0f172a; font-family:var(--font-heading);">${r.requested_niche} in ${r.requested_city}</h5>
                    <span style="font-size:11px; font-weight:800; color:${statusColor}; text-transform:uppercase;">${r.status}</span>
                </div>
                <div style="font-size:13px; color:#475569; line-height:1.4; margin-bottom:6px;">
                    ${r.notes || 'No notes specified.'}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:#64748b; font-weight:600;">
                    <span>Requested on ${date}</span>
                    <span>${r.records_added ? `Added ${r.records_added} leads` : ''}</span>
                </div>
            </div>
        `;
    }).join('');

    const emptyRequestsHTML = safeRequests.length === 0 ? `
        <div style="padding:40px 12px; text-align:center; color:#64748b; font-size:13.5px; font-weight:600;">
            No custom extraction requests registered yet.
        </div>
    ` : '';

    let tabContent = '';
    if (activeTab === 'seats') {
        tabContent = `
            <div style="display:flex; flex-direction:column; gap:20px; text-align:left;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:16px;">
                    <div>
                        <h4 style="margin:0 0 4px 0; color:#0f172a; font-size:16px; font-weight:800; font-family:var(--font-heading);">Workspace Team Seats</h4>
                        <p style="margin:0; font-size:13px; color:#475569;">Configure client accounts and seat logins.</p>
                    </div>
                    <span style="font-size:13.5px; color:#2563eb; font-weight:700;">${currentSeats} / ${seatLimit === 999999 ? 'Unlimited' : seatLimit} Seats Active</span>
                </div>

                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:20px; display:flex; flex-direction:column; gap:12px;">
                    <h5 style="margin:0 0 4px 0; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase;">Active Members</h5>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; margin-bottom:8px;">
                        <div>
                            <h5 style="margin:0 0 2px 0; font-size:13.5px; font-weight:700; color:#0f172a;">${State.user?.email} (You)</h5>
                            <span style="font-size:11px; font-weight:800; color:#2563eb; text-transform:uppercase;">Owner</span>
                        </div>
                    </div>
                    ${membersHTML}
                </div>

                ${inviteFormHTML}
            </div>
        `;
    } else if (activeTab === 'requests') {
        tabContent = `
            <div style="display:flex; flex-direction:column; gap:20px; text-align:left;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:16px;">
                    <div>
                        <h4 style="margin:0 0 4px 0; color:#0f172a; font-size:16px; font-weight:800; font-family:var(--font-heading);">Custom Niche Data Requests</h4>
                        <p style="margin:0; font-size:13px; color:#475569;">Request custom regional directory extractions for targeted niches.</p>
                    </div>
                    <button class="brand-btn" id="openDataRequestModalBtn" style="padding:8px 16px; font-size:12.5px; font-weight:700; background:#2563eb; color:white; border:none; border-radius:6px; cursor:pointer;">
                        + New Data Request
                    </button>
                </div>

                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${requestsHTML || emptyRequestsHTML}
                </div>
            </div>
        `;
    }

    return `
        <div class="team-workspace-container" style="display: flex; flex-direction: column; gap: 20px; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div class="team-workspace" style="display:grid; grid-template-columns: 240px 1fr; gap:24px; width:100%;">
                
                <!-- Left sidebar -->
                <div class="team-sidebar" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; display:flex; flex-direction:column; gap:6px; height:fit-content; box-shadow:0 4px 15px -3px rgba(15,23,42,0.03);">
                    <h4 style="margin:0 0 10px 0; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Team Management</h4>
                    
                    <button class="sidebar-tab-btn ${activeTab === 'seats' ? 'active' : ''}" id="tabSeatsBtn" style="text-align:left; background:${activeTab === 'seats' ? '#eff6ff' : '#ffffff'}; border:1px solid ${activeTab === 'seats' ? '#bfdbfe' : '#e2e8f0'}; padding:10px 14px; border-radius:6px; font-size:13px; color:${activeTab === 'seats' ? '#2563eb' : '#475569'}; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px; transition: all 0.2s ease;">
                        <i data-lucide="users" style="width:14px; height:14px;"></i> Workspace Seats
                    </button>
                    
                    <button class="sidebar-tab-btn ${activeTab === 'requests' ? 'active' : ''}" id="tabRequestsBtn" style="text-align:left; background:${activeTab === 'requests' ? '#eff6ff' : '#ffffff'}; border:1px solid ${activeTab === 'requests' ? '#bfdbfe' : '#e2e8f0'}; padding:10px 14px; border-radius:6px; font-size:13px; color:${activeTab === 'requests' ? '#2563eb' : '#475569'}; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px; transition: all 0.2s ease;">
                        <i data-lucide="database" style="width:14px; height:14px;"></i> Data Requests
                    </button>
                </div>

                <!-- Right Workspace -->
                <div class="team-workspace-body" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; display:flex; flex-direction:column; min-height:360px; justify-content: flex-start; box-shadow:0 4px 15px -3px rgba(15,23,42,0.03);">
                    <!-- Usability Banner -->
                    <div class="usability-banner" style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #2563eb; border-radius: 8px; padding: 12px 18px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; width: 100%; text-align: left;">
                        <div style="font-size: 13px; color: #0f172a; line-height: 1.4; font-weight: 700;"><span style="color: #2563eb; font-weight: 800;">What it is:</span> Manage agency team seats, sub-accounts, and custom data requests.</div>
                        <div style="font-size: 12.5px; color: #475569; line-height: 1.4;"><span style="color: #2563eb; font-weight: 800;">How to leverage:</span> Invite team members to collaborate on sales calls and track custom niche data extraction requests.</div>
                    </div>
                    ${tabContent}
                </div>
            </div>
        </div>
    `;
}

export function bindTeamWorkspaceEvents(arg1, arg2, arg3, arg4) {
    if (window.refreshLucideIcons) window.refreshLucideIcons();

    let onTabChangeCallback = null;
    let onInviteCallback = null;
    let onRemoveCallback = null;
    let onRequestCallback = null;

    if (typeof arg1 === 'function') {
        onTabChangeCallback = arg1;
        onInviteCallback = arg2;
        onRemoveCallback = arg3;
        onRequestCallback = arg4;
    } else {
        onTabChangeCallback = arg4;
    }

    // Tab buttons
    const tabSeats = document.getElementById('tabSeatsBtn');
    const tabRequests = document.getElementById('tabRequestsBtn');

    if (tabSeats) tabSeats.onclick = () => onTabChangeCallback && onTabChangeCallback('seats');
    if (tabRequests) tabRequests.onclick = () => onTabChangeCallback && onTabChangeCallback('requests');

    // Submit invite
    const submitInviteBtn = document.getElementById('submitInviteBtn');
    const inviteEmailInput = document.getElementById('inviteMemberEmail');
    const inviteRoleSelect = document.getElementById('inviteMemberRole');

    if (submitInviteBtn && inviteEmailInput && inviteRoleSelect) {
        submitInviteBtn.onclick = async () => {
            const email = inviteEmailInput.value.trim();
            const role = inviteRoleSelect.value;

            if (!email || !email.includes('@')) {
                if (window.showToast) window.showToast("Please enter a valid member email address", "error");
                return;
            }

            submitInviteBtn.disabled = true;
            try {
                if (onInviteCallback) {
                    onInviteCallback(email, role);
                } else {
                    await Api.inviteTeamMember(email, role);
                    if (window.showToast) window.showToast(`✨ Invitation sent to ${email}`, "success");
                    inviteEmailInput.value = '';
                    if (onTabChangeCallback) onTabChangeCallback('seats');
                }
            } catch (err) {
                if (window.showToast) window.showToast(`Invite failed: ${err.message}`, "error");
            } finally {
                submitInviteBtn.disabled = false;
            }
        };
    }

    // Remove member buttons
    const removeBtns = document.querySelectorAll('.remove-member-btn');
    removeBtns.forEach(btn => {
        btn.onclick = async () => {
            const email = btn.dataset.email;
            if (!confirm(`Are you sure you want to remove ${email} from your workspace?`)) return;

            btn.disabled = true;
            try {
                if (onRemoveCallback) {
                    onRemoveCallback(email);
                } else {
                    await Api.removeTeamMember(email);
                    if (window.showToast) window.showToast(`Removed ${email} from workspace`, "info");
                    if (onTabChangeCallback) onTabChangeCallback('seats');
                }
            } catch (err) {
                if (window.showToast) window.showToast(`Remove failed: ${err.message}`, "error");
            }
        };
    });

    // New Data Request Modal Trigger
    const openReqBtn = document.getElementById('openDataRequestModalBtn');
    if (openReqBtn) {
        openReqBtn.onclick = async () => {
            const niche = prompt("Enter targeted niche (e.g. Dentists, Interior Designers, Coaching Centers):");
            if (!niche) return;
            const city = prompt("Enter targeted city/region (e.g. Mumbai, Pune, Delhi NCR):");
            if (!city) return;
            const notes = prompt("Any specific requirements or lead count needed?");

            try {
                if (onRequestCallback) {
                    await onRequestCallback(niche, city, notes || '');
                } else {
                    await Api.requestCustomData(niche, city, notes || '');
                    if (window.showToast) window.showToast("✨ Custom data request submitted!", "success");
                    if (onTabChangeCallback) onTabChangeCallback('requests');
                }
            } catch (err) {
                if (window.showToast) window.showToast(`Request failed: ${err.message}`, "error");
            }
        };
    }
}

export async function loadDataRequests() {
    try {
        const res = await Api.getDataRequests();
        return Array.isArray(res) ? res : [];
    } catch (err) {
        console.warn("loadDataRequests fallback:", err);
        return [];
    }
}

export async function createDataRequest(niche, city, notes) {
    try {
        return await Api.requestCustomData(niche, city, notes);
    } catch (err) {
        console.warn("createDataRequest fallback:", err);
    }
}
