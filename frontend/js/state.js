// Global application state matching the architectural specifications (pub/sub)

export const State = {
    // Current loaded datasets
    professionals: [],
    total: 0,
    offset: 0,
    limit: 24,
    loading: false,
    locked: false, // SaaS lockout gating flag
    demo_active: false,
    demo_niche: "",
    user: null,
    profile: null,
    user_survey: JSON.parse(localStorage.getItem('nearpro_user_survey') || 'null'),
    survey_modal_open: false,
    auth_modal_open: false,
    selected_tier: null,
    
    // Filters state
    filters: {
        category: null,      // Raw category name
        parentCategory: null, // "Healthcare", "Beauty", etc.
        area: null,          // "Bandra", "Andheri", etc.
        min_rating: null,
        has_email: false,
        has_phone: false,
        website_filter: "all", // "all" | "has_website" | "no_website"
        open_now: false,
        search: "",          // Raw search text
        sort_by: "rating_desc",
        ai_query: null
    },
    
    // View state
    view: "grid",            // "grid" | "map"
    selected_ids: [],        // selected for comparison or export
    map_instance: null,
    
    // Category mapping cache
    category_groups: [],
    stats: null,
    
    // Pub/Sub listeners
    listeners: [],
    
    subscribe(fn) {
        this.listeners.push(fn);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== fn);
        };
    },
    
    notify() {
        this.listeners.forEach(fn => fn(this));
    },
    
    updateFilters(patch) {
        this.filters = { ...this.filters, ...patch };
        this.offset = 0; // Reset pagination index on filter change
        this.notify();
    },
    
    resetFilters() {
        this.filters = {
            category: null,
            parentCategory: null,
            area: null,
            min_rating: null,
            has_email: false,
            has_phone: false,
            website_filter: "all",
            open_now: false,
            search: "",
            sort_by: "rating_desc",
            ai_query: null
        };
        this.offset = 0;
        this.notify();
    },
    
    toggleView(viewName) {
        if (viewName === "grid" || viewName === "map") {
            this.view = viewName;
            this.notify();
        }
    },
    
    toggleSelect(id) {
        if (this.selected_ids.includes(id)) {
            this.selected_ids = this.selected_ids.filter(x => x !== id);
        } else {
            this.selected_ids.push(id);
        }
        this.notify();
    },
    
    clearSelection() {
        this.selected_ids = [];
        this.notify();
    },

    setAuth(user, profile) {
        this.user = user;
        this.profile = profile;
        this.notify();
    },

    setAuthModal(isOpen) {
        this.auth_modal_open = isOpen;
        this.notify();
    },

    pricing_modal_open: false,
    
    setPricingModal(isOpen) {
        this.pricing_modal_open = isOpen;
        this.notify();
    },

    setSurvey(surveyData) {
        this.user_survey = surveyData;
        if (surveyData) {
            localStorage.setItem('nearpro_user_survey', JSON.stringify(surveyData));
            
            const patch = {};
            if (surveyData.target_industry) {
                patch.parentCategory = surveyData.target_industry;
            }
            if (surveyData.base_suburb) {
                patch.area = surveyData.base_suburb;
            }
            if (surveyData.role === 'web_developer') {
                patch.website_filter = 'no_website';
            } else {
                patch.website_filter = 'all';
            }
            this.updateFilters(patch);
        } else {
            localStorage.removeItem('nearpro_user_survey');
            this.resetFilters();
        }
    },

    setSurveyModal(isOpen) {
        this.survey_modal_open = isOpen;
        this.notify();
    }
};
