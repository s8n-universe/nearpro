import { State } from '../state.js';

const ARTICLE_CATEGORIES = [
    { id: 'all', name: 'All Guides' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'prospecting', name: 'Directory & Leads' },
    { id: 'sequences', name: 'Campaigns & Sequences' },
    { id: 'deliverability', name: 'Health & Deliverability' },
    { id: 'proposals', name: 'Proposals & Scripts' },
    { id: 'voice-agent', name: 'AI Voice Calling' },
    { id: 'integrations', name: 'Connections & LLMs' }
];

const ARTICLES = [
    // ─── GETTING STARTED ─────────────────────────────────────────────────────
    {
        category: 'getting-started',
        id: 'workspace-setup',
        title: 'How to set up your NearPro agency workspace from scratch',
        desc: 'Complete walkthrough: profile, billing currency, low-credits alerts, and team member quota allocation.',
        content: `
            <h5>Overview</h5>
            <p>When you create a NearPro account, the platform provisions an isolated workspace with its own credits ledger, seat allocations, and data isolation boundaries. This guide walks you through every required step before running your first search.</p>

            <h5>Step 1 — Complete your Agency Profile</h5>
            <ol>
                <li>Navigate to <strong>Workspace &amp; Setup → Settings</strong>.</li>
                <li>Under <strong>Agency Profile</strong>, enter: Agency Display Name, Primary Business Phone, GST/PAN Number, and Logo URL (400×100px PNG — shown in all PDF proposal headers).</li>
                <li>Set <strong>Default Billing Currency</strong> (INR ₹, USD $, EUR €).</li>
                <li>Click <strong>Save Profile</strong>. A green ✅ toast confirms the update.</li>
            </ol>

            <h5>Step 2 — Configure Credits Alerts</h5>
            <ol>
                <li>In <strong>Settings → Notifications</strong>, set <strong>Low Credits Alert Threshold</strong> to at least 15 credits.</li>
                <li>Enable <strong>Email Alerts</strong> and <strong>In-App Banner</strong> simultaneously.</li>
                <li>Optionally configure a <strong>Webhook Ping</strong> to notify your Slack channel.</li>
            </ol>

            <h5>Step 3 — Invite Team Members</h5>
            <ol>
                <li>Navigate to <strong>Workspace &amp; Setup → Team Workspace</strong>.</li>
                <li>Click <strong>Invite Member</strong>. Enter the team member's business email.</li>
                <li>Allocate per-seat quotas: Monthly Credits Cap, List Access level, Proposal Access level.</li>
                <li>The invited user receives a verification email. Seat activates on confirmation.</li>
            </ol>

            <h5>Step 4 — Workspace Data Isolation</h5>
            <p>NearPro enforces row-level security (RLS) on all saved leads, notes, proposals, and CRM records. Row ownership is enforced at the Supabase layer — team members can only see data their workspace admin explicitly shares.</p>

            <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:12px 14px; border-radius:8px; font-size:12.5px; color:#1e40af; margin-top:14px;">
                <strong>💡 Best Practice:</strong> Create a shared <em>Qualifier</em> seat for SDR team members. Allocate 200 credits/month, restrict to directory read-only access.
            </div>
        `
    },
    {
        category: 'getting-started',
        id: 'api-keys',
        title: 'Configuring Hunter, Apollo, and Clearbit API keys for waterfall enrichment',
        desc: 'Connect your own provider keys to bypass NearPro daily limits and use your existing paid plans.',
        content: `
            <h5>Why Connect Your Own Keys</h5>
            <ul>
                <li>Use your existing Hunter.io or Apollo.io subscription at zero additional NearPro credit cost.</li>
                <li>Run unlimited verification lookups during peak prospecting months.</li>
                <li>Route requests to Clearbit for firmographic enrichment: HQ, headcount, revenue range, tech stack.</li>
            </ul>

            <h5>Step 1 — Locate API Keys at Each Provider</h5>
            <ul>
                <li><strong>Hunter.io:</strong> hunter.io → Dashboard → API Keys</li>
                <li><strong>Apollo.io:</strong> Settings → Integrations → API Keys → Create New Key</li>
                <li><strong>Clearbit:</strong> dashboard.clearbit.com → API → Secret Key</li>
            </ul>

            <h5>Step 2 — Enter Keys in NearPro</h5>
            <ol>
                <li>Go to <strong>Prospect &amp; Enrich → Data Enrichment → API Configuration</strong> tab.</li>
                <li>Enter keys: <code>hunter_api_key</code>, <code>apollo_api_key</code>, <code>clearbit_secret_key</code>.</li>
                <li>All keys are stored AES-256 encrypted at rest in your Supabase vault. Never transmitted to the client.</li>
            </ol>

            <h5>Step 3 — Test Connection</h5>
            <p>Click <strong>Test Connection</strong> next to each provider. A <code>[PASS]</code> badge confirms the key is active. A <code>[FAIL: 401]</code> badge means the key has expired or was revoked.</p>

            <h5>Waterfall Priority Order</h5>
            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:12px; border-radius:8px; font-family:monospace; font-size:12px; margin-top:8px; display:flex; flex-direction:column; gap:6px;">
                <div><span style="color:#2563eb;">1st</span> → NearPro Direct Maps Lookup (fastest, free)</div>
                <div><span style="color:#2563eb;">2nd</span> → Hunter.io email finder (if key connected)</div>
                <div><span style="color:#2563eb;">3rd</span> → Apollo.io contact search (if key connected)</div>
                <div><span style="color:#2563eb;">4th</span> → Clearbit company enrichment (if key connected)</div>
                <div><span style="color:#64748b;">5th</span> → NearPro credits pool fallback (charged to balance)</div>
            </div>

            <div style="background:#fef3c7; border:1px solid #fde68a; padding:12px 14px; border-radius:8px; font-size:12.5px; color:#92400e; margin-top:14px;">
                <strong>⚠️ Caution:</strong> Apollo.io free API tier has a 600 requests/hour rate limit. Enable <strong>Rate Limiter Delay</strong> in enrichment settings to add a 2-second gap between calls to avoid throttling.
            </div>
        `
    },
    {
        category: 'getting-started',
        id: 'subscriptions',
        title: 'Subscriptions, credit pricing tiers, and billing cycle details',
        desc: 'Complete breakdown of Explorer, Scout, Hunter, and Agency plans with credit consumption tables.',
        content: `
            <h5>Plan Overview</h5>
            <table style="width:100%; border-collapse:collapse; font-size:12.5px; margin-top:12px;">
                <thead><tr style="background:#f1f5f9; text-align:left;">
                    <th style="padding:10px 12px; border:1px solid #e2e8f0;">Plan</th>
                    <th style="padding:10px 12px; border:1px solid #e2e8f0;">Price</th>
                    <th style="padding:10px 12px; border:1px solid #e2e8f0;">Credits/mo</th>
                    <th style="padding:10px 12px; border:1px solid #e2e8f0;">Lead Exports</th>
                    <th style="padding:10px 12px; border:1px solid #e2e8f0;">Key Features</th>
                </tr></thead>
                <tbody>
                    <tr><td style="padding:10px 12px; border:1px solid #e2e8f0;"><strong>Explorer (Free)</strong></td><td style="padding:10px 12px; border:1px solid #e2e8f0;">₹0</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">15</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">12 preview cards</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Directory browse, Basic filters</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:10px 12px; border:1px solid #e2e8f0;"><strong>Scout</strong></td><td style="padding:10px 12px; border:1px solid #e2e8f0;">₹499/mo</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">500</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">500 CSV/month</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Smart Lists, CRM, Proposals, Audit</td></tr>
                    <tr><td style="padding:10px 12px; border:1px solid #e2e8f0;"><strong>Hunter</strong></td><td style="padding:10px 12px; border:1px solid #e2e8f0;">₹999/mo</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">2,000</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">2,000/month</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">+ Sequences, Deliverability, Enrichment, Voice</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:10px 12px; border:1px solid #e2e8f0;"><strong>Agency</strong></td><td style="padding:10px 12px; border:1px solid #e2e8f0;">₹2,999/mo</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">10,000</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">Unlimited*</td><td style="padding:10px 12px; border:1px solid #e2e8f0;">+ Shared Seats, Webhooks, White-label</td></tr>
                </tbody>
            </table>

            <h5 style="margin-top:18px;">Credit Consumption Reference</h5>
            <table style="width:100%; border-collapse:collapse; font-size:12.5px; margin-top:8px;">
                <thead><tr style="background:#f1f5f9;"><th style="padding:8px 12px; border:1px solid #e2e8f0;">Action</th><th style="padding:8px 12px; border:1px solid #e2e8f0;">Credits Used</th></tr></thead>
                <tbody>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">Directory search (per page)</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">0 (free)</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">Export 1 lead to CSV</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">1 credit</td></tr>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">Waterfall email enrichment (per lead)</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">2 credits</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">Phone number verification</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">3 credits</td></tr>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">AI email generation</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">1 credit</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">Website Health Audit</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">5 credits</td></tr>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">PDF Proposal generation</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">2 credits</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">AI Voice Call (per minute)</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">5 credits</td></tr>
                </tbody>
            </table>

            <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:12px 14px; border-radius:8px; font-size:12.5px; color:#15803d; margin-top:14px;">
                <strong>✅ Tip:</strong> Annual billing saves 20% and includes 2 months free. Credits do not roll over at the end of a billing cycle.
            </div>
        `
    },
    {
        category: 'getting-started',
        id: 'connected-mailboxes',
        title: 'Connecting and rotating outbound sender mailboxes with App Passwords',
        desc: 'Set up G-Suite or Outlook SMTP/IMAP senders and configure rotation schedules to protect domain reputation.',
        content: `
            <h5>Why Mailbox Rotation Matters</h5>
            <p>Sending all outbound campaigns from a single mailbox causes domain reputation degradation. Google and Microsoft measure daily sending volume per mailbox. Exceeding 150–200 emails/day per mailbox risks:</p>
            <ul>
                <li>Temporary SMTP suspension (soft bounce codes 421, 450).</li>
                <li>Permanent Google Workspace account suspension for spam violations.</li>
                <li>SPF hard failures if volume spikes exceed published max-mx limits.</li>
            </ul>

            <h5>Step 1 — Create Dedicated Sending Mailboxes</h5>
            <ul>
                <li>Use a subdomain pattern: <code>outreach@mail.youragency.com</code>, <code>reach@mail.youragency.com</code>.</li>
                <li>Never use your primary company domain for cold outreach.</li>
                <li>Age each mailbox 14+ days before first campaign use (5–10 internal test emails daily during warmup).</li>
            </ul>

            <h5>Step 2 — Generate an App Password</h5>
            <ul>
                <li><strong>Google Workspace:</strong> myaccount.google.com → Security → 2-Step Verification → App Passwords → Mail → Generate.</li>
                <li><strong>Microsoft 365:</strong> account.microsoft.com → Security → Advanced security options → App passwords.</li>
                <li>App Passwords are 16-character strings. Copy immediately — shown only once.</li>
            </ul>

            <h5>Step 3 — Connect Mailbox in NearPro</h5>
            <ol>
                <li>Navigate to <strong>Engage &amp; Sequences → Email Sequences → ⚙ Sender Settings</strong>.</li>
                <li>Click <strong>+ Connect Sender Mailbox</strong> and enter:
                    <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:12px; border-radius:8px; font-family:monospace; font-size:12px; margin-top:8px; display:flex; flex-direction:column; gap:5px;">
                        <div>SMTP: <span style="color:#0f766e;">smtp.gmail.com:587</span> (TLS)</div>
                        <div>IMAP: <span style="color:#0f766e;">imap.gmail.com:993</span> (SSL)</div>
                        <div>Username: <span style="color:#0f766e;">outreach@mail.youragency.com</span></div>
                        <div>Password: <span style="color:#b45309;">[16-char App Password]</span></div>
                    </div>
                </li>
                <li>Click <strong>Test &amp; Save</strong>. NearPro sends a live test email to verify connectivity.</li>
            </ol>

            <h5>Step 4 — Enable Rotation Scheduling</h5>
            <ol>
                <li>Set <strong>Daily Cap Per Mailbox</strong>: 80 for new domains, 150 for warm senders.</li>
                <li>Enable <strong>Round-Robin Rotation</strong> to distribute sends evenly across connected mailboxes.</li>
                <li>Set <strong>Send Window</strong> to 9:30 AM – 6:00 PM IST, Monday–Friday only.</li>
            </ol>
        `
    },

    // ─── PROSPECTING ─────────────────────────────────────────────────────────
    {
        category: 'prospecting',
        id: 'rating-deficits',
        title: 'Finding leads with rating deficits in Mumbai, Delhi NCR, and Bangalore',
        desc: 'Advanced search criteria to locate businesses with critical review volume gaps and below-average Google ratings.',
        content: `
            <h5>Why Rating-Deficit Leads Are Easiest to Close</h5>
            <p>A business owner with 50+ Google reviews but only 3.8–4.1★ already knows they have a reputation problem. They don't need to be educated — they see it every time a competitor outranks them on "dentist near me". This makes them dramatically easier to close than cold outreach to successful 4.8★ businesses.</p>
            <p><strong>Target window:</strong> Rating between 3.5★ and 4.2★ with more than 30 reviews.</p>

            <h5>Step-by-Step Filter Configuration</h5>
            <ol>
                <li>Go to <strong>Prospect &amp; Enrich → Browse Directory</strong>. Select target city and industry category.</li>
                <li>Click <strong>Show Filters</strong> and configure:
                    <table style="width:100%; border-collapse:collapse; font-size:12.5px; margin-top:10px;">
                        <thead><tr style="background:#f1f5f9;"><th style="padding:8px 12px; border:1px solid #e2e8f0;">Filter</th><th style="padding:8px 12px; border:1px solid #e2e8f0;">Value</th><th style="padding:8px 12px; border:1px solid #e2e8f0;">Why</th></tr></thead>
                        <tbody>
                            <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">Minimum Rating</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">3.5★</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Exclude inactive businesses</td></tr>
                            <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">Maximum Rating</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">4.2★</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Stay in the fixable range</td></tr>
                            <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">Has Email</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">✅ Yes</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Contactable leads only</td></tr>
                            <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">Website Status</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">No Website or Unoptimized</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Identifies secondary upsell</td></tr>
                        </tbody>
                    </table>
                </li>
                <li>Select all matching records and click <strong>Add to List</strong> (e.g., "Deficit Clinics Mumbai – Aug 2026").</li>
            </ol>

            <h5>Understanding the Audit Gap Banner</h5>
            <p>When your search returns no-website leads, NearPro automatically displays the <strong>Revenue Opportunity Detected</strong> banner. This calculates: count of no-website leads × ₹30,000 website package = total pipeline value. Clicking <strong>Target Gap Leads</strong> instantly applies the no-website filter.</p>

            <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:12px 14px; border-radius:8px; font-size:12.5px; color:#1e40af; margin-top:14px;">
                <strong>💡 Tip:</strong> Combine "no website" + "rating under 4.2★" for a dual-service pitch: reputation management + website build. These convert at ~18% with a personalized WhatsApp pitch mentioning their specific rating.
            </div>
        `
    },
    {
        category: 'prospecting',
        id: 'waterfall-enrichment',
        title: 'Running waterfall enrichment for mobile number and email lookups',
        desc: 'How the multi-provider verification pipeline extracts and cross-validates business contact details.',
        content: `
            <h5>Enrichment Provider Priority</h5>
            <ol>
                <li><strong>Google Maps API</strong> — Direct structured data. Free. Always runs first.</li>
                <li><strong>Website HTML Scraper</strong> — Scans <code>tel:</code> links and schema.org markup. Free.</li>
                <li><strong>Hunter.io Email Finder</strong> — Domain pattern inference. Returns confidence score 0–100.</li>
                <li><strong>Apollo.io Person Search</strong> — Cross-references domain against 275M+ contact database.</li>
                <li><strong>Clearbit Reveal</strong> — Company firmographic: industry, headcount, tech stack, revenue range.</li>
            </ol>

            <h5>Running Enrichment on a List</h5>
            <ol>
                <li>Go to <strong>Prospect &amp; Enrich → Smart Lists</strong>. Open your target list.</li>
                <li>Click <strong>Enrich Selected Leads</strong>. Select data points: email, phone, LinkedIn, revenue (Clearbit).</li>
                <li>Preview total credit cost. Click <strong>Run Enrichment</strong>.</li>
                <li>Enrichment runs async. You receive in-app notification and email on completion.</li>
            </ol>

            <h5>Validation Status Tags</h5>
            <table style="width:100%; border-collapse:collapse; font-size:12.5px; margin-top:8px;">
                <thead><tr style="background:#f1f5f9;"><th style="padding:8px 12px; border:1px solid #e2e8f0;">Badge</th><th style="padding:8px 12px; border:1px solid #e2e8f0;">Meaning</th></tr></thead>
                <tbody>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;"><span style="color:#15803d; font-weight:700;">[DELIVERABLE]</span></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Confirmed valid by MX check and SMTP ping</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;"><span style="color:#b45309; font-weight:700;">[RISKY]</span></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Exists but MX misconfigured or using catch-all</td></tr>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;"><span style="color:#dc2626; font-weight:700;">[INVALID]</span></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Hard bounce — address does not exist</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;"><span style="color:#64748b; font-weight:700;">[UNKNOWN]</span></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">MX server blocked SMTP ping — unconfirmed</td></tr>
                </tbody>
            </table>
            <div style="background:#fef3c7; border:1px solid #fde68a; padding:12px 14px; border-radius:8px; font-size:12.5px; color:#92400e; margin-top:14px;">
                <strong>⚠️ Important:</strong> Only send campaigns to <strong>[DELIVERABLE]</strong> and possibly <strong>[RISKY]</strong> records. Sending to <strong>[INVALID]</strong> raises your bounce rate and triggers spam filter penalties.
            </div>
        `
    },
    {
        category: 'prospecting',
        id: 'intent-signals',
        title: 'Configuring custom intent signal triggers and real-time alerts',
        desc: 'Receive real-time alerts when prospects experience rating drops, SSL certificate loss, or domain expirations.',
        content: `
            <h5>Available Signal Types</h5>
            <table style="width:100%; border-collapse:collapse; font-size:12.5px; margin-top:8px;">
                <thead><tr style="background:#f1f5f9;"><th style="padding:8px 12px; border:1px solid #e2e8f0;">Signal</th><th style="padding:8px 12px; border:1px solid #e2e8f0;">Trigger Condition</th><th style="padding:8px 12px; border:1px solid #e2e8f0;">Recommended Action</th></tr></thead>
                <tbody>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">Rating Drop</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Rating falls below configured threshold</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">WhatsApp outreach within 24 hours</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">SSL Certificate Loss</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">HTTPS cert expires or revoked</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Web maintenance upsell pitch</td></tr>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">Domain Expiration</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Domain expires within 30 days</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Domain renewal + hosting bundle offer</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">New 1★ Review</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">New negative Google review posted</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Reputation management pitch</td></tr>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">Social Media Silence</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">No social posts in 30+ days</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Social media retainer pitch</td></tr>
                </tbody>
            </table>

            <h5>Setting Up a Signal Rule</h5>
            <ol>
                <li>Go to <strong>Prospect &amp; Enrich → Intent Signals → + New Signal Rule</strong>.</li>
                <li>Select Signal Type. Specify Target List. Set delivery: In-app, Email, or Webhook.</li>
                <li>Click <strong>Activate Rule</strong>. Signals poll every 6 hours.</li>
            </ol>

            <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:12px 14px; border-radius:8px; font-size:12.5px; color:#1e40af; margin-top:14px;">
                <strong>💡 Pro Strategy:</strong> Create one "Rating Drop below 4.0★" signal targeting your full Mumbai Healthcare list. When it fires, immediately dispatch a WhatsApp message via sequence: <em>"Noticed your Google rating dropped — here's how we can help."</em> This gets 3× higher reply rates than generic outreach.
            </div>
        `
    },

    // ─── SEQUENCES ────────────────────────────────────────────────────────────
    {
        category: 'sequences',
        id: 'hinglish-sequences',
        title: 'Drafting multi-channel Hinglish sequences with WhatsApp and email touchpoints',
        desc: 'Design high-converting campaign outlines combining emails, WhatsApp messages, and Twilio call scripts.',
        content: `
            <h5>Why Hinglish Converts Better in India</h5>
            <p>Internal NearPro user benchmarks:</p>
            <ul>
                <li>Formal English cold email: 12–14% open rate</li>
                <li>Hinglish cold email: 28–35% open rate</li>
                <li>Hinglish WhatsApp: 68–80% read rate</li>
            </ul>

            <h5>4-Touch Sequence Template</h5>
            <div style="display:flex; flex-direction:column; gap:12px; margin-top:8px;">
                <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:14px;">
                    <div style="font-size:11px; font-weight:800; color:#2563eb; text-transform:uppercase; margin-bottom:6px;">Step 1 — Day 1 — Email</div>
                    <p style="margin:0; font-size:12.5px;"><strong>Subject:</strong> {{business_name}} ko Google par aur zyada customers mil sakte hain 🌟<br><strong>Body:</strong> Namaste {{first_name}} ji, humne dekha ki aapki Google rating {{rating}}★ hai. Hum local businesses ko 4.8★+ tak laane mein help karte hain sirf 45 din mein. Kya aap 10 minute kal baat kar sakte hain?</p>
                </div>
                <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:14px;">
                    <div style="font-size:11px; font-weight:800; color:#2563eb; text-transform:uppercase; margin-bottom:6px;">Step 2 — Day 3 — WhatsApp</div>
                    <p style="margin:0; font-size:12.5px;"><strong>Message:</strong> Hi {{first_name}} ji 👋 Maine aapko email bheja tha {{business_name}} ke baare mein. Bas 2 minute chahiye — aapki clinic ke liye free Google rating analysis kar sakte hain. Reply "HAAN" karein agar interested hain.</p>
                </div>
                <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:14px;">
                    <div style="font-size:11px; font-weight:800; color:#2563eb; text-transform:uppercase; margin-bottom:6px;">Step 3 — Day 5 — Twilio Call Script</div>
                    <p style="margin:0; font-size:12.5px; font-style:italic;">"Namaste, {{first_name}} ji? Main [Your Name] bol raha hoon. Aapki clinic ka naam Google Maps par dekha — bahut achha kaam kar rahe hain. Rating improvement ke baare mein ek chhoti si baat karna tha. Abhi 2 minute hain?"</p>
                </div>
                <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:14px;">
                    <div style="font-size:11px; font-weight:800; color:#2563eb; text-transform:uppercase; margin-bottom:6px;">Step 4 — Day 8 — Break-Up Email</div>
                    <p style="margin:0; font-size:12.5px;"><strong>Subject:</strong> Last message from us, {{first_name}} ji<br>Yeh hamara last email hai. Agar kabhi bhi Google Maps visibility badhani ho toh hum yahan hain. All the best to {{business_name}}! 🙏</p>
                </div>
            </div>

            <h5 style="margin-top:16px;">Personalization Tokens Available</h5>
            <table style="width:100%; border-collapse:collapse; font-size:12.5px; margin-top:8px;">
                <thead><tr style="background:#f1f5f9;"><th style="padding:8px 12px; border:1px solid #e2e8f0;">Token</th><th style="padding:8px 12px; border:1px solid #e2e8f0;">Data Source</th></tr></thead>
                <tbody>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;"><code>{{business_name}}</code></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">NearPro directory business name</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;"><code>{{first_name}}</code></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">CRM contact first name from enrichment</td></tr>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;"><code>{{rating}}</code></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Google Maps rating from NearPro profile</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;"><code>{{area}}</code></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Business area / locality</td></tr>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;"><code>{{category}}</code></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Business category (e.g., "Dental Clinic")</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;"><code>{{sender_name}}</code></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Sending mailbox owner name</td></tr>
                </tbody>
            </table>
        `
    },

    // ─── DELIVERABILITY ───────────────────────────────────────────────────────
    {
        category: 'deliverability',
        id: 'dns-configuration',
        title: 'Setting up SPF, DKIM, and DMARC DNS records for custom sender mailboxes',
        desc: 'Authentication standards required to achieve inbox placement — full DNS zone configuration and staged rollout guide.',
        content: `
            <h5>What These Records Do</h5>
            <ul>
                <li><strong>SPF:</strong> Tells recipient mail servers which IPs are authorized to send email from your domain. Without it, emails fail sender verification.</li>
                <li><strong>DKIM:</strong> Adds a cryptographic signature to every email, verified against a public key in your DNS. Prevents content tampering in transit.</li>
                <li><strong>DMARC:</strong> Instructs receiving servers what to do when SPF/DKIM fails (none/quarantine/reject). Configures aggregate reporting to your inbox.</li>
            </ul>

            <h5>Google Workspace — DNS TXT Records</h5>
            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:14px; border-radius:8px; font-family:monospace; font-size:11.5px; display:flex; flex-direction:column; gap:14px; margin-top:8px;">
                <div><strong style="color:#0f172a;">1. SPF</strong><br>Host: @ | Type: TXT | TTL: 3600<br>Value: <span style="color:#b45309;">v=spf1 include:_spf.google.com ~all</span></div>
                <div><strong style="color:#0f172a;">2. DKIM</strong><br>Host: google._domainkey | Type: TXT<br>Value: <span style="color:#b45309;">[Copy from Google Admin → Apps → Gmail → Authenticate email → Generate DKIM key]</span></div>
                <div><strong style="color:#0f172a;">3. DMARC</strong><br>Host: _dmarc | Type: TXT | TTL: 3600<br>Value: <span style="color:#b45309;">v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@yourdomain.com; fo=1</span></div>
            </div>

            <h5>Microsoft 365 SPF Record</h5>
            <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:12px; border-radius:8px; font-family:monospace; font-size:11.5px; margin-top:8px;">v=spf1 include:spf.protection.outlook.com ~all</div>

            <h5>Verify in NearPro</h5>
            <p>After publishing DNS changes, wait 15–30 minutes. Go to <strong>Deliverability Hub → Diagnostics → Run Full Domain Authentication Check</strong>. All three records need green <code>PASS</code> badges before launching campaigns.</p>

            <h5>DMARC Staged Rollout Strategy</h5>
            <ol>
                <li><strong>Week 1–2:</strong> <code>p=none</code> — monitor mode only. Review aggregate reports at dmarc.postmarkapp.com.</li>
                <li><strong>Week 3–4:</strong> <code>p=quarantine; pct=25</code> — quarantine 25% of failing messages.</li>
                <li><strong>Month 2+:</strong> <code>p=reject; pct=100</code> — full enforcement, maximum reputation protection.</li>
            </ol>

            <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:12px 14px; border-radius:8px; font-size:12.5px; color:#15803d; margin-top:14px;">
                <strong>✅ Goal:</strong> With all three records passing, your MXToolbox sender reputation score will reach <strong>10/10</strong> — the minimum before launching cold email campaigns.
            </div>
        `
    },

    // ─── PROPOSALS ────────────────────────────────────────────────────────────
    {
        category: 'proposals',
        id: 'pdf-proposals',
        title: 'Generating PDF proposals with competitor analysis and revenue projections',
        desc: 'Build high-impact proposals showing the client their rating gap, calculated revenue loss, and 3-tier package options.',
        content: `
            <h5>What Makes a NearPro Proposal Different</h5>
            <p>A NearPro proposal starts with the business owner's own data — their exact Google rating, how many competitors outrank them, how many reviews they are missing, and a calculated revenue loss estimate. This turns a sales pitch into a diagnostic report that is dramatically harder to ignore.</p>

            <h5>Step 1 — Prepare the Lead</h5>
            <ol>
                <li>Save the target lead in <strong>AI Deal Hub (CRM)</strong> with a confirmed website URL and Google Maps rating.</li>
                <li>Run the <strong>Website Audit</strong> tool on the lead's website (5 credits).</li>
                <li>Confirm the lead's Google category is correctly mapped (e.g., "Dental Clinic", "Law Office", "Salon").</li>
            </ol>

            <h5>Step 2 — Launch the Proposal Builder</h5>
            <ol>
                <li>Open the lead's detail panel in CRM → click <strong>Generate Proposal</strong>.</li>
                <li>Configure: Proposal Theme (White / Dark / Custom Brand), Package Options (Starter ₹15k / Pro ₹30k / Growth ₹60k), Competitor Count (default 5).</li>
            </ol>

            <h5>Auto-Calculated Sections</h5>
            <table style="width:100%; border-collapse:collapse; font-size:12.5px; margin-top:8px;">
                <thead><tr style="background:#f1f5f9;"><th style="padding:8px 12px; border:1px solid #e2e8f0;">Section</th><th style="padding:8px 12px; border:1px solid #e2e8f0;">Formula</th></tr></thead>
                <tbody>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">Monthly Revenue Loss Estimate</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">(4.8 − current_rating) × monthly_searches × 0.03 × avg_ticket</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">Competitor Rating Gap</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">avg_competitor_rating − client_rating</td></tr>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">Reviews Needed to 4.5★</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Weighted average formula with 5★ reviews required</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">Website Health Score</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Weighted score across 8 audit parameters</td></tr>
                </tbody>
            </table>

            <h5>Step 3 — Share the Proposal</h5>
            <p>Click <strong>Generate PDF</strong>. The 3-page PDF (overview, competitor analysis, packages) is uploaded to storage. A permanent signed URL is generated, valid 90 days. Share via WhatsApp, email, or LinkedIn InMail.</p>
        `
    },

    // ─── VOICE AGENT ──────────────────────────────────────────────────────────
    {
        category: 'voice-agent',
        id: 'priya-compliance',
        title: 'Setting up TRAI-compliant AI calling campaigns with Priya Voice Agent',
        desc: 'Complete compliance checklist and call script configuration for cold-calling campaigns under TRAI regulations.',
        content: `
            <h5>TRAI Compliance Requirements Checklist</h5>
            <table style="width:100%; border-collapse:collapse; font-size:12.5px; margin-top:8px;">
                <thead><tr style="background:#f1f5f9;"><th style="padding:8px 12px; border:1px solid #e2e8f0;">Requirement</th><th style="padding:8px 12px; border:1px solid #e2e8f0;">How to Complete</th></tr></thead>
                <tbody>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">NDNC Scrub</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Toggle DND Scrub ON in Voice Agent settings before dialing</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">TRAI Consent Intro</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Upload MP3 disclosure: "Yeh ek commercial call hai [Company] ki taraf se..."</td></tr>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">Caller ID Registration</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Register as telemarketer at TRAI portal (Form TM-1)</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">Call Time Windows</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Only call 9:00 AM – 9:00 PM IST weekdays</td></tr>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">Opt-Out Mechanism</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Keypress 9 to opt-out during call — built into Priya's IVR template</td></tr>
                </tbody>
            </table>

            <h5>Configuring Priya's Qualifying Script</h5>
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:14px; font-size:12.5px; display:flex; flex-direction:column; gap:10px; margin-top:8px;">
                <div><strong>Opening:</strong> <em>"Namaste! Main Priya hoon, [Agency Name] se. {{business_name}} ke owner se baat karni thi — kya aap available hain?"</em></div>
                <div><strong>Q1 (if YES):</strong> <em>"Aapki clinic Google par {{rating}}★ hai. Kya aap zyada customers chahte hain?"</em></div>
                <div><strong>Q2 (if YES):</strong> <em>"Kya hum WhatsApp par free analysis bhej sakte hain aapke liye?"</em></div>
                <div><strong>Warm Transfer (if YES):</strong> Transfer to human SDR or schedule callback.</div>
                <div><strong>Graceful Exit (if NO at any node):</strong> <em>"Theek hai ji, koi baat nahi. Aapka samay dene ke liye shukriya. Have a great day!"</em></div>
            </div>

            <div style="background:#fef3c7; border:1px solid #fde68a; padding:12px 14px; border-radius:8px; font-size:12.5px; color:#92400e; margin-top:14px;">
                <strong>⚠️ Legal Note:</strong> Always disclose recording. Store all call transcripts and recordings for 90+ days as required by TRAI. NearPro logs all calls and transcripts automatically in your workspace.
            </div>
        `
    },

    // ─── INTEGRATIONS ─────────────────────────────────────────────────────────
    {
        category: 'integrations',
        id: 'n8n-webhooks',
        title: 'Configuring n8n webhook sync for HubSpot, Google Sheets, and Slack',
        desc: 'Complete webhook payload schema, HMAC authentication header verification, and n8n workflow node setup.',
        content: `
            <h5>Available Webhook Events</h5>
            <table style="width:100%; border-collapse:collapse; font-size:12.5px; margin-top:8px;">
                <thead><tr style="background:#f1f5f9;"><th style="padding:8px 12px; border:1px solid #e2e8f0;">Event</th><th style="padding:8px 12px; border:1px solid #e2e8f0;">Trigger Condition</th></tr></thead>
                <tbody>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;"><code>lead.saved</code></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">New lead saved to CRM pipeline</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;"><code>lead.stage_changed</code></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Lead moves between CRM stages</td></tr>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;"><code>sequence.replied</code></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Prospect replies to email touchpoint</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;"><code>proposal.viewed</code></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Prospect opens shared proposal link</td></tr>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;"><code>signal.fired</code></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Intent signal condition triggered</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;"><code>enrichment.completed</code></td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Enrichment job finishes for lead batch</td></tr>
                </tbody>
            </table>

            <h5>Full Webhook Payload Schema</h5>
            <pre style="background:#f1f5f9; border:1px solid #cbd5e1; padding:14px; border-radius:8px; font-size:11px; overflow-x:auto; font-family:monospace; margin-top:8px;">{
  "event": "lead.stage_changed",
  "timestamp": "2026-08-03T09:30:00Z",
  "workspace_id": "ws_8a3f2b91",
  "lead": {
    "id": "9a3f2b8-932f",
    "business_name": "Dr. Mehta Dental Clinic",
    "category": "Dental Clinic",
    "area": "Andheri West, Mumbai",
    "rating": 3.9,
    "phone": "+91-98201-12345",
    "email": "info@mehtadental.com",
    "stage_from": "prospect",
    "stage_to": "offer_sent",
    "deal_value": 25000,
    "assigned_to": "founder@youragency.com"
  }
}</pre>

            <h5>Register Webhook URL in NearPro</h5>
            <ol>
                <li>Go to <strong>Workspace &amp; Setup → Connection Hub → + Add Webhook Destination</strong>.</li>
                <li>Paste your n8n Webhook Trigger URL. Select subscribed events.</li>
                <li>Add <strong>Secret Header</strong>: NearPro sends <code>X-NearPro-Signature: sha256=[HMAC]</code>. Verify this in your listener to prevent spoofed calls.</li>
                <li>Click <strong>Save &amp; Test Webhook</strong>. A test <code>ping</code> event fires to verify connectivity.</li>
            </ol>

            <h5>n8n Workflow: Auto-add Lead to HubSpot</h5>
            <ol>
                <li><strong>Webhook Node:</strong> Listens on the NearPro URL. Filter: event = <code>lead.stage_changed</code> AND <code>stage_to = "offer_sent"</code>.</li>
                <li><strong>HubSpot Contact Node:</strong> Create/update contact using <code>lead.email</code>, <code>lead.business_name</code>, <code>lead.phone</code>.</li>
                <li><strong>HubSpot Deal Node:</strong> Create deal in "Proposal Sent" stage, amount = <code>lead.deal_value</code>.</li>
                <li><strong>Slack Node:</strong> Post to <code>#deals-channel</code>: <em>"🎯 New offer sent to {{business_name}} (₹{{deal_value}}). Check HubSpot."</em></li>
            </ol>
        `
    },
    {
        category: 'integrations',
        id: 'local-ollama',
        title: 'Running local Ollama models for hybrid offline prompt routing',
        desc: 'Configure Llama-3, Mistral, and Phi-3 for NearPro\'s hybrid LLM router with latency benchmarks and fallback rules.',
        content: `
            <h5>Why Hybrid LLM Routing?</h5>
            <ul>
                <li><strong>Zero API cost</strong> — no per-token billing for prompts on your hardware.</li>
                <li><strong>Data privacy</strong> — prospect data never leaves your machine for AI processing.</li>
                <li><strong>No rate limits</strong> — unlimited concurrent prompt executions.</li>
                <li><strong>Speed</strong> — on GPU hardware, local models beat API round-trip latency for short prompts.</li>
            </ul>

            <h5>Step 1 — Install Ollama and Pull Models</h5>
            <ol>
                <li>Download Ollama from <strong>ollama.ai</strong> and install on Mac, Windows (WSL2), or Linux.</li>
                <li>Pull your preferred models in terminal:
                    <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:12px; border-radius:8px; font-family:monospace; font-size:12px; margin-top:8px; display:flex; flex-direction:column; gap:4px;">
                        <div><span style="color:#64748b;"># Llama-3 8B (4.7 GB — recommended)</span></div>
                        <div>ollama pull llama3</div>
                        <div style="margin-top:4px;"><span style="color:#64748b;"># Mistral 7B (4.1 GB — fast, great for email drafting)</span></div>
                        <div>ollama pull mistral</div>
                        <div style="margin-top:4px;"><span style="color:#64748b;"># Start the Ollama server</span></div>
                        <div>ollama serve</div>
                    </div>
                </li>
                <li>Server runs on <code>http://localhost:11434</code> by default.</li>
            </ol>

            <h5>Step 2 — Connect to NearPro</h5>
            <ol>
                <li>Navigate to <strong>Workspace &amp; Setup → LLM Router Settings</strong>.</li>
                <li>Toggle <strong>Hybrid Routing</strong> to enabled. Enter endpoint: <code>http://localhost:11434</code>.</li>
                <li>Select local model: <code>llama3</code> or <code>mistral</code>.</li>
                <li>Click <strong>Run Latency Benchmark</strong>. NearPro sends a 50-token test prompt and measures response time in ms.</li>
            </ol>

            <h5>Routing Recommendations</h5>
            <table style="width:100%; border-collapse:collapse; font-size:12.5px; margin-top:8px;">
                <thead><tr style="background:#f1f5f9;"><th style="padding:8px 12px; border:1px solid #e2e8f0;">Use Case</th><th style="padding:8px 12px; border:1px solid #e2e8f0;">Recommended Routing</th></tr></thead>
                <tbody>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">Bulk email drafting (100+ leads)</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Local Ollama (Mistral) — zero cost</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">High-stakes proposal personalization</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Cloud (GPT-4o) — highest quality</td></tr>
                    <tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">Call script generation</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Local Ollama (Llama-3) — fast, adequate</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">Website audit summaries</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Cloud (Gemini Pro) — best structured output</td></tr>
                </tbody>
            </table>

            <h5>Troubleshooting</h5>
            <ul>
                <li><strong>"Connection refused on port 11434"</strong> → Run <code>ollama serve</code> in your terminal.</li>
                <li><strong>"Model not found"</strong> → Run <code>ollama pull llama3</code>.</li>
                <li><strong>Timeout in production</strong> → Ollama is localhost-only. Use Nginx reverse proxy for remote team access.</li>
            </ul>

            <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:12px 14px; border-radius:8px; font-size:12.5px; color:#1e40af; margin-top:14px;">
                <strong>💡 GPU Acceleration:</strong> Install CUDA (NVIDIA) or ROCm (AMD) drivers before running Ollama for 5–10× faster response vs CPU-only mode.
            </div>
        `
    }
];

// ── Module State ──────────────────────────────────────────────────────────────
let selectedCategory = 'landing';
let searchQuery = '';

// ── Standalone Public Docs Layout ─────────────────────────────────────────────
export function renderDocsLayout() {
    const isLoggedIn = !!State.user;
    const ctaLabel = isLoggedIn ? 'Go to Dashboard' : 'Get Started Free';
    const ctaHref  = isLoggedIn ? '#/dashboard/overview' : 'javascript:void(0)';
    const ctaClick = isLoggedIn ? '' : ' onclick="window.State && window.State.setAuthModal(true);"';

    return `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
            .np-docs * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; box-sizing: border-box; }
            .np-docs h1, .np-docs h2, .np-docs h3, .np-docs h4, .np-docs h5 { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            .np-docs a:hover { color: #0f172a !important; }
            .np-docs details summary::-webkit-details-marker { display: none; }
            .np-docs details[open] summary .art-chevron { transform: rotate(90deg); }
            .np-docs .art-chevron { display: inline-block; transition: transform 0.15s; }
            .np-docs table { border-collapse: collapse; width: 100%; }
            .np-docs code { font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace; font-size: 0.88em; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #0f766e; }
        </style>
        <div class="np-docs" style="min-height:100vh; background:#ffffff; color:#0f172a; display:flex; flex-direction:column;">

            <!-- PUBLIC DOCS HEADER -->
            <header style="position:sticky; top:0; z-index:100; background:#ffffff; border-bottom:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(15,23,42,0.04);">
                <div style="max-width:1200px; margin:0 auto; padding:0 24px; height:58px; display:flex; align-items:center; justify-content:space-between; gap:16px;">
                    <a href="#/docs" style="display:flex; align-items:center; gap:10px; text-decoration:none;">
                        <span style="font-size:17px; font-weight:800; color:#0f172a; letter-spacing:-0.5px;">NearPro</span>
                        <span style="font-size:11px; font-weight:600; background:#f1f5f9; color:#64748b; padding:3px 8px; border-radius:4px; letter-spacing:0.3px;">Docs</span>
                    </a>
                    <nav style="display:flex; align-items:center; gap:28px; font-size:13.5px; font-weight:500; color:#475569;">
                        <a href="#/" style="color:#475569; text-decoration:none; transition:color 0.15s;">Directory</a>
                        <a href="#/dashboard/overview" style="color:#475569; text-decoration:none; transition:color 0.15s;">Platform</a>
                        <a href="javascript:void(0)" onclick="document.getElementById('docs-pricing')?.scrollIntoView({behavior:'smooth', block:'start'})" style="color:#475569; text-decoration:none; transition:color 0.15s; cursor:pointer;">Pricing</a>
                    </nav>
                    <a href="${ctaHref}"${ctaClick} style="display:inline-flex; align-items:center; gap:6px; background:#0f172a; color:#ffffff; font-size:13px; font-weight:600; padding:8px 18px; border-radius:7px; text-decoration:none; white-space:nowrap; letter-spacing:0.1px;">
                        ${ctaLabel}
                    </a>
                </div>
            </header>

            <!-- DOCS CONTENT -->
            <main style="flex:1; max-width:1200px; width:100%; margin:0 auto; padding:40px 24px 80px;" id="docsMainContent">
                ${renderHelpDocsContent()}
            </main>

            <!-- PUBLIC FOOTER -->
            <footer style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:48px 24px 32px;">
                <div style="max-width:1200px; margin:0 auto;">
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:40px; margin-bottom:40px;">
                        <div>
                            <div style="font-size:15px; font-weight:800; color:#0f172a; margin-bottom:14px; letter-spacing:-0.3px;">NearPro</div>
                            <p style="font-size:12.5px; color:#64748b; line-height:1.65; margin:0;">India's B2B Lead Intelligence Platform for local business prospecting and agency outreach automation.</p>
                        </div>
                        <div>
                            <div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.9px; color:#94a3b8; margin-bottom:14px;">Product</div>
                            <div style="display:flex; flex-direction:column; gap:9px; font-size:13px;">
                                <a href="#/" style="color:#475569; text-decoration:none;">B2B Directory</a>
                                <a href="#/dashboard/overview" style="color:#475569; text-decoration:none;">Platform Overview</a>
                                <a href="javascript:void(0)" onclick="document.getElementById('docs-pricing')?.scrollIntoView({behavior:'smooth'})" style="color:#475569; text-decoration:none; cursor:pointer;">Pricing</a>
                            </div>
                        </div>
                        <div>
                            <div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.9px; color:#94a3b8; margin-bottom:14px;">Resources</div>
                            <div style="display:flex; flex-direction:column; gap:9px; font-size:13px;">
                                <a href="#/docs" style="color:#0f172a; font-weight:600; text-decoration:none;">Documentation</a>
                                <a href="#/docs" style="color:#475569; text-decoration:none;">API Reference</a>
                                <a href="#/docs" style="color:#475569; text-decoration:none;">Integration Guides</a>
                            </div>
                        </div>
                        <div>
                            <div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.9px; color:#94a3b8; margin-bottom:14px;">Legal</div>
                            <div style="display:flex; flex-direction:column; gap:9px; font-size:13px;">
                                <a href="#/privacy" style="color:#475569; text-decoration:none;">Privacy Policy</a>
                                <a href="#/terms" style="color:#475569; text-decoration:none;">Terms of Service</a>
                                <a href="#/opt-out" style="color:#475569; text-decoration:none;">Business Opt-Out</a>
                            </div>
                        </div>
                        <div>
                            <div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.9px; color:#94a3b8; margin-bottom:14px;">Company</div>
                            <div style="display:flex; flex-direction:column; gap:9px; font-size:13px;">
                                <a href="https://www.linkedin.com/company/s8n-nearpro" target="_blank" style="color:#475569; text-decoration:none;">LinkedIn</a>
                                <a href="mailto:support@s8n.in" style="color:#475569; text-decoration:none;">Contact Support</a>
                            </div>
                        </div>
                    </div>
                    <div style="border-top:1px solid #e2e8f0; padding-top:24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; font-size:12px; color:#94a3b8;">
                        <div>NearPro by S8N AI Services. All rights reserved. 2026.</div>
                        <div>Built for Indian agencies</div>
                    </div>
                </div>
            </footer>

            <!-- Modal slots -->
            <div id="authModalPlaceholder"></div>
            <div id="pricingModalPlaceholder"></div>
            <div id="explorerPlanModalPlaceholder"></div>
        </div>
    `;
}

export function bindDocsEvents() {
    if (window.refreshLucideIcons) window.refreshLucideIcons();
    bindDocsContentEvents();
}

// ── Dashboard-embedded fallbacks (keeps existing tab working) ─────────────────
export function renderHelpDocs() {
    return renderHelpDocsContent();
}

export function bindHelpDocsEvents() {
    bindDocsContentEvents();
}

// ── Shared Content Renderer ────────────────────────────────────────────────────
function renderHelpDocsContent() {
    const filteredArticles = ARTICLES.filter(a => {
        const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory || selectedCategory === 'landing';
        const matchesSearch = searchQuery === '' ||
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categoryListHTML = ARTICLE_CATEGORIES.map(c => `
        <button class="help-cat-btn ${selectedCategory === c.id ? 'active' : ''}" data-id="${c.id}" style="width:100%; text-align:left; padding:9px 14px; font-size:13px; font-weight:600; color:${selectedCategory === c.id ? '#2563eb' : '#475569'}; background:${selectedCategory === c.id ? '#eff6ff' : 'none'}; border:none; border-radius:6px; cursor:pointer; transition:all 0.15s; display:flex; align-items:center; justify-content:space-between;">
            <span>${c.name}</span>
            <span style="font-size:10.5px; background:rgba(0,0,0,0.04); color:#64748b; padding:2px 6px; border-radius:4px;">${c.id === 'all' ? ARTICLES.length : ARTICLES.filter(a => a.category === c.id).length}</span>
        </button>
    `).join('');

    const articlesHTML = filteredArticles.length === 0 ? `
        <div style="padding:60px 24px; text-align:center; border:1px dashed #cbd5e1; border-radius:12px; background:#ffffff;">
            <div style="font-size:36px; margin-bottom:12px;">🔍</div>
            <h4 style="margin:0 0 6px 0; color:#0f172a; font-weight:800;">No articles match your query</h4>
            <p style="margin:0; color:#475569; font-size:12.5px;">Try different keywords or select a different category.</p>
        </div>
    ` : filteredArticles.map((art, idx) => `
        <details id="art-${art.id}" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.02); margin-bottom:12px;" ${idx === 0 || searchQuery !== '' ? 'open' : ''}>
            <summary style="padding:18px 22px; font-weight:700; font-size:14px; color:#0f172a; cursor:pointer; outline:none; list-style:none; user-select:none;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
                    <span>${art.title}</span>
                    <span style="font-size:11px; color:#2563eb; font-family:monospace; white-space:nowrap; flex-shrink:0;">Read ➔</span>
                </div>
                <div style="font-weight:500; font-size:12.5px; color:#64748b; margin-top:4px;">${art.desc}</div>
            </summary>
            <div style="padding:24px; border-top:1px solid #f1f5f9; background:#fafafa; font-size:13.5px; color:#334155; line-height:1.7;">
                ${art.content}
            </div>
        </details>
    `).join('');

    const catCards = [
        { id:'getting-started', abbr:'GS', bg:'#2563eb', label:'Getting Started', desc:'Workspace setup, API keys, billing plans, mailbox configuration' },
        { id:'prospecting',     abbr:'DL', bg:'#0891b2', label:'Directory & Leads', desc:'Rating deficit hunting, waterfall enrichment, intent signals' },
        { id:'sequences',       abbr:'CS', bg:'#7c3aed', label:'Campaigns & Sequences', desc:'Hinglish outreach templates, multi-touch drip campaigns' },
        { id:'deliverability',  abbr:'HD', bg:'#0f766e', label:'Health & Deliverability', desc:'SPF, DKIM, DMARC setup and domain reputation management' },
        { id:'proposals',       abbr:'PS', bg:'#b45309', label:'Proposals & Scripts', desc:'PDF proposals, revenue projections, competitor analysis' },
        { id:'voice-agent',     abbr:'VC', bg:'#dc2626', label:'AI Voice Calling', desc:'Priya agent setup, TRAI compliance, DND scrub, call scripts' },
        { id:'integrations',    abbr:'LM', bg:'#065f46', label:'Connections & LLMs', desc:'n8n webhooks, Ollama setup, HubSpot sync, API reference' },
    ];

    const landingHTML = `
        <!-- Hero Search -->
        <div style="background:linear-gradient(150deg,#0f172a 0%,#1a2744 60%,#1e293b 100%); border-radius:14px; padding:52px 48px; margin-bottom:36px; display:flex; flex-direction:column; align-items:flex-start; gap:20px; position:relative; overflow:hidden;">
            <div style="position:absolute; top:-80px; right:-80px; width:320px; height:320px; background:rgba(99,102,241,0.08); border-radius:50%; pointer-events:none;"></div>
            <div style="position:relative; max-width:640px;">
                <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.4px; color:#64748b; margin-bottom:14px;">NearPro / Documentation</div>
                <h1 style="margin:0 0 16px 0; font-size:36px; font-weight:800; color:#ffffff; line-height:1.15; letter-spacing:-0.5px;">Everything you need to<br>master NearPro</h1>
                <p style="margin:0 0 28px 0; font-size:15px; color:#94a3b8; line-height:1.65;">Step-by-step guides, API references, integration specs, and compliance checklists — all in one place.</p>
                <div style="width:100%; max-width:480px;">
                    <input type="text" id="helpDocsSearchInput" placeholder="Search guides, DNS records, webhook schemas..." value="${searchQuery}" style="width:100%; padding:13px 18px; border:1.5px solid #334155; border-radius:8px; font-size:14px; font-family:inherit; outline:none; background:#1e293b; color:#f1f5f9; box-sizing:border-box; transition:border-color 0.2s;" onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#334155'" />
                </div>
            </div>
        </div>

        <!-- Category cards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px; margin-bottom:36px;">
            ${catCards.map(cat => `
                <button class="help-nav-btn" data-id="${cat.id}" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:20px; cursor:pointer; text-align:left; transition:border-color 0.2s, box-shadow 0.2s; display:flex; align-items:flex-start; gap:14px; box-shadow:none;" onmouseover="this.style.borderColor='#c7d2fe'; this.style.boxShadow='0 2px 12px rgba(99,102,241,0.07)'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
                    <div style="width:36px; height:36px; border-radius:8px; background:${cat.bg}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        <span style="font-size:12px; font-weight:800; color:#ffffff; letter-spacing:0.5px;">${cat.abbr}</span>
                    </div>
                    <div style="flex:1; min-width:0;">
                        <div style="font-size:13.5px; font-weight:700; color:#0f172a; margin-bottom:4px;">${cat.label}</div>
                        <div style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:8px;">${cat.desc}</div>
                        <div style="font-size:11.5px; color:#6366f1; font-weight:600;">${ARTICLES.filter(a => a.category === cat.id).length} articles</div>
                    </div>
                </button>
            `).join('')}
        </div>

        <!-- Featured Articles -->
        <div style="border:1px solid #e2e8f0; border-radius:12px; margin-bottom:36px; overflow:hidden;">
            <div style="padding:20px 24px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h2 style="margin:0 0 3px 0; font-size:15px; font-weight:700; color:#0f172a;">Featured Articles</h2>
                    <p style="margin:0; font-size:12.5px; color:#64748b;">Most referenced documentation guides.</p>
                </div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));">
                ${ARTICLES.slice(0, 6).map((art, i) => `
                    <button class="help-article-link" data-cat="${art.category}" data-id="${art.id}" style="background:#ffffff; border:none; border-right:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; padding:18px 20px; cursor:pointer; text-align:left; transition:background 0.15s; display:flex; flex-direction:column; gap:6px;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#ffffff'">
                        <span style="font-size:12px; font-weight:600; color:#6366f1; text-transform:uppercase; letter-spacing:0.4px;">${ARTICLE_CATEGORIES.find(c => c.id === art.category)?.name || art.category}</span>
                        <span style="font-size:13px; font-weight:600; color:#0f172a; line-height:1.4;">${art.title}</span>
                    </button>
                `).join('')}
            </div>
        </div>

        <!-- Build cards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:16px; margin-bottom:48px;">
            <div style="background:#0f172a; border-radius:12px; padding:28px; display:flex; flex-direction:column; gap:14px; min-height:200px; justify-content:space-between;">
                <div>
                    <div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#475569; margin-bottom:10px;">AI Integration</div>
                    <h3 style="margin:0 0 8px 0; font-size:16px; font-weight:700; color:#ffffff;">Build with Local LLMs</h3>
                    <p style="margin:0 0 14px 0; font-size:13px; color:#94a3b8; line-height:1.6;">Run NearPro prompts locally on Ollama, Llama-3, or Mistral. Zero API cost. Full data privacy.</p>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">${['Ollama','Llama-3','Mistral','GPT-4o','Gemini Pro'].map(t=>`<span style="font-size:11px; font-weight:600; color:#a5b4fc; background:rgba(99,102,241,0.15); padding:3px 9px; border-radius:4px; font-family:monospace;">${t}</span>`).join('')}</div>
                </div>
                <button class="help-nav-btn" data-id="integrations" style="background:#312e81; color:#c7d2fe; border:1px solid #4338ca; border-radius:7px; padding:10px 18px; font-size:13px; font-weight:600; cursor:pointer; text-align:left; font-family:inherit;">Read LLM Routing Guide</button>
            </div>
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; display:flex; flex-direction:column; gap:14px; min-height:200px; justify-content:space-between;">
                <div>
                    <div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#94a3b8; margin-bottom:10px;">Webhook API</div>
                    <h3 style="margin:0 0 8px 0; font-size:16px; font-weight:700; color:#0f172a;">Build Automations</h3>
                    <p style="margin:0 0 12px 0; font-size:13px; color:#475569; line-height:1.6;">Connect NearPro events to HubSpot, Slack, Google Sheets, or any webhook endpoint in real time.</p>
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px; font-family:monospace; font-size:11.5px; color:#334155; line-height:1.5;">
                        <span style="color:#94a3b8;">// Event payload</span><br>
                        { "event": <span style="color:#0f766e;">"lead.stage_changed"</span> }
                    </div>
                </div>
                <button class="help-nav-btn" data-id="integrations" style="background:#0f172a; color:#ffffff; border:none; border-radius:7px; padding:10px 18px; font-size:13px; font-weight:600; cursor:pointer; text-align:left; font-family:inherit;">View Webhook Reference</button>
            </div>
        </div>

        <!-- Inline Pricing Section -->
        <div id="docs-pricing" style="border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; margin-bottom:8px;">
            <div style="padding:32px 32px 24px; background:#f8fafc; border-bottom:1px solid #e2e8f0;">
                <div style="font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.9px; color:#6366f1; margin-bottom:10px;">Plans & Pricing</div>
                <h2 style="margin:0 0 8px 0; font-size:24px; font-weight:800; color:#0f172a; letter-spacing:-0.3px;">Transparent, credit-based pricing</h2>
                <p style="margin:0; font-size:14px; color:#475569; line-height:1.6;">All plans include full access to the B2B directory. Credits are consumed per action — exports, enrichments, AI generations, and voice calls.</p>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:0;">
                ${[
                    { name:'Explorer', price:'Free', credits:'15 / mo', exports:'12 preview cards', features:['Directory browse','Basic filters','Preview cards'], highlight:false },
                    { name:'Scout', price:'₹499 / mo', credits:'500 / mo', exports:'500 CSV exports', features:['Smart Lists','CRM pipeline','Proposal Builder','Website Audit'], highlight:false },
                    { name:'Hunter', price:'₹999 / mo', credits:'2,000 / mo', exports:'2,000 CSV exports', features:['Email Sequences','Deliverability Hub','Data Enrichment','AI Voice Agent'], highlight:true },
                    { name:'Agency', price:'₹2,999 / mo', credits:'10,000 / mo', exports:'Unlimited*', features:['Team seat quotas','Custom Webhooks','White-label Reports','Priority AI routing'], highlight:false },
                ].map(plan => `
                    <div style="padding:24px; border-right:1px solid #e2e8f0; position:relative; background:${plan.highlight ? '#fafbff' : '#ffffff'};">
                        ${plan.highlight ? '<div style="position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#6366f1,#818cf8);"></div>' : ''}
                        <div style="font-size:13px; font-weight:700; color:#0f172a; margin-bottom:4px;">${plan.name}</div>
                        <div style="font-size:22px; font-weight:800; color:${plan.highlight ? '#6366f1' : '#0f172a'}; margin-bottom:4px; letter-spacing:-0.5px;">${plan.price}</div>
                        <div style="font-size:12px; color:#64748b; margin-bottom:16px;">${plan.credits} &middot; ${plan.exports}</div>
                        <ul style="margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:7px;">
                            ${plan.features.map(f => `<li style="font-size:12.5px; color:#334155; display:flex; align-items:center; gap:7px;"><span style="width:16px; height:16px; background:#f1f5f9; border-radius:3px; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; font-size:10px; color:#6366f1; font-weight:700;">+</span>${f}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            <div style="padding:20px 32px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                <span style="font-size:12.5px; color:#64748b;">All plans include a 14-day trial. Annual billing saves 20% and includes 2 months free.</span>
                <a href="#/checkout?plan=hunter&cycle=monthly" style="display:inline-flex; align-items:center; gap:6px; background:#6366f1; color:#ffffff; font-size:13px; font-weight:600; padding:9px 20px; border-radius:7px; text-decoration:none;">Start Free Trial</a>
            </div>
        </div>
    `;

    const browseView = `
        <div style="display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap;">
            <!-- Sticky sidebar -->
            <div style="width:220px; flex-shrink:0; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,0.02); position:sticky; top:80px;">
                <div style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; color:#94a3b8; margin-bottom:12px;">Categories</div>
                ${categoryListHTML}
                <button class="help-nav-btn" data-id="landing" style="width:100%; text-align:left; padding:9px 14px; font-size:13px; font-weight:700; color:#2563eb; background:none; border:none; border-radius:6px; cursor:pointer; margin-top:12px;">← Back to Docs Home</button>
            </div>
            <!-- Articles list -->
            <div style="flex:1; min-width:280px; display:flex; flex-direction:column;">
                <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                    <h2 style="margin:0; font-size:17px; font-weight:900; color:#0f172a;">
                        ${searchQuery !== '' ? `Search: "${searchQuery}"` : (ARTICLE_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'All Guides')}
                    </h2>
                    <span style="font-size:12.5px; color:#64748b;">${filteredArticles.length} article${filteredArticles.length !== 1 ? 's' : ''}</span>
                </div>
                <div style="margin-bottom:18px;">
                    <input type="text" id="helpDocsSearchInput" placeholder="Search in docs..." value="${searchQuery}" style="width:100%; padding:10px 16px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; outline:none; background:#ffffff; color:#0f172a; box-sizing:border-box;" />
                </div>
                ${articlesHTML}
            </div>
        </div>
    `;

    const isLanding = selectedCategory === 'landing' && searchQuery === '';
    return `<div class="help-docs-workspace" style="width:100%; color:#0f172a; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${isLanding ? landingHTML : browseView}</div>`;
}

// ── Shared Event Binder ────────────────────────────────────────────────────────
function bindDocsContentEvents() {
    if (window.refreshLucideIcons) window.refreshLucideIcons();

    // Category nav cards (landing grid)
    document.querySelectorAll('.help-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedCategory = btn.getAttribute('data-id') || 'landing';
            searchQuery = '';
            refreshDocsView();
        });
    });

    // Popular article quick links
    document.querySelectorAll('.help-article-link').forEach(link => {
        link.addEventListener('click', () => {
            const cat = link.getAttribute('data-cat');
            const articleId = link.getAttribute('data-id');
            selectedCategory = cat;
            searchQuery = '';
            refreshDocsView();
            setTimeout(() => {
                const el = document.getElementById(`art-${articleId}`);
                if (el) { el.setAttribute('open', 'true'); el.scrollIntoView({ behavior:'smooth', block:'start' }); }
            }, 120);
        });
    });

    // Category sidebar buttons
    document.querySelectorAll('.help-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedCategory = btn.getAttribute('data-id');
            refreshDocsView();
        });
    });

    // Search input
    const searchInput = document.getElementById('helpDocsSearchInput');
    if (searchInput) {
        searchInput.focus();
        const val = searchInput.value; searchInput.value = ''; searchInput.value = val;
        searchInput.addEventListener('input', e => {
            searchQuery = e.target.value;
            if (searchQuery !== '' && selectedCategory === 'landing') selectedCategory = 'all';
            if (searchQuery === '' && selectedCategory === 'all') selectedCategory = 'landing';
            refreshDocsView();
        });
    }
}

// ── View Refresher ─────────────────────────────────────────────────────────────
function refreshDocsView() {
    const hash = window.location.hash || '';
    if (hash.startsWith('#/docs')) {
        const mainEl = document.getElementById('docsMainContent');
        if (mainEl) { mainEl.innerHTML = renderHelpDocsContent(); bindDocsContentEvents(); }
    } else {
        const content = document.getElementById('dashboardContent');
        if (content) { content.innerHTML = renderHelpDocsContent(); bindDocsContentEvents(); }
    }
}

