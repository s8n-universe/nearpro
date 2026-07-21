import { State } from '../state.js';

// Local NLP parser for intelligent natural query inputs
export function parseNaturalLanguageQuery(queryText) {
    const text = queryText.toLowerCase().trim();
    if (text.length < 3) return {};
    const filters = {};

    // 1. Detect open now keywords
    if (text.includes("open now") || text.includes("open today") || text.includes("active now")) {
        filters.open_now = true;
    }

    // 2. Detect rating thresholds (e.g. 4+ stars, 4 stars, 3+ stars)
    const ratingMatch = text.match(/(\d)\s*(?:\+|-)?\s*(?:star|rating)/i) || text.match(/(\d)\+/);
    if (ratingMatch) {
        const rVal = parseInt(ratingMatch[1]);
        if (rVal >= 1 && rVal <= 5) {
            filters.min_rating = rVal;
        }
    }

    // 3. Detect known Mumbai areas
    const knownAreas = [
        "bandra", "andheri", "borivali", "malad", "goregaon", "kandivali", 
        "powai", "vikhroli", "ghatkopar", "kurla", "chembur", "worli", 
        "parel", "prabhadevi", "dadar", "matunga", "juhu", "versova", 
        "lokhandwala", "thane", "vashi", "mulund", "bhandup", "colaba", 
        "churchgate", "fort"
    ];
    for (const area of knownAreas) {
        // Require word boundary so typing "r" or "be" doesn't trigger area match
        const regex = new RegExp(`\\b${area}\\b`, 'i');
        if (regex.test(text)) {
            filters.area = area.charAt(0).toUpperCase() + area.slice(1);
            break;
        }
    }

    return filters;
}

export function renderSearchBar() {
    return `
        <div class="filter-wrap">
            <div class="search-input-wrap" style="flex: 1;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" id="searchInput" autocomplete="off" spellcheck="false" placeholder="Search by name, category, area, or keywords (e.g. dentists in Bandra)..." value="${State.filters.search || ''}">
            </div>
            
            <button id="resetSearchBtn" class="secondary-btn" style="padding: 6px 12px; font-size: 12px; color: var(--text-muted); font-weight: 600;">
                Reset Filters ✕
            </button>
        </div>
    `;
}

export function bindSearchBarEvents() {
    const input = document.getElementById('searchInput');
    const resetBtn = document.getElementById('resetSearchBtn');
    
    if (!input) return;

    let timer;
    
    const applySearch = (val) => {
        const trimmed = val.trim();
        const parsed = parseNaturalLanguageQuery(trimmed);
        if (Object.keys(parsed).length > 0) {
            State.updateFilters({
                search: val,
                ...parsed
            });
        } else {
            State.updateFilters({ search: val });
        }
    };

    // Debounce typing inputs (400ms delay for natural typing without mid-word interruptions)
    input.addEventListener('input', (e) => {
        const val = e.target.value;
        clearTimeout(timer);
        
        timer = setTimeout(() => {
            if (State.filters.search !== val) {
                applySearch(val);
            }
        }, 400);
    });

    // Instant search on Enter key press
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(timer);
            const val = input.value;
            applySearch(val);
        }
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            clearTimeout(timer);
            if (input) input.value = '';
            State.resetFilters();
        });
    }
}
