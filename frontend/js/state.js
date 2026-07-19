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
    personalization_modal_open: false,
    auth_modal_open: false,
    selected_tier: null,
    billing_cycle: 'monthly',
    category_sidebar_collapsed: localStorage.getItem('nearpro_cat_sidebar_collapsed') !== 'false',
    dashboard_sidebar_collapsed: localStorage.getItem('nearpro_dashboard_sidebar_collapsed') === 'true',
    
    // Filters state
    filters: {
        category: null,      // Raw category name
        parentCategory: null, // "Healthcare", "Beauty", etc.
        area: null,          // "Bandra", "Andheri", etc.
        min_rating: null,
        has_email: false,
        has_phone: false,
        has_website: false,
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
            has_website: false,
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
            this.notify();
        } else {
            const tier = (this.profile?.subscription_tier || this.profile?.tier || 'free').toLowerCase();
            const maxCompare = (tier === 'scout') ? 2 : (tier === 'free' ? 0 : 4);
            if (this.selected_ids.length >= maxCompare) {
                alert(`You can compare a maximum of ${maxCompare} professionals on the ${tier.toUpperCase()} plan. Please upgrade to compare more.`);
                this.setPricingModal(true);
                // Uncheck the checkbox if it was checked in the DOM
                const cb = document.querySelector(`.compare-checkbox[data-id="${id}"]`);
                if (cb) cb.checked = false;
                return;
            }
            this.selected_ids.push(id);
            this.notify();
        }
    },

    selectAll() {
        const tier = (this.profile?.subscription_tier || this.profile?.tier || 'free').toLowerCase();
        const maxCompare = (tier === 'scout') ? 2 : (tier === 'free' ? 0 : 4);
        const ids = this.professionals.map(p => p.id).filter(id => !this.selected_ids.includes(id));
        const canAdd = maxCompare - this.selected_ids.length;
        if (canAdd <= 0) {
            alert(`Compare limit reached for the ${tier.toUpperCase()} plan.`);
            this.setPricingModal(true);
            return;
        }
        this.selected_ids = [...this.selected_ids, ...ids.slice(0, canAdd)];
        this.notify();
    },

    deselectAll() {
        this.selected_ids = [];
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
    },

    setPersonalizationModal(isOpen) {
        this.personalization_modal_open = isOpen;
        this.notify();
    },

    async selectPlan(planId, interval = 'monthly') {
        if (planId === 'free') {
            localStorage.setItem('selected_nearpro_tier', 'free');
            this.locked = false;
            this.session_started = null;
            this.setPricingModal(false);
            this.setAuthModal(true);
            return;
        }

        if (!this.user) {
            localStorage.setItem('selected_nearpro_tier', planId);
            localStorage.setItem('selected_nearpro_interval', interval);
            this.locked = false;
            this.session_started = null;
            this.setPricingModal(false);
            this.setAuthModal(true);
            return;
        }

        this.setPricingModal(false);
        try {
            const { hasAccess, getUserTier } = await import('./auth.js');
            const currentTier = getUserTier();
            if (hasAccess(currentTier, planId)) {
                alert(`You already have the ${currentTier.toUpperCase()} plan which includes ${planId.toUpperCase()} features.`);
                return;
            }
            const { Api } = await import('./api.js');
            await Api.checkoutSubscription(planId, interval);
        } catch (err) {
            console.error("Subscription checkout failed: ", err);
            alert("Subscription creation failed. Please try again.");
        }
    }
};
