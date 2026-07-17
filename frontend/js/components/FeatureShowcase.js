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
        <section class="pro-plans-section" style="background: var(--bg-surface); padding: 80px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
            <div class="container">
                <div class="features-title-wrap" style="margin-bottom: 48px;">
                    <span style="font-family: var(--font-mono); font-size: 12px; color: var(--accent-gold); text-transform: uppercase;">Growth Architecture</span>
                    <h2 style="font-size: 28px; margin-top: 8px;">Premium Platform vs Mobile App</h2>
                    <p>Select the platform matching your business outreach strategy or communication needs.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px;">
                    <!-- Web Premium Box -->
                    <div class="feature-panel" style="padding: 40px; background: rgba(9, 9, 11, 0.6); border-color: rgba(255, 160, 0, 0.15); display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                            <div>
                                <h3 style="font-size: 20px; font-family: var(--font-heading); color: var(--accent-gold);">Web Premium Plan</h3>
                                <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase;">Lead Generation & Analytics</span>
                            </div>
                            <span style="font-size: 28px;">💻</span>
                        </div>
                        
                        <ul style="list-style: none; padding: 0; margin: 0 0 32px 0; font-size: 14px; line-height: 1.8; color: var(--text-secondary);">
                            <li style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-gold);">✓</span>
                                <div><strong>Freelancer Client Acquisition</strong>: Extract direct email lists and contact phone numbers to pitch local businesses.</div>
                            </li>
                            <li style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-gold);">✓</span>
                                <div><strong>Niche Opportunity Indexes</strong>: Surf suburb market gaps to discover underserved locations with zero competition.</div>
                            </li>
                            <li style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-gold);">✓</span>
                                <div><strong>Business Pipeline Feeds</strong>: Export full lead lists to clean CSV formats or push data to CRM pipelines.</div>
                            </li>
                            <li style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-gold);">✓</span>
                                <div><strong>Geospatial Map Filtering</strong>: Analyze professional densities inside Mumbai with custom cluster parameters.</div>
                            </li>
                        </ul>
                    </div>
                    
                    <!-- Mobile App Box -->
                    <div class="feature-panel" style="padding: 40px; background: rgba(9, 9, 11, 0.6); border-color: rgba(236, 72, 153, 0.15); display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                            <div>
                                <h3 style="font-size: 20px; font-family: var(--font-heading); color: var(--accent-pink);">Mobile Application</h3>
                                <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase;">Live Communication & Actions</span>
                            </div>
                            <span style="font-size: 28px;">📱</span>
                        </div>
                        
                        <ul style="list-style: none; padding: 0; margin: 0 0 32px 0; font-size: 14px; line-height: 1.8; color: var(--text-secondary);">
                            <li style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-pink);">✓</span>
                                <div><strong>Instant Connection</strong>: Initiate phone calls, WhatsApp messages, or secure live chats in one tap.</div>
                            </li>
                            <li style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-pink);">✓</span>
                                <div><strong>Spatial Routing Maps</strong>: Compute precise distances, travel times, and directions to local offices.</div>
                            </li>
                            <li style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-pink);">✓</span>
                                <div><strong>Offline Directory Bookmarking</strong>: Save business profiles to local device lists for offline access.</div>
                            </li>
                            <li style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
                                <span style="color: var(--accent-pink);">✓</span>
                                <div><strong>Scan Card Profiles</strong>: Generate and scan QR codes to instantly share local directory cards.</div>
                            </li>
                        </ul>
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
