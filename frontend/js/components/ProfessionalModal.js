import { isOpenNow } from '../api.js';
import L from 'leaflet';
import { State } from '../state.js';
import { currentUserHasAccess } from '../auth.js';
import { showTrackLeadModal } from './TrackLeadModal.js';
import { maskWebsite } from './ProfessionalCard.js';
import { ResearchApi } from '../api/research.js';

let activeModalTab = 'details'; // 'details' | 'research'
let activeReport = null;
let researchJob = null;
let simulatedStatusLogs = [];
let simulatedProgressPercent = 0;

export function renderProfessionalModal(lead) {
    const isTracked = State.saved_lead_ids && State.saved_lead_ids.includes(lead.id);

    // Sanitize category
    const rawCat = lead.category || '';
    const looksLikeAddress = /\d/.test(rawCat) && (/,/.test(rawCat) || /\b(rd|road|st|street|lane|nagar|marg|path|opp|nr|near)\b/i.test(rawCat));
    const displayCategory = (!rawCat || looksLikeAddress || rawCat.length > 40) ? (lead.parent_category || 'Other') : rawCat;
    
    // Avatar initials
    const initials = lead.name
        .split(' ')
        .filter(x => x.length > 0)
        .slice(0, 2)
        .map(x => x[0].toUpperCase())
        .join('');

    // Ratings star
    const rating = lead.rating || 0;
    const reviewCount = lead.review_count || 0;
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            starsHTML += '★';
        } else if (i - 0.5 <= rating) {
            starsHTML += '½';
        } else {
            starsHTML += '☆';
        }
    }

    const score = lead.completeness_score || 0;
    const isPremium = currentUserHasAccess('scout');
    const leadIndex = State.professionals ? State.professionals.findIndex(p => p.id === lead.id) : -1;
    const isFreemiumSampleUnlocked = !isPremium && leadIndex >= 0 && leadIndex < 12;
    const hasConnectAccess = isPremium || isFreemiumSampleUnlocked;

    // Contact masking info
    const rawDigits = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
    const maskedPhone = rawDigits.length >= 10 
        ? `+91 ${rawDigits.slice(-10, -5)} XXXXX` 
        : (lead.phone ? `${lead.phone.slice(0, 5)} XXXXX` : '');
    const maskedWebsite = maskWebsite(lead.website);

    const phoneDisplay = !hasConnectAccess 
        ? `<span onclick="window.State.setPricingModal(true);" style="color: #d97706; cursor: pointer; text-decoration: underline; font-weight: 700; font-size: 13px;"><i data-lucide="lock" style="width:11px; height:11px;"></i> Locked (${maskedPhone})</span>`
        : (lead.phone ? `<a href="tel:${lead.phone}" style="color: #059669; font-weight: 700; text-decoration: none;">${lead.phone}</a>` : '<span style="color: #64748b; font-weight: 500;">Not available</span>');

    const emailDisplay = !hasConnectAccess
        ? `<span onclick="window.State.setPricingModal(true);" style="color: #d97706; cursor: pointer; text-decoration: underline; font-weight: 700; font-size: 13px;"><i data-lucide="lock" style="width:11px; height:11px;"></i> Locked</span>`
        : (lead.email ? `<a href="mailto:${lead.email}" style="color: #2563eb; font-weight: 700; text-decoration: none;">${lead.email}</a>` : '<span style="color: #64748b; font-weight: 500;">Not available</span>');

    const websiteDisplay = !hasConnectAccess
        ? `<span onclick="window.State.setPricingModal(true);" style="color: #d97706; cursor: pointer; text-decoration: underline; font-weight: 700; font-size: 13px;"><i data-lucide="lock" style="width:11px; height:11px;"></i> Locked (${maskedWebsite || 'web****.com'})</span>`
        : (lead.website ? `<a href="${lead.website.startsWith('http') ? lead.website : 'https://' + lead.website}" target="_blank" style="color: #2563eb; font-weight: 700; text-decoration: underline;">${lead.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]} ➔</a>` : '<span style="color: #64748b; font-weight: 500;">Not available</span>');

    // Tab content details
    let tabContentHTML = '';

    if (activeModalTab === 'details') {
        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const currentDayIndex = (new Date().getDay() + 6) % 7;
        const todayName = dayNames[currentDayIndex];
        
        let hoursRowsHTML = '';
        const hours = lead.hours || {};
        
        for (const day of dayNames) {
            const timeStr = hours[day] || "Unavailable";
            const isToday = day === todayName;
            hoursRowsHTML += `
                <tr class="${isToday ? 'today' : ''}" style="${isToday ? 'background: rgba(37,99,235,0.04); font-weight:700;' : ''}">
                    <td style="padding: 6px 10px; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 12.5px;">${day}</td>
                    <td style="padding: 6px 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 12.5px; text-align: right;">${timeStr}</td>
                </tr>
            `;
        }

        const mapHTML = lead.latitude && lead.longitude
            ? (hasConnectAccess 
                ? `
                    <div class="sidebar-title" style="color: #475569; font-weight: 800; font-size: 11px; font-family: var(--font-mono); text-transform: uppercase; margin-top: 20px; margin-bottom: 8px;">Location Map</div>
                    <div id="modalMapElement" class="modal-map" style="border-radius: var(--radius-md); border: 1.5px solid #cbd5e1; overflow: hidden; height: 160px; margin-bottom: 12px;"></div>
                  `
                : `
                    <div class="sidebar-title" style="color: #475569; font-weight: 800; font-size: 11px; font-family: var(--font-mono); text-transform: uppercase; margin-top: 20px; margin-bottom: 8px;">Location Map</div>
                    <div class="modal-map" style="display: flex; align-items: center; justify-content: center; background: #f8fafc; border: 1.5px dashed #cbd5e1; height: 160px; border-radius: var(--radius-md); flex-direction: column;">
                        <div style="margin-bottom: 8px; color: #64748b;"><i data-lucide="lock" style="width:20px; height:20px;"></i></div>
                        <span style="font-size: 11.5px; color: #475569; font-weight: 600; text-align: center; max-width: 240px; line-height: 1.4;">
                            Location maps are locked. Upgrade to Scout Plan.
                        </span>
                    </div>
                  `
              )
            : '';

        tabContentHTML = `
            <div class="modal-meta-grid" style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 28px; margin-bottom: 12px; align-items: start;">
                <div>
                    <div class="sidebar-title" style="color: #475569; font-weight: 800; font-size: 11px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; border-bottom:1px solid #f1f5f9; padding-bottom:6px;">Contact Info</div>
                    <div class="contact-icon-grid" style="display: flex; flex-direction: column; gap: 14px;">
                        <div class="contact-icon-row" style="display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="phone" style="width:14px; height:14px; color: #64748b; flex-shrink:0;"></i>
                            <span style="font-size: 11px; font-family: var(--font-mono); color: #475569; font-weight: 800; width: 65px; text-transform: uppercase;">PHONE:</span>
                            <span style="color: #0f172a; font-weight: 700; font-size: 13.5px;">${phoneDisplay}</span>
                        </div>
                        <div class="contact-icon-row" style="display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="mail" style="width:14px; height:14px; color: #64748b; flex-shrink:0;"></i>
                            <span style="font-size: 11px; font-family: var(--font-mono); color: #475569; font-weight: 800; width: 65px; text-transform: uppercase;">EMAIL:</span>
                            <span style="color: #0f172a; font-weight: 700; font-size: 13.5px;">${emailDisplay}</span>
                        </div>
                        <div class="contact-icon-row" style="display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="globe" style="width:14px; height:14px; color: #64748b; flex-shrink:0;"></i>
                            <span style="font-size: 11px; font-family: var(--font-mono); color: #475569; font-weight: 800; width: 65px; text-transform: uppercase;">WEBSITE:</span>
                            <span style="color: #0f172a; font-weight: 700; font-size: 13.5px;">${websiteDisplay}</span>
                        </div>
                        <div class="contact-icon-row" style="display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="map-pin" style="width:14px; height:14px; color: #64748b; flex-shrink:0;"></i>
                            <span style="font-size: 11px; font-family: var(--font-mono); color: #475569; font-weight: 800; width: 65px; text-transform: uppercase;">AREA:</span>
                            <span style="color: #0f172a; font-weight: 700; font-size: 13.5px;">${lead.area || "Mumbai"}</span>
                        </div>
                    </div>
                    ${mapHTML}
                </div>
                
                <div>
                    <div class="sidebar-title" style="color: #475569; font-weight: 800; font-size: 11px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; border-bottom:1px solid #f1f5f9; padding-bottom:6px;">Business Hours</div>
                    <table class="hours-table" style="width: 100%; border-collapse: collapse;">
                        <tbody>
                            ${hoursRowsHTML}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- AI Outreach Pitch Block -->
            ${(() => {
                if (!currentUserHasAccess('hunter')) return '';
                if (!State.user_survey) return '';
                const survey = State.user_survey;
                const senderName = State.profile?.full_name || 'Shri';
                let pitchText = '';
                let strategyTitle = '';

                if (survey.role === 'web_developer') {
                    strategyTitle = 'Website Creation Proposal';
                    pitchText = `Hi ${lead.name} team,\n\nI was browsing local businesses in ${lead.area || 'Mumbai'} and noticed your profile has a great rating of ${rating}★ from ${reviewCount} customers. However, you don't have a website link configured.\n\nI build high-converting websites for local ${lead.category || 'professionals'} to automate bookings and capture leads directly. I put together a quick website draft for your brand. Do you have 2 minutes for a brief call?\n\nBest,\n${senderName}`;
                } else if (survey.role === 'seo_marketer') {
                    strategyTitle = 'Local Google SEO / Review Boosting';
                    if (rating < 4.0) {
                        strategyTitle = 'Negative Ratings Mitigation';
                        pitchText = `Hi ${lead.name} team,\n\nI'm local in Mumbai and noticed your profile in ${lead.area || 'Mumbai'} has over ${reviewCount} customer reviews but holds a ${rating}★ rating. Many prospective clients check ratings before buying, and having it below 4 stars could be turning leads away.\n\nI run a localized review boosting system that filters out negative spam and secures verified 5-star customer ratings. Can I share a quick audit for you?\n\nBest,\n${senderName}`;
                    } else {
                        pitchText = `Hi ${lead.name} team,\n\nI noticed you have a top-tier rating of ${rating}★ in ${lead.area || 'Mumbai'}. However, you're missing some essential details on your Google maps listing (like website links/hours) which is hurting your local search ranking.\n\nI optimize Google profiles to double review visibility and rank you above competitors. Do you have time for a short call?\n\nBest,\n${senderName}`;
                    }
                } else {
                    strategyTitle = 'B2B Collaboration Pitch';
                    pitchText = `Hi ${lead.name} team,\n\nI noticed your established local business in ${lead.area || 'Mumbai'}. I run a B2B service agency in Mumbai and work with high-quality ${lead.category || 'providers'} to cross-promote and supply qualified B2B clients.\n\nWould you be open to a quick call this week to explore a referral partnership?\n\nBest,\n${senderName}`;
                }

                return `
                    <div class="feature-panel outreach-assistant-panel" style="margin-top: 16px; padding: 16px; border: 1px solid #fde68a; background: #fffbeb; border-radius: var(--radius-md);">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                            <div style="font-size: 10px; font-family: var(--font-mono); color: #b45309; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                                Outreach Assistant — ${strategyTitle}
                            </div>
                            <button id="copyPitchBtn" class="secondary-btn" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 6px; cursor: pointer; background: #2563eb; color: #ffffff; border: none; box-shadow: 0 2px 6px rgba(37,99,235,0.2);" data-pitch="${encodeURIComponent(pitchText)}">
                                Copy Pitch Template
                            </button>
                        </div>
                        <div style="position: relative;">
                            <textarea readonly style="width: 100%; height: 90px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: var(--radius-sm); padding: 8px; font-size: 12px; color: #0f172a; font-family: sans-serif; resize: none; line-height: 1.4; outline: none; font-weight: 500;">${pitchText}</textarea>
                        </div>
                    </div>
                `;
            })()}
        `;
    } else {
        // AI Research Tab content layout
        if (researchJob && researchJob.status === 'researching') {
            tabContentHTML = `
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4 style="margin: 0; font-size: 14.5px; color: #0f172a; font-family: var(--font-heading); font-weight: 800; display:flex; align-items:center; gap:8px;">
                            <span class="spinner" style="width:16px; height:16px; border-width:2px;"></span>
                            <span>🤖 AI Agent Crawler active: ${lead.name}</span>
                        </h4>
                        <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #2563eb;">
                            ${simulatedProgressPercent}% Complete
                        </span>
                    </div>

                    <!-- Progress bar -->
                    <div style="height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden; position: relative;">
                        <div style="width: ${simulatedProgressPercent}%; height: 100%; background: #2563eb; transition: width 0.4s ease; border-radius: 10px;"></div>
                    </div>

                    <!-- Live feed logs console -->
                    <div style="background: #0f172a; border-radius: 8px; padding: 14px; font-family: var(--font-mono, monospace); font-size: 11px; height: 180px; overflow-y: auto; color: #38bdf8; display: flex; flex-direction: column; gap: 8px;">
                        ${simulatedStatusLogs.map(log => `<div>${log}</div>`).join('')}
                    </div>

                    <span style="font-size: 11.5px; color: #64748b; text-align: center;">Estimated completion time: 5-8 seconds...</span>
                </div>
            `;
        } else if (activeReport) {
            const hasBlogBadge = activeReport.has_blog ? `<span style="background:#dcfce7; color:#15803d; font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px;">BLOG: YES</span>` : `<span style="background:#fee2e2; color:#b91c1c; font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px;">BLOG: NO</span>`;
            const hasEcomBadge = activeReport.has_ecommerce ? `<span style="background:#dcfce7; color:#15803d; font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px;">E-COMMERCE: YES</span>` : `<span style="background:#fee2e2; color:#b91c1c; font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px;">E-COMMERCE: NO</span>`;

            tabContentHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; height: 350px; overflow-y: auto; padding-right: 6px;">
                    
                    <!-- Box 1: Company Intelligence -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                        <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #0f172a; font-family: var(--font-heading); font-weight: 800; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">🏢 Company Profile</h4>
                        <p style="margin: 0 0 12px 0; font-size: 12px; color: #475569; line-height: 1.4;">${activeReport.company_summary}</p>
                        <div style="display:flex; flex-direction:column; gap:6px; font-size:12px; color:#475569;">
                            <span><strong>Vertical:</strong> ${activeReport.industry_vertical}</span>
                            <span><strong>Team Size:</strong> ${activeReport.team_size_estimate}</span>
                            <span><strong>Founded:</strong> Year ${activeReport.founding_year}</span>
                            <span><strong>Founder/MD:</strong> ${activeReport.key_people[0]?.name || 'Unknown'}</span>
                        </div>
                    </div>

                    <!-- Box 2: Digital Presence -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                        <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #0f172a; font-family: var(--font-heading); font-weight: 800; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">🌐 Website & Tech Stack</h4>
                        <div style="display:flex; gap:6px; margin-bottom:12px; flex-wrap:wrap;">
                            ${hasBlogBadge}
                            ${hasEcomBadge}
                        </div>
                        <div style="display:flex; flex-direction:column; gap:6px; font-size:12px; color:#475569;">
                            <span><strong>CMS:</strong> ${activeReport.cms_platform.toUpperCase()}</span>
                            <span><strong>Mobile Responsive:</strong> ${activeReport.mobile_responsive ? '✅ Responsive' : '❌ Needs Optimization'}</span>
                            <span><strong>Tech Stack:</strong> ${activeReport.tech_stack.slice(0, 4).join(', ')}</span>
                        </div>
                    </div>

                    <!-- Box 3: Buying Signals & Intent Score -->
                    <div style="background: rgba(255, 160, 0, 0.02); border: 1px solid rgba(255, 160, 0, 0.2); border-radius: 8px; padding: 16px;">
                        <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #b45309; font-family: var(--font-heading); font-weight: 800; border-bottom:1px solid rgba(255, 160, 0, 0.15); padding-bottom:6px; display:flex; align-items:center; justify-content:space-between;">
                            <span>🔥 Buying Signals</span>
                            <span style="font-family:var(--font-mono); color:#d97706;">Score: ${activeReport.intent_score}/100</span>
                        </h4>
                        
                        <div style="display:flex; flex-direction:column; gap:8px; font-size:11.5px; color:#475569;">
                            <div style="display:flex; align-items:start; gap:6px;">
                                <span>📢</span>
                                <span>Hiring: ${activeReport.hiring_signals[0]?.role || 'None detected'}</span>
                            </div>
                            <div style="display:flex; align-items:start; gap:6px;">
                                <span>📰</span>
                                <span>News: ${activeReport.recent_news[0]?.title || 'Stable operations'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Box 4: Outreach Strategy & Pain Points -->
                    <div style="background: rgba(37,99,235,0.02); border: 1px solid rgba(37,99,235,0.15); border-radius: 8px; padding: 16px;">
                        <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #2563eb; font-family: var(--font-heading); font-weight: 800; border-bottom:1px solid rgba(37,99,235,0.15); padding-bottom:6px;">🎯 Personalization Angles</h4>
                        <div style="font-size:11.5px; color:#475569; display:flex; flex-direction:column; gap:8px;">
                            <div><strong>Pain Point:</strong> ${activeReport.identified_pain_points[0]}</div>
                            <div style="border-top:1px dashed #e2e8f0; padding-top:6px; color:#2563eb;"><strong>Angle:</strong> ${activeReport.outreach_angles[0]}</div>
                        </div>
                    </div>

                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e2e8f0; padding-top:16px; margin-top:10px;">
                    <span style="font-size:11.5px; color:#64748b;">Scan expires in 30 days. Last updated: ${new Date(activeReport.created_at).toLocaleDateString()}</span>
                    <button class="brand-btn" id="modalResearchRerunBtn" style="padding:6px 14px; font-size:11.5px; font-weight:700; background:rgba(255,255,255,0.06); border:1px solid #cbd5e1; color:#0f172a;">Rerun Agent Crawler</button>
                </div>
            `;
        } else {
            // Introductory overlay
            const limit = State.profile?.monthly_research_limit || 25;
            const used = State.profile?.monthly_research_used || 0;
            const remaining = Math.max(0, limit - used);

            tabContentHTML = `
                <div style="padding: 40px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; background:#f8fafc; border: 1px dashed #cbd5e1; border-radius:12px;">
                    <div style="font-size: 40px;">🤖</div>
                    <h3 style="margin: 0; color: #0f172a; font-family: var(--font-heading); font-size: 16.5px; font-weight: 800;">
                        Analyze Local Business with autonomous AI Research Agent
                    </h3>
                    <p style="margin: 0 auto; color: #64748b; font-size: 13px; max-width: 440px; line-height: 1.4;">
                        Our crawler will deep-scan their homepage HTML tags, check social media follower activity, review sentiment ratings, and identify hiring triggers.
                    </p>

                    <div style="font-size: 12px; color: #475569; font-weight: 700;">
                        Usage allowance: 🪙 ${remaining} remaining (monthly limit: ${limit})
                    </div>

                    <button class="brand-btn" id="modalLaunchResearchBtn" style="background: #2563eb; color: white; padding: 10px 24px; font-weight: 800; font-size: 13px;">
                        Launch AI Agent Crawler (1 credit)
                    </button>
                </div>
            `;
        }
    }

    const bottomCtaHTML = !hasConnectAccess
        ? `
            <button class="brand-btn" style="width: 100%; padding: 10px; font-size: 13px; font-weight: 700;" onclick="window.State.setPricingModal(true);">
                <i data-lucide="lock" style="width:14px; height:14px;"></i> Unlock Contact Details
            </button>
          `
        : '';

    return `
        <div class="modal-card" style="background: #ffffff; color: #0f172a; border: 1.5px solid #cbd5e1; box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.25); border-radius: var(--radius-lg); max-width:660px; width:100%;">
            <button class="modal-close-btn" id="closeModalBtn" style="color: #64748b; font-size: 26px; top: 16px; right: 20px;">&times;</button>
            
            <div class="modal-content" style="padding: 28px 32px;">
                
                <!-- Lead title section -->
                <div class="modal-header-section" style="display: flex; gap: 16px; margin-bottom: 16px; align-items: center;">
                    <div class="avatar-wrap" style="width: 60px; height: 60px; font-size: 22px; font-weight: 800; background: #f1f5f9; color: #0f172a; border: 2px solid #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${initials}</div>
                    <div class="card-title-wrap" style="flex: 1; min-width: 0;">
                        <span class="category-badge" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; font-weight: 700; font-size: 10px; padding: 2px 10px; border-radius: 100px; text-transform: uppercase; font-family: var(--font-mono); display: inline-block; margin-bottom: 4px;">${displayCategory}</span>
                        <h2 style="font-size: 18px; font-family: var(--font-heading); color: #0f172a; font-weight: 800; margin: 0 0 4px 0; line-height: 1.3;">${lead.name}</h2>
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                            <span class="star-rating" style="color: #d97706; font-size: 13px; font-weight: bold;">${starsHTML}</span>
                            <span style="font-size: 12px; color: #475569; font-weight: 600;">(${reviewCount} reviews)</span>
                        </div>
                    </div>
                </div>

                <!-- Tabs selector header bar -->
                <div style="display: flex; gap: 4px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">
                    <button class="modal-tab-btn select-details-tab ${activeModalTab === 'details' ? 'active' : ''}" style="background: none; border: none; font-size: 13px; font-weight: 700; color: ${activeModalTab === 'details' ? '#2563eb' : '#64748b'}; border-bottom: ${activeModalTab === 'details' ? '2.5px solid #2563eb' : 'none'}; cursor: pointer; padding: 4px 12px; margin-bottom: -11.5px;">📋 Lead Details</button>
                    <button class="modal-tab-btn select-research-tab ${activeModalTab === 'research' ? 'active' : ''}" style="background: none; border: none; font-size: 13px; font-weight: 700; color: ${activeModalTab === 'research' ? '#2563eb' : '#64748b'}; border-bottom: ${activeModalTab === 'research' ? '2.5px solid #2563eb' : 'none'}; cursor: pointer; padding: 4px 12px; margin-bottom: -11.5px; display:flex; align-items:center; gap:4px;">🤖 AI Research</button>
                </div>

                <!-- Tab panel body render -->
                <div id="modalActiveTabContentContainer">
                    ${tabContentHTML}
                </div>
                
                <!-- Bottom general buttons -->
                <div class="modal-ctas" style="margin-top: 20px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; gap: 8px; width: 100%; flex-wrap: wrap;">
                        <a href="#/dashboard/proposals?lead_id=${lead.id}" onclick="document.getElementById('modalBackdrop')?.remove();" class="brand-btn" style="flex: 1; min-width: 150px; text-decoration: none; padding: 8px; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; background: #2563eb; color: #ffffff; border-radius: var(--radius-md);">
                            <i data-lucide="sparkles" style="width:13px; height:13px;"></i> 📄 Generate PDF Proposal
                        </a>
                        <a href="#/dashboard/call-scripts?lead_id=${lead.id}" onclick="document.getElementById('modalBackdrop')?.remove();" class="secondary-btn" style="flex: 1; min-width: 150px; text-decoration: none; padding: 8px; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; border: 1.5px solid #10b981; background: #ecfdf5; color: #047857; font-weight: 700; border-radius: var(--radius-md);">
                            <i data-lucide="phone-call" style="width:13px; height:13px;"></i> 📞 Generate Call Script
                        </a>
                    </div>

                    ${bottomCtaHTML}
                    
                    <div style="display: flex; gap: 8px; width: 100%;">
                        <button id="modalTrackLeadBtn" class="secondary-btn ${isTracked ? 'active' : ''}" style="flex: 1; padding: 8px; font-size: 12px; font-weight: 700; border-radius: var(--radius-md); border: 1.5px solid ${isTracked ? '#059669' : '#cbd5e1'}; background: ${isTracked ? '#ecfdf5' : '#f1f5f9'}; color: ${isTracked ? '#047857' : '#0f172a'};">
                            <i data-lucide="${isTracked ? 'bookmark-check' : 'bookmark'}" style="width:12px; height:12px;"></i> ${isTracked ? 'Tracked' : 'Track This Lead'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    `;
}

export function bindProfessionalModalEvents(lead, onClose) {
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    // Pre-load report to see if we already have cache
    (async () => {
        try {
            activeReport = await ResearchApi.getResearchReport(lead.id);
        } catch (e) {
            console.warn("Report check skipped:", e);
        }
    })();

    // Handle close button
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (onClose) onClose();
            // Reset tab flags
            activeModalTab = 'details';
            activeReport = null;
            researchJob = null;
        });
    }

    // Tab change select details
    const selectDetails = document.querySelector('.modal-tab-btn.select-details-tab');
    if (selectDetails) {
        selectDetails.addEventListener('click', () => {
            activeModalTab = 'details';
            refreshModalBody(lead, onClose);
        });
    }

    // Tab change select research
    const selectResearch = document.querySelector('.modal-tab-btn.select-research-tab');
    if (selectResearch) {
        selectResearch.addEventListener('click', async () => {
            activeModalTab = 'research';
            refreshModalBody(lead, onClose);
        });
    }

    // Launch Research button trigger
    const launchBtn = document.getElementById('modalLaunchResearchBtn') || document.getElementById('modalResearchRerunBtn');
    if (launchBtn) {
        launchBtn.addEventListener('click', async () => {
            try {
                // Check tier access
                if (!currentUserHasAccess('scout')) {
                    if (window.State && window.State.setPricingModal) {
                        window.State.setPricingModal(true);
                    }
                    return;
                }

                // 1. Create job
                researchJob = await ResearchApi.startResearchJob(lead.id);
                simulatedStatusLogs = [];
                simulatedProgressPercent = 0;
                refreshModalBody(lead, onClose);

                // 2. Run simulation ticks
                const logSteps = [
                    `[1s] VISITING: Checking DNS resolving for ${lead.website || 'domain.com'}...`,
                    `[2s] HOMEPAGE: Scanning HTML body tags. Detected WordPress 6.2 CMS platform.`,
                    `[3s] DIRECTORIES: Scanning reviews sentiment in Google Local pack map entries...`,
                    `[4s] REVIEWS: 4.5 average score. Common keyword complaints: "Peak hours waiting".`,
                    `[6s] SOCIALS: Checked Instagram @${lead.name.toLowerCase().replace(/[^a-z]/g,'')} (1.2k followers, active).`,
                    `[7s] HIRING: Scanning local job portals. Detected 1 open CRM specialist position.`,
                    `[8s] COMPLETE: Synthesizing outreach angles and personalizing target pitch.`
                ];

                for (let i = 0; i < logSteps.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    simulatedStatusLogs.push(logSteps[i]);
                    simulatedProgressPercent = Math.min(100, Math.round(((i + 1) / logSteps.length) * 100));
                    refreshModalBody(lead, onClose);
                }

                // 3. Save report and complete
                activeReport = await ResearchApi.saveCompletedResearchReport(researchJob.id, lead.id, lead.name, lead.website);
                researchJob = null;
                refreshModalBody(lead, onClose);

            } catch (err) {
                alert(`Research agent execution failed: ${err.message}`);
            }
        });
    }

    // Handle track lead button
    const trackBtn = document.getElementById('modalTrackLeadBtn');
    if (trackBtn) {
        trackBtn.addEventListener('click', () => {
            showTrackLeadModal(lead.id, () => {
                refreshModalBody(lead, onClose);
            });
        });
    }

    const hasConnectAccess = currentUserHasAccess('scout');

    // Initialize Leaflet Mini-Map if coordinates are available and user has connect access
    if (lead.latitude && lead.longitude && hasConnectAccess && activeModalTab === 'details') {
        try {
            setTimeout(() => {
                const mapContainer = document.getElementById('modalMapElement');
                if (!mapContainer) return;
                
                const map = L.map('modalMapElement', {
                    zoomControl: false,
                    attributionControl: false
                }).setView([lead.latitude, lead.longitude], 15);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                
                L.circleMarker([lead.latitude, lead.longitude], {
                    radius: 8,
                    fillColor: '#ffa000',
                    color: '#ffffff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map);
            }, 100);
        } catch (e) {
            console.error("Failed to render Leaflet mini-map in modal: ", e);
        }
    }

    // AI Outreach Pitch Copy listener
    const copyPitchBtn = document.getElementById('copyPitchBtn');
    if (copyPitchBtn) {
        copyPitchBtn.addEventListener('click', () => {
            const rawPitch = decodeURIComponent(copyPitchBtn.getAttribute('data-pitch'));
            navigator.clipboard.writeText(rawPitch).then(() => {
                const originalText = copyPitchBtn.innerHTML;
                copyPitchBtn.innerHTML = '✓ Copied!';
                copyPitchBtn.style.borderColor = 'var(--accent-gold)';
                copyPitchBtn.style.color = 'var(--accent-gold)';
                setTimeout(() => {
                    copyPitchBtn.innerHTML = originalText;
                    copyPitchBtn.style.borderColor = '';
                    copyPitchBtn.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error("Failed to copy text: ", err);
            });
        });
    }
}

function refreshModalBody(lead, onClose) {
    const container = document.getElementById('detailModalOverlay');
    if (container) {
        container.innerHTML = renderProfessionalModal(lead);
        bindProfessionalModalEvents(lead, onClose);
    }
}

export function setActiveModalTab(tab) {
    activeModalTab = tab;
}
