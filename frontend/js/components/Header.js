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

    const authActionsHTML = State.user ? `
        <span style="font-size: 13px; color: var(--text-secondary); font-family: var(--font-mono); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block;">${State.user.email}</span>
        <button id="signOutBtn" class="secondary-btn" style="padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm);">Sign Out</button>
    ` : `
        <button id="openLoginBtn" class="brand-btn" style="padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm);">Login</button>
    `;

    return `
        <header class="main-header">
            <div class="container header-wrap">
                <a href="#/" class="header-brand">
                    <img src="/NearPro_logo_nobg.png" alt="NearPro Logo" style="height: 32px; width: auto; object-fit: contain; margin-right: 4px;">
                    <span>Near<span class="brand-text">Pro</span></span>
                </a>
                
                <nav class="header-nav">
                    <a href="#/" class="nav-link ${isHomeActive ? 'active' : ''}">Home</a>
                    <a href="#/browse" class="nav-link ${isBrowseActive ? 'active' : ''}">Browse Directory</a>
                    <a href="#/insights" class="nav-link ${isInsightsActive ? 'active' : ''}">Insights</a>
                </nav>
                
                <div class="header-actions" style="display: flex; align-items: center; gap: 12px;">
                    ${viewToggleHTML}
                    ${authActionsHTML}
                </div>
            </div>
        </header>
    `;
}

export function bindHeaderEvents() {
    const gridBtn = document.getElementById('gridBtn');
    const mapBtn = document.getElementById('mapBtn');
    const openLoginBtn = document.getElementById('openLoginBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    
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

    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', () => {
            State.setAuthModal(true);
        });
    }

    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            try {
                const { Api } = await import('../api.js');
                await Api.signOut();
            } catch (err) {
                console.error("Sign out failed: ", err);
            }
        });
    }
}
