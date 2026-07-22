import { isOpenNow } from '../api.js';
import L from 'leaflet';
import { State } from '../state.js';
import { currentUserHasAccess } from '../auth.js';
import { showTrackLeadModal } from './TrackLeadModal.js';


export function renderProfessionalModal(lead) {
    const isTracked = State.saved_lead_ids && State.saved_lead_ids.includes(lead.id);

    // Sanitize category — detect if raw category data accidentally contains an address
    const rawCat = lead.category || '';
    const looksLikeAddress = /\d/.test(rawCat) && (/,/.test(rawCat) || /\b(rd|road|st|street|lane|nagar|marg|path|opp|nr|near)\b/i.test(rawCat));
    const displayCategory = (!rawCat || looksLikeAddress || rawCat.length > 40) ? (lead.parent_category || 'Other') : rawCat;
    // Initial avatar extract
    const initials = lead.name
        .split(' ')
        .filter(x => x.length > 0)
        .slice(0, 2)
        .map(x => x[0].toUpperCase())
        .join('');

    // Ratings star generator
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

    // Complete dots
    const score = lead.completeness_score || 0;
    let dotsHTML = '';
    for (let i = 0; i < 5; i++) {
        dotsHTML += `<span class="complete-dot ${i < score ? 'filled' : ''}"></span>`;
    }

    // Hours Mapping Table
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const currentDayIndex = (new Date().getDay() + 6) % 7; // Convert Sun=0, Mon=1 to Mon=0, Sun=6
    const todayName = dayNames[currentDayIndex];
    
    let hoursRowsHTML = '';
    const hours = lead.hours || {};
    
    for (const day of dayNames) {
        const timeStr = hours[day] || "Unavailable";
        const isToday = day === todayName;
        hoursRowsHTML += `
            <tr class="${isToday ? 'today' : ''}">
                <td>${day}</td>
                <td>${timeStr}</td>
            </tr>
        `;
    }

    const isPremium = currentUserHasAccess('scout');
    const isLeadInFirst12 = State.professionals && State.professionals.slice(0, 12).some(p => p.id === lead.id);
    const isFreemiumSampleUnlocked = !isPremium && isLeadInFirst12;
    const hasConnectAccess = isPremium || isFreemiumSampleUnlocked;

    const phoneDisplay = !hasConnectAccess 
        ? `<span onclick="window.State.setPricingModal(true);" style="color: #d97706; cursor: pointer; text-decoration: underline; font-weight: 700; font-size: 13px;"><i data-lucide="lock" style="width:11px; height:11px;"></i> Locked</span>`
        : (lead.phone ? `<a href="tel:${lead.phone}" style="color: #059669; font-weight: 700; text-decoration: none;">${lead.phone}</a>` : '<span style="color: #64748b; font-weight: 500;">Not available</span>');

    const emailDisplay = !hasConnectAccess
        ? `<span onclick="window.State.setPricingModal(true);" style="color: #d97706; cursor: pointer; text-decoration: underline; font-weight: 700; font-size: 13px;"><i data-lucide="lock" style="width:11px; height:11px;"></i> Locked</span>`
        : (lead.email ? `<a href="mailto:${lead.email}" style="color: #2563eb; font-weight: 700; text-decoration: none;">${lead.email}</a>` : '<span style="color: #64748b; font-weight: 500;">Not available</span>');

    const websiteDisplay = !hasConnectAccess
        ? `<span onclick="window.State.setPricingModal(true);" style="color: #d97706; cursor: pointer; text-decoration: underline; font-weight: 700; font-size: 13px;"><i data-lucide="lock" style="width:11px; height:11px;"></i> Locked</span>`
        : (lead.website ? `<a href="${lead.website}" target="_blank" style="color: #2563eb; font-weight: 700; text-decoration: underline;">Visit Site</a>` : '<span style="color: #64748b; font-weight: 500;">Not available</span>');

    const mapHTML = lead.latitude && lead.longitude
        ? (hasConnectAccess 
            ? `
                <div class="sidebar-title" style="color: #475569; font-weight: 800; font-size: 12px; font-family: var(--font-mono); text-transform: uppercase; margin-top: 20px; margin-bottom: 8px;">Location Map</div>
                <div id="modalMapElement" class="modal-map" style="border-radius: var(--radius-md); border: 1.5px solid #cbd5e1; overflow: hidden; height: 180px;"></div>
              `
            : `
                <div class="sidebar-title" style="color: #475569; font-weight: 800; font-size: 12px; font-family: var(--font-mono); text-transform: uppercase; margin-top: 20px; margin-bottom: 8px;">Location Map</div>
                <div class="modal-map" style="display: flex; align-items: center; justify-content: center; background: #f8fafc; border: 1.5px dashed #cbd5e1; height: 180px; border-radius: var(--radius-md); flex-direction: column;">
                    <div style="margin-bottom: 8px; color: #64748b;"><i data-lucide="lock" style="width:24px; height:24px;"></i></div>
                    <span style="font-size: 12px; color: #475569; font-weight: 600; text-align: center; max-width: 240px; line-height: 1.4;">
                        Location maps are locked. Upgrade to Scout Plan to view professional map locations.
                    </span>
                    <button class="brand-btn" style="padding: 6px 14px; font-size: 11.5px; font-weight: 700; margin-top: 12px;" onclick="window.State.setPricingModal(true);">Upgrade Plan</button>
                </div>
              `
          )
        : '';

    const bottomCtaHTML = !hasConnectAccess
        ? `
            <button class="brand-btn" style="width: 100%; padding: 10px; font-size: 13px; font-weight: 700;" onclick="window.State.setPricingModal(true);">
                <i data-lucide="lock" style="width:14px; height:14px;"></i> Unlock Contact Details
            </button>
          `
        : '';

    return `
        <div class="modal-card" style="background: #ffffff; color: #0f172a; border: 1.5px solid #cbd5e1; box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.25); border-radius: var(--radius-lg);">
            <button class="modal-close-btn" id="closeModalBtn" style="color: #64748b; font-size: 26px; top: 16px; right: 20px;">&times;</button>
            <div class="modal-content" style="padding: 32px 36px;">
                <div class="modal-header-section" style="display: flex; gap: 20px; margin-bottom: 24px; align-items: center;">
                    <div class="avatar-wrap" style="width: 72px; height: 72px; font-size: 26px; font-weight: 800; background: #f1f5f9; color: #0f172a; border: 2px solid #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${initials}</div>
                    <div class="card-title-wrap" style="flex: 1; min-width: 0;">
                        <span class="category-badge" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; font-weight: 700; font-size: 11px; padding: 2px 10px; border-radius: 100px; text-transform: uppercase; font-family: var(--font-mono); display: inline-block; margin-bottom: 6px;">${displayCategory}</span>
                        <h2 style="font-size: 20px; font-family: var(--font-heading); color: #0f172a; font-weight: 800; margin: 0 0 6px 0; line-height: 1.3;">${lead.name}</h2>
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                            <span class="star-rating" style="color: #d97706; font-size: 14px; font-weight: bold;">${starsHTML}</span>
                            <span style="font-size: 13px; color: #475569; font-weight: 600;">(${reviewCount} reviews)</span>
                            <div class="completeness-dots" title="Data completeness: ${score}/5" style="margin-top: 0;">${dotsHTML}</div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-meta-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                    <div>
                        <div class="sidebar-title" style="color: #475569; font-weight: 800; font-size: 12px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px;">Contact Info</div>
                        <div class="contact-icon-grid" style="display: flex; flex-direction: column; gap: 12px;">
                            <div class="contact-icon-row" style="display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="phone" style="width:14px; height:14px; color: #64748b; flex-shrink:0;"></i>
                                <span style="font-size: 11px; font-family: var(--font-mono); color: #475569; font-weight: 800; width: 65px; text-transform: uppercase;">PHONE:</span>
                                <span style="color: #0f172a; font-weight: 700;">${phoneDisplay}</span>
                            </div>
                            <div class="contact-icon-row" style="display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="mail" style="width:14px; height:14px; color: #64748b; flex-shrink:0;"></i>
                                <span style="font-size: 11px; font-family: var(--font-mono); color: #475569; font-weight: 800; width: 65px; text-transform: uppercase;">EMAIL:</span>
                                <span style="color: #0f172a; font-weight: 700;">${emailDisplay}</span>
                            </div>
                            <div class="contact-icon-row" style="display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="globe" style="width:14px; height:14px; color: #64748b; flex-shrink:0;"></i>
                                <span style="font-size: 11px; font-family: var(--font-mono); color: #475569; font-weight: 800; width: 65px; text-transform: uppercase;">WEBSITE:</span>
                                <span style="color: #0f172a; font-weight: 700;">${websiteDisplay}</span>
                            </div>
                            <div class="contact-icon-row" style="display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="map-pin" style="width:14px; height:14px; color: #64748b; flex-shrink:0;"></i>
                                <span style="font-size: 11px; font-family: var(--font-mono); color: #475569; font-weight: 800; width: 65px; text-transform: uppercase;">AREA:</span>
                                <span style="color: #0f172a; font-weight: 700;">${lead.area || "Mumbai"}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div class="sidebar-title" style="color: #475569; font-weight: 800; font-size: 12px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px;">Business Hours</div>
                        <table class="hours-table" style="width: 100%; border-collapse: collapse;">
                            <tbody>
                                ${hoursRowsHTML}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- AI Outreach Pitch Block -->
                ${(() => {
                    if (!currentUserHasAccess('hunter')) return ''; // Outreach pitch is Hunter+ only
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
                    } else if (survey.role === 'finance_ca') {
                        strategyTitle = 'Financial Audit & Tax Support Proposal';
                        pitchText = `Hi ${lead.name} team,\n\nI support growing ${lead.category || 'businesses'} in ${lead.area || 'Mumbai'} with accounting, legal compliance, and tax planning.\n\nSince you are actively scaling with a strong ${rating}★ track record, I would love to offer a free 15-minute consultation to review your current tax structure and identify compliance savings.\n\nBest,\n${senderName}`;
                    } else if (survey.role === 'real_estate') {
                        strategyTitle = 'Commercial Space / Office Relocation Matching';
                        pitchText = `Hi ${lead.name} team,\n\nI specialize in office search, commercial acquisition, and corporate relocation in the ${lead.area || 'Mumbai'} sector.\n\nI'm currently mapping commercial spaces in ${lead.area || 'Mumbai'} and have 3 prime off-market offices that match the profile of top-tier ${lead.category || 'companies'} like yours. Would you be open to a quick relocation catalog?\n\nBest,\n${senderName}`;
                    } else {
                        strategyTitle = 'B2B Collaboration Pitch';
                        pitchText = `Hi ${lead.name} team,\n\nI noticed your established local business in ${lead.area || 'Mumbai'}. I run a B2B service agency in Mumbai and work with high-quality ${lead.category || 'providers'} to cross-promote and supply qualified B2B clients.\n\nWould you be open to a quick call this week to explore a referral partnership?\n\nBest,\n${senderName}`;
                    }

                    return `
                        <div class="feature-panel outreach-assistant-panel" style="margin-top: 24px; padding: 18px; border: 1.5px solid #fde68a; background: #fffbeb; border-radius: var(--radius-md);">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                                <div style="font-size: 11px; font-family: var(--font-mono); color: #b45309; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Outreach Assistant — ${strategyTitle}
                                </div>
                                <button id="copyPitchBtn" class="secondary-btn" style="padding: 5px 12px; font-size: 11px; font-weight: 700; border-radius: 6px; cursor: pointer; background: #2563eb; color: #ffffff; border: none; box-shadow: 0 2px 6px rgba(37,99,235,0.2);" data-pitch="${encodeURIComponent(pitchText)}">
                                    Copy Pitch Template
                                </button>
                            </div>
                            <div style="position: relative;">
                                <textarea readonly style="width: 100%; height: 110px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: var(--radius-sm); padding: 10px; font-size: 12.5px; color: #0f172a; font-family: sans-serif; resize: none; line-height: 1.4; outline: none; font-weight: 500;">${pitchText}</textarea>
                            </div>
                        </div>
                    `;
                })()}
                
                ${mapHTML}
                
                <div class="modal-ctas" style="margin-top: 24px; display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; gap: 10px; width: 100%; flex-wrap: wrap;">
                        <a href="#/dashboard/proposals?lead_id=${lead.id}" onclick="document.getElementById('modalBackdrop')?.remove();" class="brand-btn" style="flex: 1; min-width: 160px; text-decoration: none; padding: 10px; font-size: 12.5px; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; background: #2563eb; color: #ffffff; border-radius: var(--radius-md);">
                            <i data-lucide="sparkles" style="width:14px; height:14px;"></i> 📄 Generate PDF Proposal
                        </a>
                        <a href="#/dashboard/call-scripts?lead_id=${lead.id}" onclick="document.getElementById('modalBackdrop')?.remove();" class="secondary-btn" style="flex: 1; min-width: 160px; text-decoration: none; padding: 10px; font-size: 12.5px; display: flex; align-items: center; justify-content: center; gap: 6px; border: 1.5px solid #10b981; background: #ecfdf5; color: #047857; font-weight: 700; border-radius: var(--radius-md);">
                            <i data-lucide="phone-call" style="width:14px; height:14px;"></i> 📞 Generate Call Script
                        </a>
                    </div>

                    ${bottomCtaHTML}
                    
                    <div style="display: flex; gap: 12px; width: 100%;">
                        <button id="modalTrackLeadBtn" class="secondary-btn ${isTracked ? 'active' : ''}" style="flex: 1; padding: 9px; font-size: 12.5px; font-weight: 700; border-radius: var(--radius-md); border: 1.5px solid ${isTracked ? '#059669' : '#cbd5e1'}; background: ${isTracked ? '#ecfdf5' : '#f1f5f9'}; color: ${isTracked ? '#047857' : '#0f172a'};">
                            <i data-lucide="${isTracked ? 'bookmark-check' : 'bookmark'}" style="width:13px; height:13px;"></i> ${isTracked ? 'Tracked' : 'Track This Lead'}
                        </button>
                    </div>
                    ${lead.source_url && hasConnectAccess ? `
                        <a href="${lead.source_url}" target="_blank" class="secondary-btn" style="width: 100%; text-align: center; justify-content: center; display: inline-flex; align-items: center; gap: 6px; padding: 9px; font-size: 12.5px; font-weight: 700; border: 1.5px solid #cbd5e1; background: #ffffff; color: #0f172a; border-radius: var(--radius-md);">
                            View on Google Maps
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

export function bindProfessionalModalEvents(lead, onClose) {
    if (window.lucide) {
        window.lucide.createIcons();
    }
    // Handle close button
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (onClose) onClose();
        });
    }

    // Handle track lead button
    const trackBtn = document.getElementById('modalTrackLeadBtn');
    if (trackBtn) {
        trackBtn.addEventListener('click', () => {
            showTrackLeadModal(lead.id, () => {
                // Re-render modal to show 'Tracked' status
                const container = document.getElementById('detailModalOverlay');
                if (container) {
                    container.innerHTML = renderProfessionalModal(lead);
                    bindProfessionalModalEvents(lead, onClose);
                }
            });
        });
    }

    // Scout+ required for contact access — Explorer always sees masked data per spec
    const hasConnectAccess = currentUserHasAccess('scout');

    // Initialize Leaflet Mini-Map if coordinates are available and user has connect access
    if (lead.latitude && lead.longitude && hasConnectAccess) {
        try {
            // Leaflet requires a brief pause to render inside a newly created DOM element
            setTimeout(() => {
                const mapContainer = document.getElementById('modalMapElement');
                if (!mapContainer) return;
                
                const map = L.map('modalMapElement', {
                    zoomControl: false,
                    attributionControl: false
                }).setView([lead.latitude, lead.longitude], 15);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                
                // Add custom colored circle marker
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
