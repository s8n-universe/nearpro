import { isOpenNow } from '../api.js';
import { State } from '../state.js';

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

    const isSelected = State.selected_ids.includes(lead.id);

    return `
        <div class="prof-card" data-id="${lead.id}">
            ${freshnessTag}
            
            <label class="compare-checkbox-label ${isSelected ? 'active' : ''}" onclick="event.stopPropagation();">
                <input type="checkbox" class="compare-checkbox" data-id="${lead.id}" ${isSelected ? 'checked' : ''} style="display: none;">
                <span class="compare-pill-dot"></span>
                Compare
            </label>
            
            <div class="card-top">
                <div class="avatar-wrap" style="--brand-gradient: linear-gradient(135deg, ${avatarColor}, #ffffff);">${initials}</div>
                <div class="card-title-wrap">
                    <span class="category-badge">${lead.category || parentCat}</span>
                    <h3>${lead.name}</h3>
                    <div class="completeness-dots" title="Data completeness score: ${score}/5">
                        ${dotsHTML}
                    </div>
                </div>
            </div>
            
            <div class="rating-row">
                <span class="star-rating">${starsHTML}</span>
                <span class="review-count">(${reviewCount} reviews)</span>
            </div>
            
            <div class="card-meta-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${lead.area || "Mumbai"}</span>
            </div>
            
            <p class="card-desc">${lead.address || "Address details not verified."}</p>
            
            <div class="card-actions" onclick="event.stopPropagation();">
                ${!(State.profile && (State.profile.tier === 'connect' || State.profile.tier === 'pro')) ? `
                    <button class="secondary-btn" onclick="window.State.setPricingModal(true);" style="padding: 8px 12px; font-size: 13px; text-align: center; justify-content: center;">
                        🔒 Phone Locked
                    </button>
                    <button class="brand-btn" onclick="window.State.setPricingModal(true);" style="padding: 8px 12px; font-size: 13px; text-align: center; justify-content: center;">
                        🔒 Site Locked
                    </button>
                ` : `
                    ${lead.phone ? `
                        <a href="tel:${lead.phone}" class="secondary-btn" style="padding: 8px 12px; font-size: 13px; text-align: center; justify-content: center;">
                            Call Now
                        </a>
                    ` : `
                        <button class="secondary-btn" disabled style="padding: 8px 12px; font-size: 13px; text-align: center; justify-content: center; opacity: 0.5;">
                            No Phone
                        </button>
                    `}
                    
                    ${lead.website ? `
                        <a href="${lead.website}" target="_blank" class="brand-btn" style="padding: 8px 12px; font-size: 13px; text-align: center; justify-content: center;">
                            Website
                        </a>
                    ` : `
                        <button class="brand-btn" disabled style="padding: 8px 12px; font-size: 13px; text-align: center; justify-content: center; opacity: 0.5;">
                            No Site
                        </button>
                    `}
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
