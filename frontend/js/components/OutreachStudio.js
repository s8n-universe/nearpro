import { State } from '../state.js';
import { Api } from '../api.js';
import { currentUserHasAccess } from '../auth.js';

export function buildOutreach(templateText, lead, audit = null) {
    let text = templateText;
    
    const senderName = State.profile?.full_name || 'Shri';
    const senderCompany = State.profile?.company_name || 'NearPro Agency';
    const bookingLink = State.profile?.booking_url || '';
    
    // Check if user has configured a custom portfolio website
    const hasPortfolio = !!State.profile?.portfolio_url;
    
    if (!hasPortfolio) {
        // Generalize the Hinglish system template
        text = text.replace(/Maine aapki brand ke liye ek custom demo design kiya hai:\s*\{\{demo_url\}\}\.?\s*/gi, '');
        text = text.replace(/kya hum discuss kar sakte hain\?/gi, 'kya hum isko fix karne ke liye discuss kar sakte hain?');

        // Generalize the English system template
        text = text.replace(/I built a mobile friendly demo layout to fix this:\s*\{\{demo_url\}\}\.?\s*/gi, 'We can configure a mobile-friendly layout to fix this. ');
        text = text.replace(/I built a mobile-friendly demo layout to fix this:\s*\{\{demo_url\}\}\.?\s*/gi, 'We can configure a mobile-friendly layout to fix this. ');
    }

    let demoUrl = '';
    if (hasPortfolio) {
        demoUrl = State.profile.portfolio_url;
    } else {
        const origin = window.location.origin + window.location.pathname;
        demoUrl = `${origin}#/preview/nearpro_${(lead.id || 'preview').slice(0, 8)}`;
    }
    
    const variables = {
        '{{business_name}}': lead.name || '',
        '{{area}}': lead.area || 'Mumbai',
        '{{rating}}': lead.rating || '4.0',
        '{{review_count}}': lead.review_count || '0',
        '{{biggest_gap}}': audit?.biggest_gap || 'Website performance optimizations',
        '{{est_lost_revenue}}': audit?.est_lost_revenue_per_month ? String(audit.est_lost_revenue_per_month) : '8500',
        '{{demo_url}}': demoUrl
    };

    for (const [key, val] of Object.entries(variables)) {
        text = text.replaceAll(key, val);
    }

    // Replace sender specific details
    text = text.replaceAll('[Your Name]', senderName);
    text = text.replaceAll('{{sender_name}}', senderName);
    text = text.replaceAll('[Your Company]', senderCompany);
    text = text.replaceAll('{{sender_company}}', senderCompany);
    if (bookingLink) {
        text = text.replaceAll('[Booking Link]', bookingLink);
        text = text.replaceAll('{{booking_url}}', bookingLink);
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
                    <h5 style="margin:0 0 2px 0; font-size:13px; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lead.name}</h5>
                    <p style="margin:0; font-size:11.5px; font-weight:600; color:#475569;">${lead.category || 'General'}</p>
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
    const templateOptionsHTML = (templates || []).map(t => {
        const isSelected = activeTemplateId === t.id;
        return `<option value="${t.id}" ${isSelected ? 'selected' : ''}>${t.name}</option>`;
    }).join('');

    // Ensure state defaults
    window._activeStudioTab = window._activeStudioTab || 'day1';
    window._aiOutreachChannel = window._aiOutreachChannel || 'whatsapp';

    const isHunterPlus = currentUserHasAccess('hunter');

    // 3. Render Middle & Right panel workspace content
    let workspaceHTML = '';
    if (activeLeadId) {
        const activeItem = savedLeads.find(item => item.professionals.id === activeLeadId);
        const lead = activeItem?.professionals || {};

        // Fetch or create fallback sequence
        const seq = window._generatedSequence || {
            hook_type: 'STANDARD',
            day1: {
                subject_a: `Website optimization for ${lead.name}`,
                subject_b: `Quick question about ${lead.name} profile`,
                subject_c: `Local maps rating gap`,
                message: isHunterPlus ? `Click "Write AI Pitch" above to generate a personalized outreach sequence for ${lead.name} using AI!` : composedMessage
            },
            day3: {
                subject: `Re: Website optimization for ${lead.name}`,
                message: isHunterPlus ? `Click "Write AI Pitch" above to generate a personalized outreach sequence for ${lead.name} using AI!` : composedFollowUp
            },
            day7: {
                subject: `Re: Website optimization for ${lead.name}`,
                message: isHunterPlus ? `Click "Write AI Pitch" above to generate a personalized outreach sequence for ${lead.name} using AI!` : `Hi team, just leaving this here. If you ever want to check how we could improve your digital ranking, feel free to reach out. Low pressure. Best, ${State.profile?.full_name || 'Shri'}`
            }
        };

        const activeMsg = seq[window._activeStudioTab] || { message: '', subject: '' };

        // Determine limits
        const isEmail = window._aiOutreachChannel === 'email';
        let wordLimit = 75;
        if (window._activeStudioTab === 'day1') wordLimit = isEmail ? 150 : 75;
        else if (window._activeStudioTab === 'day3') wordLimit = isEmail ? 100 : 50;
        else if (window._activeStudioTab === 'day7') wordLimit = isEmail ? 80 : 40;

        const currentWordCount = activeMsg.message.trim().split(/\s+/).filter(Boolean).length;
        const countColor = currentWordCount > wordLimit ? '#dc2626' : '#16a34a'; // High contrast red/green
        const selectedDoc = (window._userDocuments || []).find(doc => doc.id === window._selectedBrochureId) 
            || (window._userDocuments || [])[0];
        const defaultLinkLabel = selectedDoc ? selectedDoc.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ") : "Business Portfolio";

        const hookLabelMap = {
            HIGH_RATING_NO_WEB: "Strong Rating, Missing Web Presence",
            HIGH_RATING_LOW_REVIEWS: "Hidden Gem — High Quality, Low Visibility",
            REPUTATION_OPPORTUNITY: "Reputation Growth Opportunity",
            HIDDEN_GEM: "Under-the-Radar Quality Business",
            ZERO_DIGITAL: "Offline-First Business",
            STRONG_BRAND_GROWTH: "Established Business — Growth Angle",
            STANDARD: "Observation + Question"
        };
        const hookLabel = hookLabelMap[seq.hook_type || 'STANDARD'] || "Observation + Question";

        // Setup dynamic selected email subject
        if (isEmail) {
            if (window._activeStudioTab === 'day1') {
                window._selectedSubject = window._selectedSubject || activeMsg.subject_a || activeMsg.subject || `Website optimization for ${lead.name}`;
            } else {
                window._selectedSubject = activeMsg.subject || `Re: Website optimization for ${lead.name}`;
            }
        } else {
            window._selectedSubject = '';
        }

        workspaceHTML = `
            <div class="outreach-workspace-grid" style="display:grid; grid-template-columns: 1fr 280px; gap:24px; width:100%; text-align: left;">
                
                <!-- Composer panel -->
                <div class="composer-column" style="display:flex; flex-direction:column; gap:20px;">
                    
                    <!-- Sender Profile Warning Banner -->
                    ${!State.profile?.sender_service_blurb ? `
                        <div class="profile-warning-banner" id="studioWarningBanner" style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.25); border-left: 5px solid #dc2626; padding: 14px 20px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                            <div style="display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: #991b1b; font-weight:600;">
                                <i data-lucide="alert-triangle" style="width: 16px; height: 16px; color: #dc2626;"></i>
                                <span>Set your Outreach Profile to personalise all messages</span>
                            </div>
                            <span style="font-size: 12.5px; color: #dc2626; font-weight: 700;">Configure Settings &rarr;</span>
                        </div>
                    ` : ''}

                    <!-- AI Pitch Generator Control Card (Hunter+ Tier Only) -->
                    ${isHunterPlus ? `
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 22px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                        <h4 style="margin:0; font-size:13px; font-family:var(--font-mono); color:#b45309; text-transform:uppercase; display:flex; align-items:center; gap:8px; font-weight:700; letter-spacing:0.5px;">
                            🪄 AI Outreach Generator
                        </h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="display:block; font-size:11px; color:#475569; margin-bottom:6px; font-weight:600;">Language</label>
                                <select id="aiLanguage" style="width:100%; padding:10px; background:#ffffff; border:1px solid #cbd5e1; border-radius:var(--radius-sm); color:#0f172a; font-size:13.5px; cursor:pointer;">
                                    <option value="hinglish" ${State.ai_outreach_language === 'hinglish' ? 'selected' : ''}>🇮🇳 Hinglish Mix</option>
                                    <option value="english" ${State.ai_outreach_language === 'english' ? 'selected' : ''}>🇬🇧 English Only</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; color:#475569; margin-bottom:6px; font-weight:600;">Tone</label>
                                <select id="aiTone" style="width:100%; padding:10px; background:#ffffff; border:1px solid #cbd5e1; border-radius:var(--radius-sm); color:#0f172a; font-size:13.5px; cursor:pointer;">
                                    <option value="friendly" ${State.ai_outreach_tone === 'friendly' ? 'selected' : ''}>🤝 Friendly</option>
                                    <option value="professional" ${State.ai_outreach_tone === 'professional' ? 'selected' : ''}>💼 Professional</option>
                                    <option value="direct" ${State.ai_outreach_tone === 'direct' ? 'selected' : ''}>🎯 Direct</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-size:11px; color:#475569; margin-bottom:6px; font-weight:600;">Channel</label>
                                <select id="aiChannel" style="width:100%; padding:10px; background:#ffffff; border:1px solid #cbd5e1; border-radius:var(--radius-sm); color:#0f172a; font-size:13.5px; cursor:pointer;">
                                    <option value="whatsapp" ${window._aiOutreachChannel === 'whatsapp' ? 'selected' : ''}>💬 WhatsApp</option>
                                    <option value="email" ${window._aiOutreachChannel === 'email' ? 'selected' : ''}>📧 Email</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 4px; gap:12px; border-top:1px solid #e2e8f0; padding-top:14px;">
                            <span style="font-size:12px; color:#475569; font-weight:500;" id="aiUsageText">${aiUsageLabel}</span>
                            <button class="brand-btn" id="generateAIPitchBtn" style="padding: 10px 20px; font-size: 13px; font-weight:600; cursor:pointer;">
                                Write AI Pitch
                            </button>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Choose Static Template Card (Scout / Lower Tier Only) -->
                    ${!isHunterPlus ? `
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-sm); padding: 16px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.01);">
                        <label style="display:block; font-size:12px; font-family:var(--font-mono); color:#334155; text-transform:uppercase; margin:0; font-weight:700;">📁 Choose Static Template</label>
                        <select id="outreachTemplateSelect" style="width:100%; padding:10px; background:#ffffff; border:1px solid #cbd5e1; border-radius:var(--radius-sm); color:#0f172a; font-size:13.5px; cursor: pointer;">
                            <option value="">Start from scratch (blank slate)</option>
                            ${templateOptionsHTML}
                        </select>
                    </div>
                    ` : ''}

                    <!-- PDF brochure attachment -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-sm); padding: 16px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.01);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 12.5px; color: #1e293b; font-weight:700; display: flex; align-items: center; gap: 6px;">📎 Attach Brochure / PDF</span>
                            <label class="switch-container">
                                <input type="checkbox" id="outreachBrochureToggle" ${window._attachBrochureEnabled ? 'checked' : ''}>
                                <span class="slider" style="border:1px solid #cbd5e1;"></span>
                            </label>
                        </div>
                        
                        <div id="outreachBrochureSelectContainer" style="display: ${window._attachBrochureEnabled ? 'block' : 'none'};">
                            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                                <select id="outreachBrochureDropdown" style="flex: 1; padding: 10px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: var(--radius-sm); color: #0f172a; font-size: 13px; outline: none; cursor:pointer;">
                                    ${(window._userDocuments || []).map(doc => `
                                        <option value="${doc.id}" ${window._selectedBrochureId === doc.id ? 'selected' : ''}>${doc.name}</option>
                                    `).join('')}
                                    ${(window._userDocuments || []).length === 0 ? '<option value="">No documents uploaded</option>' : ''}
                                </select>
                                <button class="secondary-btn" id="studioDownloadBrochureBtn" style="padding: 10px; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); background:#ffffff; border-color:#cbd5e1; color:#334155; cursor:pointer;" title="Download PDF File">
                                    <i data-lucide="download" style="width: 14px; height: 14px;"></i>
                                </button>
                            </div>
                            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569; cursor: pointer; margin-top: 6px; user-select: none; margin-bottom: 6px; font-weight:600;">
                                <input type="checkbox" id="studioBrochureIncludeLink" ${window._includeBrochureLink ? 'checked' : ''}>
                                <span>Include PDF link in message text</span>
                            </label>
                            <div id="outreachBrochureLinkLabelContainer" style="display: ${window._includeBrochureLink ? 'block' : 'none'};">
                                <label style="display: block; font-size: 11px; color: #475569; margin-bottom: 4px; font-weight:600;">LINK LABEL:</label>
                                <input type="text" id="studioBrochureLinkLabel" placeholder="e.g. ${defaultLinkLabel}" value="${window._brochureLinkLabel || defaultLinkLabel}" style="width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-radius: var(--radius-sm); padding: 8px 10px; color: #0f172a; font-size: 13px; outline: none;">
                            </div>
                        </div>
                    </div>

                    <!-- Sequence Tab bar -->
                    <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: var(--radius-md); padding: 22px; display:flex; flex-direction:column; gap:18px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                        
                        <!-- Hook Type indicator -->
                        <div style="background: linear-gradient(90deg, rgba(245, 158, 11, 0.06) 0%, rgba(245, 158, 11, 0.01) 100%); border: 1px solid rgba(245, 158, 11, 0.25); border-left: 4px solid #d97706; border-radius: var(--radius-sm); padding: 12px 16px; display: flex; align-items: center; gap: 10px; font-size: 14px; color: #b45309; font-weight:700;">
                            <i data-lucide="sparkles" style="width:16px; height:16px; stroke-width:2.5px; color: #d97706;"></i>
                            <span><strong>Hook strategy:</strong> ${hookLabel}</span>
                        </div>

                        <!-- Sequence Navigation tabs -->
                        <div class="studio-tabs" style="display: flex; gap: 6px; background: #f1f5f9; padding: 5px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <button class="studio-tab-btn ${window._activeStudioTab === 'day1' ? 'active' : ''}" data-tab="day1" style="flex:1; border: none; border-radius: 6px; color: ${window._activeStudioTab === 'day1' ? '#0f172a' : '#64748b'}; background: ${window._activeStudioTab === 'day1' ? '#ffffff' : 'transparent'}; border: 1px solid ${window._activeStudioTab === 'day1' ? '#cbd5e1' : 'transparent'}; padding: 10px 14px; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: ${window._activeStudioTab === 'day1' ? '0 2px 4px rgba(0,0,0,0.04)' : 'none'};">Day 1 — Initial</button>
                            <button class="studio-tab-btn ${window._activeStudioTab === 'day3' ? 'active' : ''}" data-tab="day3" style="flex:1; border: none; border-radius: 6px; color: ${window._activeStudioTab === 'day3' ? '#0f172a' : '#64748b'}; background: ${window._activeStudioTab === 'day3' ? '#ffffff' : 'transparent'}; border: 1px solid ${window._activeStudioTab === 'day3' ? '#cbd5e1' : 'transparent'}; padding: 10px 14px; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: ${window._activeStudioTab === 'day3' ? '0 2px 4px rgba(0,0,0,0.04)' : 'none'};">Day 3 — Follow-up</button>
                            <button class="studio-tab-btn ${window._activeStudioTab === 'day7' ? 'active' : ''}" data-tab="day7" style="flex:1; border: none; border-radius: 6px; color: ${window._activeStudioTab === 'day7' ? '#0f172a' : '#64748b'}; background: ${window._activeStudioTab === 'day7' ? '#ffffff' : 'transparent'}; border: 1px solid ${window._activeStudioTab === 'day7' ? '#cbd5e1' : 'transparent'}; padding: 10px 14px; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: ${window._activeStudioTab === 'day7' ? '0 2px 4px rgba(0,0,0,0.04)' : 'none'};">Day 7 — Final Touch</button>
                        </div>

                        <!-- Subject Picker / Header -->
                        ${isEmail && window._activeStudioTab === 'day1' ? `
                            <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 10px;">
                                <label style="display:block; font-size:12px; color:#475569; text-transform:uppercase; font-family:var(--font-mono); letter-spacing:0.5px; font-weight: 700;">Choose Subject Line (A/B/C):</label>
                                <div style="display:flex; flex-direction:column; gap:8px;">
                                    <button class="subject-pill-btn ${window._selectedSubject === activeMsg.subject_a ? 'active' : ''}" data-subject="${activeMsg.subject_a || ''}" style="text-align: left; padding: 12px 16px; border-radius: var(--radius-sm); font-size: 13.5px; font-weight:600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px;">
                                        <span class="subject-badge">A</span>
                                        <span style="flex:1;">${activeMsg.subject_a || `Website scan for ${lead.name}`}</span>
                                    </button>
                                    <button class="subject-pill-btn ${window._selectedSubject === activeMsg.subject_b ? 'active' : ''}" data-subject="${activeMsg.subject_b || ''}" style="text-align: left; padding: 12px 16px; border-radius: var(--radius-sm); font-size: 13.5px; font-weight:600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px;">
                                        <span class="subject-badge">B</span>
                                        <span style="flex:1;">${activeMsg.subject_b || `Quick question about ${lead.name}`}</span>
                                    </button>
                                    <button class="subject-pill-btn ${window._selectedSubject === activeMsg.subject_c ? 'active' : ''}" data-subject="${activeMsg.subject_c || ''}" style="text-align: left; padding: 12px 16px; border-radius: var(--radius-sm); font-size: 13.5px; font-weight:600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px;">
                                        <span class="subject-badge">C</span>
                                        <span style="flex:1;">${activeMsg.subject_c || `Improve ranking for ${lead.name}`}</span>
                                    </button>
                                </div>
                            </div>
                        ` : ''}

                        ${isEmail && window._activeStudioTab !== 'day1' ? `
                            <div style="margin-top: 4px;">
                                <label style="display:block; font-size:12px; color:#475569; text-transform:uppercase; font-family:var(--font-mono); letter-spacing:0.5px; margin-bottom:6px; font-weight: 700;">Email Subject</label>
                                <input type="text" id="settingsEmailSubject" value="${activeMsg.subject || `Re: Website optimization for ${lead.name}`}" style="width: 100%; padding: 12px 14px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: var(--radius-sm); color: #0f172a; font-size: 14px; font-weight:600;" readonly />
                            </div>
                        ` : ''}

                        <!-- Message Textarea -->
                        <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 10px;">
                            <label style="display:flex; align-items:center; gap:6px; font-size:12.5px; color:#0f172a; text-transform:uppercase; font-family:var(--font-mono); letter-spacing:1px; font-weight:700;">
                                <i data-lucide="file-text" style="width:14px; height:14px; color: #b45309;"></i> Outreach Copy
                            </label>
                            <textarea id="composerMainText" style="width:100%; height:220px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px 22px; color: #0f172a; font-size: 15.5px; line-height: 1.6; resize: none; outline: none; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: inset 0 2px 6px rgba(0,0,0,0.04); transition: all 0.2s; border-color:#cbd5e1; border-width: 1.5px;">${activeMsg.message}</textarea>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                                <span id="wordCounterText" style="font-size: 12px; font-family: var(--font-mono); color: #475569; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 8px; font-weight:600;">
                                    <i data-lucide="text-cursor" style="width:13px; height:13px; color:#64748b;"></i>
                                    <span>Words: <strong style="color: ${countColor}; font-size:13.5px;" id="studioWordCount">${currentWordCount}</strong> / <span id="studioWordLimit">${wordLimit}</span></span>
                                </span>
                                ${isHunterPlus ? `
                                <button class="secondary-btn" id="regenerateActiveTabBtn" style="padding: 8px 16px; font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer; border-radius: var(--radius-sm); background:#ffffff; border-color:#cbd5e1; color:#0f172a; transition: all 0.2s;" title="Regenerate this message only">
                                    <i data-lucide="refresh-cw" style="width: 13px; height: 13px;"></i> Regenerate Message
                                </button>
                                ` : ''}
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Send options panel -->
                <div class="send-options-column" style="display:flex; flex-direction:column; gap:24px;">
                    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:var(--radius-md); padding:22px; display:flex; flex-direction:column; gap:14px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                        <h4 style="margin:0 0 4px 0; font-size:13px; font-family:var(--font-mono); color:#334155; text-transform:uppercase; font-weight:700;">Outreach Channels</h4>
                        
                        <button class="brand-btn outreach-send-btn" id="sendOutreachWhatsAppBtn" style="background:#22c55e; border-color:#22c55e; color:white; font-weight:700; padding:12px; font-size:13px; cursor:${lead.phone ? 'pointer' : 'not-allowed'}; opacity:${lead.phone ? 1 : 0.55};" ${lead.phone ? '' : 'disabled'}>
                            💬 Send via WhatsApp
                        </button>
                        ${!lead.phone ? `<div style="font-size: 11px; color: #dc2626; font-weight: 600; text-align: center; margin-top: -6px;">⚠️ No phone number available</div>` : ''}
                        
                        <button class="secondary-btn outreach-send-btn" id="sendOutreachEmailBtn" style="padding:12px; font-size:13px; font-weight:700; background:#ffffff; border-color:#cbd5e1; color:#0f172a; cursor:${lead.email ? 'pointer' : 'not-allowed'}; opacity:${lead.email ? 1 : 0.55};" ${lead.email ? '' : 'disabled'}>
                            📧 Send via Email
                        </button>
                        ${!lead.email ? `<div style="font-size: 11px; color: #dc2626; font-weight: 600; text-align: center; margin-top: -6px;">⚠️ No email address available</div>` : ''}
                        
                        <button class="secondary-btn outreach-send-btn" id="copyOutreachTextBtn" style="padding:12px; font-size:13px; font-weight:700; background:#ffffff; border-color:#cbd5e1; color:#0f172a; cursor:pointer;">
                            📋 Copy Message Text
                        </button>
                    </div>

                    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:var(--radius-md); padding:22px; display:flex; flex-direction:column; gap:14px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                        <h4 style="margin:0 0 4px 0; font-size:13px; font-family:var(--font-mono); color:#334155; text-transform:uppercase; font-weight:700;">Campaign Management</h4>
                        
                        <div style="font-size:12.5px; color:#64748b; line-height:1.5; font-weight:500;">
                            Track your outreach history. Mark this lead contacted to move them in the pipeline.
                        </div>
                        
                        <button class="brand-btn" id="markOutreachContactedBtn" style="padding:12px; font-size:13px; font-weight:700; cursor:pointer;">
                            Mark as Contacted
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        workspaceHTML = `
            <div class="outreach-empty-state" style="text-align:center; padding:100px 20px; color:#64748b; display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1;">
                <div style="margin-bottom:16px; display:flex; justify-content:center;">
                    <i data-lucide="send" style="width:48px; height:48px; color:#94a3b8; stroke-width:1.5px;"></i>
                </div>
                <h4 style="margin:0 0 8px 0; color:#0f172a; font-size:18px; font-weight:700;">AI Outreach Studio</h4>
                <p style="color:#64748b; font-size:14px; max-width:320px; line-height:1.5;">Select a saved pipeline lead from the left list to compose and personalize messages.</p>
            </div>
        `;
    }

    return `
        <!-- Custom Premium Google Fonts Loader & Target Scoped Overrides -->
        <style scoped>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap');
        
        .outreach-workspace-body, 
        .outreach-workspace-body *, 
        #composerMainText {
            font-family: 'Plus Jakarta Sans', 'Outfit', -apple-system, system-ui, sans-serif !important;
        }
        
        /* Premium Textarea Focus Glower */
        #composerMainText:focus {
            border-color: #d97706 !important;
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12) !important;
        }
        
        /* High Contrast Subject Pill hover configurations */
        .subject-pill-btn {
            border: 1px solid #cbd5e1 !important;
            background: #ffffff !important;
            color: #334155 !important;
        }
        
        .subject-pill-btn.active {
            border-color: #d97706 !important;
            background: rgba(245, 158, 11, 0.06) !important;
            color: #b45309 !important;
        }
        
        .subject-badge {
            background: #e2e8f0 !important;
            color: #475569 !important;
            font-weight: 800 !important;
            width: 20px !important;
            height: 20px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 4px !important;
            font-size: 12px !important;
        }
        
        .subject-pill-btn.active .subject-badge {
            background: #d97706 !important;
            color: white !important;
        }

        .subject-pill-btn:hover {
            border-color: #d97706 !important;
            background: rgba(245, 158, 11, 0.03) !important;
        }
        
        .outreach-send-btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        </style>

        <div class="outreach-workspace-container" style="display: flex; flex-direction: column; gap: 20px; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div class="outreach-workspace" style="display:grid; grid-template-columns: 260px 1fr; gap:24px; width:100%;">
                <!-- Left Panel -->
                <div class="outreach-sidebar" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; display:flex; flex-direction:column; gap:10px; overflow-y:auto; max-height:calc(100vh - 180px); box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <h4 style="margin:0 0 8px 0; font-size:12px; font-family:var(--font-mono); color:#64748b; text-transform:uppercase; letter-spacing:0.5px; font-weight: 700;">Pipeline Leads</h4>
                    <div class="outreach-leads-list" style="display:flex; flex-direction:column; gap:6px;">
                        ${leadsHTML}
                        ${emptyLeadsHTML}
                    </div>
                </div>

                <!-- Workspace Panel (White/Light Theme with Zoomed Layout) -->
                <div class="outreach-workspace-body" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:32px; display:flex; flex-direction:column; min-height:400px; max-height:calc(100vh - 180px); overflow-y:auto; justify-content: flex-start; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03); color: #0f172a; position: relative;">
                    <!-- Usability Banner -->
                    <div class="usability-banner" style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #b45309; border-radius: 8px; padding: 14px 20px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; width: 100%; text-align: left;">
                        <div style="font-size: 13.5px; color: #0f172a; line-height: 1.4; font-weight:700;"><span style="color: #b45309; font-weight: 800;">What it is:</span> Compose highly personalized client pitches and automated follow-ups using AI.</div>
                        <div style="font-size: 13px; color: #475569; line-height: 1.4; font-weight:500;"><span style="color: #b45309; font-weight: 800;">How to leverage:</span> Generate scripts in Hinglish or Professional tones pre-filled with specific lead audit data.</div>
                    </div>
                    ${workspaceHTML}
                </div>
            </div>
        </div>
    `;
}

export function bindOutreachStudioEvents(templates, onLeadSelectCallback, onTemplateSelectCallback) {
    // Process Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const activeLeadId = searchParams.get('lead_id');

    // Lead click
    const leadItems = document.querySelectorAll('.outreach-lead-item');
    leadItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            if (onLeadSelectCallback) onLeadSelectCallback(id);
        });
    });

    // Warning Banner navigation
    const warningBanner = document.getElementById('studioWarningBanner');
    if (warningBanner) {
        warningBanner.addEventListener('click', () => {
            window.location.hash = '#/dashboard/settings';
        });
    }

    // Channel Selection change
    const channelSelect = document.getElementById('aiChannel');
    if (channelSelect) {
        channelSelect.addEventListener('change', () => {
            window._aiOutreachChannel = channelSelect.value;
            // Clear selected subject cache so it regenerates
            window._selectedSubject = '';
            if (onLeadSelectCallback && activeLeadId) onLeadSelectCallback(activeLeadId);
        });
    }

    // Sequence Tab Selection
    const tabBtns = document.querySelectorAll('.studio-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            window._activeStudioTab = btn.getAttribute('data-tab');
            window._selectedSubject = ''; // Reset chosen subject
            if (onLeadSelectCallback && activeLeadId) onLeadSelectCallback(activeLeadId);
        });
    });

    // Subject Line Pill Selection
    const subjectPills = document.querySelectorAll('.subject-pill-btn');
    subjectPills.forEach(pill => {
        pill.addEventListener('click', () => {
            window._selectedSubject = pill.getAttribute('data-subject');
            // Toggle active classes manually (instant UI updates with CSS class rules)
            subjectPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });

    // Textarea input sync with cache & real-time word counter
    const textarea = document.getElementById('composerMainText');
    if (textarea) {
        textarea.addEventListener('input', () => {
            const val = textarea.value;
            if (window._generatedSequence && window._generatedSequence[window._activeStudioTab]) {
                window._generatedSequence[window._activeStudioTab].message = val;
            }
            
            // Calculate word count
            const wordCount = val.trim().split(/\s+/).filter(Boolean).length;
            const counter = document.getElementById('studioWordCount');
            if (counter) {
                counter.innerText = wordCount;
                const limit = parseInt(document.getElementById('studioWordLimit').innerText) || 75;
                counter.style.color = wordCount > limit ? '#ef4444' : '#22c55e';
            }
        });
    }

    // Template select dropdown
    const select = document.getElementById('outreachTemplateSelect');
    if (select) {
        select.addEventListener('change', () => {
            const templateId = select.value;
            // Clear generated sequence cache so it falls back to the static template
            window._generatedSequence = null; 
            window._sequenceTemplateId = null;
            if (onTemplateSelectCallback) onTemplateSelectCallback(templateId);
        });
    }

    // Write AI Pitch
    const generateAIPitchBtn = document.getElementById('generateAIPitchBtn');
    if (generateAIPitchBtn) {
        generateAIPitchBtn.addEventListener('click', async () => {
            if (!currentUserHasAccess('hunter')) {
                alert("The AI Outreach Generator requires the Hunter or Agency plan. Please upgrade to unlock this feature.");
                State.setPricingModal(true);
                return;
            }

            // UX Check: If sender details are missing, prompt personalization
            const hasPersonalName = State.profile?.full_name?.trim();
            const hasPersonalCompany = State.profile?.company_name?.trim();
            if (!hasPersonalName || !hasPersonalCompany) {
                alert("Please configure your sender details (Name and Agency Name) to generate highly personalized AI pitches.");
                State.setPersonalizationModal(true);
                return;
            }

            const leadId = activeLeadId;
            if (!leadId) return;

            const language = document.getElementById('aiLanguage').value;
            const tone = document.getElementById('aiTone').value;
            const channel = window._aiOutreachChannel || 'whatsapp';

            // Local cache of state settings
            State.ai_outreach_language = language;
            State.ai_outreach_tone = tone;

            if (textarea) {
                textarea.value = "Writing your personalized Cold Sequence... please wait...";
                textarea.disabled = true;
            }
            generateAIPitchBtn.innerText = "Writing...";
            generateAIPitchBtn.disabled = true;

            try {
                const response = await Api.generateAIOutreach(leadId, channel, language, tone);
                
                // Cache the sequence in global window storage
                window._generatedSequence = {
                    hook_type: response.hook_type,
                    day1: response.day1,
                    day3: response.day3,
                    day7: response.day7
                };
                
                // Track lead and tag as AI-generated sequence
                window._sequenceLeadId = leadId;
                window._sequenceTemplateId = 'ai';

                // Reset static template dropdown selection
                const selectEl = document.getElementById('outreachTemplateSelect');
                if (selectEl) selectEl.value = '';
                
                // Setup default selected subject line
                window._selectedSubject = '';
                
                // Update profile stats counter locally
                if (State.profile) {
                    State.profile.monthly_ai_generations_used = response.used;
                    State.notify();
                }

                // Refresh view to display sequence tabs
                if (onLeadSelectCallback) onLeadSelectCallback(leadId);
            } catch (err) {
                console.error("AI Generation failed: ", err);
                alert(err.message || "Failed to generate AI pitch. Please try again.");
                if (textarea) textarea.value = "";
            } finally {
                if (textarea) textarea.disabled = false;
                generateAIPitchBtn.innerText = "Write AI Pitch";
                generateAIPitchBtn.disabled = false;
            }
        });
    }

    // Single message regeneration
    const regenBtn = document.getElementById('regenerateActiveTabBtn');
    if (regenBtn && activeLeadId) {
        regenBtn.addEventListener('click', async () => {
            const language = document.getElementById('aiLanguage').value;
            const tone = document.getElementById('aiTone').value;
            const channel = window._aiOutreachChannel || 'whatsapp';
            const activeTab = window._activeStudioTab || 'day1';
            
            const seq = window._generatedSequence || {};

            regenBtn.innerText = "Writing...";
            regenBtn.disabled = true;
            if (textarea) {
                textarea.value = "Regenerating this single message... please wait...";
                textarea.disabled = true;
            }

            try {
                const response = await Api.generateAIOutreach(
                    activeLeadId,
                    channel,
                    language,
                    tone,
                    activeTab,
                    seq.day1?.message || '',
                    seq.day3?.message || '',
                    seq.day7?.message || ''
                );

                if (window._generatedSequence) {
                    window._generatedSequence[activeTab] = response[activeTab];
                }
                
                // Refresh view
                if (onLeadSelectCallback) onLeadSelectCallback(activeLeadId);
            } catch (err) {
                console.error("Single day regeneration failed: ", err);
                alert("Failed to regenerate single message. Please try again.");
            } finally {
                regenBtn.innerText = "Regenerate Message";
                regenBtn.disabled = false;
                if (textarea) textarea.disabled = false;
            }
        });
    }

    // Brochure attachment handlers in Studio
    const brochureToggle = document.getElementById('outreachBrochureToggle');
    const brochureSelectContainer = document.getElementById('outreachBrochureSelectContainer');
    const brochureDropdown = document.getElementById('outreachBrochureDropdown');
    const outreachBrochureLinkLabelContainer = document.getElementById('outreachBrochureLinkLabelContainer');
    const studioBrochureLinkLabel = document.getElementById('studioBrochureLinkLabel');

    function updateComposedTextWithBrochure() {
        if (!textarea) return;

        let text = textarea.value;
        // Strip any existing links (both raw and with custom label prefix) to keep pitch text clean
        const brochureRegex = /(?:\n\n📄\s*[^\n]+:\s*\n)?(?:https?:\/\/[^\s]+|#\/d\/[^\s]+)/gi;
        text = text.replace(brochureRegex, '');

        if (window._attachBrochureEnabled && window._includeBrochureLink && window._selectedBrochureId) {
            const doc = (window._userDocuments || []).find(d => d.id === window._selectedBrochureId);
            const defaultDocName = doc ? doc.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ") : "Business Portfolio";
            const label = window._brochureLinkLabel || defaultDocName;
            const code = doc?.slug || window._selectedBrochureId;
            const shortUrl = `${window.location.origin}${window.location.pathname}#/d/${code}`;
            text += `\n\n📄 ${label}:\n${shortUrl}`;
        }

        textarea.value = text;
        
        // Sync back to cache
        if (window._generatedSequence && window._generatedSequence[window._activeStudioTab]) {
            window._generatedSequence[window._activeStudioTab].message = text;
        }
    }

    // Default initialize selected ID
    if (!window._selectedBrochureId && window._userDocuments && window._userDocuments.length > 0) {
        window._selectedBrochureId = window._userDocuments[0].id;
        const doc = window._userDocuments.find(d => d.id === window._selectedBrochureId);
        window._selectedBrochureUrl = doc ? doc.file_url : '';
    }

    if (brochureToggle) {
        brochureToggle.addEventListener('change', () => {
            window._attachBrochureEnabled = brochureToggle.checked;
            if (brochureSelectContainer) {
                brochureSelectContainer.style.display = window._attachBrochureEnabled ? 'block' : 'none';
            }
            if (window._attachBrochureEnabled && brochureDropdown) {
                window._selectedBrochureId = brochureDropdown.value;
                const doc = (window._userDocuments || []).find(d => d.id === window._selectedBrochureId);
                window._selectedBrochureUrl = doc ? doc.file_url : '';
            }
            updateComposedTextWithBrochure();
        });
    }

    if (brochureDropdown) {
        brochureDropdown.addEventListener('change', () => {
            window._selectedBrochureId = brochureDropdown.value;
            const doc = (window._userDocuments || []).find(d => d.id === window._selectedBrochureId);
            window._selectedBrochureUrl = doc ? doc.file_url : '';
            
            // Format new default filename label
            const defaultDocName = doc ? doc.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ") : "Business Portfolio";
            if (!window._brochureLinkLabel && studioBrochureLinkLabel) {
                studioBrochureLinkLabel.value = defaultDocName;
                studioBrochureLinkLabel.placeholder = `e.g. ${defaultDocName}`;
            }
            updateComposedTextWithBrochure();
        });
    }

    const studioBrochureIncludeLink = document.getElementById('studioBrochureIncludeLink');
    if (studioBrochureIncludeLink) {
        studioBrochureIncludeLink.addEventListener('change', () => {
            window._includeBrochureLink = studioBrochureIncludeLink.checked;
            if (outreachBrochureLinkLabelContainer) {
                outreachBrochureLinkLabelContainer.style.display = window._includeBrochureLink ? 'block' : 'none';
            }
            updateComposedTextWithBrochure();
        });
    }

    if (studioBrochureLinkLabel) {
        studioBrochureLinkLabel.addEventListener('input', () => {
            window._brochureLinkLabel = studioBrochureLinkLabel.value;
            updateComposedTextWithBrochure();
        });
    }

    const studioDownloadBrochureBtn = document.getElementById('studioDownloadBrochureBtn');
    if (studioDownloadBrochureBtn) {
        studioDownloadBrochureBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window._selectedBrochureUrl) {
                const link = document.createElement('a');
                link.href = window._selectedBrochureUrl;
                link.target = '_blank';
                link.download = window._selectedBrochureUrl.split('/').pop() || 'Brochure.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert("Please select a brochure to download");
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
            
            // Trigger quick WA open
            Api.supabase
                .from('saved_leads')
                .select('*, professionals(*)')
                .eq('professional_id', activeLeadId)
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
            
            Api.supabase
                .from('saved_leads')
                .select('*, professionals(*)')
                .eq('professional_id', activeLeadId)
                .single()
                .then(({ data }) => {
                    const email = data?.professionals?.email;
                    if (!email) {
                        alert("No email address configured for this business listing");
                        return;
                    }
                    
                    // Use currently chosen or generated email subject line
                    const subject = window._selectedSubject || `Website audit for ${data?.professionals?.name || 'your business'}`;
                    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`, '_blank');
                });
        });
    }

    // Mark as Contacted
    const markBtn = document.getElementById('markOutreachContactedBtn');
    if (markBtn) {
        markBtn.addEventListener('click', async () => {
            const mainText = document.getElementById('composerMainText').value;

            try {
                // Find saved lead ID first
                const { data } = await Api.supabase
                    .from('saved_leads')
                    .select('id')
                    .eq('professional_id', activeLeadId)
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
