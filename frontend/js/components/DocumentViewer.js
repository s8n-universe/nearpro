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
        
        const { data, error } = await query.single();

        if (error || !data) {
            throw new Error(error?.message || "Document not found");
        }

        // 3. Detect mobile vs desktop to choose best PDF preview strategy
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const embedUrl = isMobile 
            ? `https://docs.google.com/viewer?url=${encodeURIComponent(data.file_url)}&embedded=true`
            : data.file_url;

        // 4. Render the premium viewer page
        appShell.innerHTML = `
            <div style="height: 100vh; display: flex; flex-direction: column; background: var(--bg-base); font-family: var(--font-body); overflow: hidden;">
                <!-- Header / Topbar -->
                <header style="height: 60px; background: rgba(10, 10, 12, 0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; z-index: 100;">
                    <div style="display: flex; align-items: center; gap: 14px; min-width: 0;">
                        <a href="#/" style="display: flex; align-items: center; gap: 8px;">
                            <img src="/NearPro_logo_nobg.png" alt="NearPro" style="height: 28px; width: auto;">
                        </a>
                        <span style="width: 1px; height: 20px; background: var(--border); flex-shrink: 0;"></span>
                        <h2 style="font-size: 14px; color: white; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0; font-family: var(--font-heading);">
                            ${data.name}
                        </h2>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <a href="${data.file_url}" target="_blank" class="brand-btn" style="padding: 8px 16px; font-size: 12.5px; border-radius: var(--radius-sm); text-decoration: none; display: flex; align-items: center; gap: 6px; font-weight: 600;">
                            <i data-lucide="download" style="width: 14px; height: 14px;"></i> Download PDF
                        </a>
                    </div>
                </header>

                <!-- Embedded PDF Viewer Content -->
                <div style="flex: 1; width: 100%; height: calc(100vh - 60px); position: relative; background: #141416;">
                    <iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none;" title="${data.name}"></iframe>
                </div>
            </div>
        `;

        // Refresh icons
        if (window.refreshLucideIcons) {
            window.refreshLucideIcons();
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
