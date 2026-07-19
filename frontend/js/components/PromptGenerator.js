import { State } from '../state.js';
import { Api } from '../api.js';

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
        workspaceHTML = `
            <div class="prompt-workspace-grid" style="display:flex; flex-direction:column; gap:20px; width:100%;">
                
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                    <div>
                        <label style="display:block; font-size:11px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; margin-bottom:6px;">Target Platform</label>
                        <div style="display:flex; gap:8px;">
                            <button class="platform-btn ${selectedPlatform === 'lovable' ? 'active' : ''}" data-platform="lovable">Lovable.dev</button>
                            <button class="platform-btn ${selectedPlatform === 'bolt' ? 'active' : ''}" data-platform="bolt">Bolt.new</button>
                            <button class="platform-btn ${selectedPlatform === 'claude' ? 'active' : ''}" data-platform="claude">Claude Code</button>
                        </div>
                    </div>
                    
                    <button class="brand-btn" id="copyPromptTextBtn" style="padding:10px 16px; font-size:13px; display:flex; align-items:center; gap:6px;">
                        <i data-lucide="copy" style="width:14px; height:14px;"></i> Copy Prompt Code
                    </button>
                </div>

                <div>
                    <label style="display:block; font-size:11px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px;">Generated AI Prompt</label>
                    <textarea readonly id="generatedPromptArea" style="width:100%; height:260px; background:rgba(0,0,0,0.3); border:1px solid var(--border); border-radius:var(--radius-sm); padding:16px; color:white; font-size:13.5px; line-height:1.6; resize:none; outline:none; font-family:var(--font-mono);">${generatedPrompt}</textarea>
                </div>
                
                <div style="background:rgba(255,160,0,0.03); border:1px solid rgba(255,160,0,0.15); border-radius:var(--radius-md); padding:16px; font-size:12.5px; color:var(--text-secondary); line-height:1.5;">
                    <strong style="color:var(--accent-gold);">Instructions:</strong> Copy this prompt code and paste it directly into Lovable or Bolt to generate a complete, high converting local website draft for this business in 60 seconds.
                </div>
            </div>
        `;
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
                <!-- Usability Banner -->
                <div class="usability-banner" style="background: rgba(255, 160, 0, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 18px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 4px; border-left: 3px solid var(--accent-gold); flex-shrink: 0; width: 100%; text-align: left;">
                    <div style="font-size: 12.5px; color: white; line-height: 1.4;"><span style="color: var(--accent-gold); font-weight: 600;">What it is:</span> Generate customized layout prompts for Lovable, Bolt.new, or v0.dev.</div>
                    <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;"><span style="color: var(--accent-gold); font-weight: 600;">How to leverage:</span> Copy generated prompts to quickly build functional demo sites and wow prospects before scheduling pitches.</div>
                </div>
                ${workspaceHTML}
            </div>
        </div>
    `;
}

export function bindPromptGeneratorEvents(onLeadSelectCallback, onPlatformSelectCallback) {
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
