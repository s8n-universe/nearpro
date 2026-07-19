import { isOpenNow } from '../api.js';
import L from 'leaflet';
import { State } from '../state.js';
import { currentUserHasAccess } from '../auth.js';
import { showTrackLeadModal } from './TrackLeadModal.js';


export function renderProfessionalModal(lead) {
    const isTracked = State.saved_lead_ids && State.saved_lead_ids.includes(lead.id);

    // Sanitize category — detect if scraped data accidentally contains an address
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

    // Scout+ required for contact access — Explorer always sees masked data per spec
    const hasConnectAccess = currentUserHasAccess('scout');

    const phoneDisplay = !hasConnectAccess 
        ? `<span onclick="window.State.setPricingModal(true);" style="color: var(--accent-gold); cursor: pointer; text-decoration: underline; font-size: 13px;"><i data-lucide="lock" style="width:11px; height:11px;"></i> Locked</span>`
        : (lead.phone || '<span style="color: var(--text-muted);">Not available</span>');

    const emailDisplay = !hasConnectAccess
        ? `<span onclick="window.State.setPricingModal(true);" style="color: var(--accent-gold); cursor: pointer; text-decoration: underline; font-size: 13px;"><i data-lucide="lock" style="width:11px; height:11px;"></i> Locked</span>`
        : (lead.email || '<span style="color: var(--text-muted);">Not available</span>');

    const websiteDisplay = !hasConnectAccess
        ? `<span onclick="window.State.setPricingModal(true);" style="color: var(--accent-gold); cursor: pointer; text-decoration: underline; font-size: 13px;"><i data-lucide="lock" style="width:11px; height:11px;"></i> Locked</span>`
        : (lead.website ? `<a href="${lead.website}" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Visit Site</a>` : '<span style="color: var(--text-muted);">Not available</span>');

    const mapHTML = lead.latitude && lead.longitude
        ? (hasConnectAccess 
            ? `
                <div class="sidebar-title">Location Map</div>
                <div id="modalMapElement" class="modal-map"></div>
              `
            : `
                <div class="sidebar-title">Location Map</div>
                <div class="modal-map" style="display: flex; align-items: center; justify-content: center; background: rgba(9, 9, 11, 0.4); border: 1px dashed var(--border); height: 180px; border-radius: var(--radius-md); flex-direction: column;">
                    <div style="margin-bottom: 8px; color: var(--text-muted);"><i data-lucide="lock" style="width:24px; height:24px;"></i></div>
                    <span style="font-size: 12px; color: var(--text-muted); text-align: center; max-width: 240px; line-height: 1.4;">
                        Location maps are locked. Upgrade to Scout Plan to view professional map locations.
                    </span>
                    <button class="brand-btn" style="padding: 6px 12px; font-size: 11px; margin-top: 12px;" onclick="window.State.setPricingModal(true);">Upgrade Plan</button>
                </div>
              `
          )
        : '';

    const bottomCtaHTML = !hasConnectAccess
        ? `
            <button class="brand-btn" style="width: 100%;" onclick="window.State.setPricingModal(true);">
                <i data-lucide="lock" style="width:14px; height:14px;"></i> Unlock Contact Details
            </button>
          `
        : '';

    return `
        <div class="modal-card">
            <button class="modal-close-btn" id="closeModalBtn">&times;</button>
            <div class="modal-content">
                <div class="modal-header-section">
                    <div class="avatar-wrap">${initials}</div>
                    <div class="card-title-wrap">
                        <span class="category-badge">${displayCategory}</span>
                        <h2 style="font-size: 22px; margin-bottom: 6px;">${lead.name}</h2>
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                            <span class="star-rating" style="color: var(--accent-gold);">${starsHTML}</span>
                            <span style="font-size: 13px; color: var(--text-muted);">(${reviewCount} reviews)</span>
                            <div class="completeness-dots" title="Data completeness: ${score}/5" style="margin-top: 0;">${dotsHTML}</div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-meta-grid">
                    <div>
                        <div class="sidebar-title">Contact Info</div>
                        <div class="contact-icon-grid">
                            <div class="contact-icon-row">
                                <i data-lucide="phone" style="width:14px; height:14px; color: var(--text-muted); flex-shrink:0;"></i>
                                <span>${phoneDisplay}</span>
                            </div>
                            <div class="contact-icon-row">
                                <i data-lucide="mail" style="width:14px; height:14px; color: var(--text-muted); flex-shrink:0;"></i>
                                <span>${emailDisplay}</span>
                            </div>
                            <div class="contact-icon-row">
                                <i data-lucide="globe" style="width:14px; height:14px; color: var(--text-muted); flex-shrink:0;"></i>
                                <span>${websiteDisplay}</span>
                            </div>
                            <div class="contact-icon-row">
                                <i data-lucide="map-pin" style="width:14px; height:14px; color: var(--text-muted); flex-shrink:0;"></i>
                                <span>${lead.area || "Mumbai"}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div class="sidebar-title">Business Hours</div>
                        <table class="hours-table">
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
                        <div class="feature-panel outreach-assistant-panel" style="margin-top: 24px; padding: 20px; border: 1px solid rgba(255, 160, 0, 0.2); background: rgba(255, 160, 0, 0.02); border-radius: var(--radius-md);">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                                <div style="font-size: 11px; font-family: var(--font-mono); color: var(--accent-gold); font-weight: bold; text-transform: uppercase;">
                                    Outreach Assistant — ${strategyTitle}
                                </div>
                                <button id="copyPitchBtn" class="secondary-btn" style="padding: 4px 8px; font-size: 11px; border-radius: var(--radius-sm); cursor: pointer;" data-pitch="${encodeURIComponent(pitchText)}">
                                    Copy Pitch Template
                                </button>
                            </div>
                            <div style="position: relative;">
                                <textarea readonly style="width: 100%; height: 110px; background: rgba(0,0,0,0.25); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px; font-size: 12px; color: var(--text-secondary); font-family: sans-serif; resize: none; line-height: 1.4; outline: none; border-color: rgba(255, 160, 0, 0.15);">${pitchText}</textarea>
                            </div>
                        </div>
                    `;
                })()}
                
                ${mapHTML}
                
                <div class="modal-ctas">
                    ${bottomCtaHTML}
                    
                    <div style="display: flex; gap: 12px; width: 100%; margin-bottom: 12px;">
                        <button id="modalTrackLeadBtn" class="secondary-btn ${isTracked ? 'active' : ''}" style="flex: 1; border-color: ${isTracked ? 'var(--accent-gold)' : ''}; color: ${isTracked ? 'var(--accent-gold)' : ''};">
                            <i data-lucide="${isTracked ? 'bookmark-check' : 'bookmark'}" style="width:13px; height:13px;"></i> ${isTracked ? 'Tracked' : 'Track This Lead'}
                        </button>
                        ${currentUserHasAccess('scout') ? `
                            <button id="shareQRBtn" class="secondary-btn" style="flex: 1;">Share via QR Code</button>
                        ` : `
                            <button class="secondary-btn" style="flex: 1; opacity: 0.5; cursor: not-allowed;" disabled><i data-lucide="lock" style="width:11px; height:11px;"></i> QR Code (Scout+)</button>
                        `}
                    </div>
                    ${lead.source_url && hasConnectAccess ? `
                        <a href="${lead.source_url}" target="_blank" class="secondary-btn" style="width: 100%; text-align: center; justify-content: center; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                            View on Google Maps
                        </a>
                    ` : ''}
                </div>
                
                <!-- Inner QR Modal placeholder -->
                <div id="qrPlaceholder" style="display: none;"></div>
            </div>
        </div>
    `;
}

export function bindProfessionalModalEvents(lead, onClose) {
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

    // Share via QR Code listener
    const shareQRBtn = document.getElementById('shareQRBtn');
    if (shareQRBtn) {
        shareQRBtn.addEventListener('click', async () => {
            const qrPlaceholder = document.getElementById('qrPlaceholder');
            if (qrPlaceholder.style.display === 'none') {
                try {
                    // Dynamically import the qrcode generator package
                    const QRCode = (await import('qrcode')).default;
                    const canvas = document.createElement('canvas');
                    
                    // Generate QR encoding for maps link or phone
                    const qrData = lead.source_url || `tel:${lead.phone || ''}` || lead.name;
                    await QRCode.toCanvas(canvas, qrData, { width: 180, margin: 2 });
                    
                    qrPlaceholder.innerHTML = '';
                    qrPlaceholder.appendChild(canvas);
                    qrPlaceholder.insertAdjacentHTML('beforeend', '<p style="font-size: 12px; margin-top: 8px; font-family: var(--font-mono); color: var(--text-muted);">Scan this QR to view listing details instantly</p>');
                    qrPlaceholder.className = 'qr-container';
                    qrPlaceholder.style.display = 'flex';
                } catch (err) {
                    console.error("Failed to generate QR Code: ", err);
                }
            } else {
                qrPlaceholder.style.display = 'none';
            }
        });
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
