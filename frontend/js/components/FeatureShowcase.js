export function renderFeatureShowcase() {
    return `
        <section class="marketing-features">
            <div class="container">
                <div class="features-title-wrap">
                    <h2>Directory Intelligence Features</h2>
                    <p>NearPro bridges the gap between raw web directories and verified business intelligence. Powered by local scraper integrations.</p>
                </div>
                <div class="features-grid">
                    <div class="feature-panel">
                        <div class="feature-icon-wrap">📍</div>
                        <h3>Interactive Map Densities</h3>
                        <p>Locate service providers and businesses visually. Leaflet.js rendering displays exact coordinates and spatial clusters across Mumbai.</p>
                    </div>
                    
                    <div class="feature-panel">
                        <div class="feature-icon-wrap">⚡</div>
                        <h3>Open Now Calculator</h3>
                        <p>Our algorithms parse temporal hour profiles against India Standard Time (IST) in real time, showing you exactly who is open right now.</p>
                    </div>
                    
                    <div class="feature-panel">
                        <div class="feature-icon-wrap">📊</div>
                        <h3>Completeness Scoring</h3>
                        <p>Every lead is graded (0-5 stars) on phone, email, website, coordinates, and hours availability. No more incomplete profiles.</p>
                    </div>
                </div>
            </div>
        <section class="pro_plans_section" style="background: var(--bg-surface); padding: 80px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
            <div class="container">
                <div class="features-title-wrap" style="margin-bottom: 48px;">
                    <span style="font-family: var(--font-mono); font-size: 12px; color: var(--accent-gold); text-transform: uppercase;">Monetization & Growth</span>
                    <h2 style="font-size: 28px; margin-top: 8px;">Select Your Premium Plan</h2>
                    <p style="max-width: 600px; margin: 12px auto 0; font-size: 14.5px; line-height: 1.6; color: var(--text-secondary);">
                        Spend ₹29 on random snacks vs spend ₹29 on verified local data to scale your freelancer client outreach and business revenue. Choose a tier optimized for your client acquisitions.
                    </p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 1000px; margin: 0 auto;">
                    <!-- Starter Plan -->
                    <div class="feature-panel" style="padding: 32px; background: rgba(9, 9, 11, 0.6); border-color: rgba(255, 160, 0, 0.1); display: flex; flex-direction: column; height: 100%;">
                        <div style="margin-bottom: 20px;">
                            <h3 style="font-size: 18px; font-family: var(--font-heading); color: var(--accent-gold); margin-bottom: 4px;">Starter Plan</h3>
                            <div style="font-size: 28px; font-weight: bold; color: white; margin-top: 8px;">
                                ₹29 <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">/ month</span>
                            </div>
                        </div>
                        <ul style="list-style: none; padding: 0; margin: 0 0 auto 0; font-size: 13px; line-height: 1.8; color: var(--text-secondary);">
                            <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-gold);">✓</span>
                                <div>Unlimited Directory Searches</div>
                            </li>
                            <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-gold);">✓</span>
                                <div>View Verified Names & Categories</div>
                            </li>
                            <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-gold);">✓</span>
                                <div>Access Completeness Scores Index</div>
                            </li>
                            <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px; opacity: 0.4;">
                                <span>✗</span>
                                <div>Direct Phone & Website CTAs</div>
                            </li>
                            <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px; opacity: 0.4;">
                                <span>✗</span>
                                <div>Bulk CSV Database Exports</div>
                            </li>
                        </ul>
                        <button class="brand-btn" style="width: 100%; padding: 10px; font-size: 13px; margin-top: 24px;" onclick="localStorage.setItem('selected_nearpro_tier', 'starter'); window.State.locked = false; window.State.session_started = null; window.State.setAuthModal(true);">
                            Select Starter
                        </button>
                    </div>

                    <!-- Connect Plan -->
                    <div class="feature-panel" style="padding: 32px; background: rgba(9, 9, 11, 0.6); border-color: var(--accent-gold); display: flex; flex-direction: column; height: 100%; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--accent-gold); color: black; font-size: 10px; font-family: var(--font-mono); padding: 4px 12px; border-radius: 20px; font-weight: bold; text-transform: uppercase;">Popular</div>
                        <div style="margin-bottom: 20px;">
                            <h3 style="font-size: 18px; font-family: var(--font-heading); color: var(--accent-gold); margin-bottom: 4px;">Connect Plan</h3>
                            <div style="font-size: 28px; font-weight: bold; color: white; margin-top: 8px;">
                                ₹59 <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">/ month</span>
                            </div>
                        </div>
                        <ul style="list-style: none; padding: 0; margin: 0 0 auto 0; font-size: 13px; line-height: 1.8; color: var(--text-secondary);">
                            <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-gold);">✓</span>
                                <div><strong>All Starter Features</strong></div>
                            </li>
                            <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-gold);">✓</span>
                                <div>Direct Phone Numbers for Call Outreach</div>
                            </li>
                            <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-gold);">✓</span>
                                <div>Direct Verified Website Connections</div>
                            </li>
                            <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-gold);">✓</span>
                                <div>Spatial Coordinates Map Pins</div>
                            </li>
                            <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px; opacity: 0.4;">
                                <span>✗</span>
                                <div>Bulk CSV Database Exports</div>
                            </li>
                        </ul>
                        <button class="brand-btn" style="width: 100%; padding: 10px; font-size: 13px; margin-top: 24px;" onclick="localStorage.setItem('selected_nearpro_tier', 'connect'); window.State.locked = false; window.State.session_started = null; window.State.setAuthModal(true);">
                            Select Connect
                        </button>
                    </div>

                    <!-- Elite Pro Plan -->
                    <div class="feature-panel" style="padding: 32px; background: rgba(9, 9, 11, 0.6); border-color: rgba(236, 72, 153, 0.2); display: flex; flex-direction: column; height: 100%;">
                        <div style="margin-bottom: 20px;">
                            <h3 style="font-size: 18px; font-family: var(--font-heading); color: var(--accent-pink); margin-bottom: 4px;">Elite Pro Plan</h3>
                            <div style="font-size: 28px; font-weight: bold; color: white; margin-top: 8px;">
                                ₹99 <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">/ month</span>
                            </div>
                        </div>
                        <ul style="list-style: none; padding: 0; margin: 0 0 auto 0; font-size: 13px; line-height: 1.8; color: var(--text-secondary);">
                            <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-pink);">✓</span>
                                <div><strong>All Connect Features</strong></div>
                            </li>
                            <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-pink);">✓</span>
                                <div><strong>Bulk CSV Database Exports</strong></div>
                            </li>
                            <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-pink);">✓</span>
                                <div>Advanced Suburb Opportunity Indices</div>
                            </li>
                            <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-pink);">✓</span>
                                <div>Competitor Quality Analytics Dashboard</div>
                            </li>
                        </ul>
                        <button class="brand-btn" style="width: 100%; padding: 10px; font-size: 13px; margin-top: 24px; background: linear-gradient(135deg, var(--accent-pink), #a855f7);" onclick="localStorage.setItem('selected_nearpro_tier', 'pro'); window.State.locked = false; window.State.session_started = null; window.State.setAuthModal(true);">
                            Select Elite Pro
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <section class="app-cta-banner">
            <div class="container cta-banner-content">
                <h2>Ready to Connect?</h2>
                <p>Download the NearPro application on mobile to consult with professionals, chat live, and initiate secure calls on the go.</p>
                <div class="download-buttons">
                    <a href="#" class="store-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5,3L19,12L5,21V3Z"/></svg>
                        <div class="store-btn-text">
                            <span class="sub">Get it on</span>
                            <span class="main">Google Play</span>
                        </div>
                    </a>
                    <a href="#" class="store-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z"/></svg>
                        <div class="store-btn-text">
                            <span class="sub">Download on the</span>
                            <span class="main">App Store</span>
                        </div>
                    </a>
                </div>
            </div>
        </section>
    `;
}
