import { State } from '../state.js';

export function renderHeader() {
    const isBrowseActive = window.location.hash.startsWith('#/browse') || window.location.hash.startsWith('#/category');
    const isDashboardActive = window.location.hash.startsWith('#/dashboard');
    const isHomeActive = !isBrowseActive && !isDashboardActive;
    
    const viewToggleHTML = isBrowseActive ? `
        <div class="view-toggle-wrap">
            <button id="gridBtn" class="secondary-btn ${State.view === 'grid' ? 'brand-btn' : ''}" style="padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm);">Grid View</button>
            <button id="mapBtn" class="secondary-btn ${State.view === 'map' ? 'brand-btn' : ''}" style="padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm);">Map View</button>
        </div>
    ` : '';
 
    let authActionsHTML = '';
    if (State.user) {
        const email = State.user.email || '';
        const initials = email ? email.substring(0, 2).toUpperCase() : 'US';
        const userTier = (State.profile?.subscription_tier || State.profile?.tier || 'free').toLowerCase();
        
        let tierColor = '#71717a'; // Zinc / Free
        let glowShadow = 'none';
        let tierLabel = 'Explorer';

        if (userTier === 'scout') {
            tierColor = '#ffa000'; // Gold
            glowShadow = '0 0 8px rgba(255, 160, 0, 0.4)';
            tierLabel = 'Scout';
        } else if (userTier === 'hunter') {
            tierColor = '#f59e0b'; // Amber
            glowShadow = '0 0 10px rgba(245, 158, 11, 0.5)';
            tierLabel = 'Hunter';
        } else if (userTier === 'agency') {
            tierColor = '#ec4899'; // Pink
            glowShadow = '0 0 12px rgba(236, 72, 153, 0.6)';
            tierLabel = 'Agency';
        }

        authActionsHTML = `
            <div class="user-profile-dropdown-wrap" style="position: relative; display: inline-block;">
                <div class="avatar-ring" id="headerProfileAvatarBtn" style="width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; border: 2px solid ${tierColor}; box-shadow: ${glowShadow};">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-surface, #18181b); color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; text-transform: uppercase; font-family: var(--font-mono);">
                        ${initials}
                    </div>
                </div>
                <!-- Profile dropdown menu on click -->
                <div class="profile-dropdown-content" id="headerProfileDropdownMenu" style="position: absolute; right: 0; top: 45px; width: 220px; background: #09090b; border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: var(--radius-md, 8px); padding: 16px; display: none; flex-direction: column; gap: 12px; z-index: 10000; box-shadow: 0 10px 30px rgba(0,0,0,0.65); text-align: left;">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <div style="font-size: 12px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${email}</div>
                        <div style="font-size: 11px; font-family: var(--font-mono); font-weight: bold; color: ${tierColor}; display: flex; align-items: center; gap: 4px;">
                            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${tierColor};"></span>
                            ${tierLabel} Plan
                        </div>
                    </div>
                    <hr style="border: none; border-top: 1px solid var(--border, rgba(255,255,255,0.08)); margin: 0;">
                    <a href="#/dashboard" style="font-size: 13px; color: white; text-decoration: none; display: flex; align-items: center; gap: 6px; padding: 4px 0; transition: color 0.2s;" onmouseover="this.style.color='var(--accent-gold)'" onmouseout="this.style.color='white'">
                        ⚙️ Dashboard Workspace
                    </a>
                    <button id="signOutBtn" class="secondary-btn" style="width: 100%; padding: 8px; font-size: 12px; border-radius: var(--radius-sm); border-color: rgba(239, 68, 68, 0.2); color: #ef4444; background: rgba(239, 68, 68, 0.05); text-align: center; justify-content: center;">
                        Sign Out
                    </button>
                </div>
            </div>
            
            <style>
                .avatar-ring:hover {
                    transform: scale(1.05);
                }
            </style>
        `;
    } else {
        authActionsHTML = `
            <button id="openLoginBtn" class="brand-btn" style="padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm);">Login</button>
        `;
    }

    // Static marquee elements creation
    const tickerNames = [
        "CA Rahul", "Freelancer Priya", "Agency Head Amit", 
        "Sales Rep Sneha", "Designer Rohit", "Developer Kiara", 
        "Consultant Vivek", "Marketer Arjun", "Growth Hacker Riya"
    ];
    const tickerDeals = [
        "₹30,000 retainer", "₹45,000 website contract", "₹75,000 SEO project", 
        "₹20,000 consulting gig", "₹60,000 design package", "₹50,000 HubSpot migration", 
        "₹35,000 audit deal", "₹90,000 enterprise contract", "₹40,000 WhatsApp campaign"
    ];
    const tickerTips = [
        "Find local clients with 100% verified street address data!",
        "Unlocking 12 premium verified leads with direct numbers today!",
        "Pitch ₹30,000 mobile layout packages to target gap leads!",
        "Sync local business profiles to Google Sheets automatically!",
        "Create custom white-label proposal PDFs in 30 seconds!",
        "Bypass gatekeepers with direct owner mobile numbers!"
    ];

    const tickerItems = [];
    for (let i = 0; i < tickerNames.length; i++) {
        const deal = tickerDeals[i % tickerDeals.length];
        const tip = tickerTips[i % tickerTips.length];
        tickerItems.push(`🔥 <span style="color: var(--accent-gold);">${tickerNames[i]}</span> just closed a <span style="color: #3b82f6;">${deal}</span> using NearPro!`);
        tickerItems.push(`🚀 ${tip}`);
    }
    const singleSequence = tickerItems.join(' &bull; ');
    const fullMarqueeContent = `${singleSequence} &bull; ${singleSequence} &bull;`;
 
    return `
        <header class="main-header" style="border-bottom: none;">
            <div class="container header-wrap">
                <a href="#/" class="header-brand">
                    <img src="/NearPro_logo_nobg.png" alt="NearPro Logo" style="height: 32px; width: auto; object-fit: contain; margin-right: 4px;">
                    <span>Near<span class="brand-text">Pro</span></span>
                </a>
                
                <nav class="header-nav">
                    ${State.user ? `
                        <a href="#/dashboard/directory" class="nav-link ${isDashboardActive ? 'active' : ''}">Dashboard Workspace</a>
                    ` : ''}
                </nav>
                
                <div class="header-actions" style="display: flex; align-items: center; gap: 12px;">
                    ${viewToggleHTML}
                    ${authActionsHTML}
                </div>
            </div>
        </header>
        ${!State.user ? `
            <div class="navbar-ticker-bar" style="background: rgba(255, 160, 0, 0.05); border-top: 1px solid rgba(255, 255, 255, 0.05); border-bottom: 1px solid rgba(255, 160, 0, 0.2); padding: 8px 0; overflow: hidden; width: 100%;">
                <div class="container" style="display: flex; align-items: center; gap: 12px; max-width: var(--container-width); margin: 0 auto; padding: 0 16px;">
                    <span class="ticker-badge" style="background: rgba(255, 160, 0, 0.15); color: var(--accent-gold); padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; font-family: var(--font-mono); text-transform: uppercase; display: inline-block; animation: pulse 2s infinite; flex-shrink: 0; letter-spacing: 0.5px;">HOT 🔥</span>
                    <div class="ticker-viewport" style="overflow: hidden; width: 100%; position: relative; height: 22px; display: flex; align-items: center;">
                        <div class="ticker-track" style="display: inline-block; white-space: nowrap; position: absolute; animation: marquee-bar 45s linear infinite; width: max-content; font-size: 14.5px; font-weight: 700; color: #e2e8f0; will-change: transform; backface-visibility: hidden; transform: translate3d(-50%, 0, 0);">
                            ${fullMarqueeContent}
                        </div>
                    </div>
                </div>
            </div>
        ` : ''}
        <style>
            @keyframes marquee-bar {
                0% { transform: translate3d(-50%, 0, 0); }
                100% { transform: translate3d(0%, 0, 0); }
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
        </style>
    `;
}

export function bindHeaderEvents() {
    const gridBtn = document.getElementById('gridBtn');
    const mapBtn = document.getElementById('mapBtn');
    const openLoginBtn = document.getElementById('openLoginBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    
    if (gridBtn) {
        gridBtn.addEventListener('click', () => {
            State.toggleView('grid');
        });
    }
    
    if (mapBtn) {
        mapBtn.addEventListener('click', () => {
            State.toggleView('map');
        });
    }

    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', () => {
            State.setAuthModal(true);
        });
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
