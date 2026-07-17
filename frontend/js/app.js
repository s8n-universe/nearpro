import { State } from './state.js';
import { Api, generateBrowserFingerprint } from './api.js';
import { Router } from './router.js';

// Import UI Renderers
import { renderHeader, bindHeaderEvents } from './components/Header.js';
import { renderCategorySidebar, bindCategorySidebarEvents } from './components/CategorySidebar.js';
import { renderSearchBar, bindSearchBarEvents } from './components/SearchBar.js';
import { renderFilterPanel, bindFilterPanelEvents } from './components/FilterPanel.js';
import { renderProfessionalCard, bindProfessionalCardEvents } from './components/ProfessionalCard.js';
import { renderProfessionalModal, bindProfessionalModalEvents } from './components/ProfessionalModal.js';
import { renderComparePanel, renderCompareModalContent, bindComparePanelEvents } from './components/CompareModal.js';
import { renderInsightsPage, initInsightsCharts } from './components/InsightsPage.js';
import { renderMapView, initFullMap } from './components/MapView.js';
import { renderMarketingHero } from './components/MarketingHero.js';
import { renderFeatureShowcase } from './components/FeatureShowcase.js';
import { renderAuthModal, bindAuthModalEvents } from './components/AuthModal.js';
import { renderPricingModal, bindPricingModalEvents } from './components/PricingModal.js';

// Main Application shell reference
const appShell = document.getElementById('app');

let timerInterval = null;

function startSessionTimer(durationSeconds, startDocked = false) {
    if (timerInterval) clearInterval(timerInterval);
    
    let timerEl = document.getElementById('sessionTimer');
    if (!timerEl) {
        timerEl = document.createElement('div');
        timerEl.id = 'sessionTimer';
        document.body.appendChild(timerEl);
    }
    
    timerEl.className = startDocked ? 'timer-docked' : 'timer-center';
    
    const updateDisplay = (secs) => {
        const m = String(Math.floor(secs / 60)).padStart(2, '0');
        const s = String(secs % 60).padStart(2, '0');
        timerEl.innerHTML = `
            <span>⏳</span>
            <span>Premium Free Trial: ${m}:${s}</span>
        `;
    };
    
    let timeRemaining = durationSeconds;
    updateDisplay(timeRemaining);
    
    if (!startDocked) {
        setTimeout(() => {
            const currentEl = document.getElementById('sessionTimer');
            if (currentEl && currentEl.classList.contains('timer-center')) {
                currentEl.className = 'timer-docked';
            }
        }, 3000);
    }
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            if (timerEl) timerEl.remove();
            
            State.locked = true;
            State.notify();
            State.setPricingModal(true);
        } else {
            updateDisplay(timeRemaining);
            if (timeRemaining <= 30) {
                timerEl.classList.add('timer-urgent');
            }
        }
    }, 1000);
}

// State Subscription - Centralized UI synchronization
State.subscribe(async (currentState) => {
    const isPremium = State.profile && (State.profile.is_premium === true || (State.profile.tier && State.profile.tier !== 'free'));
    if (isPremium) {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        const timerEl = document.getElementById('sessionTimer');
        if (timerEl) timerEl.remove();
    }

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

    // Dynamically render/update Auth Modal
    const authPlaceholder = document.getElementById('authModalPlaceholder');
    if (authPlaceholder) {
        authPlaceholder.innerHTML = renderAuthModal();
        bindAuthModalEvents();
    }

    // Dynamically render/update Pricing Modal
    const pricingPlaceholder = document.getElementById('pricingModalPlaceholder');
    if (pricingPlaceholder) {
        pricingPlaceholder.innerHTML = renderPricingModal();
        bindPricingModalEvents();
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
            <div id="authModalPlaceholder"></div>
            <div id="pricingModalPlaceholder"></div>
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
                    <div class="view-container" id="feedElement"></div>
                    <div id="comparePanelPlaceholder"></div>
                </section>
            </main>
            
            <!-- Global Modal Overlays -->
            <div class="modal-overlay" id="detailModalOverlay"></div>
            <div class="modal-overlay" id="compareModalOverlay"></div>
            <div id="authModalPlaceholder"></div>
            <div id="pricingModalPlaceholder"></div>
            
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

    if (!State.fingerprint) {
        State.fingerprint = generateBrowserFingerprint();
    }

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
            
            document.getElementById('startDemoBtn').addEventListener('click', async () => {
                const nicheInput = document.getElementById('demoNicheInput');
                const nicheText = nicheInput.value.trim() || 'Dentist';
                
                try {
                    await Api.startTrial(State.fingerprint);
                } catch (err) {
                    console.warn("Trial registration failed, using local timer:", err);
                }
                
                startSessionTimer(120, false);
                runGuidedDemo(nicheText);
            });
        }
    } else {
        const isPremium = State.profile && (State.profile.is_premium === true || (State.profile.tier && State.profile.tier !== 'free'));
        if (!isPremium && !State.locked) {
            try {
                const trial = await Api.checkTrial(State.fingerprint);
                if (trial) {
                    const elapsed = Math.floor((Date.now() - new Date(trial.started_at).getTime()) / 1000);
                    if (elapsed >= 120) {
                        State.locked = true;
                        State.notify();
                    } else {
                        const remaining = 120 - elapsed;
                        startSessionTimer(remaining, true);
                    }
                }
            } catch (err) {
                console.error("Failed to check database trial status:", err);
            }
        }
    }
}

// Layer 2 Insights shell
async function renderInsightsLayout() {
    appShell.innerHTML = `
        <div class="app-container">
            ${renderHeader()}
            <main class="main-layout" style="display: block;" id="insightsWrap"></main>
            <div id="authModalPlaceholder"></div>
            <div id="pricingModalPlaceholder"></div>
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

    // Update compare panel
    document.getElementById('comparePanelPlaceholder').innerHTML = renderComparePanel();
    bindComparePanelEvents(showCompareModal);

    // Update feed grid or maps view
    await queryProfessionals(false);
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
        if (!State.fingerprint) {
            State.fingerprint = generateBrowserFingerprint();
        }
        const result = await Api.getProfessionals(State.filters, State.offset, State.limit, State.fingerprint);
        
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

    const isPremium = State.profile && (State.profile.is_premium === true || (State.profile.tier && State.profile.tier !== 'free'));

    // Handle full session timer lockout (Mitigation of V2)
    if (State.locked === true && !isPremium) {
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
                    <button class="brand-btn" style="width: 100%;" onclick="State.setPricingModal(true);">Unlock Full Access</button>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        return;
    } else {
        const existingOverlay = document.getElementById('sessionLockoutOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
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
        // Only show first 9 cards (3 rows in 3 column layout) if not premium
        const isListExceeded = !isPremium && State.professionals.length > 9;
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
                    <button class="brand-btn" style="padding: 10px 24px; font-size: 14px;" onclick="State.setPricingModal(true);">Unlock Full Access</button>
                </div>
            </div>
        ` : '';

        feed.innerHTML = `
            <div class="feed-header" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 24px;">
                <div class="feed-title-wrap">
                    <h2>Directory Search Results</h2>
                    <span class="feed-subtitle">${State.total} verified professional listing${State.total !== 1 ? 's' : ''} found</span>
                </div>
                <button id="restartDemoBtn" class="secondary-btn" style="padding: 6px 12px; font-size: 12px; border-radius: var(--radius-sm);">
                    Restart Tour
                </button>
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

        const restartBtn = document.getElementById('restartDemoBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                localStorage.removeItem('nearpro_demo_completed');
                State.locked = false;
                State.session_started = null;
                if (timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                }
                const timerEl = document.getElementById('sessionTimer');
                if (timerEl) timerEl.remove();
                renderDirectoryLayout();
            });
        }
        
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

        // Center on target lead coordinates during demo walkthrough
        if (State.demo_active && State.demo_lead_lat && State.demo_lead_lng && State.map_instance) {
            State.map_instance.setView([State.demo_lead_lat, State.demo_lead_lng], 16);
        }
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

const DemoAudio = {
    ctx: null,
    
    playFile(path) {
        const a = new Audio(path);
        a.volume = 0.4;
        a.play().catch(e => {
            console.warn("Real audio file not loaded yet, playing synthesizer clicks", path);
            this.synthesizeClick();
        });
    },
    
    playTyping() {
        this.playFile('/audio/typing.mp3');
    },
    
    playClick() {
        this.playFile('/audio/click.mp3');
    },
    
    playWhoosh() {
        this.playFile('/audio/whoosh.mp3');
    },
    
    synthesizeClick() {
        try {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = this.ctx;
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200 + Math.random() * 600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);
            
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.04);
        } catch (e) {
            console.error("Audio synthesis failed", e);
        }
    }
};

function createVirtualCursor() {
    let cursor = document.getElementById('demoCursor');
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'demoCursor';
        cursor.style.position = 'fixed';
        cursor.style.width = '24px';
        cursor.style.height = '24px';
        cursor.style.zIndex = '99999';
        cursor.style.pointerEvents = 'none';
        cursor.style.transition = 'all 1s cubic-bezier(0.25, 1, 0.5, 1)';
        cursor.style.transform = 'translate(-5px, -5px)';
        
        cursor.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 4L12 20L15 15L20 12L4 4Z" fill="#ffa000" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
            </svg>
        `;
        
        // Start center
        cursor.style.left = '50%';
        cursor.style.top = '50%';
        
        document.body.appendChild(cursor);
    }
    return cursor;
}

async function moveCursorTo(selectorOrElement, offset = { x: 0, y: 0 }) {
    const cursor = createVirtualCursor();
    let target = null;
    if (typeof selectorOrElement === 'string') {
        target = document.querySelector(selectorOrElement);
    } else {
        target = selectorOrElement;
    }
    
    if (target) {
        const rect = target.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + offset.x;
        const targetY = rect.top + rect.height / 2 + offset.y;
        
        cursor.style.left = `${targetX}px`;
        cursor.style.top = `${targetY}px`;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

function showThoughtCloud(text, x, y, duration = 3000) {
    const cloud = document.createElement('div');
    cloud.className = 'thought_cloud';
    cloud.style.position = 'fixed';
    cloud.style.left = `${x}px`;
    cloud.style.top = `${y}px`;
    cloud.style.zIndex = '99998';
    cloud.style.background = 'var(--bg-surface)';
    cloud.style.border = '1px solid var(--border)';
    cloud.style.padding = '12px 16px';
    cloud.style.borderRadius = 'var(--radius-lg)';
    cloud.style.maxWidth = '240px';
    cloud.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)';
    cloud.style.fontSize = '13px';
    cloud.style.color = 'white';
    cloud.style.pointerEvents = 'none';
    
    cloud.innerHTML = `
        <div style="font-family: var(--font-heading); margin-bottom: 4px; color: var(--accent-gold); font-size: 11px; text-transform: uppercase;">NearPro Cloud</div>
        <div style="line-height: 1.4;">${text}</div>
    `;
    
    document.body.appendChild(cloud);
    
    setTimeout(() => {
        cloud.style.transition = 'all 0.3s ease-out';
        cloud.style.opacity = '0';
        cloud.style.transform = 'scale(0.8)';
        setTimeout(() => cloud.remove(), 300);
    }, duration);
}

async function runGuidedDemo(niche) {
    State.demo_active = true;
    State.demo_niche = niche;

    // Close welcome popup
    const popup = document.getElementById('welcomeDemoModal');
    if (popup) popup.remove();

    // Init virtual pointer cursor position
    createVirtualCursor();
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 1: Auto Type in Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        await moveCursorTo('#searchInput');
        DemoAudio.playClick();
        
        State.resetFilters();
        searchInput.value = '';
        searchInput.focus();
        
        // Type letter by letter playing sound
        for (let i = 0; i < niche.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            searchInput.value += niche[i];
            searchInput.dispatchEvent(new Event('input'));
            DemoAudio.playTyping();
        }
        
        // Show Thought bubble
        const rect = searchInput.getBoundingClientRect();
        showThoughtCloud("🌟 Type any niche. NearPro filters leads instantly.", rect.left, rect.bottom + 15, 3000);
    }

    // Wait for search data load
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Step 1.5: Compare Leads Autopilot demonstration
    const cards = document.querySelectorAll('.prof-card');
    if (cards && cards.length >= 2) {
        const check1 = cards[0].querySelector('.compare-checkbox');
        if (check1) {
            await moveCursorTo(check1);
            DemoAudio.playClick();
            check1.click();
        }
        await new Promise(resolve => setTimeout(resolve, 800));

        const check2 = cards[1].querySelector('.compare-checkbox');
        if (check2) {
            await moveCursorTo(check2);
            DemoAudio.playClick();
            check2.click();
        }
        await new Promise(resolve => setTimeout(resolve, 1000));

        const compareTriggerBtn = document.getElementById('compareTriggerBtn');
        if (compareTriggerBtn) {
            await moveCursorTo('#compareTriggerBtn');
            DemoAudio.playClick();
            DemoAudio.playWhoosh();
            compareTriggerBtn.click();

            await new Promise(resolve => setTimeout(resolve, 1500));
            const compareCard = document.querySelector('#compareModalOverlay .modal-card');
            if (compareCard) {
                const rect = compareCard.getBoundingClientRect();
                showThoughtCloud("🌟 Compare multiple professionals side by side on category, area, ratings, and completeness.", rect.left + 50, rect.top + 80, 3500);
            }
            await new Promise(resolve => setTimeout(resolve, 3500));

            const closeCompareBtn = document.getElementById('closeCompareModalBtn');
            if (closeCompareBtn) {
                await moveCursorTo('#closeCompareModalBtn');
                DemoAudio.playClick();
                DemoAudio.playWhoosh();
                closeCompareBtn.click();
            }
        }
        
        State.clearSelection();
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Step 2: Open First Card Details
    const firstCard = document.querySelector('.prof-card');
    if (firstCard) {
        // Extract coordinate targets for map centering step
        const firstCardId = firstCard.getAttribute('data-id');
        const lead = State.professionals.find(x => x.id === firstCardId);
        if (lead) {
            State.demo_lead_lat = lead.latitude;
            State.demo_lead_lng = lead.longitude;
        }

        await moveCursorTo(firstCard);
        
        firstCard.style.borderColor = 'var(--accent-gold)';
        firstCard.style.boxShadow = '0 0 20px rgba(255, 160, 0, 0.4)';
        
        DemoAudio.playClick();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        DemoAudio.playWhoosh();
        firstCard.click();
    }

    // Wait for details modal open transition
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Highlight card verification thought bubble
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        const rect = modalContent.getBoundingClientRect();
        showThoughtCloud("🌟 Realtime verified rating. 5 completeness dots mapping quality parameters.", rect.left + 20, rect.top + 100, 3500);
        await new Promise(resolve => setTimeout(resolve, 1500));
        showThoughtCloud("📞 Direct phone, website, maps, and offline sharing connections.", rect.left + 200, rect.bottom - 100, 3500);
    }

    // Wait in detail modal
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Close Modal and Toggle Map View
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        await moveCursorTo('#closeModalBtn');
        DemoAudio.playClick();
        DemoAudio.playWhoosh();
        closeModalBtn.click();
    }
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Switch view to Map View
    const mapBtn = document.getElementById('mapBtn');
    if (mapBtn) {
        await moveCursorTo('#mapBtn');
        DemoAudio.playClick();
        DemoAudio.playWhoosh();
        mapBtn.click();
        
        // Show thought overlay on map
        setTimeout(() => {
            const feedRect = document.getElementById('feedElement').getBoundingClientRect();
            showThoughtCloud("📍 Coordinates verified and clustered inside Mumbai region.", feedRect.left + 50, feedRect.top + 100, 3500);
        }, 1500);
    }

    // Wait on Map View
    await new Promise(resolve => setTimeout(resolve, 4500));

    // Step 4: Switch to Insights/Analytics
    const insightsLink = document.querySelector('a[href="#/insights"]');
    if (insightsLink) {
        await moveCursorTo(insightsLink);
    }
    DemoAudio.playClick();
    DemoAudio.playWhoosh();
    window.location.hash = '#/insights';

    // Wait for insights load
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Show locked insights thought cloud
    const insightsHeader = document.querySelector('h2');
    if (insightsHeader) {
        const rect = insightsHeader.getBoundingClientRect();
        showThoughtCloud("📊 Competitor quality analysis and local gap indexes locked for premium users.", rect.left, rect.bottom + 50, 4000);
    }
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Remove cursor from screen
    const cursor = document.getElementById('demoCursor');
    if (cursor) cursor.remove();

    // Step 5: Lockout Blocker
    State.locked = true;
    State.demo_active = false;
    localStorage.setItem('nearpro_demo_completed', 'true');
    State.notify();
}

/* --- Startup --- */

async function initApp() {
    window.State = State; // Expose globally for inline Paywall triggers
    
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

    // 3. Initialize Supabase Auth session state listener
    try {
        const { supabase } = await import('./supabase.js');
        
        // Initial session fetch
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session) {
                State.user = session.user;
                State.profile = await Api.getProfile(session.user.id);
                State.notify();
            }
        });

        // Listen for session state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                State.user = session.user;
                State.profile = await Api.getProfile(session.user.id);
            } else {
                State.user = null;
                State.profile = null;
            }
            State.notify();
        });
    } catch (err) {
        console.error("Auth listener initialization failed: ", err);
    }
}

document.addEventListener('DOMContentLoaded', initApp);
export default initApp;
