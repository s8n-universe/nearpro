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
                <div class="avatar-ring" style="width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; border: 2px solid ${tierColor}; box-shadow: ${glowShadow};">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-surface, #18181b); color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; text-transform: uppercase; font-family: var(--font-mono);">
                        ${initials}
                    </div>
                </div>
                <!-- Profile dropdown menu on hover -->
                <div class="profile-dropdown-content" style="position: absolute; right: 0; top: 40px; width: 220px; background: #09090b; border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: var(--radius-md, 8px); padding: 16px; display: none; flex-direction: column; gap: 12px; z-index: 10000; box-shadow: 0 10px 30px rgba(0,0,0,0.65); text-align: left;">
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
                .user-profile-dropdown-wrap:hover .profile-dropdown-content {
                    display: flex !important;
                }
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
 
    return `
        <header class="main-header">
            <div class="container header-wrap">
                <a href="#/" class="header-brand">
                    <img src="/NearPro_logo_nobg.png" alt="NearPro Logo" style="height: 32px; width: auto; object-fit: contain; margin-right: 4px;">
                    <span>Near<span class="brand-text">Pro</span></span>
                </a>
                
                <nav class="header-nav">
                    ${State.user ? `
                        <a href="#/dashboard/directory" class="nav-link ${isDashboardActive ? 'active' : ''}">Dashboard Workspace</a>
                    ` : `
                        <div class="navbar-ticker" style="overflow: hidden; white-space: nowrap; max-width: 350px; font-size: 11.5px; font-weight: 700; color: var(--accent-gold); display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255,160,0,0.2); padding: 4px 12px; border-radius: 20px; background: rgba(255,160,0,0.03);">
                            <span class="ticker-badge" style="background: rgba(255, 160, 0, 0.15); color: var(--accent-gold); padding: 1px 6px; border-radius: 12px; font-size: 9.5px; font-family: var(--font-mono); text-transform: uppercase; display: inline-block; animation: pulse 2s infinite; flex-shrink: 0;">HOT 🔥</span>
                            <div class="ticker-viewport" style="overflow: hidden; width: 100%; position: relative; height: 16px;">
                                <div class="ticker-track" style="display: inline-block; white-space: nowrap; position: absolute; animation: marquee 25s linear infinite; width: max-content;">
                                    🔥 CA Rahul just closed a ₹30,000 retainer using NearPro! &bull; ⚡ Unlocking 12 premium verified leads with direct numbers today! &bull; 💸 Pitch ₹30,000 mobile layout packages to target gap leads! &bull; 🚀 Find local clients with 100% verified street-address data! &bull; 🔥 CA Rahul just closed a ₹30,000 retainer using NearPro! &bull; ⚡ Unlocking 12 premium verified leads with direct numbers today! &bull; 💸 Pitch ₹30,000 mobile layout packages to target gap leads! &bull; 🚀 Find local clients with 100% verified street-address data!
                                </div>
                            </div>
                        </div>
                    `}
                </nav>
                
                <div class="header-actions" style="display: flex; align-items: center; gap: 12px;">
                    ${viewToggleHTML}
                    ${authActionsHTML}
                </div>
            </div>
        </header>
        <style>
            @keyframes marquee {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0%); }
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
}
