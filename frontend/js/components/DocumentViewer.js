import { Api } from '../api.js';

export async function renderDocumentViewerLayout(docId) {
    const appShell = document.getElementById('app');
    if (!appShell) return;

    // 1. Show a premium loading state
    appShell.innerHTML = `
        <div style="min-height: 100vh; background: var(--bg-base); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: var(--font-body);">
            <div class="logo-loader-container" style="margin-bottom: 16px; display: flex; align-items: center; justify-content: center;">
                <div class="spinner" style="width: 40px; height: 40px; border: 3px solid var(--border); border-top: 3px solid var(--accent-gold); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
            <p style="color: var(--text-secondary); font-size: 14px; font-family: var(--font-mono);">Securing document connection...</p>
        </div>
    `;

    try {
        // 2. Fetch document record by ID or unique Slug using public select
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(docId);
        let query = Api.supabase.from('documents').select('*');
        if (isUUID) {
            query = query.eq('id', docId);
        } else {
            query = query.eq('slug', docId);
        }
        
        let data = null;
        try {
            const res = await query.maybeSingle();
            data = res.data;
        } catch (_) {}

        if (!data) {
            // Render modern interactive Concept Prototype Preview page for generated/demo links
            appShell.innerHTML = `
                <div style="min-height: 100vh; background: var(--bg-base); color: white; font-family: var(--font-body); display: flex; flex-direction: column;">
                    <header style="height: 60px; background: rgba(10, 10, 12, 0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <a href="#/" style="display: flex; align-items: center;">
                                <img src="/NearPro_logo_nobg.png" alt="NearPro" style="height: 26px;">
                            </a>
                            <span style="width: 1px; height: 16px; background: var(--border);"></span>
                            <span style="font-size: 13px; color: var(--text-muted); font-family: var(--font-heading);">Concept Prototype Viewer</span>
                        </div>
                        <a href="#/" class="brand-btn" style="padding: 8px 16px; font-size: 12.5px; border-radius: var(--radius-sm); text-decoration: none; font-weight: 600;">
                            Claim Demo Access ↗
                        </a>
                    </header>
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center;">
                        <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 99px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); color: #10b981; font-size: 12px; font-weight: 600; margin-bottom: 24px; font-family: var(--font-mono);">
                            ⚡ Live Concept Prototype Activated
                        </div>
                        <h1 style="font-size: 32px; font-weight: 700; margin: 0 0 12px 0; font-family: var(--font-heading); background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            Tailored High-Converting Concept Layout
                        </h1>
                        <p style="color: var(--text-secondary); max-width: 560px; font-size: 14.5px; line-height: 1.6; margin: 0 0 32px 0;">
                            This is an interactive digital architecture concept generated for local business growth. It includes instant 1-click booking triggers, mobile speed optimization, and verified local SEO schema.
                        </p>
                        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; width: 100%; max-width: 620px; text-align: left; margin-bottom: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                            <div style="font-size: 11.5px; color: var(--accent-gold); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; font-family: var(--font-mono);">Optimization Features</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13px;">
                                <div style="background: rgba(255,255,255,0.02); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.05);">
                                    <div style="font-weight: 600; color: white; margin-bottom: 4px;">🚀 Speed & Conversion</div>
                                    <div style="color: var(--text-muted); font-size: 12px;">Sub-second mobile loading & high CTA clarity.</div>
                                </div>
                                <div style="background: rgba(255,255,255,0.02); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.05);">
                                    <div style="font-weight: 600; color: white; margin-bottom: 4px;">💬 Instant WhatsApp</div>
                                    <div style="color: var(--text-muted); font-size: 12px;">1-tap direct messaging & appointment booking.</div>
                                </div>
                            </div>
                        </div>
                        <a href="#/" class="secondary-btn" style="padding: 10px 24px; font-size: 13px; text-decoration: none; border-radius: var(--radius-sm);">
                            Back to Agency Dashboard
                        </a>
                    </div>
                </div>
            `;
            if (window.refreshLucideIcons) window.refreshLucideIcons();
            return;
        }

        // 3. Detect file type & choose hybrid rendering engine
        const fileUrl = data.file_url || '';
        const isPdf = fileUrl.toLowerCase().includes('.pdf') || fileUrl.includes('application/pdf') || (data.file_type && data.file_type.includes('pdf'));
        const isImage = /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(fileUrl);
        
        const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
        const initialEmbedUrl = isPdf ? googleDocsViewerUrl : fileUrl;
        const fileExt = isPdf ? 'PDF' : isImage ? 'IMAGE' : (data.file_type || 'DOC').toUpperCase();
        const formattedDate = data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

        // 4. Render ultra-premium feature-rich PDF Viewer
        appShell.innerHTML = `
            <div style="height: 100vh; display: flex; flex-direction: column; background: #0b0c10; font-family: var(--font-body); overflow: hidden;">
                <!-- Header / Topbar -->
                <header style="height: 64px; background: rgba(12, 13, 18, 0.98); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; flex-shrink: 0; z-index: 100;">
                    <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                        <a href="#/" style="display: flex; align-items: center; text-decoration: none;">
                            <img src="/NearPro_logo_nobg.png" alt="NearPro" style="height: 26px; width: auto;">
                        </a>
                        <span style="width: 1px; height: 18px; background: var(--border); flex-shrink: 0;"></span>
                        <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                            <span style="padding: 2px 7px; border-radius: 4px; background: rgba(217, 119, 6, 0.15); border: 1px solid rgba(217, 119, 6, 0.3); color: var(--accent-gold); font-size: 10.5px; font-weight: 700; font-family: var(--font-mono); flex-shrink: 0;">${fileExt}</span>
                            <h2 style="font-size: 14px; color: white; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0; font-family: var(--font-heading);" title="${data.name}">
                                ${data.name}
                            </h2>
                        </div>
                    </div>
                    
                    <!-- Action Toolbar -->
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button id="docCopyLinkBtn" class="secondary-btn" style="padding: 7px 12px; font-size: 12px; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px; cursor: pointer;" title="Copy share link">
                            <i data-lucide="link" style="width: 14px; height: 14px;"></i>
                            <span class="desktop-only-inline">Copy Link</span>
                        </button>

                        <button id="docFullscreenBtn" class="secondary-btn" style="padding: 7px 12px; font-size: 12px; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px; cursor: pointer;" title="Toggle Fullscreen">
                            <i data-lucide="maximize-2" style="width: 14px; height: 14px;"></i>
                            <span class="desktop-only-inline">Fullscreen</span>
                        </button>

                        <a href="${fileUrl}" target="_blank" class="secondary-btn" style="padding: 7px 12px; font-size: 12px; border-radius: var(--radius-sm); text-decoration: none; display: flex; align-items: center; gap: 6px;" title="Open in new tab">
                            <i data-lucide="external-link" style="width: 14px; height: 14px;"></i>
                            <span class="desktop-only-inline">Open ↗</span>
                        </a>

                        <a href="${fileUrl}" download="${data.name}" target="_blank" class="brand-btn" style="padding: 7px 16px; font-size: 12.5px; border-radius: var(--radius-sm); text-decoration: none; display: flex; align-items: center; gap: 6px; font-weight: 600;">
                            <i data-lucide="download" style="width: 14px; height: 14px;"></i> Download PDF
                        </a>
                    </div>
                </header>

                <!-- Sub-bar Meta Info -->
                <div style="height: 34px; background: rgba(18, 20, 28, 0.9); border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; font-size: 11.5px; color: var(--text-muted); font-family: var(--font-mono); flex-shrink: 0;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <span>🔒 256-Bit SSL Encrypted Link</span>
                        ${formattedDate ? `<span>• Created ${formattedDate}</span>` : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <button id="toggleViewerEngineBtn" style="background: none; border: none; color: var(--accent-gold); font-size: 11px; cursor: pointer; text-decoration: underline; font-family: var(--font-mono);">
                            ⚡ Switch Viewer Engine
                        </button>
                    </div>
                </div>

                <!-- Main Document View Area -->
                <div id="pdfViewerMainContainer" style="flex: 1; width: 100%; height: calc(100vh - 98px); position: relative; background: #121318; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    ${isImage ? `
                        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 24px;">
                            <img src="${fileUrl}" alt="${data.name}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: var(--radius-md); box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
                        </div>
                    ` : `
                        <iframe id="pdfDocIframe" src="${initialEmbedUrl}" style="width: 100%; height: 100%; border: none;" title="${data.name}"></iframe>
                    `}
                </div>
            </div>
        `;

        // Refresh icons
        if (window.refreshLucideIcons) {
            window.refreshLucideIcons();
        }

        // Bind Toolbar Event Listeners
        const copyBtn = document.getElementById('docCopyLinkBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const currentUrl = window.location.href;
                navigator.clipboard.writeText(currentUrl).then(() => {
                    if (window.showToast) {
                        window.showToast("🔗 Document link copied to clipboard!", "success");
                    } else {
                        alert("Link copied to clipboard!");
                    }
                }).catch(() => {
                    alert("Copy URL: " + currentUrl);
                });
            });
        }

        const fullscreenBtn = document.getElementById('docFullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                const container = document.getElementById('pdfViewerMainContainer') || document.documentElement;
                if (!document.fullscreenElement) {
                    if (container.requestFullscreen) container.requestFullscreen();
                    else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
                } else {
                    if (document.exitFullscreen) document.exitFullscreen();
                }
            });
        }

        const toggleEngineBtn = document.getElementById('toggleViewerEngineBtn');
        if (toggleEngineBtn) {
            let useDirect = false;
            toggleEngineBtn.addEventListener('click', () => {
                const iframe = document.getElementById('pdfDocIframe');
                if (!iframe) return;
                useDirect = !useDirect;
                if (useDirect) {
                    iframe.src = fileUrl;
                    toggleEngineBtn.innerText = "⚡ Switch to Google Docs Engine";
                } else {
                    iframe.src = googleDocsViewerUrl;
                    toggleEngineBtn.innerText = "⚡ Switch to Direct Native Engine";
                }
            });
        }

    } catch (err) {
        console.error("Document viewer error: ", err);
        appShell.innerHTML = `
            <div style="min-height: 100vh; background: var(--bg-base); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: var(--font-body); padding: 24px; text-align: center;">
                <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <i data-lucide="alert-circle" style="width: 24px; height: 24px;"></i>
                </div>
                <h3 style="font-size: 18px; margin: 0 0 8px 0; font-family: var(--font-heading);">Document Link Inactive</h3>
                <p style="color: var(--text-muted); font-size: 13.5px; max-width: 320px; margin-bottom: 24px;">
                    This document may have been deleted by the owner or the link has expired.
                </p>
                <a href="#/" class="secondary-btn" style="text-decoration: none; padding: 10px 20px; font-size: 13px; border-radius: var(--radius-sm);">
                    Go to Homepage
                </a>
            </div>
        `;
        if (window.refreshLucideIcons) {
            window.refreshLucideIcons();
        }
    }
}
