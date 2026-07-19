import { State } from '../state.js';
import { hasAccess, getUserTier, TIER_NAMES } from '../auth.js';

export function renderDashboardShell(activeTab = 'crm') {
    const userTier = getUserTier();
    const tierName = TIER_NAMES[userTier] || 'Explorer';
    const userEmail = State.user?.email || 'user@nearpro.in';

    // Sidebar items configuration
    // Sidebar items configuration
    const sidebarItems = [
        { id: 'directory', label: 'Browse Directory', requiredTier: 'free', icon: 'search' },
        { id: 'crm', label: 'Outreach Pipeline', requiredTier: 'scout', icon: 'clipboard-list' },
        { id: 'lists', label: 'Smart Lists', requiredTier: 'scout', icon: 'folder' },
        { id: 'documents', label: 'Documents Library', requiredTier: 'scout', icon: 'paperclip' },
        { id: 'audit', label: 'Business Health Check', requiredTier: 'hunter', icon: 'activity' },
        { id: 'outreach', label: 'AI Outreach Studio', requiredTier: 'hunter', icon: 'send' },
        { id: 'prompts', label: 'Website Prompt Engine', requiredTier: 'agency', icon: 'zap' },
        { id: 'integrations', label: 'Connection Hub', requiredTier: 'agency', icon: 'plug' },
        { id: 'team', label: 'Team Workspace', requiredTier: 'agency', icon: 'users' },
        { id: 'settings', label: 'Settings', requiredTier: 'free', icon: 'settings' }
    ];

    const sidebarHTML = sidebarItems.map(item => {
        const isUnlocked = hasAccess(userTier, item.requiredTier);
        const isActive = activeTab === item.id;
        const activeClass = isActive ? 'active' : '';
        const lockIcon = isUnlocked ? '' : '<i data-lucide="lock" class="nav-lock" style="width:11px; height:11px; margin-left:auto; stroke-width:2.5px; opacity:0.6;"></i>';
        
        // Navigation targets
        const href = `#/dashboard/${item.id}`;

        return `
            <a href="${isUnlocked ? href : 'javascript:void(0)'}" 
               class="dashboard-nav-item ${activeClass} ${isUnlocked ? '' : 'locked'}" 
               data-id="${item.id}"
               data-required="${item.requiredTier}">
                <i data-lucide="${item.icon}" class="nav-icon" style="width:18px; height:18px; stroke-width:2px; flex-shrink:0;"></i>
                <span class="nav-label">${item.label}</span>
                ${lockIcon}
            </a>
        `;
    }).join('');

    // Render upgrade button if user can upgrade
    const isAgencyOrEnterprise = hasAccess(userTier, 'agency');
    const upgradeButtonHTML = !isAgencyOrEnterprise ? `
        <button class="brand-btn upgrade-cta" onclick="window.State.setPricingModal(true)">
            Upgrade Plan
        </button>
    ` : '';

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
                        <div class="user-profile-badge">
                            <span class="user-avatar-circle">${userEmail[0].toUpperCase()}</span>
                            <div class="user-meta-info">
                                <span class="user-email">${userEmail}</span>
                                <span class="tier-tag ${userTier}">${tierName} Plan</span>
                            </div>
                        </div>
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
