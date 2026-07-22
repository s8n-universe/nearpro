export function renderFeatureShowcase() {
    const features = [
        {
            num: '01',
            tag: 'Pipeline',
            icon: 'map-pin',
            emoji: '📍',
            title: 'Smart Pipelines & Mapping',
            desc: 'See every lead on an interactive map and organize them into campaigns.',
            highlights: [
                'Coordinate maps with pin clusters',
                'Segment leads into client campaigns',
                'Kanban CRM board to track progress'
            ],
            color: 'gold'
        },
        {
            num: '02',
            tag: 'Audit',
            icon: 'zap',
            emoji: '⚡',
            title: 'Instant Website Audits',
            desc: 'Run a full website health check in 10 seconds flat.',
            highlights: [
                'PageSpeed, mobile & SSL checks',
                'Lost revenue estimation per prospect',
                'One-click audit from any lead card'
            ],
            color: 'pink'
        },
        {
            num: '03',
            tag: 'Outreach',
            icon: 'message-square',
            emoji: '💬',
            title: 'AI Outreach & Personalization',
            desc: 'Generate cold pitches that actually convert — in Hinglish or English.',
            highlights: [
                'AI conversion scoring per lead',
                'WhatsApp, Email & Instagram DM',
                'Hinglish + English tone options'
            ],
            color: 'gold'
        },
        {
            num: '04',
            tag: 'Integrations',
            icon: 'link',
            emoji: '🔗',
            title: 'Integration Connection Hub',
            desc: 'Push leads to your favorite tools — zero manual data entry.',
            highlights: [
                'Direct Google Sheets sync',
                'Custom n8n webhook pipelines',
                'Automate Slack & email workflows'
            ],
            color: 'pink'
        },
        {
            num: '05',
            tag: 'Team',
            icon: 'users',
            emoji: '👥',
            title: 'Collaborative Team Workspace',
            desc: 'Work together on lead lists and client deliverables.',
            highlights: [
                'Invite team members & assign seats',
                'Share smart lists across the team',
                'White-label client reports'
            ],
            color: 'gold'
        },
        {
            num: '06',
            tag: 'Builder',
            icon: 'code',
            emoji: '🛠️',
            title: 'Website Builder Prompts',
            desc: 'Turn audit results into a ready-to-build website brief.',
            highlights: [
                'Prompts for Bolt.new & Lovable',
                'Copy-paste into any AI builder',
                'Rebuilds outdated sites in 1 click'
            ],
            isNew: true,
            color: 'pink'
        },
        {
            num: '07',
            tag: 'CRM Sync',
            icon: 'refresh-cw',
            emoji: '🔄',
            title: 'Zoho & HubSpot CRM Sync',
            desc: 'Qualified leads flow straight into your existing CRM.',
            highlights: [
                'Zoho CRM + HubSpot connectors',
                'Auto-update deal pipeline stages',
                'Full sync history & error logs'
            ],
            isNew: true,
            color: 'gold'
        },
        {
            num: '08',
            tag: 'Vault',
            icon: 'folder-open',
            emoji: '📂',
            title: 'Outreach Document Vault',
            desc: 'Store pitch materials and attach them to campaigns on-the-fly.',
            highlights: [
                'Upload brochures, decks & catalogs',
                'Attach files to WhatsApp & email',
                'Organize by campaign or client'
            ],
            isNew: true,
            color: 'pink'
        }
    ];

    const featureCards = features.map((f, i) => `
        <div class="feature-card-v2 feature-card-v2--${f.color}" style="animation-delay: ${i * 0.08}s">
            <div class="feature-card-v2__header">
                <span class="feature-card-v2__num">${f.num}</span>
                <span class="feature-card-v2__tag">${f.tag}</span>
                ${f.isNew ? '<span class="feature-card-v2__new">NEW</span>' : ''}
            </div>
            <div class="feature-card-v2__icon-row">
                <div class="feature-card-v2__icon-circle feature-card-v2__icon-circle--${f.color}">
                    <i data-lucide="${f.icon}" style="width:22px; height:22px;"></i>
                </div>
            </div>
            <h3 class="feature-card-v2__title">${f.title}</h3>
            <p class="feature-card-v2__desc">${f.desc}</p>
            <ul class="feature-card-v2__highlights">
                ${f.highlights.map(h => `<li><span class="feature-card-v2__bullet feature-card-v2__bullet--${f.color}">→</span>${h}</li>`).join('')}
            </ul>
        </div>
    `).join('');

    return `
        <section class="marketing-features" id="features-section">
            <div class="container">
                <div class="features-title-wrap">
                    <span class="features-overline">What You Get</span>
                    <h2>Lead Intelligence & Outreach Features</h2>
                    <p>NearPro transforms raw business directory search results into actionable sales pipelines. Find leads, audit websites, generate AI outreach, and track conversions.</p>
                </div>
                <div class="features-grid-v2">
                    ${featureCards}
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
                                <div>Add custom notes & lead tags</div>
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
                                <div>Custom city database discovery runs</div>
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
