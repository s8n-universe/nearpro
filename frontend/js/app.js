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

    const isDemoDone = localStorage.getItem('nearpro_demo_completed') === 'true';
    if (!isDemoDone && !State.demo_active && !State.locked) {
        if (!document.getElementById('welcomeDemoModal')) {
            const popup = document.createElement('div');
            popup.id = 'welcomeDemoModal';
            popup.className = 'lockout_screen_overlay';
            popup.innerHTML = `
                <div class="lockout_modal" style="max-width: 440px;">
                    <div style="font-size: 40px; margin-bottom: 20px;">🚀</div>
                    <h2 style="font-size: 22px; margin-bottom: 12px; font-family: var(--font-heading);">Explore NearPro</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 14px; line-height: 1.5;">
                        Search and map premium verified business leads in Mumbai. Enter the niche you are targeting to start a guided feature walkthrough.
                    </p>
                    <div class="search-input-wrap" style="margin-bottom: 20px; background: var(--bg-base); border-color: var(--border);">
                        <input type="text" id="demoNicheInput" placeholder="e.g. Dentist, CA, Salon" style="padding: 10px; width: 100%; background: transparent; border: none; color: white; outline: none; font-size: 14px;">
                    </div>
                    <button id="startDemoBtn" class="brand-btn" style="width: 100%;">Start Walkthrough</button>
                </div>
            `;
            document.body.appendChild(popup);
            
            document.getElementById('startDemoBtn').addEventListener('click', () => {
                const nicheInput = document.getElementById('demoNicheInput');
                const nicheText = nicheInput.value.trim() || 'Dentist';
                runGuidedDemo(nicheText);
            });
        }
    } else {
        // Start 2 minute free trial session timer (strictly no hyphens)
        if (!State.session_started && !State.locked) {
            State.session_started = Date.now();
            setTimeout(() => {
                State.locked = true;
                State.notify();
            }, 120000);
        }
    }
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

    // Handle full session timer lockout (Mitigation of V2)
    if (State.locked === true) {
        if (!document.getElementById('sessionLockoutOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'sessionLockoutOverlay';
            overlay.className = 'lockout_screen_overlay';
            overlay.innerHTML = `
                <div class="lockout_modal">
                    <div class="lock_icon">🔒</div>
                    <h2 style="font-size: 24px; margin-bottom: 16px; font-family: var(--font-heading);">Free Session Expired</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 15px; line-height: 1.6;">
                        You have browsed NearPro for 2 minutes. Upgrade to the premium plan to unlock unlimited search access, coordinate mapping, and full database exports.
                    </p>
                    <button class="brand-btn" style="width: 100%;" onclick="window.location.reload();">Unlock Full Access</button>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        return;
    }

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
        // Only show first 9 cards (3 rows in 3 column layout)
        const isListExceeded = State.professionals.length > 9;
        const displayedLeads = isListExceeded ? State.professionals.slice(0, 9) : State.professionals;
        const cardsHTML = displayedLeads.map(p => renderProfessionalCard(p)).join('');
        
        const remainingCount = State.total - 9;
        const paywallHTML = isListExceeded ? `
            <div class="row_lockup_banner">
                <div class="lockup_content">
                    <div class="lock_icon">🔒</div>
                    <h3 style="font-size: 20px; margin-bottom: 12px; font-family: var(--font-heading);">Unlock remaining ${remainingCount} leads</h3>
                    <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.6;">
                        Access verified phone numbers, email addresses, websites, business hours, and coordinate mapping for all professionals in this niche.
                    </p>
                    <button class="brand-btn" style="padding: 10px 24px; font-size: 14px;" onclick="window.location.reload();">Unlock Full Access</button>
                </div>
            </div>
        ` : '';

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
            ${isListExceeded ? paywallHTML : (hasMore ? `
                <div class="load-more-wrap">
                    <button id="loadMoreBtn" class="secondary-btn load-more-btn">Load More Results</button>
                </div>
            ` : '')}
        `;
        
        bindProfessionalCardEvents(showDetailModal);
        
        if (!isListExceeded && hasMore) {
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', async () => {
                    State.offset += State.limit;
                    await queryProfessionals(false);
                });
            }
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

/* --- Guided Demo Walkthrough --- */

async function runGuidedDemo(niche) {
    State.demo_active = true;
    State.demo_niche = niche;

    // Close welcome popup
    const popup = document.getElementById('welcomeDemoModal');
    if (popup) popup.remove();

    // Step 1: Auto Type in Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        State.resetFilters();
        searchInput.value = '';
        
        // Type letter by letter
        for (let i = 0; i < niche.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 80));
            searchInput.value += niche[i];
            searchInput.dispatchEvent(new Event('input'));
        }
    }

    // Wait for data load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Open First Card Details
    const firstCard = document.querySelector('.prof-card');
    if (firstCard) {
        firstCard.style.borderColor = 'var(--accent-gold)';
        firstCard.style.boxShadow = '0 0 20px rgba(255, 160, 0, 0.4)';
        await new Promise(resolve => setTimeout(resolve, 1000));
        firstCard.click();
    }

    // Wait in detail modal
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Step 3: Close Modal and Toggle Map View
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.click();
    }
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Switch view to Map View
    const mapBtn = document.getElementById('mapBtn');
    if (mapBtn) {
        mapBtn.click();
    }

    // Wait on Map View
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Step 4: Switch to Insights/Analytics
    window.location.hash = '#/insights';

    // Wait for insights load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 5: Lockout Blocker
    State.locked = true;
    State.demo_active = false;
    localStorage.setItem('nearpro_demo_completed', 'true');
    State.notify();
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
