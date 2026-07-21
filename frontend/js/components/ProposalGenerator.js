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
                        Generate a beautifully formatted 3-page proposal for any local business lead you track. Includes Google Maps Audit, Competitor Review Gap, Estimated Revenue Leak, Custom Site Specifications, 3-Tier Packages, and your Consultation Booking CTA.
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

            <!-- KNOWLEDGE GUIDE: HOW TO USE THIS FEATURE -->
            <details style="background: rgba(217, 119, 6, 0.05); border: 1px solid rgba(217, 119, 6, 0.2); border-radius: var(--radius-md); padding: 16px 20px; color: var(--text-secondary);" open>
                <summary style="font-weight: 700; color: var(--accent-gold); cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 14px; font-family: var(--font-heading);">
                    <span style="display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="book-open" style="width: 16px; height: 16px;"></i>
                        📖 How to Use PDF Proposals to Close Agency Clients
                    </span>
                    <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Click to Expand / Collapse</span>
                </summary>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
                    <div style="background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px;">
                        <div style="font-size: 11.5px; font-weight: 700; color: var(--accent-gold); font-family: var(--font-mono); margin-bottom: 4px;">STEP 1 • SELECT LEAD</div>
                        <div style="font-size: 12.5px; color: white; line-height: 1.4;">Select a lead you are tracking in your CRM pipeline or from the directory below.</div>
                    </div>
                    
                    <div style="background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px;">
                        <div style="font-size: 11.5px; font-weight: 700; color: var(--accent-gold); font-family: var(--font-mono); margin-bottom: 4px;">STEP 2 • GENERATE AUDIT</div>
                        <div style="font-size: 12.5px; color: white; line-height: 1.4;">Click generate to calculate review gap, lost revenue leak, and custom 3-tier pricing packages.</div>
                    </div>

                    <div style="background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px;">
                        <div style="font-size: 11.5px; font-weight: 700; color: var(--accent-gold); font-family: var(--font-mono); margin-bottom: 4px;">STEP 3 • SHARE & CONVERT</div>
                        <div style="font-size: 12.5px; color: white; line-height: 1.4;">Copy the 10-year signed link to dispatch via WhatsApp or download a printable 3-page PDF.</div>
                    </div>
                </div>
            </details>

            <!-- Lead Selection Form -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-md);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label style="font-size: 12px; font-weight: 600; color: var(--text-secondary); font-family: var(--font-mono);">
                                SELECT TARGET BUSINESS LEAD:
                            </label>
                            <a href="#/dashboard/crm" style="font-size: 11px; color: var(--accent-gold); text-decoration: underline; font-family: var(--font-mono);">
                                Manage Tracked Leads in CRM ↗
                            </a>
                        </div>
                        <select id="proposalLeadSelect" data-selected-id="${selectedLeadId || ''}" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none;">
                            <option value="">-- Loading your tracked leads & directory... --</option>
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
                    Extracting rating, review volume, and local search visibility metrics...
                </p>
                <div style="max-width: 480px; margin: 0 auto; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; border: 1px solid var(--border);">
                    <div id="loaderProgressBar" style="width: 25%; height: 100%; background: linear-gradient(90deg, #d97706, #fbbf24); transition: width 0.4s ease;"></div>
                </div>
            </div>

            <!-- Output Proposal Display Area -->
            <div id="proposalResultContainer" style="display: none; flex-direction: column; gap: 24px;"></div>
        </div>
    `;
}

export async function populateLeadDropdownOptions(selectEl, selectedLeadId = null) {
    if (!selectEl) return;

    let savedLeads = [];
    try {
        savedLeads = await Api.getSavedLeads();
    } catch (e) {
        console.warn("Failed to load saved leads:", e);
    }

    const trackedProfessionals = savedLeads
        .map(sl => sl.professionals)
        .filter(p => p && p.id);

    const directoryLeads = State.professionals || [];

    // Combine unique leads prioritizing tracked CRM leads first
    const trackedIds = new Set(trackedProfessionals.map(p => p.id));
    const otherLeads = directoryLeads.filter(p => p.id && !trackedIds.has(p.id));

    let optionsHTML = '';

    if (trackedProfessionals.length > 0) {
        optionsHTML += `<optgroup label="📍 YOUR TRACKED LEADS (CRM PIPELINE)">`;
        optionsHTML += trackedProfessionals.map(p => `
            <option value="${p.id}" ${p.id === selectedLeadId ? 'selected' : ''}>
                ⭐ ${p.name} (${p.category || p.parent_category || 'Business'} - ${p.rating || 'N/A'}★, ${p.review_count || 0} reviews)
            </option>
        `).join('');
        optionsHTML += `</optgroup>`;
    }

    if (otherLeads.length > 0) {
        optionsHTML += `<optgroup label="🔍 UNLOCKED DIRECTORY LEADS">`;
        optionsHTML += otherLeads.map(p => `
            <option value="${p.id}" ${p.id === selectedLeadId ? 'selected' : ''}>
                ${p.name} (${p.category || p.parent_category || 'Business'} - ${p.rating || 'N/A'}★)
            </option>
        `).join('');
        optionsHTML += `</optgroup>`;
    }

    if (!optionsHTML) {
        optionsHTML = `<option value="">-- No leads found. Please unlock leads in Browse Directory --</option>`;
    }

    selectEl.innerHTML = optionsHTML;
}

export function bindProposalGeneratorEvents() {
    window._proposalCache = window._proposalCache || {};
    window._activeProposalPromises = window._activeProposalPromises || {};

    const btn = document.getElementById('generateProposalBtn');
    const leadSelect = document.getElementById('proposalLeadSelect');
    const loader = document.getElementById('proposalStepLoader');
    const resultContainer = document.getElementById('proposalResultContainer');

    const preSelectedId = leadSelect ? leadSelect.dataset.selectedId : null;

    // Populate dropdown with user's tracked leads
    if (leadSelect) {
        populateLeadDropdownOptions(leadSelect, preSelectedId);
    }

    const currentLeadId = leadSelect ? (leadSelect.value || preSelectedId) : null;

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

    const audit = prop.audit_summary || {};
    const gap = prop.competitor_gap || {};
    const arch = prop.proposed_architecture || {};
    const pricing = prop.pricing_packages || [];
    const cta = prop.consultation_cta || {};

    container.innerHTML = `
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            
            <!-- Top Toolbar -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 18px; flex-wrap: wrap; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="padding: 4px 8px; border-radius: 4px; background: rgba(217, 119, 6, 0.15); border: 1px solid rgba(217, 119, 6, 0.3); color: var(--accent-gold); font-size: 11px; font-weight: 700; font-family: var(--font-mono);">
                        ● 3-PAGE PROPOSAL GENERATED
                    </span>
                    <span style="color: var(--text-muted); font-size: 12px; font-family: var(--font-mono);">Slug: #${slug}</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px;">
                    <a href="${publicUrl}" target="_blank" class="brand-btn" style="padding: 8px 16px; font-size: 12.5px; border-radius: var(--radius-sm); text-decoration: none; display: flex; align-items: center; gap: 6px; font-weight: 600;">
                        <i data-lucide="external-link" style="width: 14px; height: 14px;"></i> Open Public Viewer
                    </a>

                    <button id="copyProposalLinkBtn" class="secondary-btn" style="padding: 8px 14px; font-size: 12.5px; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px; cursor: pointer;">
                        <i data-lucide="copy" style="width: 14px; height: 14px;"></i> Copy Public Link
                    </button>

                    <button id="printProposalBtn" class="secondary-btn" style="padding: 8px 14px; font-size: 12.5px; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px; cursor: pointer;">
                        <i data-lucide="printer" style="width: 14px; height: 14px;"></i> Print / Download PDF
                    </button>
                </div>
            </div>

            <!-- Printable 3-Page Document View -->
            <div id="printableProposalContainer" style="display: flex; flex-direction: column; gap: 32px; background: #0b0c10; padding: 32px; border-radius: var(--radius-md); border: 1px solid var(--border);">
                
                <!-- PAGE 1: EXECUTIVE AUDIT SUMMARY -->
                <div style="border-bottom: 2px dashed var(--border); padding-bottom: 32px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                        <div>
                            <div style="font-size: 11px; color: var(--accent-gold); font-family: var(--font-mono); font-weight: 700; text-transform: uppercase;">
                                PAGE 1 OF 3 • EXECUTIVE AUDIT SUMMARY
                            </div>
                            <h1 style="font-size: 24px; font-weight: 800; margin: 4px 0 2px 0; color: white; font-family: var(--font-heading);">
                                ${prop.business_name || 'Client Audit & Growth Plan'}
                            </h1>
                            <p style="color: var(--text-muted); font-size: 13px; margin: 0;">Prepared for: ${prop.business_name} | Location: ${audit.location || 'Local'}</p>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 14px; font-weight: 700; color: var(--accent-gold); font-family: var(--font-heading);">${prop.agency_name || 'S8N Digital'}</div>
                            <div style="font-size: 11px; color: var(--text-muted);">${prop.agency_tagline || 'Local Digital Growth Partner'}</div>
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
                        <div style="font-size: 13px; font-weight: 700; color: white; margin-bottom: 8px; font-family: var(--font-heading);">Executive Overview</div>
                        <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; margin: 0;">
                            ${audit.executive_summary || 'Detailed digital footprint audit conducted for ' + prop.business_name + '.'}
                        </p>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                        <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px; text-align: center;">
                            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">GOOGLE RATING</div>
                            <div style="font-size: 22px; font-weight: 800; color: var(--accent-gold); margin-top: 4px;">${audit.google_rating || '5.0'} ⭐</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px; text-align: center;">
                            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">REVIEW VOLUME</div>
                            <div style="font-size: 22px; font-weight: 800; color: white; margin-top: 4px;">${audit.review_count || 0} reviews</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px; text-align: center;">
                            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">WEB FOOTPRINT</div>
                            <div style="font-size: 16px; font-weight: 700; color: ${audit.website_status === 'Active' ? '#10b981' : '#ef4444'}; margin-top: 8px;">
                                ${audit.website_status || 'Needs Upgrade'}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PAGE 2: COMPETITOR GAP & REVENUE LEAK ESTIMATE -->
                <div style="border-bottom: 2px dashed var(--border); padding-bottom: 32px;">
                    <div style="font-size: 11px; color: var(--accent-gold); font-family: var(--font-mono); font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
                        PAGE 2 OF 3 • LOCAL COMPETITOR GAP & REVENUE LOSS ANALYSIS
                    </div>
                    
                    <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md); padding: 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
                        <div>
                            <div style="font-size: 12px; color: #ef4444; font-weight: 700; font-family: var(--font-mono); text-transform: uppercase;">ESTIMATED MONTHLY REVENUE LEAK</div>
                            <div style="font-size: 26px; font-weight: 800; color: white; font-family: var(--font-heading); margin-top: 2px;">
                                ${gap.estimated_monthly_revenue_leak || '₹8,500 - ₹25,000 / mo'}
                            </div>
                        </div>
                        <div style="font-size: 12.5px; color: var(--text-secondary); max-width: 420px; line-height: 1.5;">
                            Revenue leaked due to lower Google review count and unoptimized mobile conversion funnels compared to top local competitors in ${audit.location || 'your area'}.
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 18px;">
                            <div style="font-size: 13px; font-weight: 700; color: white; margin-bottom: 10px; font-family: var(--font-heading);">
                                Competitor Benchmark Gap
                            </div>
                            <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                                Top local competitors average <strong>${gap.top_competitor_review_avg || '85+'} reviews</strong> with direct 1-tap WhatsApp booking engines.
                            </div>
                        </div>

                        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 18px;">
                            <div style="font-size: 13px; font-weight: 700; color: white; margin-bottom: 10px; font-family: var(--font-heading);">
                                Core Growth Inhibitor
                            </div>
                            <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                                ${gap.growth_inhibitor || 'High customer rating diluted by missing automated review collection and slow mobile landing pages.'}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PAGE 3: PROPOSED SOLUTION & PRICING PACKAGES -->
                <div>
                    <div style="font-size: 11px; color: var(--accent-gold); font-family: var(--font-mono); font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">
                        PAGE 3 OF 3 • SOLUTION ARCHITECTURE & 3-TIER PACKAGES
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
                        ${pricing.map(p => `
                            <div style="background: rgba(0,0,0,0.3); border: 1px solid ${p.popular ? 'var(--accent-gold)' : 'var(--border)'}; border-radius: var(--radius-md); padding: 20px; position: relative;">
                                ${p.popular ? '<span style="position: absolute; top: -10px; right: 14px; background: var(--accent-gold); color: black; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 99px;">MOST POPULAR</span>' : ''}
                                <div style="font-size: 16px; font-weight: 700; color: white; font-family: var(--font-heading);">${p.name}</div>
                                <div style="font-size: 22px; font-weight: 800; color: var(--accent-gold); margin: 8px 0; font-family: var(--font-heading);">${p.price}</div>
                                <ul style="margin: 0; padding-left: 16px; color: var(--text-secondary); font-size: 12px; line-height: 1.6;">
                                    ${(p.features || []).map(f => `<li>${f}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Consultation CTA Box -->
                    <div style="background: rgba(217, 119, 6, 0.1); border: 1px solid rgba(217, 119, 6, 0.3); border-radius: var(--radius-md); padding: 20px; text-align: center;">
                        <h4 style="font-size: 16px; font-weight: 700; margin: 0 0 6px 0; color: white; font-family: var(--font-heading);">
                            ${cta.heading || 'Book Your Complimentary 15-Minute Strategy Session'}
                        </h4>
                        <p style="color: var(--text-secondary); font-size: 13px; margin: 0 0 14px 0;">
                            ${cta.subheading || 'Discuss live concept prototype & unlock your local search growth roadmap.'}
                        </p>
                        <a href="${cta.booking_url || prop.booking_url || 'https://topmate.io/shriraj'}" target="_blank" class="brand-btn" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; font-size: 13px; font-weight: 700; border-radius: var(--radius-sm); text-decoration: none;">
                            <i data-lucide="calendar" style="width: 15px; height: 15px;"></i> ${cta.button_text || 'Schedule Free Call ↗'}
                        </a>
                    </div>
                </div>

            </div>
        </div>
    `;

    container.style.display = 'flex';
    if (window.refreshLucideIcons) window.refreshLucideIcons();

    // Bind toolbar buttons
    const copyBtn = document.getElementById('copyProposalLinkBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(publicUrl).then(() => {
                if (window.showToast) window.showToast("📋 Public Proposal Link copied to clipboard!", "success");
            });
        });
    }

    const printBtn = document.getElementById('printProposalBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            const printContent = document.getElementById('printableProposalContainer');
            if (!printContent) return;
            const win = window.open('', '', 'width=900,height=1000');
            win.document.write(`
                <html>
                    <head>
                        <title>Proposal_${prop.business_name.replace(/\s+/g, '_')}</title>
                        <style>
                            body { font-family: Arial, sans-serif; background: #0b0c10; color: white; padding: 30px; }
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
