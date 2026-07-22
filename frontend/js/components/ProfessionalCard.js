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
    let dotsHTML = '';
    for (let i = 0; i < 5; i++) {
        dotsHTML += `<span class="complete-dot ${i < score ? 'filled' : ''}"></span>`;
    }

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

    // Open status badge (client-side dynamic computing)
    const openStatus = isOpenNow(lead.hours);
    let statusBadge = '';
    if (openStatus === true) {
        statusBadge = '<span class="status-tag open">Open Now</span>';
    } else if (openStatus === false) {
        statusBadge = '<span class="status-tag closed">Closed</span>';
    }

    // Recently Verified badge (<= 7 days)
    const isRecent = lead.recently_verified;
    const freshnessTag = isRecent ? '<span class="freshness-tag">Recently Verified</span>' : '';

    const isTracked = State.saved_lead_ids && State.saved_lead_ids.includes(lead.id);

    const hasScoreAccess = currentUserHasAccess('hunter');
    let scoreBadgeHTML = '';
    if (hasScoreAccess && lead.conversion_score !== undefined && lead.conversion_score !== null) {
        const scoreVal = lead.conversion_score;
        let badgeLabel = 'Moderate';
        let badgeColor = '#6b7280';
        let iconName = 'bar-chart-2';
        if (scoreVal >= 80) {
            badgeLabel = 'High';
            badgeColor = '#22c55e';
            iconName = 'trending-up';
        } else if (scoreVal >= 60) {
            badgeLabel = 'Good';
            badgeColor = '#eab308';
            iconName = 'zap';
        }
        scoreBadgeHTML = `<span class="score-badge" style="background: rgba(255,255,255,0.03); border: 1px solid ${badgeColor}; color: ${badgeColor}; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 100px; margin-left: 6px; font-family: var(--font-mono); text-transform: uppercase;"><i data-lucide="${iconName}" style="width:10px; height:10px;"></i> ${badgeLabel} (${scoreVal})</span>`;
    }

    const isPremium = currentUserHasAccess('scout');
    // Step 1: Freemium Hook — Free users get first 12 phone numbers unlocked as a free trial sample!
    const isFreemiumSampleUnlocked = !isPremium && index < 12;

    const isSelected = State.selected_ids.includes(lead.id);

    // Progress bar fill % and color based on completeness score (0-5)
    const scorePct = Math.min(100, Math.max(10, (score / 5) * 100));
    const scoreColor = score >= 4 ? '#10b981' : (score >= 2.5 ? '#f59e0b' : '#ef4444');

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
                    ${scoreBadgeHTML}
                </div>
                <h3>${lead.name}</h3>
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
                        <a href="tel:${lead.phone}" class="card-btn-call">
                            <i data-lucide="phone" style="width:13px; height:13px; opacity: 0.85;"></i> ${lead.phone}
                        </a>
                    ` : ''}
                    ${lead.website ? `
                        <a href="${lead.website}" target="_blank" class="card-btn-site">
                            <i data-lucide="globe" style="width:13px; height:13px; opacity: 0.85;"></i> Website
                        </a>
                    ` : ''}
                    ${!lead.phone && !lead.website ? `
                        <span class="card-btn-empty">No contact info</span>
                    ` : ''}
                ` : `
                    <!-- Soft Blurred Phone Number for Freemium Hook (Cards 3-12) -->
                    <div style="display: flex; gap: 8px; width: 100%; align-items: center;">
                        <div onclick="window.State.setPricingModal(true);" style="flex: 1; display: flex; align-items: center; justify-content: space-between; background: rgba(255,160,0,0.04); border: 1px dashed rgba(255,160,0,0.3); padding: 6px 12px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease;">
                            <span style="font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); filter: blur(3px); user-select: none;">
                                +91 ${lead.phone ? lead.phone.slice(0, 5) : '98201'} XXXXX
                            </span>
                            <span style="font-size: 11px; font-weight: 600; color: var(--accent-gold); display: flex; align-items: center; gap: 4px;">
                                <i data-lucide="lock" style="width:11px; height:11px;"></i> Unlock
                            </span>
                        </div>
                        ${lead.website ? `
                            <a href="${lead.website}" target="_blank" class="card-btn-site" style="padding: 6px 10px;">
                                <i data-lucide="globe" style="width:13px; height:13px;"></i>
                            </a>
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
    });
}
