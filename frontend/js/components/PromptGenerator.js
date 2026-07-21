import { State } from '../state.js';
import { Api } from '../api.js';
import { getUserTier } from '../auth.js';

export const PROMPT_LIMITS = {
    free: 3,
    scout: 30,
    hunter: 60,
    agency: 100,
    enterprise: 999999
};

export function getPromptGenerationCount() {
    return State.profile?.monthly_prompt_copies_used || 0;
}

export function incrementPromptGenerationCount() {
    // Increment is handled backend-side in Supabase Edge Function
}

export function buildPrompt(platform, lead, audit = null) {
    const jsonLdType = (lead.category || '').toLowerCase().includes('dentist') ? 'Dentist' : 'LocalBusiness';
    const phone = lead.phone || '+91 98765 43210';
    
    return `Generate a complete, production ready single page website application for a local business named "${lead.name}" in ${lead.area || 'Mumbai'}. 
Target Platform: ${platform}
Local Search Compliance:
- Render structured JSON LD schema markup for type: "${jsonLdType}".
- Include Click to Call button linking directly to tel:${phone}.
- Include direct WhatsApp button linking to wa.me/${phone.replace(/[^0-9]/g, '')}.
- Achieve Lighthouse performance target of 90+ speed index.
- Follow a premium dark theme layout with Space Grotesk headings, smooth gradients, and Inter body typography.
- Copy tone should be friendly, tailored for an Indian audience, with subtle Hinglish expressions.
- Highlight customer validation: rating of ${lead.rating || '4.5'} stars from ${lead.review_count || '25'} customer reviews.
- Render 9 core sections: Hero showcase, Booking Scheduler form, Contact list, Reviews display, About story, Service list, Location map placeholder, FAQ accordion, Footer.
- Ensure 100% responsiveness on mobile screens. Do not use any external dependencies outside Tailwind CSS or standard icons.`;
}

export function renderPromptGenerator(savedLeads, activeLeadId = null, selectedPlatform = 'lovable', generatedPrompt = '') {
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
                    <h5 style="margin:0 0 2px 0; font-size:13px; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lead.name}</h5>
                    <p style="margin:0; font-size:11px; color:var(--text-muted);">${lead.category || 'General'}</p>
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
                <div style="text-align: center; padding: 60px 20px; border: 1px dashed var(--border); border-radius: var(--radius-md); max-width: 500px; margin: 40px auto; width: 100%;">
                    <div style="font-size: 40px; margin-bottom: 16px;">🚫</div>
                    <h3 style="margin-bottom: 12px; color: white;">Prompt Limit Reached</h3>
                    <p style="color: var(--text-muted); font-size: 13.5px; line-height: 1.5; margin-bottom: 24px;">
                        You have used all ${limit} prompt copies allowed on your ${tier.toUpperCase()} plan. Upgrade now to unlock more generations!
                    </p>
                    <button class="brand-btn" onclick="window.State.setPricingModal(true);">Upgrade Plan</button>
                </div>
            `        } else {
            const hasPrompt = generatedPrompt && !generatedPrompt.startsWith('Generating') && !generatedPrompt.startsWith('Error') && !generatedPrompt.startsWith('Choose');
            const isGenerating = generatedPrompt && generatedPrompt.startsWith('Generating');
            const isInitial = !generatedPrompt || generatedPrompt.startsWith('Choose');

            let contentAreaHTML = '';
            if (isInitial) {
                contentAreaHTML = `
                    <div style="background: rgba(255,255,255,0.01); border: 1px dashed var(--border); border-radius: var(--radius-md); padding: 48px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; width: 100%;">
                        <div style="font-size: 32px; margin-bottom: 12px;">✨</div>
                        <h4 style="margin: 0 0 6px 0; color: white; font-family: var(--font-heading); font-weight: 700; font-size: 15px;">Ready to create your layout prompt?</h4>
                        <p style="color: var(--text-secondary); font-size: 12.5px; max-width: 340px; line-height: 1.5; margin: 0;">
                            Select a target platform above and click <strong>Generate Prompt</strong>. We will write a customized layout specification tailored to this business.
                        </p>
                    </div>
                `;
            } else {
                contentAreaHTML = `
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="display:block; font-size:11px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase;">Generated Prompt</label>
                        <textarea readonly id="generatedPromptArea" style="width:100%; height:260px; background:rgba(0,0,0,0.3); border:1px solid var(--border); border-radius:var(--radius-sm); padding:16px; color:white; font-size:13.5px; line-height:1.6; resize:none; outline:none; font-family:var(--font-mono);">${generatedPrompt}</textarea>
                    </div>
                    
                    <div style="background:rgba(255,160,0,0.02); border:1px solid rgba(255,160,0,0.1); border-radius:var(--radius-md); padding:14px 16px; font-size:12.5px; color:var(--text-secondary); line-height:1.5; display: flex; flex-direction: column; gap: 4px;">
                        <div><strong style="color:var(--accent-gold);">Next Step:</strong> Copy this prompt code and paste it directly into Lovable or Bolt to generate a complete, high-converting demo website draft in under 60 seconds.</div>
                        <div style="font-size:11.5px; color:var(--text-muted);">How to leverage: Wow prospects with their personalized demo site before scheduling your sales pitch.</div>
                    </div>
                `;
            }

            workspaceHTML = `
                <div class="prompt-workspace-grid" style="display:flex; flex-direction:column; gap:20px; width:100%;">
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; background: rgba(255,255,255,0.01); border: 1px solid var(--border); padding: 16px; border-radius: var(--radius-md);">
                        <div>
                            <label style="display:block; font-size:11px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; margin-bottom:6px;">Target Platform</label>
                            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                <button class="platform-btn ${selectedPlatform === 'lovable' ? 'active' : ''}" data-platform="lovable">Lovable.dev</button>
                                <button class="platform-btn ${selectedPlatform === 'bolt' ? 'active' : ''}" data-platform="bolt">Bolt.new</button>
                                <button class="platform-btn ${selectedPlatform === 'v0' ? 'active' : ''}" data-platform="v0">v0.dev</button>
                                <button class="platform-btn ${selectedPlatform === 'cursor' ? 'active' : ''}" data-platform="cursor">Cursor IDE</button>
                                <button class="platform-btn ${selectedPlatform === 'claude' ? 'active' : ''}" data-platform="claude">Claude Code</button>
                            </div>
                        </div>
                        
                        <div style="display:flex; gap:8px; align-items:center; margin-top: 12px; width: 100%; justify-content: flex-end;">
                            <button class="brand-btn" id="generatePromptBtn" style="padding:10px 20px; font-size:13px; font-weight:700; display:flex; align-items:center; gap:6px;" ${isGenerating ? 'disabled style="opacity:0.5;"' : ''}>
                                ${isGenerating ? '<div class="spinner" style="width:12px; height:12px; border-width:1.5px; margin:0;"></div> Generating...' : '⚡ Generate Prompt'}
                            </button>
                            <button class="brand-btn" id="copyPromptTextBtn" style="padding:10px 16px; font-size:13px; display:flex; align-items:center; gap:6px; ${hasPrompt ? 'opacity:1;' : 'opacity:0.5;'}" ${hasPrompt ? '' : 'disabled'}>
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
            <div class="prompt-empty-state" style="text-align:center; padding:80px 20px; color:var(--text-muted); display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1;">
                <div style="margin-bottom:12px; display:flex; justify-content:center;">
                    <i data-lucide="zap" style="width:40px; height:40px; color:var(--accent-gold); stroke-width:1.5px;"></i>
                </div>
                <h4 style="margin:0 0 6px 0; color:white;">Website Prompt Engine</h4>
                <p style="color:var(--text-muted); font-size:13px; max-width:280px;">Select a saved pipeline lead from the left list to generate a production ready website builder prompt.</p>
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
        <div class="usage-bar" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 16px; margin-bottom: 20px; font-size: 12.5px; color: var(--text-secondary); display: flex; align-items: center; justify-content: space-between; width: 100%; border-left: 3px solid var(--accent-gold);">
            <span>${usageHTML}</span>
            <span style="font-size: 11px; font-family: var(--font-mono); color: var(--accent-gold); font-weight: bold; text-transform: uppercase;">Tier: ${tier}</span>
        </div>
    `;

    return `
        <div class="prompt-workspace" style="display:grid; grid-template-columns: 260px 1fr; gap:24px; height:100%;">
            <!-- Left Panel -->
            <div class="prompt-sidebar" style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px; display:flex; flex-direction:column; gap:10px; overflow-y:auto; max-height:calc(100vh - 160px);">
                <h4 style="margin:0 0 8px 0; font-size:13px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">Pipeline Leads</h4>
                <div class="prompt-leads-list" style="display:flex; flex-direction:column; gap:6px;">
                    ${leadsHTML}
                    ${emptyLeadsHTML}
                </div>
            </div>

            <!-- Workspace Panel -->
            <div class="prompt-workspace-body" style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-md); padding:28px; display:flex; flex-direction:column; min-height:400px; max-height:calc(100vh - 160px); overflow-y:auto; justify-content: flex-start;">
                ${usageBarHTML}
                ${workspaceHTML}
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

    const platformCards = document.querySelectorAll('.platform-card');
    platformCards.forEach(card => {
        card.addEventListener('click', () => {
            const platform = card.getAttribute('data-platform');
            if (onPlatformSelectCallback) onPlatformSelectCallback(platform);
        });
    });

    const generateBtn = document.getElementById('generatePromptBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            if (onGenerateRequestCallback) onGenerateRequestCallback();
        });
    }

    const copyBtn = document.getElementById('copyPromptTextBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = document.getElementById('generatedPromptArea').value;
            navigator.clipboard.writeText(text).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '✓ Copied!';
                copyBtn.style.color = 'var(--accent-gold)';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.style.color = '';
                }, 2000);
            });
        });
    }
}
