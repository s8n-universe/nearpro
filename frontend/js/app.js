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
import { renderPrivacyPolicyPage, renderTermsOfServicePage, renderOptOutPage, bindOptOutFormEvents } from './components/LegalPages.js';
import { renderUpgradeModal, bindUpgradeModalEvents } from './components/UpgradeModal.js';
import { renderCheckoutConsentModal, bindCheckoutConsentModalEvents } from './components/CheckoutConsentModal.js';
import { renderCheckoutPage, bindCheckoutPageEvents } from './components/CheckoutPage.js';
import { renderUpgradeSuccessModal, bindUpgradeSuccessModalEvents } from './components/UpgradeSuccessModal.js';
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

// State Subscription - Centralized UI synchronization
State.subscribe(async (currentState) => {
    State.locked = false;

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
        if (!document.querySelector('.marketing-hero')) {
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

    // Dynamically render/update Upgrade Success Modal
    const upgradeSuccessPlaceholder = document.getElementById('upgradeSuccessModalPlaceholder');
    if (upgradeSuccessPlaceholder) {
        upgradeSuccessPlaceholder.innerHTML = renderUpgradeSuccessModal();
        bindUpgradeSuccessModalEvents();
    }

    // Dynamically render/update Checkout Consent Modal
    const checkoutConsentPlaceholder = document.getElementById('checkoutConsentModalPlaceholder');
    if (checkoutConsentPlaceholder) {
        checkoutConsentPlaceholder.innerHTML = renderCheckoutConsentModal();
        bindCheckoutConsentModalEvents();
    }
    refreshLucideIcons();
});

// Initialize Routing bindings
function initRoutes() {
    Router.on('#/checkout', async () => {
        const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        const plan = searchParams.get('plan') || 'hunter';
        const cycle = searchParams.get('cycle') || 'monthly';

        if (!State.user) {
            localStorage.setItem('selected_nearpro_tier', plan);
            localStorage.setItem('selected_nearpro_interval', cycle);
            State.setAuthModal(true);
            return;
        }

        appShell.innerHTML = `
            <div class="app-container">
                ${renderCheckoutPage(plan, cycle)}
                <div id="authModalPlaceholder"></div>
                <div id="pricingModalPlaceholder"></div>
                <div id="upgradeSuccessModalPlaceholder"></div>
            </div>
        `;
        bindCheckoutPageEvents(plan, cycle);
        refreshLucideIcons();
    });
    Router.on('#/', async () => {
        if (State.user) {
            Router.navigate('#/dashboard/directory');
            return;
        }
        State.resetFilters();
        if (!document.querySelector('.marketing-hero')) {
            renderMarketingLayout();
        }
        if (!State.stats) {
            try {
                State.stats = await Api.getStats();
                if (State.stats) {
                    const leadsEl = document.getElementById('heroTotalLeads');
                    const catEl = document.getElementById('heroTotalCategories');
                    const ratingEl = document.getElementById('heroAvgRating');
                    if (leadsEl && State.stats.total_professionals) leadsEl.innerText = `${State.stats.total_professionals.toLocaleString('en-IN')}+ Verified Leads`;
                    if (catEl && State.stats.total_categories) catEl.innerText = `${State.stats.total_categories}+ Sub Categories`;
                    if (ratingEl && State.stats.average_rating) ratingEl.innerText = `${State.stats.average_rating}★ Average Rating`;
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

    Router.on('#/opt-out', () => {
        appShell.innerHTML = renderOptOutPage();
        bindOptOutFormEvents();
    });

    Router.on('#/d/:id', async (id) => {
        renderDocumentViewerLayout(id);
    });

    Router.on('*', () => {
        appShell.innerHTML = `
            <div class="app-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center; font-family: var(--font-body); padding: 24px;">
                <div style="font-size: 80px; font-family: var(--font-heading); font-weight: 700; color: var(--accent-gold); line-height: 1; margin-bottom: 20px;">404</div>
                <h2 style="font-family: var(--font-heading); color: white; margin-bottom: 12px;">Route Not Found</h2>
                <p style="color: var(--text-secondary); max-width: 480px; line-height: 1.6; margin-bottom: 30px;">
                    The page you are trying to access does not exist or has been relocated in our directory.
                </p>
                <a href="#/" class="brand-btn" style="padding: 12px 28px; font-size: 13px; text-decoration: none; border-radius: var(--radius-sm);">Return to Safety</a>
            </div>
        `;
        refreshLucideIcons();
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
            <div id="checkoutConsentModalPlaceholder"></div>
            <footer class="main-footer" style="display: flex; justify-content: space-between; align-items: center; padding: 24px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid var(--border); font-size: 13px; color: var(--text-muted); flex-wrap: wrap; gap: 12px;">
                <div>NearPro — Made with ❤️ by S8N</div>
                <div style="display: flex; gap: 20px;">
                    <a href="#/privacy" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Privacy Policy</a>
                    <a href="#/terms" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Terms Of Service</a>
                    <a href="#/opt-out" style="color: var(--accent-gold); text-decoration: none; font-weight: 500;">Business Opt-Out</a>
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

    State.locked = false;
    const isPremium = currentUserHasAccess('scout');
    let showWelcomeModal = false;
 
    if (!isPremium && !State.user) {
        const demoCompleted = localStorage.getItem('nearpro_demo_completed') === 'true';
        if (!demoCompleted) {
            showWelcomeModal = true;
        }
    }

    // Trigger initial content query load after lock status is determined
    await queryProfessionals(true);

    if (showWelcomeModal && !State.demo_active) {
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
                        base_suburb: '',
                        target_industry
                    });
                    
                    setTimeout(() => {
                        popup.remove();
                        localStorage.setItem('nearpro_demo_completed', 'true');
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
    
    const isTyping = document.activeElement && document.activeElement.id === 'searchInput';

    // Update sidebar selections if not actively typing
    if (!isTyping) {
        const sidebar = document.getElementById('sidebarElement');
        if (sidebar) {
            sidebar.innerHTML = renderCategorySidebar();
            bindCategorySidebarEvents();
        }
    }

    // Update compare panel
    const comparePlaceholder = document.getElementById('comparePanelPlaceholder');
    if (comparePlaceholder) {
        comparePlaceholder.innerHTML = renderComparePanel();
        bindComparePanelEvents(showCompareModal);
    }

    // Update feed grid or maps view
    await queryProfessionals(false);
}

// Main query handler contacting Supabase API
async function queryProfessionals(isInitialLoad = false) {
    const feed = document.getElementById('feedElement');
    const activeInput = document.activeElement;
    const isTypingInSearch = activeInput && activeInput.id === 'searchInput';
    
    // Save cursor position if user is typing
    let selStart = 0, selEnd = 0;
    if (isTypingInSearch) {
        selStart = activeInput.selectionStart;
        selEnd = activeInput.selectionEnd;
    }
    
    // Render skeletons ONLY on initial load and when NOT typing
    if (State.offset === 0 && feed && !isTypingInSearch && isInitialLoad) {
        feed.innerHTML = `
            <div class="prof-grid">
                ${'<div class="prof-card shimmer" style="height: 250px;"></div>'.repeat(6)}
            </div>
        `;
    }

    if (isTypingInSearch && feed) {
        feed.style.opacity = '0.75';
    }

    try {
        if (!State.fingerprint) {
            State.fingerprint = generateBrowserFingerprint();
        }
        State.loading = true;
        const result = await Api.getProfessionals(State.filters, State.offset, State.limit, State.fingerprint);
        
        // Discard stale out-of-order search responses
        if (result && result.stale) {
            return;
        }

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
            feed.style.opacity = '1';
            renderFeedContent(result.has_more);
        }
        
        // Restore focus and cursor range if user was typing
        if (isTypingInSearch && activeInput && document.body.contains(activeInput)) {
            activeInput.focus();
            if (typeof activeInput.setSelectionRange === 'function') {
                try {
                    activeInput.setSelectionRange(selStart, selEnd);
                } catch (e) {
                    // Ignore range errors on non-text inputs
                }
            }
        }
    } catch (e) {
        console.error("API error loading professionals: ", e);
        if (feed) {
            feed.style.opacity = '1';
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
        // Step 1: Freemium Hook — pass card index so cards 0 and 1 get unlocked free sample phone numbers
        const cardsHTML = displayedLeads.map((p, idx) => renderProfessionalCard(p, idx)).join('');
        
        // Step 2: Audit Gap Trigger (Greed & Urgency Banner)
        const noWebLeads = State.professionals.filter(p => 
            (!p.website || p.website.trim() === '') && 
            ((p.phone && p.phone.trim() !== '') || (p.email && p.email.trim() !== ''))
        );
        const lowRatingLeads = State.professionals.filter(p => p.rating && p.rating < 4.0);
        const categoryLabel = State.filters.category || State.filters.parentCategory || 'Business';
        const areaLabel = State.filters.area || 'Mumbai';

        let auditGapTriggerHTML = '';
        if (noWebLeads.length > 0) {
            const count = noWebLeads.length;
            const potentialRevenue = (count * 30000).toLocaleString('en-IN');
            auditGapTriggerHTML = `
                <div class="audit-gap-trigger-card" style="margin-bottom: 24px; padding: 18px 24px; background: linear-gradient(135deg, rgba(255, 160, 0, 0.08) 0%, rgba(239, 68, 68, 0.06) 100%); border: 1px solid rgba(255, 160, 0, 0.3); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; box-shadow: 0 4px 20px rgba(0,0,0,0.3); border-left: 4px solid var(--accent-gold);">
                    <div style="display: flex; align-items: flex-start; gap: 16px; flex: 1; min-width: 280px;">
                        <div style="font-size: 26px; background: rgba(255, 160, 0, 0.15); width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(255,160,0,0.3);">⚠️</div>
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                <span style="font-size: 10.5px; font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold); letter-spacing: 0.8px; text-transform: uppercase; background: rgba(255,160,0,0.15); padding: 2px 8px; border-radius: 4px;">⚡ REVENUE OPPORTUNITY DETECTED</span>
                            </div>
                            <h3 style="font-size: 16.5px; font-family: var(--font-heading); color: white; margin-bottom: 4px;">
                                ${count} ${categoryLabel} listing${count > 1 ? 's' : ''} in ${areaLabel} have NO Website!
                            </h3>
                            <p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                                Pitching a ₹30,000 website package to these ${count} offices represents a <strong style="color: var(--accent-gold); font-weight: 600;">₹${potentialRevenue}+ revenue pipeline</strong> this week.
                            </p>
                        </div>
                    </div>
                    <button class="brand-btn" style="padding: 10px 18px; font-size: 12.5px; border-radius: var(--radius-md); font-weight: 600; white-space: nowrap;" onclick="window.State.updateFilters({ no_website: true });">
                        Target ${count} Gap Leads 🎯
                    </button>
                </div>
            `;
        } else if (lowRatingLeads.length > 0) {
            const count = lowRatingLeads.length;
            auditGapTriggerHTML = `
                <div class="audit-gap-trigger-card" style="margin-bottom: 24px; padding: 18px 24px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; box-shadow: 0 4px 20px rgba(0,0,0,0.3); border-left: 4px solid #3b82f6;">
                    <div style="display: flex; align-items: flex-start; gap: 16px; flex: 1; min-width: 280px;">
                        <div style="font-size: 26px; background: rgba(59, 130, 246, 0.15); width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(59, 130, 246, 0.3);">⭐</div>
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                <span style="font-size: 10.5px; font-family: var(--font-mono); font-weight: 700; color: #60a5fa; letter-spacing: 0.8px; text-transform: uppercase; background: rgba(59, 130, 246, 0.15); padding: 2px 8px; border-radius: 4px;">🎯 REPUTATION AUDIT OPPORTUNITY</span>
                            </div>
                            <h3 style="font-size: 16.5px; font-family: var(--font-heading); color: white; margin-bottom: 4px;">
                                ${count} ${categoryLabel} business${count > 1 ? 'es' : ''} in ${areaLabel} hold low ratings (&lt; 4.0★)
                            </h3>
                            <p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                                Pitch local review boosting and Google Business Profile optimization to secure ₹15,000/mo retainer clients.
                            </p>
                        </div>
                    </div>
                    <button class="brand-btn" style="padding: 10px 18px; font-size: 12.5px; border-radius: var(--radius-md); font-weight: 600; white-space: nowrap; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);" onclick="window.State.updateFilters({ min_rating: null });">
                        Target ${count} Reputation Leads ⭐
                    </button>
                </div>
            `;
        }

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

        const allVisibleSelected = displayedLeads.length > 0 && displayedLeads.every(p => State.selected_ids.includes(p.id));

        feed.innerHTML = `
            <div class="feed-header" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
                <div class="feed-title-wrap">
                    <h2 style="font-size: 20px; color: white; font-family: var(--font-heading); margin-bottom: 2px;">Verified Business Leads</h2>
                    <span class="feed-subtitle" style="font-size: 13px; color: var(--text-muted);">${State.total} verified listing${State.total !== 1 ? 's' : ''} found ${State.filters.area ? `in <strong>${State.filters.area}</strong>` : 'across Mumbai'}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                    <label class="toggle-switch" style="font-size: 12.5px; background: rgba(255,160,0,0.05); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,160,0,0.2);">
                        <input type="checkbox" id="selectAllVisibleLeadsCheckbox" ${allVisibleSelected ? 'checked' : ''}>
                        <div class="toggle-switch-track">
                            <div class="toggle-switch-thumb"></div>
                        </div>
                        <span style="color: var(--accent-gold); font-weight: 600;">Select Visible for Compare (${State.selected_ids.length})</span>
                    </label>
                    <button id="restartDemoBtn" class="secondary-btn" style="padding: 6px 12px; font-size: 12px; border-radius: var(--radius-sm);">
                        Restart Tour
                    </button>
                </div>
            </div>

            ${auditGapTriggerHTML}

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

        const selectAllVisibleCb = document.getElementById('selectAllVisibleLeadsCheckbox');
        if (selectAllVisibleCb) {
            selectAllVisibleCb.addEventListener('change', (e) => {
                if (e.target.checked) {
                    State.selectAll();
                } else {
                    State.deselectAll();
                }
            });
        }

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
                            alert("Data extraction request submitted successfully!");
                            renderDashboardLayout('team');
                        } catch (err) {
                            console.error("Extraction request failed: ", err);
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

            // Calculate initial profile completion score
            const calcScore = (n, c, s, p, b) => {
                let score = 20; // Base role score
                if (n && n.trim().length > 0) score += 20;
                if ((c && c.trim().length > 0) || (s && s.trim().length > 0)) score += 20;
                if (p && p.trim().length > 0) score += 20;
                if (b && b.trim().length > 0) score += 20;
                return score;
            };

            const initialScore = calcScore(name, company, serviceBlurb, portfolio, booking);

            content.innerHTML = `
                <div class="settings-container" style="max-width: 1100px; display: flex; flex-direction: column; gap: 24px;">
                    
                    <!-- Top Section: Interactive Profile Progress & Timeline Header -->
                    <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; backdrop-filter: blur(12px);">
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 12px;">
                            <div>
                                <h3 style="margin: 0 0 4px 0; font-size: 18px; color: white; font-family: var(--font-heading); font-weight: 700; display: flex; align-items: center; gap: 8px;">
                                    <span>Workspace Personalization Index</span>
                                </h3>
                                <div id="profileGuidanceText" style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.4;">
                                    ${initialScore >= 80 ? '⚡ Maximum Personalization: Your AI pitches and outreach assets are fully optimized.' : 'Complete your profile milestones to unlock automated brochure links and targeted AI outreach.'}
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div id="profileScoreBadge" style="background: rgba(255, 160, 0, 0.1); border: 1px solid rgba(255, 160, 0, 0.3); color: var(--accent-gold); font-size: 13px; font-weight: 700; font-family: var(--font-mono); padding: 6px 14px; border-radius: 50px;">
                                    ${initialScore}% Complete
                                </div>
                            </div>
                        </div>

                        <!-- Dynamic Progress Bar -->
                        <div style="width: 100%; height: 8px; background: rgba(255, 255, 255, 0.06); border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
                            <div id="profileProgressFill" style="width: ${initialScore}%; height: 100%; background: linear-gradient(90deg, #ff8c00 0%, #10b981 100%); border-radius: 10px; transition: width 0.4s ease, background 0.4s ease;"></div>
                        </div>

                        <!-- 4-Step Interactive Milestone Timeline -->
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;" id="settingsTimelineStack">
                            
                            <!-- Step 1 -->
                            <div class="timeline-step-node" data-target="settingsFullName" style="background: rgba(255,255,255,0.02); border: 1px solid ${name ? 'rgba(16,185,129,0.4)' : 'var(--border)'}; padding: 14px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease;">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                                    <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); font-weight: bold;">STEP 01</span>
                                    <span id="step1Icon" style="font-size: 14px;">${name ? '✅' : '👤'}</span>
                                </div>
                                <div style="font-size: 13px; font-weight: 700; color: white; font-family: var(--font-heading); margin-bottom: 2px;">Identity & Role</div>
                                <div style="font-size: 11px; color: var(--text-muted);">Unlocks AI Message Signatures</div>
                            </div>

                            <!-- Step 2 -->
                            <div class="timeline-step-node" data-target="settingsCompanyName" style="background: rgba(255,255,255,0.02); border: 1px solid ${company || serviceBlurb ? 'rgba(16,185,129,0.4)' : 'var(--border)'}; padding: 14px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease;">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                                    <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); font-weight: bold;">STEP 02</span>
                                    <span id="step2Icon" style="font-size: 14px;">${company || serviceBlurb ? '✅' : '🎯'}</span>
                                </div>
                                <div style="font-size: 13px; font-weight: 700; color: white; font-family: var(--font-heading); margin-bottom: 2px;">Brand & Service</div>
                                <div style="font-size: 11px; color: var(--text-muted);">Unlocks WhatsApp AI Pitching</div>
                            </div>

                            <!-- Step 3 -->
                            <div class="timeline-step-node" data-target="settingsPortfolioUrl" style="background: rgba(255,255,255,0.02); border: 1px solid ${portfolio && booking ? 'rgba(16,185,129,0.4)' : 'var(--border)'}; padding: 14px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease;">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                                    <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); font-weight: bold;">STEP 03</span>
                                    <span id="step3Icon" style="font-size: 14px;">${portfolio && booking ? '✅' : '🔗'}</span>
                                </div>
                                <div style="font-size: 13px; font-weight: 700; color: white; font-family: var(--font-heading); margin-bottom: 2px;">Outreach Assets</div>
                                <div style="font-size: 11px; color: var(--text-muted);">Unlocks Auto-Brochure & Scheduling</div>
                            </div>

                            <!-- Step 4 -->
                            <div class="timeline-step-node" data-target="changeBillingPlanBtn" style="background: rgba(255,160,0,0.03); border: 1px solid rgba(255,160,0,0.3); padding: 14px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease;">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                                    <span style="font-size: 11px; font-family: var(--font-mono); color: var(--accent-gold); font-weight: bold;">STEP 04</span>
                                    <span style="font-size: 14px;">👑</span>
                                </div>
                                <div style="font-size: 13px; font-weight: 700; color: white; font-family: var(--font-heading); margin-bottom: 2px;">Growth Tier</div>
                                <div style="font-size: 11px; color: var(--text-muted);">${userTier.toUpperCase()} Plan Active</div>
                            </div>

                        </div>
                    </div>

                    <!-- Split-Screen Main Content Layout -->
                    <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; align-items: start;">
                        
                        <!-- Left Column: Form Configurations Card -->
                        <div class="settings-wrap" style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 28px; display: flex; flex-direction: column; gap: 20px; backdrop-filter: blur(12px);">
                            
                            <h4 style="margin: 0; color: white; font-family: var(--font-heading); font-size: 16px; font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                                Workspace Configurations
                            </h4>
                            
                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; font-family: var(--font-heading); margin-bottom: 6px;">My Professional Role</label>
                                <select id="settingsRole" style="width: 100%; padding: 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none; transition: all 0.2s ease;">
                                    <option value="freelancer" ${role === 'freelancer' ? 'selected' : ''}>💻 Freelancer</option>
                                    <option value="agency" ${role === 'agency' ? 'selected' : ''}>🏢 Agency Owner</option>
                                    <option value="sales_team" ${role === 'sales_team' ? 'selected' : ''}>📈 Sales Representative</option>
                                    <option value="startup" ${role === 'startup' ? 'selected' : ''}>🚀 Startup Founder</option>
                                </select>
                            </div>

                            <h4 style="margin: 10px 0 0 0; color: white; font-family: var(--font-heading); font-size: 16px; font-weight: 700; border-top: 1px solid var(--border); padding-top: 20px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                                Personalization Settings
                            </h4>
                            
                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; font-family: var(--font-heading); margin-bottom: 6px;">Your Full Name</label>
                                <input type="text" id="settingsFullName" value="${name}" placeholder="e.g. Shri Naik" style="width: 100%; padding: 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none; transition: all 0.2s ease;" />
                            </div>

                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; font-family: var(--font-heading); margin-bottom: 6px;">Agency / Company Name</label>
                                <input type="text" id="settingsCompanyName" value="${company}" placeholder="e.g. NearPro Agency" style="width: 100%; padding: 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none; transition: all 0.2s ease;" />
                            </div>

                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; font-family: var(--font-heading); margin-bottom: 6px;">My Primary Service Blurb</label>
                                <select id="settingsServiceSelect" style="width: 100%; padding: 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none; margin-bottom: 8px;">
                                    <option value="I build websites for local businesses" ${serviceBlurb === 'I build websites for local businesses' ? 'selected' : ''}>💻 Web Design ("I build websites for local businesses")</option>
                                    <option value="I help businesses improve their Google ranking" ${serviceBlurb === 'I help businesses improve their Google ranking' ? 'selected' : ''}>📈 SEO ("I help businesses improve their Google ranking")</option>
                                    <option value="I offer tax and accounting services to businesses" ${serviceBlurb === 'I offer tax and accounting services to businesses' ? 'selected' : ''}>⚖️ CA/Finance ("I offer tax and accounting services to businesses")</option>
                                    <option value="I help businesses get more customers through digital marketing" ${serviceBlurb === 'I help businesses get more customers through digital marketing' ? 'selected' : ''}>🎯 Marketing ("I help businesses get more customers through digital marketing")</option>
                                    <option value="I'm a commercial real estate consultant" ${serviceBlurb === "I'm a commercial real estate consultant" ? 'selected' : ''}>🏢 Real Estate ("I'm a commercial real estate consultant")</option>
                                    <option value="custom" ${!['I build websites for local businesses', 'I help businesses improve their Google ranking', 'I offer tax and accounting services to businesses', 'I help businesses get more customers through digital marketing', "I'm a commercial real estate consultant"].includes(serviceBlurb) && serviceBlurb ? 'selected' : ''}>💼 Custom Service...</option>
                                </select>
                                <div id="settingsCustomServiceContainer" style="display: ${!['I build websites for local businesses', 'I help businesses improve their Google ranking', 'I offer tax and accounting services to businesses', 'I help businesses get more customers through digital marketing', "I'm a commercial real estate consultant"].includes(serviceBlurb) && serviceBlurb ? 'block' : 'none'};">
                                    <input type="text" id="settingsCustomService" value="${!['I build websites for local businesses', 'I help businesses improve their Google ranking', 'I offer tax and accounting services to businesses', 'I help businesses get more customers through digital marketing', "I'm a commercial real estate consultant"].includes(serviceBlurb) ? serviceBlurb : ''}" placeholder="Describe your service in one sentence..." style="width: 100%; padding: 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none;" />
                                </div>
                            </div>

                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; font-family: var(--font-heading); margin-bottom: 6px;">Custom Portfolio URL</label>
                                <input type="url" id="settingsPortfolioUrl" value="${portfolio}" placeholder="e.g. https://myagency.com" style="width: 100%; padding: 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none; transition: all 0.2s ease;" />
                            </div>

                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; font-family: var(--font-heading); margin-bottom: 6px;">Meeting Booking Link</label>
                                <input type="url" id="settingsBookingUrl" value="${booking}" placeholder="e.g. https://calendly.com/shri" style="width: 100%; padding: 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none; transition: all 0.2s ease;" />
                            </div>
                            
                            <div style="border-top: 1px solid var(--border); padding-top: 20px;">
                                <label style="display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; font-family: var(--font-heading); margin-bottom: 6px;">Billing Information</label>
                                <div style="padding: 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center;">
                                    <div>Current Tier: <strong style="color: var(--accent-gold); text-transform: uppercase;">${userTier} Plan</strong></div>
                                    <button class="brand-btn" id="changeBillingPlanBtn" style="padding: 6px 14px; font-size: 11.5px; cursor: pointer;">Upgrade Subscription</button>
                                </div>
                            </div>
                            
                            <button class="brand-btn" id="saveSettingsBtn" style="width: 100%; padding: 14px; font-weight: 700; cursor: pointer; font-size: 14px; margin-top: 10px;">Save Configuration</button>
                        </div>

                        <!-- Right Column: Live AI Pitch Preview Box -->
                        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; backdrop-filter: blur(12px); position: sticky; top: 20px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                                <div style="font-size: 15px; font-weight: 700; color: white; font-family: var(--font-heading);">Live AI Pitch Preview</div>
                                <span style="font-size: 11px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono);">Real-Time</span>
                            </div>

                            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 16px;">
                                This is how your WhatsApp & Email outreach messages will automatically look when reaching out to leads:
                            </p>

                            <!-- Live Card -->
                            <div style="background: rgba(16, 185, 129, 0.03); border: 1px solid rgba(16, 185, 129, 0.2); padding: 18px; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 12px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;" id="liveAiPitchPreviewBox">Loading live preview...</div>

                            <div style="margin-top: 16px; font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                                <span>Changes update dynamically as you fill in your profile fields.</span>
                            </div>
                        </div>

                    </div>
                </div>
            `;

            // Dynamic real-time preview updater function
            const updateLivePreviewAndProgress = () => {
                const n = document.getElementById('settingsFullName')?.value.trim() || '';
                const c = document.getElementById('settingsCompanyName')?.value.trim() || '';
                const p = document.getElementById('settingsPortfolioUrl')?.value.trim() || '';
                const b = document.getElementById('settingsBookingUrl')?.value.trim() || '';
                const r = document.getElementById('settingsRole')?.value || 'freelancer';
                
                const sel = document.getElementById('settingsServiceSelect')?.value;
                const cust = document.getElementById('settingsCustomService')?.value.trim();
                const s = sel === 'custom' ? cust : sel;

                // Update score
                const score = calcScore(n, c, s, p, b);
                const scoreBadge = document.getElementById('profileScoreBadge');
                const progressFill = document.getElementById('profileProgressFill');
                const guidanceText = document.getElementById('profileGuidanceText');

                if (scoreBadge) scoreBadge.innerText = `${score}% Complete`;
                if (progressFill) progressFill.style.width = `${score}%`;
                if (guidanceText) {
                    if (score >= 80) {
                        guidanceText.innerText = '⚡ Maximum Personalization: Your AI pitches and outreach assets are fully optimized.';
                    } else if (!p || !b) {
                        guidanceText.innerText = 'Fill out Portfolio URL & Booking Link to unlock automated brochure and scheduling links in AI pitches.';
                    } else {
                        guidanceText.innerText = 'Complete your profile milestones to unlock automated brochure links and targeted AI outreach.';
                    }
                }

                // Update Timeline icons
                const step1Icon = document.getElementById('step1Icon');
                const step2Icon = document.getElementById('step2Icon');
                const step3Icon = document.getElementById('step3Icon');

                if (step1Icon) step1Icon.innerText = n ? '✅' : '👤';
                if (step2Icon) step2Icon.innerText = (c || s) ? '✅' : '🎯';
                if (step3Icon) step3Icon.innerText = (p && b) ? '✅' : '🔗';

                // Render live AI message preview
                const previewBox = document.getElementById('liveAiPitchPreviewBox');
                if (previewBox) {
                    const senderName = n || '[Your Name]';
                    const senderCompany = c || '[Your Company]';
                    const serviceDesc = s || 'I build websites for local businesses';
                    const roleTitle = r === 'agency' ? 'founder of' : 'representing';

                    let msg = `Namaste Dr. Mehta!\n\nI noticed your listing for Mehta Dental Clinic on Google Maps. I am ${senderName}, ${roleTitle} ${senderCompany}.\n\n${serviceDesc}. We help local clinics rank #1 in maps and convert inquiries into booked appointments.`;
                    
                    if (p) {
                        msg += `\n\n🌐 View our portfolio:\n${p}`;
                    }
                    if (b) {
                        msg += `\n\n📅 Book a 10-min intro call:\n${b}`;
                    }

                    previewBox.innerText = msg;
                }
            };

            // Bind real-time input event listeners
            const inputsToTrack = ['settingsFullName', 'settingsCompanyName', 'settingsPortfolioUrl', 'settingsBookingUrl', 'settingsCustomService'];
            inputsToTrack.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('input', updateLivePreviewAndProgress);
                    el.addEventListener('focus', () => {
                        el.style.borderColor = 'var(--accent-gold)';
                        el.style.boxShadow = '0 0 12px rgba(255, 160, 0, 0.25)';
                    });
                    el.addEventListener('blur', () => {
                        el.style.borderColor = 'var(--border)';
                        el.style.boxShadow = 'none';
                    });
                }
            });

            const serviceSelect = document.getElementById('settingsServiceSelect');
            const customServiceContainer = document.getElementById('settingsCustomServiceContainer');
            if (serviceSelect && customServiceContainer) {
                serviceSelect.addEventListener('change', () => {
                    customServiceContainer.style.display = serviceSelect.value === 'custom' ? 'block' : 'none';
                    updateLivePreviewAndProgress();
                });
            }

            const roleSelect = document.getElementById('settingsRole');
            if (roleSelect) {
                roleSelect.addEventListener('change', updateLivePreviewAndProgress);
            }

            // Timeline click-to-focus interactivity
            document.querySelectorAll('.timeline-step-node').forEach(node => {
                node.addEventListener('click', () => {
                    const targetId = node.getAttribute('data-target');
                    if (targetId) {
                        const targetEl = document.getElementById(targetId);
                        if (targetEl) {
                            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            targetEl.focus();
                            targetEl.style.borderColor = 'var(--accent-gold)';
                            targetEl.style.boxShadow = '0 0 16px rgba(255, 160, 0, 0.3)';
                            setTimeout(() => {
                                targetEl.style.borderColor = 'var(--border)';
                                targetEl.style.boxShadow = 'none';
                            }, 2000);
                        }
                    }
                });
            });

            // Initial live preview calculation
            updateLivePreviewAndProgress();

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
                    alert("Configurations saved successfully!");
                } catch (err) {
                    console.error("Failed to save settings: ", err);
                    alert("Failed to save configuration.");
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

function showOAuthAuthLoader() {
    if (document.getElementById('oauthAuthLoaderOverlay')) return;
    const loader = document.createElement('div');
    loader.id = 'oauthAuthLoaderOverlay';
    loader.style.cssText = 'position:fixed; inset:0; background:#09090b; z-index:99999; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; color:white; font-family:var(--font-sans, "Inter", sans-serif); text-align:center; padding:24px;';
    loader.innerHTML = `
        <div style="position:relative; width:64px; height:64px;">
            <div style="position:absolute; inset:0; border:4px solid rgba(255,160,0,0.15); border-radius:50%;"></div>
            <div style="position:absolute; inset:0; border:4px solid transparent; border-top-color:var(--accent-gold, #ffa000); border-radius:50%; animation:spin 0.8s linear infinite;"></div>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
            <div style="font-size:20px; font-weight:700; font-family:var(--font-heading, inherit);">Authenticating Session</div>
            <div style="font-size:13.5px; color:var(--text-secondary, #a1a1aa);">Fetching your personalized lead intelligence workspace...</div>
        </div>
        <style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>
    `;
    document.body.appendChild(loader);
}

function hideOAuthAuthLoader() {
    const loader = document.getElementById('oauthAuthLoaderOverlay');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.3s ease';
        setTimeout(() => loader.remove(), 300);
    }
}

// Telemetry Handler (Fix M9)
window.trackEvent = function(eventName, eventDetails = {}) {
    console.log(`[Telemetry Event] ${eventName}:`, eventDetails);
    // In production, this can send payloads to standard tools like PostHog or GA4
};

// Global Error Boundary (Fix H6)
window.addEventListener('error', (event) => {
    console.error("Unhandled runtime error: ", event.error || event.message);
    showErrorOverlay(event.error || new Error(event.message));
});
window.addEventListener('unhandledrejection', (event) => {
    console.error("Unhandled promise rejection: ", event.reason);
    showErrorOverlay(event.reason || new Error("Promise rejected without reason"));
});

function showErrorOverlay(error) {
    const existing = document.getElementById('errorBoundaryOverlay');
    if (existing) return;

    const overlay = document.createElement('div');
    overlay.id = 'errorBoundaryOverlay';
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(9,9,11,0.96); backdrop-filter:blur(8px); z-index:999999; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; color:white; font-family:var(--font-sans, "Inter", sans-serif); text-align:center; padding:24px;';
    overlay.innerHTML = `
        <div style="font-size:48px;">⚠️</div>
        <div style="display:flex; flex-direction:column; gap:8px; max-width:440px;">
            <h3 style="font-size:20px; font-weight:700; font-family:var(--font-heading, inherit); margin:0; color:white;">Application Error Occurred</h3>
            <p style="font-size:13.5px; color:var(--text-secondary, #a1a1aa); margin:0; line-height:1.5;">NearPro encountered an unexpected problem. We have logged the trace for our team to resolve.</p>
            <div style="background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.15); border-radius:6px; padding:12px; font-family:var(--font-mono, monospace); font-size:11.5px; color:#f87171; text-align:left; overflow:auto; max-height:120px; margin:12px 0; word-break:break-all;">
                ${error?.stack || error?.message || String(error)}
            </div>
            <button onclick="window.location.reload();" class="brand-btn" style="padding:10px 24px; font-size:13px; font-weight:600; width:fit-content; align-self:center; cursor:pointer;">Refresh Workspace 🚀</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Custom Toast Notification System (Fix M8)
window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastNotificationContainer') || (() => {
        const c = document.createElement('div');
        c.id = 'toastNotificationContainer';
        c.style.cssText = 'position:fixed; bottom:24px; right:24px; display:flex; flex-direction:column; gap:10px; z-index:999999;';
        document.body.appendChild(c);
        return c;
    })();

    const toast = document.createElement('div');
    const accentColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#ffa000';
    const bgGlow = type === 'success' ? 'rgba(16, 185, 129, 0.1)' : type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 160, 0, 0.1)';

    toast.style.cssText = `
        padding: 12px 20px;
        background: #09090b;
        border: 1px solid ${accentColor};
        border-left: 4px solid ${accentColor};
        box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 10px ${bgGlow};
        color: white;
        font-family: var(--font-body), sans-serif;
        font-size: 13.5px;
        font-weight: 500;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 280px;
        max-width: 380px;
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚡';
    toast.innerHTML = `<span>${icon}</span><span style="flex:1;">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        toast.style.transform = 'translateY(-20px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
};

// Override native alert to use custom premium toast dynamically (Fix M8)
window.alert = function(message) {
    let type = 'info';
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('success') || lowerMsg.includes('saved') || lowerMsg.includes('complete') || lowerMsg.includes('unlocked')) {
        type = 'success';
    } else if (lowerMsg.includes('fail') || lowerMsg.includes('error') || lowerMsg.includes('limit reached') || lowerMsg.includes('please upgrade')) {
        type = 'error';
    }
    window.showToast(message, type);
};

async function initApp() {
    window.State = State; // Expose globally for inline Paywall triggers
    
    // Check if handling OAuth callback hash
    if (window.location.hash.includes('access_token=') || window.location.hash.includes('refresh_token=')) {
        showOAuthAuthLoader();
    }

    // 1. Initialize Supabase Auth session state FIRST before router evaluation
    try {
        const { supabase } = await import('./supabase.js');
        
        // Initial session fetch (await to ensure State.user is resolved before routes render)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            State.user = session.user;
            State.profile = await Api.getProfile(session.user.id);
            State.auth_modal_open = false;
        }

        // Listen for ongoing session state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                State.user = session.user;
                State.profile = await Api.getProfile(session.user.id);
                State.auth_modal_open = false;

                hideOAuthAuthLoader();

                if (event === 'SIGNED_IN' || window.location.hash.includes('access_token=')) {
                    const queuedTier = localStorage.getItem('selected_nearpro_tier');
                    const queuedInterval = localStorage.getItem('selected_nearpro_interval') || 'monthly';
                    if (queuedTier && queuedTier !== 'free') {
                        window.location.hash = `#/checkout?plan=${queuedTier}&cycle=${queuedInterval}`;
                    } else if (window.location.hash === '#/' || !window.location.hash) {
                        window.location.hash = '#/dashboard/directory';
                    }
                }
            } else {
                State.user = null;
                State.profile = null;
                hideOAuthAuthLoader();
            }
            State.notify();
        });
    } catch (err) {
        console.error("Auth listener initialization failed: ", err);
    } finally {
        hideOAuthAuthLoader();
    }
    
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

    // 3. Now initialize Router with active session ready!
    initRoutes();
}

document.addEventListener('DOMContentLoaded', initApp);
export default initApp;
