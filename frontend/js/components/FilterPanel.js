import { State } from '../state.js';
import { renderSearchBar, bindSearchBarEvents } from './SearchBar.js';

export function renderFilterPanel() {
    const areas = [
        "Bandra", "Andheri", "BKC", "Powai", "Juhu", "Worli", 
        "Dadar", "Lower Parel", "Prabhadevi", "Versova", "Lokhandwala",
        "Goregaon", "Malad", "Kandivali", "Borivali", "Ghatkopar", 
        "Chembur", "Kurla", "Vikhroli", "Mulund", "Bhandup", 
        "Matunga", "Colaba", "Churchgate", "Fort", "Thane", 
        "Navi Mumbai", "Vashi", "Kharghar", "Belapur"
    ];

    const areaOptions = areas.map(a => `
        <option value="${a}" ${State.filters.area === a ? 'selected' : ''}>${a}</option>
    `).join('');

    // Compute active filter tags to display
    const activeTags = [];
    if (State.filters.area) activeTags.push({ id: 'area', label: `Area: ${State.filters.area}` });
    if (State.filters.min_rating) activeTags.push({ id: 'min_rating', label: `Rating: ${State.filters.min_rating}+ ★` });
    if (State.filters.has_email) activeTags.push({ id: 'has_email', label: `Has Email` });
    if (State.filters.has_phone) activeTags.push({ id: 'has_phone', label: `Has Phone` });
    if (State.filters.has_website || State.filters.website_filter === 'has_website') activeTags.push({ id: 'has_website', label: `Has Website` });
    if (State.filters.no_website || State.filters.website_filter === 'no_website') activeTags.push({ id: 'no_website', label: `No Website (Gap Lead)` });
    if (State.filters.open_now) activeTags.push({ id: 'open_now', label: `Open Now` });
    if (State.filters.search && State.filters.search.trim()) activeTags.push({ id: 'search', label: `Search: "${State.filters.search}"` });
    if (State.filters.category) activeTags.push({ id: 'category', label: `Category: ${State.filters.category}` });
    if (State.filters.parentCategory) activeTags.push({ id: 'parentCategory', label: `Sector: ${State.filters.parentCategory}` });

    const activeTagsHTML = activeTags.map(tag => `
        <span class="active-filter-pill" data-filter-id="${tag.id}">
            ${tag.label} <span class="remove-filter-btn" data-filter-id="${tag.id}">&times;</span>
        </span>
    `).join('');

    return `
        <div class="filter-panel-card">
            <!-- Top Controls Toolbar: Filters Left + Top-Right Search -->
            <div class="filter-toolbar-row">
                <div class="filter-controls-left">
                    <div class="filter-control-group">
                        <span class="filter-label">AREA</span>
                        <select id="areaFilter" class="filter-select">
                            <option value="">All Areas</option>
                            ${areaOptions}
                        </select>
                    </div>
                    
                    <div class="filter-control-group">
                        <span class="filter-label">RATING</span>
                        <select id="ratingFilter" class="filter-select">
                            <option value="">Any Rating</option>
                            <option value="4.5" ${State.filters.min_rating == 4.5 ? 'selected' : ''}>4.5+ Stars</option>
                            <option value="4" ${State.filters.min_rating == 4 ? 'selected' : ''}>4.0+ Stars</option>
                            <option value="3" ${State.filters.min_rating == 3 ? 'selected' : ''}>3.0+ Stars</option>
                        </select>
                    </div>
                    
                    <div class="filter-control-group">
                        <span class="filter-label">SORT BY</span>
                        <select id="sortFilter" class="filter-select">
                            <option value="rating_desc" ${State.filters.sort_by === 'rating_desc' ? 'selected' : ''}>Highest Rated</option>
                            <option value="reviews_desc" ${State.filters.sort_by === 'reviews_desc' ? 'selected' : ''}>Most Reviewed</option>
                            <option value="completeness_desc" ${State.filters.sort_by === 'completeness_desc' ? 'selected' : ''}>Most Verified Info</option>
                            <option value="indexed_desc" ${State.filters.sort_by === 'indexed_desc' ? 'selected' : ''}>Recently Added</option>
                        </select>
                    </div>
                </div>

                <div class="filter-controls-right">
                    ${renderSearchBar()}
                    <button id="resetSearchBtn" class="secondary-btn reset-filters-btn" title="Reset all filters">
                        Reset ✕
                    </button>
                </div>
            </div>

            <!-- Quick Filter Chips & Profile Active Row -->
            <div class="filter-chips-row" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                <div class="filter-chips-group" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <button class="filter-chip ${State.filters.has_phone ? 'active' : ''}" id="chipHasPhone">
                        <span class="chip-icon">📱</span> Has Phone
                    </button>

                    <button class="filter-chip ${State.filters.has_email ? 'active' : ''}" id="chipHasEmail">
                        <span class="chip-icon">📧</span> Has Email
                    </button>

                    <button class="filter-chip ${(State.filters.has_website || State.filters.website_filter === 'has_website') ? 'active' : ''}" id="chipHasWebsite">
                        <span class="chip-icon">🌐</span> Has Website
                    </button>

                    <button class="filter-chip ${(State.filters.no_website || State.filters.website_filter === 'no_website') ? 'active' : ''}" id="chipNoWebsite">
                        <span class="chip-icon">⚡</span> No Website (Gap Lead)
                    </button>

                    <button class="filter-chip ${State.filters.open_now ? 'active' : ''}" id="chipOpenNow">
                        <span class="chip-icon">⏰</span> Open Now
                    </button>
                </div>

                <button id="surveySettingsBtn" class="secondary-btn profile-active-btn" style="margin-left: auto;">
                    🎯 ${State.user_survey ? 'Profile: Active' : 'Sales Profile'}
                </button>
            </div>

            <!-- Active Filters Summary Bar (Only shown when filters applied) -->
            ${activeTags.length > 0 ? `
                <div class="active-filters-bar">
                    <div class="active-tags-list">
                        <span class="active-tags-title">Active Filters (${activeTags.length}):</span>
                        ${activeTagsHTML}
                    </div>
                    <button class="clear-all-filters-btn" id="clearAllFiltersBtn">
                        Clear All Filters ✕
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

export function bindFilterPanelEvents() {
    bindSearchBarEvents();

    const areaFilter = document.getElementById('areaFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const sortFilter = document.getElementById('sortFilter');
    const surveySettingsBtn = document.getElementById('surveySettingsBtn');
    
    // Chips
    const chipHasPhone = document.getElementById('chipHasPhone');
    const chipHasEmail = document.getElementById('chipHasEmail');
    const chipHasWebsite = document.getElementById('chipHasWebsite');
    const chipNoWebsite = document.getElementById('chipNoWebsite');
    const chipOpenNow = document.getElementById('chipOpenNow');
    const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');

    if (areaFilter) {
        areaFilter.addEventListener('change', (e) => {
            State.updateFilters({ area: e.target.value || null });
        });
    }

    if (ratingFilter) {
        ratingFilter.addEventListener('change', (e) => {
            State.updateFilters({ min_rating: e.target.value ? parseFloat(e.target.value) : null });
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            State.updateFilters({ sort_by: e.target.value });
        });
    }

    if (chipHasPhone) {
        chipHasPhone.addEventListener('click', () => {
            State.updateFilters({ has_phone: !State.filters.has_phone });
        });
    }

    if (chipHasEmail) {
        chipHasEmail.addEventListener('click', () => {
            State.updateFilters({ has_email: !State.filters.has_email });
        });
    }

    if (chipHasWebsite) {
        chipHasWebsite.addEventListener('click', () => {
            const isCurrentlyActive = State.filters.has_website || State.filters.website_filter === 'has_website';
            State.updateFilters({
                has_website: !isCurrentlyActive,
                no_website: false,
                website_filter: !isCurrentlyActive ? 'has_website' : 'all'
            });
        });
    }

    if (chipNoWebsite) {
        chipNoWebsite.addEventListener('click', () => {
            const isCurrentlyActive = State.filters.no_website || State.filters.website_filter === 'no_website';
            State.updateFilters({
                no_website: !isCurrentlyActive,
                has_website: false,
                website_filter: !isCurrentlyActive ? 'no_website' : 'all'
            });
        });
    }

    if (chipOpenNow) {
        chipOpenNow.addEventListener('click', () => {
            State.updateFilters({ open_now: !State.filters.open_now });
        });
    }

    if (clearAllFiltersBtn) {
        clearAllFiltersBtn.addEventListener('click', () => {
            State.resetFilters();
        });
    }

    // Individual filter tag removal buttons
    const removeBtns = document.querySelectorAll('.remove-filter-btn');
    removeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const filterId = btn.getAttribute('data-filter-id');
            if (filterId === 'area') State.updateFilters({ area: null });
            else if (filterId === 'min_rating') State.updateFilters({ min_rating: null });
            else if (filterId === 'has_email') State.updateFilters({ has_email: false });
            else if (filterId === 'has_phone') State.updateFilters({ has_phone: false });
            else if (filterId === 'has_website') State.updateFilters({ has_website: false, website_filter: 'all' });
            else if (filterId === 'no_website') State.updateFilters({ no_website: false, website_filter: 'all' });
            else if (filterId === 'open_now') State.updateFilters({ open_now: false });
            else if (filterId === 'search') State.updateFilters({ search: '', ai_query: null });
            else if (filterId === 'category') State.updateFilters({ category: null });
            else if (filterId === 'parentCategory') State.updateFilters({ parentCategory: null });
        });
    });

    if (surveySettingsBtn) {
        surveySettingsBtn.addEventListener('click', () => {
            State.setSurveyModal(true);
        });
    }
}

