import { isOpenNow } from '../api.js';
import { State } from '../state.js';
import { showTrackLeadModal } from './TrackLeadModal.js';
import { currentUserHasAccess } from '../auth.js';


// Approx latitude and longitude coordinates for Mumbai neighborhood centers
const suburbCoordinates = {
    "Bandra": { lat: 19.0596, lng: 72.8295 },
    "Andheri": { lat: 19.1136, lng: 72.8697 },
    "Borivali": { lat: 19.2307, lng: 72.8567 },
    "Malad": { lat: 19.1874, lng: 72.8484 },
    "Goregaon": { lat: 19.1663, lng: 72.8490 },
    "Kandivali": { lat: 19.2045, lng: 72.8515 },
    "Powai": { lat: 19.1176, lng: 72.9060 },
    "Vikhroli": { lat: 19.1102, lng: 72.9261 },
    "Ghatkopar": { lat: 19.0886, lng: 72.9080 },
    "Kurla": { lat: 19.0726, lng: 72.8839 },
    "Chembur": { lat: 19.0622, lng: 72.8974 },
    "Worli": { lat: 19.0117, lng: 72.8180 },
    "Lower Parel": { lat: 18.9953, lng: 72.8300 },
    "Prabhadevi": { lat: 19.0166, lng: 72.8295 },
    "Dadar": { lat: 19.0178, lng: 72.8478 },
    "Matunga": { lat: 19.0269, lng: 72.8500 },
    "BKC": { lat: 19.0607, lng: 72.8643 },
    "Juhu": { lat: 19.1023, lng: 72.8267 },
    "Versova": { lat: 19.1351, lng: 72.8136 },
    "Lokhandwala": { lat: 19.1308, lng: 72.8292 },
    "Thane": { lat: 19.2183, lng: 72.9781 },
    "Navi Mumbai": { lat: 19.0330, lng: 73.0297 },
    "Vashi": { lat: 19.0745, lng: 72.9978 },
    "Kharghar": { lat: 19.0272, lng: 73.0722 },
    "Belapur": { lat: 19.0195, lng: 73.0398 },
    "Mulund": { lat: 19.1726, lng: 72.9565 },
    "Bhandup": { lat: 19.1439, lng: 72.9373 },
    "Colaba": { lat: 18.9067, lng: 72.8147 },
    "Churchgate": { lat: 18.9322, lng: 72.8264 },
    "Fort": { lat: 18.9345, lng: 72.8371 }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Color map for categories to style the avatar border/ring dynamically
const categoryColors = {
    "Healthcare": "#3b82f6",       // blue
    "Beauty & Wellness": "#ec4899",// pink
    "Real Estate": "#10b981",      // green
    "Education": "#8b5cf6",        // purple
    "Food & Dining": "#f59e0b",      // amber
    "Finance & Legal": "#06b6d4",   // cyan
    "Technology": "#3b82f6",        // light blue
    "Daily Services": "#6366f1",    // indigo
    "Retail & Shopping": "#f43f5e", // rose
    "Events & Entertainment": "#a855f7" // violet
};

function encodeContactInfo(info) {
    if (!info) return '';
    try {
        return btoa(info);
    } catch(e) {
        return info;
    }
}

export function maskWebsite(url) {
    if (!url) return '';
    try {
        let clean = url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split('?')[0];
        const parts = clean.split('.');
        if (parts.length >= 2) {
            const domain = parts[0];
            const ext = parts.slice(1).join('.');
            if (domain.length <= 3) {
                return `${domain.slice(0, 1)}****.${ext}`;
            } else if (domain.length <= 5) {
                return `${domain.slice(0, 2)}****.${ext}`;
            } else {
                return `${domain.slice(0, 4)}****.${ext}`;
            }
        }
        return `${clean.slice(0, 4)}****`;
    } catch(e) {
        return 'web****.com';
    }
}

export function renderProfessionalCard(lead, index = 0) {
    const parentCat = lead.parent_category || "Other";
    const avatarColor = categoryColors[parentCat] || "#52525b";

    // Sanitize category — detect if raw category data accidentally contains an address
    const rawCat = lead.category || '';
    const looksLikeAddress = /\d/.test(rawCat) && (/,/.test(rawCat) || /\b(rd|road|st|street|lane|nagar|marg|path|opp|nr|near)\b/i.test(rawCat));
    const displayCategory = (!rawCat || looksLikeAddress || rawCat.length > 40) ? parentCat : rawCat;

    // Initials extraction for avatar
    const initials = lead.name
        .split(' ')
        .filter(x => x.length > 0)
        .slice(0, 2)
        .map(x => x[0].toUpperCase())
        .join('');

    // Completeness rating score indicators (5 dots)
    const score = lead.completeness_score || 0;
    
    // Ratings star generator
    const rating = lead.rating || 0;
    const reviewCount = lead.review_count || 0;
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            starsHTML += '<span class="star-filled">★</span>';
        } else if (i - 0.5 <= rating) {
            starsHTML += '<span class="star-half">★</span>';
        } else {
            starsHTML += '<span class="star-empty">☆</span>';
        }
    }

    const isTracked = State.saved_lead_ids && State.saved_lead_ids.includes(lead.id);

    // Freemium Sample Unlocking: Cards #1 and #2 (index 0 and 1) are unlocked for guest/free users as teaser samples!
    const isFreemiumSampleUnlocked = index < 2;
    const isPremium = currentUserHasAccess('scout');

    const scoreBadgeClass = score >= 4 ? 'high-score' : (score >= 2.5 ? 'mid-score' : 'low-score');
    const scoreBadgeHTML = `<span class="score-badge ${scoreBadgeClass}">${score}/5 Score</span>`;

    // Freshness tag calculation
    let freshnessTag = '';
    if (lead.updated_at) {
        const updatedDate = new Date(lead.updated_at);
        const now = new Date();
        const diffDays = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) {
            freshnessTag = '<span class="freshness-tag ultra-fresh">🔥 Updated 3d ago</span>';
        } else if (diffDays <= 7) {
            freshnessTag = '<span class="freshness-tag fresh">✨ Updated this week</span>';
        }
    }

    const isSelected = State.selected_ids.includes(lead.id);

    // Progress bar fill % and color based on completeness score (0-5)
    const scorePct = Math.min(100, Math.max(10, (score / 5) * 100));
    const scoreColor = score >= 4 ? '#10b981' : (score >= 2.5 ? '#f59e0b' : '#ef4444');

    // Anti-Scraping Phone & Website Masking & Encoding
    const phoneEnc = encodeContactInfo(lead.phone);
    const websiteEnc = encodeContactInfo(lead.website);
    const rawDigits = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
    const maskedPhoneDisplay = rawDigits.length >= 10 
        ? `+91 ${rawDigits.slice(-10, -5)} XXXXX` 
        : (lead.phone ? `${lead.phone.slice(0, 5)} XXXXX` : '');
    const maskedWebsiteDisplay = maskWebsite(lead.website);

    return `
        <div class="prof-card" data-id="${lead.id}" style="--card-accent: ${avatarColor}; border-left: 4px solid ${avatarColor};">
            <div class="card-toolbar" onclick="event.stopPropagation();">
                <button class="track-card-btn ${isTracked ? 'tracked' : ''}" data-id="${lead.id}" title="${isTracked ? 'Lead is tracked in CRM' : 'Track lead'}">
                    <i data-lucide="${isTracked ? 'bookmark-check' : 'bookmark'}" style="width:13px; height:13px; stroke-width:2.5px;"></i> 
                    <span>${isTracked ? 'Tracked' : 'Track'}</span>
                </button>
                ${isPremium ? `
                    <label class="compare-checkbox-label ${isSelected ? 'active' : ''}" title="Add to comparison tray">
                        <input type="checkbox" class="compare-checkbox" data-id="${lead.id}" ${isSelected ? 'checked' : ''} style="display: none;">
                        <span class="compare-pill-dot"></span>
                        <span>Compare</span>
                    </label>
                ` : `
                    <span class="compare-checkbox-label locked" onclick="window.State.setPricingModal(true);" title="Upgrade plan to compare leads side by side">
                        <span class="compare-pill-dot"></span>
                        <span>Compare</span>
                        <i data-lucide="lock" style="width:11px; height:11px; margin-left: 2px;"></i>
                    </span>
                `}
            </div>

            ${freshnessTag}
            
            <div class="card-head">
                <div class="card-head-top">
                    <span class="category-badge" style="background: ${avatarColor}18; color: ${avatarColor}; border: 1px solid ${avatarColor}35;">${displayCategory}</span>
                </div>
                <h3 style="margin-top: 4px;">${lead.name}</h3>
            </div>

            <div class="card-info-row">
                <span class="star-rating">${starsHTML}</span>
                <span class="review-count">(${reviewCount})</span>
                <span class="card-divider"></span>
                <i data-lucide="map-pin" style="width:12px; height:12px; color: var(--text-muted); flex-shrink:0;"></i>
                <span class="area-label">${lead.area || "Mumbai"}</span>
            </div>

            <div class="completeness-bar-container" title="Data completeness: ${score}/5 (${scorePct}%)">
                <div class="completeness-bar-fill" style="width: ${scorePct}%; background: ${scoreColor};"></div>
            </div>

            <div class="card-actions" onclick="event.stopPropagation();">
                ${isPremium || isFreemiumSampleUnlocked ? `
                    ${lead.phone ? `
                        <div class="card-btn-reveal-wrap">
                            <button class="card-btn-reveal-phone" data-phone-enc="${phoneEnc}" title="Click to reveal phone number">
                                <i data-lucide="phone" style="width:13px; height:13px; opacity: 0.85;"></i>
                                <span class="phone-text-masked">${maskedPhoneDisplay}</span>
                                <span class="reveal-btn-label">Show</span>
                            </button>
                        </div>
                    ` : ''}
                    ${lead.website ? `
                        <div class="card-btn-reveal-wrap">
                            <button class="card-btn-reveal-website" data-website-enc="${websiteEnc}" title="Click to reveal website link">
                                <i data-lucide="globe" style="width:13px; height:13px; opacity: 0.85;"></i>
                                <span class="website-text-masked">${maskedWebsiteDisplay}</span>
                                <span class="reveal-btn-label">Show</span>
                            </button>
                        </div>
                    ` : ''}
                    ${!lead.phone && !lead.website ? `
                        <span class="card-btn-empty">No contact info</span>
                    ` : ''}
                ` : `
                    <!-- Soft Blurred Contact Info for Freemium Hook (Cards 3-12) -->
                    <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
                        <div onclick="window.State.setPricingModal(true);" style="flex: 1; display: flex; align-items: center; justify-content: space-between; background: rgba(255,160,0,0.04); border: 1px dashed rgba(255,160,0,0.3); padding: 6px 12px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease;" title="Upgrade to unlock phone number">
                            <span style="font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); filter: blur(3px); user-select: none;">
                                +91 ${lead.phone ? lead.phone.slice(0, 5) : '98201'} XXXXX
                            </span>
                            <span style="font-size: 11px; font-weight: 600; color: var(--accent-gold); display: flex; align-items: center; gap: 4px;">
                                <i data-lucide="lock" style="width:11px; height:11px;"></i> Unlock
                            </span>
                        </div>
                        ${lead.website ? `
                            <div onclick="window.State.setPricingModal(true);" style="flex: 1; display: flex; align-items: center; justify-content: space-between; background: rgba(37,99,235,0.04); border: 1px dashed rgba(37,99,235,0.3); padding: 6px 10px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease;" title="Upgrade to unlock website link">
                                <span style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-secondary); filter: blur(3px); user-select: none;">
                                    ${maskedWebsiteDisplay || 'web****.com'}
                                </span>
                                <span style="font-size: 11px; font-weight: 600; color: #2563eb; display: flex; align-items: center; gap: 4px;">
                                    <i data-lucide="lock" style="width:11px; height:11px;"></i> Unlock
                                </span>
                            </div>
                        ` : ''}
                    </div>
                `}
            </div>
        </div>
    `;
}

export function bindProfessionalCardEvents(onCardClick) {
    document.querySelectorAll('.prof-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            if (onCardClick) onCardClick(id);
        });
        
        // Handle track lead triggers
        const trackBtn = card.querySelector('.track-card-btn');
        if (trackBtn) {
            trackBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = trackBtn.getAttribute('data-id');
                showTrackLeadModal(id);
            });
        }

        // Handle compare checkbox triggers
        const cb = card.querySelector('.compare-checkbox');
        if (cb) {
            cb.addEventListener('change', () => {
                const id = cb.getAttribute('data-id');
                State.toggleSelect(id);
            });
        }

        // Anti-Scraping phone reveal click handler
        const revealPhoneBtn = card.querySelector('.card-btn-reveal-phone');
        if (revealPhoneBtn) {
            revealPhoneBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const encodedPhone = revealPhoneBtn.getAttribute('data-phone-enc');
                if (encodedPhone) {
                    try {
                        const realPhone = atob(encodedPhone);
                        const wrap = revealPhoneBtn.closest('.card-btn-reveal-wrap');
                        if (wrap) {
                            wrap.innerHTML = `
                                <a href="tel:${realPhone}" class="card-btn-call" style="animation: cardFadeIn 0.2s ease-out; width: 100%; min-width: 0;" title="Call ${realPhone}">
                                    <i data-lucide="phone" style="width:13px; height:13px; flex-shrink:0; opacity: 0.85;"></i>
                                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${realPhone}</span>
                                </a>
                            `;
                            if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
                        }
                    } catch(err) {
                        console.error('Failed to unmask contact:', err);
                    }
                }
            });
        }

        // Anti-Scraping website reveal click handler
        const revealWebBtn = card.querySelector('.card-btn-reveal-website');
        if (revealWebBtn) {
            revealWebBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const encodedWeb = revealWebBtn.getAttribute('data-website-enc');
                if (encodedWeb) {
                    try {
                        let realWeb = atob(encodedWeb);
                        if (!/^https?:\/\//i.test(realWeb)) {
                            realWeb = 'https://' + realWeb;
                        }
                        const wrap = revealWebBtn.closest('.card-btn-reveal-wrap');
                        if (wrap) {
                            const displayDomain = realWeb.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
                            wrap.innerHTML = `
                                <a href="${realWeb}" target="_blank" class="card-btn-site" style="animation: cardFadeIn 0.2s ease-out; width: 100%; min-width: 0;" title="Visit ${realWeb}">
                                    <i data-lucide="globe" style="width:13px; height:13px; flex-shrink:0; opacity: 0.85;"></i>
                                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${displayDomain}</span>
                                </a>
                            `;
                            if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
                        }
                    } catch(err) {
                        console.error('Failed to unmask website:', err);
                    }
                }
            });
        }
    });
}
