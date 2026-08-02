import { State } from '../state.js';

const ARTICLE_CATEGORIES = [
    { id: 'all', name: 'All Guides' },
    { id: 'getting-started', name: '🏁 Getting Started' },
    { id: 'prospecting', name: '🔍 Directory & Leads' },
    { id: 'sequences', name: '✉️ Campaigns & Sequences' },
    { id: 'deliverability', name: '🏥 Health & Deliverability' },
    { id: 'proposals', name: '📄 Proposals & Scripts' },
    { id: 'voice-agent', name: '📞 AI Voice Calling' },
    { id: 'integrations', name: '🔌 Connections & LLMs' }
];

const ARTICLES = [
    {
        category: 'getting-started',
        id: 'workspace-setup',
        title: 'How to setup your NearPro agency workspace',
        desc: 'Step-by-step guide to configuring your profile, default billing currency, and invite team members.',
        content: `
            <h5>Workspace Initialization Steps:</h5>
            <ol>
                <li>Navigate to <strong>Workspace & Setup ➔ Settings</strong> in the left sidebar menu.</li>
                <li>Verify your account billing currency details (NearPro supports INR ₹, USD $, and EUR €).</li>
                <li>Set up default credits alerts threshold to receive notifications when available balance is below 15 credits.</li>
                <li>To add team members, switch to the <strong>Team Workspace</strong> tab, enter their business emails, and allocate quota boundaries.</li>
            </ol>
            <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:10px; border-radius:6px; font-size:12px; color:#1e40af; margin-top:10px;">
                <strong>💡 Quick Tip:</strong> Free Explorer accounts start with 15 complimentary credits. You can upgrade at any time to unlock bulk exports.
            </div>
        `
    },
    {
        category: 'getting-started',
        id: 'api-keys',
        title: 'How to configure your personal Hunter & Apollo API keys',
        desc: 'Unlock waterfall data enrichment by adding your credentials.',
        content: `
            <h5>Bypassing Standard Quota Limits:</h5>
            <p>You can hook your own Hunter.io or Apollo keys to perform free waterfall lookups directly through NearPro:</p>
            <ol>
                <li>Navigate to <strong>Prospect & Enrich ➔ Data Enrichment</strong>.</li>
                <li>Under the <strong>API Keys</strong> configuration settings pane, enter your API token credentials.</li>
                <li>Click <strong>Test Connection</strong> to run a live credential diagnostic validation check.</li>
                <li>NearPro will fall back to using your custom keys to bypass daily limits.</li>
            </ol>
        `
    },
    {
        category: 'getting-started',
        id: 'subscriptions',
        title: 'Subscriptions and credit pricing tiers overview',
        desc: 'Understand credit consumption limits, billing periods, and pricing updates.',
        content: `
            <h5>Pricing & Credit Consumption Rules:</h5>
            <ul>
                <li><strong>Free Explorer:</strong> 15 credits balance for directory search previews.</li>
                <li><strong>Scout Plan (₹499/mo):</strong> 500 leads exports, proposal builder tools access.</li>
                <li><strong>Hunter Plan (₹999/mo):</strong> 2000 leads exports, email drip automation sequence campaigns.</li>
                <li><strong>Agency Plan (₹2999/mo):</strong> Shared quotas, priority email sequences, custom webhook destinations.</li>
            </ul>
        `
    },
    {
        category: 'getting-started',
        id: 'connected-mailboxes',
        title: 'Connecting and rotating outbound sender mailboxes',
        desc: 'Set up custom G-Suite or Microsoft Office senders to run campaigns.',
        content: `
            <h5>Mailbox Setup Protocol:</h5>
            <ol>
                <li>Go to <strong>Engage & Sequences ➔ Email Sequences</strong>.</li>
                <li>Under the settings banner, click <strong>Connect Sender Mailbox</strong>.</li>
                <li>Enter your IMAP/SMTP parameters. Always configure an <strong>App Password</strong> instead of your primary password.</li>
                <li>Activate rotating sender schedules to distribute outbound emails across up to 5 linked mailboxes.</li>
            </ol>
        `
    },
    {
        category: 'prospecting',
        id: 'rating-deficits',
        title: 'How to find leads with rating deficits in Mumbai & Delhi',
        desc: 'Advanced search criteria to locate businesses with critical review volume gaps.',
        content: `
            <h5>Finding High-Intent Deficit Leads:</h5>
            <ol>
                <li>Go to <strong>Prospect & Enrich ➔ People & Directory</strong>.</li>
                <li>Select your target city region (e.g., <strong>Mumbai</strong> or <strong>Delhi NCR</strong>).</li>
                <li>Click <strong>Show Filters</strong> and configure the following parameters:
                    <ul>
                        <li>Set <strong>Maximum Rating</strong> to <code>4.2★</code>.</li>
                        <li>Set <strong>Minimum Reviews Volume</strong> to <code>30 reviews</code>.</li>
                        <li>Toggle <strong>Unoptimized Website</strong> or <strong>No Website</strong> to locate technical gaps.</li>
                    </ul>
                </li>
                <li>Review the results, select qualified records, and click <strong>Add to List</strong> to build your pipeline.</li>
            </ol>
            <p>Businesses with ratings below 4.2★ but high search volume represent the easiest prospects to close by pitching Google Maps review improvements.</p>
        `
    },
    {
        category: 'prospecting',
        id: 'waterfall-enrichment',
        title: 'Running waterfall enrichment for mobile number lookups',
        desc: 'How the multi-provider verification pipeline extracts business numbers.',
        content: `
            <h5>Waterfall Data Lookup Workflow:</h5>
            <p>NearPro triggers consecutive API provider queries (Waterfall Model) to ensure maximum validation rates:</p>
            <ol>
                <li>Select your saved leads in the <strong>Lead CRM Dashboard</strong>.</li>
                <li>Click <strong>Enrich Numbers</strong>.</li>
                <li>The server will contact Google Maps API first, fall back to website scraper regexes, and verify details via global database partners.</li>
                <li>Verified results are tagged with validation scores (e.g., <code>[DELIVERABLE]</code>, <code>[RISKY]</code>).</li>
            </ol>
        `
    },
    {
        category: 'prospecting',
        id: 'intent-signals',
        title: 'Configuring custom intent signals triggers',
        desc: 'Receive alerts when prospects register reviews drop-offs or domain expirations.',
        content: `
            <h5>Tracking High-Intent Signals:</h5>
            <p>Set up automatic filters under <strong>Intent Signals</strong> to notify your sales team immediately when:</p>
            <ul>
                <li>A premium dentist or clinic in Mumbai falls below 4.0★ due to a recent negative review.</li>
                <li>A target business website loses its SSL certificate security tag.</li>
                <li>A domain is flagged for expiration within 30 days.</li>
            </ul>
        `
    },
    {
        category: 'sequences',
        id: 'hinglish-sequences',
        title: 'Drafting multi-channel Hinglish sequences for outreach',
        desc: 'Designing campaign outlines combining emails, WhatsApp, and Twilio scripts.',
        content: `
            <h5>Configuring Drip Campaigns:</h5>
            <p>Hinglish pitches yield over 2x higher reply rates for local business owners in India compared to formal English templates.</p>
            <ol>
                <li>Open <strong>Engage & Sequences ➔ Sequences</strong> dashboard.</li>
                <li>Click <strong>Create sequence</strong> and choose a blueprint template.</li>
                <li>Add multi-step touchpoints:
                    <ul>
                        <li><strong>Step 1 (Day 1 - Email):</strong> Empathy intro highlighting their Google rating deficit.</li>
                        <li><strong>Step 2 (Day 3 - WhatsApp):</strong> Follow-up asking if they received the email.</li>
                        <li><strong>Step 3 (Day 5 - Call):</strong> Manual TWILIO teleprompter scripting prompt.</li>
                    </ul>
                </li>
                <li>Specify delays, insert personalized fallback tokens like <code>{{business_name}}</code>, and click <strong>Launch Sequence</strong>.</li>
            </ol>
        `
    },
    {
        category: 'deliverability',
        id: 'dns-configuration',
        title: 'Setting up SPF, DKIM, and DMARC tags for custom mailboxes',
        desc: 'Authentication standards required to achieve 100% inbox placement.',
        content: `
            <h5>Required DNS Verifications:</h5>
            <p>Before launching sequences, add the following TXT parameters at your DNS registrar (GoDaddy, Namecheap, Cloudflare):</p>
            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:12px; border-radius:6px; font-family:var(--font-mono); font-size:11.5px; display:flex; flex-direction:column; gap:8px;">
                <div><strong>1. SPF:</strong> v=spf1 include:spf.google.com ~all</div>
                <div><strong>2. DKIM:</strong> Copy selector public key txt record from G Suite console.</div>
                <div><strong>3. DMARC:</strong> v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@yourdomain.com</div>
            </div>
            <p style="margin-top:10px;">Once verification is complete, switch to the <strong>Diagnostics</strong> sub-tab in Email Sequences to check that all green <code>PASS</code> badges are glowing.</p>
        `
    },
    {
        category: 'proposals',
        id: 'pdf-proposals',
        title: 'Generating 3-page PDF proposals with revenue loss estimates',
        desc: 'Designing high-impact proposal audit links to share on WhatsApp.',
        content: `
            <h5>Proposal Creation Workflow:</h5>
            <ol>
                <li>Save target prospect leads into the <strong>AI Deal Hub (CRM)</strong> workstation.</li>
                <li>Open their lead detail profile card and click <strong>Create Proposal</strong>.</li>
                <li>The system will auto-retrieve Google Maps reviews metrics and calculate:
                    <ul>
                        <li>Potential clients lost due to negative ratings or lack of responsive booking forms.</li>
                        <li>Competitor ratings gap matrix comparisons.</li>
                        <li>3-tier package recommendation list (Starter, Pro, Growth).</li>
                    </ul>
                </li>
                <li>Click <strong>Generate PDF</strong>. Share the permanent signed URL directly with the owner on WhatsApp.</li>
            </ol>
        `
    },
    {
        category: 'voice-agent',
        id: 'priya-compliance',
        title: 'Setting up TRAI compliant AI calling campaigns',
        desc: 'Configuration steps for Priya Hinglish voice agent campaigns.',
        content: `
            <h5>Compliance & Setup Walkthrough:</h5>
            <ol>
                <li>Navigate to <strong>Win Deals & CRM ➔ AI Voice Agent</strong>.</li>
                <li>Configure your compliance credentials:
                    <ul>
                        <li>Verify that DND scrub toggle is active (to bypass NDNC listings).</li>
                        <li>Ensure you add a pre-recorded TRAI consent intro if calling cold records.</li>
                    </ul>
                </li>
                <li>Select the voice persona (e.g. <strong>Priya Hinglish</strong> for high-converting dialogue).</li>
                <li>Specify qualifying questionnaire triggers:
                    <ul>
                        <li><em>"Kya aap new clients handle karne ke liye ready hain?"</em></li>
                        <li><em>"Kya hum details WhatsApp par send kar sakte hain?"</em></li>
                    </ul>
                </li>
                <li>Enroll list leads, launch simulation, and review transcript outcomes.</li>
            </ol>
        `
    },
    {
        category: 'integrations',
        id: 'n8n-webhooks',
        title: 'Configuring n8n webhook sync for HubSpot & Google Sheets',
        desc: 'Syncing pipeline contacts and closed deals to external CRMs automatically.',
        content: `
            <h5>n8n Payload Integration Specs:</h5>
            <p>Every time a lead status changes in the 360° AI Deal Hub, NearPro sends a <code>POST</code> webhook trigger containing the following payload schema:</p>
            <pre style="background:#f1f5f9; border:1px solid #cbd5e1; padding:10px; border-radius:6px; font-size:11px; overflow-x:auto; font-family:var(--font-mono);">
{
  "event": "lead_status_updated",
  "lead_id": "9a3f2b8-932f",
  "business_name": "Dr. Mehta Clinic",
  "stage": "offer_sent",
  "deal_value": 25000,
  "owner_email": "founder@nearpro.com"
}
            </pre>
            <p>Map this webhook URL destination inside <strong>Workspace & Setup ➔ Connection Hub</strong>.</p>
        `
    },
    {
        category: 'integrations',
        id: 'local-ollama',
        title: 'Running local Ollama models for hybrid offline prompt routing',
        desc: 'Testing latency benchmarks and custom prompt templates routing configuration.',
        content: `
            <h5>Local LLM Configuration:</h5>
            <p>NearPro supports hybrid routing to protect agency developer credits. Lookups can use local offline models like Llama-3 or Mistral.</p>
            <ol>
                <li>Install Ollama on your developer machine (download from ollama.ai).</li>
                <li>Run command: <code>ollama run llama3</code> to spin up the local model.</li>
                <li>In NearPro, go to <strong>Workspace & Setup ➔ LLM Router Settings</strong>.</li>
                <li>Specify your endpoint URL: <code>http://localhost:11434</code>.</li>
                <li>Click <strong>Test Latency Benchmark</strong> to verify connection status. Toggle hybrid routing active.</li>
            </ol>
        `
    }
];

let selectedCategory = 'landing'; // default to landing page
let searchQuery = '';

export function renderHelpDocs() {
    // If not on landing page, we display the filtered guides page
    const filteredArticles = ARTICLES.filter(a => {
        const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory || selectedCategory === 'landing';
        const matchesSearch = searchQuery === '' || 
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            a.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categoryListHTML = ARTICLE_CATEGORIES.map(c => `
        <button class="help-cat-btn ${selectedCategory === c.id ? 'active' : ''}" data-id="${c.id}" style="width: 100%; text-align: left; padding: 10px 14px; font-size: 13px; font-weight: 700; color: ${selectedCategory === c.id ? '#2563eb' : '#475569'}; background: ${selectedCategory === c.id ? '#eff6ff' : 'none'}; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: space-between;">
            <span>${c.name}</span>
            <span style="font-size: 10.5px; background: rgba(0,0,0,0.04); color: #64748b; padding: 2px 6px; border-radius: 4px;">
                ${c.id === 'all' ? ARTICLES.length : ARTICLES.filter(a => a.category === c.id).length}
            </span>
        </button>
    `).join('');

    const articlesHTML = filteredArticles.length === 0 ? `
        <div style="padding: 40px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 12px; background: #ffffff; width: 100%;">
            <div style="font-size: 36px; margin-bottom: 12px;">🔍</div>
            <h4 style="margin: 0 0 6px 0; color: #0f172a; font-weight: 800;">No articles match your query</h4>
            <p style="margin: 0; color: #475569; font-size: 12.5px;">Try checking for typos or clear search parameters filter.</p>
        </div>
    ` : filteredArticles.map((art, idx) => `
        <details id="art-${art.id}" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.02); margin-bottom: 12px; width: 100%;" ${idx === 0 || searchQuery !== '' ? 'open' : ''}>
            <summary style="padding: 16px 20px; font-weight: 800; font-size: 14px; color: #0f172a; cursor: pointer; display: flex; flex-direction: column; gap: 4px; outline: none; list-style: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span style="font-family: var(--font-heading);">${art.title}</span>
                    <span style="font-size: 12px; color: #2563eb; font-family: var(--font-mono);">Read ➔</span>
                </div>
                <span style="font-weight: 500; font-size: 12px; color: #475569; margin-top:2px;">${art.desc}</span>
            </summary>
            <div style="padding: 20px; border-top: 1px solid #f1f5f9; background: #fafafa; font-size: 13px; color: #334155; line-height: 1.6; display: flex; flex-direction: column; gap: 12px;">
                ${art.content}
            </div>
        </details>
    `).join('');

    const landingHTML = `
        <!-- DUAL CARDS SECTION (mimics docs.apollo.io build columns) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin-bottom: 32px; width: 100%;">
            
            <!-- Build with AI -->
            <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between; gap: 20px;">
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:24px;">🤖</span>
                        <h3 style="margin:0; font-size:18px; font-weight:800; color:#0f172a; font-family:var(--font-heading);">Build with AI</h3>
                    </div>
                    <p style="margin:0; font-size:13px; color:#475569; line-height:1.5;">NearPro integrates with hybrid LLMs. Route queries to local Ollama servers or public AI models offline.</p>
                    
                    <!-- Interactive badges -->
                    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
                        <span style="font-size:11px; font-weight:700; color:#2563eb; background:#eff6ff; padding:4px 10px; border-radius:99px; font-family:var(--font-mono);">Ollama</span>
                        <span style="font-size:11px; font-weight:700; color:#2563eb; background:#eff6ff; padding:4px 10px; border-radius:99px; font-family:var(--font-mono);">Llama-3</span>
                        <span style="font-size:11px; font-weight:700; color:#2563eb; background:#eff6ff; padding:4px 10px; border-radius:99px; font-family:var(--font-mono);">Mistral</span>
                        <span style="font-size:11px; font-weight:700; color:#2563eb; background:#eff6ff; padding:4px 10px; border-radius:99px; font-family:var(--font-mono);">GPT-4o</span>
                    </div>

                    <!-- Prompt sandbox preview visual -->
                    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:16px; font-family:var(--font-mono); font-size:12px; color:#334155; margin-top:8px;">
                        <span style="color:#64748b;">// Run prompt command</span><br>
                        Find target dentists in <span style="color:#0f766e;">Mumbai</span> under <span style="color:#b45309;">4.0★</span> review rating deficit.
                    </div>
                </div>
                <button class="primary-btn help-nav-btn" data-id="integrations" style="width:100%; padding:12px; font-weight:700; border-radius:8px; background:#0f172a; color:#ffffff; border:none; cursor:pointer;">Learn about LLM Routing ➔</button>
            </div>

            <!-- Build with Webhooks -->
            <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between; gap: 20px;">
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:24px;">🔌</span>
                        <h3 style="margin:0; font-size:18px; font-weight:800; color:#0f172a; font-family:var(--font-heading);">Connect with Webhooks</h3>
                    </div>
                    <p style="margin:0; font-size:13px; color:#475569; line-height:1.5;">Dispatch live deal notifications and lead exports directly to n8n, Make.com, or HubSpot pipelines.</p>
                    
                    <!-- Interactive badges -->
                    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
                        <span style="font-size:11px; font-weight:700; color:#10b981; background:#ecfdf5; padding:4px 10px; border-radius:99px; font-family:var(--font-mono);">n8n</span>
                        <span style="font-size:11px; font-weight:700; color:#10b981; background:#ecfdf5; padding:4px 10px; border-radius:99px; font-family:var(--font-mono);">Make.com</span>
                        <span style="font-size:11px; font-weight:700; color:#10b981; background:#ecfdf5; padding:4px 10px; border-radius:99px; font-family:var(--font-mono);">HubSpot</span>
                        <span style="font-size:11px; font-weight:700; color:#10b981; background:#ecfdf5; padding:4px 10px; border-radius:99px; font-family:var(--font-mono);">Webhooks</span>
                    </div>

                    <!-- Code block cURL preview -->
                    <div style="background:#fafafa; border:1px solid #cbd5e1; border-radius:8px; padding:16px; font-family:var(--font-mono); font-size:11.5px; color:#0f172a; overflow-x:auto;">
                        curl -X POST https://api.nearpro.com/v1/webhooks \\<br>
                        &nbsp;&nbsp;-d '{"event":"lead_saved"}'
                    </div>
                </div>
                <button class="primary-btn help-nav-btn" data-id="integrations" style="width:100%; padding:12px; font-weight:700; border-radius:8px; background:#0f172a; color:#ffffff; border:none; cursor:pointer;">Explore Webhook Specs ➔</button>
            </div>

        </div>

        <!-- 3 COLUMNS QUICK STARTERS (mimics docs.apollo.io categories layout) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 40px; width: 100%;">
            
            <!-- Get Started -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.01);">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
                    <span style="font-size:18px;">🏁</span>
                    <h4 style="margin:0; font-size:15px; font-weight:800; color:#0f172a;">Get Started</h4>
                </div>
                <ul style="display:flex; flex-direction:column; gap:10px; padding:0; margin:0; list-style:none; font-size:13px;">
                    <li><a href="javascript:void(0)" class="help-article-link" data-cat="getting-started" data-id="workspace-setup" style="color:#2563eb; text-decoration:none; font-weight:700;">NearPro workspace setup</a></li>
                    <li><a href="javascript:void(0)" class="help-article-link" data-cat="getting-started" data-id="api-keys" style="color:#2563eb; text-decoration:none; font-weight:700;">API keys configuration</a></li>
                    <li><a href="javascript:void(0)" class="help-article-link" data-cat="getting-started" data-id="subscriptions" style="color:#2563eb; text-decoration:none; font-weight:700;">Subscriptions & credits</a></li>
                    <li><a href="javascript:void(0)" class="help-article-link" data-cat="getting-started" data-id="connected-mailboxes" style="color:#2563eb; text-decoration:none; font-weight:700;">Connected mailboxes</a></li>
                </ul>
            </div>

            <!-- See What You Can Do -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.01);">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
                    <span style="font-size:18px;">🔍</span>
                    <h4 style="margin:0; font-size:15px; font-weight:800; color:#0f172a;">Prospect & Enrich</h4>
                </div>
                <ul style="display:flex; flex-direction:column; gap:10px; padding:0; margin:0; list-style:none; font-size:13px;">
                    <li><a href="javascript:void(0)" class="help-article-link" data-cat="prospecting" data-id="rating-deficits" style="color:#2563eb; text-decoration:none; font-weight:700;">Directory leads search</a></li>
                    <li><a href="javascript:void(0)" class="help-article-link" data-cat="prospecting" data-id="waterfall-enrichment" style="color:#2563eb; text-decoration:none; font-weight:700;">Waterfall enrichment</a></li>
                    <li><a href="javascript:void(0)" class="help-article-link" data-cat="prospecting" data-id="intent-signals" style="color:#2563eb; text-decoration:none; font-weight:700;">Intent signals alerts</a></li>
                    <li><a href="javascript:void(0)" class="help-article-link" data-cat="sequences" data-id="hinglish-sequences" style="color:#2563eb; text-decoration:none; font-weight:700;">Multi-channel campaigns</a></li>
                </ul>
            </div>

            <!-- Win Deals & CRM -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.01);">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
                    <span style="font-size:18px;">💼</span>
                    <h4 style="margin:0; font-size:15px; font-weight:800; color:#0f172a;">Win Deals & CRM</h4>
                </div>
                <ul style="display:flex; flex-direction:column; gap:10px; padding:0; margin:0; list-style:none; font-size:13px;">
                    <li><a href="javascript:void(0)" class="help-article-link" data-cat="proposals" data-id="pdf-proposals" style="color:#2563eb; text-decoration:none; font-weight:700;">3-page PDF proposals</a></li>
                    <li><a href="javascript:void(0)" class="help-article-link" data-cat="voice-agent" data-id="priya-compliance" style="color:#2563eb; text-decoration:none; font-weight:700;">AI voice calling Priya</a></li>
                    <li><a href="javascript:void(0)" class="help-article-link" data-cat="integrations" data-id="n8n-webhooks" style="color:#2563eb; text-decoration:none; font-weight:700;">Webhook payload schemas</a></li>
                    <li><a href="javascript:void(0)" class="help-article-link" data-cat="integrations" data-id="local-ollama" style="color:#2563eb; text-decoration:none; font-weight:700;">Local Ollama models</a></li>
                </ul>
            </div>

        </div>

        <!-- EXPLORE API ENDPOINTS SECTION (mimics bottom index list of apollo docs) -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 32px; width: 100%;">
            <h3 style="margin:0 0 20px 0; font-size:16px; font-weight:900; color:#0f172a; font-family:var(--font-heading);">Explore and Test API Endpoints</h3>
            
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px;">
                <div>
                    <h5 style="margin:0 0 10px 0; font-size:12px; font-weight:800; text-transform:uppercase; color:#64748b; font-family:var(--font-mono);">API Setup</h5>
                    <ul style="padding:0; margin:0; list-style:none; font-size:13px; display:flex; flex-direction:column; gap:8px;">
                        <li><a href="javascript:void(0)" class="help-cat-nav-btn" data-id="integrations" style="color:#475569; text-decoration:none;">API Authorization</a></li>
                        <li><a href="javascript:void(0)" class="help-cat-nav-btn" data-id="integrations" style="color:#475569; text-decoration:none;">Webhook Configurations</a></li>
                        <li><a href="javascript:void(0)" class="help-cat-nav-btn" data-id="integrations" style="color:#475569; text-decoration:none;">LLM Router Settings</a></li>
                    </ul>
                </div>
                <div>
                    <h5 style="margin:0 0 10px 0; font-size:12px; font-weight:800; text-transform:uppercase; color:#64748b; font-family:var(--font-mono);">Search & Enrich</h5>
                    <ul style="padding:0; margin:0; list-style:none; font-size:13px; display:flex; flex-direction:column; gap:8px;">
                        <li><a href="javascript:void(0)" class="help-cat-nav-btn" data-id="prospecting" style="color:#475569; text-decoration:none;">Directory Leads Search</a></li>
                        <li><a href="javascript:void(0)" class="help-cat-nav-btn" data-id="prospecting" style="color:#475569; text-decoration:none;">Reviews Gap Analytics</a></li>
                        <li><a href="javascript:void(0)" class="help-cat-nav-btn" data-id="prospecting" style="color:#475569; text-decoration:none;">Waterfall Lookup Log</a></li>
                    </ul>
                </div>
                <div>
                    <h5 style="margin:0 0 10px 0; font-size:12px; font-weight:800; text-transform:uppercase; color:#64748b; font-family:var(--font-mono);">Engage Prospects</h5>
                    <ul style="padding:0; margin:0; list-style:none; font-size:13px; display:flex; flex-direction:column; gap:8px;">
                        <li><a href="javascript:void(0)" class="help-cat-nav-btn" data-id="sequences" style="color:#475569; text-decoration:none;">Email Sequences</a></li>
                        <li><a href="javascript:void(0)" class="help-cat-nav-btn" data-id="voice-agent" style="color:#475569; text-decoration:none;">Voice Agent Priya</a></li>
                        <li><a href="javascript:void(0)" class="help-cat-nav-btn" data-id="deliverability" style="color:#475569; text-decoration:none;">Deliverability Diagnostic</a></li>
                    </ul>
                </div>
                <div>
                    <h5 style="margin:0 0 10px 0; font-size:12px; font-weight:800; text-transform:uppercase; color:#64748b; font-family:var(--font-mono);">Analyze Performance</h5>
                    <ul style="padding:0; margin:0; list-style:none; font-size:13px; display:flex; flex-direction:column; gap:8px;">
                        <li><a href="javascript:void(0)" class="help-cat-nav-btn" data-id="proposals" style="color:#475569; text-decoration:none;">CRM Deal Pipelines</a></li>
                        <li><a href="javascript:void(0)" class="help-cat-nav-btn" data-id="deliverability" style="color:#475569; text-decoration:none;">Diagnostic Checklists</a></li>
                        <li><a href="javascript:void(0)" class="help-cat-nav-btn" data-id="getting-started" style="color:#475569; text-decoration:none;">Credits Reports</a></li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    return `
        <div class="help-docs-workspace" style="display: flex; flex-direction: column; gap: 24px; width: 100%; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding-bottom: 60px; max-width: 1000px; margin: 0 auto;">
            
            <!-- HEADER SEARCH AREA (mimics premium apollo docs top bar) -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; box-shadow: 0 4px 15px rgba(0,0,0,0.01);">
                <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="window.location.hash='#/dashboard/help-docs'; window.location.reload();">
                    <span style="font-size:22px; font-weight:800; color:#0f172a; font-family:var(--font-heading);">⚡ NearPro docs</span>
                </div>
                <div style="width: 100%; max-width: 420px; position: relative;">
                    <input type="text" id="helpDocsSearchInput" placeholder="Search guides, payload variables, SPF details..." value="${searchQuery}" style="width: 100%; padding: 8px 16px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 13px; outline: none; background: #ffffff; color: #0f172a; box-shadow: 0 2px 8px rgba(0,0,0,0.02);" />
                </div>
            </div>

            ${selectedCategory === 'landing' && searchQuery === '' ? landingHTML : `
                <!-- SEARCH RESULTS OR CATEGORY SELECTED BROWSE VIEW -->
                <div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">
                    
                    <!-- Left Sidebar Categories -->
                    <div style="width: 240px; display: flex; flex-direction: column; gap: 6px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.01); flex-shrink: 0;">
                        <h4 style="margin: 0 0 10px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; font-family: var(--font-mono);">Categories</h4>
                        ${categoryListHTML}
                        <button class="help-cat-btn" onclick="window.location.hash='#/dashboard/help-docs'; window.location.reload();" style="width: 100%; text-align: left; padding: 10px 14px; font-size: 13px; font-weight: 700; color: #475569; background: none; border: none; border-radius: 6px; cursor: pointer; margin-top: 10px; text-decoration: underline;">
                            ➔ Back to Docs Home
                        </button>
                    </div>

                    <!-- Right Articles Stack -->
                    <div style="flex: 1; min-width: 320px; display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <h4 style="margin:0; font-size: 14px; font-weight: 800; color: #0f172a; font-family: var(--font-heading);">
                                ${searchQuery !== '' ? 'Search Results' : ARTICLE_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Guides'}
                            </h4>
                        </div>
                        
                        ${articlesHTML}
                    </div>

                </div>
            `}

        </div>
    `;
}

export function bindHelpDocsEvents() {
    if (window.refreshLucideIcons) window.refreshLucideIcons();

    // Landing nav cards click handlers
    document.querySelectorAll('.help-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedCategory = btn.getAttribute('data-id');
            refreshHelpView();
        });
    });

    // Quick starter links click handlers (scroll to specific article)
    document.querySelectorAll('.help-article-link').forEach(link => {
        link.addEventListener('click', () => {
            const cat = link.getAttribute('data-cat');
            const articleId = link.getAttribute('data-id');
            selectedCategory = cat;
            refreshHelpView();
            setTimeout(() => {
                const el = document.getElementById(`art-${articleId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                    el.setAttribute('open', 'true');
                }
            }, 100);
        });
    });

    // Explore endpoints links click handlers
    document.querySelectorAll('.help-cat-nav-btn').forEach(link => {
        link.addEventListener('click', () => {
            selectedCategory = link.getAttribute('data-id');
            refreshHelpView();
        });
    });

    // Category button toggles
    document.querySelectorAll('.help-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            selectedCategory = id;
            refreshHelpView();
        });
    });

    // Search query key handler
    const searchInput = document.getElementById('helpDocsSearchInput');
    if (searchInput) {
        searchInput.focus();
        
        // Restore cursor to the end
        const val = searchInput.value;
        searchInput.value = '';
        searchInput.value = val;

        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            refreshHelpView();
        });
    }
}

function refreshHelpView() {
    const content = document.getElementById('dashboardContent');
    if (content) {
        content.innerHTML = renderHelpDocs();
        bindHelpDocsEvents();
    }
}
