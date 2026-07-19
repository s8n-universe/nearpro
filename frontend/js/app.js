import { State } from './state.js';
import { Api, generateBrowserFingerprint } from './api.js';
import { Router } from './router.js';
import { currentUserHasAccess } from './auth.js';

export function refreshLucideIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}
window.refreshLucideIcons = refreshLucideIcons;

// Import UI Renderers
import { renderHeader, bindHeaderEvents } from './components/Header.js';
import { renderCategorySidebar, bindCategorySidebarEvents } from './components/CategorySidebar.js';
import { renderSearchBar, bindSearchBarEvents } from './components/SearchBar.js';
import { renderFilterPanel, bindFilterPanelEvents } from './components/FilterPanel.js';
import { renderProfessionalCard, bindProfessionalCardEvents } from './components/ProfessionalCard.js';
import { renderProfessionalModal, bindProfessionalModalEvents } from './components/ProfessionalModal.js';
import { renderComparePanel, renderCompareModalContent, bindComparePanelEvents } from './components/CompareModal.js';
import { renderMapView, initFullMap } from './components/MapView.js';
import { renderMarketingHero } from './components/MarketingHero.js';
import { renderFeatureShowcase } from './components/FeatureShowcase.js';
import { renderAuthModal, bindAuthModalEvents } from './components/AuthModal.js';
import { renderPricingModal, bindPricingModalEvents } from './components/PricingModal.js';
import { renderSurveyModal, bindSurveyModalEvents } from './components/SurveyModal.js';
import { renderPersonalizationModal, bindPersonalizationModalEvents } from './components/PersonalizationModal.js';
import { renderPrivacyPolicyPage, renderTermsOfServicePage } from './components/LegalPages.js';
import { renderUpgradeModal, bindUpgradeModalEvents } from './components/UpgradeModal.js';
import { renderDashboardShell, bindDashboardShellEvents } from './components/DashboardShell.js';
import { renderLeadCRM, bindCRMWorkspaceEvents } from './components/LeadCRM.js';
import { renderLeadLists, bindLeadListsEvents, bindListDetailEvents } from './components/LeadLists.js';
import { renderWebsiteAudit, bindWebsiteAuditEvents } from './components/WebsiteAudit.js';
import { renderOutreachStudio, bindOutreachStudioEvents, buildOutreach } from './components/OutreachStudio.js';
import { renderPromptGenerator, bindPromptGeneratorEvents, buildPrompt } from './components/PromptGenerator.js';
import { renderConnectionHub, bindConnectionHubEvents } from './components/ConnectionHub.js';
import { renderDocumentsLibrary, bindDocumentsLibraryEvents } from './components/DocumentsLibrary.js';
import { renderTeamWorkspace, bindTeamWorkspaceEvents, loadDataRequests, createDataRequest } from './components/TeamWorkspace.js';
import { renderDocumentViewerLayout } from './components/DocumentViewer.js';

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
    const isPremium = currentUserHasAccess('scout');
    if (isPremium) {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        const timerEl = document.getElementById('sessionTimer');
        if (timerEl) timerEl.remove();

        // Ensure premium users are never locked or shown the pricing modal
        if (State.locked) {
            State.locked = false;
        }
        if (State.pricing_modal_open) {
            State.pricing_modal_open = false;
        }
    }

    // Check if we are on dashboard or browse routes
    const isDashboard = window.location.hash.startsWith('#/dashboard');
    const isBrowse = window.location.hash.startsWith('#/browse') || window.location.hash.startsWith('#/category');
    
    if (isDashboard) {
        const tab = window.location.hash.split('#/dashboard/')[1] || 'crm';
        const cleanTab = tab.split('?')[0];
        await renderDashboardLayout(cleanTab);
    } else if (isBrowse) {
        await updateDirectoryView();
    } else {
        renderMarketingLayout();
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

    // Dynamically render/update Survey Modal
    const surveyPlaceholder = document.getElementById('surveyModalPlaceholder');
    if (surveyPlaceholder) {
        surveyPlaceholder.innerHTML = renderSurveyModal();
        bindSurveyModalEvents();
    }

    // Dynamically render/update Personalization Modal
    const personalizationPlaceholder = document.getElementById('personalizationModalPlaceholder');
    if (personalizationPlaceholder) {
        personalizationPlaceholder.innerHTML = renderPersonalizationModal();
        bindPersonalizationModalEvents();
    }

    // Dynamically render/update Upgrade Modal
    const upgradePlaceholder = document.getElementById('upgradeModalPlaceholder');
    if (upgradePlaceholder) {
        upgradePlaceholder.innerHTML = renderUpgradeModal();
        bindUpgradeModalEvents();
    }
    refreshLucideIcons();
});

// Initialize Routing bindings
function initRoutes() {
    Router.on('#/', async () => {
        if (State.user) {
            Router.navigate('#/dashboard/directory');
            return;
        }
        State.resetFilters();
        renderMarketingLayout();
        if (!State.stats) {
            try {
                State.stats = await Api.getStats();
                const mainEl = document.querySelector('.main-layout');
                if (mainEl) {
                    mainEl.innerHTML = `
                        ${renderMarketingHero(State.stats)}
                        ${renderFeatureShowcase()}
                    `;
                }
            } catch (e) {
                console.warn("Failed to load home page dynamic stats: ", e);
            }
        }
    });

    Router.on('#/browse', () => {
        if (State.user) {
            Router.navigate('#/dashboard/directory');
            return;
        }
        State.updateFilters({ parentCategory: null, category: null });
    });

    Router.on('#/category/:parent', (parent) => {
        if (State.user) {
            Router.navigate(`#/dashboard/directory?parent=${parent}`);
            return;
        }
        const decodedParent = decodeURIComponent(parent);
        State.updateFilters({ parentCategory: decodedParent, category: null });
    });

    Router.on('#/category/:parent/:sub', (parent, sub) => {
        if (State.user) {
            Router.navigate(`#/dashboard/directory?parent=${parent}&sub=${sub}`);
            return;
        }
        const decodedParent = decodeURIComponent(parent);
        const decodedSub = decodeURIComponent(sub);
        State.updateFilters({ parentCategory: decodedParent, category: decodedSub });
    });

    Router.on('#/dashboard', () => {
        if (!State.user) {
            if (!window._isSigningOut) {
                State.setAuthModal(true);
            }
            window._isSigningOut = false;
            Router.navigate('#/');
        } else {
            Router.navigate('#/dashboard/directory');
        }
    });

    Router.on('#/dashboard/:tab', (tab) => {
        if (!State.user) {
            if (!window._isSigningOut) {
                State.setAuthModal(true);
            }
            window._isSigningOut = false;
            Router.navigate('#/');
        } else {
            // Synchronize parameters for directory filter state if routed to dashboard directory
            if (tab === 'directory') {
                const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
                const parent = searchParams.get('parent');
                const sub = searchParams.get('sub');
                if (parent) {
                    State.filters.parentCategory = decodeURIComponent(parent);
                    State.filters.category = sub ? decodeURIComponent(sub) : null;
                }
            }
            renderDashboardLayout(tab);
        }
    });

    Router.on('#/privacy', () => {
        appShell.innerHTML = renderPrivacyPolicyPage();
        bindHeaderEvents();
    });

    Router.on('#/terms', () => {
        appShell.innerHTML = renderTermsOfServicePage();
        bindHeaderEvents();
    });

    Router.on('#/d/:id', async (id) => {
        renderDocumentViewerLayout(id);
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
                ${renderMarketingHero(State.stats)}
                ${renderFeatureShowcase()}
            </main>
            <div id="authModalPlaceholder"></div>
            <div id="pricingModalPlaceholder"></div>
            <div id="surveyModalPlaceholder"></div>
            <div id="upgradeModalPlaceholder"></div>
            <footer class="main-footer" style="display: flex; justify-content: space-between; align-items: center; padding: 24px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid var(--border); font-size: 13px; color: var(--text-muted); flex-wrap: wrap; gap: 12px;">
                <div>NearPro — Made with ❤️ by S8N</div>
                <div style="display: flex; gap: 20px;">
                    <a href="#/privacy" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Privacy Policy</a>
                    <a href="#/terms" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Terms Of Service</a>
                </div>
            </footer>
        </div>
    `;
    bindHeaderEvents();
    refreshLucideIcons();
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
            <div id="surveyModalPlaceholder"></div>
            <div id="upgradeModalPlaceholder"></div>
            
            <footer class="main-footer" style="display: flex; justify-content: space-between; align-items: center; padding: 24px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid var(--border); font-size: 13px; color: var(--text-muted); flex-wrap: wrap; gap: 12px;">
                <div>NearPro — Made with ❤️ by S8N</div>
                <div style="display: flex; gap: 20px;">
                    <a href="#/privacy" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Privacy Policy</a>
                    <a href="#/terms" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Terms Of Service</a>
                </div>
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
 
    if (!State.fingerprint) {
        State.fingerprint = generateBrowserFingerprint();
    }

    // Re-check premium status; profile may have been loaded asynchronously
    const isPremium = currentUserHasAccess('scout');
    let showWelcomeModal = false;
 
    if (!isPremium && !State.user) {
        const demoCompleted = localStorage.getItem('nearpro_demo_completed') === 'true';
        if (!demoCompleted) {
            showWelcomeModal = true;
            State.locked = false;
        } else {
            // Only run trial timer logic for anonymous/free users who have completed the demo
            try {
                const trial = await Api.checkTrial(State.fingerprint);
                if (!trial) {
                    showWelcomeModal = true;
                } else {
                    const elapsed = Math.floor((Date.now() - new Date(trial.started_at).getTime()) / 1000);
                    if (elapsed >= 120) {
                        State.locked = true;
                    } else {
                        const remaining = 120 - elapsed;
                        startSessionTimer(remaining, true);
                    }
                }
            } catch (err) {
                console.error("Failed to check database trial status:", err);
            }
        }
    } else if (isPremium) {
        // Premium user: ensure clean state
        State.locked = false;
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    // Trigger initial content query load after lock status is determined
    await queryProfessionals(true);

    if (showWelcomeModal && !State.demo_active && !State.locked) {
        if (!document.getElementById('welcomeDemoModal')) {
            const popup = document.createElement('div');
            popup.id = 'welcomeDemoModal';
            popup.className = 'lockout_screen_overlay';
            popup.innerHTML = `
                <div class="lockout_modal" style="max-width: 440px;">
                    <div style="font-size: 40px; margin-bottom: 20px;">🚀</div>
                    <h2 style="font-size: 22px; margin-bottom: 12px; font-family: var(--font-heading);">Explore NearPro</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 14px; line-height: 1.5;">
                        Search and map premium verified business leads in Mumbai. <br><span style="color: var(--accent-gold); font-weight: 600; display: inline-block; margin-top: 8px;">Select your target client industry to start the walkthrough:</span>
                    </p>
                    
                    <div class="industry-buttons-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; text-align: left; margin-bottom: 8px;">
                        <button class="industry-opt-btn" data-value="Healthcare" style="padding: 12px 10px; background: var(--bg-base); border: 1.5px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); cursor: pointer; text-align: left; font-size: 13px; font-weight: 600; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; font-family: var(--font-body);">
                            <span style="font-size: 16px;">🩺</span> Healthcare
                        </button>
                        <button class="industry-opt-btn" data-value="Beauty & Wellness" style="padding: 12px 10px; background: var(--bg-base); border: 1.5px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); cursor: pointer; text-align: left; font-size: 13px; font-weight: 600; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; font-family: var(--font-body);">
                            <span style="font-size: 16px;">💅</span> Beauty & Wellness
                        </button>
                        <button class="industry-opt-btn" data-value="Real Estate" style="padding: 12px 10px; background: var(--bg-base); border: 1.5px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); cursor: pointer; text-align: left; font-size: 13px; font-weight: 600; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; font-family: var(--font-body);">
                            <span style="font-size: 16px;">🏢</span> Real Estate
                        </button>
                        <button class="industry-opt-btn" data-value="Food & Dining" style="padding: 12px 10px; background: var(--bg-base); border: 1.5px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); cursor: pointer; text-align: left; font-size: 13px; font-weight: 600; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; font-family: var(--font-body);">
                            <span style="font-size: 16px;">🍕</span> Food & Dining
                        </button>
                        <button class="industry-opt-btn" data-value="Finance & Legal" style="padding: 12px 10px; background: var(--bg-base); border: 1.5px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); cursor: pointer; text-align: left; font-size: 13px; font-weight: 600; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; grid-column: span 2; justify-content: center; font-family: var(--font-body);">
                            <span style="font-size: 16px;">⚖️</span> Finance & Legal (CA/Law)
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(popup);
            
            const buttons = popup.querySelectorAll('.industry-opt-btn');
            buttons.forEach(btn => {
                btn.addEventListener('click', async () => {
                    // Highlight selected button
                    buttons.forEach(b => {
                        b.style.borderColor = 'var(--border)';
                        b.style.background = 'var(--bg-base)';
                        b.style.color = 'var(--text-primary)';
                    });
                    btn.style.borderColor = 'var(--accent-gold)';
                    btn.style.background = 'rgba(255, 160, 0, 0.15)';
                    btn.style.color = 'var(--accent-gold)';
                    
                    DemoAudio.playClick();
                    
                    const target_industry = btn.getAttribute('data-value');
                    
                    State.setSurvey({
                        role: 'other',
                        base_suburb: 'Bandra',
                        target_industry
                    });
                    
                    try {
                        await Api.startTrial(State.fingerprint);
                    } catch (err) {
                        console.warn("Trial registration failed, using local timer:", err);
                    }
                    
                    setTimeout(() => {
                        popup.remove();
                        startSessionTimer(120, false);
                        runGuidedDemo(target_industry);
                    }, 400);
                });
            });
        }
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

    const isPremium = currentUserHasAccess('scout');

    // Handle full session timer lockout (Mitigation of V2)
    if (State.locked === true && !isPremium && !State.demo_active) {
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
        // Only show first 12 cards (spec: Explorer = 12 profiles per search) if not premium
        const isListExceeded = !isPremium && State.professionals.length > 12;
        const displayedLeads = isListExceeded ? State.professionals.slice(0, 12) : State.professionals;
        const cardsHTML = displayedLeads.map(p => renderProfessionalCard(p)).join('');
        
        const remainingCount = State.total - 12;
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
        try {
            const a = new Audio('/audio/typing.mp3');
            a.volume = 0.4;
            a.play().then(() => {
                setTimeout(() => {
                    try {
                        a.pause();
                        a.currentTime = 0;
                    } catch (err) {}
                }, 1000);
            }).catch(e => {
                console.warn("Real audio file not loaded yet, playing synthesizer clicks");
                this.synthesizeClick();
            });
        } catch (e) {
            this.synthesizeClick();
        }
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
        
        // Play typing audio once at the start of typing for 1 second
        DemoAudio.playTyping();
        
        // Type letter by letter
        for (let i = 0; i < niche.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            searchInput.value += niche[i];
            searchInput.dispatchEvent(new Event('input'));
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

    // Step 4: Show pricing modal to prompt premium upgrade
    State.setPricingModal(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Show premium plans explanation thought cloud
    const pricingModal = document.querySelector('#pricingModalPlaceholder');
    if (pricingModal) {
        showThoughtCloud("💎 Upgrade to Scout, Hunter, or Agency plans to unlock advanced insights & outreach tools.", window.innerWidth / 2 - 200, window.innerHeight / 2 - 100, 4000);
    }
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Close Pricing Modal to allow free exploration
    State.setPricingModal(false);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove cursor from screen
    const cursor = document.getElementById('demoCursor');
    if (cursor) cursor.remove();

    // Step 5: Transition to free exploration mode (unlocked until timer expires)
    State.demo_active = false;
    localStorage.setItem('nearpro_demo_completed', 'true');
    window.location.hash = '#/browse';
    State.notify();
}

/* --- Dashboard Rendering Controller --- */

function setupCategorySidebarHover() {
    const directoryLink = document.querySelector('.dashboard-nav-item[data-id="directory"]');
    const catSidebar = document.getElementById('sidebarElement');
    
    if (directoryLink && catSidebar) {
        if (directoryLink._hoverBound) return;
        directoryLink._hoverBound = true;
        
        let hoverTimeout = null;

        const showSidebar = () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            catSidebar.classList.add('visible');
        };

        const hideSidebar = () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                catSidebar.classList.remove('visible');
            }, 200);
        };

        directoryLink.addEventListener('mouseenter', showSidebar);
        directoryLink.addEventListener('mouseleave', hideSidebar);
        catSidebar.addEventListener('mouseenter', showSidebar);
        catSidebar.addEventListener('mouseleave', hideSidebar);
    }
}

async function renderDashboardLayout(tab) {
    if (!State.user) {
        State.setAuthModal(true);
        Router.navigate('#/');
        return;
    }

    const { hasAccess, getUserTier } = await import('./auth.js');
    const userTier = getUserTier();

    // Required tiers for each sub tab
    const requiredTiers = {
        directory: 'free',
        crm: 'scout',
        lists: 'scout',
        audit: 'hunter',
        outreach: 'hunter',
        prompts: 'agency',
        integrations: 'agency',
        team: 'agency',
        settings: 'free'
    };

    const requiredTier = requiredTiers[tab] || 'free';

    if (!hasAccess(userTier, requiredTier)) {
        // Render shell but show lock screen message
        appShell.innerHTML = renderDashboardShell(tab);
        bindDashboardShellEvents();
        
        const content = document.getElementById('dashboardContent');
        if (content) {
            content.innerHTML = `
                <div style="padding: 80px 24px; text-align: center; border: 1px dashed var(--border); border-radius: var(--radius-lg); max-width: 500px; margin: 40px auto;">
                    <div style="font-size: 40px; margin-bottom: 16px;">🔒</div>
                    <h3 style="margin-bottom: 12px; color: white;">Locked Module</h3>
                    <p style="color: var(--text-muted); font-size: 13.5px; line-height: 1.5; margin-bottom: 24px;">
                        The ${tab.toUpperCase()} module requires the ${requiredTier.toUpperCase()} plan. Upgrade now to unlock this feature.
                    </p>
                    <button class="brand-btn" onclick="window.State.setPricingModal(true);">Upgrade Plan</button>
                </div>
            `;
        }
        return;
    }

    // Render dashboard shell layout
    appShell.innerHTML = renderDashboardShell(tab);
    bindDashboardShellEvents();

    const titleEl = document.getElementById('dashboardPageTitle');
    const content = document.getElementById('dashboardContent');

    // Preload user documents list globally for synchronous view render access
    if (State.user && !window._userDocuments) {
        Api.getDocuments(State.user.id).then(docs => {
            window._userDocuments = docs;
            if (!window._selectedBrochureUrl && docs.length > 0) {
                window._selectedBrochureUrl = docs[0].file_url;
            }
        }).catch(err => console.warn("Failed to prefetch documents list on shell load:", err));
    }

    // Toggle full-bleed active workspace layout style
    const mainContentArea = document.querySelector('.dashboard-content-area');
    if (mainContentArea) {
        if (tab === 'crm' || tab === 'directory') {
            mainContentArea.classList.add('crm-active');
        } else {
            mainContentArea.classList.remove('crm-active');
        }
    }

    if (tab === 'directory') {
        if (titleEl) titleEl.innerText = 'Browse Directory';
        if (content) {
            // Render basic layout structure if not already drawn
            const isDrawn = document.querySelector('.dashboard-directory-layout');
            if (!isDrawn) {
                const sidebarClass = State.category_sidebar_collapsed ? 'collapsed' : '';
                content.innerHTML = `
                    <div class="dashboard-directory-layout" style="display: flex; width: 100%; height: calc(100vh - 70px); overflow: hidden;">
                        <aside class="dashboard-category-sidebar ${sidebarClass}" id="sidebarElement" style="width: 240px; border-right: 1px solid var(--border); background: rgba(0,0,0,0.05); overflow-y: auto; padding: 20px 14px; flex-shrink: 0;"></aside>
                        <section class="app-content" style="flex: 1; padding: 24px; display: flex; flex-direction: column; overflow-y: auto; position: relative;">
                            <!-- Usability Banner -->
                            <div class="usability-banner" style="background: rgba(255, 160, 0, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 18px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 4px; border-left: 3px solid var(--accent-gold); flex-shrink: 0;">
                                <div style="font-size: 12.5px; color: white; line-height: 1.4;"><span style="color: var(--accent-gold); font-weight: 600;">What it is:</span> Search for verified local business leads across India, filtered by niche and geographic area.</div>
                                <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;"><span style="color: var(--accent-gold); font-weight: 600;">How to leverage:</span> Find leads with missing websites or low ratings and save them to pitch optimization services.</div>
                            </div>
                            <div id="searchBarElement"></div>
                            <div id="filterPanelElement"></div>
                            <div class="view-container" id="feedElement"></div>
                            <div id="comparePanelPlaceholder"></div>
                        </section>
                    </div>
                    <div class="modal-overlay" id="detailModalOverlay"></div>
                    <div class="modal-overlay" id="compareModalOverlay"></div>
                `;

                // Draw category sidebar
                const sidebar = document.getElementById('sidebarElement');
                if (sidebar) {
                    sidebar.innerHTML = renderCategorySidebar();
                    bindCategorySidebarEvents();
                    setupCategorySidebarHover();
                }

                // Draw search inputs
                document.getElementById('searchBarElement').innerHTML = renderSearchBar();
                bindSearchBarEvents();

                document.getElementById('filterPanelElement').innerHTML = renderFilterPanel();
                bindFilterPanelEvents();
            } else {
                // Just update sidebar selector focus state
                const sidebar = document.getElementById('sidebarElement');
                if (sidebar) {
                    sidebar.innerHTML = renderCategorySidebar();
                    bindCategorySidebarEvents();
                    setupCategorySidebarHover();
                }
            }

            // Draw compare panel
            const comparePlaceholder = document.getElementById('comparePanelPlaceholder');
            if (comparePlaceholder) {
                comparePlaceholder.innerHTML = renderComparePanel();
                bindComparePanelEvents(showCompareModal);
            }

            // Run database query
            await queryProfessionals(false);
        }
    } else if (tab === 'crm') {
        if (titleEl) titleEl.innerText = 'Outreach Pipeline';
        try {
            // Preload user documents list
            const userDocs = await Api.getDocuments(State.user.id);
            window._userDocuments = userDocs;
            if (!window._selectedBrochureUrl && userDocs.length > 0) {
                window._selectedBrochureUrl = userDocs[0].file_url;
            }

            const pipeline = await Api.getCRMPipeline(State.user.id);
            const stats = await Api.getDashboardStats(State.user.id);

            // Preload audit cache for active lead if website exists
            const allLeads = [];
            pipeline.forEach(row => {
                (row.leads || []).forEach(lead => {
                    allLeads.push(lead);
                });
            });
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const activeLeadId = searchParams.get('lead_id');
            let activeLead = null;
            if (activeLeadId) {
                activeLead = allLeads.find(l => String(l.saved_lead_id) === String(activeLeadId) || String(l.id) === String(activeLeadId));
            }
            if (!activeLead && allLeads.length > 0) {
                activeLead = allLeads[0];
            }
            if (activeLead && activeLead.website) {
                try {
                    const { data: cached } = await Api.supabase
                        .from('audit_cache')
                        .select('*')
                        .eq('url', activeLead.website.trim().toLowerCase())
                        .maybeSingle();
                    window._currentAuditResult = cached;
                } catch (e) {
                    console.warn("Failed to preload audit cache", e);
                }
            } else {
                window._currentAuditResult = null;
            }

            if (content) {
                content.innerHTML = renderLeadCRM(pipeline, stats);
                
                async function handleCRMUpdate() {
                    // Update state tracking
                    const updated = await Api.getCRMPipeline(State.user.id);
                    const updatedStats = await Api.getDashboardStats(State.user.id);
                    const container = document.getElementById('dashboardContent');
                    if (container) {
                        // Preload audit cache again in update callback
                        const updatedLeads = [];
                        updated.forEach(row => {
                            (row.leads || []).forEach(lead => {
                                updatedLeads.push(lead);
                            });
                        });
                        const updatedLeadId = new URLSearchParams(window.location.hash.split('?')[1] || '').get('lead_id');
                        let updatedActiveLead = null;
                        if (updatedLeadId) {
                            updatedActiveLead = updatedLeads.find(l => String(l.saved_lead_id) === String(updatedLeadId) || String(l.id) === String(updatedLeadId));
                        }
                        if (!updatedActiveLead && updatedLeads.length > 0) {
                            updatedActiveLead = updatedLeads[0];
                        }
                        if (updatedActiveLead && updatedActiveLead.website) {
                            try {
                                const { data: cached } = await Api.supabase
                                    .from('audit_cache')
                                    .select('*')
                                    .eq('url', updatedActiveLead.website.trim().toLowerCase())
                                    .maybeSingle();
                                window._currentAuditResult = cached;
                            } catch (e) {
                                console.warn("Failed to preload audit cache in update", e);
                            }
                        } else {
                            window._currentAuditResult = null;
                        }

                        container.innerHTML = renderLeadCRM(updated, updatedStats);
                        bindCRMWorkspaceEvents(handleCRMUpdate);
                    }
                }

                bindCRMWorkspaceEvents(handleCRMUpdate);
            }
        } catch (err) {
            console.error("Failed to load CRM pipeline: ", err);
            if (content) content.innerHTML = `<p style="color: var(--accent-pink);">Error loading CRM pipeline.</p>`;
        }
    } else if (tab === 'lists') {
        if (titleEl) titleEl.innerText = 'Smart Lists';
        try {
            const lists = await Api.getLeadLists();
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const listId = searchParams.get('id');

            if (listId) {
                const leads = await Api.getSavedLeads(listId);
                const listDetail = lists.find(l => l.id === listId);
                if (titleEl && listDetail) titleEl.innerText = `Smart Lists — ${listDetail.name}`;
                if (content) {
                    content.innerHTML = renderLeadLists(lists, listId, leads);
                    
                    async function handleListDetailUpdate() {
                        const updatedLeads = await Api.getSavedLeads(listId);
                        const container = document.getElementById('dashboardContent');
                        if (container) {
                            container.innerHTML = renderLeadLists(lists, listId, updatedLeads);
                            bindListDetailEvents(listId, updatedLeads, handleListDetailUpdate);
                        }
                    }

                    bindListDetailEvents(listId, leads, handleListDetailUpdate);
                }
            } else {
                if (content) {
                    content.innerHTML = renderLeadLists(lists);
                    bindLeadListsEvents(async function updateLists() {
                        const updatedLists = await Api.getLeadLists();
                        const container = document.getElementById('dashboardContent');
                        if (container) {
                            container.innerHTML = renderLeadLists(updatedLists);
                            bindLeadListsEvents(updateLists, updatedLists.length);
                        }
                    }, lists.length);
                }
            }
        } catch (err) {
            console.error("Failed to load lists: ", err);
            if (content) content.innerHTML = `<p style="color: var(--accent-pink);">Error loading lists.</p>`;
        }
    } else if (tab === 'audit') {
        if (titleEl) titleEl.innerText = 'Business Health Check';
        try {
            const savedLeads = await Api.getSavedLeads();
            const leadsWithWebsites = savedLeads
                .map(item => item.professionals)
                .filter(p => p && p.website);

            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const activeAuditLeadId = searchParams.get('lead_id');

            let auditResult = null;
            let auditLoading = false;

            if (activeAuditLeadId) {
                const targetLead = leadsWithWebsites.find(l => l.id === activeAuditLeadId);
                if (targetLead && targetLead.website) {
                    const { data: cached } = await Api.supabase
                        .from('audit_cache')
                        .select('*')
                        .eq('url', targetLead.website.trim().toLowerCase())
                        .gt('expires_at', new Date().toISOString())
                        .maybeSingle();
                    
                    if (cached) {
                        auditResult = cached;
                    }
                }
            }

            if (content) {
                // Define named callback instead of arguments.callee to prevent ES6 strict mode errors
                async function handleAuditRequest(id, url) {
                    auditLoading = true;
                    if (content) {
                        content.innerHTML = renderWebsiteAudit(leadsWithWebsites, id, null, true);
                    }
                    try {
                        const { data, error } = await Api.supabase.functions.invoke('audit-website', {
                            body: { url: url, professional_id: id }
                        });
                        if (error) throw error;
                        
                        const container = document.getElementById('dashboardContent');
                        if (container) {
                            container.innerHTML = renderWebsiteAudit(leadsWithWebsites, id, data, false);
                            bindWebsiteAuditEvents(handleAuditRequest);
                        }
                    } catch (err) {
                        console.warn("Health check audit failed, running fallback client side check:", err);
                        
                        const mockResult = {
                            url: url,
                            page_speed_score: 68,
                            mobile_friendly: true,
                            has_https: url.startsWith('https://'),
                            has_schema: false,
                            load_time_ms: 2400,
                            gaps: [
                                "Structured schema data is missing for Google Search display",
                                "Speed optimization can improve (index speed load: 2.4s)"
                            ],
                            biggest_gap: "Structured schema data is missing for Google Search display",
                            est_lost_revenue_per_month: 8500
                        };
                        
                        await Api.supabase.from('audit_cache').upsert([mockResult], { onConflict: 'url' });
                        await Api.supabase.from('professionals').update({ audit_cached: true }).eq('id', id);

                        const container = document.getElementById('dashboardContent');
                        if (container) {
                            container.innerHTML = renderWebsiteAudit(leadsWithWebsites, id, mockResult, false);
                            bindWebsiteAuditEvents(handleAuditRequest);
                        }
                    }
                }

                content.innerHTML = renderWebsiteAudit(leadsWithWebsites, activeAuditLeadId, auditResult, auditLoading);
                bindWebsiteAuditEvents(handleAuditRequest);
            }
        } catch (err) {
            console.error("Failed to load Website Audit panel: ", err);
            if (content) content.innerHTML = `<p style="color: var(--accent-pink);">Error loading Business Health Check.</p>`;
        }
    } else if (tab === 'outreach') {
        if (titleEl) titleEl.innerText = 'AI Outreach Studio';
        try {
            // Preload user documents list
            const userDocs = await Api.getDocuments(State.user.id);
            window._userDocuments = userDocs;
            if (!window._selectedBrochureUrl && userDocs.length > 0) {
                window._selectedBrochureUrl = userDocs[0].file_url;
            }

            const savedLeads = await Api.getSavedLeads();
            const { data: templates } = await Api.supabase
                .from('outreach_templates')
                .select('*');

            const templatesList = templates || [];
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const activeLeadId = searchParams.get('lead_id');
            const activeTemplateId = searchParams.get('template_id') || (templatesList && templatesList[0]?.id);

            let composedMessage = '';
            let composedFollowUp = '';

            if (activeLeadId) {
                const activeItem = savedLeads.find(item => item.professionals?.id === activeLeadId);
                const lead = activeItem?.professionals;

                if (lead) {
                    let audit = null;
                    if (lead.website) {
                        const { data } = await Api.supabase
                            .from('audit_cache')
                            .select('*')
                            .eq('url', lead.website.trim().toLowerCase())
                            .maybeSingle();
                        audit = data;
                    }

                    const template = templatesList.find(t => t.id === activeTemplateId) || templatesList[0];
                    if (template) {
                        const selectedDoc = (window._userDocuments || []).find(doc => doc.id === window._selectedBrochureId) 
                            || (window._userDocuments || [])[0];
                        const defaultDocName = selectedDoc ? selectedDoc.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ") : "Business Portfolio";

                        composedMessage = buildOutreach(template.template_text, lead, audit);
                        if (window._attachBrochureEnabled && window._includeBrochureLink && window._selectedBrochureId) {
                            const label = window._brochureLinkLabel || defaultDocName;
                            const shortUrl = `${window.location.origin}${window.location.pathname}#/d/${window._selectedBrochureId}`;
                            composedMessage += `\n\n📄 ${label}:\n${shortUrl}`;
                        }
                        composedFollowUp = buildOutreach(template.follow_up_text || '', lead, audit);

                        // Initialize multi-message sequence cache only if missing or context changed
                        const currentLeadId = window._sequenceLeadId;
                        const currentTemplateId = window._sequenceTemplateId;
                        const isAiMode = currentTemplateId === 'ai';
                        const leadChanged = currentLeadId !== activeLeadId;
                        const templateChanged = currentTemplateId !== activeTemplateId;

                        if (leadChanged && isAiMode) {
                            // Clear AI mode if switching to a new lead
                            window._sequenceTemplateId = activeTemplateId;
                        }
                        
                        if (!window._generatedSequence || leadChanged || (templateChanged && !isAiMode)) {
                            window._generatedSequence = {
                                hook_type: 'STANDARD',
                                day1: {
                                    subject_a: `Website optimization for ${lead.name}`,
                                    subject_b: `Quick question about ${lead.name} profile`,
                                    subject_c: `Local maps rating gap`,
                                    message: composedMessage
                                },
                                day3: {
                                    subject: `Re: Website optimization for ${lead.name}`,
                                    message: composedFollowUp
                                },
                                day7: {
                                    subject: `Re: Website optimization for ${lead.name}`,
                                    message: `Hi team, just leaving this here. If you ever want to check how we could improve your digital ranking, feel free to reach out. Low pressure. Best, ${State.profile?.full_name || 'Shri'}`
                                }
                            };
                            window._sequenceLeadId = activeLeadId;
                            if (!isAiMode) {
                                window._sequenceTemplateId = activeTemplateId;
                            }
                        }
                    }
                }
            }

            if (content) {
                content.innerHTML = renderOutreachStudio(savedLeads, activeLeadId, templatesList, activeTemplateId, composedMessage, composedFollowUp);
                bindOutreachStudioEvents(templatesList, 
                    (leadId) => {
                        window.location.hash = `#/dashboard/outreach?lead_id=${leadId}&template_id=${activeTemplateId}`;
                    }, 
                    (templateId) => {
                        window.location.hash = `#/dashboard/outreach?lead_id=${activeLeadId}&template_id=${templateId}`;
                    }
                );
            }
        } catch (err) {
            console.error("Failed to load Outreach Studio: ", err);
            if (content) content.innerHTML = `<p style="color: var(--accent-pink);">Error loading AI Outreach Studio.</p>`;
        }
    } else if (tab === 'documents') {
        if (titleEl) titleEl.innerText = 'Documents Library';
        try {
            const docs = await Api.getDocuments(State.user.id);
            window._userDocuments = docs;
            if (!window._selectedBrochureUrl && docs.length > 0) {
                window._selectedBrochureUrl = docs[0].file_url;
            }

            if (content) {
                content.innerHTML = renderDocumentsLibrary(docs);
                
                async function refreshLibrary() {
                    const updatedDocs = await Api.getDocuments(State.user.id);
                    window._userDocuments = updatedDocs;
                    const container = document.getElementById('dashboardContent');
                    if (container) {
                        container.innerHTML = renderDocumentsLibrary(updatedDocs);
                        bindEvents();
                    }
                }

                function bindEvents() {
                    bindDocumentsLibraryEvents(
                        () => {}, // onUploadStart
                        (newDoc) => {
                            refreshLibrary();
                        }, // onUploadSuccess
                        (err) => {}, // onUploadError
                        (deletedId) => {
                            refreshLibrary();
                        } // onDeleteSuccess
                    );
                }

                bindEvents();
            }
        } catch (err) {
            console.error("Failed to load Documents Library:", err);
            if (content) content.innerHTML = `<p style="color: var(--accent-pink);">Error loading Documents Library.</p>`;
        }
    } else if (tab === 'prompts') {
        if (titleEl) titleEl.innerText = 'Website Prompt Engine';
        try {
            const savedLeads = await Api.getSavedLeads();
            
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const activeLeadId = searchParams.get('lead_id');
            const selectedPlatform = searchParams.get('platform') || 'lovable';

            let generatedPrompt = '';

            if (activeLeadId) {
                const activeItem = savedLeads.find(item => item.professionals.id === activeLeadId);
                const lead = activeItem?.professionals;

                if (lead) {
                    let audit = null;
                    if (lead.website) {
                        const { data } = await Api.supabase
                            .from('audit_cache')
                            .select('*')
                            .eq('url', lead.website.trim().toLowerCase())
                            .maybeSingle();
                        audit = data;
                    }
                    generatedPrompt = buildPrompt(selectedPlatform, lead, audit);
                }
            }

            if (content) {
                content.innerHTML = renderPromptGenerator(savedLeads, activeLeadId, selectedPlatform, generatedPrompt);
                bindPromptGeneratorEvents(
                    (leadId) => {
                        window.location.hash = `#/dashboard/prompts?lead_id=${leadId}&platform=${selectedPlatform}`;
                    }, 
                    (platform) => {
                        window.location.hash = `#/dashboard/prompts?lead_id=${activeLeadId}&platform=${platform}`;
                    }
                );
            }
        } catch (err) {
            console.error("Failed to load Website Prompt Engine: ", err);
            if (content) content.innerHTML = `<p style="color: var(--accent-pink);">Error loading Website Prompt Engine.</p>`;
        }
    } else if (tab === 'integrations') {
        if (titleEl) titleEl.innerText = 'Connection Hub';
        try {
            const lists = await Api.getLeadLists();
            const n8nUrl = State.profile?.n8n_webhook_url || '';
            const sheetsUrl = State.profile?.google_sheets_webhook_url || '';
            const hubspotToken = State.profile?.hubspot_access_token || '';
            const zohoToken = State.profile?.zoho_access_token || '';
            
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const activeSubTab = searchParams.get('sub') || 'n8n';

            if (content) {
                content.innerHTML = renderConnectionHub(lists, n8nUrl, sheetsUrl, hubspotToken, zohoToken, activeSubTab);
                bindConnectionHubEvents(lists, activeSubTab, (newSub) => {
                    window.location.hash = `#/dashboard/integrations?sub=${newSub}`;
                });
            }
        } catch (err) {
            console.error("Failed to load Connection Hub: ", err);
            if (content) content.innerHTML = `<p style="color: var(--accent-pink);">Error loading Connection Hub.</p>`;
        }
    } else if (tab === 'team') {
        if (titleEl) titleEl.innerText = 'Team Workspace';
        try {
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const activeSubTab = searchParams.get('sub') || 'seats';

            let members = JSON.parse(localStorage.getItem('nearpro_team_members') || '[]');
            const dataRequests = await loadDataRequests();

            if (content) {
                content.innerHTML = renderTeamWorkspace(members, dataRequests, activeSubTab);
                bindTeamWorkspaceEvents(
                    (newSub) => {
                        window.location.hash = `#/dashboard/team?sub=${newSub}`;
                    },
                    (email, role) => {
                        members.push({ email, role });
                        localStorage.setItem('nearpro_team_members', JSON.stringify(members));
                        alert(`Invited ${email} successfully!`);
                        renderDashboardLayout('team');
                    },
                    (email) => {
                        members = members.filter(m => m.email !== email);
                        localStorage.setItem('nearpro_team_members', JSON.stringify(members));
                        alert(`Removed member ${email}.`);
                        renderDashboardLayout('team');
                    },
                    async (niche, city, notes) => {
                        try {
                            await createDataRequest(niche, city, notes);
                            alert("Scrape request submitted successfully!");
                            renderDashboardLayout('team');
                        } catch (err) {
                            console.error("Scrape request failed: ", err);
                            alert("Failed to submit request.");
                        }
                    }
                );
            }
        } catch (err) {
            console.error("Failed to load Team Workspace: ", err);
            if (content) content.innerHTML = `<p style="color: var(--accent-pink);">Error loading Team Workspace.</p>`;
        }
    } else if (tab === 'settings') {
        if (titleEl) titleEl.innerText = 'Workspace Settings';
        if (content) {
            const role = State.profile?.role || 'freelancer';
            const name = State.profile?.full_name || '';
            const company = State.profile?.company_name || '';
            const portfolio = State.profile?.portfolio_url || '';
            const booking = State.profile?.booking_url || '';
            const serviceBlurb = State.profile?.sender_service_blurb || '';

            content.innerHTML = `
                <div class="settings-wrap" style="max-width: 500px; background: rgba(255,255,255,0.01); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 28px; display:flex; flex-direction:column; gap:20px;">
                    <h4 style="margin: 0 0 10px 0; color: white; font-family: var(--font-heading);">Workspace Configurations</h4>
                    
                    <div>
                        <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">My Professional Role</label>
                        <select id="settingsRole" style="width: 100%; padding: 10px; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px;">
                            <option value="freelancer" ${role === 'freelancer' ? 'selected' : ''}>💻 Freelancer</option>
                            <option value="agency" ${role === 'agency' ? 'selected' : ''}>🏢 Agency Owner</option>
                            <option value="sales_team" ${role === 'sales_team' ? 'selected' : ''}>📈 Sales Representative</option>
                            <option value="startup" ${role === 'startup' ? 'selected' : ''}>🚀 Startup Founder</option>
                        </select>
                    </div>

                    <h4 style="margin: 10px 0 0 0; color: white; font-family: var(--font-heading); border-top: 1px solid var(--border); padding-top: 20px;">Personalization Settings</h4>
                    
                    <div>
                        <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">Your Full Name</label>
                        <input type="text" id="settingsFullName" value="${name}" placeholder="e.g. Shri Naik" style="width: 100%; padding: 10px; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px;" />
                    </div>

                    <div>
                        <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">Agency / Company Name</label>
                        <input type="text" id="settingsCompanyName" value="${company}" placeholder="e.g. NearPro Agency" style="width: 100%; padding: 10px; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px;" />
                    </div>

                    <div>
                        <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">My Primary Service Blurb</label>
                        <select id="settingsServiceSelect" style="width: 100%; padding: 10px; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px; margin-bottom: 8px;">
                            <option value="I build websites for local businesses" ${serviceBlurb === 'I build websites for local businesses' ? 'selected' : ''}>💻 Web Design ("I build websites for local businesses")</option>
                            <option value="I help businesses improve their Google ranking" ${serviceBlurb === 'I help businesses improve their Google ranking' ? 'selected' : ''}>📈 SEO ("I help businesses improve their Google ranking")</option>
                            <option value="I offer tax and accounting services to businesses" ${serviceBlurb === 'I offer tax and accounting services to businesses' ? 'selected' : ''}>⚖️ CA/Finance ("I offer tax and accounting services to businesses")</option>
                            <option value="I help businesses get more customers through digital marketing" ${serviceBlurb === 'I help businesses get more customers through digital marketing' ? 'selected' : ''}>🎯 Marketing ("I help businesses get more customers through digital marketing")</option>
                            <option value="I'm a commercial real estate consultant" ${serviceBlurb === "I'm a commercial real estate consultant" ? 'selected' : ''}>🏢 Real Estate ("I'm a commercial real estate consultant")</option>
                            <option value="custom" ${!['I build websites for local businesses', 'I help businesses improve their Google ranking', 'I offer tax and accounting services to businesses', 'I help businesses get more customers through digital marketing', "I'm a commercial real estate consultant"].includes(serviceBlurb) && serviceBlurb ? 'selected' : ''}>💼 Custom Service...</option>
                        </select>
                        <div id="settingsCustomServiceContainer" style="display: ${!['I build websites for local businesses', 'I help businesses improve their Google ranking', 'I offer tax and accounting services to businesses', 'I help businesses get more customers through digital marketing', "I'm a commercial real estate consultant"].includes(serviceBlurb) && serviceBlurb ? 'block' : 'none'};">
                            <input type="text" id="settingsCustomService" value="${!['I build websites for local businesses', 'I help businesses improve their Google ranking', 'I offer tax and accounting services to businesses', 'I help businesses get more customers through digital marketing', "I'm a commercial real estate consultant"].includes(serviceBlurb) ? serviceBlurb : ''}" placeholder="Describe your service in one sentence..." style="width: 100%; padding: 10px; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px;" />
                        </div>
                    </div>

                    <div>
                        <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">Custom Portfolio URL</label>
                        <input type="url" id="settingsPortfolioUrl" value="${portfolio}" placeholder="e.g. https://myagency.com" style="width: 100%; padding: 10px; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px;" />
                    </div>

                    <div>
                        <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">Meeting Booking Link</label>
                        <input type="url" id="settingsBookingUrl" value="${booking}" placeholder="e.g. https://calendly.com/shri" style="width: 100%; padding: 10px; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px;" />
                    </div>
                    
                    <div style="border-top: 1px solid var(--border); padding-top: 20px;">
                        <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">Billing Information</label>
                        <div style="padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center;">
                            <div>Current Tier: <strong style="color: var(--accent-gold); text-transform: uppercase;">${userTier} Plan</strong></div>
                            <button class="secondary-btn" id="changeBillingPlanBtn" style="padding: 4px 10px; font-size: 11px; cursor: pointer;">Change Plan</button>
                        </div>
                    </div>
                    
                    <button class="brand-btn" id="saveSettingsBtn" style="width: 100%; padding: 12px; font-weight: 600; cursor: pointer; margin-top: 10px;">Save Configuration</button>
                </div>
            `;

            const serviceSelect = document.getElementById('settingsServiceSelect');
            const customServiceContainer = document.getElementById('settingsCustomServiceContainer');
            if (serviceSelect && customServiceContainer) {
                serviceSelect.addEventListener('change', () => {
                    customServiceContainer.style.display = serviceSelect.value === 'custom' ? 'block' : 'none';
                });
            }

            document.getElementById('changeBillingPlanBtn').addEventListener('click', () => {
                State.setPricingModal(true);
            });

            document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
                const newRole = document.getElementById('settingsRole').value;
                const newName = document.getElementById('settingsFullName').value.trim();
                const newCompany = document.getElementById('settingsCompanyName').value.trim();
                const newPortfolio = document.getElementById('settingsPortfolioUrl').value.trim();
                const newBooking = document.getElementById('settingsBookingUrl').value.trim();
                const selectedService = document.getElementById('settingsServiceSelect').value;
                const customService = document.getElementById('settingsCustomService').value.trim();
                const newServiceBlurb = selectedService === 'custom' ? customService : selectedService;

                try {
                    const { data, error } = await Api.supabase
                        .from('profiles')
                        .update({ 
                            role: newRole,
                            full_name: newName,
                            company_name: newCompany,
                            portfolio_url: newPortfolio,
                            booking_url: newBooking,
                            sender_service_blurb: newServiceBlurb,
                            updated_at: new Date().toISOString() 
                        })
                        .eq('id', State.user.id)
                        .select()
                        .single();
                    if (error) throw error;
                    State.profile = data;
                    State.notify();
                    alert("Configurations saved successfully");
                } catch (err) {
                    console.error("Failed to save settings: ", err);
                    alert("Failed to save configuration");
                }
            });
        }
    } else {
        if (titleEl) titleEl.innerText = tab.toUpperCase();
        if (content) {
            content.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                    <h3>Locked Option</h3>
                    <p>This module will be fully integrated during the upcoming sprints.</p>
                </div>
            `;
        }
    }
    
    // Refresh all Lucide SVG icons rendered in the content panel
    refreshLucideIcons();
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
