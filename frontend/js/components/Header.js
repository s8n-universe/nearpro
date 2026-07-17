import { State } from '../state.js';

export function renderHeader() {
    const isBrowseActive = window.location.hash.startsWith('#/browse') || window.location.hash.startsWith('#/category');
    const isInsightsActive = window.location.hash.startsWith('#/insights');
    const isHomeActive = !isBrowseActive && !isInsightsActive;
    
    const viewToggleHTML = isBrowseActive ? `
        <div class="view-toggle-wrap">
            <button id="gridBtn" class="secondary-btn ${State.view === 'grid' ? 'brand-btn' : ''}" style="padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm);">Grid View</button>
            <button id="mapBtn" class="secondary-btn ${State.view === 'map' ? 'brand-btn' : ''}" style="padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm);">Map View</button>
        </div>
    ` : '';

    return `
        <header class="main-header">
            <div class="container header-wrap">
                <a href="#/" class="header-brand">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#logoGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <defs>
                            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#ffa000" />
                                <stop offset="100%" stop-color="#ec4899" />
                            </linearGradient>
                        </defs>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        <path d="M2 12h20" />
                    </svg>
                    <span>Near<span class="brand-text">Pro</span></span>
                </a>
                
                <nav class="header-nav">
                    <a href="#/" class="nav-link ${isHomeActive ? 'active' : ''}">Home</a>
                    <a href="#/browse" class="nav-link ${isBrowseActive ? 'active' : ''}">Browse Directory</a>
                    <a href="#/insights" class="nav-link ${isInsightsActive ? 'active' : ''}">Insights</a>
                </nav>
                
                <div class="header-actions">
                    ${viewToggleHTML}
                    <a href="#" class="brand-btn" style="padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm);">
                        Connect App
                    </a>
                </div>
            </div>
        </header>
    `;
}

export function bindHeaderEvents() {
    const gridBtn = document.getElementById('gridBtn');
    const mapBtn = document.getElementById('mapBtn');
    
    if (gridBtn) {
        gridBtn.addEventListener('click', () => {
            State.toggleView('grid');
        });
    }
    
    if (mapBtn) {
        mapBtn.addEventListener('click', () => {
            State.toggleView('map');
        });
    }
}
