import { State } from '../state.js';
import { currentUserHasAccess } from '../auth.js';

export function renderPlatformOverviewLayout() {
    const userTier = (State.profile?.subscription_tier || State.profile?.tier || 'free').toLowerCase();
    const userName = State.profile?.full_name || State.user?.email?.split('@')[0] || 'Agency Partner';
    const companyName = State.profile?.company_name || 'S8N Partner Agency';

    const features = [
        {
            id: 'directory',
            title: '🔍 Browse Directory',
            badge: 'ALL PLANS',
            badgeColor: '#10b981',
            requiredTier: 'free',
            desc: 'Search 50,000+ local Indian business listings across Mumbai, Delhi, Bangalore & more. Filter by rating deficit, review count gap, and missing websites.',
            cta: 'Open Directory ➔'
        },
        {
            id: 'crm',
            title: '📋 Outreach Pipeline (CRM)',
            badge: 'SCOUT+',
            badgeColor: 'var(--accent-gold)',
            requiredTier: 'scout',
            desc: 'Organize target leads into custom pipeline stages (New, Contacted, Pitched, Closed). Set follow-up reminders and keep client notes.',
            cta: 'Manage Pipeline ➔'
        },
        {
            id: 'proposals',
            title: '📄 1-Click PDF Proposals',
            badge: 'SCOUT+',
            badgeColor: 'var(--accent-gold)',
            requiredTier: 'scout',
            desc: 'Generate beautifully formatted 3-page client proposals containing Google Maps audit summary, competitor review gap, estimated revenue loss, and pricing packages.',
            cta: 'Create Proposal ➔'
        },
        {
            id: 'call-scripts',
            title: '📞 Tele-Sales Call Scripts',
            badge: 'SCOUT+',
            badgeColor: 'var(--accent-gold)',
            requiredTier: 'scout',
            desc: 'Category-specific cold calling teleprompter scripts with 30-second pattern interrupts, empathy questions, live objection rebuttal cards, and WhatsApp follow-up text.',
            cta: 'Generate Script ➔'
        },
        {
            id: 'outreach',
            title: '⚡ AI Outreach Studio',
            badge: 'SCOUT+',
            badgeColor: 'var(--accent-gold)',
            requiredTier: 'scout',
            desc: 'Craft multi-day cold email & WhatsApp outreach sequences in Hinglish or English tailored for local business categories (Dentists, Decorators, Salons, Coaching).',
            cta: 'Launch Studio ➔'
        },
        {
            id: 'prompts',
            title: '🎯 Website Prompt Engine',
            badge: 'SCOUT+',
            badgeColor: 'var(--accent-gold)',
            requiredTier: 'scout',
            desc: 'Generate production-ready code prompts for Vite/Next.js/React to create high-converting client demo websites with 1-tap WhatsApp booking engines.',
            cta: 'Generate Prompt ➔'
        },
        {
            id: 'integrations',
            title: '🔌 Connection Hub & Webhooks',
            badge: 'SCOUT+',
            badgeColor: 'var(--accent-gold)',
            requiredTier: 'scout',
            desc: 'Auto-sync tracked leads and generated proposals to n8n, Make.com, Google Sheets, HubSpot, or Zoho CRM using high-speed webhooks.',
            cta: 'Configure Hub ➔'
        },
        {
            id: 'audit',
            title: '🏥 Business Health Check',
            badge: 'SCOUT+',
            badgeColor: 'var(--accent-gold)',
            requiredTier: 'scout',
            desc: 'Run comprehensive technical SEO, mobile load speed, and conversion audit reports for any client website URL.',
            cta: 'Run Health Check ➔'
        },
        {
            id: 'documents',
            title: '📁 Documents Library',
            badge: 'SCOUT+',
            badgeColor: 'var(--accent-gold)',
            requiredTier: 'scout',
            desc: 'Access your saved PDF proposals and tele-sales scripts with permanent 10-year signed links for seamless sharing on WhatsApp.',
            cta: 'View Library ➔'
        },
        {
            id: 'team',
            title: '👥 Team Workspace',
            badge: 'AGENCY+',
            badgeColor: '#3b82f6',
            requiredTier: 'agency',
            desc: 'Collaborate with team members, assign lead research tasks, and share workspace quotas across your agency staff.',
            cta: 'Team Workspace ➔'
        }
    ];

    return `
        <div class="platform-overview-container" style="display: flex; flex-direction: column; gap: 28px; padding: 24px; color: white; font-family: var(--font-body);">
            
            <!-- HERO WELCOME BANNER -->
            <div style="background: linear-gradient(135deg, rgba(217, 119, 6, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%); border: 1px solid rgba(217, 119, 6, 0.3); border-radius: var(--radius-lg); padding: 32px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -40px; right: -40px; width: 220px; height: 220px; background: rgba(217, 119, 6, 0.15); border-radius: 50%; filter: blur(40px); pointer-events: none;"></div>
                
                <div style="max-width: 760px; position: relative; z-index: 1;">
                    <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; border-radius: 99px; background: rgba(217, 119, 6, 0.2); border: 1px solid rgba(217, 119, 6, 0.4); color: var(--accent-gold); font-size: 11.5px; font-weight: 700; font-family: var(--font-mono); margin-bottom: 14px;">
                        🚀 AGENCY LAUNCHPAD & PLATFORM GUIDE
                    </div>
                    <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 10px 0; font-family: var(--font-heading); color: white; line-height: 1.3;">
                        Welcome back, ${userName}! (${companyName})
                    </h1>
                    <p style="color: var(--text-secondary); font-size: 14.5px; margin: 0 0 20px 0; line-height: 1.6;">
                        NearPro & S8N AI Services is your end-to-end B2B client acquisition suite. Use this guide to discover local Indian business leads, analyze revenue leaks, generate 3-page proposals, and pitch with cold call teleprompter scripts.
                    </p>
                    
                    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                        <a href="#/dashboard/directory" class="brand-btn" style="padding: 10px 20px; font-size: 13.5px; font-weight: 700; border-radius: var(--radius-sm); text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
                            <i data-lucide="search" style="width: 16px; height: 16px;"></i> Browse Directory Leads ➔
                        </a>
                        <span style="font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);">
                            Plan: <strong style="color: white; text-transform: capitalize;">${userTier}</strong>
                        </span>
                    </div>
                </div>
            </div>

            <!-- 4-STEP AGENCY GROWTH WORKFLOW -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-md);">
                <div style="font-size: 11px; color: var(--accent-gold); font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 6px;">
                    AGENCY EXECUTION WORKFLOW
                </div>
                <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 16px 0; font-family: var(--font-heading);">
                    How to Find, Pitch & Close Local Business Clients in 4 Steps
                </h3>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
                    <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; position: relative;">
                        <div style="font-size: 24px; font-weight: 800; color: var(--accent-gold); font-family: var(--font-heading); margin-bottom: 8px;">01</div>
                        <h4 style="font-size: 14px; font-weight: 700; margin: 0 0 6px 0; color: white;">Find Rating & Review Gaps</h4>
                        <p style="font-size: 12.5px; color: var(--text-secondary); margin: 0 0 12px 0; line-height: 1.5;">
                            Search local Indian businesses (Dentists, Decorators, Salons) with lower review counts or missing websites.
                        </p>
                        <a href="#/dashboard/directory" style="font-size: 11.5px; color: var(--accent-gold); text-decoration: underline; font-family: var(--font-mono); font-weight: 600;">
                            Go to Directory ↗
                        </a>
                    </div>

                    <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; position: relative;">
                        <div style="font-size: 24px; font-weight: 800; color: var(--accent-gold); font-family: var(--font-heading); margin-bottom: 8px;">02</div>
                        <h4 style="font-size: 14px; font-weight: 700; margin: 0 0 6px 0; color: white;">Save Leads to Your CRM</h4>
                        <p style="font-size: 12.5px; color: var(--text-secondary); margin: 0 0 12px 0; line-height: 1.5;">
                            Click "Track Lead" to add business leads directly into your CRM pipeline and Smart Lists.
                        </p>
                        <a href="#/dashboard/crm" style="font-size: 11.5px; color: var(--accent-gold); text-decoration: underline; font-family: var(--font-mono); font-weight: 600;">
                            Go to Pipeline ↗
                        </a>
                    </div>

                    <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; position: relative;">
                        <div style="font-size: 24px; font-weight: 800; color: var(--accent-gold); font-family: var(--font-heading); margin-bottom: 8px;">03</div>
                        <h4 style="font-size: 14px; font-weight: 700; margin: 0 0 6px 0; color: white;">Generate Proposal & Script</h4>
                        <p style="font-size: 12.5px; color: var(--text-secondary); margin: 0 0 12px 0; line-height: 1.5;">
                            Build a 3-page PDF audit proposal and launch cold calling teleprompter scripts with live objection cards.
                        </p>
                        <a href="#/dashboard/proposals" style="font-size: 11.5px; color: var(--accent-gold); text-decoration: underline; font-family: var(--font-mono); font-weight: 600;">
                            Create Proposal ↗
                        </a>
                    </div>

                    <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; position: relative;">
                        <div style="font-size: 24px; font-weight: 800; color: #10b981; font-family: var(--font-heading); margin-bottom: 8px;">04</div>
                        <h4 style="font-size: 14px; font-weight: 700; margin: 0 0 6px 0; color: white;">Pitch & Close Deal</h4>
                        <p style="font-size: 12.5px; color: var(--text-secondary); margin: 0 0 12px 0; line-height: 1.5;">
                            Send public proposal links via 1-click WhatsApp follow-ups and lock in 15-minute consultation calls.
                        </p>
                        <a href="#/dashboard/call-scripts" style="font-size: 11.5px; color: #10b981; text-decoration: underline; font-family: var(--font-mono); font-weight: 600;">
                            Open Teleprompter ↗
                        </a>
                    </div>
                </div>
            </div>

            <!-- FEATURE SUITE CATALOG -->
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 4px 0; font-family: var(--font-heading); color: white;">
                            Platform Feature Suite
                        </h3>
                        <p style="color: var(--text-secondary); font-size: 13px; margin: 0;">
                            Explore all tools available in your account workspace.
                        </p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    ${features.map(f => {
                        const isUnlocked = currentUserHasAccess(f.requiredTier);
                        return `
                            <div style="background: var(--bg-surface); border: 1px solid ${isUnlocked ? 'var(--border)' : 'rgba(255,255,255,0.05)'}; border-radius: var(--radius-lg); padding: 22px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease; ${!isUnlocked ? 'opacity: 0.7;' : ''}">
                                <div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <span style="font-size: 15px; font-weight: 700; color: white; font-family: var(--font-heading);">${f.title}</span>
                                        <span style="font-size: 10px; font-weight: 800; font-family: var(--font-mono); padding: 2px 8px; border-radius: 99px; background: rgba(255,255,255,0.05); color: ${f.badgeColor}; border: 1px solid ${f.badgeColor};">
                                            ${f.badge}
                                        </span>
                                    </div>
                                    <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 20px 0;">
                                        ${f.desc}
                                    </p>
                                </div>

                                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 14px;">
                                    ${isUnlocked ? `
                                        <a href="#/dashboard/${f.id}" class="brand-btn" style="padding: 8px 16px; font-size: 12px; font-weight: 600; border-radius: var(--radius-sm); text-decoration: none;">
                                            ${f.cta}
                                        </a>
                                    ` : `
                                        <a href="#/checkout" style="font-size: 12px; color: var(--accent-gold); text-decoration: underline; font-family: var(--font-mono); font-weight: 600; display: flex; align-items: center; gap: 4px;">
                                            <i data-lucide="lock" style="width: 12px; height: 12px;"></i> Upgrade to Unlock ↗
                                        </a>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- PRO STRATEGY PLAYBOOK -->
            <details style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px 24px; color: var(--text-secondary);">
                <summary style="font-weight: 700; color: white; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 15px; font-family: var(--font-heading);">
                    <span style="display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="lightbulb" style="width: 18px; height: 18px; color: var(--accent-gold);"></i>
                        💡 Agency Founder Pro Playbook: Pitching & Pricing in India
                    </span>
                    <span style="font-size: 11px; color: var(--accent-gold); font-family: var(--font-mono);">Click to Expand / Collapse</span>
                </summary>

                <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px;">
                    <div>
                        <h4 style="font-size: 13.5px; font-weight: 700; color: var(--accent-gold); margin: 0 0 4px 0;">1. Recommended Client Pricing</h4>
                        <p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                            For local Indian business website builds + Google Maps SEO setup, charge <strong>₹15,000 to ₹35,000 upfront</strong> plus ₹2,000/mo maintenance. Position your service around revenue loss prevention, not just "website creation".
                        </p>
                    </div>

                    <div>
                        <h4 style="font-size: 13.5px; font-weight: 700; color: var(--accent-gold); margin: 0 0 4px 0;">2. Handling "Word of Mouth" Objections</h4>
                        <p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                            Acknowledge their service quality first. Then explain: <em>"Word-of-mouth customers check Google ratings before visiting. When they see low review counts or no booking link, 40% drop off to competitors."</em>
                        </p>
                    </div>

                    <div>
                        <h4 style="font-size: 13.5px; font-weight: 700; color: var(--accent-gold); margin: 0 0 4px 0;">3. 1-Tap WhatsApp Booking Hook</h4>
                        <p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                            In India, WhatsApp is the primary business communication channel. Offering a 1-tap WhatsApp appointment trigger on their custom prototype increases lead conversion by over 2.5x compared to standard contact forms.
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
