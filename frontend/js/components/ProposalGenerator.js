import { State } from '../state.js';
import { Api } from '../api.js';

export function renderProposalGeneratorLayout(selectedLeadId = null) {
    const userTier = (State.profile?.subscription_tier || State.profile?.tier || 'free').toLowerCase();
    const used = State.profile?.monthly_proposals_used || 0;
    
    let limit = 0;
    if (userTier === 'scout') limit = 3;
    else if (userTier === 'hunter') limit = 25;
    else if (userTier === 'agency') limit = 100;
    else if (userTier === 'enterprise') limit = 999999;

    const isAtLimit = limit > 0 ? (used >= limit) : (userTier === 'free');

    const leads = State.professionals || [];
    const leadOptions = leads.map(l => `
        <option value="${l.id}" ${l.id === selectedLeadId ? 'selected' : ''}>
            ${l.name} (${l.category || l.parent_category || 'Business'}, ${l.rating || 'N/A'}⭐ - ${l.review_count || 0} reviews)
        </option>
    `).join('');

    return `
        <div class="proposal-generator-container" style="display: flex; flex-direction: column; gap: 24px; padding: 24px; color: white; font-family: var(--font-body);">
            
            <!-- Top Quota & Intro Header -->
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 280px;">
                    <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; border-radius: 99px; background: rgba(217, 119, 6, 0.15); border: 1px solid rgba(217, 119, 6, 0.3); color: var(--accent-gold); font-size: 11.5px; font-weight: 700; font-family: var(--font-mono); margin-bottom: 12px;">
                        📄 1-Click Client-Ready PDF Proposal Generator
                    </div>
                    <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 6px 0; font-family: var(--font-heading);">
                        Generate 3-Page Client Audit & Growth Proposal
                    </h2>
                    <p style="color: var(--text-secondary); font-size: 13.5px; margin: 0; max-width: 680px; line-height: 1.5;">
                        Create a beautifully formatted 3-page proposal for any local business lead. Includes Google Maps Audit, Competitor Review Gap, Estimated Revenue Leak, Custom Site Specifications, 3-Tier Packages, and your Consultation Booking CTA.
                    </p>
                </div>
                
                <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px 20px; text-align: right; flex-shrink: 0; min-width: 180px;">
                    <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 4px;">Monthly Proposals Quota</div>
                    <div style="font-size: 20px; font-weight: 700; color: var(--accent-gold); font-family: var(--font-mono);">
                        ${used} / ${limit === 0 ? '0 (Free)' : limit === 999999 ? 'Unlimited' : limit}
                    </div>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
                        Plan: <strong style="text-transform: capitalize; color: white;">${userTier}</strong>
                    </div>
                </div>
            </div>

            <!-- Lead Selection Form -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-md);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; font-family: var(--font-mono);">
                            SELECT TARGET BUSINESS LEAD:
                        </label>
                        <select id="proposalLeadSelect" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none;">
                            ${leadOptions.length > 0 ? leadOptions : '<option value="">-- No directory leads loaded. Please search in Browse Directory --</option>'}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; font-family: var(--font-mono);">
                            ADDITIONAL AGENCY NOTES / HIGHLIGHTS (OPTIONAL):
                        </label>
                        <input type="text" id="proposalCustomNotes" placeholder="e.g. Focus on mobile speed, WhatsApp bookings, and Google review velocity" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none;">
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 16px;">
                    ${isAtLimit ? `
                        <div style="color: #ef4444; font-size: 12.5px; font-family: var(--font-mono);">
                            ⚠️ Monthly proposal limit reached. <a href="#/checkout" style="color: var(--accent-gold); text-decoration: underline;">Upgrade plan ↗</a>
                        </div>
                    ` : ''}
                    <button id="generateProposalBtn" class="brand-btn" style="padding: 12px 24px; font-size: 14px; font-weight: 600; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 8px; cursor: pointer;" ${isAtLimit ? 'disabled' : ''}>
                        <i data-lucide="sparkles" style="width: 16px; height: 16px;"></i>
                        Generate 3-Page Client Proposal
                    </button>
                </div>
            </div>

            <!-- Dynamic Animated Step Loader -->
            <div id="proposalStepLoader" style="display: none; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 40px 24px; text-align: center;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background: rgba(217, 119, 6, 0.15); border: 1px solid rgba(217, 119, 6, 0.3); color: var(--accent-gold); margin-bottom: 20px;">
                    <i data-lucide="loader-2" style="width: 28px; height: 28px; animation: spin 1s linear infinite;"></i>
                </div>
                <h3 id="loaderStepTitle" style="font-size: 18px; font-weight: 700; margin: 0 0 8px 0; font-family: var(--font-heading);">
                    Analyzing business profile & Google Maps social proof...
                </h3>
                <p id="loaderStepSub" style="color: var(--text-muted); font-size: 13.5px; margin: 0 0 24px 0;">
                    Constructing custom 3-page audit breakdown and local competitor review gap...
                </p>
                <div style="max-width: 480px; margin: 0 auto; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; border: 1px solid var(--border);">
                    <div id="loaderProgressBar" style="width: 25%; height: 100%; background: linear-gradient(90deg, var(--accent-gold), #fbbf24); transition: width 0.4s ease;"></div>
                </div>
            </div>

            <!-- Output Proposal Display Area -->
            <div id="proposalResultContainer" style="display: none; flex-direction: column; gap: 24px;"></div>
        </div>
    `;
}

export function bindProposalGeneratorEvents() {
    window._proposalCache = window._proposalCache || {};
    window._activeProposalPromises = window._activeProposalPromises || {};

    const btn = document.getElementById('generateProposalBtn');
    const leadSelect = document.getElementById('proposalLeadSelect');
    const loader = document.getElementById('proposalStepLoader');
    const resultContainer = document.getElementById('proposalResultContainer');

    const currentLeadId = leadSelect ? leadSelect.value : null;

    if (currentLeadId && window._proposalCache[currentLeadId] && resultContainer) {
        const cached = window._proposalCache[currentLeadId];
        renderProposalOutputCard(cached.proposal, cached.slug, cached.public_url);
    }

    if (currentLeadId && window._activeProposalPromises[currentLeadId] && loader) {
        loader.style.display = 'block';
        if (btn) btn.disabled = true;

        window._activeProposalPromises[currentLeadId].then(res => {
            if (loader) loader.style.display = 'none';
            if (btn) btn.disabled = false;
            if (res && res.proposal) {
                renderProposalOutputCard(res.proposal, res.slug, res.public_url);
            }
        }).catch(err => {
            if (loader) loader.style.display = 'none';
            if (btn) btn.disabled = false;
        });
    }

    if (!btn) return;

    btn.addEventListener('click', async () => {
        const notesInput = document.getElementById('proposalCustomNotes');
        const leadId = leadSelect ? leadSelect.value : null;
        if (!leadId) {
            if (window.showToast) window.showToast("Please select a target lead from the dropdown", "error");
            return;
        }

        const customNotes = notesInput ? notesInput.value.trim() : '';

        btn.disabled = true;
        if (resultContainer) resultContainer.style.display = 'none';
        if (loader) loader.style.display = 'block';

        const steps = [
            { pct: '25%', title: '🔍 Step 1/4: Analyzing business profile & Google Maps social proof...', sub: 'Extracting rating, review volume, and local search visibility metrics...' },
            { pct: '50%', title: '📊 Step 2/4: Benchmarking review gap vs top 3 local competitors...', sub: 'Calculating search ranking deficit and mobile visitor bounce penalties...' },
            { pct: '75%', title: '💰 Step 3/4: Estimating monthly revenue leak & conversion metrics...', sub: 'Projecting lost monthly revenue from missed online leads...' },
            { pct: '95%', title: '🎨 Step 4/4: Architecting 3-page custom proposal & packages...', sub: 'Formatting clean client proposal document and booking CTA...' }
        ];

        let stepIdx = 0;
        const stepInterval = setInterval(() => {
            stepIdx = (stepIdx + 1) % steps.length;
            const currentTitle = document.getElementById('loaderStepTitle');
            const currentSub = document.getElementById('loaderStepSub');
            const currentBar = document.getElementById('loaderProgressBar');
            if (currentTitle) currentTitle.innerText = steps[stepIdx].title;
            if (currentSub) currentSub.innerText = steps[stepIdx].sub;
            if (currentBar) currentBar.style.width = steps[stepIdx].pct;
        }, 1200);

        const promise = Api.generatePDFProposal(leadId, customNotes);
        window._activeProposalPromises[leadId] = promise;

        try {
            const res = await promise;
            clearInterval(stepInterval);
            delete window._activeProposalPromises[leadId];

            if (res && res.proposal) {
                window._proposalCache[leadId] = res;
                if (res.quota && State.profile) {
                    State.profile.monthly_proposals_used = res.quota.used;
                }

                const currentLoader = document.getElementById('proposalStepLoader');
                const currentBtn = document.getElementById('generateProposalBtn');
                if (currentLoader) currentLoader.style.display = 'none';
                if (currentBtn) currentBtn.disabled = false;

                if (window.showToast) window.showToast("✨ 3-Page Client Proposal generated & saved to Documents!", "success");
                renderProposalOutputCard(res.proposal, res.slug, res.public_url);
            }
        } catch (err) {
            clearInterval(stepInterval);
            delete window._activeProposalPromises[leadId];
            const currentLoader = document.getElementById('proposalStepLoader');
            const currentBtn = document.getElementById('generateProposalBtn');
            if (currentLoader) currentLoader.style.display = 'none';
            if (currentBtn) currentBtn.disabled = false;
            console.error("Proposal generation failed:", err);
            if (window.showToast) {
                window.showToast(`Generation failed: ${err.message}`, "error");
            } else {
                alert(`Generation failed: ${err.message}`);
            }
        }
    });
}

function renderProposalOutputCard(prop, slug, publicUrl) {
    const container = document.getElementById('proposalResultContainer');
    if (!container) return;

    const exec = prop.executive_summary || {};
    const gap = prop.gap_analysis || {};
    const sol = prop.solution_architecture || {};
    const pkgs = prop.pricing_packages || [];
    const cta = prop.consultation_cta || {};

    const fullDocUrl = publicUrl || `${window.location.origin}${window.location.pathname}#/d/${slug}`;

    const packagesHTML = pkgs.map(p => `
        <div style="flex: 1; min-width: 220px; background: rgba(255,255,255,0.02); border: 1px solid ${p.popular ? 'var(--accent-gold)' : 'var(--border)'}; border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; position: relative;">
            ${p.popular ? `<div style="position: absolute; top: -10px; right: 16px; background: var(--accent-gold); color: black; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; text-transform: uppercase;">Most Popular</div>` : ''}
            <h4 style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0; color: white;">${p.name}</h4>
            <div style="font-size: 22px; font-weight: 800; color: var(--accent-gold); margin-bottom: 12px; font-family: var(--font-mono);">${p.price}</div>
            <ul style="margin: 0; padding: 0 0 0 16px; font-size: 12px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px;">
                ${(p.included || []).map(i => `<li>${i}</li>`).join('')}
            </ul>
        </div>
    `).join('');

    container.innerHTML = `
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            
            <!-- Top Action Toolbar -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 18px; flex-wrap: wrap; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="padding: 4px 8px; border-radius: 4px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; font-size: 11px; font-weight: 700; font-family: var(--font-mono);">
                        ● PROPOSAL READY & SAVED
                    </span>
                    <span style="color: var(--text-muted); font-size: 12px; font-family: var(--font-mono);">Link: #/d/${slug}</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button id="copyPropLinkBtn" class="secondary-btn" style="padding: 8px 14px; font-size: 12.5px; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px; cursor: pointer;">
                        <i data-lucide="link" style="width: 14px; height: 14px;"></i> Copy Link
                    </button>

                    <button id="printPropPdfBtn" class="brand-btn" style="padding: 8px 18px; font-size: 12.5px; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px; font-weight: 600; cursor: pointer;">
                        <i data-lucide="download" style="width: 14px; height: 14px;"></i> Download PDF
                    </button>

                    <a href="${fullDocUrl}" target="_blank" class="secondary-btn" style="padding: 8px 14px; font-size: 12.5px; border-radius: var(--radius-sm); text-decoration: none; display: flex; align-items: center; gap: 6px;">
                        <i data-lucide="external-link" style="width: 14px; height: 14px;"></i> View Full Document ↗
                    </a>
                </div>
            </div>

            <!-- Proposal Printable View Document Container -->
            <div id="printableProposalDocument" style="background: #0d0e12; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 36px; display: flex; flex-direction: column; gap: 32px; color: white;">
                
                <!-- PAGE 1: EXECUTIVE COVER & AUDIT SUMMARY -->
                <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 28px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                        <div>
                            <span style="font-size: 11px; color: var(--accent-gold); font-weight: 700; font-family: var(--font-mono); text-transform: uppercase;">PAGE 1 OF 3 • EXECUTIVE AUDIT</span>
                            <h2 style="font-size: 24px; font-weight: 800; margin: 4px 0; font-family: var(--font-heading); background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                                ${exec.headline || 'Digital Growth Strategy'}
                            </h2>
                            <div style="color: var(--text-secondary); font-size: 13.5px;">${exec.subheadline || ''}</div>
                        </div>
                        <div style="text-align: right; font-family: var(--font-mono); font-size: 11.5px; color: var(--text-muted);">
                            <div>Prepared by: <strong>${cta.sender_name || 'S8N Growth Specialist'}</strong></div>
                            <div>Agency: <strong>${cta.sender_company || 'S8N Digital'}</strong></div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px;">
                        <div>
                            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">BUSINESS NAME</div>
                            <div style="font-size: 14px; font-weight: 700; color: white; margin-top: 2px;">${exec.business_name}</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">GOOGLE RATING</div>
                            <div style="font-size: 14px; font-weight: 700; color: var(--accent-gold); margin-top: 2px;">${exec.rating}⭐ (${exec.review_count} reviews)</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">LOCATION</div>
                            <div style="font-size: 14px; font-weight: 700; color: white; margin-top: 2px;">${exec.location}</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">LOCAL PACK RANK</div>
                            <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-top: 2px;">${exec.audit_scores?.local_pack_rank || 'Position #5'}</div>
                        </div>
                    </div>
                </div>

                <!-- PAGE 2: LOCAL SEO GAP ANALYSIS & REVENUE LEAK ESTIMATE -->
                <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 28px;">
                    <span style="font-size: 11px; color: var(--accent-gold); font-weight: 700; font-family: var(--font-mono); text-transform: uppercase;">PAGE 2 OF 3 • LOCAL COMPETITOR & REVENUE LOSS ANALYSIS</span>
                    <h3 style="font-size: 18px; font-weight: 700; margin: 6px 0 16px 0; font-family: var(--font-heading);">
                        Review Gap vs Top Competitors & Projected Revenue Leak
                    </h3>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-md); padding: 20px;">
                            <div style="font-size: 11.5px; color: #ef4444; font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 6px;">Estimated Lost Monthly Revenue</div>
                            <div style="font-size: 26px; font-weight: 800; color: #ef4444; font-family: var(--font-mono);">${gap.estimated_revenue_leak || '₹15,000 / month'}</div>
                            <p style="font-size: 12px; color: var(--text-secondary); margin: 8px 0 0 0; line-height: 1.5;">
                                ${gap.revenue_leak_explanation || 'High-intent searchers choose competitors with higher review counts.'}
                            </p>
                        </div>

                        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px;">
                            <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 6px;">Review Deficit Gap</div>
                            <div style="font-size: 26px; font-weight: 800; color: var(--accent-gold); font-family: var(--font-mono);">${gap.review_gap || 45} Reviews Deficit</div>
                            <p style="font-size: 12px; color: var(--text-secondary); margin: 8px 0 0 0; line-height: 1.5;">
                                Top 3 competitors in ${exec.location} average ${gap.competitor_review_avg || 85} reviews.
                            </p>
                        </div>
                    </div>

                    <div style="background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px;">
                        <div style="font-size: 12px; font-weight: 700; color: white; margin-bottom: 10px; font-family: var(--font-mono);">CRITICAL AUDIT FINDINGS:</div>
                        <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
                            ${(gap.key_gaps || []).map(g => `<li>${g}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <!-- PAGE 3: SOLUTION ARCHITECTURE & PRICING PACKAGES -->
                <div>
                    <span style="font-size: 11px; color: var(--accent-gold); font-weight: 700; font-family: var(--font-mono); text-transform: uppercase;">PAGE 3 OF 3 • SOLUTION ARCHITECTURE & CONSULTATION CTA</span>
                    <h3 style="font-size: 18px; font-weight: 700; margin: 6px 0 16px 0; font-family: var(--font-heading);">
                        ${sol.title || 'Tailored Digital Architecture & Lead Engine'}
                    </h3>

                    <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 28px;">
                        ${packagesHTML}
                    </div>

                    <!-- Consultation Booking CTA Box -->
                    <div style="background: linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%); border: 1px solid rgba(217, 119, 6, 0.4); border-radius: var(--radius-md); padding: 24px; text-align: center;">
                        <h4 style="font-size: 18px; font-weight: 700; margin: 0 0 8px 0; color: white; font-family: var(--font-heading);">
                            ${cta.headline || 'Claim Your Complimentary Strategy Session'}
                        </h4>
                        <p style="color: var(--text-secondary); font-size: 13px; max-width: 560px; margin: 0 auto 20px auto; line-height: 1.5;">
                            ${cta.body || 'Book a free 30-minute consultation call to walk through this prototype.'}
                        </p>
                        <a href="${cta.booking_url || '#'}" target="_blank" class="brand-btn" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; font-size: 13.5px; font-weight: 700; text-decoration: none; border-radius: var(--radius-sm);">
                            ${cta.button_label || '📅 Book Free Consultation'}
                        </a>
                    </div>
                </div>

            </div>
        </div>
    `;

    container.style.display = 'flex';
    if (window.refreshLucideIcons) window.refreshLucideIcons();

    // Bind action toolbar events
    const copyBtn = document.getElementById('copyPropLinkBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(fullDocUrl).then(() => {
                if (window.showToast) window.showToast("🔗 Proposal link copied to clipboard!", "success");
            });
        });
    }

    const printBtn = document.getElementById('printPropPdfBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            const printContent = document.getElementById('printableProposalDocument');
            if (!printContent) return;
            const win = window.open('', '', 'width=900,height=1000');
            win.document.write(`
                <html>
                    <head>
                        <title>Proposal_${exec.business_name.replace(/\s+/g, '_')}</title>
                        <style>
                            body { font-family: Arial, sans-serif; background: #0d0e12; color: white; padding: 30px; }
                            @media print { body { background: white; color: black; } }
                        </style>
                    </head>
                    <body>
                        ${printContent.innerHTML}
                    </body>
                </html>
            `);
            win.document.close();
            win.focus();
            setTimeout(() => {
                win.print();
                win.close();
            }, 500);
        });
    }
}
