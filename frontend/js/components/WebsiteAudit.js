import { State } from '../state.js';
import { Api } from '../api.js';

export function renderWebsiteAudit(leadsWithWebsites, activeAuditLeadId = null, auditResult = null, loading = false) {
    // Render left list of leads with websites
    const leadsHTML = leadsWithWebsites.map(lead => {
        const isActive = activeAuditLeadId === lead.id;
        const activeClass = isActive ? 'active' : '';
        const badgeHTML = lead.audit_cached 
            ? '<span class="crm-dot filled" style="background:#10b981; margin-left:auto;" title="Audit cached"></span>' 
            : '';

        return `
            <div class="audit-lead-item ${activeClass}" data-id="${lead.id}">
                <div style="flex:1; min-width:0;">
                    <h5 style="margin:0 0 2px 0; font-size:13px; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lead.name}</h5>
                    <p style="margin:0; font-size:11px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lead.website}</p>
                </div>
                ${badgeHTML}
            </div>
        `;
    }).join('');

    const emptyLeadsHTML = leadsWithWebsites.length === 0 ? `
        <div style="padding:40px 12px; text-align:center; color:var(--text-muted); font-size:13px;">
            No saved leads have websites. Go to the Browse Directory page, find leads with websites, and save them.
        </div>
    ` : '';

    // Render right audit workspace
    let workspaceHTML = '';
    if (loading) {
        workspaceHTML = `
            <div class="audit-empty-state">
                <div class="spinner" style="width:40px; height:40px; border-width:3px;"></div>
                <h4 style="margin:16px 0 6px 0; color:white;">Auditing Website</h4>
                <p style="color:var(--text-muted); font-size:13px;">Running Google PageSpeed analysis and checking local search compliance...</p>
            </div>
        `;
    } else if (auditResult) {
        const score = auditResult.page_speed_score || 0;
        let scoreColor = '#ef4444'; // Red
        if (score >= 80) scoreColor = '#10b981'; // Green
        else if (score >= 50) scoreColor = '#eab308'; // Yellow

        const gapsHTML = (auditResult.gaps || []).map(gap => `
            <li class="audit-gap-item">❌ ${gap}</li>
        `).join('');

        workspaceHTML = `
            <div class="audit-results-dashboard">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <h4 style="margin:0; font-size:16px; color:white; font-family:var(--font-heading);">Audit Report for ${auditResult.url}</h4>
                    <span style="font-size:11px; font-family:var(--font-mono); color:var(--text-muted);">TTL Expires in 7 Days</span>
                </div>

                <div class="audit-metrics-row">
                    <!-- Progress Radial -->
                    <div class="metric-radial-box">
                        <div class="radial-progress-circle" style="--score-pct:${score}%; --score-color:${scoreColor};">
                            <span class="radial-score-value">${score}</span>
                        </div>
                        <span style="font-size:12px; color:var(--text-secondary); margin-top:8px; font-weight:500;">PageSpeed Score</span>
                    </div>

                    <!-- Grid of checks -->
                    <div class="audit-checks-grid">
                        <div class="check-box">
                            <span class="check-icon">${auditResult.mobile_friendly ? '✅' : '❌'}</span>
                            <div class="check-info">
                                <span class="check-label">Mobile Friendly</span>
                                <span class="check-status">${auditResult.mobile_friendly ? 'Optimized' : 'Failing'}</span>
                            </div>
                        </div>
                        <div class="check-box">
                            <span class="check-icon">${auditResult.has_https ? '✅' : '❌'}</span>
                            <div class="check-info">
                                <span class="check-label">HTTPS Active</span>
                                <span class="check-status">${auditResult.has_https ? 'Secure' : 'Unsecured'}</span>
                            </div>
                        </div>
                        <div class="check-box">
                            <span class="check-icon">${auditResult.has_schema ? '✅' : '❌'}</span>
                            <div class="check-info">
                                <span class="check-label">Structured Schema</span>
                                <span class="check-status">${auditResult.has_schema ? 'JSON LD active' : 'Missing'}</span>
                            </div>
                        </div>
                        <div class="check-box">
                            <span class="check-icon">⚡</span>
                            <div class="check-info">
                                <span class="check-label">Load Time</span>
                                <span class="check-status">${(auditResult.load_time_ms / 1000).toFixed(1)} seconds</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Lost Revenue Block -->
                <div class="lost-revenue-box">
                    <div style="flex-shrink:0; display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); font-weight:700; color:#ef4444; font-size:18px; font-family:var(--font-heading);">₹</div>
                    <div>
                        <h5 style="margin:0 0 4px 0; color:#ef4444; font-size:14px; font-family:var(--font-heading);">Estimated Monthly Revenue Leakage</h5>
                        <p style="margin:0; font-size:12px; color:var(--text-secondary); line-height:1.4;">
                            Your slow speed is losing you customers. Based on a 200 visits index, you are leaking around <strong style="color:white; font-size:14px;">₹${auditResult.est_lost_revenue_per_month.toLocaleString('en-IN')} per month</strong> in bookings.
                        </p>
                    </div>
                </div>

                <!-- Gaps Panel -->
                <div class="audit-section-panel" style="margin-top:24px;">
                    <h5 class="panel-section-title">Critical Gaps Detected</h5>
                    <ul class="audit-gaps-list">
                        ${gapsHTML}
                    </ul>
                </div>

                <!-- Action CTA -->
                <div style="margin-top:24px; display:flex; gap:12px;">
                    <button class="brand-btn" id="auditLaunchOutreachBtn" data-id="${activeAuditLeadId}" style="flex:1; padding:12px;">
                        Launch AI Outreach Campaign
                    </button>
                </div>
            </div>
        `;
    } else if (activeAuditLeadId) {
        const lead = leadsWithWebsites.find(l => l.id === activeAuditLeadId);
        workspaceHTML = `
            <div class="audit-empty-state">
                <div style="margin-bottom:12px; display:flex; justify-content:center;">
                    <i data-lucide="trending-up" style="width:40px; height:40px; color:var(--text-secondary); stroke-width:1.5px;"></i>
                </div>
                <h4 style="margin:0 0 6px 0; color:white;">Ready to inspect ${lead.name}</h4>
                <p style="color:var(--text-muted); font-size:13px; margin-bottom:20px;">We will check PageSpeed metrics, mobile compliance, and SSL status.</p>
                <button class="brand-btn" id="runHealthCheckBtn" data-id="${lead.id}" data-url="${lead.website}" style="padding:10px 20px;">
                    Run Business Health Check
                </button>
            </div>
        `;
    } else {
        workspaceHTML = `
            <div class="audit-empty-state">
                <div style="margin-bottom:12px; display:flex; justify-content:center;">
                    <i data-lucide="shield-check" style="width:40px; height:40px; color:var(--text-secondary); stroke-width:1.5px;"></i>
                </div>
                <h4 style="margin:0 0 6px 0; color:white;">Business Health Checker</h4>
                <p style="color:var(--text-muted); font-size:13px; max-width:280px;">Select a verified business lead from the left list to run a website performance audit.</p>
            </div>
        `;
    }

    return `
        <div class="audit-workspace" style="display:grid; grid-template-columns: 280px 1fr; gap:24px; height:100%;">
            <!-- Left List -->
            <div class="audit-leads-sidebar" style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px; display:flex; flex-direction:column; gap:10px; overflow-y:auto; max-height:calc(100vh - 160px);">
                <h4 style="margin:0 0 8px 0; font-size:13px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">Leads with Websites</h4>
                <div class="audit-leads-list" style="display:flex; flex-direction:column; gap:6px;">
                    ${leadsHTML}
                    ${emptyLeadsHTML}
                </div>
            </div>

            <!-- Right Workspace -->
            <div class="audit-workspace-body" style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-md); padding:28px; display:flex; flex-direction:column; min-height:400px; max-height:calc(100vh - 160px); overflow-y:auto; justify-content: flex-start;">
                <!-- Usability Banner -->
                <div class="usability-banner" style="background: rgba(255, 160, 0, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 18px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 4px; border-left: 3px solid var(--accent-gold); flex-shrink: 0; width: 100%; text-align: left;">
                    <div style="font-size: 12.5px; color: white; line-height: 1.4;"><span style="color: var(--accent-gold); font-weight: 600;">What it is:</span> Audit website speed metrics, SSL status, and structured schema compliance.</div>
                    <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;"><span style="color: var(--accent-gold); font-weight: 600;">How to leverage:</span> Use calculated monthly revenue leakage figures as hook indicators to secure client pitches.</div>
                </div>
                ${workspaceHTML}
            </div>
        </div>
    `;
}

export function bindWebsiteAuditEvents(onAuditRequestCallback) {
    // Process Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const leadItems = document.querySelectorAll('.audit-lead-item');
    leadItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            window.location.hash = `#/dashboard/audit?lead_id=${id}`;
        });
    });

    const runBtn = document.getElementById('runHealthCheckBtn');
    if (runBtn) {
        runBtn.addEventListener('click', () => {
            const id = runBtn.getAttribute('data-id');
            const url = runBtn.getAttribute('data-url');
            if (onAuditRequestCallback) onAuditRequestCallback(id, url);
        });
    }

    const launchBtn = document.getElementById('auditLaunchOutreachBtn');
    if (launchBtn) {
        launchBtn.addEventListener('click', () => {
            const leadId = launchBtn.getAttribute('data-id');
            window.location.hash = `#/dashboard/outreach?lead_id=${leadId}`;
        });
    }
}
