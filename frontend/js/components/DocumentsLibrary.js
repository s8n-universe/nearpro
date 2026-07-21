import { State } from '../state.js';
import { Api } from '../api.js';

export function renderDocumentsLibrary(documentsList = [], loading = false) {
    const userTier = (State.profile?.subscription_tier || State.profile?.tier || 'free').toLowerCase();
    
    // Upload capacity mapping by subscription tier
    let limit = 0;
    let tierLabel = 'Explorer';
    if (userTier === 'scout') { limit = 4; tierLabel = 'Scout'; }
    else if (userTier === 'hunter') { limit = 8; tierLabel = 'Hunter'; }
    else if (userTier === 'agency') { limit = 12; tierLabel = 'Agency'; }
    else if (userTier === 'enterprise') { limit = 50; tierLabel = 'Enterprise'; }

    const used = documentsList.length;
    const isAtLimit = used >= limit;
    const capacityPct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

    // Build enterprise list of document rows
    const fileItemsHTML = documentsList.map(doc => {
        const uploadDate = new Date(doc.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        // Format file size
        const sizeKB = doc.file_size / 1024;
        const sizeLabel = sizeKB > 1024 
            ? `${(sizeKB / 1024).toFixed(1)} MB` 
            : `${Math.round(sizeKB)} KB`;

        const publicUrl = `${window.location.origin}${window.location.pathname}#/d/${doc.slug || doc.id}`;

        return `
            <div class="document-row-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px; box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.04); transition: all 0.2s ease; flex-wrap: wrap;">
                
                <!-- Left: File Metadata -->
                <div style="display: flex; align-items: center; gap: 16px; min-width: 240px; flex: 1;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 800; font-size: 12px; font-family: var(--font-mono);">
                        PDF
                    </div>
                    
                    <div style="min-width: 0; flex: 1;">
                        <h5 style="margin: 0 0 4px 0; color: #0f172a; font-size: 14.5px; font-weight: 700; font-family: var(--font-heading); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${doc.name}
                        </h5>
                        <div style="display: flex; align-items: center; gap: 10px; font-size: 12px; color: #64748b; font-family: var(--font-mono);">
                            <span style="font-weight: 600; color: #334155;">${sizeLabel}</span>
                            <span>•</span>
                            <span>Uploaded ${uploadDate}</span>
                        </div>
                    </div>
                </div>

                <!-- Center: Branded Short Link Slug Customizer -->
                <div style="display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 12px; flex-shrink: 0;">
                    <span style="font-size: 11px; color: #64748b; font-family: var(--font-mono); font-weight: 700;">SHORTNAME:</span>
                    <span style="font-size: 12px; color: #2563eb; font-family: var(--font-mono); font-weight: 700;">#/d/</span>
                    <input type="text" class="doc-slug-input" data-id="${doc.id}" placeholder="my_slug" value="${doc.slug || ''}" style="width: 120px; padding: 6px 10px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 12px; outline: none; font-family: var(--font-mono); font-weight: 600;">
                    <button class="secondary-btn save-doc-slug-btn" data-id="${doc.id}" style="padding: 6px 10px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 11.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Save Custom Slug">
                        <i data-lucide="check" style="width: 12px; height: 12px;"></i> Save
                    </button>
                </div>

                <!-- Right: Action Buttons -->
                <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                    <button class="copy-doc-link-btn" data-url="${publicUrl}" style="background: #2563eb; color: white; border: none; padding: 8px 16px; font-size: 12.5px; font-weight: 700; border-radius: 6px; display: flex; align-items: center; gap: 6px; cursor: pointer; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);" title="Copy Public Short Link">
                        <i data-lucide="copy" style="width: 13px; height: 13px;"></i> Copy Link
                    </button>

                    <button class="delete-doc-btn" data-id="${doc.id}" data-path="${doc.file_path}" style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 8px 14px; font-size: 12.5px; font-weight: 700; border-radius: 6px; display: flex; align-items: center; gap: 6px; cursor: pointer;" title="Delete Document">
                        <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i> Delete
                    </button>
                </div>

            </div>
        `;
    }).join('');

    const emptyHTML = documentsList.length === 0 ? `
        <div style="padding: 60px 24px; text-align: center; color: #64748b; border: 1px dashed #cbd5e1; border-radius: 12px; background: #ffffff;">
            <div style="margin-bottom: 12px; display: flex; justify-content: center;">
                <i data-lucide="folder-open" style="width: 40px; height: 40px; color: #94a3b8; stroke-width: 1.5px;"></i>
            </div>
            <h4 style="margin: 0 0 6px 0; color: #0f172a; font-family: var(--font-heading); font-weight: 700;">No Documents Uploaded</h4>
            <p style="margin: 0; font-size: 13.5px; color: #475569;">Upload your business PDFs, pamphlets, or catalogs to attach them in outreach campaigns.</p>
        </div>
    ` : '';

    return `
        <div class="documents-library-workspace-container" style="padding: 32px; background: #f8fafc; color: #0f172a; border-radius: var(--radius-lg); border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div class="documents-library-workspace" style="display: flex; flex-direction: column; gap: 24px;">
                
                <!-- Header capacity widget -->
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; justify-content: space-between; align-items: center; gap: 32px; flex-wrap: wrap; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <div style="flex: 1; min-width: 250px;">
                        <h3 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #0f172a; font-family: var(--font-heading);">Brochures & Collateral Storage</h3>
                        <p style="margin: 0; font-size: 13.5px; color: #475569; line-height: 1.5;">
                            Upload marketing PDFs and catalogs. Your attachments will be securely hosted online for quick selection inside WhatsApp and Email templates.
                        </p>
                    </div>
                    <div style="width: 220px; flex-shrink: 0; display: flex; flex-direction: column; gap: 6px;">
                        <div style="display: flex; justify-content: space-between; font-size: 12.5px; font-family: var(--font-mono);">
                            <span style="color: #475569;">Storage capacity:</span>
                            <strong style="color: #2563eb;">${used} / ${limit} files</strong>
                        </div>
                        <div style="width: 100%; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; border: 1px solid #cbd5e1;">
                            <div style="width: ${capacityPct}%; height: 100%; background: linear-gradient(90deg, #2563eb, #60a5fa); border-radius: 4px; transition: width 0.3s ease;"></div>
                        </div>
                        <span style="font-size: 11px; color: #64748b; text-align: right; text-transform: uppercase; font-family: var(--font-mono); font-weight: 700;">
                            ${tierLabel} Allocation
                        </span>
                    </div>
                </div>

                <!-- Usability Banner -->
                <div class="usability-banner" style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; border-radius: 8px; padding: 14px 20px; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <div style="font-size: 13px; color: #0f172a; line-height: 1.4; font-weight: 700;"><span style="color: #2563eb; font-weight: 800;">What it is:</span> Store and manage PDF brochures, catalogs, and marketing pamphlets.</div>
                    <div style="font-size: 12.5px; color: #475569; line-height: 1.4;"><span style="color: #2563eb; font-weight: 800;">How to leverage:</span> Attach public PDF links directly in WhatsApp and email pitches to boost proposal conversion rates.</div>
                </div>

                <!-- Upload Dropzone -->
                <div id="documentUploadDropzone" class="${isAtLimit ? 'disabled' : ''}" style="background: #ffffff; border: 2px dashed ${isAtLimit ? '#cbd5e1' : '#2563eb'}; opacity: ${isAtLimit ? '0.5' : '1'}; border-radius: 12px; padding: 36px 24px; text-align: center; cursor: ${isAtLimit ? 'not-allowed' : 'pointer'}; position: relative; transition: background 0.2s; box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.03);">
                    <input type="file" id="docFileInput" accept="application/pdf" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: inherit;" ${isAtLimit ? 'disabled' : ''}>
                    <div style="margin-bottom: 12px; display: flex; justify-content: center;">
                        <i data-lucide="upload-cloud" style="width: 36px; height: 36px; color: #2563eb; stroke-width: 1.5px;"></i>
                    </div>
                    <h4 style="margin: 0 0 6px 0; color: #0f172a; font-family: var(--font-heading); font-weight: 700;">
                        ${isAtLimit ? 'Upload Limit Reached' : 'Upload PDF Brochure'}
                    </h4>
                    <p style="margin: 0; font-size: 13px; color: #475569; max-width: 400px; margin: 0 auto; line-height: 1.4;">
                        ${isAtLimit 
                            ? 'Delete an existing file or upgrade your subscription plan to expand your brochure catalog.' 
                            : 'Drag & drop your brochure PDF here, or click to browse. Max file size: 5MB.'}
                    </p>
                    
                    <!-- Loading overlay -->
                    <div id="uploadLoader" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.92); border-radius: 12px; align-items: center; justify-content: center; flex-direction: column; gap: 12px; z-index: 10;">
                        <div class="spinner" style="width: 32px; height: 32px; border-width: 3px; border-top-color: #2563eb;"></div>
                        <span style="font-size: 13px; color: #2563eb; font-family: var(--font-mono); font-weight: 700;">Uploading brochure to Supabase...</span>
                    </div>
                </div>

                <!-- List Grid / Enterprise Row View -->
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h4 style="margin: 0; font-size: 12px; font-family: var(--font-mono); color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">
                            Your Document Library (${documentsList.length})
                        </h4>
                    </div>

                    <div class="documents-list-container" style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
                        ${fileItemsHTML}
                        ${emptyHTML}
                    </div>
                </div>

            </div>
        </div>
    `;
}

export function bindDocumentsLibraryEvents(onUploadStart, onUploadSuccess, onUploadError, onDeleteSuccess) {
    if (window.refreshLucideIcons) window.refreshLucideIcons();

    const fileInput = document.getElementById('docFileInput');
    const dropzone = document.getElementById('documentUploadDropzone');
    const loader = document.getElementById('uploadLoader');

    if (fileInput && dropzone) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.type !== 'application/pdf') {
                if (window.showToast) window.showToast("Only PDF documents are allowed", "error");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                if (window.showToast) window.showToast("File size exceeds 5MB limit", "error");
                return;
            }

            if (loader) loader.style.display = 'flex';
            if (onUploadStart) onUploadStart();

            try {
                const result = await Api.uploadDocument(file);
                if (loader) loader.style.display = 'none';
                if (window.showToast) window.showToast("✨ Brochure uploaded successfully!", "success");
                if (onUploadSuccess) onUploadSuccess(result);
            } catch (err) {
                if (loader) loader.style.display = 'none';
                console.error("Upload error:", err);
                if (window.showToast) window.showToast(`Upload failed: ${err.message}`, "error");
                if (onUploadError) onUploadError(err);
            }
        });
    }

    // Bind copy link buttons
    const copyBtns = document.querySelectorAll('.copy-doc-link-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.dataset.url;
            navigator.clipboard.writeText(url).then(() => {
                if (window.showToast) window.showToast("📋 Public Short Link copied to clipboard!", "success");
            });
        });
    });

    // Bind enter key press on slug inputs
    const slugInputs = document.querySelectorAll('.doc-slug-input');
    slugInputs.forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const id = input.dataset.id;
                const saveBtn = document.querySelector(`.save-doc-slug-btn[data-id="${id}"]`);
                if (saveBtn) saveBtn.click();
            }
        });
    });

    // Bind save slug buttons
    const saveSlugBtns = document.querySelectorAll('.save-doc-slug-btn');
    saveSlugBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const input = document.querySelector(`.doc-slug-input[data-id="${id}"]`);
            if (!input) return;
            const rawSlug = input.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
            
            btn.disabled = true;
            try {
                await Api.supabase
                    .from('documents')
                    .update({ slug: rawSlug || null })
                    .eq('id', id);

                if (window.showToast) window.showToast(`✨ Custom slug updated to: ${rawSlug || id}`, "success");
                
                // Update copy button dataset URL
                const copyBtn = document.querySelector(`.copy-doc-link-btn[data-id="${id}"]`);
                if (copyBtn) {
                    copyBtn.dataset.url = `${window.location.origin}${window.location.pathname}#/d/${rawSlug || id}`;
                }
            } catch (err) {
                console.error("Failed to update slug:", err);
                if (window.showToast) window.showToast(`Failed to update shortlink: ${err.message}`, "error");
            } finally {
                btn.disabled = false;
            }
        });
    });

    // Bind delete buttons
    const deleteBtns = document.querySelectorAll('.delete-doc-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const filePath = btn.dataset.path;
            
            if (!confirm("Are you sure you want to delete this document brochure?")) return;

            btn.disabled = true;
            try {
                await Api.deleteDocument(id, filePath);
                if (window.showToast) window.showToast("Document deleted.", "info");
                if (onDeleteSuccess) onDeleteSuccess(id);
            } catch (err) {
                btn.disabled = false;
                console.error("Delete document failed:", err);
                if (window.showToast) window.showToast(`Delete failed: ${err.message}`, "error");
            }
        });
    });
}
