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
        category: 'prospecting',
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
        category: 'sequences',
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
        title: 'Setting up TRAI compliant AI calling campaigns',
        desc: 'Configuration steps for Priya Hinglish voice agent campaigns.',
        content: `
            <h5>Compliance & Setup Walkthrough:</h5>
            <ol>
                <li>Navigate to <strong>Engage & Sequences ➔ AI Voice Agent</strong>.</li>
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

let selectedCategory = 'all';
let searchQuery = '';

export function renderHelpDocs() {
    // Filter articles based on category and query search input
    const filteredArticles = ARTICLES.filter(a => {
        const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
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
        <div style="padding: 40px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 12px; background: #ffffff;">
            <div style="font-size: 36px; margin-bottom: 12px;">🔍</div>
            <h4 style="margin: 0 0 6px 0; color: #0f172a; font-weight: 800;">No articles match your query</h4>
            <p style="margin: 0; color: #475569; font-size: 12.5px;">Try checking for typos or clear search parameters filter.</p>
        </div>
    ` : filteredArticles.map((art, idx) => `
        <details style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.02); margin-bottom: 12px;" ${idx === 0 && searchQuery !== '' ? 'open' : ''}>
            <summary style="padding: 16px 20px; font-weight: 800; font-size: 14px; color: #0f172a; cursor: pointer; display: flex; flex-direction: column; gap: 4px; outline: none; list-style: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span style="font-family: var(--font-heading);">${art.title}</span>
                    <span style="font-size: 12px; color: #64748b; font-family: var(--font-mono);">Read ➔</span>
                </div>
                <span style="font-weight: 500; font-size: 12px; color: #475569; margin-top:2px;">${art.desc}</span>
            </summary>
            <div style="padding: 20px; border-top: 1px solid #f1f5f9; background: #fafafa; font-size: 13px; color: #334155; line-height: 1.6; display: flex; flex-direction: column; gap: 12px;">
                ${art.content}
            </div>
        </details>
    `).join('');

    return `
        <div class="help-docs-workspace" style="display: flex; flex-direction: column; gap: 24px; width: 100%; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding-bottom: 40px;">
            
            <!-- HEADER SEARCH AREA -->
            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; border-radius: 12px; padding: 36px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; box-shadow: 0 4px 15px rgba(37,99,235,0.04);">
                <div>
                    <h2 style="margin: 0; font-size: 20px; font-weight: 900; font-family: var(--font-heading); color: #1e3a8a;">NearPro Help Center & Knowledge Base</h2>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #1e40af;">Search configuration tutorials, outbound strategies, and pipeline APIs.</p>
                </div>
                <div style="width: 100%; max-width: 500px; position: relative; display: flex; gap: 8px;">
                    <input type="text" id="helpDocsSearchInput" placeholder="Search for articles, DNS parameters, codes..." value="${searchQuery}" style="width: 100%; padding: 10px 16px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 13px; outline: none; background: #ffffff; color: #0f172a; box-shadow: 0 2px 8px rgba(0,0,0,0.03);" />
                </div>
            </div>

            <!-- MAIN SIDEBAR & ARTICLES SPLIT LAYOUT -->
            <div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">
                
                <!-- Left Sidebar Categories -->
                <div style="width: 250px; display: flex; flex-direction: column; gap: 8px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.01); flex-shrink: 0;">
                    <h4 style="margin: 0 0 10px 0; font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; font-family: var(--font-mono);">Categories</h4>
                    ${categoryListHTML}
                </div>

                <!-- Right Articles Stack -->
                <div style="flex: 1; min-width: 320px; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h4 style="margin:0; font-size: 14px; font-weight: 800; color: #0f172a; font-family: var(--font-heading);">
                            Showing ${filteredArticles.length} guides
                        </h4>
                    </div>
                    
                    ${articlesHTML}
                </div>

            </div>

        </div>
    `;
}

export function bindHelpDocsEvents() {
    if (window.refreshLucideIcons) window.refreshLucideIcons();

    // Category button toggles
    document.querySelectorAll('.help-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedCategory = btn.getAttribute('data-id');
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
            // Debounce or immediate refresh
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
