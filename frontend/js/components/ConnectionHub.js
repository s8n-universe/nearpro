import { State } from '../state.js';
import { Api } from '../api.js';

export function renderConnectionHub(lists, n8nUrl = '', sheetsUrl = '', activeTab = 'n8n') {
    const listOptionsHTML = lists.map(l => {
        return `<option value="${l.id}">${l.name} (${l.leads_count || 0} leads)</option>`;
    }).join('');

    let activeTabContent = '';

    if (activeTab === 'n8n') {
        activeTabContent = `
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div>
                    <h4 style="margin:0 0 6px 0; color:white; font-size:14px; font-family:var(--font-heading);">n8n Workflow Webhook</h4>
                    <p style="margin:0; font-size:12.5px; color:var(--text-secondary); line-height:1.5;">
                        Connect NearPro to your self hosted n8n or Make.com workflows. We will push lead metadata automatically on state updates.
                    </p>
                </div>

                <div>
                    <label style="display:block; font-size:11px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px;">n8n Webhook URL</label>
                    <input type="url" id="n8nWebhookInput" value="${n8nUrl}" placeholder="https://primary.n8n.webhook.domain/..." style="width:100%; padding:10px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-sm); color:white; font-size:13px; outline:none;">
                </div>

                <div style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px; display:flex; flex-direction:column; gap:12px;">
                    <h5 style="margin:0; font-size:12.5px; color:white; font-family:var(--font-heading);">Event Triggers</h5>
                    
                    <label style="display:flex; align-items:center; gap:10px; font-size:13px; color:var(--text-secondary); cursor:pointer;">
                        <input type="checkbox" id="triggerOnTrackedBtn" checked style="accent-color:var(--accent-gold);">
                        Trigger when a new lead is tracked
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; font-size:13px; color:var(--text-secondary); cursor:pointer;">
                        <input type="checkbox" id="triggerOnCRMBtn" checked style="accent-color:var(--accent-gold);">
                        Trigger when CRM pipeline stage changes
                    </label>
                </div>

                <div style="display:flex; gap:12px;">
                    <button class="brand-btn" id="saveN8nSettingsBtn" style="flex:1; padding:10px;">Save Configuration</button>
                    <button class="secondary-btn" id="testN8nConnectionBtn" style="padding:10px;">Test Webhook Connection</button>
                </div>
            </div>
        `;
    } else if (activeTab === 'sheets') {
        activeTabContent = `
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div>
                    <h4 style="margin:0 0 6px 0; color:white; font-size:14px; font-family:var(--font-heading);">Google Sheets Sync</h4>
                    <p style="margin:0; font-size:12.5px; color:var(--text-secondary); line-height:1.5;">
                        Export your Smart Lists directly to your Google Sheets webhook receiver to keep tracking logs updated.
                    </p>
                </div>

                <div>
                    <label style="display:block; font-size:11px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px;">Sheets Webhook URL</label>
                    <input type="url" id="sheetsWebhookInput" value="${sheetsUrl}" placeholder="https://script.google.com/macros/s/.../exec" style="width:100%; padding:10px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-sm); color:white; font-size:13px; outline:none;">
                </div>

                <div>
                    <label style="display:block; font-size:11px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px;">Choose Smart List to Push</label>
                    <select id="sheetsListSelect" style="width:100%; padding:10px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-sm); color:white; font-size:13px;">
                        <option value="">Choose List</option>
                        ${listOptionsHTML}
                    </select>
                </div>

                <div style="display:flex; gap:12px;">
                    <button class="brand-btn" id="saveSheetsSettingsBtn" style="flex:1; padding:10px;">Save Configuration</button>
                    <button class="secondary-btn" id="pushToSheetsBtn" style="padding:10px;">Push Leads to Sheets</button>
                </div>
            </div>
        `;
    }

    return `
        <div class="connection-workspace" style="display:grid; grid-template-columns: 240px 1fr; gap:24px; height:100%;">
            <!-- Left sidebar -->
            <div class="connection-sidebar" style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px; display:flex; flex-direction:column; gap:6px; height:fit-content;">
                <h4 style="margin:0 0 10px 0; font-size:13px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase;">Integrations</h4>
                <button class="sidebar-tab-btn ${activeTab === 'n8n' ? 'active' : ''}" id="tabN8nBtn" style="text-align:left; background:none; border:none; padding:10px 14px; border-radius:var(--radius-sm); font-size:13.5px; color:${activeTab === 'n8n' ? 'var(--accent-gold)' : 'var(--text-secondary)'}; cursor:pointer; font-weight:500; display:flex; align-items:center; gap:8px;">
                    🤖 n8n Workflow
                </button>
                <button class="sidebar-tab-btn ${activeTab === 'sheets' ? 'active' : ''}" id="tabSheetsBtn" style="text-align:left; background:none; border:none; padding:10px 14px; border-radius:var(--radius-sm); font-size:13.5px; color:${activeTab === 'sheets' ? 'var(--accent-gold)' : 'var(--text-secondary)'}; cursor:pointer; font-weight:500; display:flex; align-items:center; gap:8px;">
                    📊 Google Sheets
                </button>
            </div>

            <!-- Right Workspace -->
            <div class="connection-workspace-body" style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-md); padding:28px; display:flex; flex-direction:column; min-height:360px;">
                ${activeTabContent}
            </div>
        </div>
    `;
}

export function bindConnectionHubEvents(lists, activeTab, onTabChangeCallback) {
    const tabN8n = document.getElementById('tabN8nBtn');
    if (tabN8n) {
        tabN8n.addEventListener('click', () => {
            if (onTabChangeCallback) onTabChangeCallback('n8n');
        });
    }

    const tabSheets = document.getElementById('tabSheetsBtn');
    if (tabSheets) {
        tabSheets.addEventListener('click', () => {
            if (onTabChangeCallback) onTabChangeCallback('sheets');
        });
    }

    // Save n8n settings
    const saveN8n = document.getElementById('saveN8nSettingsBtn');
    if (saveN8n) {
        saveN8n.addEventListener('click', async () => {
            const url = document.getElementById('n8nWebhookInput').value.trim();
            try {
                const { error } = await Api.supabase
                    .from('profiles')
                    .update({ n8n_webhook_url: url, updated_at: new Date().toISOString() })
                    .eq('id', State.user.id);
                
                if (error) throw error;
                State.profile.n8n_webhook_url = url;
                alert("Configuration saved successfully");
            } catch (err) {
                console.error("Failed to save n8n configuration: ", err);
                alert("Failed to save configuration");
            }
        });
    }

    // Test n8n Connection
    const testN8n = document.getElementById('testN8nConnectionBtn');
    if (testN8n) {
        testN8n.addEventListener('click', async () => {
            const url = document.getElementById('n8nWebhookInput').value.trim();
            if (!url) {
                alert("Please configure a webhook URL first");
                return;
            }
            testN8n.innerHTML = 'Testing connection...';
            testN8n.disabled = true;

            try {
                const testPayload = {
                    event: 'test_connection',
                    timestamp: new Date().toISOString(),
                    test_lead: {
                        name: 'Test Business Lead',
                        category: 'Dentist',
                        rating: 4.8,
                        area: 'Bandra Mumbai',
                        phone: '+91 98765 43210'
                    }
                };

                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testPayload)
                });

                if (res.ok) {
                    alert("Webhook connection tested successfully! Status 200 OK.");
                } else {
                    alert(`Webhook returned status ${res.status}`);
                }
            } catch (err) {
                console.error("Webhook test failed: ", err);
                alert("Connection failed. Check network or server configuration.");
            } finally {
                testN8n.innerHTML = 'Test Webhook Connection';
                testN8n.disabled = false;
            }
        });
    }

    // Save Sheets settings
    const saveSheets = document.getElementById('saveSheetsSettingsBtn');
    if (saveSheets) {
        saveSheets.addEventListener('click', async () => {
            const url = document.getElementById('sheetsWebhookInput').value.trim();
            try {
                const { error } = await Api.supabase
                    .from('profiles')
                    .update({ google_sheets_webhook_url: url, updated_at: new Date().toISOString() })
                    .eq('id', State.user.id);
                
                if (error) throw error;
                State.profile.google_sheets_webhook_url = url;
                alert("Configuration saved successfully");
            } catch (err) {
                console.error("Failed to save sheets configuration: ", err);
                alert("Failed to save configuration");
            }
        });
    }

    // Push to sheets
    const pushSheets = document.getElementById('pushToSheetsBtn');
    if (pushSheets) {
        pushSheets.addEventListener('click', async () => {
            const url = document.getElementById('sheetsWebhookInput').value.trim();
            const listId = document.getElementById('sheetsListSelect').value;
            if (!url) {
                alert("Please configure a Google Sheets webhook URL first");
                return;
            }
            if (!listId) {
                alert("Please select a Smart List to push");
                return;
            }

            pushSheets.innerHTML = 'Pushing leads...';
            pushSheets.disabled = true;

            try {
                const leads = await Api.getSavedLeads(listId);
                const targetList = lists.find(l => l.id === listId);

                const payload = {
                    event: 'google_sheets_push',
                    list_name: targetList?.name || 'Smart List',
                    timestamp: new Date().toISOString(),
                    leads: leads.map(item => ({
                        name: item.professionals?.name,
                        category: item.professionals?.category,
                        phone: item.professionals?.phone,
                        email: item.professionals?.email,
                        website: item.professionals?.website,
                        rating: item.professionals?.rating,
                        area: item.professionals?.area,
                        status: item.status
                    }))
                };

                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert(`Successfully exported ${leads.length} leads to your Google sheet!`);
                } else {
                    alert(`Export failed with status: ${res.status}`);
                }
            } catch (err) {
                console.error("Sheets push failed: ", err);
                alert("Sheets push failed. Check configurations.");
            } finally {
                pushSheets.innerHTML = 'Push Leads to Sheets';
                pushSheets.disabled = false;
            }
        });
    }
}
export function triggerN8nWebhook(event, payload) {
    const url = State.profile?.n8n_webhook_url;
    if (!url) return;
    
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event: event,
            timestamp: new Date().toISOString(),
            payload: payload
        })
    }).catch(err => console.warn("Failed to propagate n8n webhook event: ", err));
}
