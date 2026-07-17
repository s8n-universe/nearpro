import { State } from '../state.js';

export function renderFilterPanel() {
    const areas = [
        "Bandra", "Andheri", "Borivali", "Malad", "Goregaon", 
        "Kandivali", "Powai", "Vikhroli", "Ghatkopar", "Kurla", 
        "Chembur", "Worli", "Lower Parel", "Prabhadevi", "Dadar", 
        "Matunga", "BKC", "Juhu", "Versova", "Lokhandwala", 
        "Thane", "Navi Mumbai", "Vashi", "Kharghar", "Belapur", 
        "Mulund", "Bhandup", "Colaba", "Churchgate", "Fort"
    ];

    const areaOptions = areas.map(a => `
        <option value="${a}" ${State.filters.area === a ? 'selected' : ''}>${a}</option>
    `).join('');

    return `
        <div class="filter-wrap" style="margin-bottom: 24px; padding: 12px 24px; gap: 20px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 13px; color: var(--text-muted); font-family: var(--font-mono);">AREA:</span>
                <select id="areaFilter" class="filter-select" style="padding: 6px 12px; font-size: 13px;">
                    <option value="">All Areas</option>
                    ${areaOptions}
                </select>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 13px; color: var(--text-muted); font-family: var(--font-mono);">RATING:</span>
                <select id="ratingFilter" class="filter-select" style="padding: 6px 12px; font-size: 13px;">
                    <option value="">Any Rating</option>
                    <option value="4" ${State.filters.min_rating == 4 ? 'selected' : ''}>4+ Stars</option>
                    <option value="3" ${State.filters.min_rating == 3 ? 'selected' : ''}>3+ Stars</option>
                </select>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 13px; color: var(--text-muted); font-family: var(--font-mono);">SORT BY:</span>
                <select id="sortFilter" class="filter-select" style="padding: 6px 12px; font-size: 13px;">
                    <option value="rating_desc" ${State.filters.sort_by === 'rating_desc' ? 'selected' : ''}>Highest Rated</option>
                    <option value="reviews_desc" ${State.filters.sort_by === 'reviews_desc' ? 'selected' : ''}>Most Reviewed</option>
                    <option value="completeness_desc" ${State.filters.sort_by === 'completeness_desc' ? 'selected' : ''}>Most Verified Info</option>
                    <option value="scraped_desc" ${State.filters.sort_by === 'scraped_desc' ? 'selected' : ''}>Recently Added</option>
                </select>
            </div>
            
            <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                <label class="toggle-switch">
                    <input type="checkbox" id="openNowFilter" ${State.filters.open_now ? 'checked' : ''} style="accent-color: var(--accent-gold);">
                    <span>Open Now</span>
                </label>
                
                <label class="toggle-switch">
                    <input type="checkbox" id="hasEmailFilter" ${State.filters.has_email ? 'checked' : ''} style="accent-color: var(--accent-gold);">
                    <span>Has Email</span>
                </label>
                
                <label class="toggle-switch">
                    <input type="checkbox" id="hasWebsiteFilter" ${State.filters.has_website ? 'checked' : ''} style="accent-color: var(--accent-gold);">
                    <span>Has Website</span>
                </label>
            </div>
        </div>
    `;
}

export function bindFilterPanelEvents() {
    const areaFilter = document.getElementById('areaFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const sortFilter = document.getElementById('sortFilter');
    const openNowFilter = document.getElementById('openNowFilter');
    const hasEmailFilter = document.getElementById('hasEmailFilter');
    const hasWebsiteFilter = document.getElementById('hasWebsiteFilter');

    if (areaFilter) {
        areaFilter.addEventListener('change', (e) => {
            State.updateFilters({ area: e.target.value || null });
        });
    }

    if (ratingFilter) {
        ratingFilter.addEventListener('change', (e) => {
            State.updateFilters({ min_rating: e.target.value ? parseInt(e.target.value) : null });
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            State.updateFilters({ sort_by: e.target.value });
        });
    }

    if (openNowFilter) {
        openNowFilter.addEventListener('change', (e) => {
            State.updateFilters({ open_now: e.target.checked });
        });
    }

    if (hasEmailFilter) {
        hasEmailFilter.addEventListener('change', (e) => {
            State.updateFilters({ has_email: e.target.checked });
        });
    }

    if (hasWebsiteFilter) {
        hasWebsiteFilter.addEventListener('change', (e) => {
            State.updateFilters({ has_website: e.target.checked });
        });
    }
}
