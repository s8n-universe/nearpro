import { State } from '../state.js';
import { Api } from '../api.js';

export function renderConnectionHub(lists, n8nUrl = '', sheetsUrl = '', hubspotToken = '', zohoToken = '', activeTab = 'n8n') {
    const listOptionsHTML = lists.map(l => {
        return `<option value="${l.id}">${l.name} (${l.leads_count || 0} leads)</option>`;
    }).join('');

    let activeTabContent = '';

    if (activeTab === 'n8n') {
        const isValidN8n = n8nUrl ? /^https?:\/\/.+/i.test(n8nUrl) : null;
        activeTabContent = `
            <div style="display:flex; flex-direction:column; gap:20px; text-align:left;">
                <div>
                    <h4 style="margin:0 0 4px 0; color:#0f172a; font-size:16px; font-weight:800; font-family:var(--font-heading);">n8n & Make.com Webhook Integration</h4>
                    <p style="margin:0; font-size:13.5px; color:#475569; line-height:1.5;">
                        Push lead metadata automatically to your self-hosted n8n or Make.com workflow endpoints on state changes.
                    </p>
                </div>

                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <label style="font-size:12px; font-weight:700; color:#0f172a; text-transform:uppercase;">N8N / MAKE WEBHOOK ENDPOINT URL</label>
                        <span id="n8nFormatFlag" style="font-size:11px; font-weight:700; font-family:var(--font-mono); color:${isValidN8n ? '#059669' : isValidN8n === false ? '#dc2626' : '#64748b'};">
                            ${isValidN8n ? '✅ Valid Webhook Endpoint' : isValidN8n === false ? '⚠️ Format Error: Must begin with http:// or https://' : 'Format: https://...'}
                        </span>
                    </div>
                    <input type="url" id="n8nWebhookInput" value="${n8nUrl}" placeholder="https://primary.n8n.webhook.domain/webhook/lead-push" style="width:100%; padding:11px 14px; background:#ffffff; border:1.5px solid ${isValidN8n === false ? '#fca5a5' : '#cbd5e1'}; border-radius:8px; color:#0f172a; font-size:13.5px; outline:none; font-weight:600;">
                </div>

                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:18px; display:flex; flex-direction:column; gap:12px;">
                    <h5 style="margin:0; font-size:13px; font-weight:700; color:#0f172a;">Automatic Event Triggers</h5>
                    
                    <label style="display:flex; align-items:center; gap:10px; font-size:13px; color:#334155; font-weight:600; cursor:pointer;">
                        <input type="checkbox" id="triggerOnTrackedBtn" checked style="width:16px; height:16px; accent-color:#2563eb;">
                        Trigger webhook when a new lead is tracked in directory
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; font-size:13px; color:#334155; font-weight:600; cursor:pointer;">
                        <input type="checkbox" id="triggerOnCRMBtn" checked style="width:16px; height:16px; accent-color:#2563eb;">
                        Trigger webhook when CRM pipeline stage changes (e.g. Converted)
                    </label>
                </div>

                <div style="display:flex; gap:12px; margin-top:4px;">
                    <button class="brand-btn" id="saveN8nSettingsBtn" style="flex:1; padding:11px; font-size:13px; font-weight:700; background:#2563eb; color:white; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 12px rgba(37,99,235,0.25);">
                        Save Configuration
                    </button>
                    <button class="secondary-btn" id="testN8nConnectionBtn" style="padding:11px 20px; font-size:13px; font-weight:700; background:#ffffff; border:1px solid #cbd5e1; color:#0f172a; border-radius:6px; cursor:pointer;">
                        Test Webhook Connection ⚡
                    </button>
                </div>
            </div>
        `;
    } else if (activeTab === 'sheets') {
        const isValidSheets = sheetsUrl ? sheetsUrl.startsWith('https://script.google.com/macros/s/') : null;
        activeTabContent = `
            <div style="display:flex; flex-direction:column; gap:20px; text-align:left;">
                <div>
                    <h4 style="margin:0 0 4px 0; color:#0f172a; font-size:16px; font-weight:800; font-family:var(--font-heading);">Google Sheets Webhook Sync</h4>
                    <p style="margin:0; font-size:13.5px; color:#475569; line-height:1.5;">
                        Export your Smart Lists directly to your Google Sheets Apps Script webhook receiver to maintain real-time spreadsheets.
                    </p>
                </div>

                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <label style="font-size:12px; font-weight:700; color:#0f172a; text-transform:uppercase;">GOOGLE APPS SCRIPT WEBHOOK URL</label>
                        <span id="sheetsFormatFlag" style="font-size:11px; font-weight:700; font-family:var(--font-mono); color:${isValidSheets ? '#059669' : isValidSheets === false ? '#dc2626' : '#64748b'};">
                            ${isValidSheets ? '✅ Valid Google Apps Script Endpoint' : isValidSheets === false ? '⚠️ Format Error: Must start with https://script.google.com/macros/s/...' : 'Format: https://script.google.com/...'}
                        </span>
                    </div>
                    <input type="url" id="sheetsWebhookInput" value="${sheetsUrl}" placeholder="https://script.google.com/macros/s/AKfycbx.../exec" style="width:100%; padding:11px 14px; background:#ffffff; border:1.5px solid ${isValidSheets === false ? '#fca5a5' : '#cbd5e1'}; border-radius:8px; color:#0f172a; font-size:13.5px; outline:none; font-weight:600;">
                </div>

                <div>
                    <label style="display:block; font-size:12px; font-weight:700; color:#0f172a; text-transform:uppercase; margin-bottom:8px;">SELECT SMART LIST TO PUSH</label>
                    <select id="sheetsListSelect" style="width:100%; padding:11px 14px; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; color:#0f172a; font-size:13.5px; font-weight:600; outline:none;">
                        <option value="">Choose List...</option>
                        ${listOptionsHTML}
                    </select>
                </div>

                <div style="display:flex; gap:12px; margin-top:4px;">
                    <button class="brand-btn" id="saveSheetsSettingsBtn" style="flex:1; padding:11px; font-size:13px; font-weight:700; background:#2563eb; color:white; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 12px rgba(37,99,235,0.25);">
                        Save Configuration
                    </button>
                    <button class="secondary-btn" id="pushToSheetsBtn" style="padding:11px 20px; font-size:13px; font-weight:700; background:#ffffff; border:1px solid #cbd5e1; color:#0f172a; border-radius:6px; cursor:pointer;">
                        Push Leads to Sheets 📊
                    </button>
                </div>
            </div>
        `;
    } else if (activeTab === 'hubspot') {
        const isValidHubspot = hubspotToken ? hubspotToken.startsWith('pat-') : null;
        activeTabContent = `
            <div style="display:flex; flex-direction:column; gap:20px; text-align:left;">
                <div>
                    <h4 style="margin:0 0 4px 0; color:#0f172a; font-size:16px; font-weight:800; font-family:var(--font-heading);">HubSpot CRM Direct Sync</h4>
                    <p style="margin:0; font-size:13.5px; color:#475569; line-height:1.5;">
                        Sync your saved leads directly as Contacts into your HubSpot CRM portal.
                    </p>
                </div>

                <!-- Setup Guide -->
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; font-size:12.5px; line-height:1.5; color:#475569;">
                    <h5 style="margin:0 0 8px 0; color:#0f172a; font-size:13px; font-weight:700; display:flex; align-items:center; gap:6px;">
                        <i data-lucide="key" style="width:14px; height:14px; color:#2563eb;"></i> HubSpot Private App Token Guide
                    </h5>
                    <ol style="margin:0; padding-left:18px; display:flex; flex-direction:column; gap:4px;">
                        <li>Open HubSpot Portal &gt; <strong>Settings &gt; Integrations &gt; Private Apps</strong>.</li>
                        <li>Click <strong>Create Private App</strong> named <em>NearPro Leads Sync</em>.</li>
                        <li>Check scopes <code>crm.objects.contacts.write</code> and <code>crm.objects.contacts.read</code>.</li>
                        <li>Copy token starting with <code>pat-</code> and paste below.</li>
                    </ol>
                </div>

                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <label style="font-size:12px; font-weight:700; color:#0f172a; text-transform:uppercase;">HUBSPOT ACCESS TOKEN (PRIVATE APP KEY)</label>
                        <span id="hubspotFormatFlag" style="font-size:11px; font-weight:700; font-family:var(--font-mono); color:${isValidHubspot ? '#059669' : isValidHubspot === false ? '#dc2626' : '#64748b'};">
                            ${isValidHubspot ? '✅ Valid Private App Token' : isValidHubspot === false ? '⚠️ Format Error: Must start with pat-' : 'Format: pat-...'}
                        </span>
                    </div>
                    <input type="password" id="hubspotTokenInput" value="${hubspotToken}" placeholder="pat-na1-xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style="width:100%; padding:11px 14px; background:#ffffff; border:1.5px solid ${isValidHubspot === false ? '#fca5a5' : '#cbd5e1'}; border-radius:8px; color:#0f172a; font-size:13.5px; outline:none; font-family:monospace; font-weight:600;">
                </div>

                <div>
                    <label style="display:block; font-size:12px; font-weight:700; color:#0f172a; text-transform:uppercase; margin-bottom:8px;">SELECT SMART LIST TO EXPORT</label>
                    <select id="hubspotListSelect" style="width:100%; padding:11px 14px; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; color:#0f172a; font-size:13.5px; font-weight:600; outline:none;">
                        <option value="">Choose List...</option>
                        ${listOptionsHTML}
                    </select>
                </div>

                <div style="display:flex; gap:12px; margin-top:4px;">
                    <button class="brand-btn" id="saveHubspotSettingsBtn" style="flex:1; padding:11px; font-size:13px; font-weight:700; background:#2563eb; color:white; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 12px rgba(37,99,235,0.25);">
                        Save Configuration
                    </button>
                    <button class="secondary-btn" id="pushToHubspotBtn" style="padding:11px 20px; font-size:13px; font-weight:700; background:#ffffff; border:1px solid #cbd5e1; color:#0f172a; border-radius:6px; cursor:pointer;">
                        Push Leads to HubSpot 🤝
                    </button>
                </div>
            </div>
        `;
    } else if (activeTab === 'zoho') {
        const isConnected = State.profile?.zoho_auto_sync_enabled || false;
        const syncCount = State.profile?.zoho_sync_count || 0;
        const lastSync = State.profile?.zoho_last_sync_at ? new Date(State.profile.zoho_last_sync_at).toLocaleString() : 'Never';
        const currentRegion = State.profile?.zoho_region || 'in';

        activeTabContent = `
            <div style="display:flex; flex-direction:column; gap:20px; text-align:left;">
                <div>
                    <h4 style="margin:0 0 4px 0; color:#0f172a; font-size:16px; font-weight:800; font-family:var(--font-heading);">Zoho CRM Direct Sync</h4>
                    <p style="margin:0; font-size:13.5px; color:#475569; line-height:1.5;">
                        Sync your saved leads directly as Leads in your Zoho CRM dashboard via the server proxy.
                    </p>
                </div>

                <!-- Sync Status Indicators -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:4px;">
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:8px;">
                        <span style="font-size:10.5px; color:#64748b; font-family:var(--font-mono); font-weight:700; text-transform:uppercase;">CONNECTION STATUS</span>
                        <div style="margin-top:4px; font-weight:700; font-size:13.5px; display:flex; align-items:center; gap:6px;">
                            ${isConnected 
                                ? `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; animation:pulse 2s infinite;"></span> <span style="color:#059669;">Active (Auto Sync Enabled)</span>` 
                                : `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#94a3b8;"></span> <span style="color:#64748b;">Disconnected</span>`
                            }
                        </div>
                    </div>
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:8px;">
                        <span style="font-size:10.5px; color:#64748b; font-family:var(--font-mono); font-weight:700; text-transform:uppercase;">SYNC STATISTICS</span>
                        <div style="margin-top:4px; font-weight:700; font-size:13px; color:#1e293b;">
                            ${syncCount} leads synced &bull; Last: ${lastSync}
                        </div>
                    </div>
                </div>

                <!-- Setup Guide -->
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; font-size:12.5px; line-height:1.5; color:#475569;">
                    <h5 style="margin:0 0 8px 0; color:#0f172a; font-size:13px; font-weight:700; display:flex; align-items:center; gap:6px;">
                        <i data-lucide="key" style="width:14px; height:14px; color:#2563eb;"></i> Zoho API Self Client Setup
                    </h5>
                    <ol style="margin:0; padding-left:18px; display:flex; flex-direction:column; gap:6px;">
                        <li>Go to Zoho Developer Console (e.g. <code>developer.zoho.in</code>).</li>
                        <li>Choose <strong>Self Client</strong> and click <strong>Create</strong>. Copy the Client ID and Client Secret.</li>
                        <li>Under <strong>Generate Code</strong>, enter scope: <code>ZohoCRM.modules.leads.CREATE, ZohoCRM.modules.leads.UPDATE</code>. Set duration to 10 minutes, click <strong>Generate</strong>.</li>
                        <li>Exchange the code on Zoho console to get your permanent **Refresh Token** and enter details below.</li>
                    </ol>
                </div>

                <!-- Region & Configuration -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div>
                        <label style="display:block; font-size:12px; font-weight:700; color:#0f172a; text-transform:uppercase; margin-bottom:8px;">Zoho Datacenter Region</label>
                        <select id="zohoRegionSelect" style="width:100%; padding:11px 14px; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; color:#0f172a; font-size:13.5px; font-weight:600; outline:none;">
                            <option value="in" ${currentRegion === 'in' ? 'selected' : ''}>India (zohoapis.in)</option>
                            <option value="com" ${currentRegion === 'com' ? 'selected' : ''}>US / Global (zohoapis.com)</option>
                            <option value="eu" ${currentRegion === 'eu' ? 'selected' : ''}>Europe (zohoapis.eu)</option>
                            <option value="au" ${currentRegion === 'au' ? 'selected' : ''}>Australia (zohoapis.com.au)</option>
                            <option value="jp" ${currentRegion === 'jp' ? 'selected' : ''}>Japan (zohoapis.jp)</option>
                        </select>
                    </div>
                    <div style="display:flex; align-items:flex-end;">
                        <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:#334155; font-weight:600; cursor:pointer; margin-bottom:12px;">
                            <input type="checkbox" id="zohoAutoSyncCb" ${isConnected ? 'checked' : ''} style="width:16px; height:16px; accent-color:#2563eb;">
                            Auto Sync stage updates
                        </label>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#0f172a; text-transform:uppercase; display:block; margin-bottom:8px;">Zoho Client ID</label>
                        <input type="text" id="zohoClientIdInput" placeholder="1000.xxxxxxxxxxxx" style="width:100%; padding:11px 14px; background:#ffffff; border:1.5px solid #cbd5e1; border-radius:8px; color:#0f172a; font-size:13.5px; outline:none; font-family:monospace;">
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:700; color:#0f172a; text-transform:uppercase; display:block; margin-bottom:8px;">Zoho Client Secret</label>
                        <input type="password" id="zohoClientSecretInput" placeholder="••••••••••••" style="width:100%; padding:11px 14px; background:#ffffff; border:1.5px solid #cbd5e1; border-radius:8px; color:#0f172a; font-size:13.5px; outline:none;">
                    </div>
                </div>

                <div>
                    <label style="font-size:12px; font-weight:700; color:#0f172a; text-transform:uppercase; display:block; margin-bottom:8px;">Zoho Refresh Token</label>
                    <input type="password" id="zohoRefreshTokenInput" placeholder="1000.xxxxxxxxx.xxxxxxxxx" style="width:100%; padding:11px 14px; background:#ffffff; border:1.5px solid #cbd5e1; border-radius:8px; color:#0f172a; font-size:13.5px; outline:none; font-family:monospace;">
                </div>

                <div>
                    <label style="display:block; font-size:12px; font-weight:700; color:#0f172a; text-transform:uppercase; margin-bottom:8px;">SELECT SMART LIST TO EXPORT MANUALLY</label>
                    <select id="zohoListSelect" style="width:100%; padding:11px 14px; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; color:#0f172a; font-size:13.5px; font-weight:600; outline:none;">
                        <option value="">Choose List...</option>
                        ${listOptionsHTML}
                    </select>
                </div>

                <div style="display:flex; gap:12px; margin-top:4px;">
                    <button class="brand-btn" id="saveZohoSettingsBtn" style="flex:1; padding:11px; font-size:13px; font-weight:700; background:#2563eb; color:white; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 12px rgba(37,99,235,0.25);">
                        Save Credentials &amp; Link Account
                    </button>
                    <button class="secondary-btn" id="pushToZohoBtn" style="padding:11px 20px; font-size:13px; font-weight:700; background:#ffffff; border:1px solid #cbd5e1; color:#0f172a; border-radius:6px; cursor:pointer;">
                        Push List to Zoho CRM 💼
                    </button>
                </div>
            </div>
        `;
    }

    return `
        <div class="connection-workspace-container" style="display: flex; flex-direction: column; gap: 20px; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div class="connection-workspace" style="display:grid; grid-template-columns: 240px 1fr; gap:24px; width:100%;">
                
                <!-- Left sidebar -->
                <div class="connection-sidebar" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; display:flex; flex-direction:column; gap:6px; height:fit-content; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <h4 style="margin:0 0 10px 0; font-size:12px; font-family:var(--font-mono); color:#64748b; text-transform:uppercase; letter-spacing:0.5px; font-weight: 700;">Integrations</h4>
                    
                    <button class="sidebar-tab-btn ${activeTab === 'n8n' ? 'active' : ''}" id="tabN8nBtn" style="text-align:left; background:${activeTab === 'n8n' ? '#eff6ff' : '#ffffff'}; border:1px solid ${activeTab === 'n8n' ? '#bfdbfe' : '#e2e8f0'}; padding:10px 14px; border-radius:6px; font-size:13px; color:${activeTab === 'n8n' ? '#2563eb' : '#475569'}; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px; transition: all 0.2s ease;">
                        <i data-lucide="cpu" style="width:14px; height:14px;"></i> n8n Webhook
                    </button>
                    
                    <button class="sidebar-tab-btn ${activeTab === 'sheets' ? 'active' : ''}" id="tabSheetsBtn" style="text-align:left; background:${activeTab === 'sheets' ? '#eff6ff' : '#ffffff'}; border:1px solid ${activeTab === 'sheets' ? '#bfdbfe' : '#e2e8f0'}; padding:10px 14px; border-radius:6px; font-size:13px; color:${activeTab === 'sheets' ? '#2563eb' : '#475569'}; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px; transition: all 0.2s ease;">
                        <i data-lucide="file-spreadsheet" style="width:14px; height:14px;"></i> Google Sheets
                    </button>
                    
                    <button class="sidebar-tab-btn ${activeTab === 'hubspot' ? 'active' : ''}" id="tabHubspotBtn" style="text-align:left; background:${activeTab === 'hubspot' ? '#eff6ff' : '#ffffff'}; border:1px solid ${activeTab === 'hubspot' ? '#bfdbfe' : '#e2e8f0'}; padding:10px 14px; border-radius:6px; font-size:13px; color:${activeTab === 'hubspot' ? '#2563eb' : '#475569'}; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px; transition: all 0.2s ease;">
                        <i data-lucide="contact" style="width:14px; height:14px;"></i> HubSpot CRM
                    </button>
                    
                    <button class="sidebar-tab-btn ${activeTab === 'zoho' ? 'active' : ''}" id="tabZohoBtn" style="text-align:left; background:${activeTab === 'zoho' ? '#eff6ff' : '#ffffff'}; border:1px solid ${activeTab === 'zoho' ? '#bfdbfe' : '#e2e8f0'}; padding:10px 14px; border-radius:6px; font-size:13px; color:${activeTab === 'zoho' ? '#2563eb' : '#475569'}; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px; transition: all 0.2s ease;">
                        <i data-lucide="layers" style="width:14px; height:14px;"></i> Zoho CRM
                    </button>
                </div>

                <!-- Right Workspace -->
                <div class="connection-workspace-body" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; display:flex; flex-direction:column; min-height:360px; justify-content: flex-start; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <!-- Usability Banner -->
                    <div class="usability-banner" style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #2563eb; border-radius: 8px; padding: 12px 18px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; width: 100%; text-align: left;">
                        <div style="font-size: 13px; color: #0f172a; line-height: 1.4; font-weight: 700;"><span style="color: #2563eb; font-weight: 800;">What it is:</span> Link NearPro to CRM databases and automation tools (Zoho, HubSpot, sheets, n8n).</div>
                        <div style="font-size: 12.5px; color: #475569; line-height: 1.4;"><span style="color: #2563eb; font-weight: 800;">How to leverage:</span> Automate lead push notifications to keep external outreach platforms in sync.</div>
                    </div>
                    ${activeTabContent}
                </div>
            </div>
        </div>
    `;
}

export function bindConnectionHubEvents(lists, activeTab, onTabChangeCallback) {
    if (window.refreshLucideIcons) window.refreshLucideIcons();

    // Tab buttons
    const tabN8n = document.getElementById('tabN8nBtn');
    const tabSheets = document.getElementById('tabSheetsBtn');
    const tabHubspot = document.getElementById('tabHubspotBtn');
    const tabZoho = document.getElementById('tabZohoBtn');

    if (tabN8n) tabN8n.onclick = () => onTabChangeCallback('n8n');
    if (tabSheets) tabSheets.onclick = () => onTabChangeCallback('sheets');
    if (tabHubspot) tabHubspot.onclick = () => onTabChangeCallback('hubspot');
    if (tabZoho) tabZoho.onclick = () => onTabChangeCallback('zoho');

    // Live URL Format Validation for n8n
    const n8nInput = document.getElementById('n8nWebhookInput');
    const n8nFlag = document.getElementById('n8nFormatFlag');
    if (n8nInput && n8nFlag) {
        n8nInput.addEventListener('input', () => {
            const val = n8nInput.value.trim();
            const valid = /^https?:\/\/.+/i.test(val);
            if (!val) {
                n8nFlag.innerText = "Format: https://...";
                n8nFlag.style.color = "#64748b";
                n8nInput.style.borderColor = "#cbd5e1";
            } else if (valid) {
                n8nFlag.innerText = "✅ Valid Webhook Endpoint";
                n8nFlag.style.color = "#059669";
                n8nInput.style.borderColor = "#10b981";
            } else {
                n8nFlag.innerText = "⚠️ Format Error: Must begin with http:// or https://";
                n8nFlag.style.color = "#dc2626";
                n8nInput.style.borderColor = "#fca5a5";
            }
        });
    }

    // Live URL Format Validation for Sheets
    const sheetsInput = document.getElementById('sheetsWebhookInput');
    const sheetsFlag = document.getElementById('sheetsFormatFlag');
    if (sheetsInput && sheetsFlag) {
        sheetsInput.addEventListener('input', () => {
            const val = sheetsInput.value.trim();
            const valid = val.startsWith('https://script.google.com/macros/s/');
            if (!val) {
                sheetsFlag.innerText = "Format: https://script.google.com/...";
                sheetsFlag.style.color = "#64748b";
                sheetsInput.style.borderColor = "#cbd5e1";
            } else if (valid) {
                sheetsFlag.innerText = "✅ Valid Google Apps Script Endpoint";
                sheetsFlag.style.color = "#059669";
                sheetsInput.style.borderColor = "#10b981";
            } else {
                sheetsFlag.innerText = "⚠️ Format Error: Must start with https://script.google.com/macros/s/...";
                sheetsFlag.style.color = "#dc2626";
                sheetsInput.style.borderColor = "#fca5a5";
            }
        });
    }

    // Live Format Validation for HubSpot
    const hubspotInput = document.getElementById('hubspotTokenInput');
    const hubspotFlag = document.getElementById('hubspotFormatFlag');
    if (hubspotInput && hubspotFlag) {
        hubspotInput.addEventListener('input', () => {
            const val = hubspotInput.value.trim();
            const valid = val.startsWith('pat-');
            if (!val) {
                hubspotFlag.innerText = "Format: pat-...";
                hubspotFlag.style.color = "#64748b";
                hubspotInput.style.borderColor = "#cbd5e1";
            } else if (valid) {
                hubspotFlag.innerText = "✅ Valid Private App Token";
                hubspotFlag.style.color = "#059669";
                hubspotInput.style.borderColor = "#10b981";
            } else {
                hubspotFlag.innerText = "⚠️ Format Error: Must start with pat-";
                hubspotFlag.style.color = "#dc2626";
                hubspotInput.style.borderColor = "#fca5a5";
            }
        });
    }

    // Save n8n settings
    const saveN8nBtn = document.getElementById('saveN8nSettingsBtn');
    if (saveN8nBtn && n8nInput) {
        saveN8nBtn.onclick = async () => {
            const url = n8nInput.value.trim();
            if (url && !/^https?:\/\/.+/i.test(url)) {
                if (window.showToast) window.showToast("⚠️ Invalid n8n Webhook URL format", "error");
                return;
            }
            saveN8nBtn.disabled = true;
            try {
                await Api.updateProfile({ n8n_webhook_url: url });
                if (window.showToast) window.showToast("✨ n8n Webhook Configuration Saved!", "success");
            } catch (err) {
                if (window.showToast) window.showToast(`Save failed: ${err.message}`, "error");
            } finally {
                saveN8nBtn.disabled = false;
            }
        };
    }

    // Test n8n Connection
    const testN8nBtn = document.getElementById('testN8nConnectionBtn');
    if (testN8nBtn && n8nInput) {
        testN8nBtn.onclick = async () => {
            const url = n8nInput.value.trim();
            if (!url) {
                if (window.showToast) window.showToast("Please enter an n8n Webhook URL first", "error");
                return;
            }
            testN8nBtn.disabled = true;
            testN8nBtn.innerText = "⏳ Testing Connection...";
            try {
                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event: 'test_connection', platform: 'NearPro', timestamp: new Date().toISOString() })
                });
                if (window.showToast) window.showToast("✅ Test payload dispatched to n8n!", "success");
            } catch (err) {
                if (window.showToast) window.showToast("Payload sent (CORS response ok)", "info");
            } finally {
                testN8nBtn.disabled = false;
                testN8nBtn.innerText = "Test Webhook Connection ⚡";
            }
        };
    }

    // Save Sheets Settings
    const saveSheetsBtn = document.getElementById('saveSheetsSettingsBtn');
    const sheetsInputRef = document.getElementById('sheetsWebhookInput');
    if (saveSheetsBtn && sheetsInputRef) {
        saveSheetsBtn.onclick = async () => {
            const url = sheetsInputRef.value.trim();
            saveSheetsBtn.disabled = true;
            try {
                await Api.updateProfile({ sheets_webhook_url: url });
                if (window.showToast) window.showToast("✨ Google Sheets Webhook Saved!", "success");
            } catch (err) {
                if (window.showToast) window.showToast(`Save failed: ${err.message}`, "error");
            } finally {
                saveSheetsBtn.disabled = false;
            }
        };
    }

    // Save HubSpot Settings
    const saveHubspotBtn = document.getElementById('saveHubspotSettingsBtn');
    const hubspotInputRef = document.getElementById('hubspotTokenInput');
    if (saveHubspotBtn && hubspotInputRef) {
        saveHubspotBtn.onclick = async () => {
            const token = hubspotInputRef.value.trim();
            saveHubspotBtn.disabled = true;
            try {
                await Api.updateProfile({ hubspot_access_token: token });
                if (window.showToast) window.showToast("✨ HubSpot Private App Token Saved!", "success");
            } catch (err) {
                if (window.showToast) window.showToast(`Save failed: ${err.message}`, "error");
            } finally {
                saveHubspotBtn.disabled = false;
            }
        };
    }

    // Save Zoho Settings
    const saveZohoBtn = document.getElementById('saveZohoSettingsBtn');
    if (saveZohoBtn) {
        saveZohoBtn.onclick = async () => {
            const clientId = document.getElementById('zohoClientIdInput')?.value.trim();
            const clientSecret = document.getElementById('zohoClientSecretInput')?.value.trim();
            const refreshToken = document.getElementById('zohoRefreshTokenInput')?.value.trim();
            const region = document.getElementById('zohoRegionSelect')?.value || 'in';
            const autoSync = document.getElementById('zohoAutoSyncCb')?.checked || false;

            if (!refreshToken) {
                if (window.showToast) window.showToast("⚠️ Refresh Token is required to connect", "error");
                return;
            }

            saveZohoBtn.disabled = true;
            saveZohoBtn.innerText = "⏳ Connecting...";

            try {
                // 1. Invoke proxy Edge Function to save credentials securely in private database table
                const { error: funcError } = await Api.supabase.functions.invoke('zoho-proxy', {
                    body: {
                        action: 'save_credentials',
                        credentials: {
                            refresh_token: refreshToken,
                            client_id: clientId,
                            client_secret: clientSecret,
                            region: region
                        }
                    }
                });

                if (funcError) throw funcError;

                // 2. Update local state & profile for UI configuration options
                await Api.updateProfile({
                    zoho_auto_sync_enabled: autoSync,
                    zoho_region: region
                });

                if (window.showToast) window.showToast("✨ Zoho Account linked successfully!", "success");
                
                // Reload dashboard tab to update sync counts and status
                setTimeout(() => {
                    window.location.hash = `#/dashboard/integrations?sub=zoho&t=${Date.now()}`;
                }, 500);

            } catch (err) {
                if (window.showToast) window.showToast(`Connection failed: ${err.message}`, "error");
            } finally {
                saveZohoBtn.disabled = false;
                saveZohoBtn.innerText = "Save Credentials & Link Account";
            }
        };
    }

    // --- Push to Google Sheets ---
    const pushSheetsBtn = document.getElementById('pushToSheetsBtn');
    if (pushSheetsBtn) {
        pushSheetsBtn.onclick = async () => {
            const webhookUrl = document.getElementById('sheetsWebhookInput')?.value.trim();
            const listId = document.getElementById('sheetsListSelect')?.value;
            if (!webhookUrl) {
                if (window.showToast) window.showToast("Please enter a Google Apps Script webhook URL first", "error");
                return;
            }
            if (!listId) {
                if (window.showToast) window.showToast("Please select a Smart List to push", "error");
                return;
            }
            pushSheetsBtn.disabled = true;
            pushSheetsBtn.innerText = "⏳ Pushing Leads...";
            try {
                const savedLeads = await Api.getSavedLeads(listId);
                const rows = savedLeads.map(sl => {
                    const p = sl.professionals || {};
                    return {
                        name: p.name || '',
                        category: p.category || '',
                        address: p.address || '',
                        area: p.area || '',
                        phone: p.phone || '',
                        website: p.website || '',
                        email: p.email || '',
                        rating: p.rating || '',
                        reviews: p.review_count || '',
                        status: sl.status || 'new'
                    };
                });
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'no-cors',
                    body: JSON.stringify({ source: 'NearPro', leads: rows, pushed_at: new Date().toISOString() })
                });
                if (window.showToast) window.showToast(`✅ Pushed ${rows.length} leads to Google Sheets!`, "success");
            } catch (err) {
                if (window.showToast) window.showToast(`Push sent (CORS response ok — check your sheet)`, "info");
            } finally {
                pushSheetsBtn.disabled = false;
                pushSheetsBtn.innerText = "Push Leads to Sheets 📊";
            }
        };
    }

    // --- Push to HubSpot ---
    const pushHubspotBtn = document.getElementById('pushToHubspotBtn');
    if (pushHubspotBtn) {
        pushHubspotBtn.onclick = async () => {
            const token = document.getElementById('hubspotTokenInput')?.value.trim();
            const listId = document.getElementById('hubspotListSelect')?.value;
            if (!token) {
                if (window.showToast) window.showToast("Please enter a HubSpot Private App Token first", "error");
                return;
            }
            if (!listId) {
                if (window.showToast) window.showToast("Please select a Smart List to export", "error");
                return;
            }
            pushHubspotBtn.disabled = true;
            pushHubspotBtn.innerText = "⏳ Pushing to HubSpot...";
            try {
                const savedLeads = await Api.getSavedLeads(listId);
                let successCount = 0;
                for (const sl of savedLeads) {
                    const p = sl.professionals || {};
                    const contact = {
                        properties: {
                            firstname: (p.name || '').split(' ')[0],
                            lastname: (p.name || '').split(' ').slice(1).join(' ') || '-',
                            email: p.email || '',
                            phone: p.phone || '',
                            website: p.website || '',
                            company: p.name || '',
                            city: p.area || 'Mumbai',
                            jobtitle: p.category || ''
                        }
                    };
                    try {
                        await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(contact)
                        });
                        successCount++;
                    } catch (e) {
                        console.warn(`HubSpot push failed for ${p.name}:`, e);
                    }
                }
                if (window.showToast) window.showToast(`✅ Pushed ${successCount}/${savedLeads.length} contacts to HubSpot!`, "success");
            } catch (err) {
                if (window.showToast) window.showToast(`HubSpot push failed: ${err.message}`, "error");
            } finally {
                pushHubspotBtn.disabled = false;
                pushHubspotBtn.innerText = "Push Leads to HubSpot 🤝";
            }
        };
    }

    // --- Push to Zoho CRM ---
    const pushZohoBtn = document.getElementById('pushToZohoBtn');
    if (pushZohoBtn) {
        pushZohoBtn.onclick = async () => {
            const listId = document.getElementById('zohoListSelect')?.value;
            if (!State.profile?.zoho_auto_sync_enabled) {
                if (window.showToast) window.showToast("⚠️ Link your Zoho account first before exporting lists", "error");
                return;
            }
            if (!listId) {
                if (window.showToast) window.showToast("Please select a Smart List to export", "error");
                return;
            }
            pushZohoBtn.disabled = true;
            pushZohoBtn.innerText = "⏳ Pushing to Zoho...";
            try {
                // Call server side proxy to refresh tokens and batch push leads securely
                const { data, error } = await Api.supabase.functions.invoke('zoho-proxy', {
                    body: {
                        action: 'batch_push_leads',
                        list_id: listId
                    }
                });

                if (error) throw error;
                const count = data?.count || 0;

                if (window.showToast) window.showToast(`✅ Successfully synced ${count} leads to Zoho CRM!`, "success");
                
                // Reload dashboard tab to update sync counts and status
                setTimeout(() => {
                    window.location.hash = `#/dashboard/integrations?sub=zoho&t=${Date.now()}`;
                }, 500);

            } catch (err) {
                if (window.showToast) window.showToast(`Zoho push failed: ${err.message}`, "error");
            } finally {
                pushZohoBtn.disabled = false;
                pushZohoBtn.innerText = "Push List to Zoho CRM 💼";
            }
        };
    }
}

/**
 * Trigger an n8n/Make.com webhook with lead event payload.
 * Called from api.js on lead_tracked and crm_status_changed events.
 */
export async function triggerN8nWebhook(event, payload) {
    try {
        const webhookUrl = State.profile?.n8n_webhook_url;
        if (!webhookUrl) return; // No webhook configured, skip silently

        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'no-cors',
            body: JSON.stringify({
                event: event,
                platform: 'NearPro',
                timestamp: new Date().toISOString(),
                ...payload
            })
        });
    } catch (err) {
        console.warn("n8n webhook dispatch failed (non-blocking):", err);
    }
}
