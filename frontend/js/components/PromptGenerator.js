import { State } from '../state.js';
import { Api } from '../api.js';
import { getUserTier } from '../auth.js';

export const PROMPT_LIMITS = {
    free: 5,
    scout: 40,
    hunter: 80,
    agency: 150,
    enterprise: 999999
};

export function getPromptGenerationCount() {
    return State.profile?.monthly_prompt_copies_used || 0;
}

export function incrementPromptGenerationCount() {
    // Increment is handled backend-side in Supabase Edge Function
}

export function buildPrompt(platform, lead, audit = null) {
    const jsonLdType = (lead.category || '').toLowerCase().includes('dentist') ? 'Dentist' : 
                      (lead.category || '').toLowerCase().includes('hospital') || (lead.category || '').toLowerCase().includes('medical') ? 'MedicalBusiness' : 'LocalBusiness';
    const phone = lead.phone || '+91 98765 43210';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const category = lead.category || lead.parent_category || 'Local Business';
    const rating = lead.rating || '4.8';
    const reviewCount = lead.review_count || '42';
    const city = lead.area || lead.address || 'Mumbai';
    const businessName = lead.name;

    if (platform === 'antigravity') {
        return `# SYSTEM ARCHITECT SPECIFICATION: ANTIGRAVITY AI HIGH-OUTPUT WEB APP GENERATION
Target Platform: Antigravity AI Agentic Suite (HTML5 / Vanilla CSS Design Tokens / JS ES6+)
Project Target: Autonomous Operating Portal & Lead Engine for "${businessName}" in ${city}

## 1. COMPREHENSIVE BUSINESS CONTEXT & METRICS
- Target Business Name: ${businessName}
- Niche Category: ${category}
- City / Service Location: ${city}
- Google Business Verified Rating: ${rating}⭐ Stars (${reviewCount} Authentic Reviews)
- Direct Phone Endpoint: ${phone}
- Direct WhatsApp Trigger: https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(businessName)}%20team,%20I%20want%20to%20book%20a%20consultation

## 2. ARCHITECTURAL & VISUAL DESIGN SYSTEM TOKENS
- Design Aesthetic: State-of-the-Art Dark Glassmorphism, smooth CSS gradients, responsive micro-animations, and high-conversion typography.
- Color Palette Tokens:
  - Base Background: #0f172a (Slate 900)
  - Card Glass Surface: rgba(30, 41, 59, 0.7) with 12px blur and 1px solid rgba(255, 255, 255, 0.1)
  - Primary Accent: HSL(217, 91%, 60%) to HSL(270, 91%, 65%) vibrant gradient
  - WhatsApp Brand Color: #25D366 (Emerald Green)
  - Typography: Space Grotesk (Headings), Inter (Body copy).

## 3. LOCAL SEO & STRUCTURED SCHEMA COMPLIANCE
- Render full valid JSON-LD Structured Data in <head> for Schema type "${jsonLdType}".
- Include OpenGraph (og:title, og:description, og:image, og:url) and Twitter Card tags.
- Page Speed Target: 95+ Mobile Score (Zero heavy external bundle dependencies).

## 4. 10 HIGH-CONVERTING PRODUCTION UI COMPONENTS
1. HERO SHOWCASE HEADER:
   - Live Status Badge: "🔥 Top Rated ${category} in ${city} — ${rating}⭐ (${reviewCount} Reviews)"
   - High Impact Headline: "Transform Your ${category} Experience in ${city}"
   - Dual Conversion Actions: "⚡ 1-Click WhatsApp Consultation" + "📅 Book Online Appointment"
2. PROOF METRICS BAR:
   - 4 Key Trust Metrics: ${rating}⭐ Google Rating, ${reviewCount}+ Satisfied Clients, 100% Quality Assurance, Fast Response Time.
3. INTERACTIVE SERVICE CALCULATOR / CATALOG:
   - Filterable cards showing service tiers, inclusions, transparent pricing, and instant enquiry triggers.
4. DIRECT WHATSAPP CONSULTATION FUNNEL:
   - Floating action triggers linking directly to WhatsApp with pre-filled lead context message.
5. LIVE CUSTOMER REVIEWS SLIDER:
   - Verified review cards with star ratings, client avatar initials, and local area badges.
6. ABOUT & LOCAL COMMUNITY TRUST STORY:
   - Founder mission statement, commitment to ${city} customers, and hygiene/quality standards.
7. COMPREHENSIVE FAQ ACCORDION:
   - 5 interactive collapsible FAQ items addressing pricing, emergency bookings, service process, and guarantees.
8. LOCATION MAP & DIRECTORY INFO:
   - Area directions, opening hours (Mon-Sat 9AM-8PM), click-to-call tel:${phone}, and contact form.
9. STICKY MOBILE CONVERSION BAR:
   - Fixed bottom-bar on mobile viewports with Call and WhatsApp quick action buttons.
10. FOOTER & LEGAL DISCLAIMER:
    - Copyright notice, privacy policy links, terms of service, and powered-by NearPro badge.

## 5. OUTPUT SPECIFICATION
Generate complete, fully self-contained HTML5 code with inline CSS and ES6 JavaScript. Ensure zero missing code snippets, zero placeholders, and 100% functional responsiveness.`;
    }

    return `Generate an ultra detailed, production-ready single page web application for "${businessName}" in ${city}.
Target Platform: ${platform.toUpperCase()}

TECHNICAL SPECIFICATION:
- Local Search Schema: Valid JSON-LD Schema markup for type "${jsonLdType}".
- Primary Contact Triggers: Direct tel:${phone} click-to-call link and direct wa.me/${cleanPhone} WhatsApp trigger.
- Verified Rating & Social Proof: Display rating of ${rating}⭐ stars from ${reviewCount} Google Business reviews.
- Responsive Layout: 100% mobile-friendly with modern dark layout design tokens, Space Grotesk titles, Inter text, and smooth CSS hover states.
- 9 Main Sections: Hero showcase, Proof metrics strip, Interactive Service catalog, 1-click WhatsApp funnel, Verified Reviews display, About story, FAQ accordion, Contact & map directory, Footer.`;
}

export function renderPromptGenerator(savedLeads, activeLeadId = null, selectedPlatform = 'antigravity', generatedPrompt = '') {
    const tier = getUserTier();
    const limit = PROMPT_LIMITS[tier] || 0;
    const count = getPromptGenerationCount();
    const isLimitReached = count >= limit;

    // 1. Render Left panel (Lead Selector)
    const leadsHTML = savedLeads.map(item => {
        const lead = item.professionals || {};
        const isActive = activeLeadId === lead.id;
        const activeClass = isActive ? 'active' : '';

        return `
            <div class="prompt-lead-item ${activeClass}" data-id="${lead.id}">
                <div style="flex:1; min-width:0;">
                    <h5 style="margin:0 0 2px 0; font-size:13px; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lead.name}</h5>
                    <p style="margin:0; font-size:11.5px; font-weight:600; color:#475569;">${lead.category || 'General'}</p>
                </div>
            </div>
        `;
    }).join('');

    const emptyLeadsHTML = savedLeads.length === 0 ? `
        <div style="padding:32px 12px; text-align:center; color:var(--text-muted); font-size:13px;">
            No saved leads in your pipeline.
        </div>
    ` : '';

    // 2. Render Prompt Workspace
    let workspaceHTML = '';
    if (activeLeadId) {
        if (isLimitReached) {
            workspaceHTML = `
                <div style="text-align: center; padding: 60px 20px; border: 1.5px dashed #cbd5e1; background: #f8fafc; border-radius: var(--radius-md); max-width: 500px; margin: 40px auto; width: 100%;">
                    <div style="font-size: 40px; margin-bottom: 16px;">🚫</div>
                    <h3 style="margin-bottom: 12px; color: #0f172a; font-weight: 800;">Prompt Limit Reached</h3>
                    <p style="color: #475569; font-size: 13.5px; line-height: 1.5; margin-bottom: 24px; font-weight: 500;">
                        You have used all ${limit} prompt copies allowed on your ${tier.toUpperCase()} plan. Upgrade now to unlock more generations!
                    </p>
                    <button class="brand-btn" onclick="window.State.setPricingModal(true);" style="background:#2563eb; color:white; border:none; padding:10px 22px; font-weight:700; border-radius:8px;">Upgrade Plan</button>
                </div>
            `;
        } else {
            const hasPrompt = generatedPrompt && !generatedPrompt.startsWith('Generating') && !generatedPrompt.startsWith('Error') && !generatedPrompt.startsWith('Choose');
            const isGenerating = generatedPrompt && generatedPrompt.startsWith('Generating');
            const isInitial = !generatedPrompt || generatedPrompt.startsWith('Choose');

            let contentAreaHTML = '';
            if (isGenerating) {
                contentAreaHTML = `
                    <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    </style>
                    <div style="background: #ffffff; border: 1.5px dashed #cbd5e1; border-radius: var(--radius-md); padding: 44px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; width: 100%; box-shadow: 0 4px 15px rgba(15,23,42,0.03);">
                        <div style="font-size: 28px; font-weight: 800; color: #2563eb; font-family: var(--font-mono); margin-bottom: 8px;" id="promptPctCounter">0%</div>
                        <div style="width: 100%; max-width: 360px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin: 0 auto 16px auto;">
                            <div id="promptPctBar" style="width: 5%; height: 100%; background: linear-gradient(90deg, #2563eb, #9333ea); transition: width 0.3s ease;"></div>
                        </div>
                        <h4 style="margin: 0 0 6px 0; color: #0f172a; font-family: var(--font-heading); font-weight: 800; font-size: 15px;" id="generationStatusTitle">Analyzing business profile...</h4>
                        <p style="color: #475569; font-size: 12.5px; margin: 0; font-weight: 500;" id="generationStatusDesc">Reviewing category tags and local target parameters</p>
                    </div>
                `;
            } else if (isInitial) {
                contentAreaHTML = `
                    <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: var(--radius-md); padding: 48px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; width: 100%;">
                        <div style="font-size: 36px; margin-bottom: 12px;">✨</div>
                        <h4 style="margin: 0 0 6px 0; color: #0f172a; font-family: var(--font-heading); font-weight: 800; font-size: 16px;">Ready to create your layout prompt?</h4>
                        <p style="color: #475569; font-size: 13px; max-width: 380px; line-height: 1.5; margin: 0; font-weight: 500;">
                            Select a target platform above (including <strong style="color: #6366f1;">Antigravity AI</strong>) and click <strong style="color: #0f172a;">Generate Prompt</strong>.
                        </p>
                    </div>
                `;
            } else {
                contentAreaHTML = `
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="display:block; font-size:11.5px; font-family:var(--font-mono); color:#0f172a; font-weight:800; text-transform:uppercase;">Generated Prompt Specification (${selectedPlatform.toUpperCase()})</label>
                        
                        <!-- STICKY INSIDE-BOX COPY TOOLBAR & TEXTAREA -->
                        <div style="position: relative; background: #0f172a; border: 1.5px solid #334155; border-radius: var(--radius-sm); overflow: hidden; box-shadow: 0 4px 15px rgba(15,23,42,0.1);">
                            <!-- Sticky Top-Right Toolbar Inside Box -->
                            <div style="position: sticky; top: 0; right: 0; left: 0; z-index: 10; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(8px); border-bottom: 1px solid #1e293b; padding: 8px 14px; display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 11px; font-family: var(--font-mono); color: #94a3b8; font-weight: 700; text-transform: uppercase;">
                                    ${selectedPlatform === 'antigravity' ? '🚀 ANTIGRAVITY AI HIGH-OUTPUT PROMPT' : 'PROMPT CODE SPECIFICATION'}
                                </span>
                                <button id="insideCopyPromptBtn" style="background: #2563eb; color: white; border: none; padding: 6px 14px; font-size: 12px; font-weight: 700; border-radius: 6px; display: flex; align-items: center; gap: 6px; cursor: pointer; box-shadow: 0 2px 8px rgba(37,99,235,0.4);">
                                    <i data-lucide="copy" style="width: 13px; height: 13px;"></i> Copy Code Prompt
                                </button>
                            </div>
                            
                            <textarea readonly id="generatedPromptArea" style="width:100%; height:320px; background:transparent; border:none; padding:16px; color:#f8fafc; font-size:13px; font-weight:500; line-height:1.6; resize:none; outline:none; font-family:var(--font-mono); box-sizing:border-box; overflow-y:auto;">${generatedPrompt}</textarea>
                        </div>
                    </div>
                    
                    <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:var(--radius-md); padding:14px 16px; font-size:12.5px; color:#1e40af; line-height:1.5; display: flex; flex-direction: column; gap: 4px; margin-top: 12px;">
                        <div><strong style="color:#2563eb;">Next Step:</strong> Copy this prompt code and paste it directly into ${selectedPlatform === 'antigravity' ? 'Antigravity AI' : selectedPlatform} to generate a high-converting web app in seconds.</div>
                        <div style="font-size:11.5px; color:#475569; font-weight:600;">How to leverage: Wow prospects with their personalized demo site before scheduling your sales pitch.</div>
                    </div>
                `;
            }

            const customLinks = State.profile?.custom_referral_links || {};
            const PLATFORM_LINKS = {
                antigravity: { name: 'Antigravity AI', url: customLinks.antigravity || 'https://antigravity.google.com' },
                lovable: { name: 'Lovable.dev', url: customLinks.lovable || 'https://lovable.dev/?via=nearpro' },
                bolt: { name: 'Bolt.new', url: customLinks.bolt || 'https://bolt.new/?ref=nearpro' },
                v0: { name: 'v0.dev', url: customLinks.v0 || 'https://v0.dev/?ref=nearpro' },
                emergent: { name: 'Emergent AI', url: customLinks.emergent || 'https://emergent.sh/?ref=nearpro' },
                cursor: { name: 'Cursor IDE', url: customLinks.cursor || 'https://cursor.com/?ref=nearpro' },
                claude: { name: 'Claude Code', url: customLinks.claude || 'https://claude.ai/?ref=nearpro' }
            };
            const currentPlatformMeta = PLATFORM_LINKS[selectedPlatform] || PLATFORM_LINKS.antigravity;

            workspaceHTML = `
                <div class="prompt-workspace-grid" style="display:flex; flex-direction:column; gap:20px; width:100%;">
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; background: #ffffff; border: 1px solid #e2e8f0; padding: 18px; border-radius: var(--radius-md); box-shadow: 0 2px 8px rgba(15,23,42,0.03);">
                        <div>
                            <label style="display:block; font-size:12px; font-family:var(--font-mono); color:#64748b; font-weight:800; text-transform:uppercase; margin-bottom:8px;">TARGET PLATFORM</label>
                            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                <button class="platform-btn ${selectedPlatform === 'antigravity' ? 'active' : ''}" data-platform="antigravity" style="${selectedPlatform === 'antigravity' ? 'background: linear-gradient(135deg, #6366f1, #a855f7); color: white; font-weight: 800;' : ''}">🚀 Antigravity AI</button>
                                <button class="platform-btn ${selectedPlatform === 'lovable' ? 'active' : ''}" data-platform="lovable">Lovable.dev</button>
                                <button class="platform-btn ${selectedPlatform === 'bolt' ? 'active' : ''}" data-platform="bolt">Bolt.new</button>
                                <button class="platform-btn ${selectedPlatform === 'v0' ? 'active' : ''}" data-platform="v0">v0.dev</button>
                                <button class="platform-btn ${selectedPlatform === 'emergent' ? 'active' : ''}" data-platform="emergent">Emergent AI</button>
                                <button class="platform-btn ${selectedPlatform === 'cursor' ? 'active' : ''}" data-platform="cursor">Cursor IDE</button>
                                <button class="platform-btn ${selectedPlatform === 'claude' ? 'active' : ''}" data-platform="claude">Claude Code</button>
                            </div>
                        </div>
                        
                        <div style="display:flex; gap:8px; align-items:center; margin-top: 12px; width: 100%; justify-content: flex-end; flex-wrap: wrap;">
                            <a href="${currentPlatformMeta.url}" target="_blank" rel="noopener noreferrer" id="launchPlatformBtn" style="text-decoration:none;" title="Auto-copy prompt & open ${currentPlatformMeta.name}">
                                <button class="brand-btn" style="padding:10px 16px; font-size:13px; font-weight:700; background:#ffffff; border:1.5px solid #cbd5e1; color:#0f172a; display:flex; align-items:center; gap:6px; border-radius:8px; cursor:pointer;">
                                    <i data-lucide="external-link" style="width:14px; height:14px; color:#2563eb;"></i> Launch ${currentPlatformMeta.name} ↗
                                </button>
                            </a>
                            <button class="brand-btn" id="generatePromptBtn" style="padding:10px 20px; font-size:13px; font-weight:800; background:#2563eb; color:white; border:none; border-radius:8px; display:flex; align-items:center; gap:6px; cursor:pointer; box-shadow:0 4px 12px rgba(37,99,235,0.25);" ${isGenerating ? 'disabled style="opacity:0.5;"' : ''}>
                                ${isGenerating ? '<div class="spinner" style="width:12px; height:12px; border-width:1.5px; margin:0;"></div> Generating...' : '⚡ Generate Prompt'}
                            </button>
                            <button class="brand-btn" id="copyPromptTextBtn" style="padding:10px 16px; font-size:13px; font-weight:700; background:#ffffff; border:1.5px solid #cbd5e1; color:#0f172a; display:flex; align-items:center; gap:6px; border-radius:8px; cursor:pointer; ${hasPrompt ? 'opacity:1;' : 'opacity:0.5;'}" ${hasPrompt ? '' : 'disabled'}>
                                <i data-lucide="copy" style="width:14px; height:14px;"></i> Copy
                            </button>
                        </div>
                    </div>
    
                    ${contentAreaHTML}
                </div>
            `;
        }
    } else {
        workspaceHTML = `
            <div style="text-align:center; padding:60px 20px; color:#64748b;">
                <i data-lucide="mouse-pointer" style="width:36px; height:36px; stroke-width:1.5; margin-bottom:12px; color:#2563eb;"></i>
                <h4 style="margin:0 0 6px 0; color:#0f172a; font-size:16px; font-weight:800;">Select a Lead from Pipeline</h4>
                <p style="margin:0; font-size:13px; color:#475569; font-weight:500;">Choose a business lead from the left sidebar to generate custom website prompts.</p>
            </div>
        `;
    }

    let usageHTML = '';
    if (limit >= 999999) {
        usageHTML = `⚡ Usage: <span id="promptUsageCounter"><strong>${count}</strong> generations (Unlimited for Enterprise)</span>`;
    } else {
        const remaining = Math.max(0, limit - count);
        usageHTML = `⚡ Usage: <span id="promptUsageCounter"><strong>${count}</strong> of <strong>${limit}</strong> generations used (${remaining} remaining)</span>`;
    }

    const usageBarHTML = `
        <div class="usage-bar" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 16px; margin-bottom: 20px; font-size: 12.5px; color: #475569; display: flex; align-items: center; justify-content: space-between; width: 100%; border-left: 3px solid #2563eb;">
            <span>${usageHTML}</span>
            <span style="font-size: 11px; font-family: var(--font-mono); color: #2563eb; font-weight: bold; text-transform: uppercase;">Tier: ${tier}</span>
        </div>
    `;

    return `
        <div class="prompt-workspace-container" style="display: flex; flex-direction: column; gap: 20px; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div class="prompt-workspace" style="display:grid; grid-template-columns: 260px 1fr; gap:24px; width:100%;">
                <!-- Left Panel -->
                <div class="prompt-sidebar" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; display:flex; flex-direction:column; gap:10px; overflow-y:auto; max-height:calc(100vh - 180px); box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <h4 style="margin:0 0 8px 0; font-size:12px; font-family:var(--font-mono); color:#64748b; text-transform:uppercase; letter-spacing:0.5px; font-weight: 700;">Pipeline Leads</h4>
                    <div class="prompt-leads-list" style="display:flex; flex-direction:column; gap:6px;">
                        ${leadsHTML}
                        ${emptyLeadsHTML}
                    </div>
                </div>

                <!-- Workspace Panel -->
                <div class="prompt-workspace-body" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; display:flex; flex-direction:column; min-height:400px; max-height:calc(100vh - 180px); overflow-y:auto; justify-content: flex-start; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    ${usageBarHTML}
                    ${workspaceHTML}
                </div>
            </div>
        </div>
    `;
}

export function bindPromptGeneratorEvents(onLeadSelectCallback, onPlatformSelectCallback, onGenerateRequestCallback) {
    // Process Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const leadItems = document.querySelectorAll('.prompt-lead-item');
    leadItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            if (onLeadSelectCallback) onLeadSelectCallback(id);
        });
    });

    const platformBtns = document.querySelectorAll('.platform-btn');
    platformBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.getAttribute('data-platform');
            if (onPlatformSelectCallback) onPlatformSelectCallback(platform);
        });
    });

    const generateBtn = document.getElementById('generatePromptBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            if (onGenerateRequestCallback) onGenerateRequestCallback();
        });
    }

    // Helper to copy text and provide feedback
    const handleCopy = (btnEl) => {
        const promptArea = document.getElementById('generatedPromptArea');
        if (promptArea && promptArea.value) {
            navigator.clipboard.writeText(promptArea.value).then(() => {
                if (btnEl) {
                    const originalText = btnEl.innerHTML;
                    btnEl.innerHTML = '✓ Copied!';
                    setTimeout(() => {
                        btnEl.innerHTML = originalText;
                    }, 2000);
                }
                if (window.showToast) window.showToast("Prompt copied to clipboard!", "success");
            });
        }
    };

    const copyBtn = document.getElementById('copyPromptTextBtn');
    if (copyBtn) copyBtn.addEventListener('click', () => handleCopy(copyBtn));

    const insideCopyBtn = document.getElementById('insideCopyPromptBtn');
    if (insideCopyBtn) insideCopyBtn.addEventListener('click', () => handleCopy(insideCopyBtn));

    const launchBtn = document.getElementById('launchPlatformBtn');
    if (launchBtn) {
        launchBtn.addEventListener('click', () => {
            const promptArea = document.getElementById('generatedPromptArea');
            if (promptArea && promptArea.value) {
                navigator.clipboard.writeText(promptArea.value).catch(() => {});
            }
        });
    }
}
