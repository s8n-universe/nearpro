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
        <section class="pricing-section">
            <div class="container">
                <div class="features-title-wrap" style="margin-bottom: 48px;">
                    <span style="font-family: var(--font-mono); font-size: 12px; color: var(--accent-gold); text-transform: uppercase;">Monetization & Growth</span>
                    <h2 style="font-size: 28px; margin-top: 8px;">Select Your Premium Plan</h2>
                    <p style="max-width: 600px; margin: 12px auto 0; font-size: 14.5px; line-height: 1.6; color: var(--text-secondary);">
                        Spend ₹29 on random snacks vs spend ₹29 on verified local data to scale your freelancer client outreach and business revenue. Choose a tier optimized for your client acquisitions.
                    </p>
                </div>
                
                <div class="pricing-grid">
                    <!-- Starter Plan -->
                    <div class="pricing-card">
                        <div class="pricing-header">
                            <h3 class="pricing-title" style="color: var(--accent-gold);">Starter Plan</h3>
                            <div class="pricing-price">
                                ₹29 <span>/ month</span>
                            </div>
                        </div>
                        <ul class="pricing-features-list">
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Unlimited Directory Searches</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>View Verified Names & Categories</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Access Completeness Scores Index</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Read Open Status Hours</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Search By Category Or Parents</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Instant Local Area Filtering</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Guided Tour Walkthrough Instructions</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Search Up To 5000 Active Leads</div>
                            </li>
                        </ul>
                        <button class="brand-btn pricing-btn" onclick="localStorage.setItem('selected_nearpro_tier', 'starter'); window.State.locked = false; window.State.session_started = null; window.State.setAuthModal(true);">
                            Select Starter
                        </button>
                    </div>

                    <!-- Connect Plan -->
                    <div class="pricing-card popular">
                        <div class="pricing-badge">Popular</div>
                        <div class="pricing-header">
                            <h3 class="pricing-title" style="color: var(--accent-gold);">Connect Plan</h3>
                            <div class="pricing-price">
                                ₹59 <span>/ month</span>
                            </div>
                        </div>
                        <ul class="pricing-features-list">
                            <li class="pricing-feature-item highlight">
                                <span class="pricing-feature-icon">✓</span>
                                <div>All Starter Features Included</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Direct Phone Numbers for Call Outreach</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Direct Verified Website Connections</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Spatial Coordinates Map Pins</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Distance Estimates From Your Area</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Save Bookmarks to Local Favorites</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Share Directory Card Links</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Priority Support Queue Response</div>
                            </li>
                        </ul>
                        <button class="brand-btn pricing-btn" onclick="localStorage.setItem('selected_nearpro_tier', 'connect'); window.State.locked = false; window.State.session_started = null; window.State.setAuthModal(true);">
                            Select Connect
                        </button>
                    </div>

                    <!-- Elite Pro Plan -->
                    <div class="pricing-card">
                        <div class="pricing-header">
                            <h3 class="pricing-title" style="color: var(--accent-pink);">Elite Pro Plan</h3>
                            <div class="pricing-price">
                                ₹99 <span>/ month</span>
                            </div>
                        </div>
                        <ul class="pricing-features-list">
                            <li class="pricing-feature-item highlight">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>All Connect Features Included</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>Advanced Suburb Opportunity Indices</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>Competitor Quality Analytics Dashboard</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>Average Ratings Analysis Maps</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>Category Density Breakdown Charts</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>Suburb Verification Ratio Reports</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>Filter By Professional Review Count</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>Custom Business Intelligence Reports</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>Dedicated Client Success Manager</div>
                            </li>
                        </ul>
                        <button class="brand-btn pricing-btn" style="background: linear-gradient(135deg, var(--accent-pink), #a855f7);" onclick="localStorage.setItem('selected_nearpro_tier', 'pro'); window.State.locked = false; window.State.session_started = null; window.State.setAuthModal(true);">
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
