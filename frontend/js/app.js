import { State } from './state.js';
import { Api } from './api.js';
import { Router } from './router.js';

// Import UI Renderers
import { renderHeader, bindHeaderEvents } from './components/Header.js';
import { renderCategorySidebar, bindCategorySidebarEvents } from './components/CategorySidebar.js';
import { renderSearchBar, bindSearchBarEvents } from './components/SearchBar.js';
import { renderFilterPanel, bindFilterPanelEvents } from './components/FilterPanel.js';
import { renderProfessionalCard, bindProfessionalCardEvents } from './components/ProfessionalCard.js';
import { renderProfessionalModal, bindProfessionalModalEvents } from './components/ProfessionalModal.js';
import { renderComparePanel, renderCompareModalContent, bindComparePanelEvents } from './components/CompareModal.js';
import { renderExportButton, bindExportButtonEvents } from './components/ExportButton.js';
import { renderInsightsPage, initInsightsCharts } from './components/InsightsPage.js';
import { renderMapView, initFullMap } from './components/MapView.js';
import { renderMarketingHero } from './components/MarketingHero.js';
import { renderFeatureShowcase } from './components/FeatureShowcase.js';

// Main Application shell reference
const appShell = document.getElementById('app');

// State Subscription - Centralized UI synchronization
State.subscribe(async (currentState) => {
    // If we're on browse/directory routes, trigger list re-render
    const isBrowse = window.location.hash.startsWith('#/browse') || window.location.hash.startsWith('#/category');
    if (isBrowse) {
        await updateDirectoryView();
    } else {
        // Redraw basic layout shells (header/compare) on home or insights page
        const isInsights = window.location.hash.startsWith('#/insights');
        if (isInsights) {
            renderInsightsLayout();
        } else {
            renderMarketingLayout();
        }
    }
});

// Initialize Routing bindings
function initRoutes() {
    Router.on('#/', () => {
        State.resetFilters();
        renderMarketingLayout();
    });

    Router.on('#/browse', () => {
        State.updateFilters({ parentCategory: null, category: null });
    });

    Router.on('#/category/:parent', (parent) => {
        const decodedParent = decodeURIComponent(parent);
        State.updateFilters({ parentCategory: decodedParent, category: null });
    });

    Router.on('#/category/:parent/:sub', (parent, sub) => {
        const decodedParent = decodeURIComponent(parent);
        const decodedSub = decodeURIComponent(sub);
        State.updateFilters({ parentCategory: decodedParent, category: decodedSub });
    });

    Router.on('#/insights', () => {
        renderInsightsLayout();
    });

    Router.on('*', () => {
        Router.navigate('#/');
    });

    Router.init();
}

/* --- Layout Renderers --- */

// Layer 1: Marketing Homepage Shell
function renderMarketingLayout() {
    appShell.innerHTML = `
        <div class="app-container">
            ${renderHeader()}
            <main class="main-layout" style="display: block;">
                ${renderMarketingHero()}
                ${renderFeatureShowcase()}
            </main>
            <footer class="main-footer">
                NearPro — Made with ❤️ by S8N
            </footer>
        </div>
    `;
    bindHeaderEvents();
}

// Layer 2: Deployed Directory layout shell
async function renderDirectoryLayout() {
    appShell.innerHTML = `
        <div class="app-container">
            ${renderHeader()}
            <main class="main-layout">
                <aside class="app-sidebar" id="sidebarElement"></aside>
                <div class="drawer-overlay" id="drawerOverlay"></div>
                <section class="app-content">
                    <div id="searchBarElement"></div>
                    <div id="filterPanelElement"></div>
                    <div id="exportBtnElement"></div>
                    <div class="view-container" id="feedElement"></div>
                    <div id="comparePanelPlaceholder"></div>
                </section>
            </main>
            
            <!-- Global Modal Overlays -->
            <div class="modal-overlay" id="detailModalOverlay"></div>
            <div class="modal-overlay" id="compareModalOverlay"></div>
            
            <footer class="main-footer">
                NearPro — Made with ❤️ by S8N
            </footer>
        </div>
    `;
    
    bindHeaderEvents();
    
    // Draw sidebar tree
    const sidebar = document.getElementById('sidebarElement');
    sidebar.innerHTML = renderCategorySidebar();
    bindCategorySidebarEvents();
    
    // Draw search bars and secondary inputs
    document.getElementById('searchBarElement').innerHTML = renderSearchBar();
    bindSearchBarEvents();
    
    document.getElementById('filterPanelElement').innerHTML = renderFilterPanel();
    bindFilterPanelEvents();

    // Trigger initial content query load
    await queryProfessionals(true);
}

// Layer 2 Insights shell
async function renderInsightsLayout() {
    appShell.innerHTML = `
        <div class="app-container">
            ${renderHeader()}
            <main class="main-layout" style="display: block;" id="insightsWrap"></main>
            <footer class="main-footer">
                NearPro — Made with ❤️ by S8N
            </footer>
        </div>
    `;
    bindHeaderEvents();

    const wrap = document.getElementById('insightsWrap');
    wrap.innerHTML = renderInsightsPage();

    if (!State.stats) {
        try {
            State.stats = await Api.getStats();
            wrap.innerHTML = renderInsightsPage();
        } catch (e) {
            console.error("Failed to load insights statistics: ", e);
            wrap.innerHTML = `<div class="container" style="padding: 40px; text-align: center; color: var(--accent-pink);">Failed to load stats. Please check network.</div>`;
            return;
        }
    }

    // Initialize Chart visualizations
    try {
        const insights = await Api.getAreaInsights();
        initInsightsCharts(insights);
    } catch (e) {
        console.error("Failed to load chart insights details: ", e);
    }
}

/* --- Directory Updates & Querying --- */

async function updateDirectoryView() {
    const feed = document.getElementById('feedElement');
    // If the directory container hasn't been drawn yet, draw it first
    if (!feed) {
        await renderDirectoryLayout();
        return;
    }
    
    // Update sidebar selections
    const sidebar = document.getElementById('sidebarElement');
    sidebar.innerHTML = renderCategorySidebar();
    bindCategorySidebarEvents();

    // Update compare/export buttons
    document.getElementById('comparePanelPlaceholder').innerHTML = renderComparePanel();
    bindComparePanelEvents(showCompareModal);

    document.getElementById('exportBtnElement').innerHTML = renderExportButton();
    bindExportButtonEvents(fetchSelectedLeadsDetails);

    // Update feed grid or maps view
    await queryProfessionals(false);
}

// Fetch selected leads details for client CSV or Webhook export
async function fetchSelectedLeadsDetails() {
    const details = [];
    for (const id of State.selected_ids) {
        const p = State.professionals.find(x => x.id === id);
        if (p) details.push(p);
    }
    return details;
}

// Main query handler contacting Supabase API
async function queryProfessionals(isInitialLoad = false) {
    if (State.loading) return;
    
    State.loading = true;
    const feed = document.getElementById('feedElement');
    
    // Render skeletons if this is the first page of query
    if (State.offset === 0 && feed) {
        feed.innerHTML = `
            <div class="prof-grid">
                ${'<div class="prof-card shimmer" style="height: 250px;"></div>'.repeat(6)}
            </div>
        `;
    }

    try {
        const result = await Api.getProfessionals(State.filters, State.offset, State.limit);
        
        // Append or replace dataset
        if (State.offset === 0) {
            State.professionals = result.items;
        } else {
            // Filter duplicates out to prevent JS render key crashes
            const existingIds = State.professionals.map(x => x.id);
            const newItems = result.items.filter(x => !existingIds.includes(x.id));
            State.professionals = [...State.professionals, ...newItems];
        }
        
        State.total = result.total;
        
        // Render UI
        if (feed) {
            renderFeedContent(result.has_more);
        }
    } catch (e) {
        console.error("API error loading professionals: ", e);
        if (feed) {
            feed.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--accent-pink);">
                    <h4>Error loading directory details</h4>
                    <p>${e.message || "Network connection issue."}</p>
                </div>
            `;
        }
    } finally {
        State.loading = false;
    }
}

// Redraw Grid vs Map view content based on state settings
function renderFeedContent(hasMore) {
    const feed = document.getElementById('feedElement');
    if (!feed) return;

    if (State.professionals.length === 0) {
        feed.innerHTML = `
            <div style="padding: 80px 24px; text-align: center; border: 1px dashed var(--border); border-radius: var(--radius-lg);">
                <div style="font-size: 32px; margin-bottom: 16px;">🔍</div>
                <h3 style="margin-bottom: 8px;">No Professionals Found</h3>
                <p style="color: var(--text-muted); font-size: 14px;">Try resetting filters or expanding your keywords search.</p>
            </div>
        `;
        return;
    }

    if (State.view === 'grid') {
        const cardsHTML = State.professionals.map(p => renderProfessionalCard(p)).join('');
        
        feed.innerHTML = `
            <div class="feed-header">
                <div class="feed-title-wrap">
                    <h2>Directory Search Results</h2>
                    <span class="feed-subtitle">${State.total} verified professional listing${State.total !== 1 ? 's' : ''} found</span>
                </div>
            </div>
            <div class="prof-grid">
                ${cardsHTML}
            </div>
            ${hasMore ? `
                <div class="load-more-wrap">
                    <button id="loadMoreBtn" class="secondary-btn load-more-btn">Load More Results</button>
                </div>
            ` : ''}
        `;
        
        bindProfessionalCardEvents(showDetailModal);
        
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', async () => {
                State.offset += State.limit;
                // Query additional pagination items
                await queryProfessionals(false);
            });
        }
    } else {
        // Map view representation
        feed.innerHTML = `
            <div class="feed-header" style="margin-bottom: 12px;">
                <div class="feed-title-wrap">
                    <h2>Spatial Distribution Map</h2>
                    <span class="feed-subtitle">Displaying verified listings across Mumbai</span>
                </div>
            </div>
            <div style="position: relative; height: 60vh; border-radius: var(--radius-lg); overflow: hidden;">
                ${renderMapView()}
            </div>
        `;
        
        // Initialize Leaflet markers overlays
        State.map_instance = initFullMap(State.professionals, showDetailModal);
    }
}

/* --- Modals Handlers --- */

// Detail modal logic
async function showDetailModal(id) {
    const overlay = document.getElementById('detailModalOverlay');
    overlay.innerHTML = `<div class="spinner" style="margin: auto;"></div>`;
    overlay.className = 'modal-overlay open';

    try {
        const lead = await Api.getProfessional(id);
        overlay.innerHTML = renderProfessionalModal(lead);
        bindProfessionalModalEvents(lead, () => {
            overlay.className = 'modal-overlay';
        });
    } catch (e) {
        console.error("Failed to fetch profile details: ", e);
        overlay.className = 'modal-overlay';
    }
}

// Compare Modal logic
function showCompareModal(professionalsList) {
    const overlay = document.getElementById('compareModalOverlay');
    overlay.innerHTML = renderCompareModalContent(professionalsList);
    overlay.className = 'modal-overlay open';
    
    const closeBtn = document.getElementById('closeCompareModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.className = 'modal-overlay';
        });
    }
}

/* --- Startup --- */

async function initApp() {
    // 1. Initial Router and state setup
    initRoutes();
    
    // 2. Fetch category groups cache for the sidebar tree
    try {
        State.category_groups = await Api.getCategories();
        
        // Populate stats count asynchronously
        Api.getStats().then(s => {
            State.stats = s;
        }).catch(err => console.error("Async stats load failed: ", err));
        
    } catch (e) {
        console.error("Initialization check failed. Database offline: ", e);
    }
}

document.addEventListener('DOMContentLoaded', initApp);
export default initApp;
