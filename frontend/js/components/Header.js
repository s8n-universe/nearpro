import { State } from '../state.js';

export function renderHeader() {
    const isDashboardActive = window.location.hash.startsWith('#/dashboard');

    // ── Logged-in users see a simple dashboard navbar ──
    if (State.user) {
        const email = State.user.email || '';
        const initials = email ? email.substring(0, 2).toUpperCase() : 'US';
        let userTier = (State.profile?.subscription_tier || State.profile?.tier || 'free').toLowerCase();
        if (email === 'nearproadmin@gmail.com') userTier = 'free';

        let tierColor = '#71717a';
        let glowShadow = 'none';
        let tierLabel = 'Explorer';
        if (userTier === 'scout') { tierColor = '#ffa000'; glowShadow = '0 0 8px rgba(255,160,0,0.4)'; tierLabel = 'Scout'; }
        else if (userTier === 'hunter') { tierColor = '#f59e0b'; glowShadow = '0 0 10px rgba(245,158,11,0.5)'; tierLabel = 'Hunter'; }
        else if (userTier === 'agency') { tierColor = '#ec4899'; glowShadow = '0 0 12px rgba(236,72,153,0.6)'; tierLabel = 'Agency'; }

        return `
            <header class="main-header" style="border-bottom: none;">
                <div class="container header-wrap">
                    <a href="#/" class="header-brand">
                        <img src="/NearPro_logo_nobg.png" alt="NearPro Logo" style="height: 32px; width: auto; object-fit: contain; margin-right: 4px;">
                        <span>Near<span class="brand-text">Pro</span><sup style="font-size: 10px; font-weight: bold; color: var(--accent-gold); margin-left: 2px;">™</sup></span>
                    </a>
                    <nav class="header-nav">
                        <a href="#/dashboard/directory" class="nav-link ${isDashboardActive ? 'active' : ''}">Dashboard Workspace</a>
                    </nav>
                    <div class="header-actions" style="display: flex; align-items: center; gap: 12px;">
                        <div class="user-profile-dropdown-wrap" style="position: relative; display: inline-block; padding-bottom: 12px; margin-bottom: -12px;">
                            <div class="avatar-ring" id="headerProfileAvatarBtn" style="width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; border: 2px solid ${tierColor}; box-shadow: ${glowShadow};">
                                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-surface, #18181b); color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; text-transform: uppercase; font-family: var(--font-mono);">
                                    ${initials}
                                </div>
                            </div>
                            <div class="profile-dropdown-content" id="headerProfileDropdownMenu" style="position: absolute; right: 0; top: calc(100% - 4px); width: 220px; background: #09090b; border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: var(--radius-md, 8px); padding: 16px; display: none; flex-direction: column; gap: 12px; z-index: 10000; box-shadow: 0 10px 30px rgba(0,0,0,0.65); text-align: left;">
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <div style="font-size: 12px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${email}</div>
                                    <div style="font-size: 11px; font-family: var(--font-mono); font-weight: bold; color: ${tierColor}; display: flex; align-items: center; gap: 4px;">
                                        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${tierColor};"></span>
                                        ${tierLabel} Plan
                                    </div>
                                </div>
                                <hr style="border: none; border-top: 1px solid var(--border, rgba(255,255,255,0.08)); margin: 0;">
                                <a href="#/dashboard" style="font-size: 13px; color: white; text-decoration: none; display: flex; align-items: center; gap: 6px; padding: 4px 0; transition: color 0.2s;" onmouseover="this.style.color='var(--accent-gold)'" onmouseout="this.style.color='white'">
                                    Dashboard Workspace
                                </a>
                                <button id="signOutBtn" class="secondary-btn" style="width: 100%; padding: 8px; font-size: 12px; border-radius: var(--radius-sm); border-color: rgba(239, 68, 68, 0.2); color: #ef4444; background: rgba(239, 68, 68, 0.05); text-align: center; justify-content: center;">
                                    Sign Out
                                </button>
                            </div>
                        </div>
                        <style>
                            .avatar-ring:hover { transform: scale(1.05); }
                            .profile-dropdown-content::before { content: ''; position: absolute; top: -18px; left: 0; right: 0; height: 22px; background: transparent; }
                            .user-profile-dropdown-wrap:hover .profile-dropdown-content, .profile-dropdown-content:hover { display: flex !important; }
                        </style>
                    </div>
                </div>
            </header>
        `;
    }

    return `
        <header class="main-header" style="border-bottom: none;">
            <div class="container header-wrap">

                <!-- Brand -->
                <a href="#/" class="header-brand">
                    <img src="/NearPro_logo_nobg.png" alt="NearPro Logo" style="height: 32px; width: auto; object-fit: contain; margin-right: 4px;">
                    <span>Near<span class="brand-text">Pro</span><sup style="font-size: 10px; font-weight: bold; color: var(--accent-gold); margin-left: 2px;">™</sup></span>
                </a>

                <!-- Nav links with dropdowns -->
                <nav class="header-nav" style="display: flex; align-items: center; gap: 6px;">

                    <!-- Product ▾ -->
                    <div class="np-nav-dropdown" style="position: relative;">
                        <button class="np-nav-trigger" style="background: none; border: none; color: var(--text-secondary); font-size: 14px; font-weight: 500; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 4px; font-family: inherit; transition: color 0.15s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='var(--text-secondary)'">
                            Product <span style="font-size: 10px; opacity: 0.6;">▾</span>
                        </button>
                        <div class="np-mega-panel" style="position: absolute; top: calc(100% + 8px); left: -40px; width: 560px; background: #0c0c0e; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 28px 32px; display: none; z-index: 1000; box-shadow: 0 20px 60px rgba(0,0,0,0.6);">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 28px;">
                                <!-- Core Platform -->
                                <div>
                                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-gold); margin-bottom: 14px;">Core Platform</div>
                                    <div style="display: flex; flex-direction: column; gap: 14px;">
                                        <a href="#/dashboard/directory" class="np-mega-link" style="text-decoration: none; display: flex; flex-direction: column; gap: 2px;">
                                            <span style="font-size: 13.5px; font-weight: 600; color: #ffffff;">B2B Directory</span>
                                            <span style="font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.4;">Find verified local businesses across India.</span>
                                        </a>
                                        <a href="#/dashboard/crm" class="np-mega-link" style="text-decoration: none; display: flex; flex-direction: column; gap: 2px;">
                                            <span style="font-size: 13.5px; font-weight: 600; color: #ffffff;">Outreach Pipeline</span>
                                            <span style="font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.4;">Track leads from discovery to deal closed.</span>
                                        </a>
                                        <a href="#/dashboard/sequences" class="np-mega-link" style="text-decoration: none; display: flex; flex-direction: column; gap: 2px;">
                                            <span style="font-size: 13.5px; font-weight: 600; color: #ffffff;">Email Sequences</span>
                                            <span style="font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.4;">Multi-touch drip campaigns with Hinglish.</span>
                                        </a>
                                        <a href="#/dashboard/proposals" class="np-mega-link" style="text-decoration: none; display: flex; flex-direction: column; gap: 2px;">
                                            <span style="font-size: 13.5px; font-weight: 600; color: #ffffff;">Proposal Builder</span>
                                            <span style="font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.4;">AI-generated PDF proposals in 30 seconds.</span>
                                        </a>
                                    </div>
                                </div>
                                <!-- Intelligence -->
                                <div>
                                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-gold); margin-bottom: 14px;">Intelligence & AI</div>
                                    <div style="display: flex; flex-direction: column; gap: 14px;">
                                        <a href="#/dashboard/audit" class="np-mega-link" style="text-decoration: none; display: flex; flex-direction: column; gap: 2px;">
                                            <span style="font-size: 13.5px; font-weight: 600; color: #ffffff;">Website Audit</span>
                                            <span style="font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.4;">Instant SEO, speed & gap analysis reports.</span>
                                        </a>
                                        <a href="#/dashboard/voice-agent" class="np-mega-link" style="text-decoration: none; display: flex; flex-direction: column; gap: 2px;">
                                            <span style="font-size: 13.5px; font-weight: 600; color: #ffffff;">AI Voice Agent</span>
                                            <span style="font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.4;">Priya calls prospects with your pitch script.</span>
                                        </a>
                                        <a href="#/dashboard/enrichment" class="np-mega-link" style="text-decoration: none; display: flex; flex-direction: column; gap: 2px;">
                                            <span style="font-size: 13.5px; font-weight: 600; color: #ffffff;">Data Enrichment</span>
                                            <span style="font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.4;">Waterfall enrichment for emails & phones.</span>
                                        </a>
                                        <a href="#/dashboard/deliverability" class="np-mega-link" style="text-decoration: none; display: flex; flex-direction: column; gap: 2px;">
                                            <span style="font-size: 13.5px; font-weight: 600; color: #ffffff;">Deliverability Hub</span>
                                            <span style="font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.4;">SPF, DKIM, DMARC health monitoring.</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Pricing (direct link) -->
                    <a href="#/checkout?plan=scout&cycle=monthly" class="nav-link" style="padding: 8px 12px; font-size: 14px; font-weight: 500; color: var(--text-secondary); text-decoration: none; transition: color 0.15s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='var(--text-secondary)'">Pricing</a>

                    <!-- Resources ▾ -->
                    <div class="np-nav-dropdown" style="position: relative;">
                        <button class="np-nav-trigger" style="background: none; border: none; color: var(--text-secondary); font-size: 14px; font-weight: 500; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 4px; font-family: inherit; transition: color 0.15s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='var(--text-secondary)'">
                            Resources <span style="font-size: 10px; opacity: 0.6;">▾</span>
                        </button>
                        <div class="np-mega-panel" style="position: absolute; top: calc(100% + 8px); left: -20px; width: 280px; background: #0c0c0e; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px 24px; display: none; z-index: 1000; box-shadow: 0 20px 60px rgba(0,0,0,0.6);">
                            <div style="display: flex; flex-direction: column; gap: 14px;">
                                <a href="#/docs" class="np-mega-link" style="text-decoration: none; display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 13.5px; font-weight: 600; color: #ffffff;">Documentation</span>
                                    <span style="font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.4;">Guides, API references, and tutorials.</span>
                                </a>
                                <a href="#/docs" class="np-mega-link" style="text-decoration: none; display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 13.5px; font-weight: 600; color: #ffffff;">Integration Guides</span>
                                    <span style="font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.4;">Connect with n8n, HubSpot, and Ollama.</span>
                                </a>
                                <a href="#/dashboard/overview" class="np-mega-link" style="text-decoration: none; display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 13.5px; font-weight: 600; color: #ffffff;">Getting Started</span>
                                    <span style="font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.4;">Platform overview and quick-start guide.</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Company ▾ -->
                    <div class="np-nav-dropdown" style="position: relative;">
                        <button class="np-nav-trigger" style="background: none; border: none; color: var(--text-secondary); font-size: 14px; font-weight: 500; cursor: pointer; padding: 8px 12px; display: flex; align-items: center; gap: 4px; font-family: inherit; transition: color 0.15s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='var(--text-secondary)'">
                            Company <span style="font-size: 10px; opacity: 0.6;">▾</span>
                        </button>
                        <div class="np-mega-panel" style="position: absolute; top: calc(100% + 8px); left: -20px; width: 260px; background: #0c0c0e; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px 24px; display: none; z-index: 1000; box-shadow: 0 20px 60px rgba(0,0,0,0.6);">
                            <div style="display: flex; flex-direction: column; gap: 14px;">
                                <a href="https://www.linkedin.com/company/s8n-nearpro" target="_blank" class="np-mega-link" style="text-decoration: none; display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 13.5px; font-weight: 600; color: #ffffff;">About S8N AI</span>
                                    <span style="font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.4;">The team building NearPro.</span>
                                </a>
                                <a href="mailto:support@s8n.in" class="np-mega-link" style="text-decoration: none; display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 13.5px; font-weight: 600; color: #ffffff;">Contact Support</span>
                                    <span style="font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.4;">Reach us at support@s8n.in</span>
                                </a>
                                <a href="#/privacy" class="np-mega-link" style="text-decoration: none; display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: 13.5px; font-weight: 600; color: #ffffff;">Privacy & Terms</span>
                                    <span style="font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.4;">Legal policies and data practices.</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>

                <!-- Right side: auth -->
                <div class="header-actions" style="display: flex; align-items: center; gap: 16px;">

                    <!-- Create an account -->
                    <button id="createAccountBtn" style="background: none; border: 1px solid rgba(255,255,255,0.15); color: #ffffff; font-size: 13px; font-weight: 600; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap;" onmouseover="this.style.borderColor='rgba(255,255,255,0.3)'; this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.15)'; this.style.background='none'">
                        Create an account
                    </button>

                    <!-- Log in -->
                    <a href="javascript:void(0)" id="openLoginBtn" style="color: var(--accent-gold); font-size: 13px; font-weight: 600; text-decoration: none; white-space: nowrap; display: flex; align-items: center; gap: 4px; transition: opacity 0.15s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                        Log in <span style="font-size: 14px;">→</span>
                    </a>
                </div>
            </div>
        </header>

        <!-- Dropdown hover styles -->
        <style>
            /* Dropdown show/hide via hover */
            .np-nav-dropdown { padding-bottom: 12px; margin-bottom: -12px; }
            .np-mega-panel::before { content: ''; position: absolute; top: -14px; left: 0; right: 0; height: 18px; background: transparent; }
            .np-nav-dropdown:hover .np-mega-panel { display: block !important; }
            .np-mega-link { padding: 6px 8px; border-radius: 6px; transition: background 0.12s; }
            .np-mega-link:hover { background: rgba(255,255,255,0.04); }
        </style>
    `;
}

export function bindHeaderEvents() {
    const gridBtn = document.getElementById('gridBtn');
    const mapBtn = document.getElementById('mapBtn');
    const openLoginBtn = document.getElementById('openLoginBtn');
    const createAccountBtn = document.getElementById('createAccountBtn');
    const signOutBtn = document.getElementById('signOutBtn');

    if (gridBtn) {
        gridBtn.addEventListener('click', () => { State.toggleView('grid'); });
    }
    if (mapBtn) {
        mapBtn.addEventListener('click', () => { State.toggleView('map'); });
    }
    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', () => { State.setAuthModal(true); });
    }
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', () => { State.setAuthModal(true); });
    }
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            try {
                window._isSigningOut = true;
                const { Api } = await import('../api.js');
                await Api.signOut();
            } catch (err) {
                console.error("Sign out failed: ", err);
                window._isSigningOut = false;
            }
        });
    }

    // Profile avatar toggle (logged-in only)
    const profileAvatarBtn = document.getElementById('headerProfileAvatarBtn');
    const profileDropdownMenu = document.getElementById('headerProfileDropdownMenu');
    if (profileAvatarBtn && profileDropdownMenu) {
        profileAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = profileDropdownMenu.style.display === 'flex';
            profileDropdownMenu.style.display = isVisible ? 'none' : 'flex';
        });
        document.addEventListener('click', (e) => {
            if (!profileAvatarBtn.contains(e.target) && !profileDropdownMenu.contains(e.target)) {
                profileDropdownMenu.style.display = 'none';
            }
        });
    }
}
