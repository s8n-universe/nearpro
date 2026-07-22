export function renderFeatureShowcase() {
    const features = [
        {
            id: 'pipelines',
            num: '01',
            tag: 'Pipelines',
            icon: 'map-pin',
            title: 'Smart Pipelines & Mapping',
            desc: 'See every lead pinned live on an interactive coordinate map and segment them into campaigns.',
            highlights: [
                'Interactive coordinate maps with pin clusters',
                'Segment results into named client campaigns',
                'Lead CRM Kanban board with 5 deal stages'
            ],
            color: 'gold',
            isNew: false
        },
        {
            id: 'crm',
            num: '02',
            tag: 'CRM Hub',
            icon: 'cpu',
            title: '360° AI Deal Workstation',
            desc: 'The command center where every lead\'s proposal, script, pitch, and audit lives in one place.',
            highlights: [
                'Kanban board + 360° Feature Matrix view',
                'Pipeline value calculator (₹30k/lead average)',
                'Activity heatmap & lead intake trend charts'
            ],
            color: 'pink',
            isNew: true
        },
        {
            id: 'audit',
            num: '03',
            tag: 'Audit',
            icon: 'zap',
            title: 'Instant Website Audits',
            desc: 'Run a full website health check in 10 seconds and show prospects exactly how much money they are losing.',
            highlights: [
                'PageSpeed, mobile & SSL status checks',
                'Lost monthly revenue estimator per prospect',
                'One click audit launch from any lead card'
            ],
            color: 'gold',
            isNew: false
        },
        {
            id: 'proposals',
            num: '04',
            tag: 'Proposals',
            icon: 'file-text',
            title: 'One Click PDF Proposals',
            desc: 'Generate a branded 3 page client audit proposal ready to send over WhatsApp in under 30 seconds.',
            highlights: [
                'Google Maps review gap math included',
                'PageSpeed bottlenecks + 3 tier pricing',
                'Shareable PDF link or web preview'
            ],
            color: 'pink',
            isNew: true
        },
        {
            id: 'call-scripts',
            num: '05',
            tag: 'Sales Calls',
            icon: 'phone-call',
            title: 'AI Tele Sales Teleprompter',
            desc: 'Live call scripts with objection rebuttals you can click during the call or never go blank again.',
            highlights: [
                '30 second pattern interrupt openers',
                'Live objection rebuttal cards per category',
                '1 click WhatsApp follow up post call'
            ],
            color: 'gold',
            isNew: true
        },
        {
            id: 'outreach',
            num: '06',
            tag: 'AI Outreach',
            icon: 'message-square',
            title: 'AI Outreach & Personalization',
            desc: 'Generate cold pitches that convert customized per lead, in Hinglish or English.',
            highlights: [
                'AI conversion scoring per lead from 0 to 100',
                'WhatsApp, Email & Instagram DM formats',
                'Hinglish + English tone options'
            ],
            color: 'pink',
            isNew: false
        },
        {
            id: 'integrations',
            num: '07',
            tag: 'Integrations',
            icon: 'link',
            title: 'Integration Connection Hub',
            desc: 'Push leads to your favourite tools automatically zero manual data entry required.',
            highlights: [
                'Direct Google Sheets sync via Apps Script',
                'Custom n8n & Make.com webhook pipelines',
                'Auto trigger on CRM stage changes'
            ],
            color: 'gold',
            isNew: false
        },
        {
            id: 'team',
            num: '08',
            tag: 'Team',
            icon: 'users',
            title: 'Collaborative Team Workspace',
            desc: 'Work together on leads, campaigns, and client reports without stepping on each other.',
            highlights: [
                'Invite team members & assign roles',
                'Share smart lists across the workspace',
                'White label client reports for delivery'
            ],
            color: 'pink',
            isNew: false
        },
        {
            id: 'builder',
            num: '09',
            tag: 'Builder',
            icon: 'code',
            title: 'Website Builder Prompts',
            desc: 'Turn audit results into a ready to paste website brief for any AI builder one click.',
            highlights: [
                'Precision prompts for Bolt.new & Lovable',
                'Production ready with JSON LD schema',
                'Includes WhatsApp CTA & India specific copy'
            ],
            color: 'gold',
            isNew: false
        },
        {
            id: 'crm-sync',
            num: '10',
            tag: 'CRM Sync',
            icon: 'refresh-cw',
            title: 'Zoho & HubSpot CRM Sync',
            desc: 'Qualified leads flow straight into your existing CRM no copy pasting contacts ever again.',
            highlights: [
                'Zoho CRM + HubSpot direct connectors',
                'Auto update deal pipeline stages',
                'Full sync history & error log dashboard'
            ],
            color: 'pink',
            isNew: false
        },
        {
            id: 'vault',
            num: '11',
            tag: 'Vault',
            icon: 'folder-open',
            title: 'Outreach Document Vault',
            desc: 'Upload pitch decks and brochures, then attach them to any campaign with one tap.',
            highlights: [
                'Upload brochures, decks & catalogs (PDF)',
                'Custom branded short link per document',
                '10 year permanent signed links that never expire'
            ],
            color: 'gold',
            isNew: false
        }
    ];

    const featureCards = features.map((f, i) => `
        <a href="#/features/${f.id}" class="feature-card-v2 feature-card-v2--${f.color}" style="animation-delay: ${i * 0.07}s; text-decoration: none;">
            <div class="feature-card-v2__header">
                <span class="feature-card-v2__num">${f.num}</span>
                <span class="feature-card-v2__tag feature-card-v2__tag--${f.color}">${f.tag}</span>
                ${f.isNew ? '<span class="feature-card-v2__new">NEW</span>' : ''}
            </div>

            <div class="feature-card-v2__icon-circle feature-card-v2__icon-circle--${f.color}">
                <i data-lucide="${f.icon}" style="width:22px; height:22px;"></i>
            </div>

            <h3 class="feature-card-v2__title">${f.title}</h3>
            <p class="feature-card-v2__desc">${f.desc}</p>

            <ul class="feature-card-v2__highlights">
                ${f.highlights.map(h => `
                    <li>
                        <span class="feature-card-v2__bullet feature-card-v2__bullet--${f.color}">→</span>
                        ${h}
                    </li>`).join('')}
            </ul>
            
            <div class="feature-card-v2__learn-more" style="margin-top: 14px; display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: ${f.color === 'gold' ? 'var(--accent-gold)' : 'var(--accent-pink)'};">
                Learn how to leverage this feature ➔
            </div>
        </a>
    `).join('');

    return `
        <section class="marketing-features" id="features-section">
            <div class="container">
                <div class="features-title-wrap">
                    <span class="features-overline">Everything You Get</span>
                    <h2>Lead Intelligence &amp; Outreach Features</h2>
                    <p>NearPro transforms raw business directory search results into actionable sales pipelines. Find leads, audit websites, generate AI outreach, and close deals.</p>
                </div>

                <div class="features-grid-v2">
                    ${featureCards}
                </div>
            </div>
        </section>


        <!-- Interactive B2B Sales ROI Calculator -->
        <section class="roi-calculator-section" style="padding: 60px 0; background: rgba(255,255,255,0.01); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
            <div class="container">
                <div class="features-title-wrap" style="margin-bottom: 32px; text-align: center;">
                    <span style="font-family: var(--font-mono); font-size: 12px; color: var(--accent-gold); text-transform: uppercase;">ROI Planner</span>
                    <h2 style="font-size: 28px; margin-top: 8px;">Estimate Your Acquisition Revenue</h2>
                    <p style="max-width: 600px; margin: 12px auto 0; font-size: 14.5px; color: var(--text-secondary); line-height: 1.6;">
                        Input your target values below to see how fast a single client acquisition pays off your premium subscription.
                    </p>
                </div>
                
                <div style="max-width: 800px; margin: 0 auto; background: var(--bg-surface); border: 1.5px solid var(--border); border-radius: var(--radius-lg); padding: 32px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.4);">
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13.5px; font-weight: 600; color: white;">
                                <span>Monthly Leads Pitched</span>
                                <span id="leadsPitchedVal" style="color: var(--accent-gold); font-family: var(--font-mono);">150 leads</span>
                            </div>
                            <input type="range" id="leadsPitchedRange" min="20" max="500" value="150" style="width: 100%; accent-color: var(--accent-gold); cursor: pointer;" />
                        </div>
                        
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13.5px; font-weight: 600; color: white;">
                                <span>Pitch Success Rate</span>
                                <span id="successRateVal" style="color: var(--accent-gold); font-family: var(--font-mono);">2.0%</span>
                            </div>
                            <input type="range" id="successRateRange" min="0.5" max="10" step="0.5" value="2.0" style="width: 100%; accent-color: var(--accent-gold); cursor: pointer;" />
                        </div>

                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13.5px; font-weight: 600; color: white;">
                                <span>Retainer Deal Size</span>
                                <span id="dealSizeVal" style="color: var(--accent-gold); font-family: var(--font-mono);">₹15,000 / mo</span>
                            </div>
                            <input type="range" id="dealSizeRange" min="5000" max="60000" step="5000" value="15000" style="width: 100%; accent-color: var(--accent-gold); cursor: pointer;" />
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.02); border: 1px dashed var(--border); border-radius: var(--radius-md); padding: 24px; display: flex; flex-direction: column; justify-content: center; text-align: center; gap: 16px;">
                        <div>
                            <span style="font-size: 11px; font-weight: 800; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px;">ESTIMATED NEW RETAINERS</span>
                            <h3 id="clientsAcquired" style="font-size: 32px; color: white; font-weight: 800; margin: 4px 0;">3 clients</h3>
                        </div>
                        <hr style="border: none; border-top: 1px solid var(--border);">
                        <div>
                            <span style="font-size: 11px; font-weight: 800; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px;">ESTIMATED MONTHLY REVENUE</span>
                            <h2 id="revenueAcquired" style="font-size: 40px; color: #22c55e; font-weight: 800; margin: 4px 0;">₹45,000</h2>
                            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">
                                ROI on Hunter Plan (₹999): <strong style="color: var(--accent-gold);" id="roiMultiplier">45x return</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Pricing Section -->
        <section class="pricing-section">
            <div class="container">
                <div class="pricing-urgency-banner" style="max-width: 500px; margin: 0 auto 36px; padding: 10px 20px; background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.25); border-radius: 50px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);">
                    <span style="font-size: 13px;">⚡</span>
                    <span style="font-size: 12.5px; font-weight: 700; color: #ef4444; letter-spacing: 0.2px; text-transform: uppercase;">Introductory 50% discount ends in:</span>
                    <span id="promoCountdown" style="font-family: var(--font-mono); font-size: 13.5px; font-weight: 800; color: white; background: #ef4444; padding: 2px 8px; border-radius: 4px;">02h 45m 12s</span>
                </div>
                
                <div class="features-title-wrap" style="margin-bottom: 48px; text-align: center;">
                    <span style="font-family: var(--font-mono); font-size: 12px; color: var(--accent-gold); text-transform: uppercase;">Monetization &amp; Growth</span>
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
                            <div class="pricing-price">₹499 <span>/ month</span></div>
                        </div>
                        <ul class="pricing-features-list">
                            <li class="pricing-feature-item"><span class="pricing-feature-icon">✓</span><div>Unlocked phone numbers and websites</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon">✓</span><div>Interactive spatial coordinates maps</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon">✓</span><div>Export up to 100 CSV leads per month</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon">✓</span><div>Track 5 Smart Lists with 50 leads each</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon">✓</span><div>Add custom notes &amp; lead tags</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon" style="color: var(--accent-gold);">✓</span><div>Basic rating, completeness &amp; review stats</div></li>
                        </ul>
                        <button class="brand-btn pricing-btn" onclick="window.State.selectPlan('scout');">Select Scout</button>
                    </div>

                    <!-- Hunter Plan -->
                    <div class="pricing-card popular">
                        <div class="pricing-badge">Best Value</div>
                        <div class="pricing-header">
                            <h3 class="pricing-title" style="color: var(--accent-gold);">Hunter Plan</h3>
                            <div class="pricing-price">₹999 <span>/ month</span></div>
                        </div>
                        <ul class="pricing-features-list">
                            <li class="pricing-feature-item highlight"><span class="pricing-feature-icon">✓</span><div>All Scout features included</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon">✓</span><div>Run Business Health Check website audits</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon">✓</span><div>Lead Intelligence Scores and details unlocked</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon">✓</span><div>500 WhatsApp AI Pitches per month</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon">✓</span><div>Unlimited CSV downloads and exports</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon">✓</span><div>Pipeline status tracking and CRM reminders</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon" style="color: var(--accent-gold);">✓</span><div>Geospatial metrics &amp; categorical opportunities</div></li>
                        </ul>
                        <button class="brand-btn pricing-btn" onclick="window.State.selectPlan('hunter');">Select Hunter</button>
                    </div>

                    <!-- Agency Plan -->
                    <div class="pricing-card">
                        <div class="pricing-header">
                            <h3 class="pricing-title" style="color: var(--accent-pink);">Agency Plan</h3>
                            <div class="pricing-price">₹2,499 <span>/ month</span></div>
                        </div>
                        <ul class="pricing-features-list">
                            <li class="pricing-feature-item highlight"><span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span><div>All Hunter features with Unlimited AI Pitches</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span><div>Lovable and Bolt website prompt builders</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span><div>Lead CRM Kanban pipeline dashboard view</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span><div>n8n connection hub webhook integration</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span><div>Google Sheets sync push integrations</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span><div>3 team seats and white label client reports</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon" style="color: var(--accent-pink);">✓</span><div>Density heatmaps &amp; custom market gaps index</div></li>
                        </ul>
                        <button class="brand-btn pricing-btn" style="background: linear-gradient(135deg, var(--accent-pink), #a855f7);" onclick="window.State.selectPlan('agency');">Select Agency</button>
                    </div>

                    <!-- Enterprise Plan -->
                    <div class="pricing-card" style="border: 1px dashed rgba(255,255,255,0.15);">
                        <div class="pricing-header">
                            <h3 class="pricing-title" style="color: white;">Enterprise Plan</h3>
                            <div class="pricing-price" style="font-size: 28px;">Custom <span>/ pricing</span></div>
                        </div>
                        <ul class="pricing-features-list">
                            <li class="pricing-feature-item highlight"><span class="pricing-feature-icon" style="color: white;">✓</span><div>Unlimited team seats &amp; shared lists</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon" style="color: white;">✓</span><div>Developer API access (PostgREST)</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon" style="color: white;">✓</span><div>Custom city database discovery runs</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon" style="color: white;">✓</span><div>Salesforce and HubSpot CRM sync</div></li>
                            <li class="pricing-feature-item"><span class="pricing-feature-icon" style="color: white;">✓</span><div>Dedicated account manager &amp; SLA</div></li>
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

export function bindFeatureShowcaseEvents() {
    // 1. ROI Calculator Logic
    const pitchedRange = document.getElementById('leadsPitchedRange');
    const successRange = document.getElementById('successRateRange');
    const dealRange = document.getElementById('dealSizeRange');

    const pitchedVal = document.getElementById('leadsPitchedVal');
    const successVal = document.getElementById('successRateVal');
    const dealVal = document.getElementById('dealSizeVal');

    const clientsAcquired = document.getElementById('clientsAcquired');
    const revenueAcquired = document.getElementById('revenueAcquired');
    const roiMultiplier = document.getElementById('roiMultiplier');

    function updateCalculations() {
        if (!pitchedRange || !successRange || !dealRange) return;

        const leads = parseInt(pitchedRange.value);
        const rate = parseFloat(successRange.value);
        const deal = parseInt(dealRange.value);

        if (pitchedVal) pitchedVal.innerText = `${leads} leads`;
        if (successVal) successVal.innerText = `${rate.toFixed(1)}%`;
        if (dealVal) dealVal.innerText = `₹${deal.toLocaleString('en-IN')} / mo`;

        // Calculate acquired clients
        const clients = Math.round(leads * (rate / 100));
        const finalClients = Math.max(1, clients); // Minimum 1 to show value
        const monthlyRevenue = finalClients * deal;

        if (clientsAcquired) clientsAcquired.innerText = `${finalClients} client${finalClients > 1 ? 's' : ''}`;
        if (revenueAcquired) revenueAcquired.innerText = `₹${monthlyRevenue.toLocaleString('en-IN')}`;

        // ROI Multiplier calculation (against Hunter Plan ₹999)
        const multiplier = Math.round(monthlyRevenue / 999);
        if (roiMultiplier) roiMultiplier.innerText = `${multiplier}x return`;
    }

    if (pitchedRange) pitchedRange.addEventListener('input', updateCalculations);
    if (successRange) successRange.addEventListener('input', updateCalculations);
    if (dealRange) dealRange.addEventListener('input', updateCalculations);

    updateCalculations();

    // 2. Promotional Countdown Timer (resets or counts down to 2 hours, 45 minutes)
    let totalSeconds = 2 * 3600 + 45 * 60 + 12; // 2h 45m 12s
    const countdownEl = document.getElementById('promoCountdown');

    if (window._promoInterval) clearInterval(window._promoInterval);

    if (countdownEl) {
        window._promoInterval = setInterval(() => {
            if (totalSeconds <= 0) {
                totalSeconds = 2 * 3600 + 45 * 60 + 12; // Loop for urgency
            }
            totalSeconds--;

            const hrs = Math.floor(totalSeconds / 3600);
            const mins = Math.floor((totalSeconds % 3600) / 60);
            const secs = totalSeconds % 60;

            const format = (num) => String(num).padStart(2, '0');
            countdownEl.innerText = `${format(hrs)}h ${format(mins)}m ${format(secs)}s`;
        }, 1000);
    }

    // 3. Floating Social Proof Notification Ticker (slides up/down from bottom-left corner)
    if (window._socialProofInterval) clearInterval(window._socialProofInterval);
    
    let toast = document.getElementById('socialProofToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'socialProofToast';
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 24px;
            background: #09090b;
            border: 1.5px solid var(--border);
            border-radius: var(--radius-md);
            padding: 12px 18px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.65);
            z-index: 100000;
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateY(120px);
            opacity: 0;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            max-width: 340px;
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    
    const messages = [
        { emoji: "🔥", text: "CA Rahul from Bandra just upgraded to <strong>Hunter Tier</strong>!" },
        { emoji: "🚀", text: "Agency Growth upgraded to <strong>Agency Tier</strong> to unlock Google Sheets sync!" },
        { emoji: "💸", text: "Freelancer Rohan closed a <strong>₹30,000 contract</strong> using a NearPro Gap Lead!" },
        { emoji: "⭐", text: "Dr. Nair's clinic optimized their ratings and reviews using the PDF audit!" },
        { emoji: "📞", text: "Sales agent Priya secured 3 client meetings today using the warm opener scripts!" }
    ];
    
    let msgIndex = 0;
    const showNextProof = () => {
        // Only trigger if we are currently on the homepage (marketing layout visible)
        if (!document.querySelector('.marketing-hero')) {
            toast.style.display = 'none';
            return;
        }
        toast.style.display = 'flex';
        const msg = messages[msgIndex];
        toast.innerHTML = `
            <span style="font-size: 20px; background: rgba(255,255,255,0.04); width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;">${msg.emoji}</span>
            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; font-family: var(--font-body);">${msg.text}</div>
        `;
        
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.transform = 'translateY(120px)';
            toast.style.opacity = '0';
        }, 4500);
        
        msgIndex = (msgIndex + 1) % messages.length;
    };
    
    setTimeout(showNextProof, 3000);
    window._socialProofInterval = setInterval(showNextProof, 9500);
}

