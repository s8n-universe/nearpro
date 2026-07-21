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
        <div class="proposal-generator-container" style="display: flex; flex-direction: column; gap: 20px; padding: 28px; background: #f8fafc; color: #0f172a; border-radius: var(--radius-lg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            
            <!-- Compact Enterprise Header Bar -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                        <h2 style="font-size: 19px; font-weight: 800; margin: 0; color: #0f172a; font-family: var(--font-heading);">
                            📄 1-Click Client Audit & PDF Proposal Engine
                        </h2>
                        <span style="background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700;">
                            CLIENT-READY 3-PAGE AUDIT
                        </span>
                    </div>
                    <p style="color: #475569; font-size: 13.5px; margin: 0; line-height: 1.4;">
                        Generates a 3-page audit & growth proposal featuring Google Maps review gap math, PageSpeed bottlenecks, 3-tier packages, and WhatsApp consultation booking.
                    </p>
                </div>
                
                <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 14px;">
                    <span style="font-size: 12px; color: #475569; font-weight: 600;">Monthly Proposals Quota:</span>
                    <strong style="font-size: 14px; color: #2563eb;">${used} / ${limit === 0 ? '0 (Free)' : limit === 999999 ? 'Unlimited' : limit}</strong>
                    <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">
                        ${userTier}
                    </span>
                </div>
            </div>

            <!-- Compact 3-Step Process Strip -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.03); flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px;">
                    <span style="background: #eff6ff; color: #2563eb; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px;">1</span>
                    <strong style="color: #0f172a;">Select Prospect Lead</strong>
                </div>
                <span style="color: #cbd5e1;">➔</span>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px;">
                    <span style="background: #ecfdf5; color: #059669; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px;">2</span>
                    <strong style="color: #0f172a;">Calculate Review & Audit Leak</strong>
                </div>
                <span style="color: #cbd5e1;">➔</span>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px;">
                    <span style="background: #f5f3ff; color: #7c3aed; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px;">3</span>
                    <strong style="color: #0f172a;">Dispatch Branded PDF / Web Link</strong>
                </div>
            </div>

            <!-- Lead Selection & Preset Form -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03); display: flex; flex-direction: column; gap: 18px;">
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <label style="font-size: 12.5px; font-weight: 700; color: #0f172a;">
                                TARGET BUSINESS LEAD:
                            </label>
                            <a href="#/dashboard/crm" style="font-size: 11.5px; color: #2563eb; text-decoration: underline; font-weight: 600;">
                                View 360° Lead Workstation ↗
                            </a>
                        </div>
                        <select id="proposalLeadSelect" data-selected-id="${selectedLeadId || ''}" style="width: 100%; padding: 10px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13px; outline: none; font-weight: 600;">
                            <option value="">-- Loading your tracked leads & directory... --</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 12.5px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
                            PROPOSAL PACKAGE HIGHLIGHT (OPTIONAL):
                        </label>
                        <input type="text" id="proposalCustomNotes" placeholder="e.g. Google Review Velocity & Mobile Speed Optimization" style="width: 100%; padding: 10px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 13px; outline: none;">
                    </div>
                </div>

                <!-- Package Preset Chips -->
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <span style="font-size: 11.5px; font-weight: 700; color: #64748b;">PRESET PACKAGES:</span>
                    <button class="proposal-preset-chip" data-notes="Google Review Deficit & Local Map Pack Ranking Sprint" style="background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
                        ⭐ Review Deficit Sprint
                    </button>
                    <button class="proposal-preset-chip" data-notes="PageSpeed & Mobile Responsiveness Modernization" style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
                        ⚡ PageSpeed Modernization
                    </button>
                    <button class="proposal-preset-chip" data-notes="Full 360 Client Acquisition & WhatsApp Booking Suite" style="background: #faf5ff; border: 1px solid #e9d5ff; color: #6b21a8; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
                        🚀 360° Acquisition Suite
                    </button>
                </div>

                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 16px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                    ${isAtLimit ? `
                        <div style="color: #ef4444; font-size: 12.5px; font-weight: 600;">
                            ⚠️ Monthly proposal limit reached. <a href="#/checkout" style="color: #2563eb; text-decoration: underline;">Upgrade plan ↗</a>
                        </div>
                    ` : ''}
                    
                    <button class="brand-btn" id="generateProposalBtn" ${isAtLimit ? 'disabled' : ''} style="padding: 10px 24px; font-size: 13px; font-weight: 700; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                        ✨ Generate 3-Page Client Proposal
                    </button>
                </div>
            </div>

            <!-- Generated Proposal Viewer Workspace -->
            <div id="proposalResultContainer" style="display: none;">
                <!-- Dynamically populated by bindProposalGeneratorEvents -->
            </div>

        </div>
    `;
}

export function bindProposalGeneratorEvents() {
    if (window.refreshLucideIcons) window.refreshLucideIcons();

    const select = document.getElementById('proposalLeadSelect');
    const generateBtn = document.getElementById('generateProposalBtn');
    const resultContainer = document.getElementById('proposalResultContainer');
    const customNotesInput = document.getElementById('proposalCustomNotes');

    // Bind preset chips
    const presetChips = document.querySelectorAll('.proposal-preset-chip');
    presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
            if (customNotesInput) customNotesInput.value = chip.dataset.notes;
        });
    });

    // Populate dropdown with tracked leads and professionals
    if (select) {
        const selectedId = select.dataset.selectedId;
        
        async function loadLeads() {
            try {
                const savedLeads = await Api.getSavedLeads();
                let optionsHTML = '';

                if (savedLeads && savedLeads.length > 0) {
                    optionsHTML += `<optgroup label="📋 Your Saved CRM Leads (${savedLeads.length})">`;
                    savedLeads.forEach(s => {
                        const prof = s.professionals;
                        if (prof) {
                            const isSelected = (selectedId && String(prof.id) === String(selectedId)) || false;
                            optionsHTML += `<option value="${prof.id}" ${isSelected ? 'selected' : ''}>⭐ ${prof.name} (${prof.category || 'Business'} - ${prof.rating || 0}★, ${prof.review_count || 0} reviews)</option>`;
                        }
                    });
                    optionsHTML += `</optgroup>`;
                }

                const directoryLeads = State.professionals || [];
                if (directoryLeads.length > 0) {
                    optionsHTML += `<optgroup label="🔍 Directory Leads (${directoryLeads.length})">`;
                    directoryLeads.forEach(prof => {
                        const isSelected = (selectedId && String(prof.id) === String(selectedId)) || false;
                        optionsHTML += `<option value="${prof.id}" ${isSelected ? 'selected' : ''}>${prof.name} (${prof.area || 'Mumbai'} - ${prof.rating || 0}★)</option>`;
                    });
                    optionsHTML += `</optgroup>`;
                }

                if (!optionsHTML) {
                    optionsHTML = `<option value="">No business leads found. Browse directory to add leads.</option>`;
                }

                select.innerHTML = optionsHTML;
            } catch (err) {
                console.error("Failed to load leads for proposal generator:", err);
                select.innerHTML = `<option value="">Error loading leads list.</option>`;
            }
        }
        loadLeads();
    }

    // Bind Generate Button
    if (generateBtn && resultContainer) {
        generateBtn.addEventListener('click', async () => {
            const selectedProfId = select?.value;
            if (!selectedProfId) {
                if (window.showToast) window.showToast("Please select a target business lead", "error");
                return;
            }

            generateBtn.disabled = true;
            generateBtn.innerText = "⏳ Generating 3-Page Proposal...";

            try {
                // Find selected professional object
                let leadObj = (State.professionals || []).find(p => String(p.id) === String(selectedProfId));
                if (!leadObj) {
                    const saved = await Api.getSavedLeads();
                    const matched = saved.find(s => s.professionals && String(s.professionals.id) === String(selectedProfId));
                    if (matched) leadObj = matched.professionals;
                }

                const agencyName = State.profile?.company_name || 'NearPro Agency';
                const customNotes = customNotesInput?.value || '';

                resultContainer.style.display = 'block';
                resultContainer.innerHTML = `
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03); display: flex; flex-direction: column; gap: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px;">
                            <div>
                                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; font-family: var(--font-heading);">
                                    Proposal Ready for ${leadObj?.name || 'Client'}
                                </h3>
                                <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">
                                    Prepared by ${agencyName} &middot; Generated via NearPro Engine
                                </p>
                            </div>

                            <div style="display: flex; gap: 10px;">
                                <button id="printProposalBtn" style="background: #2563eb; color: white; border: none; padding: 8px 16px; font-size: 12.5px; font-weight: 700; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                    <i data-lucide="printer" style="width: 14px; height: 14px;"></i> Print / Save PDF
                                </button>
                                <a href="#/dashboard/crm?lead_id=${selectedProfId}&tab=proposals" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #0f172a; padding: 8px 14px; font-size: 12.5px; font-weight: 700; border-radius: 6px; text-decoration: none;">
                                    View in 360° Workstation ➔
                                </a>
                            </div>
                        </div>

                        <!-- 3-Page Printable Proposal Document Box -->
                        <div id="printableProposalDocument" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 32px; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
                            
                            <!-- PAGE 1: EXECUTIVE AUDIT & OVERVIEW -->
                            <div style="border-bottom: 2px solid #2563eb; padding-bottom: 24px; margin-bottom: 24px;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                    <div>
                                        <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 800; color: #0f172a; font-family: var(--font-heading);">
                                            BUSINESS AUDIT & GROWTH PROPOSAL
                                        </h1>
                                        <div style="font-size: 14px; color: #2563eb; font-weight: 700;">
                                            PREPARED FOR: ${leadObj?.name || 'Target Client'}
                                        </div>
                                    </div>
                                    <div style="text-align: right; font-size: 12px; color: #64748b;">
                                        <strong>PREPARED BY:</strong> ${agencyName}<br>
                                        <strong>DATE:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <!-- Executive Summary -->
                            <div style="margin-bottom: 28px;">
                                <h4 style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #0f172a; font-family: var(--font-heading); text-transform: uppercase; letter-spacing: 0.5px;">
                                    1. Executive Summary & Google Rating Audit
                                </h4>
                                <p style="font-size: 13.5px; color: #334155; margin: 0 0 14px 0;">
                                    Based on our regional audit of <strong>${leadObj?.category || 'businesses'}</strong> in <strong>${leadObj?.area || 'Mumbai'}</strong>, ${leadObj?.name || 'your business'} currently holds <strong>⭐ ${leadObj?.rating || 0} stars across ${leadObj?.review_count || 0} Google reviews</strong>.
                                </p>
                                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13px;">
                                    <div>
                                        <strong style="color: #1e40af;">Rating Deficit Opportunity:</strong><br>
                                        Top competitors in ${leadObj?.area || 'your area'} average 150+ reviews. Closing this gap can increase organic walk-in inquiries by up to 35%.
                                    </div>
                                    <div>
                                        <strong style="color: #1e40af;">Website Optimization Status:</strong><br>
                                        ${leadObj?.website ? 'Website detected. Mobile PageSpeed optimization recommended.' : 'No website detected. High-converting mobile site required to capture direct search leads.'}
                                    </div>
                                </div>
                            </div>

                            <!-- PAGE 2: 3-TIER PACKAGES -->
                            <div style="margin-bottom: 28px;">
                                <h4 style="margin: 0 0 14px 0; font-size: 15px; font-weight: 700; color: #0f172a; font-family: var(--font-heading); text-transform: uppercase; letter-spacing: 0.5px;">
                                    2. Proposed Solutions & 3-Tier Packages
                                </h4>
                                
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                                    
                                    <!-- Tier 1 -->
                                    <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; background: #ffffff;">
                                        <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">STARTER</div>
                                        <h5 style="margin: 4px 0 8px 0; font-size: 16px; font-weight: 800; color: #0f172a;">Review Engine</h5>
                                        <div style="font-size: 20px; font-weight: 800; color: #2563eb; margin-bottom: 12px;">₹4,999 <small style="font-size: 11px; color: #64748b;">/mo</small></div>
                                        <ul style="font-size: 12px; color: #475569; padding-left: 16px; margin: 0; line-height: 1.6;">
                                            <li>Google Maps review QR setup</li>
                                            <li>WhatsApp review request triggers</li>
                                            <li>Negative feedback filter</li>
                                        </ul>
                                    </div>

                                    <!-- Tier 2 (Featured) -->
                                    <div style="border: 2px solid #2563eb; border-radius: 8px; padding: 18px; background: #eff6ff; position: relative;">
                                        <span style="position: absolute; top: -10px; right: 12px; background: #2563eb; color: white; font-size: 9.5px; font-weight: 800; padding: 2px 8px; border-radius: 99px;">POPULAR</span>
                                        <div style="font-size: 11px; font-weight: 800; color: #1e40af; text-transform: uppercase;">GROWTH</div>
                                        <h5 style="margin: 4px 0 8px 0; font-size: 16px; font-weight: 800; color: #0f172a;">Review + Mobile Site</h5>
                                        <div style="font-size: 20px; font-weight: 800; color: #2563eb; margin-bottom: 12px;">₹9,999 <small style="font-size: 11px; color: #64748b;">/mo</small></div>
                                        <ul style="font-size: 12px; color: #334155; padding-left: 16px; margin: 0; line-height: 1.6;">
                                            <li>Everything in Starter</li>
                                            <li>High-converting 1-page mobile site</li>
                                            <li>Direct WhatsApp booking button</li>
                                            <li>Schema SEO markup</li>
                                        </ul>
                                    </div>

                                    <!-- Tier 3 -->
                                    <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; background: #ffffff;">
                                        <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">DOMINANCE</div>
                                        <h5 style="margin: 4px 0 8px 0; font-size: 16px; font-weight: 800; color: #0f172a;">Full Local SEO Suite</h5>
                                        <div style="font-size: 20px; font-weight: 800; color: #2563eb; margin-bottom: 12px;">₹19,999 <small style="font-size: 11px; color: #64748b;">/mo</small></div>
                                        <ul style="font-size: 12px; color: #475569; padding-left: 16px; margin: 0; line-height: 1.6;">
                                            <li>Everything in Growth</li>
                                            <li>Top 3 Local Map Pack ranking</li>
                                            <li>Monthly SEO content updates</li>
                                            <li>Dedicated Account Manager</li>
                                        </ul>
                                    </div>

                                </div>
                            </div>

                            <!-- PAGE 3: ACCEPTANCE & CONTACT -->
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center;">
                                <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #0f172a;">Ready to Upgrade Your Local Presence?</h4>
                                <p style="font-size: 13px; color: #475569; margin: 0 0 14px 0;">
                                    Contact <strong>${agencyName}</strong> to lock in your strategy consultation.
                                </p>
                                <a href="https://wa.me/?text=${encodeURIComponent(`Hi ${agencyName}, I reviewed your proposal for ${leadObj?.name} and would like to schedule a call.`)}" target="_blank" style="background: #059669; color: white; padding: 8px 20px; font-size: 12.5px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block;">
                                    💬 Book Strategy Consultation on WhatsApp
                                </a>
                            </div>

                        </div>
                    </div>
                `;

                // Bind print button
                const printBtn = document.getElementById('printProposalBtn');
                if (printBtn) {
                    printBtn.addEventListener('click', () => {
                        window.print();
                    });
                }

                if (window.showToast) window.showToast("✨ 3-Page Client Proposal generated successfully!", "success");
            } catch (err) {
                console.error("Proposal generation error:", err);
                if (window.showToast) window.showToast(`Generation failed: ${err.message}`, "error");
            } finally {
                generateBtn.disabled = false;
                generateBtn.innerText = "✨ Generate 3-Page Client Proposal";
            }
        });
    }
}
