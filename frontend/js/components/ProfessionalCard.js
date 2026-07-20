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

export function renderProfessionalCard(lead) {
    const parentCat = lead.parent_category || "Other";
    const avatarColor = categoryColors[parentCat] || "#52525b";

    // Sanitize category — detect if scraped data accidentally contains an address
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
            starsHTML += '★';
        } else if (i - 0.5 <= rating) {
            starsHTML += '½';
        } else {
            starsHTML += '☆';
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

    return `
        <div class="prof-card" data-id="${lead.id}" style="border-left: 3px solid ${avatarColor};">
            <div class="card-toolbar" onclick="event.stopPropagation();">
                <button class="track-card-btn ${isTracked ? 'tracked' : ''}" data-id="${lead.id}">
                    <i data-lucide="${isTracked ? 'bookmark-check' : 'bookmark'}" style="width:12px; height:12px;"></i> ${isTracked ? 'Tracked' : 'Track'}
                </button>
                ${currentUserHasAccess('scout') ? `
                    <label class="compare-checkbox-label ${isSelected ? 'active' : ''}">
                        <input type="checkbox" class="compare-checkbox" data-id="${lead.id}" ${isSelected ? 'checked' : ''} style="display: none;">
                        <span class="compare-pill-dot"></span>
                        Compare
                    </label>
                ` : `
                    <span class="compare-checkbox-label" style="opacity: 0.4; cursor: not-allowed;">
                        <span class="compare-pill-dot"></span>
                        <i data-lucide="lock" style="width:11px; height:11px;"></i>
                    </span>
                `}
            </div>

            ${freshnessTag}
            
            <div class="card-head">
                <div class="card-head-top">
                    <span class="category-badge">${displayCategory}</span>
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

            <div class="completeness-dots" title="Data completeness: ${score}/5">
                ${dotsHTML}
            </div>

            <div class="card-actions" onclick="event.stopPropagation();">
                ${!currentUserHasAccess('scout') ? `
                    <button class="card-btn-unlock" onclick="window.State.setPricingModal(true);">
                        <i data-lucide="lock" style="width:13px; height:13px;"></i> Unlock Details
                    </button>
                ` : `
                    ${lead.phone ? `
                        <a href="tel:${lead.phone}" class="card-btn-call">
                            <i data-lucide="phone" style="width:13px; height:13px;"></i> Call
                        </a>
                    ` : ''}
                    ${lead.website ? `
                        <a href="${lead.website}" target="_blank" class="card-btn-site">
                            <i data-lucide="globe" style="width:13px; height:13px;"></i> Website
                        </a>
                    ` : ''}
                    ${!lead.phone && !lead.website ? `
                        <span class="card-btn-empty">No contact info</span>
                    ` : ''}
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
