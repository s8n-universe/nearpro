import { State } from '../state.js';

// Local NLP parser for AI Search queries (Feature 3 Client-side implementation)
export function parseNaturalLanguageQuery(queryText) {
    const text = queryText.toLowerCase();
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

    // 3. Detect presence of website, phone, email
    if (text.includes("website") || text.includes("site") || text.includes("web")) {
        filters.has_website = true;
    }
    if (text.includes("phone") || text.includes("call") || text.includes("number")) {
        filters.has_phone = true;
    }
    if (text.includes("email") || text.includes("mail")) {
        filters.has_email = true;
    }

    // 4. Detect known Mumbai areas
    const knownAreas = [
        "bandra", "andheri", "borivali", "malad", "goregaon", "kandivali", 
        "powai", "vikhroli", "ghatkopar", "kurla", "chembur", "worli", 
        "parel", "prabhadevi", "dadar", "matunga", "juhu", "versova", 
        "lokhandwala", "thane", "vashi", "mulund", "bhandup", "colaba", 
        "churchgate", "fort"
    ];
    for (const area of knownAreas) {
        if (text.includes(area)) {
            // Capitalize first letter
            filters.area = area.charAt(0).toUpperCase() + area.slice(1);
            break;
        }
    }

    // 5. Detect parent categories
    const categoriesMapping = {
        "healthcare": ["doctor", "physician", "clinic", "hospital", "dentist", "dental", "pharmacy", "medical", "eye care", "diagnostic"],
        "beauty": ["salon", "spa", "beauty", "hair", "makeup", "massage", "wellness"],
        "real estate": ["real estate", "property", "builder", "developer", "architect", "interior", "design"],
        "education": ["school", "college", "university", "institute", "academy", "tutor", "coaching", "class"],
        "food": ["restaurant", "cafe", "bakery", "dining", "food", "bar", "pub"],
        "finance": ["chartered accountant", "lawyer", "advocate", "legal", "firm", "financial", "bank", "tax", "audit"]
    };

    let matchedCategory = null;
    let categorySearchTerm = "";

    for (const [parent, keywords] of Object.entries(categoriesMapping)) {
        for (const word of keywords) {
            if (text.includes(word)) {
                matchedCategory = parent;
                categorySearchTerm = word;
                break;
            }
        }
        if (matchedCategory) break;
    }

    if (matchedCategory) {
        // Map back to exact parent names
        const nameMap = {
            "healthcare": "Healthcare",
            "beauty": "Beauty & Wellness",
            "real estate": "Real Estate",
            "education": "Education",
            "food": "Food & Dining",
            "finance": "Finance & Legal"
        };
        filters.parentCategory = nameMap[matchedCategory];
        // Set search filter to the keyword detected (e.g. "dentist")
        filters.search = categorySearchTerm;
    } else {
        // Fallback: use remaining text as general search string
        // Remove detected area and other filters from raw search
        let cleanSearch = text
            .replace(/in\s+[a-zA-Z]+/g, "")
            .replace(/near\s+[a-zA-Z]+/g, "")
            .replace(/\d\+?\s*stars?/g, "")
            .replace(/open now/g, "")
            .replace(/with website/g, "")
            .replace(/with email/g, "")
            .trim();
        if (cleanSearch.length > 2) {
            filters.search = cleanSearch;
        }
    }

    return filters;
}

export function renderSearchBar() {
    const isAiMode = State.filters.ai_query !== null;
    const placeholder = isAiMode 
        ? 'Try: "dentists in Bandra open now with 4+ stars"'
        : 'Search by name, category, or keyword...';

    return `
        <div class="filter-wrap">
            <div class="search-input-wrap" style="flex: 2;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" id="searchInput" placeholder="${placeholder}" value="${isAiMode ? State.filters.ai_query : State.filters.search}">
            </div>
            
            <button id="aiToggleBtn" class="secondary-btn ${isAiMode ? 'brand-btn' : ''}" style="display: flex; align-items: center; gap: 6px; padding: 10px 16px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg>
                <span>AI Search</span>
            </button>
            
            <button id="resetSearchBtn" class="secondary-btn" style="padding: 10px 16px; color: var(--text-muted);">
                Reset Filters
            </button>
        </div>
    `;
}

export function bindSearchBarEvents() {
    const input = document.getElementById('searchInput');
    const aiToggleBtn = document.getElementById('aiToggleBtn');
    const resetBtn = document.getElementById('resetSearchBtn');
    
    if (!input) return;

    // Debounce typing inputs
    let timer;
    input.addEventListener('input', (e) => {
        const val = e.target.value;
        clearTimeout(timer);
        
        timer = setTimeout(() => {
            if (State.filters.ai_query !== null) {
                // In AI mode, parse query string
                const parsed = parseNaturalLanguageQuery(val);
                State.updateFilters({
                    ai_query: val,
                    ...parsed
                });
            } else {
                State.updateFilters({ search: val });
            }
        }, 300);
    });

    if (aiToggleBtn) {
        aiToggleBtn.addEventListener('click', () => {
            const currentAi = State.filters.ai_query;
            if (currentAi === null) {
                // Enter AI mode
                State.updateFilters({ ai_query: "", search: "" });
            } else {
                // Exit AI mode, reset to normal search
                State.updateFilters({ ai_query: null, search: "" });
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            State.resetFilters();
        });
    }
}
