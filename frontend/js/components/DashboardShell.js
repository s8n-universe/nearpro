import { State } from '../state.js';
import { hasAccess, getUserTier, TIER_NAMES } from '../auth.js';

export function renderDashboardShell(activeTab = 'crm') {
    const userTier = getUserTier();
    const tierName = TIER_NAMES[userTier] || 'Explorer';
    const userEmail = State.user?.email || 'user@nearpro.in';

    // Sidebar items configuration
    const sidebarItems = [
        { id: 'directory', label: 'Browse Directory', requiredTier: 'free', icon: '🔍' },
        { id: 'crm', label: 'Outreach Pipeline', requiredTier: 'scout', icon: '📋' },
        { id: 'lists', label: 'Smart Lists', requiredTier: 'scout', icon: '📂' },
        { id: 'audit', label: 'Business Health Check', requiredTier: 'hunter', icon: '🩺' },
        { id: 'outreach', label: 'AI Outreach Studio', requiredTier: 'hunter', icon: '✉️' },
        { id: 'prompts', label: 'Website Prompt Engine', requiredTier: 'agency', icon: '⚡' },
        { id: 'integrations', label: 'Connection Hub', requiredTier: 'agency', icon: '🔌' },
        { id: 'team', label: 'Team Workspace', requiredTier: 'agency', icon: '👥' },
        { id: 'settings', label: 'Settings', requiredTier: 'free', icon: '⚙️' }
    ];

    const sidebarHTML = sidebarItems.map(item => {
        const isUnlocked = hasAccess(userTier, item.requiredTier);
        const isActive = activeTab === item.id;
        const activeClass = isActive ? 'active' : '';
        const lockIcon = isUnlocked ? '' : '<span class="nav-lock">🔒</span>';
        
        // Navigation targets
        const href = item.id === 'directory' ? '#/browse' : `#/dashboard/${item.id}`;

        return `
            <a href="${isUnlocked ? href : 'javascript:void(0)'}" 
               class="dashboard-nav-item ${activeClass} ${isUnlocked ? '' : 'locked'}" 
               data-id="${item.id}"
               data-required="${item.requiredTier}">
                <span class="nav-icon">${item.icon}</span>
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

    return `
        <div class="dashboard-shell">
            <aside class="dashboard-sidebar">
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
                    <div class="topbar-left">
                        <h2 class="dashboard-page-title" id="dashboardPageTitle">Dashboard</h2>
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
                
                <div class="dashboard-content-area" id="dashboardContent">
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
