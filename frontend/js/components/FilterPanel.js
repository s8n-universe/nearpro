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

    const allVisibleSelected = State.professionals.length > 0 && State.professionals.every(p => State.selected_ids.includes(p.id));

    return `
        <div class="filter-wrap" style="margin-bottom: 24px; padding: 12px 24px; gap: 20px; flex-wrap: wrap;">
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
                <span style="font-size: 13px; color: var(--text-muted); font-family: var(--font-mono);">WEBSITE:</span>
                <select id="websiteFilter" class="filter-select" style="padding: 6px 12px; font-size: 13px;">
                    <option value="all" ${State.filters.website_filter === 'all' ? 'selected' : ''}>All</option>
                    <option value="has_website" ${State.filters.website_filter === 'has_website' ? 'selected' : ''}>Has Website</option>
                    <option value="no_website" ${State.filters.website_filter === 'no_website' ? 'selected' : ''}>No Website (Gap)</option>
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
                    <input type="checkbox" id="openNowFilter" ${State.filters.open_now ? 'checked' : ''}>
                    <div class="toggle-switch-track">
                        <div class="toggle-switch-thumb"></div>
                    </div>
                    <span>Open Now</span>
                </label>
                
                <label class="toggle-switch">
                    <input type="checkbox" id="hasEmailFilter" ${State.filters.has_email ? 'checked' : ''}>
                    <div class="toggle-switch-track">
                        <div class="toggle-switch-thumb"></div>
                    </div>
                    <span>Has Email</span>
                </label>
                
                <label class="toggle-switch">
                    <input type="checkbox" id="hasPhoneFilter" ${State.filters.has_phone ? 'checked' : ''}>
                    <div class="toggle-switch-track">
                        <div class="toggle-switch-thumb"></div>
                    </div>
                    <span>Has Phone</span>
                </label>

                <label class="toggle-switch">
                    <input type="checkbox" id="hasWebsiteFilterToggle" ${State.filters.has_website ? 'checked' : ''}>
                    <div class="toggle-switch-track">
                        <div class="toggle-switch-thumb"></div>
                    </div>
                    <span>Has Website</span>
                </label>

                <label class="toggle-switch">
                    <input type="checkbox" id="selectAllFilterToggle" ${allVisibleSelected ? 'checked' : ''}>
                    <div class="toggle-switch-track">
                        <div class="toggle-switch-thumb"></div>
                    </div>
                    <span style="color: var(--accent-gold); font-weight: 600;">Select All</span>
                </label>
            </div>

            <button id="surveySettingsBtn" class="secondary-btn" style="padding: 6px 12px; font-size: 12.5px; display: flex; align-items: center; gap: 6px; border-radius: var(--radius-sm); border: 1px solid ${State.user_survey ? 'rgba(255, 160, 0, 0.4)' : 'rgba(255,255,255,0.1)'}; background: ${State.user_survey ? 'rgba(255, 160, 0, 0.05)' : 'rgba(255,255,255,0.02)'}; color: ${State.user_survey ? 'var(--accent-gold)' : 'var(--text-secondary)'}; cursor: pointer; margin-left: auto;">
                🎯 ${State.user_survey ? 'Profile: Active' : 'Sales Profile'}
            </button>
        </div>
    `;
}

export function bindFilterPanelEvents() {
    const areaFilter = document.getElementById('areaFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const websiteFilter = document.getElementById('websiteFilter');
    const sortFilter = document.getElementById('sortFilter');
    const openNowFilter = document.getElementById('openNowFilter');
    const hasEmailFilter = document.getElementById('hasEmailFilter');
    const hasPhoneFilter = document.getElementById('hasPhoneFilter');
    const surveySettingsBtn = document.getElementById('surveySettingsBtn');

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

    if (websiteFilter) {
        websiteFilter.addEventListener('change', (e) => {
            State.updateFilters({ website_filter: e.target.value });
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

    if (hasPhoneFilter) {
        hasPhoneFilter.addEventListener('change', (e) => {
            State.updateFilters({ has_phone: e.target.checked });
        });
    }

    const hasWebsiteFilterToggle = document.getElementById('hasWebsiteFilterToggle');
    if (hasWebsiteFilterToggle) {
        hasWebsiteFilterToggle.addEventListener('change', (e) => {
            State.updateFilters({ has_website: e.target.checked });
        });
    }

    const selectAllFilterToggle = document.getElementById('selectAllFilterToggle');
    if (selectAllFilterToggle) {
        selectAllFilterToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                State.selectAll();
            } else {
                State.deselectAll();
            }
        });
    }

    if (surveySettingsBtn) {
        surveySettingsBtn.addEventListener('click', () => {
            State.setSurveyModal(true);
        });
    }
}
