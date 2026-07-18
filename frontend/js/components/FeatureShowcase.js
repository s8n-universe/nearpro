export function renderFeatureShowcase() {
    return `
        <section class="marketing-features">
            <div class="container">
                <div class="features-title-wrap">
                    <h2>Lead Intelligence & Outreach Features</h2>
                    <p>NearPro transforms raw business directory search results into actionable sales pipelines. Find leads, audit websites, generate AI outreach, and track conversions.</p>
                </div>
                <div class="features-grid">
                    <div class="feature-panel">
                        <div class="feature-icon-wrap">📍</div>
                        <h3>Smart Pipelines & Mapping</h3>
                        <p>Locate target leads visually on coordinate maps. Segment your results into client campaigns, save leads, and track progress using the Lead CRM kanban board.</p>
                    </div>
                    
                    <div class="feature-panel">
                        <div class="feature-icon-wrap">⚡</div>
                        <h3>Instant Website Audits</h3>
                        <p>Run 10-second automated checks on PageSpeed, mobile layouts, and SSL status. Estimate lost monthly revenue for target prospects instantly to back up your pitch.</p>
                    </div>
                    
                    <div class="feature-panel">
                        <div class="feature-icon-wrap">📊</div>
                        <h3>AI Outreach & Personalization</h3>
                        <p>Evaluate prospects with Conversion Scores. Automatically generate customized cold pitches for WhatsApp, email, or Instagram DM in Hinglish and English.</p>
                    </div>

                    <div class="feature-panel">
                        <div class="feature-icon-wrap">🔗</div>
                        <h3>Integration Connection Hub</h3>
                        <p>Push tracked leads directly to your Google Sheets or connect customized n8n webhooks to automate your slack or email outreach workflows instantly.</p>
                    </div>
                    
                    <div class="feature-panel">
                        <div class="feature-icon-wrap">👥</div>
                        <h3>Collaborative Team Workspace</h3>
                        <p>Invite colleagues to collaborate in shared team workspaces. Assign seats, share smart lists, and compile white-label client reports together.</p>
                    </div>
                    
                    <div class="feature-panel">
                        <div class="feature-icon-wrap">🛠️</div>
                        <h3>Website Builder Prompts</h3>
                        <p>Generate precise, copy-paste prompts tailored for Bolt.new and Lovable to rebuild outdated prospect websites with one click from your audit results.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Realtime Market Intelligence metrics grid -->
        <section class="marketing-features" style="padding-top: 0; border-top: none; background: transparent;">
            <div class="container">
                <div class="features-title-wrap" style="margin-bottom: 40px;">
                    <h2>Realtime Market Intelligence</h2>
                    <p>Live categorical opportunity benchmarks and high-demand neighborhood indicators parsed from Mumbai directories.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 48px;">
                    <div class="feature-panel" style="padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid var(--accent-gold); text-align: left; background: var(--glass-bg); border-top: 1px solid rgba(255,255,255,0.03); border-right: 1px solid rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <div style="text-align: left;">
                            <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Outreach Opportunities</div>
                            <div style="font-size: 32px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">54.8%</div>
                            <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Leads missing verified websites</div>
                        </div>
                        <div style="font-size: 28px; opacity: 0.8;">🌐</div>
                    </div>
                    <div class="feature-panel" style="padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid var(--accent-pink); text-align: left; background: var(--glass-bg); border-top: 1px solid rgba(255,255,255,0.03); border-right: 1px solid rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <div style="text-align: left;">
                            <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">High-Demand Suburb</div>
                            <div style="font-size: 28px; font-weight: 700; color: var(--accent-pink); margin-top: 4px;">Bandra</div>
                            <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Highest review velocity area</div>
                        </div>
                        <div style="font-size: 28px; opacity: 0.8;">🔥</div>
                    </div>
                    <div class="feature-panel" style="padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid #3b82f6; text-align: left; background: var(--glass-bg); border-top: 1px solid rgba(255,255,255,0.03); border-right: 1px solid rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <div style="text-align: left;">
                            <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Most Underserved Niche</div>
                            <div style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px;">Interior Designer</div>
                            <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Lowest listings concentration</div>
                        </div>
                        <div style="font-size: 28px; opacity: 0.8;">🛠️</div>
                    </div>
                    <div class="feature-panel" style="padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid #10b981; text-align: left; background: var(--glass-bg); border-top: 1px solid rgba(255,255,255,0.03); border-right: 1px solid rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <div style="text-align: left;">
                            <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Review Boost Suburb</div>
                            <div style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">Colaba</div>
                            <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Lowest avg ratings (needs SEO)</div>
                        </div>
                        <div style="font-size: 28px; opacity: 0.8;">📈</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Pricing Section -->
        <section class="pricing-section">
            <div class="container">
                <div class="features-title-wrap" style="margin-bottom: 48px;">
                    <span style="font-family: var(--font-mono); font-size: 12px; color: var(--accent-gold); text-transform: uppercase;">Monetization & Growth</span>
                    <h2 style="font-size: 28px; margin-top: 8px;">Select Your Premium Plan</h2>
                    <p style="max-width: 600px; margin: 12px auto 0; font-size: 14.5px; line-height: 1.6; color: var(--text-secondary);">
                        Unlock verified local leads and outreach tools to scale your freelancer client outreach and business revenue. Choose a tier optimized for your client acquisitions.
                    </p>
                </div>
                         <div class="pricing-grid" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); max-width: 1280px; gap: 24px;">
                    <!-- Scout Plan -->
                    <div class="pricing-card">
                        <div class="pricing-header">
                            <h3 class="pricing-title" style="color: var(--accent-gold);">Scout Plan</h3>
                            <div class="pricing-price">
                                ₹499 <span>/ month</span>
                            </div>
                        </div>
                        <ul class="pricing-features-list">
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Unlocked phone numbers and websites</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Interactive spatial coordinates maps</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Export up to 100 CSV leads per month</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Track 5 Smart Lists with 50 leads each</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Add custom notes and generate QR codes</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-gold);">✓</span>
                                <div>Basic rating, completeness & review stats</div>
                            </li>
                        </ul>
                        <button class="brand-btn pricing-btn" onclick="window.State.selectPlan('scout');">
                            Select Scout
                        </button>
                    </div>

                    <!-- Hunter Plan -->
                    <div class="pricing-card popular">
                        <div class="pricing-badge">Best Value</div>
                        <div class="pricing-header">
                            <h3 class="pricing-title" style="color: var(--accent-gold);">Hunter Plan</h3>
                            <div class="pricing-price">
                                ₹999 <span>/ month</span>
                            </div>
                        </div>
                        <ul class="pricing-features-list">
                            <li class="pricing-feature-item highlight">
                                <span class="pricing-feature-icon">✓</span>
                                <div>All Scout features included</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Run Business Health Check website audits</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Lead Intelligence Scores and details unlocked</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>500 WhatsApp AI Pitches per month</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Unlimited CSV downloads and exports</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon">✓</span>
                                <div>Pipeline status tracking and CRM reminders</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-gold);">✓</span>
                                <div>Geospatial metrics & categorical opportunities</div>
                            </li>
                        </ul>
                        <button class="brand-btn pricing-btn" onclick="window.State.selectPlan('hunter');">
                            Select Hunter
                        </button>
                    </div>

                    <!-- Agency Plan -->
                    <div class="pricing-card">
                        <div class="pricing-header">
                            <h3 class="pricing-title" style="color: var(--accent-pink);">Agency Plan</h3>
                            <div class="pricing-price">
                                ₹2,499 <span>/ month</span>
                            </div>
                        </div>
                        <ul class="pricing-features-list">
                            <li class="pricing-feature-item highlight">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>All Hunter features with Unlimited AI Pitches</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>Lovable and Bolt website prompt builders</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>Lead CRM Kanban pipeline dashboard view</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>n8n connection hub webhook integration</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>Google Sheets sync push integrations</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>3 team seats and white label client reports</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span>
                                <div>Density heatmaps & custom market gaps index</div>
                            </li>
                        </ul>
                        <button class="brand-btn pricing-btn" style="background: linear-gradient(135deg, var(--accent-pink), #a855f7);" onclick="window.State.selectPlan('agency');">
                            Select Agency
                        </button>
                    </div>

                    <!-- Enterprise Plan -->
                    <div class="pricing-card" style="border: 1px dashed rgba(255,255,255,0.15);">
                        <div class="pricing-header">
                            <h3 class="pricing-title" style="color: white;">Enterprise Plan</h3>
                            <div class="pricing-price" style="font-size: 28px;">
                                Custom <span>/ pricing</span>
                            </div>
                        </div>
                        <ul class="pricing-features-list">
                            <li class="pricing-feature-item highlight">
                                <span class="pricing-feature-icon" style="color: white;">✓</span>
                                <div>Unlimited team seats & shared lists</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: white;">✓</span>
                                <div>Developer API access (PostgREST)</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: white;">✓</span>
                                <div>Custom city database scraper runs</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: white;">✓</span>
                                <div>Salesforce and HubSpot CRM sync</div>
                            </li>
                            <li class="pricing-feature-item">
                                <span class="pricing-feature-icon" style="color: white;">✓</span>
                                <div>Dedicated account manager & SLA</div>
                            </li>
                        </ul>
                        <a href="mailto:s8nservice@gmail.com?subject=NearPro%20Enterprise%20Plan%20Inquiry" class="brand-btn pricing-btn" style="background: var(--bg-surface); color: white; border: 1px solid var(--border); text-decoration: none; text-align: center; display: inline-flex; align-items: center; justify-content: center;">
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </section>
    `;
}
