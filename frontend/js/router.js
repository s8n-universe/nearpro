// Hash-based router mapping URL hash paths to view renders

export const Router = {
    routes: {},
    
    on(route, handler) {
        this.routes[route] = handler;
    },
    
    init() {
        window.addEventListener('hashchange', () => this.handleRouting());
        // Handle initial load
        this.handleRouting();
    },
    
    handleRouting() {
        const hash = window.location.hash || '#/';
        
        // Match specific dynamic routes first (e.g. #/category/parent/sub or #/category/parent)
        let matched = false;
        
        for (const routePattern of Object.keys(this.routes)) {
            const regex = this.routeToRegExp(routePattern);
            const match = hash.match(regex);
            
            if (match) {
                const params = match.slice(1);
                this.routes[routePattern](...params);
                matched = true;
                break;
            }
        }
        
        if (!matched && this.routes['*']) {
            this.routes['*']();
        }
    },
    
    routeToRegExp(route) {
        // Convert route pattern like '#/category/:parent/:sub' to a RegExp
        const pattern = route
            .replace(/:[^\s/]+/g, '([\\w-]+)') // match params like :parent
            .replace(/\*/g, '.*');             // match wildcard *
        return new RegExp('^' + pattern + '$');
    },
    
    navigate(hash) {
        window.location.hash = hash;
    }
};
