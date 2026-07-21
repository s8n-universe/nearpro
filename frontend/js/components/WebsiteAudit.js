import { State } from '../state.js';
import { Api } from '../api.js';
import { getUserTier } from '../auth.js';

export const AUDIT_LIMITS = {
    free: 0,
    scout: 10,
    hunter: 50,
    agency: 999999,
    enterprise: 999999
};

export function renderWebsiteAudit(leadsWithWebsites, activeAuditLeadId = null, auditResult = null, loading = false) {
    // Render left list of leads with websites
    const leadsHTML = leadsWithWebsites.map(lead => {
        const isActive = activeAuditLeadId === lead.id;
        const activeClass = isActive ? 'active' : '';
        const badgeHTML = lead.audit_cached 
            ? '<span class="crm-dot filled" style="background:#059669; margin-left:auto;" title="Audit cached"></span>' 
            : '';

        return `
            <div class="audit-lead-item ${activeClass}" data-id="${lead.id}">
                <div style="flex:1; min-width:0;">
                    <h5 style="margin:0 0 2px 0; font-size:13px; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lead.name}</h5>
                    <p style="margin:0; font-size:11px; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lead.website}</p>
                </div>
                ${badgeHTML}
            </div>
        `;
    }).join('');

    const emptyLeadsHTML = leadsWithWebsites.length === 0 ? `
        <div style="padding:40px 12px; text-align:center; color:#64748b; font-size:13px;">
            No saved leads have websites. Go to the Browse Directory page, find leads with websites, and save them.
        </div>
    ` : '';

    // Render right audit workspace
    let workspaceHTML = '';
    if (loading) {
        workspaceHTML = `
            <div class="audit-empty-state" style="text-align: center; padding: 60px 20px;">
                <div class="spinner" style="width:40px; height:40px; border-width:3px; border-top-color: #2563eb; margin: 0 auto 16px auto;"></div>
                <h4 style="margin:16px 0 6px 0; color:#0f172a; font-weight: 700;">Auditing Website Performance</h4>
                <p style="color:#475569; font-size:13.5px;">Running Google PageSpeed analysis and checking local search compliance...</p>
            </div>
        `;
    } else if (auditResult) {
        const score = auditResult.page_speed_score || 0;
        let scoreColor = '#dc2626'; // Red
        if (score >= 80) scoreColor = '#059669'; // Green
        else if (score >= 50) scoreColor = '#d97706'; // Yellow

        const gapsHTML = (auditResult.gaps || []).map(gap => `
            <li class="audit-gap-item" style="color: #0f172a; margin-bottom: 8px; font-size: 13.5px;">❌ ${gap}</li>
        `).join('');

        workspaceHTML = `
            <div class="audit-results-dashboard" style="display: flex; flex-direction: column; gap: 24px;">
                <div class="audit-header-banner" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px 24px; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <div>
                        <h4 style="margin:0; font-size:16px; color:#0f172a; font-family:var(--font-heading); font-weight: 700;">Audit Report for ${auditResult.url}</h4>
                        <p style="margin:4px 0 0 0; font-size:12px; color:#64748b; font-family:var(--font-mono);">Scanned via NearPro Health Check Engine</p>
                    </div>
                </div>

                <div class="audit-metrics-row" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px;">
                    <div class="metric-card" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; text-align:center; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                        <div style="font-size:11px; color:#64748b; font-family:var(--font-mono); text-transform:uppercase; font-weight: 700;">PageSpeed Score</div>
                        <div style="font-size:32px; font-weight:800; color:${scoreColor}; margin-top:6px; font-family:var(--font-mono);">${score}/100</div>
                    </div>
                    <div class="metric-card" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; text-align:center; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                        <div style="font-size:11px; color:#64748b; font-family:var(--font-mono); text-transform:uppercase; font-weight: 700;">Est. Monthly Leak</div>
                        <div style="font-size:24px; font-weight:800; color:#d97706; margin-top:10px; font-family:var(--font-mono);">₹${(auditResult.est_lost_revenue_per_month || 8500).toLocaleString('en-IN')}</div>
                    </div>
                </div>

                <div class="audit-checks-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px;">
                    <div class="check-item-card" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; display:flex; align-items:center; gap:12px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                        <span class="check-icon" style="font-size: 20px;">${auditResult.mobile_friendly ? '✅' : '❌'}</span>
                        <div>
                            <div style="font-size:13px; font-weight:700; color:#0f172a;">Mobile Responsive</div>
                            <span class="check-status" style="font-size:11.5px; color:#64748b;">${auditResult.mobile_friendly ? 'Optimized' : 'Failing'}</span>
                        </div>
                    </div>

                    <div class="check-item-card" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; display:flex; align-items:center; gap:12px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                        <span class="check-icon" style="font-size: 20px;">${auditResult.has_https ? '✅' : '❌'}</span>
                        <div>
                            <div style="font-size:13px; font-weight:700; color:#0f172a;">SSL Security (HTTPS)</div>
                            <span class="check-status" style="font-size:11.5px; color:#64748b;">${auditResult.has_https ? 'Secure' : 'Unsecured'}</span>
                        </div>
                    </div>

                    <div class="check-item-card" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; display:flex; align-items:center; gap:12px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                        <span class="check-icon" style="font-size: 20px;">${auditResult.has_schema ? '✅' : '❌'}</span>
                        <div>
                            <div style="font-size:13px; font-weight:700; color:#0f172a;">Structured Schema Data</div>
                            <span class="check-status" style="font-size:11.5px; color:#64748b;">${auditResult.has_schema ? 'JSON LD active' : 'Missing'}</span>
                        </div>
                    </div>

                    <div class="check-item-card" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; display:flex; align-items:center; gap:12px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                        <span class="check-icon" style="font-size: 20px;">⚡</span>
                        <div>
                            <div style="font-size:13px; font-weight:700; color:#0f172a;">Estimated Load Speed</div>
                            <span class="check-status" style="font-size:11.5px; color:#64748b;">${((auditResult.load_time_ms || 2400) / 1000).toFixed(1)} seconds</span>
                        </div>
                    </div>
                </div>

                <div class="audit-section-panel" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <h5 style="margin:0 0 12px 0; color:#0f172a; font-size:14px; font-weight:700; font-family:var(--font-heading);">Technical Gaps & Conversion Impediments</h5>
                    <ul class="audit-gaps-list" style="margin:0; padding-left:20px; line-height:1.6;">
                        ${gapsHTML}
                    </ul>
                </div>

                <div style="display:flex; gap:12px; margin-top:8px;">
                    <button class="brand-btn" id="auditLaunchOutreachBtn" data-id="${activeAuditLeadId}" style="flex:1; padding:12px; background: #2563eb; color: white; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                        Draft AI Outreach Pitch for this Audit ➔
                    </button>
                </div>
            </div>
        `;
    } else {
        const tier = (getUserTier() || 'free').toLowerCase();
        const currentUsed = State.profile?.monthly_audits_used || 0;
        const maxLimit = AUDIT_LIMITS[tier] || 0;

        if (tier !== 'agency' && tier !== 'enterprise' && currentUsed >= maxLimit) {
            workspaceHTML = `
                <div class="audit-empty-state" style="padding: 40px 20px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 12px; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
                    <div style="font-size: 36px; margin-bottom: 12px;">🚫</div>
                    <h4 style="margin: 0 0 8px 0; color: #0f172a; font-weight: 700;">Monthly Audit Limit Reached</h4>
                    <p style="color: #475569; font-size: 13.5px; max-width: 440px; margin: 0 0 20px 0; line-height: 1.5;">
                        You have completed your ${maxLimit} audits for this month on your ${tier.toUpperCase()} plan. Upgrade now to scan more website URLs.
                    </p>
                    <button class="brand-btn" onclick="window.State.setPricingModal(true);" style="padding: 10px 20px; background: #2563eb; color: white; font-weight: 700; border: none; border-radius: 6px; cursor: pointer;">
                        Upgrade Plan ↗
                    </button>
                </div>
            `;
        } else if (activeAuditLeadId) {
            workspaceHTML = `
                <div class="audit-empty-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 36px; margin-bottom: 12px;">🏥</div>
                    <h4 style="margin:0 0 6px 0; color:#0f172a; font-weight: 700;">Ready to Audit Website</h4>
                    <p style="color:#475569; font-size:13.5px; max-width:380px; margin:0 auto 20px auto; line-height:1.5;">Click below to run a deep PageSpeed, Mobile, and SSL health check audit for this lead.</p>
                    <button class="brand-btn" id="auditRunNowBtn" data-id="${activeAuditLeadId}" style="padding: 10px 24px; background: #2563eb; color: white; font-weight: 700; border: none; border-radius: 6px; cursor: pointer;">Run Health Check Audit ➔</button>
                </div>
            `;
        } else {
            workspaceHTML = `
                <div class="audit-empty-state" style="text-align: center; padding: 60px 20px;">
                    <i data-lucide="mouse-pointer" style="width:36px; height:36px; stroke-width:1.5; margin-bottom:12px; color:#94a3b8;"></i>
                    <h4 style="margin:0 0 6px 0; color:#0f172a; font-size:15px; font-weight: 700;">Select a Lead from Sidebar</h4>
                    <p style="color:#475569; font-size:13.5px; max-width:320px; margin:0 auto; line-height: 1.5;">Select a verified business lead from the left list to run a website performance audit.</p>
                </div>
            `;
        }
    }

    const tier = (getUserTier() || 'free').toLowerCase();
    const currentUsed = State.profile?.monthly_audits_used || 0;
    const maxLimit = AUDIT_LIMITS[tier] || 0;
    let auditCounterText = '';

    if (tier === 'agency' || tier === 'enterprise') {
        auditCounterText = `🟢 <strong>Unlimited website audits</strong> active on your ${tier.toUpperCase()} plan`;
    } else {
        const remaining = Math.max(0, maxLimit - currentUsed);
        auditCounterText = `⚡ Monthly Audits: <strong>${currentUsed}</strong> of <strong>${maxLimit}</strong> used (${remaining} remaining)`;
    }

    const auditCounterHTML = `
        <div class="usage-bar" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 16px; margin-bottom: 20px; font-size: 12.5px; color: #475569; display: flex; align-items: center; justify-content: space-between; width: 100%; border-left: 3px solid #2563eb;">
            <span>${auditCounterText}</span>
            <span style="font-size: 11px; font-family: var(--font-mono); color: #2563eb; font-weight: bold; text-transform: uppercase;">Tier: ${tier}</span>
        </div>
    `;

    return `
        <div class="audit-workspace-container" style="padding: 32px; background: #f8fafc; color: #0f172a; border-radius: var(--radius-lg); border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div class="audit-workspace" style="display:grid; grid-template-columns: 280px 1fr; gap:24px; width:100%;">
                <!-- Left Panel -->
                <div class="audit-leads-sidebar" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; display:flex; flex-direction:column; gap:10px; overflow-y:auto; max-height:calc(100vh - 180px); box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <h4 style="margin:0 0 8px 0; font-size:12px; font-family:var(--font-mono); color:#64748b; text-transform:uppercase; letter-spacing:0.5px; font-weight: 700;">Leads with Websites</h4>
                    <div class="audit-leads-list" style="display:flex; flex-direction:column; gap:6px;">
                        ${leadsHTML}
                        ${emptyLeadsHTML}
                    </div>
                </div>

                <!-- Workspace Panel -->
                <div class="audit-workspace-body" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; display:flex; flex-direction:column; min-height:400px; max-height:calc(100vh - 180px); overflow-y:auto; justify-content: flex-start; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    ${auditCounterHTML}
                    ${workspaceHTML}
                </div>
            </div>
        </div>
    `;
}

export function bindWebsiteAuditEvents(onAuditRequestCallback) {
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const leadItems = document.querySelectorAll('.audit-lead-item');
    leadItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            window.location.hash = `#/dashboard/audit?lead_id=${id}`;
        });
    });

    const runNowBtn = document.getElementById('auditRunNowBtn');
    if (runNowBtn) {
        runNowBtn.addEventListener('click', () => {
            const id = runNowBtn.dataset.id;
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const leadId = searchParams.get('lead_id') || id;
            if (onAuditRequestCallback) {
                const targetLead = State.professionals?.find(p => p.id === leadId);
                onAuditRequestCallback(leadId, targetLead?.website || 'example.com');
            }
        });
    }

    const launchBtn = document.getElementById('auditLaunchOutreachBtn');
    if (launchBtn) {
        launchBtn.addEventListener('click', () => {
            const leadId = launchBtn.dataset.id;
            window.location.hash = `#/dashboard/outreach?lead_id=${leadId}`;
        });
    }
}
