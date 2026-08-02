import { State } from '../state.js';
import { hasAccess, getUserTier, TIER_NAMES } from '../auth.js';

export function renderDashboardShell(activeTab = 'crm') {
    const userTier = getUserTier();
    const userEmail = State.user ? (State.user.email || '') : '';
    
    // Force display Explorer plan for nearproadmin@gmail.com in testing environment
    let displayTier = userTier;
    if (userEmail === 'nearproadmin@gmail.com') {
        displayTier = 'free';
    }
    
    const tierName = TIER_NAMES[displayTier] || 'Explorer';

    // Extract user's display name (Profile full_name -> Google user_metadata full_name -> Email)
    const displayName = State.user ? (State.profile?.full_name?.trim() || State.user?.user_metadata?.full_name?.trim() || userEmail) : 'Guest User';
    const initials = State.user ? (displayName ? displayName[0].toUpperCase() : 'U') : 'G';

    // Tier color logic
    let tierColor = '#71717a'; // Zinc / Free
    if (displayTier === 'scout') {
        tierColor = '#ffa000'; // Gold
    } else if (displayTier === 'hunter') {
        tierColor = '#f59e0b'; // Amber
    } else if (displayTier === 'agency') {
        tierColor = '#ec4899'; // Pink
    }

    // Sidebar items configuration
    const isAdmin = State.user?.email === 'nearproadmin@gmail.com';
    const sidebarItems = [
        { id: 'overview', label: 'Getting Started', requiredTier: 'free', icon: 'compass' },
        { id: 'crm', label: '🤖 360° AI Deal Hub', requiredTier: 'free', icon: 'clipboard-list' },
        { id: 'directory', label: 'Browse Directory', requiredTier: 'free', icon: 'search' },
        { id: 'lists', label: 'Smart Lists', requiredTier: 'free', icon: 'folder' },
        
        // V2 Gated Features
        { id: 'sequences', label: 'Email Sequences', requiredTier: 'scout', icon: 'git-branch', flag: 'email_sequences' },
        { id: 'deliverability', label: 'Deliverability Hub', requiredTier: 'scout', icon: 'shield-check', flag: 'email_warmup' },
        { id: 'enrichment', label: 'Data Enrichment', requiredTier: 'scout', icon: 'database', flag: 'waterfall_enrichment' },
        { id: 'plugins', label: 'Plugin Marketplace', requiredTier: 'free', icon: 'puzzle', flag: 'mcp_plugins' },
        { id: 'signals', label: '🔥 Intent Signals', requiredTier: 'scout', icon: 'trending-up', flag: 'intent_signals' },
        { id: 'voice-agent', label: 'AI Voice Agent', requiredTier: 'hunter', icon: 'phone-call', flag: 'voice_calling' },
        
        { id: 'proposals', label: 'PDF Proposals', requiredTier: 'free', icon: 'file-text' },
        { id: 'call-scripts', label: 'Tele-Sales Scripts', requiredTier: 'free', icon: 'phone-call' },
        { id: 'documents', label: 'Documents Library', requiredTier: 'free', icon: 'paperclip' },
        { id: 'audit', label: 'Business Health Check', requiredTier: 'free', icon: 'activity' },
        { id: 'outreach', label: 'AI Outreach Studio', requiredTier: 'free', icon: 'send' },
        { id: 'prompts', label: 'Website Prompt Engine', requiredTier: 'free', icon: 'zap' },
        { id: 'integrations', label: 'Connection Hub', requiredTier: 'scout', icon: 'plug' },
        { id: 'team', label: 'Team Workspace', requiredTier: 'free', icon: 'users' },
        { id: 'settings', label: 'Settings', requiredTier: 'free', icon: 'settings' }
    ];

    if (isAdmin) {
        sidebarItems.push({ id: 'admin', label: '🛠️ S8N Control Center', requiredTier: 'free', icon: 'shield' });
    }

    const filteredSidebarItems = sidebarItems.filter(item => {
        if (!item.flag) return true;
        return (State.featureFlags && State.featureFlags[item.flag] === true) || isAdmin;
    });

    const sidebarHTML = filteredSidebarItems.map(item => {
        const isLocalTesting = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isUnlocked = hasAccess(userTier, item.requiredTier) || isLocalTesting || userEmail === 'nearproadmin@gmail.com';
        const isActive = activeTab === item.id;
        const activeClass = isActive ? 'active' : '';
        const lockIcon = isUnlocked ? '' : '<i data-lucide="lock" class="nav-lock" style="width:11px; height:11px; margin-left:auto; stroke-width:2.5px; opacity:0.6;"></i>';
        const arrowIcon = item.id === 'directory' ? '<i data-lucide="chevron-right" class="nav-arrow" style="width:14px; height:14px; margin-left:auto; stroke-width:2.5px; opacity:0.7;"></i>' : '';
        
        // Navigation targets
        const href = `#/dashboard/${item.id}`;
                let badge = '';
        if (item.id === 'settings') {
            badge = `<span class="new-feature-badge" style="margin-left: 6px; font-size: 8.5px; font-weight: 800; color: #78350f; background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); padding: 1.5px 5px; border-radius: 99px; text-transform: uppercase; font-family: var(--font-mono, monospace); line-height: 1;">NEW</span>`;
        } else if (item.flag && State.featureFlags && State.featureFlags[item.flag] === true) {
            const dismissed = localStorage.getItem(`dismissed_badge_${item.id}`);
            if (!dismissed) {
                badge = `<span class="new-feature-badge" style="margin-left: 6px; font-size: 8.5px; font-weight: 800; color: #ffffff; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 1.5px 5px; border-radius: 99px; text-transform: uppercase; font-family: var(--font-mono, monospace); line-height: 1;">NEW</span>`;
            }
        }
        return `
            <a href="${isUnlocked ? href : 'javascript:void(0)'}" 
               class="dashboard-nav-item ${activeClass} ${isUnlocked ? '' : 'locked'}" 
               data-id="${item.id}"
               data-required="${item.requiredTier}">
                <i data-lucide="${item.icon}" class="nav-icon" style="width:18px; height:18px; stroke-width:2px; flex-shrink:0;"></i>
                <span class="nav-label" style="display: flex; align-items: center;">${item.label}${badge}</span>
                ${arrowIcon || lockIcon}
            </a>
        `;
    }).join('');

    // Render smart upgrade button or active badge based on current user tier
    let upgradeButtonHTML = '';
    if (userTier === 'free') {
        upgradeButtonHTML = `
            <button class="brand-btn upgrade-cta" onclick="window.State.setPricingModal(true)" style="width: 100%; padding: 10px; font-weight: 700; font-size: 13px;">
                Upgrade to Scout (₹499)
            </button>
        `;
    } else if (userTier === 'scout') {
        upgradeButtonHTML = `
            <button class="brand-btn upgrade-cta" onclick="window.State.setPricingModal(true)" style="width: 100%; padding: 10px; font-weight: 700; font-size: 13px;">
                Upgrade to Hunter (₹999)
            </button>
        `;
    } else if (userTier === 'hunter') {
        upgradeButtonHTML = `
            <button class="brand-btn upgrade-cta" onclick="window.State.setPricingModal(true)" style="width: 100%; padding: 10px; font-weight: 700; font-size: 13px;">
                Upgrade to Agency (₹2499)
            </button>
        `;
    } else if (userTier === 'agency' || userTier === 'enterprise') {
        upgradeButtonHTML = `
            <div style="padding: 10px; background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: var(--radius-sm); color: #ec4899; font-size: 12px; font-family: var(--font-mono); font-weight: 700; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">
                👑 AGENCY PLAN ACTIVE
            </div>
        `;
    }

    const isMainCollapsed = State.dashboard_sidebar_collapsed;
    const sidebarCollapsedClass = isMainCollapsed ? 'collapsed' : '';

    return `
        <div class="dashboard-shell">
            <aside class="dashboard-sidebar ${sidebarCollapsedClass}">
                <a href="#/" class="sidebar-header" style="text-decoration: none; color: inherit; cursor: pointer; display: flex; flex-direction: column; align-items: flex-start; gap: 4px;" title="Go to NearPro Marketing Homepage">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="/NearPro_logo_nobg.png" alt="NearPro" class="sidebar-logo">
                        <span class="sidebar-brand" style="font-size: 13px; font-weight: 800; font-family: var(--font-heading);">NearPro™ • AI Agency OS</span>
                    </div>
                    <span class="sidebar-version-badge" style="font-size: 9px; color: var(--text-muted); font-family: var(--font-mono); margin-left: 40px; background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">v1.0.0 (Launch Version)</span>
                </a>
                
                <nav class="sidebar-nav">
                    ${sidebarHTML}
                </nav>
                
                <div class="sidebar-footer">
                    ${upgradeButtonHTML}
                </div>
            </aside>
            
            <div class="dashboard-main">
                <header class="dashboard-topbar">
                    <div class="topbar-left" style="display: flex; align-items: center; gap: 16px;">
                        <button id="toggleMainSidebarBtn" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 20px; padding: 4px; display: flex; align-items: center; justify-content: center; outline: none; transition: transform 0.2s;" title="Toggle Sidebar">
                            <i data-lucide="menu" style="width:20px; height:20px; stroke-width:2px;"></i>
                        </button>
                        <h2 class="dashboard-page-title" id="dashboardPageTitle" style="margin: 0;">Dashboard</h2>
                    </div>
                    <div class="topbar-right" style="display: flex; align-items: center; gap: 16px;">
                        <!-- Prominent Topbar Quick Launch to 360° AI Deal Workstation -->
                        <a href="${State.user ? '#/dashboard/crm' : '#/dashboard/overview'}" id="topbarWorkstationLink" class="brand-btn" style="padding: 8px 18px; font-size: 12.5px; font-weight: 800; background: #2563eb; color: white; border: none; border-radius: 6px; text-decoration: none; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                            <i data-lucide="zap" style="width: 14px; height: 14px;"></i> Open 360° AI Workstation ➔
                        </a>

                        ${State.user ? `
                        <div class="user-profile-dropdown-container" style="position: relative; display: inline-block; padding-bottom: 14px; margin-bottom: -14px;">
                            <div class="user-profile-badge" id="dashboardUserProfileBtn" style="cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 6px 12px; border-radius: 8px; background: #ffffff; border: 1px solid #cbd5e1; transition: all 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#ffffff'">
                                <span class="user-avatar-circle" style="width: 28px; height: 28px; border-radius: 50%; background: ${tierColor}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; text-transform: uppercase; font-family: var(--font-mono); font-size: 12px;">${initials}</span>
                                <div class="user-meta-info" style="display: flex; flex-direction: column; align-items: flex-start;">
                                    <span class="user-email" style="font-size: 12.5px; font-weight: 600; color: #0f172a; display: flex; align-items: center; gap: 4px; line-height: 1.2;">
                                        ${displayName}
                                        <i data-lucide="chevron-down" style="width:12px; height:12px; opacity:0.7;"></i>
                                    </span>
                                    <span class="tier-tag ${displayTier}" style="font-size: 9.5px; font-family: var(--font-mono); font-weight: 700; color: ${tierColor}; line-height: 1.2;">${tierName.toUpperCase()} PLAN</span>
                                </div>
                            </div>
                            <!-- Dropdown Menu with Hover Bridge -->
                            <div class="dashboard-profile-dropdown" id="dashboardProfileDropdownMenu" style="position: absolute; right: 0; top: calc(100% - 6px); width: 230px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: var(--radius-md, 8px); padding: 14px; display: none; flex-direction: column; gap: 10px; z-index: 99999; box-shadow: 0 10px 25px rgba(0,0,0,0.08); text-align: left;">
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 11px; font-family: var(--font-mono); color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Account</span>
                                    <span style="font-size: 13px; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${userEmail}">${userEmail}</span>
                                </div>
                                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 4px 0;">
                                <a href="#/dashboard/settings" style="font-size: 13px; color: #0f172a; text-decoration: none; display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 6px; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'; this.style.color='#0f172a'" onmouseout="this.style.background='transparent'; this.style.color='#0f172a'">
                                    ⚙️ Settings Profile
                                </a>
                                <button id="dashboardSignOutBtn" class="secondary-btn" style="width: 100%; padding: 8px 10px; font-size: 12.5px; border-radius: var(--radius-sm); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; background: rgba(239, 68, 68, 0.08); text-align: center; justify-content: center; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.08)'">
                                    🚪 Sign Out
                                </button>
                            </div>
                        </div>
                        <style>
                            .dashboard-profile-dropdown::before {
                                content: '';
                                position: absolute;
                                top: -20px;
                                left: 0;
                                right: 0;
                                height: 24px;
                                background: transparent;
                            }
                            .user-profile-dropdown-container:hover .dashboard-profile-dropdown,
                            .user-profile-dropdown-container.open .dashboard-profile-dropdown,
                            .dashboard-profile-dropdown:hover {
                                display: flex !important;
                            }
                        </style>
                        ` : `
                        <button class="brand-btn" onclick="window.State.setAuthModal(true);" style="padding: 8px 18px; font-size: 13px; font-weight: 700; background: linear-gradient(135deg, var(--accent-gold), #ea580c); color: white; border: none; border-radius: 6px; cursor: pointer;">
                            Login
                        </button>
                        `}
                    </div>
                </header>
                
                <div class="dashboard-content-area ${activeTab === 'crm' ? 'crm-active' : ''}" id="dashboardContent">
                    <!-- Dynamic Dashboard Module Renders Here -->
                    <div class="dashboard-loading">
                        <div class="spinner"></div>
                        <p>Loading module...</p>
                    </div>
            </div>
            
            <!-- Global Upgrade Modal Overlay -->
            <div id="authModalPlaceholder"></div>
            <div id="pricingModalPlaceholder"></div>
            <div id="explorerPlanModalPlaceholder"></div>
            <div id="surveyModalPlaceholder"></div>
            <div id="personalizationModalPlaceholder"></div>
            <div id="upgradeModalPlaceholder"></div>
            <div id="checkoutConsentModalPlaceholder"></div>
            <div id="upgradeSuccessModalPlaceholder"></div>
            <div id="cancelSubscriptionModalPlaceholder"></div>
        </div>
    `;
}

export function bindDashboardShellEvents() {
    // Process Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    if (!State.user) {
        // Guest user override: Clicking any sidebar tab except Browse Directory & Getting Started shows the Explorer Plan Modal
        const allItems = document.querySelectorAll('.dashboard-nav-item');
        allItems.forEach(item => {
            const tabId = item.getAttribute('data-id');
            if (tabId !== 'directory' && tabId !== 'overview') {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    State.setExplorerPlanModal(true);
                });
            }
        });

        const upgradeCta = document.querySelector('.upgrade-cta');
        if (upgradeCta) {
            upgradeCta.removeAttribute('onclick');
            upgradeCta.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                State.setExplorerPlanModal(true);
            });
        }
    } else {
        const navItems = document.querySelectorAll('.dashboard-nav-item.locked');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const requiredTier = item.getAttribute('data-required');
                const label = item.querySelector('.nav-label').innerText;
                
                // Trigger upgrade modal
                import('../auth.js').then(auth => {
                    auth.showUpgradeModal({
                        feature: label,
                        requiredTier: requiredTier,
                        headline: `Unlock ${label}`,
                        description: `Get full access to the ${label} module by upgrading to the ${requiredTier.toUpperCase()} tier.`
                    });
                });
            });
        });
    }

    const profileBtn = document.getElementById('dashboardUserProfileBtn');
    const profileContainer = document.querySelector('.user-profile-dropdown-container');
    if (profileBtn && profileContainer) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileContainer.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (!profileContainer.contains(e.target)) {
                profileContainer.classList.remove('open');
            }
        });
    }

    const signOutBtn = document.getElementById('dashboardSignOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            try {
                window._isSigningOut = true;
                const { Api } = await import('../api.js');
                await Api.signOut();
            } catch (err) {
                console.error("Dashboard sign out failed: ", err);
                window._isSigningOut = false;
            }
        });
    }

    const toggleBtn = document.getElementById('toggleMainSidebarBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const sidebar = document.querySelector('.dashboard-sidebar');
            if (sidebar) {
                const willCollapse = !sidebar.classList.contains('collapsed');
                if (willCollapse) {
                    sidebar.classList.add('collapsed');
                    State.dashboard_sidebar_collapsed = true;
                    localStorage.setItem('nearpro_dashboard_sidebar_collapsed', 'true');
                } else {
                    sidebar.classList.remove('collapsed');
                    State.dashboard_sidebar_collapsed = false;
                    localStorage.setItem('nearpro_dashboard_sidebar_collapsed', 'false');
                }
            }
        });
    }

    // Autohealing: Listen to clicks on active nav items to dynamically dismiss "NEW" badges
    const activeNavs = document.querySelectorAll('.dashboard-nav-item:not(.locked)');
    activeNavs.forEach(nav => {
        nav.addEventListener('click', () => {
            const tabId = nav.getAttribute('data-id');
            if (tabId) {
                localStorage.setItem(`dismissed_badge_${tabId}`, 'true');
                const badge = nav.querySelector('.new-feature-badge');
                if (badge && tabId !== 'settings') {
                    badge.remove();
                }
            }
        });
    });
}
