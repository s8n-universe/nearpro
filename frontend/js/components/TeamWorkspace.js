import { State } from '../state.js';
import { Api } from '../api.js';

export function renderTeamWorkspace(members = [], dataRequests = [], activeTab = 'seats') {
    const userTier = State.profile?.subscription_tier || State.profile?.tier || 'free';
    let seatLimit = 1;
    if (userTier === 'scout') seatLimit = 3;
    else if (userTier === 'hunter') seatLimit = 5;
    else if (userTier === 'agency' || userTier === 'enterprise') seatLimit = 999999;

    const currentSeats = members.length + 1; // including owner

    const membersHTML = members.map(m => {
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:var(--radius-sm); margin-bottom:8px;">
                <div>
                    <h5 style="margin:0 0 2px 0; font-size:13px; color:white;">${m.email}</h5>
                    <span style="font-size:11px; font-family:var(--font-mono); color:var(--text-muted); text-transform:uppercase;">${m.role}</span>
                </div>
                <button class="secondary-btn remove-member-btn" data-email="${m.email}" style="padding:4px 8px; font-size:11px; border-color:#ef4444; color:#ef4444;">Remove</button>
            </div>
        `;
    }).join('');

    const inviteFormHTML = currentSeats < seatLimit ? `
        <div style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-md); padding:20px; display:flex; flex-direction:column; gap:12px;">
            <h5 style="margin:0; font-size:13px; color:white; font-family:var(--font-heading);">Invite Workspace Member</h5>
            <div style="display:flex; gap:12px;">
                <input type="email" id="inviteMemberEmail" placeholder="colleague@domain.com" style="flex:1; padding:8px 12px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-sm); color:white; font-size:13px; outline:none;">
                <select id="inviteMemberRole" style="padding:8px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-sm); color:white; font-size:13px;">
                    <option value="sales">Sales Representative</option>
                    <option value="admin">Administrator</option>
                </select>
                <button class="brand-btn" id="submitInviteBtn" style="padding:8px 16px; font-size:13px;">Invite</button>
            </div>
        </div>
    ` : `
        <div style="background:rgba(255,160,0,0.03); border:1px solid rgba(255,160,0,0.15); border-radius:var(--radius-md); padding:20px; font-size:13px; color:var(--text-secondary); line-height:1.5; border-left: 3px solid var(--accent-gold); display: flex; flex-direction: column; gap: 10px; width: 100%;">
            <div style="font-weight: 700; color: white;">Work together with your team 🤝</div>
            <div>Scout plan includes 3 team seats (1 admin + 2 view-only collaborator/client seats). Upgrade to Agency to invite up to 10 collaborators with full editing and management permissions.</div>
            <button class="brand-btn" onclick="window.State.setPricingModal(true)" style="align-self: flex-start; padding: 6px 16px; font-size: 12px; margin-top: 4px;">Upgrade Workspace</button>
        </div>
    `;

    const requestsHTML = dataRequests.map(r => {
        const date = new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const statusColor = r.status === 'fulfilled' ? '#10b981' : '#eab308';
        return `
            <div style="padding:16px; background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:var(--radius-md); margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <h5 style="margin:0; font-size:13.5px; color:white; font-family:var(--font-heading);">${r.requested_niche} in ${r.requested_city}</h5>
                    <span style="font-size:11px; font-family:var(--font-mono); color:${statusColor}; text-transform:uppercase; font-weight:600;">${r.status}</span>
                </div>
                <div style="font-size:12px; color:var(--text-secondary); line-height:1.4; margin-bottom:6px;">
                    ${r.notes || 'No notes specified.'}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted);">
                    <span>Requested on ${date}</span>
                    <span>${r.records_added ? `Added ${r.records_added} leads` : ''}</span>
                </div>
            </div>
        `;
    }).join('');

    const emptyRequestsHTML = dataRequests.length === 0 ? `
        <div style="padding:40px 12px; text-align:center; color:var(--text-muted); font-size:13px;">
            No custom extraction requests registered yet.
        </div>
    ` : '';

    let tabContent = '';
    if (activeTab === 'seats') {
        tabContent = `
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:16px;">
                    <div>
                        <h4 style="margin:0 0 4px 0; color:white; font-size:15px; font-family:var(--font-heading);">Workspace Team Seats</h4>
                        <p style="margin:0; font-size:12px; color:var(--text-muted);">Configure client accounts and seat logins.</p>
                    </div>
                    <span style="font-size:13px; color:white; font-weight:500; font-family:var(--font-mono);">${currentSeats} / ${seatLimit} Seats Active</span>
                </div>

                <div style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-md); padding:20px; display:flex; flex-direction:column; gap:12px;">
                    <h5 style="margin:0 0 4px 0; font-size:12px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase;">Active Members</h5>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(255,160,0,0.03); border:1px solid rgba(255,160,0,0.15); border-radius:var(--radius-sm); margin-bottom:8px;">
                        <div>
                            <h5 style="margin:0 0 2px 0; font-size:13px; color:white;">${State.user?.email} (You)</h5>
                            <span style="font-size:11px; font-family:var(--font-mono); color:var(--accent-gold); text-transform:uppercase;">Owner</span>
                        </div>
                    </div>
                    ${membersHTML}
                </div>

                ${inviteFormHTML}
            </div>
        `;
    } else if (activeTab === 'requests') {
        tabContent = `
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:16px;">
                    <div>
                        <h4 style="margin:0 0 4px 0; color:white; font-size:15px; font-family:var(--font-heading);">Custom Data Extraction Requests</h4>
                        <p style="margin:0; font-size:12px; color:var(--text-muted);">Request verification data for new suburbs or categories.</p>
                    </div>
                </div>

                <!-- Extraction Form -->
                <div style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-md); padding:24px; display:flex; flex-direction:column; gap:16px;">
                    <h5 style="margin:0; font-size:13px; color:white; font-family:var(--font-heading);">Submit New Data Request</h5>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                        <div>
                            <label style="display:block; font-size:11px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; margin-bottom:6px;">Target Niche / Category</label>
                            <input type="text" id="requestNicheInput" placeholder="e.g. Gym or Salons" style="width:100%; padding:8px 12px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-sm); color:white; font-size:13px; outline:none;">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; margin-bottom:6px;">Target City / Suburb</label>
                            <input type="text" id="requestCityInput" placeholder="e.g. Pune or Bandra West" style="width:100%; padding:8px 12px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-sm); color:white; font-size:13px; outline:none;">
                        </div>
                    </div>

                    <div>
                        <label style="display:block; font-size:11px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; margin-bottom:6px;">Data Extraction Instructions</label>
                        <textarea id="requestNotesInput" placeholder="Specify any additional parameters or notes here..." style="width:100%; height:70px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px; color:white; font-size:13px; line-height:1.4; resize:none; outline:none; font-family:sans-serif;"></textarea>
                    </div>

                    <button class="brand-btn" id="submitExtractionRequestBtn" style="padding:10px; width:fit-content; font-size:13px; align-self:flex-end;">
                        Submit Data Request
                    </button>
                </div>

                <!-- Requests lists -->
                <div style="margin-top:12px;">
                    <h5 style="margin:0 0 12px 0; font-size:12px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase;">Extraction Logs</h5>
                    ${requestsHTML}
                    ${emptyRequestsHTML}
                </div>
            </div>
        `;
    }

    return `
        <div class="team-workspace-container" style="padding: 32px; background: #f8fafc; color: #0f172a; border-radius: var(--radius-lg); border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div class="team-workspace" style="display:grid; grid-template-columns: 240px 1fr; gap:24px; width:100%;">
                <!-- Left Sidebar -->
                <div class="team-sidebar" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; display:flex; flex-direction:column; gap:6px; height:fit-content; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <h4 style="margin:0 0 10px 0; font-size:12px; font-family:var(--font-mono); color:#64748b; text-transform:uppercase; font-weight: 700;">Team Workspace</h4>
                    <button class="sidebar-tab-btn ${activeTab === 'seats' ? 'active' : ''}" id="tabSeatsBtn" style="text-align:left; background:${activeTab === 'seats' ? '#eff6ff' : 'transparent'}; border:1px solid ${activeTab === 'seats' ? '#bfdbfe' : 'transparent'}; padding:10px 14px; border-radius:6px; font-size:13.5px; color:${activeTab === 'seats' ? '#2563eb' : '#475569'}; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px;">
                        👥 Team Seats
                    </button>
                    <button class="sidebar-tab-btn ${activeTab === 'requests' ? 'active' : ''}" id="tabRequestsBtn" style="text-align:left; background:${activeTab === 'requests' ? '#eff6ff' : 'transparent'}; border:1px solid ${activeTab === 'requests' ? '#bfdbfe' : 'transparent'}; padding:10px 14px; border-radius:6px; font-size:13.5px; color:${activeTab === 'requests' ? '#2563eb' : '#475569'}; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px;">
                        📈 Data Extraction
                    </button>
                </div>

                <!-- Right Workspace -->
                <div class="team-workspace-body" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; display:flex; flex-direction:column; min-height:360px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    ${tabContent}
                </div>
            </div>
        </div>
    `;
}

export function bindTeamWorkspaceEvents(onTabChangeCallback, onInviteCallback, onRemoveCallback, onRequestSubmitCallback) {
    const tabSeats = document.getElementById('tabSeatsBtn');
    if (tabSeats) {
        tabSeats.addEventListener('click', () => {
            if (onTabChangeCallback) onTabChangeCallback('seats');
        });
    }

    const tabRequests = document.getElementById('tabRequestsBtn');
    if (tabRequests) {
        tabRequests.addEventListener('click', () => {
            if (onTabChangeCallback) onTabChangeCallback('requests');
        });
    }

    const submitInvite = document.getElementById('submitInviteBtn');
    if (submitInvite) {
        submitInvite.addEventListener('click', () => {
            const email = document.getElementById('inviteMemberEmail').value.trim();
            const role = document.getElementById('inviteMemberRole').value;
            if (!email) {
                alert("Please enter member email address");
                return;
            }
            if (onInviteCallback) onInviteCallback(email, role);
        });
    }

    const removeBtns = document.querySelectorAll('.remove-member-btn');
    removeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const email = btn.getAttribute('data-email');
            if (onRemoveCallback) onRemoveCallback(email);
        });
    });

    const submitRequest = document.getElementById('submitExtractionRequestBtn');
    if (submitRequest) {
        submitRequest.addEventListener('click', () => {
            const niche = document.getElementById('requestNicheInput').value.trim();
            const city = document.getElementById('requestCityInput').value.trim();
            const notes = document.getElementById('requestNotesInput').value.trim();

            if (!niche || !city) {
                alert("Niche and City inputs are required");
                return;
            }
            if (onRequestSubmitCallback) onRequestSubmitCallback(niche, city, notes);
        });
    }
}
export async function loadDataRequests() {
    const { data, error } = await Api.supabase
        .from('data_requests')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}
export async function createDataRequest(niche, city, notes) {
    const { data: userSession } = await Api.supabase.auth.getSession();
    const userId = userSession?.session?.user?.id;
    if (!userId) throw new Error("User session not found");

    const { data, error } = await Api.supabase
        .from('data_requests')
        .insert([{
            user_id: userId,
            request_type: 'area',
            requested_city: city,
            requested_niche: niche,
            notes: notes,
            status: 'pending'
        }])
        .select()
        .single();
    if (error) throw error;
    return data;
}
