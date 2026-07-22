import { renderHeader, bindHeaderEvents } from './Header.js';

export function renderFeatureDetailPage(id) {
    const featureData = {
        pipelines: {
            title: "Smart Pipelines & Mapping",
            overline: "Spatial Lead Targeter",
            tag: "Pipelines & Maps",
            color: "gold",
            tierAccess: "Scout Plan or Higher",
            description: "Locate target leads visually on coordinate maps. Segment results into client campaigns, save leads, and track progress using the Lead CRM kanban board.",
            howToUse: [
                "Open the <strong>Smart Maps</strong> view from your dashboard workstation.",
                "Apply filters to isolate target niches (e.g., Dentists) with low ratings or no website within a specific neighborhood radius.",
                "Draw custom region boundaries or click pin clusters to save target leads directly into a named client acquisition campaign."
            ],
            mockup: `
                <div class="mock-browser-window">
                    <div class="mock-browser-header">
                        <div class="mock-browser-dots">
                            <span class="mock-dot red"></span>
                            <span class="mock-dot yellow"></span>
                            <span class="mock-dot green"></span>
                        </div>
                        <div class="mock-browser-address">https://nearpro.s8n.in/#/dashboard/maps</div>
                    </div>
                    <div class="mock-browser-content maps-mock">
                        <div class="mock-map-sidebar">
                            <div class="mock-sidebar-header">
                                <span class="mock-badge gold">📍 Active Region</span>
                                <h4>Bandra West, Mumbai</h4>
                            </div>
                            <div class="mock-sidebar-leads">
                                <div class="mock-lead-row active">
                                    <strong>Bandra Dental Care</strong>
                                    <span>Rating: 4.2★ (32 reviews)</span>
                                </div>
                                <div class="mock-lead-row">
                                    <strong>Absolute Hair Salon</strong>
                                    <span>Rating: 3.9★ (15 reviews)</span>
                                </div>
                                <div class="mock-lead-row">
                                    <strong>Zenith Clinic</strong>
                                    <span>Rating: 4.0★ (8 reviews)</span>
                                </div>
                            </div>
                        </div>
                        <div class="mock-map-canvas">
                            <div class="mock-map-grid"></div>
                            <div class="mock-map-pin pin-1 active" style="top: 35%; left: 45%;">
                                <span class="pin-marker">📍</span>
                                <div class="pin-popup">
                                    <h5>Bandra Dental Care</h5>
                                    <p>Website: Unoptimized</p>
                                    <span class="popup-cta">Click to track ➔</span>
                                </div>
                            </div>
                            <div class="mock-map-pin pin-2" style="top: 55%; left: 65%;">
                                <span class="pin-marker">📍</span>
                            </div>
                            <div class="mock-map-pin pin-3" style="top: 20%; left: 70%;">
                                <span class="pin-marker">📍</span>
                            </div>
                            <div class="mock-map-cluster" style="top: 60%; left: 30%;">8</div>
                        </div>
                    </div>
                </div>
            `
        },
        crm: {
            title: "360° AI Deal Workstation (CRM)",
            overline: "Unified Deal Command Center",
            tag: "CRM Operating Hub",
            color: "pink",
            tierAccess: "Scout Plan or Higher",
            description: "Consolidate pipeline analytics, custom notes, call scripts, and PDF audits in a single interactive drag and drop workspace.",
            howToUse: [
                "Navigate to the <strong>360° AI Deal Hub</strong> tab on your dashboard sidebar.",
                "Review new leads incoming from the directory. Drag and drop cards between stages to update deal progression (New ➔ Contacted ➔ Offer Sent ➔ Closed).",
                "Use the quick shortcut buttons on each card to trigger 1 click proposals, scripts, or pitches dynamically tailored to that lead."
            ],
            mockup: `
                <div class="mock-browser-window">
                    <div class="mock-browser-header">
                        <div class="mock-browser-dots">
                            <span class="mock-dot red"></span>
                            <span class="mock-dot yellow"></span>
                            <span class="mock-dot green"></span>
                        </div>
                        <div class="mock-browser-address">https://nearpro.s8n.in/#/dashboard/crm</div>
                    </div>
                    <div class="mock-browser-content crm-mock">
                        <div class="mock-crm-analytics">
                            <div class="analytics-card">
                                <span class="analytics-title">EST. PIPELINE VALUE</span>
                                <span class="analytics-value">₹1,80,000</span>
                                <span class="analytics-sub">6 active opportunities</span>
                            </div>
                            <div class="analytics-card">
                                <span class="analytics-title">CONVERSION RATE</span>
                                <span class="analytics-value text-green">24.3%</span>
                                <span class="analytics-sub">+3.2% this week</span>
                            </div>
                            <div class="analytics-card">
                                <span class="analytics-title">ACTIVITY MATRIX</span>
                                <div class="mock-heatmap">
                                    <span class="cell active"></span>
                                    <span class="cell active"></span>
                                    <span class="cell"></span>
                                    <span class="cell active"></span>
                                    <span class="cell active"></span>
                                </div>
                            </div>
                        </div>
                        <div class="mock-kanban-board">
                            <div class="kanban-col">
                                <div class="col-title">NEW LEADS (2)</div>
                                <div class="kanban-card">
                                    <h5>Bandra Dental Care</h5>
                                    <span class="card-meta">Rating: 4.2★ &middot; ₹30k deal</span>
                                    <div class="card-ctas">
                                        <button class="mini-btn text-blue">📄 Proposal</button>
                                        <button class="mini-btn text-green">📞 Script</button>
                                    </div>
                                </div>
                            </div>
                            <div class="kanban-col">
                                <div class="col-title">CONTACTED (1)</div>
                                <div class="kanban-card">
                                    <h5>Absolute Hair Salon</h5>
                                    <span class="card-meta">Rating: 3.9★ &middot; ₹30k deal</span>
                                    <div class="card-ctas">
                                        <button class="mini-btn text-purple">⚡ Pitch</button>
                                    </div>
                                </div>
                            </div>
                            <div class="kanban-col">
                                <div class="col-title">OFFER SENT (1)</div>
                                <div class="kanban-card highlighted">
                                    <h5>Zenith Clinic</h5>
                                    <span class="card-meta text-gold">⭐ Priority Deal</span>
                                    <div class="card-ctas">
                                        <button class="mini-btn text-gold">📄 Resend Proposal</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        audit: {
            title: "Instant Website Audits",
            overline: "10 Second Technical Scanner",
            tag: "Automated Audit",
            color: "gold",
            tierAccess: "Hunter Plan or Higher",
            description: "Audit any business URL instantly. Measure performance metrics, evaluate mobile friendliness, check SSL configuration, and estimate monthly lost revenue.",
            howToUse: [
                "Access the <strong>Business Health Check</strong> tab in your workspace.",
                "Select a tracked lead or paste any external business website URL, then click 'Run Scan'.",
                "Review the color coded issues and share the revenue leak calculation to capture your prospect's attention."
            ],
            mockup: `
                <div class="mock-browser-window">
                    <div class="mock-browser-header">
                        <div class="mock-browser-dots">
                            <span class="mock-dot red"></span>
                            <span class="mock-dot yellow"></span>
                            <span class="mock-dot green"></span>
                        </div>
                        <div class="mock-browser-address">https://nearpro.s8n.in/#/dashboard/audit</div>
                    </div>
                    <div class="mock-browser-content audit-mock">
                        <div class="audit-target-bar">
                            <span>Target URL:</span>
                            <strong>https://bandradentalcare.com</strong>
                            <span class="audit-status-badge text-red">Scan Finished</span>
                        </div>
                        <div class="audit-grid">
                            <div class="audit-circle-card">
                                <div class="audit-radial-outer">
                                    <div class="audit-radial-inner red">34</div>
                                </div>
                                <h5>PageSpeed Score</h5>
                                <p class="text-red">Extremely Slow</p>
                            </div>
                            <div class="audit-metrics">
                                <div class="metric-row error">
                                    <span>📱 Mobile Layout</span>
                                    <strong>Unoptimized</strong>
                                </div>
                                <div class="metric-row success">
                                    <span>🔒 SSL Security</span>
                                    <strong>Active (HTTPS)</strong>
                                </div>
                                <div class="metric-row warning">
                                    <span>🏷️ JSON-LD Schema</span>
                                    <strong>Missing</strong>
                                </div>
                                <div class="metric-row error">
                                    <span>⏱️ Load Time</span>
                                    <strong>6.8 Seconds</strong>
                                </div>
                            </div>
                        </div>
                        <div class="audit-revenue-loss-card">
                            <div class="loss-emoji">💸</div>
                            <div class="loss-details">
                                <h4>Estimated Lost Revenue</h4>
                                <h3>₹8,500 <span class="per-month">/ month</span></h3>
                                <p>due to slow mobile load speed and missing Google maps schema validation.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        proposals: {
            title: "One Click PDF Proposals",
            overline: "Conversion Oriented Collateral",
            tag: "PDF Proposal",
            color: "pink",
            tierAccess: "Scout Plan or Higher",
            description: "Generate customized client ready audit proposals with Google Maps review gap calculations, PageSpeed details, and package pricing.",
            howToUse: [
                "Open the <strong>PDF Proposals</strong> tab on your dashboard sidebar.",
                "Choose a saved lead to audit. The engine fetches GSC and Maps statistics automatically.",
                "Click 'Generate Proposal'. Download the PDF file or copy the permanent 10 year signed link to dispatch directly over WhatsApp."
            ],
            mockup: `
                <div class="mock-browser-window">
                    <div class="mock-browser-header">
                        <div class="mock-browser-dots">
                            <span class="mock-dot red"></span>
                            <span class="mock-dot yellow"></span>
                            <span class="mock-dot green"></span>
                        </div>
                        <div class="mock-browser-address">https://nearpro.s8n.in/#/dashboard/proposals</div>
                    </div>
                    <div class="mock-browser-content proposal-mock">
                        <div class="proposal-doc-preview">
                            <div class="doc-page">
                                <div class="doc-header">
                                    <span class="doc-brand">NEARPRO GROWTH SERVICES</span>
                                    <span class="doc-date">Confidential Proposal</span>
                                </div>
                                <h2 class="doc-title">B2B GROWTH & AUDIT PROPOSAL</h2>
                                <p class="doc-subtitle">Prepared for: <strong>Bandra Dental Care</strong></p>
                                
                                <div class="doc-section">
                                    <h4>1. Google Maps Review Gap Math</h4>
                                    <p>Your business rating is <strong>4.2★</strong> (32 reviews). Competitors in Bandra West average <strong>4.8★</strong>.</p>
                                    <div class="mock-gap-math">
                                        <span>🚨 Review Deficit:</span>
                                        <strong>45 positive reviews</strong>
                                        <span>needed to reach a trusted 4.8★ rating.</span>
                                    </div>
                                </div>

                                <div class="doc-section">
                                    <h4>2. Recommended Packages</h4>
                                    <div class="mock-doc-packages">
                                        <div class="doc-pkg">
                                            <h5>Standard</h5>
                                            <strong>₹15,000</strong>
                                            <span>SSL + Schema fix</span>
                                        </div>
                                        <div class="doc-pkg active">
                                            <h5>Growth Pack</h5>
                                            <strong>₹30,000</strong>
                                            <span>Full SEO + Rebuild</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        "call-scripts": {
            title: "AI Tele Sales Teleprompter",
            overline: "Interactive Calling Assistant",
            tag: "Tele-Sales Scripts",
            color: "gold",
            tierAccess: "Scout Plan or Higher",
            description: "Access category-specific call scripts and live objection response cards. Handle gatekeepers, pricing, or busy clients with ease.",
            howToUse: [
                "Open the <strong>Tele-Sales Scripts</strong> tab during your calling session.",
                "Choose the lead to pull their category-specific 30 second pattern interrupt call script.",
                "Click on objection rebuttal tabs in real time as the client speaks to display tailored objection responses."
            ],
            mockup: `
                <div class="mock-browser-window">
                    <div class="mock-browser-header">
                        <div class="mock-browser-dots">
                            <span class="mock-dot red"></span>
                            <span class="mock-dot yellow"></span>
                            <span class="mock-dot green"></span>
                        </div>
                        <div class="mock-browser-address">https://nearpro.s8n.in/#/dashboard/call-scripts</div>
                    </div>
                    <div class="mock-browser-content calling-mock">
                        <div class="script-header">
                            <span class="mock-badge green">📞 Live Call Teleprompter</span>
                            <h4>Target: Dr. Ritu (Bandra Dental Care)</h4>
                        </div>
                        <div class="script-body">
                            <div class="script-panel">
                                <h5>Warm Opener (30 Second Pattern Interrupt)</h5>
                                <p class="script-paragraph">
                                    "Hi Dr. Ritu, I know you're busy running the clinic, so I'll be brief. I noticed your Bandra clinic is losing out on online bookings because your mobile site takes 6.8 seconds to load. I actually built a demo mock layout to fix this..."
                                </p>
                            </div>
                            <div class="objection-workspace">
                                <span class="section-label">LIVE OBJECTION TABS:</span>
                                <div class="objection-tabs">
                                    <button class="obj-tab active">No Budget</button>
                                    <button class="obj-tab">Too Busy</button>
                                    <button class="obj-tab">Have Agency</button>
                                </div>
                                <div class="objection-card">
                                    <strong>REBUTTAL SCRIPT (No Budget):</strong>
                                    <p>"I completely understand. We actually show how you lose ₹8,500/mo due to slow speed. Let's fix that layout leak first and the site pays for itself..."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        outreach: {
            title: "AI Outreach & Personalization",
            overline: "Custom Cold Pitch Generator",
            tag: "AI Outreach",
            color: "pink",
            tierAccess: "Scout Plan or Higher",
            description: "Automatically generate cold message drafts tailored for WhatsApp, email, or Instagram DM. Write templates in Hinglish or English to increase conversions.",
            howToUse: [
                "Navigate to the <strong>AI Outreach Studio</strong> sidebar tab.",
                "Pick a target lead, select your outreach platform (WhatsApp / Email), and select your language/tone (English / Hinglish).",
                "Click 'Generate Pitch'. Review the variables, click Copy, or launch WhatsApp Web directly from the screen."
            ],
            mockup: `
                <div class="mock-browser-window">
                    <div class="mock-browser-header">
                        <div class="mock-browser-dots">
                            <span class="mock-dot red"></span>
                            <span class="mock-dot yellow"></span>
                            <span class="mock-dot green"></span>
                        </div>
                        <div class="mock-browser-address">https://nearpro.s8n.in/#/dashboard/outreach</div>
                    </div>
                    <div class="mock-browser-content outreach-mock">
                        <div class="outreach-layout">
                            <div class="outreach-left">
                                <h5>Target Leads</h5>
                                <div class="mini-lead active">Bandra Dental Care</div>
                                <div class="mini-lead">Absolute Hair Salon</div>
                            </div>
                            <div class="outreach-right">
                                <div class="settings-row">
                                    <span class="setting-item">Channel: <strong>WhatsApp</strong></span>
                                    <span class="setting-item">Language: <strong>Hinglish 🇮🇳</strong></span>
                                </div>
                                <div class="pitch-editor">
                                    <div class="pitch-bubble">
                                        <p>Hello Dr. Ritu, Maine aapki clinic website audit ki. Speed index 34 hai jiski wajah se <strong>₹8,500 monthly loss</strong> ho raha hai. Maine aapki brand ke liye ek mobile friendly demo design kiya hai: <span class="highlight-var">https://nearpro.s8n.in/#/d/bandra_dentist</span>. Let's discuss?</p>
                                    </div>
                                </div>
                                <div class="pitch-actions">
                                    <button class="brand-btn px-4 py-2 font-bold text-xs" style="font-size: 11.5px;">Copy Customized Pitch</button>
                                    <button class="secondary-btn px-4 py-2 font-bold text-xs" style="font-size: 11.5px;">Launch WhatsApp Web 💬</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        integrations: {
            title: "Integration Connection Hub",
            overline: "Workflow Automator",
            tag: "Webhooks & API",
            color: "gold",
            tierAccess: "Scout Plan or Higher",
            description: "Automatically push lead datasets directly to your Google Sheets or connect customized n8n webhooks to automate email and Slack outreach workflows.",
            howToUse: [
                "Navigate to the <strong>Connection Hub</strong> settings page.",
                "Choose your integration target (Google Sheets / n8n webhook) and paste the Script URL or Webhook endpoint.",
                "Toggle automatic execution events (e.g. 'Trigger when a lead is saved') and click 'Save Configuration'."
            ],
            mockup: `
                <div class="mock-browser-window">
                    <div class="mock-browser-header">
                        <div class="mock-browser-dots">
                            <span class="mock-dot red"></span>
                            <span class="mock-dot yellow"></span>
                            <span class="mock-dot green"></span>
                        </div>
                        <div class="mock-browser-address">https://nearpro.s8n.in/#/dashboard/integrations</div>
                    </div>
                    <div class="mock-browser-content integrations-mock">
                        <div class="integrations-tabs">
                            <button class="tab-item active">n8n / Make</button>
                            <button class="tab-item">Google Sheets</button>
                        </div>
                        <div class="integrations-body">
                            <h5>Webhook Integration</h5>
                            <p class="body-desc">Push lead metadata automatically on state updates.</p>
                            
                            <div class="input-group">
                                <label>WEBHOOK ENDPOINT URL</label>
                                <input type="text" value="https://n8n.myagency.com/webhook/lead-push" readonly style="width:100%; border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:8px 12px; background:rgba(0,0,0,0.3); color:#fff; font-family:monospace; font-size:12px;" />
                            </div>

                            <div class="triggers-group">
                                <h6>Auto Trigger Events</h6>
                                <label class="trigger-label">
                                    <input type="checkbox" checked disabled />
                                    <span>Trigger webhook when new lead is saved</span>
                                </label>
                                <label class="trigger-label">
                                    <input type="checkbox" checked disabled />
                                    <span>Trigger when CRM stage changes to Converted</span>
                                </label>
                            </div>
                            
                            <div class="status-indicator success">
                                <span>● Endpoint Status: Connection Successful</span>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        team: {
            title: "Collaborative Team Workspace",
            overline: "Collaborative Agency Workspaces",
            tag: "Team Operations",
            color: "pink",
            tierAccess: "Agency Plan or Higher",
            description: "Invite sales agents and colleagues to collaborate in shared team workspaces. Assign roles, share smart lists, and compile reports together.",
            howToUse: [
                "Access the <strong>Team Workspace</strong> settings tab.",
                "Invite colleagues by entering their email address and assigning roles (e.g., Administrator or Sales Representative).",
                "Collaborate on shared lead folders and track custom regional database extraction status in the Scraper queue."
            ],
            mockup: `
                <div class="mock-browser-window">
                    <div class="mock-browser-header">
                        <div class="mock-browser-dots">
                            <span class="mock-dot red"></span>
                            <span class="mock-dot yellow"></span>
                            <span class="mock-dot green"></span>
                        </div>
                        <div class="mock-browser-address">https://nearpro.s8n.in/#/dashboard/team</div>
                    </div>
                    <div class="mock-browser-content team-mock">
                        <div class="team-layout">
                            <div class="team-panel-section">
                                <div class="section-header">
                                    <h5>Workspace Seats</h5>
                                    <span class="seat-count">3 / 6 Active</span>
                                </div>
                                <div class="member-list">
                                    <div class="member-row">
                                        <div>
                                            <strong>shri@myagency.com</strong>
                                            <span class="role-tag admin">Owner</span>
                                        </div>
                                    </div>
                                    <div class="member-row">
                                        <div>
                                            <strong>rahul@myagency.com</strong>
                                            <span class="role-tag sales">Sales Representative</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="scraper-panel-section">
                                <h5>Custom Scraper Queue (SLA: 2 to 6 hours)</h5>
                                <div class="scraper-row done">
                                    <div>
                                        <strong>Dentists in Delhi NCR</strong>
                                        <span class="row-meta">Niche extraction fulfilled</span>
                                    </div>
                                    <span class="status-pill green">Fulfilled</span>
                                </div>
                                <div class="scraper-row running">
                                    <div>
                                        <strong>Salons in Pune City</strong>
                                        <span class="row-meta">Scraper active in background</span>
                                    </div>
                                    <span class="status-pill yellow">Extracting</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        builder: {
            title: "Website Builder Prompts",
            overline: "Prompt Engineering Engine",
            tag: "AI Code Prompts",
            color: "gold",
            tierAccess: "Scout Plan or Higher",
            description: "Generate production ready structured prompts tailored for Bolt.new and Lovable to rebuild outdated prospect sites with one click.",
            howToUse: [
                "Navigate to the <strong>Website Prompt Engine</strong> tab.",
                "Select the target business lead to load their rating, coordinates, and details automatically.",
                "Choose the builder platform (Bolt.new / Lovable) and click 'Copy Prompt'. Paste the prompt into the AI builder to compile a premium site layout instantly."
            ],
            mockup: `
                <div class="mock-browser-window">
                    <div class="mock-browser-header">
                        <div class="mock-browser-dots">
                            <span class="mock-dot red"></span>
                            <span class="mock-dot yellow"></span>
                            <span class="mock-dot green"></span>
                        </div>
                        <div class="mock-browser-address">https://nearpro.s8n.in/#/dashboard/prompts</div>
                    </div>
                    <div class="mock-browser-content prompts-mock">
                        <div class="platform-selector">
                            <button class="plat-btn active">Lovable.dev</button>
                            <button class="plat-btn">Bolt.new</button>
                        </div>
                        <div class="prompt-workspace">
                            <h5>Generated Prompt Brief</h5>
                            <div class="mock-prompt-box">
                                <p>Generate a complete, production ready single page website application for a local business named "Bandra Dental Care" in Mumbai.
Include structured JSON-LD schema markup, direct WhatsApp button. Follow a premium dark theme layout with Space Grotesk headings and smooth gradients. Ensure 100% responsiveness on mobile screens...</p>
                            </div>
                            <button class="brand-btn w-full mt-3 py-2" style="font-size: 12px; font-weight: 700;">Copy Prompt to Clipboard</button>
                        </div>
                    </div>
                </div>
            `
        },
        "crm-sync": {
            title: "Zoho & HubSpot CRM Sync",
            overline: "External Deal Synchronizer",
            tag: "CRM Direct Sync",
            color: "pink",
            tierAccess: "Scout Plan or Higher",
            description: "Sync qualified leads directly into Zoho CRM and HubSpot CRM pipelines. Monitor updates, log contact syncs, and update deal stages from a central dashboard.",
            howToUse: [
                "Open the <strong>Connection Hub</strong> settings page and click the HubSpot or Zoho CRM tab.",
                "Enter your HubSpot Private App token (starts with 'pat-') or your Zoho API Self Client credentials.",
                "Select a smart list and click 'Push Leads'. Deal records and details will be created in your CRM workstation automatically."
            ],
            mockup: `
                <div class="mock-browser-window">
                    <div class="mock-browser-header">
                        <div class="mock-browser-dots">
                            <span class="mock-dot red"></span>
                            <span class="mock-dot yellow"></span>
                            <span class="mock-dot green"></span>
                        </div>
                        <div class="mock-browser-address">https://nearpro.s8n.in/#/dashboard/integrations</div>
                    </div>
                    <div class="mock-browser-content sync-mock">
                        <div class="sync-status-grid">
                            <div class="status-tile">
                                <span>HubSpot CRM</span>
                                <span class="badge connected">Connected</span>
                            </div>
                            <div class="status-tile">
                                <span>Zoho CRM</span>
                                <span class="badge connected">Connected</span>
                            </div>
                        </div>
                        <div class="sync-logs-panel">
                            <h5>Direct Sync History Logs</h5>
                            <div class="logs-list">
                                <div class="log-item">
                                    <span class="log-time">10:42 AM</span>
                                    <span class="log-text">Synced: Bandra Dental Care ➔ HubSpot Contact ID: 829283</span>
                                    <span class="log-status success">Success</span>
                                </div>
                                <div class="log-item">
                                    <span class="log-time">10:45 AM</span>
                                    <span class="log-text">Synced: Absolute Hair Salon ➔ Zoho Contact ID: 109283</span>
                                    <span class="log-status success">Success</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        vault: {
            title: "Outreach Document Vault",
            overline: "Secured PDF & Asset Vault",
            tag: "Documents Library",
            color: "gold",
            tierAccess: "Scout Plan or Higher",
            description: "Upload B2B proposals, catalogs, and pitch decks. Customize short link slugs and share them with permanent 10 year signed links over WhatsApp.",
            howToUse: [
                "Open the <strong>Documents Library</strong> tab from your dashboard sidebar.",
                "Click 'Upload PDF' and select your B2B proposal presentation or service pricing brochure.",
                "Customize the short link slug (e.g. `bandra_clinic`) and click Save. Copy the permanent signed URL to send campaigns without dead link risks."
            ],
            mockup: `
                <div class="mock-browser-window">
                    <div class="mock-browser-header">
                        <div class="mock-browser-dots">
                            <span class="mock-dot red"></span>
                            <span class="mock-dot yellow"></span>
                            <span class="mock-dot green"></span>
                        </div>
                        <div class="mock-browser-address">https://nearpro.s8n.in/#/dashboard/documents</div>
                    </div>
                    <div class="mock-browser-content vault-mock">
                        <div class="vault-header">
                            <h5>Upload Secure PDF Asset</h5>
                            <button class="secondary-btn py-1 px-3" style="font-size: 11px;">+ Upload File</button>
                        </div>
                        <div class="vault-files">
                            <div class="vault-file-row">
                                <div class="file-info">
                                    <div class="file-icon">PDF</div>
                                    <div>
                                        <strong>Bandra_Dental_Proposal.pdf</strong>
                                        <span class="file-size">1.2 MB &bull; Uploaded today</span>
                                    </div>
                                </div>
                                <div class="slug-editor">
                                    <span>#/d/</span>
                                    <input type="text" value="bandra_dentist" readonly style="width:90px; border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:3px 6px; background:rgba(0,0,0,0.3); color:#fff; font-family:monospace; font-size:11px;" />
                                </div>
                                <button class="mini-action-btn copy-link" style="background:#2563eb; color:#fff; border:none; border-radius:4px; padding:3px 8px; font-size:11px; cursor:pointer;">Copy Link</button>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }
    };

    const data = featureData[id];
    if (!data) {
        return `
            <div class="container" style="padding: 100px 0; text-align: center;">
                <h2>Feature Not Found</h2>
                <p>The feature you are looking for does not exist.</p>
                <a href="#/" class="brand-btn" style="margin-top: 20px;">Back to Home</a>
            </div>
        `;
    }

    return `
        <div class="app-container">
            ${renderHeader()}
            
            <main class="feature-detail-layout" style="padding: 140px 0 80px; font-family: var(--font-body); color: var(--text-secondary); background-color: var(--bg-base);">
                <div class="container">
                    
                    <!-- Back navigation link -->
                    <div style="margin-bottom: 32px;">
                        <a href="#/" class="back-link" style="display: inline-flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 13.5px; font-weight: 600; text-decoration: none; transition: var(--transition);">
                            <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> Back to Feature Grid
                        </a>
                    </div>
                    
                    <div class="feature-detail-grid">
                        
                        <!-- Left Side: Visual Interactive Mockup Window -->
                        <div class="feature-detail-visual">
                            ${data.mockup}
                            
                            <div class="mockup-caption-bar">
                                <span class="caption-dot"></span>
                                <p>High Fidelity simulated screen preview using live sandbox database schema values.</p>
                            </div>
                        </div>

                        <!-- Right Side: Content and Steps Guide -->
                        <div class="feature-detail-content">
                            <span class="detail-overline">${data.overline}</span>
                            <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px; margin-bottom: 16px;">
                                <h1 style="font-size: 32px; font-weight: 700; color: white; margin: 0;">${data.title}</h1>
                                <span class="detail-tag detail-tag--${data.color}">${data.tag}</span>
                            </div>
                            
                            <p class="detail-description" style="font-size: 16px; line-height: 1.6; color: var(--text-secondary); margin-bottom: 24px;">
                                ${data.description}
                            </p>

                            <div class="access-banner banner--${data.color}">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <i data-lucide="shield" style="width: 16px; height: 16px;"></i>
                                    <strong>Access Tier:</strong>
                                    <span>${data.tierAccess}</span>
                                </div>
                            </div>

                            <div class="how-to-use-section">
                                <h3>How to Leverage This Feature:</h3>
                                <ul class="step-list">
                                    ${data.howToUse.map((step, idx) => `
                                        <li>
                                            <div class="step-number step-number--${data.color}">0${idx + 1}</div>
                                            <div class="step-text">${step}</div>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                            
                            <div class="action-footer" style="margin-top: 36px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; gap: 16px; align-items: center;">
                                <button onclick="window.State.setAuthModal(true);" class="brand-btn" style="padding: 12px 28px; font-size: 13.5px; font-weight: 700;">
                                    Create Free Workspace ➔
                                </button>
                                <button onclick="window.State.setPricingModal(true);" class="secondary-btn" style="padding: 12px 28px; font-size: 13.5px; font-weight: 600;">
                                    View Premium Plans
                                </button>
                            </div>
                        </div>

                    </div>

                </div>
            </main>

            <footer class="main-footer" style="display: flex; justify-content: space-between; align-items: center; padding: 24px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid var(--border); font-size: 13px; color: var(--text-muted); flex-wrap: wrap; gap: 12px;">
                <div>NearPro — Made with ❤️ by S8N</div>
                <div style="display: flex; gap: 20px;">
                    <a href="#/privacy" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Privacy Policy</a>
                    <a href="#/terms" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Terms Of Service</a>
                    <a href="#/opt-out" style="color: var(--accent-gold); text-decoration: none; font-weight: 500;">Business Opt-Out</a>
                </div>
            </footer>
        </div>
    `;
}

export function bindFeatureDetailPageEvents() {
    bindHeaderEvents();
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    // Add custom hover logic for maps pin popups if on pipelines page
    const pins = document.querySelectorAll('.mock-map-pin');
    pins.forEach(pin => {
        pin.addEventListener('mouseenter', () => {
            pins.forEach(p => p.classList.remove('active'));
            pin.classList.add('active');
        });
    });

    // Back button hover styling
    const backBtn = document.querySelector('.back-link');
    if (backBtn) {
        backBtn.addEventListener('mouseenter', () => {
            backBtn.style.color = 'white';
        });
        backBtn.style.transition = 'color 0.2s ease';
        backBtn.addEventListener('mouseleave', () => {
            backBtn.style.color = 'var(--text-muted)';
        });
    }
}
