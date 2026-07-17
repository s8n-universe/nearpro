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
    
    // Filters state
    filters: {
        category: null,      // Raw category name
        parentCategory: null, // "Healthcare", "Beauty", etc.
        area: null,          // "Bandra", "Andheri", etc.
        min_rating: null,
        has_email: false,
        has_phone: false,
        has_website: false,
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
    }
};
