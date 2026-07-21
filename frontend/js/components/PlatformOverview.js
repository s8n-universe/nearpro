import { State } from '../state.js';
import { currentUserHasAccess } from '../auth.js';

export function renderPlatformOverviewLayout() {
    const userTier = (State.profile?.subscription_tier || State.profile?.tier || 'free').toLowerCase();
    const userName = State.profile?.full_name || State.user?.email?.split('@')[0] || 'Agency Founder';
    const companyName = State.profile?.company_name || 'S8N Partner Agency';

    const features = [
        {
            id: 'directory',
            title: '🔍 Browse Directory',
            badge: 'ALL PLANS',
            badgeBg: '#e0f2fe',
            badgeColor: '#0369a1',
            requiredTier: 'free',
            desc: 'Search 50,000+ local Indian business listings across Mumbai, Delhi & major hubs. Filter by Google review volume gaps and un-optimized websites.',
            cta: 'Open Directory ➔'
        },
        {
            id: 'crm',
            title: '📋 Outreach Pipeline (CRM)',
            badge: 'SCOUT+',
            badgeBg: '#fef3c7',
            badgeColor: '#b45309',
            requiredTier: 'scout',
            desc: 'Organize target leads into custom deal stages (New, Contacted, Pitched, Closed). Keep client notes and set follow-up due dates.',
            cta: 'Manage Pipeline ➔'
        },
        {
            id: 'proposals',
            title: '📄 1-Click PDF Proposals',
            badge: 'SCOUT+',
            badgeBg: '#fef3c7',
            badgeColor: '#b45309',
            requiredTier: 'scout',
            desc: 'Generate 3-page corporate audit proposals featuring Google Maps social proof, competitor review gap analysis, revenue loss math & 3-tier pricing.',
            cta: 'Create Proposal ➔'
        },
        {
            id: 'call-scripts',
            title: '📞 Tele-Sales Call Scripts',
            badge: 'SCOUT+',
            badgeBg: '#fef3c7',
            badgeColor: '#b45309',
            requiredTier: 'scout',
            desc: 'Category-specific cold calling teleprompter scripts with 30-second pattern interrupts, empathy probes, live objection cards & WhatsApp follow-ups.',
            cta: 'Generate Script ➔'
        },
        {
            id: 'outreach',
            title: '⚡ AI Outreach Studio',
            badge: 'SCOUT+',
            badgeBg: '#fef3c7',
            badgeColor: '#b45309',
            requiredTier: 'scout',
            desc: 'Craft multi-day cold email & WhatsApp pitch sequences in Hinglish or English tailored for local business verticals (Dentists, Decorators, Salons).',
            cta: 'Launch Studio ➔'
        },
        {
            id: 'prompts',
            title: '🎯 Website Prompt Engine',
            badge: 'SCOUT+',
            badgeBg: '#fef3c7',
            badgeColor: '#b45309',
            requiredTier: 'scout',
            desc: 'Generate production-ready code prompts for React/Next.js/Vite to create high-converting client demo websites with 1-tap WhatsApp booking engines.',
            cta: 'Generate Prompt ➔'
        },
        {
            id: 'integrations',
            title: '🔌 Connection Hub & Webhooks',
            badge: 'SCOUT+',
            badgeBg: '#fef3c7',
            badgeColor: '#b45309',
            requiredTier: 'scout',
            desc: 'Auto-sync tracked leads and generated proposals to n8n, Make.com, Google Sheets, HubSpot, or Zoho CRM via automated webhooks.',
            cta: 'Configure Hub ➔'
        },
        {
            id: 'audit',
            title: '🏥 Business Health Check',
            badge: 'SCOUT+',
            badgeBg: '#fef3c7',
            badgeColor: '#b45309',
            requiredTier: 'scout',
            desc: 'Run comprehensive technical SEO, mobile load performance, and conversion audit reports for any client website URL.',
            cta: 'Run Health Check ➔'
        },
        {
            id: 'documents',
            title: '📁 Documents Library',
            badge: 'SCOUT+',
            badgeBg: '#fef3c7',
            badgeColor: '#b45309',
            requiredTier: 'scout',
            desc: 'Access saved client proposals and tele-sales scripts with permanent 10-year signed links for seamless sharing on WhatsApp.',
            cta: 'View Library ➔'
        },
        {
            id: 'team',
            title: '👥 Team Workspace',
            badge: 'AGENCY+',
            badgeBg: '#dbeafe',
            badgeColor: '#1d4ed8',
            requiredTier: 'agency',
            desc: 'Collaborate with agency team members, assign lead research tasks, and share workspace quotas across your agency staff.',
            cta: 'Team Workspace ➔'
        }
    ];

    return `
        <!-- CORPORATE LIGHT SAAS THEME OVERRIDE FOR THIS PAGE -->
        <div class="platform-overview-container" style="display: flex; flex-direction: column; gap: 28px; padding: 32px; background: #f8fafc; color: #0f172a; border-radius: var(--radius-lg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            
            <!-- HERO WELCOME BANNER -->
            <div style="background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px; box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50px; right: -50px; width: 260px; height: 260px; background: rgba(37, 99, 235, 0.06); border-radius: 50%; filter: blur(40px); pointer-events: none;"></div>
                
                <div style="max-width: 820px; position: relative; z-index: 1;">
                    <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 99px; background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; font-size: 12px; font-weight: 700; font-family: var(--font-mono); margin-bottom: 16px;">
                        🚀 PLATFORM MASTERY & AGENCY LAUNCHPAD
                    </div>
                    
                    <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 12px 0; color: #0f172a; font-family: var(--font-heading); letter-spacing: -0.5px;">
                        Welcome, ${userName}! (${companyName})
                    </h1>
                    
                    <p style="color: #475569; font-size: 15px; margin: 0 0 24px 0; line-height: 1.6; max-width: 720px;">
                        NearPro & S8N AI Services is your professional B2B client acquisition suite. Discover local Indian business leads, analyze competitor review gaps, generate 3-page audit proposals, and close deals with teleprompter scripts.
                    </p>
                    
                    <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                        <a href="#/dashboard/directory" style="background: #2563eb; color: white; padding: 12px 24px; font-size: 14px; font-weight: 700; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); transition: all 0.2s ease;">
                            <i data-lucide="search" style="width: 16px; height: 16px;"></i> Browse Directory Leads ➔
                        </a>
                        <div style="font-size: 12.5px; color: #64748b; font-family: var(--font-mono); background: #ffffff; padding: 8px 16px; border-radius: 8px; border: 1px solid #cbd5e1;">
                            Active Subscription: <strong style="color: #0f172a; text-transform: uppercase;">${userTier} PLAN</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4-STEP CORPORATE EXECUTION WORKFLOW -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);">
                <div style="font-size: 11.5px; color: #2563eb; font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">
                    EXECUTIVE WORKFLOW
                </div>
                <h3 style="font-size: 20px; font-weight: 800; margin: 0 0 20px 0; color: #0f172a; font-family: var(--font-heading);">
                    4-Step Agency Growth Architecture
                </h3>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
                    
                    <!-- Step 1 -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; transition: transform 0.2s ease;">
                        <div style="font-size: 12px; font-weight: 800; color: #2563eb; font-family: var(--font-mono); background: #eff6ff; display: inline-block; padding: 2px 8px; border-radius: 4px; margin-bottom: 12px;">STEP 01</div>
                        <h4 style="font-size: 15px; font-weight: 700; margin: 0 0 6px 0; color: #0f172a;">Search Local Leads</h4>
                        <p style="font-size: 13px; color: #475569; margin: 0 0 14px 0; line-height: 1.5;">
                            Find local Indian businesses with rating deficits, low review counts, or unoptimized websites.
                        </p>
                        <a href="#/dashboard/directory" style="font-size: 12px; color: #2563eb; text-decoration: none; font-family: var(--font-mono); font-weight: 700;">
                            Go to Directory ↗
                        </a>
                    </div>

                    <!-- Step 2 -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; transition: transform 0.2s ease;">
                        <div style="font-size: 12px; font-weight: 800; color: #059669; font-family: var(--font-mono); background: #ecfdf5; display: inline-block; padding: 2px 8px; border-radius: 4px; margin-bottom: 12px;">STEP 02</div>
                        <h4 style="font-size: 15px; font-weight: 700; margin: 0 0 6px 0; color: #0f172a;">Track in CRM Pipeline</h4>
                        <p style="font-size: 13px; color: #475569; margin: 0 0 14px 0; line-height: 1.5;">
                            Click "Track Lead" to save prospect records into your sales pipeline and Smart Lists.
                        </p>
                        <a href="#/dashboard/crm" style="font-size: 12px; color: #059669; text-decoration: none; font-family: var(--font-mono); font-weight: 700;">
                            Go to Pipeline ↗
                        </a>
                    </div>

                    <!-- Step 3 -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; transition: transform 0.2s ease;">
                        <div style="font-size: 12px; font-weight: 800; color: #d97706; font-family: var(--font-mono); background: #fffbeb; display: inline-block; padding: 2px 8px; border-radius: 4px; margin-bottom: 12px;">STEP 03</div>
                        <h4 style="font-size: 15px; font-weight: 700; margin: 0 0 6px 0; color: #0f172a;">Build Proposal & Script</h4>
                        <p style="font-size: 13px; color: #475569; margin: 0 0 14px 0; line-height: 1.5;">
                            Generate 3-page PDF proposals and cold call teleprompters with live objection handlers.
                        </p>
                        <a href="#/dashboard/proposals" style="font-size: 12px; color: #d97706; text-decoration: none; font-family: var(--font-mono); font-weight: 700;">
                            Create Proposal ↗
                        </a>
                    </div>

                    <!-- Step 4 -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; transition: transform 0.2s ease;">
                        <div style="font-size: 12px; font-weight: 800; color: #7c3aed; font-family: var(--font-mono); background: #f5f3ff; display: inline-block; padding: 2px 8px; border-radius: 4px; margin-bottom: 12px;">STEP 04</div>
                        <h4 style="font-size: 15px; font-weight: 700; margin: 0 0 6px 0; color: #0f172a;">Pitch & Close Deals</h4>
                        <p style="font-size: 13px; color: #475569; margin: 0 0 14px 0; line-height: 1.5;">
                            Dispatch 1-click WhatsApp proposal links and lock in paid strategy consultation calls.
                        </p>
                        <a href="#/dashboard/call-scripts" style="font-size: 12px; color: #7c3aed; text-decoration: none; font-family: var(--font-mono); font-weight: 700;">
                            Open Teleprompter ↗
                        </a>
                    </div>

                </div>
            </div>

            <!-- CORPORATE FEATURE CATALOG GRID -->
            <div>
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 20px; font-weight: 800; margin: 0 0 4px 0; color: #0f172a; font-family: var(--font-heading);">
                        Enterprise Platform Modules
                    </h3>
                    <p style="color: #64748b; font-size: 13.5px; margin: 0;">
                        Comprehensive overview of tools available in your NearPro workspace.
                    </p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
                    ${features.map(f => {
                        const isUnlocked = currentUserHasAccess(f.requiredTier);
                        return `
                            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03); transition: all 0.2s ease; ${!isUnlocked ? 'opacity: 0.75;' : ''}">
                                <div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                                        <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; font-family: var(--font-heading);">${f.title}</h4>
                                        <span style="font-size: 10.5px; font-weight: 800; font-family: var(--font-mono); padding: 3px 10px; border-radius: 99px; background: ${f.badgeBg}; color: ${f.badgeColor};">
                                            ${f.badge}
                                        </span>
                                    </div>
                                    <p style="font-size: 13.5px; color: #475569; line-height: 1.55; margin: 0 0 20px 0;">
                                        ${f.desc}
                                    </p>
                                </div>

                                <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                                    ${isUnlocked ? `
                                        <a href="#/dashboard/${f.id}" style="background: #0f172a; color: white; padding: 8px 18px; font-size: 12.5px; font-weight: 600; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: background 0.2s ease;">
                                            ${f.cta}
                                        </a>
                                    ` : `
                                        <a href="#/checkout" style="font-size: 12.5px; color: #d97706; text-decoration: underline; font-family: var(--font-mono); font-weight: 700; display: flex; align-items: center; gap: 4px;">
                                            <i data-lucide="lock" style="width: 13px; height: 13px;"></i> Upgrade to Access ↗
                                        </a>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- CORPORATE STRATEGY PLAYBOOK (ACCORDION) -->
            <details style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px 28px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                <summary style="font-weight: 700; color: #0f172a; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 15px; font-family: var(--font-heading);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i data-lucide="briefcase" style="width: 18px; height: 18px; color: #2563eb;"></i>
                        💼 Corporate Agency Playbook: Closing Local Business Owners in India
                    </span>
                    <span style="font-size: 11.5px; color: #2563eb; font-family: var(--font-mono); font-weight: 700;">Click to Expand / Collapse</span>
                </summary>

                <div style="display: flex; flex-direction: column; gap: 18px; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                        <h5 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">1. Professional Pricing & Positioning</h5>
                        <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.6;">
                            Charge <strong>₹15,000 to ₹35,000 upfront</strong> for local business digital builds + Google Maps SEO optimization. Always present your service as a revenue leak solution, not just an aesthetic website project.
                        </p>
                    </div>

                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                        <h5 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">2. Live Objection Pivots</h5>
                        <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.6;">
                            When a client says <em>"Humari saari enquiries word-of-mouth se aati hain"</em>, pivot by praising their service quality first, then explain: <em>"Word-of-mouth clients still verify your rating on Google before calling. A low review count causes 40% silent drop-off."</em>
                        </p>
                    </div>

                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                        <h5 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">3. High-Converting WhatsApp Integration</h5>
                        <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.6;">
                            Indian business owners convert best over WhatsApp. Incorporating a 1-tap WhatsApp booking trigger on custom client landing pages increases lead conversion by over 2.5x compared to traditional contact forms.
                        </p>
                    </div>
                </div>
            </details>

        </div>
    `;
}

export function bindPlatformOverviewEvents() {
    if (window.refreshLucideIcons) window.refreshLucideIcons();
}
