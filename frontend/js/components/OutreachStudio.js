import { State } from '../state.js';
import { Api } from '../api.js';
import { currentUserHasAccess } from '../auth.js';

export function buildOutreach(templateText, lead, audit = null) {
    let text = templateText;
    
    const variables = {
        '{{business_name}}': lead.name || '',
        '{{area}}': lead.area || 'Mumbai',
        '{{rating}}': lead.rating || '4.0',
        '{{review_count}}': lead.review_count || '0',
        '{{biggest_gap}}': audit?.biggest_gap || 'Website performance optimizations',
        '{{est_lost_revenue}}': audit?.est_lost_revenue_per_month ? String(audit.est_lost_revenue_per_month) : '8500',
        '{{demo_url}}': `https://lovable.dev/preview/nearpro_${(lead.id || 'preview').slice(0, 8)}`
    };

    for (const [key, val] of Object.entries(variables)) {
        text = text.replaceAll(key, val);
    }
    
    return text;
}

export function renderOutreachStudio(savedLeads, activeLeadId = null, templates = [], activeTemplateId = null, composedMessage = '', composedFollowUp = '') {
    const used = State.profile?.monthly_ai_generations_used || 0;
    const limit = State.profile?.monthly_ai_generations_limit || 500;
    const tier = State.profile?.subscription_tier || 'free';
    const aiUsageLabel = tier === 'agency' ? 'Unlimited AI runs' : `AI Runs: ${used}/${limit}`;

    // 1. Render Left panel (Lead Selector)
    const leadsHTML = savedLeads.map(item => {
        const lead = item.professionals || {};
        const isActive = activeLeadId === lead.id;
        const activeClass = isActive ? 'active' : '';
        const channelIcon = item.status === 'contacted' ? '💬' : '';

        return `
            <div class="outreach-lead-item ${activeClass}" data-id="${lead.id}">
                <div style="flex:1; min-width:0;">
                    <h5 style="margin:0 0 2px 0; font-size:13px; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lead.name}</h5>
                    <p style="margin:0; font-size:11px; color:var(--text-muted);">${lead.category || 'General'}</p>
                </div>
                ${channelIcon}
            </div>
        `;
    }).join('');

    const emptyLeadsHTML = savedLeads.length === 0 ? `
        <div style="padding:32px 12px; text-align:center; color:var(--text-muted); font-size:13px;">
            No saved leads in your pipeline.
        </div>
    ` : '';

    // 2. Render Template Options dropdown
    const templateOptionsHTML = templates.map(t => {
        const isSelected = activeTemplateId === t.id;
        return `<option value="${t.id}" ${isSelected ? 'selected' : ''}>${t.name}</option>`;
    }).join('');

    // 3. Render Middle & Right panel workspace content
    let workspaceHTML = '';
    if (activeLeadId) {
        const activeItem = savedLeads.find(item => item.professionals.id === activeLeadId);
        const lead = activeItem?.professionals;

        workspaceHTML = `
            <div class="outreach-workspace-grid" style="display:grid; grid-template-columns: 1fr 280px; gap:24px; width:100%;">
                
                <!-- Composer panel -->
                <div class="composer-column" style="display:flex; flex-direction:column; gap:20px;">
                    <!-- AI Pitch Generator Control Card -->
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; display: flex; flex-direction: column; gap: 12px;">
                        <h4 style="margin:0; font-size:12px; font-family:var(--font-mono); color:var(--accent-gold); text-transform:uppercase; display:flex; align-items:center; gap:6px;">
                            🪄 AI Pitch Generator
                        </h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label style="display:block; font-size:10px; color:var(--text-secondary); margin-bottom:4px;">Language</label>
                                <select id="aiLanguage" style="width:100%; padding:8px; background:var(--bg-base); border:1px solid var(--border); border-radius:var(--radius-sm); color:white; font-size:12px;">
                                    <option value="hinglish">🇮🇳 Hinglish Mix</option>
                                    <option value="english">🇬🇧 English Only</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-size:10px; color:var(--text-secondary); margin-bottom:4px;">Tone</label>
                                <select id="aiTone" style="width:100%; padding:8px; background:var(--bg-base); border:1px solid var(--border); border-radius:var(--radius-sm); color:white; font-size:12px;">
                                    <option value="friendly">🤝 Friendly</option>
                                    <option value="professional">💼 Professional</option>
                                    <option value="direct">🎯 Direct</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 4px; gap:12px;">
                            <span style="font-size:11px; color:var(--text-muted);" id="aiUsageText">${aiUsageLabel}</span>
                            <button class="brand-btn" id="generateAIPitchBtn" style="padding: 6px 14px; font-size: 11.5px; cursor:pointer;">
                                Write AI Pitch
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style="display:block; font-size:11px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px;">Choose Static Template</label>
                        <select id="outreachTemplateSelect" style="width:100%; padding:10px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-sm); color:white; font-size:13px;">
                            <option value="">Create message from scratch</option>
                            ${templateOptionsHTML}
                        </select>
                    </div>

                    <div>
                        <label style="display:block; font-size:11px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px;">Initial outreach pitch</label>
                        <textarea id="composerMainText" style="width:100%; height:160px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px; color:white; font-size:13.5px; line-height:1.5; resize:none; outline:none; font-family:sans-serif;">${composedMessage}</textarea>
                    </div>

                    <div>
                        <label style="display:block; font-size:11px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px;">Day 3 follow up pitch</label>
                        <textarea id="composerFollowUpText" style="width:100%; height:90px; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; color:white; font-size:13px; line-height:1.5; resize:none; outline:none; font-family:sans-serif;">${composedFollowUp}</textarea>
                    </div>
                </div>

                <!-- Send options panel -->
                <div class="send-options-column" style="display:flex; flex-direction:column; gap:20px;">
                    <div style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-md); padding:20px; display:flex; flex-direction:column; gap:12px;">
                        <h4 style="margin:0 0 4px 0; font-size:13px; font-family:var(--font-mono); color:var(--accent-gold); text-transform:uppercase;">Outreach Channels</h4>
                        
                        <button class="brand-btn outreach-send-btn" id="sendOutreachWhatsAppBtn" style="background:#22c55e; border-color:#22c55e; color:black; font-weight:600; padding:10px;">
                            💬 Send via WhatsApp
                        </button>
                        <button class="secondary-btn outreach-send-btn" id="sendOutreachEmailBtn" style="padding:10px;">
                            📧 Send via Email
                        </button>
                        <button class="secondary-btn outreach-send-btn" id="copyOutreachTextBtn" style="padding:10px;">
                            📋 Copy Message Text
                        </button>
                    </div>

                    <div style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-md); padding:20px; display:flex; flex-direction:column; gap:12px;">
                        <h4 style="margin:0 0 4px 0; font-size:13px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase;">Campaign Management</h4>
                        
                        <div style="font-size:12px; color:var(--text-muted); line-height:1.4;">
                            Track your outreach history. Mark this lead contacted to move them in the pipeline.
                        </div>
                        
                        <button class="brand-btn" id="markOutreachContactedBtn" style="padding:10px; font-size:12.5px;">
                            Mark as Contacted
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        workspaceHTML = `
            <div class="outreach-empty-state" style="text-align:center; padding:80px 20px; color:var(--text-muted); display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1;">
                <div style="font-size:40px; margin-bottom:12px;">✉️</div>
                <h4 style="margin:0 0 6px 0; color:white;">AI Outreach Studio</h4>
                <p style="color:var(--text-muted); font-size:13px; max-width:280px;">Select a saved pipeline lead from the left list to compose and personalize messages.</p>
            </div>
        `;
    }

    return `
        <div class="outreach-workspace" style="display:grid; grid-template-columns: 260px 1fr; gap:24px; height:100%;">
            <!-- Left Panel -->
            <div class="outreach-sidebar" style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px; display:flex; flex-direction:column; gap:10px; overflow-y:auto; max-height:calc(100vh - 160px);">
                <h4 style="margin:0 0 8px 0; font-size:13px; font-family:var(--font-mono); color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">Pipeline Leads</h4>
                <div class="outreach-leads-list" style="display:flex; flex-direction:column; gap:6px;">
                    ${leadsHTML}
                    ${emptyLeadsHTML}
                </div>
            </div>

            <!-- Workspace Panel -->
            <div class="outreach-workspace-body" style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-md); padding:28px; display:flex; min-height:400px; max-height:calc(100vh - 160px); overflow-y:auto;">
                ${workspaceHTML}
            </div>
        </div>
    `;
}

export function bindOutreachStudioEvents(templates, onLeadSelectCallback, onTemplateSelectCallback) {
    // Lead click
    const leadItems = document.querySelectorAll('.outreach-lead-item');
    leadItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            if (onLeadSelectCallback) onLeadSelectCallback(id);
        });
    });

    // Template select dropdown
    const select = document.getElementById('outreachTemplateSelect');
    if (select) {
        select.addEventListener('change', () => {
            const templateId = select.value;
            if (onTemplateSelectCallback) onTemplateSelectCallback(templateId);
        });
    }

    // Generate AI Pitch
    const generateAIPitchBtn = document.getElementById('generateAIPitchBtn');
    if (generateAIPitchBtn) {
        generateAIPitchBtn.addEventListener('click', async () => {
            if (!currentUserHasAccess('hunter')) {
                alert("The AI Pitch Generator requires the Hunter or Agency plan. Please upgrade to unlock this feature.");
                State.setPricingModal(true);
                return;
            }

            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const leadId = searchParams.get('lead_id');
            if (!leadId) return;

            const language = document.getElementById('aiLanguage').value;
            const tone = document.getElementById('aiTone').value;
            const channel = 'whatsapp'; // Default to WhatsApp pitch channel format

            const mainTextarea = document.getElementById('composerMainText');
            const originalVal = mainTextarea.value;
            
            // Set Loading state
            mainTextarea.value = "Writing your personalized pitch... please wait...";
            mainTextarea.disabled = true;
            generateAIPitchBtn.innerText = "Writing...";
            generateAIPitchBtn.disabled = true;

            try {
                const response = await Api.generateAIOutreach(leadId, channel, language, tone);
                mainTextarea.value = response.text;
                
                // Update profile stats counter locally
                if (State.profile) {
                    State.profile.monthly_ai_generations_used = response.used;
                    State.notify();
                }
            } catch (err) {
                console.error("AI Generation failed: ", err);
                alert(err.message || "Failed to generate AI pitch. Please try again.");
                mainTextarea.value = originalVal;
            } finally {
                mainTextarea.disabled = false;
                generateAIPitchBtn.innerText = "Write AI Pitch";
                generateAIPitchBtn.disabled = false;
            }
        });
    }

    // Compose copy button
    const copyBtn = document.getElementById('copyOutreachTextBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = document.getElementById('composerMainText').value;
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

    // Send actions
    const waBtn = document.getElementById('sendOutreachWhatsAppBtn');
    if (waBtn) {
        waBtn.addEventListener('click', () => {
            const text = document.getElementById('composerMainText').value;
            // Get active phone number from active lead
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const leadId = searchParams.get('lead_id');
            
            // Trigger quick WA open
            Api.supabase
                .from('saved_leads')
                .select('*, professionals(*)')
                .eq('professional_id', leadId)
                .single()
                .then(({ data }) => {
                    const phone = data?.professionals?.phone;
                    if (!phone) {
                        alert("No phone number configured for this business listing");
                        return;
                    }
                    const cleanPhone = phone.replace(/[^0-9]/g, '');
                    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
                });
        });
    }

    const emailBtn = document.getElementById('sendOutreachEmailBtn');
    if (emailBtn) {
        emailBtn.addEventListener('click', () => {
            const text = document.getElementById('composerMainText').value;
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const leadId = searchParams.get('lead_id');
            
            Api.supabase
                .from('saved_leads')
                .select('*, professionals(*)')
                .eq('professional_id', leadId)
                .single()
                .then(({ data }) => {
                    const email = data?.professionals?.email;
                    if (!email) {
                        alert("No email address configured for this business listing");
                        return;
                    }
                    // Parse subject and body from composed email text
                    let subject = "Outreach regarding your business";
                    let body = text;
                    if (text.startsWith("Subject: ")) {
                        const lines = text.split("\n\n");
                        subject = lines[0].replace("Subject: ", "");
                        body = lines.slice(1).join("\n\n");
                    }
                    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                });
        });
    }

    // Mark as Contacted
    const markBtn = document.getElementById('markOutreachContactedBtn');
    if (markBtn) {
        markBtn.addEventListener('click', async () => {
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const leadId = searchParams.get('lead_id');
            const mainText = document.getElementById('composerMainText').value;

            try {
                // Find saved lead ID first
                const { data } = await Api.supabase
                    .from('saved_leads')
                    .select('id')
                    .eq('professional_id', leadId)
                    .single();

                if (data) {
                    await Api.updateLeadStatus(data.id, 'contacted');
                    // Save outreach message log
                    await Api.supabase
                        .from('saved_leads')
                        .update({ 
                            outreach_message: mainText,
                            outreach_sent_at: new Date().toISOString()
                        })
                        .eq('id', data.id);

                    alert("Lead marked as Contacted in pipeline!");
                    window.location.hash = '#/dashboard/crm';
                }
            } catch (err) {
                console.error("Failed to mark lead contacted: ", err);
            }
        });
    }
}
