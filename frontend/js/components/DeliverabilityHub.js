import { State } from '../state.js';
import { Api } from '../api.js';
import { WarmupApi } from '../api/warmup.js';

let activeAccounts = [];
let healthReports = [];
let rotationConfig = null;
let selectedAccountForDns = null;

export function renderDeliverabilityHub() {
    const list = activeAccounts || [];
    const rotation = rotationConfig || { rotation_strategy: 'round_robin', max_daily_per_inbox: 30, enabled: true };
    
    // Calculate overall reputation average
    const repSum = list.reduce((acc, curr) => acc + (curr.reputation_score || 85), 0);
    const overallRep = list.length > 0 ? Math.round(repSum / list.length) : 100;
    
    const overallStatusText = overallRep >= 90 ? 'EXCELLENT' : overallRep >= 80 ? 'GOOD' : overallRep >= 60 ? 'NEEDS ATTENTION' : 'CRITICAL';
    const overallStatusColor = overallRep >= 80 ? '#22c55e' : overallRep >= 60 ? 'var(--accent-gold)' : '#ef4444';

    const accountCardsHTML = list.length === 0 ? `
        <div style="grid-column: 1 / -1; padding: 60px 24px; text-align: center; border: 1px dashed #cbd5e1; border-radius: var(--radius-lg); background: #ffffff;">
            <div style="font-size: 48px; margin-bottom: 20px;">🛡️</div>
            <h3 style="color: #0f172a; font-family: var(--font-heading); font-size: 18px; margin-bottom: 8px;">Connect Sender Email Accounts</h3>
            <p style="color: #475569; font-size: 13.5px; max-width: 440px; margin: 0 auto 24px auto; line-height: 1.5;">
                Start warming up inboxes. Connect SMTP/IMAP servers to rotate sender addresses dynamically and validate DNS records.
            </p>
            <button class="brand-btn" id="deliverAddFirstAccountBtn" style="background: #2563eb; color: white;">+ Connect Account</button>
        </div>
    ` : list.map(acc => {
        const isWarming = acc.warmup_status === 'warming';
        const pct = Math.round((acc.warmup_day / 30) * 100);
        const dnsValid = acc.spf_valid && acc.dkim_valid && acc.dmarc_valid;

        return `
            <div class="deliver-account-card" style="background: #ffffff; border: 1px solid ${dnsValid ? '#e2e8f0' : 'rgba(239, 68, 68, 0.25)'}; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <span style="font-family: var(--font-mono, monospace); font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; color: #475569; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
                            ${acc.provider}
                        </span>
                        
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 12.5px; color: ${acc.reputation_score >= 80 ? '#22c55e' : 'var(--accent-gold)'}; font-weight: 800; font-family: var(--font-mono);">
                                Score: ${acc.reputation_score}%
                            </span>
                            <span style="width: 8px; height: 8px; background: ${isWarming ? 'var(--accent-gold)' : acc.warmup_status === 'warmed' ? '#22c55e' : '#ef4444'}; border-radius: 50%; display: inline-block;"></span>
                        </div>
                    </div>

                    <h4 style="margin: 0 0 4px 0; color: #0f172a; font-family: var(--font-heading); font-size: 15px; font-weight: 800; word-break: break-all;">${acc.email_address}</h4>
                    <p style="margin: 0 0 16px 0; color: #475569; font-size: 12px;">Display Name: ${acc.display_name || 'Not Configured'}</p>
                </div>

                <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; flex-direction: column; gap: 12px;">
                    <!-- Warmup Progress Bar -->
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 4px;">
                            <span>Warmup: Day ${acc.warmup_day}/30 (${acc.warmup_status})</span>
                            <span>Sends today: ${acc.daily_sends_today}/${acc.daily_send_limit}</span>
                        </div>
                        <div style="height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; position: relative;">
                            <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #d97706 0%, #22c55e 100%); border-radius: 10px;"></div>
                        </div>
                    </div>

                    <!-- DNS Checklist Status -->
                    <div style="display: flex; gap: 8px; font-size: 11px; font-weight: 700; color: #475569; flex-wrap: wrap;">
                        <span style="color: ${acc.spf_valid ? '#22c55e' : '#ef4444'};">SPF: ${acc.spf_valid ? '✅' : '❌'}</span>
                        <span style="color: ${acc.dkim_valid ? '#22c55e' : '#ef4444'};">DKIM: ${acc.dkim_valid ? '✅' : '❌'}</span>
                        <span style="color: ${acc.dmarc_valid ? '#22c55e' : '#ef4444'};">DMARC: ${acc.dmarc_valid ? '✅' : '❌'}</span>
                    </div>

                    <div style="display: flex; gap: 6px; justify-content: flex-end; margin-top: 4px;">
                        <button class="brand-btn acc-action-btn toggle-warmup" data-id="${acc.id}" data-status="${acc.warmup_status}" style="padding: 6px 10px; font-size: 11px; font-weight: 700; background: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a;">
                            ${isWarming ? 'Pause Warmup' : 'Start Warmup'}
                        </button>
                        <button class="brand-btn acc-action-btn dns-check" data-id="${acc.id}" data-domain="${acc.email_address.split('@')[1]}" style="padding: 6px 10px; font-size: 11px; font-weight: 700; background: rgba(255,160,0,0.1); border: 1px solid rgba(255,160,0,0.25); color: var(--accent-gold);">
                            Diagnostics
                        </button>
                        <button class="brand-btn acc-action-btn delete" data-id="${acc.id}" style="padding: 6px 10px; font-size: 11px; font-weight: 700; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444;">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Selected domain report layout
    const activeReport = healthReports.find(r => r.id === selectedAccountForDns);
    const domainReportHTML = !activeReport ? `
        <div style="text-align: center; color: #475569; font-size: 13px; padding: 40px 20px;">
            Select "Diagnostics" on any connected email account to scan domain DNS health records.
        </div>
    ` : `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
                <h4 style="margin: 0; font-size: 15px; color: #0f172a; font-family: var(--font-heading); font-weight: 800;">
                    🔍 Health Scan: ${activeReport.domain}
                </h4>
                <span style="font-family: var(--font-mono, monospace); font-size: 12px; font-weight: 800; color: ${activeReport.health_score >= 80 ? '#22c55e' : 'var(--accent-gold)'};">
                    Score: ${activeReport.health_score}/100
                </span>
            </div>

            <!-- DNS details -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; font-weight: 700;">
                        <span style="color: #0f172a;">SPF Record</span>
                        <span style="color: ${activeReport.spf_status === 'pass' ? '#22c55e' : '#ef4444'};">${activeReport.spf_status.toUpperCase()}</span>
                    </div>
                    <code style="font-family: var(--font-mono, monospace); font-size: 11px; color: #475569; display: block; word-break: break-all;">${activeReport.spf_record || 'Missing'}</code>
                </div>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; font-weight: 700;">
                        <span style="color: #0f172a;">DKIM Selector: ${activeReport.dkim_selector}</span>
                        <span style="color: ${activeReport.dkim_status === 'pass' ? '#22c55e' : '#ef4444'};">${activeReport.dkim_status.toUpperCase()}</span>
                    </div>
                    <code style="font-family: var(--font-mono, monospace); font-size: 11px; color: #475569; display: block; word-break: break-all;">Status check queried successfully for selector.</code>
                </div>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; font-weight: 700;">
                        <span style="color: #0f172a;">DMARC Policy</span>
                        <span style="color: ${activeReport.dmarc_status === 'pass' ? '#22c55e' : '#ef4444'};">${activeReport.dmarc_status.toUpperCase()}</span>
                    </div>
                    <code style="font-family: var(--font-mono, monospace); font-size: 11px; color: #475569; display: block; word-break: break-all;">${activeReport.dmarc_record || 'Missing'}</code>
                </div>
            </div>

            <!-- Recommendations list -->
            ${activeReport.recommendations && activeReport.recommendations.length > 0 ? `
                <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="font-size: 12.5px; font-weight: 800; color: #f87171;">⚠️ Required DNS Corrections:</div>
                    ${activeReport.recommendations.map(rec => `
                        <div style="font-size: 12px; color: #475569; line-height: 1.4;">
                            <strong>${rec.title}:</strong> ${rec.action}
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div style="background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.15); border-radius: 8px; padding: 16px; font-size: 12px; color: #22c55e; text-align: center; font-weight: 600;">
                    🛡️ DNS setup is completely healthy and optimized!
                </div>
            `}
        </div>
    `;

    return `
        <div style="max-width: 1200px; display: flex; flex-direction: column; gap: 24px; color: #0f172a; padding-bottom: 40px;">
            
            <!-- Deliverability Overview Header -->
            <div style="background: linear-gradient(135deg, rgba(236,72,153,0.04) 0%, rgba(37,99,235,0.01) 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; box-shadow: 0 4px 30px rgba(0,0,0,0.02);">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <h3 style="margin: 0; font-size: 20px; font-weight: 800; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px; color: #0f172a;">
                        <span>🛡️ Deliverability Hub</span>
                        <span style="font-size: 10px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #22c55e; font-weight: 800; padding: 2px 8px; border-radius: 50px; text-transform: uppercase; font-family: var(--font-mono);">Scout Gated</span>
                    </h3>
                    <p style="margin: 0; font-size: 13.5px; color: #475569;">Validate DNS entries, monitor blacklist occurrences, and warm up email servers to guarantee inbox delivery.</p>
                </div>
                <button class="brand-btn" id="deliverAddAccountBtn" style="background: #2563eb; color: white; font-weight: 800; padding: 10px 20px;">
                    + Connect Account
                </button>
            </div>

            <!-- Health Summary Metric panel -->
            <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 20px; flex-wrap: wrap; align-items: start;">
                
                <!-- Score summary card -->
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <span style="font-size: 11px; color:#475569; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Global Reputation Index</span>
                    
                    <div style="position: relative; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; border: 4px solid #f1f5f9; border-radius: 50%; margin: 8px 0; border-top-color: ${overallStatusColor}; border-right-color: ${overallStatusColor};">
                        <div style="font-size: 32px; font-weight: 800; font-family: var(--font-mono); color: #0f172a;">${overallRep}%</div>
                    </div>
                    
                    <span style="font-size: 14px; font-weight: 800; color: ${overallStatusColor}; letter-spacing: 0.5px;">${overallStatusText}</span>
                    <p style="margin: 0; font-size: 12.5px; color: #475569; line-height: 1.4;">Warmup domain send ramp reduces spam flags automatically.</p>
                </div>

                <!-- Rotation Settings Configuration -->
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                    <h4 style="margin: 0; font-size: 15px; color: #0f172a; font-family: var(--font-heading); font-weight: 800;">
                        🔄 Smart Inbox Rotation Settings
                    </h4>
                    
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px;">Rotation Strategy</label>
                        <select id="deliverRotationStrategy" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none; font-weight: 600;">
                            <option value="round_robin" ${rotation.rotation_strategy === 'round_robin' ? 'selected' : ''}>round-robin (Evenly distribute sends)</option>
                            <option value="weighted" ${rotation.rotation_strategy === 'weighted' ? 'selected' : ''}>weighted rotation (Prioritize high reputation)</option>
                            <option value="random" ${rotation.rotation_strategy === 'random' ? 'selected' : ''}>random picker</option>
                        </select>
                    </div>

                    <div style="display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                        <div>
                            <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Enable Rotation Router</span>
                            <div style="font-size: 11px; color:#475569; margin-top:2px;">Alternate accounts automatically inside sequence outreach campaigns.</div>
                        </div>
                        <label class="s8n-switch-toggle" style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                            <input type="checkbox" id="deliverRotationEnabledCheckbox" ${rotation.enabled ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                            <span class="s8n-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .3s; border-radius: 34px;"></span>
                        </label>
                    </div>
                </div>

            </div>

            <!-- Bottom Split-Screen: Connected Inboxes vs Domain Diagnosis details -->
            <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; align-items: start; flex-wrap: wrap;">
                
                <!-- Left: Connected Accounts -->
                <div>
                    <h3 style="margin: 0 0 16px 0; font-size: 17px; font-family: var(--font-heading); font-weight: 800; color: #0f172a;">Connected Senders</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                        ${accountCardsHTML}
                    </div>
                </div>

                <!-- Right: DNS Diagnosis Report details panel -->
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); color: #0f172a;">
                    ${domainReportHTML}
                </div>

            </div>

        </div>

        <!-- Add account Modal overlay -->
        <div id="addAccountModalOverlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 10000; align-items: center; justify-content: center; padding: 24px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1); color: #0f172a;">
                <div style="padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin:0; font-size: 16px; font-weight:800; font-family:var(--font-heading); color:#0f172a;">Connect Email Account</h3>
                    <button class="brand-btn" id="closeAddAccountModal" style="background:none; border:none; padding:4px; font-size:18px; line-height:1; color:#475569; cursor:pointer;">×</button>
                </div>
                
                <div style="padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px;">
                    <div>
                        <label style="display: block; font-size: 12.5px; font-weight:700; color:#475569; margin-bottom: 6px;">Email Provider</label>
                        <select id="accProviderSelect" style="width:100%; padding: 10px 14px; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; color:#0f172a; font-size:13.5px; outline:none;">
                            <option value="smtp">Custom SMTP Server</option>
                            <option value="gmail">Google Mail (Workspace)</option>
                            <option value="zoho">Zoho Mail</option>
                            <option value="outlook">Microsoft Outlook</option>
                        </select>
                    </div>

                    <div>
                        <label style="display: block; font-size: 12.5px; font-weight:700; color:#475569; margin-bottom: 6px;">Email Address</label>
                        <input type="email" id="accEmailAddressInput" placeholder="you@domain.com" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none;" />
                    </div>

                    <div>
                        <label style="display: block; font-size: 12.5px; font-weight:700; color:#475569; margin-bottom: 6px;">Sender Display Name</label>
                        <input type="text" id="accDisplayNameInput" placeholder="e.g. Shri from NearPro" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none;" />
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display: block; font-size: 12.5px; font-weight:700; color:#475569; margin-bottom: 6px;">SMTP Host</label>
                            <input type="text" id="accSmtpHostInput" placeholder="smtp.mail.com" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none;" />
                        </div>
                        <div>
                            <label style="display: block; font-size: 12.5px; font-weight:700; color:#475569; margin-bottom: 6px;">SMTP Port</label>
                            <input type="number" id="accSmtpPortInput" value="587" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none;" />
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display: block; font-size: 12.5px; font-weight:700; color:#475569; margin-bottom: 6px;">IMAP Host</label>
                            <input type="text" id="accImapHostInput" placeholder="imap.mail.com" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none;" />
                        </div>
                        <div>
                            <label style="display: block; font-size: 12.5px; font-weight:700; color:#475569; margin-bottom: 6px;">SMTP Password</label>
                            <input type="password" id="accPasswordInput" placeholder="••••••••••" style="width: 100%; padding: 10px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13.5px; outline: none;" />
                        </div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:8px; margin-top:4px;">
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12.5px; color:#0f172a;">
                            <input type="checkbox" id="accStartWarmupCheckbox" checked />
                            <span>Start email warmup immediately after connection</span>
                        </label>
                    </div>
                </div>

                <div style="padding: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="brand-btn" id="cancelAddAccBtn" style="padding: 8px 16px; font-size:12.5px; background:#f8fafc; color:#0f172a; border: 1px solid #cbd5e1;">Cancel</button>
                    <button class="brand-btn" id="confirmAddAccBtn" style="padding: 8px 16px; font-size:12.5px; background:#2563eb; color:white; border:none;">Connect Account</button>
                </div>
            </div>
        </div>
    `;
}

export function bindDeliverabilityHubEvents() {
    // 1. Open connect account modal overlay
    const addAccBtn = document.getElementById('deliverAddAccountBtn') || document.getElementById('deliverAddFirstAccountBtn');
    if (addAccBtn) {
        addAccBtn.addEventListener('click', () => {
            const modal = document.getElementById('addAccountModalOverlay');
            if (modal) modal.style.display = 'flex';
        });
    }

    const closeOverlayBtn = document.getElementById('closeAddAccountModal') || document.getElementById('cancelAddAccBtn');
    if (closeOverlayBtn) {
        closeOverlayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('addAccountModalOverlay');
            if (modal) modal.style.display = 'none';
        });
    }

    // 2. Change Provider Autocomplete defaults
    const providerSelect = document.getElementById('accProviderSelect');
    if (providerSelect) {
        providerSelect.addEventListener('change', () => {
            const prov = providerSelect.value;
            const host = document.getElementById('accSmtpHostInput');
            const port = document.getElementById('accSmtpPortInput');
            const imap = document.getElementById('accImapHostInput');
            
            if (prov === 'gmail') {
                if (host) host.value = 'smtp.gmail.com';
                if (port) port.value = '587';
                if (imap) imap.value = 'imap.gmail.com';
            } else if (prov === 'zoho') {
                if (host) host.value = 'smtp.zoho.in';
                if (port) port.value = '465';
                if (imap) imap.value = 'imap.zoho.in';
            } else if (prov === 'outlook') {
                if (host) host.value = 'smtp.office365.com';
                if (port) port.value = '587';
                if (imap) imap.value = 'outlook.office365.com';
            } else {
                if (host) host.value = '';
                if (port) port.value = '587';
                if (imap) imap.value = '';
            }
        });
    }

    // 3. Confirm connect account
    const confirmBtn = document.getElementById('confirmAddAccBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            const email = document.getElementById('accEmailAddressInput')?.value.trim();
            const name = document.getElementById('accDisplayNameInput')?.value.trim();
            const smtpHost = document.getElementById('accSmtpHostInput')?.value.trim();
            const smtpPort = document.getElementById('accSmtpPortInput')?.value || '587';
            const imapHost = document.getElementById('accImapHostInput')?.value.trim();
            const pass = document.getElementById('accPasswordInput')?.value.trim();
            const startWarmup = document.getElementById('accStartWarmupCheckbox')?.checked === true;
            
            if (!email || !pass || !smtpHost || !imapHost) {
                alert("Please fill in Email Address, Password, SMTP and IMAP hosts.");
                return;
            }

            confirmBtn.disabled = true;
            confirmBtn.innerText = 'Connecting...';

            try {
                await WarmupApi.createEmailAccount({
                    email_address: email,
                    display_name: name,
                    provider: providerSelect?.value || 'smtp',
                    smtp_host: smtpHost,
                    smtp_port: smtpPort,
                    imap_host: imapHost,
                    encrypted_password: pass,
                    start_warmup: startWarmup
                });
                
                alert("✨ Account connected successfully!");
                const modal = document.getElementById('addAccountModalOverlay');
                if (modal) modal.style.display = 'none';
                
                await loadDeliverabilityData();
                refreshView();
            } catch (err) {
                console.error("Connect account failed:", err);
                alert(`Connection failed: ${err.message}`);
                confirmBtn.disabled = false;
                confirmBtn.innerText = 'Connect Account';
            }
        });
    }

    // 4. Toggle Warmup Actions (Pause / Resume Warmup)
    document.querySelectorAll('.acc-action-btn.toggle-warmup').forEach(btn => {
        btn.addEventListener('click', async () => {
            const accId = btn.getAttribute('data-id');
            const currentStatus = btn.getAttribute('data-status');
            const nextStatus = currentStatus === 'warming' ? 'paused' : 'warming';
            
            try {
                await WarmupApi.updateEmailAccount(accId, { warmup_status: nextStatus });
                alert(`Email warmup successfully ${nextStatus === 'warming' ? 'resumed' : 'paused'}!`);
                await loadDeliverabilityData();
                refreshView();
            } catch (e) {
                alert(`Action failed: ${e.message}`);
            }
        });
    });

    // 5. Diagnostics Action (Validate DNS)
    document.querySelectorAll('.acc-action-btn.dns-check').forEach(btn => {
        btn.addEventListener('click', async () => {
            const accId = btn.getAttribute('data-id');
            const domain = btn.getAttribute('data-domain');
            
            btn.disabled = true;
            btn.innerText = 'Scanning...';
            
            try {
                const report = await WarmupApi.runSimulatedDNSCheck(domain);
                selectedAccountForDns = report.id;
                
                // Update credentials checklist states
                await WarmupApi.updateEmailAccount(accId, {
                    spf_valid: report.spf_status === 'pass',
                    dkim_valid: report.dkim_status === 'pass',
                    dmarc_valid: report.dmarc_status === 'pass',
                    reputation_score: report.health_score,
                    dns_checked_at: new Date().toISOString()
                });

                alert(`✨ DNS scan complete for domain: ${domain}`);
                await loadDeliverabilityData();
                refreshView();
            } catch (e) {
                alert(`Diagnostics scan failed: ${e.message}`);
                btn.disabled = false;
                btn.innerText = 'Diagnostics';
            }
        });
    });

    // 6. Delete Account Action
    document.querySelectorAll('.acc-action-btn.delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const accId = btn.getAttribute('data-id');
            if (confirm("Are you sure you want to remove this email account from NearPro? This stops all warming activities.")) {
                try {
                    await WarmupApi.deleteEmailAccount(accId);
                    alert("Account successfully deleted.");
                    await loadDeliverabilityData();
                    if (selectedAccountForDns === accId) selectedAccountForDns = null;
                    refreshView();
                } catch (e) {
                    alert(`Deletion failed: ${e.message}`);
                }
            }
        });
    });

    // 7. Rotation config toggle switch
    const rotationCheckbox = document.getElementById('deliverRotationEnabledCheckbox');
    if (rotationCheckbox) {
        rotationCheckbox.addEventListener('change', async () => {
            const isEnabled = rotationCheckbox.checked;
            try {
                if (rotationConfig) {
                    rotationConfig = await WarmupApi.updateRotationConfig(rotationConfig.id, { enabled: isEnabled });
                }
                if (window.showToast) window.showToast(`✨ Smart rotation router ${isEnabled ? 'enabled' : 'disabled'}`, 'success');
            } catch (e) {
                rotationCheckbox.checked = !isEnabled;
                alert(`Failed to update rotation config: ${e.message}`);
            }
        });
    }

    // 8. Strategy change
    const rotationSelect = document.getElementById('deliverRotationStrategy');
    if (rotationSelect) {
        rotationSelect.addEventListener('change', async () => {
            const strategy = rotationSelect.value;
            try {
                if (rotationConfig) {
                    rotationConfig = await WarmupApi.updateRotationConfig(rotationConfig.id, { rotation_strategy: strategy });
                }
                if (window.showToast) window.showToast(`✨ Rotation strategy updated`, 'success');
            } catch (e) {
                alert(`Failed to update rotation strategy: ${e.message}`);
            }
        });
    }
}

async function loadDeliverabilityData() {
    try {
        activeAccounts = await WarmupApi.getEmailAccounts();
        healthReports = await WarmupApi.getDomainHealthReports();
        rotationConfig = await WarmupApi.getRotationConfig();
    } catch (e) {
        console.warn("Failed to load warmup accounts:", e);
        activeAccounts = [];
    }
}

function refreshView() {
    const content = document.getElementById('dashboardContent');
    if (content) {
        content.innerHTML = renderDeliverabilityHub();
        bindDeliverabilityHubEvents();
        if (window.refreshLucideIcons) window.refreshLucideIcons();
    }
}

// Fetch lists on mount
(async () => {
    await loadDeliverabilityData();
})();
