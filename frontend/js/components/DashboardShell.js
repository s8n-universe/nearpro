import { State } from '../state.js';
import { hasAccess, getUserTier, TIER_NAMES } from '../auth.js';

export function renderDashboardShell(activeTab = 'crm') {
    const userTier = getUserTier();
    const tierName = TIER_NAMES[userTier] || 'Explorer';
    const userEmail = State.user?.email || 'user@nearpro.in';

    // Extract user's display name (Profile full_name -> Google user_metadata full_name -> Email)
    const displayName = State.profile?.full_name?.trim() || State.user?.user_metadata?.full_name?.trim() || userEmail;
    const initials = displayName ? displayName[0].toUpperCase() : 'U';

    // Tier color logic
    let tierColor = '#71717a'; // Zinc / Free
    if (userTier === 'scout') {
        tierColor = '#ffa000'; // Gold
    } else if (userTier === 'hunter') {
        tierColor = '#f59e0b'; // Amber
    } else if (userTier === 'agency') {
        tierColor = '#ec4899'; // Pink
    }

    // Sidebar items configuration
    // Sidebar items configuration
    const sidebarItems = [
        { id: 'directory', label: 'Browse Directory', requiredTier: 'free', icon: 'search' },
        { id: 'crm', label: 'Outreach Pipeline', requiredTier: 'scout', icon: 'clipboard-list' },
        { id: 'lists', label: 'Smart Lists', requiredTier: 'scout', icon: 'folder' },
        { id: 'proposals', label: 'PDF Proposals', requiredTier: 'scout', icon: 'file-text' },
        { id: 'documents', label: 'Documents Library', requiredTier: 'scout', icon: 'paperclip' },
        { id: 'audit', label: 'Business Health Check', requiredTier: 'scout', icon: 'activity' },
        { id: 'outreach', label: 'AI Outreach Studio', requiredTier: 'scout', icon: 'send' },
        { id: 'prompts', label: 'Website Prompt Engine', requiredTier: 'scout', icon: 'zap' },
        { id: 'integrations', label: 'Connection Hub', requiredTier: 'scout', icon: 'plug' },
        { id: 'team', label: 'Team Workspace', requiredTier: 'scout', icon: 'users' },
        { id: 'settings', label: 'Settings', requiredTier: 'free', icon: 'settings' }
    ];

    const sidebarHTML = sidebarItems.map(item => {
        const isUnlocked = hasAccess(userTier, item.requiredTier);
        const isActive = activeTab === item.id;
        const activeClass = isActive ? 'active' : '';
        const lockIcon = isUnlocked ? '' : '<i data-lucide="lock" class="nav-lock" style="width:11px; height:11px; margin-left:auto; stroke-width:2.5px; opacity:0.6;"></i>';
        const arrowIcon = item.id === 'directory' ? '<i data-lucide="chevron-right" class="nav-arrow" style="width:14px; height:14px; margin-left:auto; stroke-width:2.5px; opacity:0.7;"></i>' : '';
        
        // Navigation targets
        const href = `#/dashboard/${item.id}`;

        return `
            <a href="${isUnlocked ? href : 'javascript:void(0)'}" 
               class="dashboard-nav-item ${activeClass} ${isUnlocked ? '' : 'locked'}" 
               data-id="${item.id}"
               data-required="${item.requiredTier}">
                <i data-lucide="${item.icon}" class="nav-icon" style="width:18px; height:18px; stroke-width:2px; flex-shrink:0;"></i>
                <span class="nav-label">${item.label}</span>
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
                <div class="sidebar-header">
                    <img src="/NearPro_logo_nobg.png" alt="NearPro" class="sidebar-logo">
                    <span class="sidebar-brand">NearPro Workspace</span>
                </div>
                
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
                    <div class="topbar-right">
                        <div class="user-profile-dropdown-container" style="position: relative; display: inline-block;">
                            <div class="user-profile-badge" style="cursor: pointer; display: flex; align-items: center; gap: 10px;">
                                <span class="user-avatar-circle" style="width: 32px; height: 32px; border-radius: 50%; background: ${tierColor}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; text-transform: uppercase; font-family: var(--font-mono);">${initials}</span>
                                <div class="user-meta-info" style="display: flex; flex-direction: column; align-items: flex-start;">
                                    <span class="user-email" style="font-size: 13.5px; font-weight: 600; color: #ffffff; display: flex; align-items: center; gap: 4px;">
                                        ${displayName}
                                        <i data-lucide="chevron-down" style="width:14px; height:14px; opacity:0.7;"></i>
                                    </span>
                                    <span class="tier-tag ${userTier}" style="font-size: 11px; font-family: var(--font-mono); font-weight: 700; color: ${tierColor};">${tierName} Plan</span>
                                </div>
                            </div>
                            <!-- Dropdown Menu -->
                            <div class="dashboard-profile-dropdown" style="position: absolute; right: 0; top: 46px; width: 220px; background: #0f172a; border: 1px solid #334155; border-radius: var(--radius-md, 8px); padding: 14px; display: none; flex-direction: column; gap: 10px; z-index: 99999; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5); text-align: left;">
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 11px; font-family: var(--font-mono); color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Account</span>
                                    <span style="font-size: 13px; color: #f8fafc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${userEmail}">${userEmail}</span>
                                </div>
                                <hr style="border: none; border-top: 1px solid #334155; margin: 4px 0;">
                                <a href="#/dashboard/settings" style="font-size: 13px; color: #cbd5e1; text-decoration: none; display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.background='#1e293b'; this.style.color='#ffffff'" onmouseout="this.style.background='transparent'; this.style.color='#cbd5e1'">
                                    ⚙️ Settings Profile
                                </a>
                                <button id="dashboardSignOutBtn" class="secondary-btn" style="width: 100%; padding: 8px; font-size: 12.5px; border-radius: var(--radius-sm); border-color: rgba(239, 68, 68, 0.3); color: #f87171; background: rgba(239, 68, 68, 0.08); text-align: center; justify-content: center; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.15)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.08)'">
                                    🚪 Sign Out
                                </button>
                            </div>
                        </div>
                        <style>
                            .user-profile-dropdown-container:hover .dashboard-profile-dropdown {
                                display: flex !important;
                            }
                        </style>
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
            <div id="surveyModalPlaceholder"></div>
            <div id="personalizationModalPlaceholder"></div>
            <div id="upgradeModalPlaceholder"></div>
            <div id="checkoutConsentModalPlaceholder"></div>
            <div id="upgradeSuccessModalPlaceholder"></div>
        </div>
    `;
}

export function bindDashboardShellEvents() {
    // Process Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

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
}
