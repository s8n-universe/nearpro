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

    // Build the grid list of files
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

        return `
            <div class="document-card" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; display: flex; align-items: center; gap: 16px; transition: all 0.2s ease;">
                <div style="flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-sm); background: rgba(255,255,255,0.02); border: 1px solid var(--border);">
                    <i data-lucide="file-text" style="width: 20px; height: 20px; color: var(--text-secondary); stroke-width: 2px;"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <h5 style="margin: 0 0 4px 0; color: white; font-size: 13.5px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${doc.name}
                    </h5>
                    <div style="display: flex; gap: 12px; font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
                        <span>${sizeLabel}</span>
                        <span>•</span>
                        <span>Uploaded ${uploadDate}</span>
                    </div>
                </div>
                <!-- Branded Short URL Slug Customizer -->
                <div style="display: flex; flex-direction: column; gap: 4px; margin-right: 8px;">
                    <span style="font-size: 9px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase;">Short link name:</span>
                    <div style="display: flex; gap: 4px; align-items: center;">
                        <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">#/d/</span>
                        <input type="text" class="doc-slug-input" data-id="${doc.id}" placeholder="e.g. vinayak" value="${doc.slug || ''}" style="width: 110px; padding: 4px 8px; background: rgba(0,0,0,0.25); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 11.5px; outline: none; font-family: var(--font-mono);">
                        <button class="secondary-btn save-doc-slug-btn" data-id="${doc.id}" style="padding: 4px; display: flex; align-items: center; justify-content: center; height: 26px; width: 26px; border-radius: var(--radius-sm);" title="Save custom shortname">
                            <i data-lucide="save" style="width: 12px; height: 12px;"></i>
                        </button>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="secondary-btn copy-doc-link-btn" data-url="${window.location.origin}${window.location.pathname}#/d/${doc.slug || doc.id}" style="padding: 8px 12px; font-size: 12px; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 6px;" title="Copy branded short link">
                        <i data-lucide="link" style="width: 13px; height: 13px;"></i> Copy Link
                    </button>
                    <button class="secondary-btn delete-doc-btn" data-id="${doc.id}" data-path="${doc.file_path}" style="padding: 8px 12px; font-size: 12px; border-radius: var(--radius-sm); border-color: rgba(239, 68, 68, 0.2); color: #ef4444; background: rgba(239, 68, 68, 0.05); display: flex; align-items: center; gap: 6px;" title="Delete brochure">
                        <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');

    const emptyHTML = documentsList.length === 0 ? `
        <div style="grid-column: 1 / -1; padding: 60px 24px; text-align: center; color: var(--text-muted); border: 1px dashed var(--border); border-radius: var(--radius-md); background: rgba(0,0,0,0.15);">
            <div style="margin-bottom: 12px; display: flex; justify-content: center;">
                <i data-lucide="folder-open" style="width: 40px; height: 40px; color: var(--text-muted); stroke-width: 1.5px;"></i>
            </div>
            <h4 style="margin: 0 0 6px 0; color: white; font-family: var(--font-heading);">No Documents Uploaded</h4>
            <p style="margin: 0; font-size: 13px;">Upload your business PDFs, pamphlets, or catalogs to attach them in outreach campaigns.</p>
        </div>
    ` : '';

    return `
        <div class="documents-library-workspace" style="display: flex; flex-direction: column; gap: 28px; height: 100%;">
            
            <!-- Header capacity widget -->
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 32px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px;">
                    <h3 style="margin: 0 0 6px 0; font-size: 16px; color: white; font-family: var(--font-heading);">Brochures & Collateral Storage</h3>
                    <p style="margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
                        Upload marketing PDFs and catalogs. Your attachments will be securely hosted online for quick selection inside WhatsApp and Email templates.
                    </p>
                </div>
                <div style="width: 220px; flex-shrink: 0; display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono);">
                        <span style="color: var(--text-secondary);">Storage capacity:</span>
                        <strong style="color: var(--accent-gold);">${used} / ${limit} files</strong>
                    </div>
                    <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; border: 1px solid var(--border);">
                        <div style="width: ${capacityPct}%; height: 100%; background: linear-gradient(90deg, var(--accent-gold), #fbbf24); border-radius: 4px; transition: width 0.3s ease;"></div>
                    </div>
                    <span style="font-size: 10.5px; color: var(--text-muted); text-align: right; text-transform: uppercase; font-family: var(--font-mono);">
                        ${tierLabel} Allocation
                    </span>
                </div>
            </div>

            <!-- Usability Banner -->
            <div class="usability-banner" style="background: rgba(255, 160, 0, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 18px; margin-bottom: 4px; display: flex; flex-direction: column; gap: 4px; border-left: 3px solid var(--accent-gold);">
                <div style="font-size: 12.5px; color: white; line-height: 1.4;"><span style="color: var(--accent-gold); font-weight: 600;">What it is:</span> Store and manage PDF brochures, catalogs, and marketing pamphlets.</div>
                <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;"><span style="color: var(--accent-gold); font-weight: 600;">How to leverage:</span> Attach public PDF links directly in WhatsApp and email pitches to boost proposal conversion rates.</div>
            </div>

            <!-- Upload Dropzone -->
            <div id="documentUploadDropzone" class="${isAtLimit ? 'disabled' : ''}" style="background: rgba(255, 160, 0, 0.02); border: 2px dashed ${isAtLimit ? 'var(--border)' : 'var(--accent-gold)'}; opacity: ${isAtLimit ? '0.5' : '1'}; border-radius: var(--radius-md); padding: 40px 24px; text-align: center; cursor: ${isAtLimit ? 'not-allowed' : 'pointer'}; position: relative; transition: background 0.2s;">
                <input type="file" id="docFileInput" accept="application/pdf" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: inherit;" ${isAtLimit ? 'disabled' : ''}>
                <div style="margin-bottom: 12px; display: flex; justify-content: center;">
                    <i data-lucide="upload-cloud" style="width: 40px; height: 40px; color: var(--accent-gold); stroke-width: 1.5px;"></i>
                </div>
                <h4 style="margin: 0 0 6px 0; color: white; font-family: var(--font-heading);">
                    ${isAtLimit ? 'Upload Limit Reached' : 'Upload PDF Brochure'}
                </h4>
                <p style="margin: 0; font-size: 13px; color: var(--text-secondary); max-width: 400px; margin: 0 auto; line-height: 1.4;">
                    ${isAtLimit 
                        ? 'Delete an existing file or upgrade your subscription plan to expand your brochure catalog.' 
                        : 'Drag & drop your brochure PDF here, or click to browse. Max file size: 5MB.'}
                </p>
                
                <!-- Loading overlay -->
                <div id="uploadLoader" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); border-radius: var(--radius-md); align-items: center; justify-content: center; flex-direction: column; gap: 12px; z-index: 10;">
                    <div class="spinner" style="width: 32px; height: 32px; border-width: 3px;"></div>
                    <span style="font-size: 13px; color: var(--accent-gold); font-family: var(--font-mono);">Uploading brochure to Supabase...</span>
                </div>
            </div>

            <!-- List Grid -->
            <div style="flex: 1;">
                <h4 style="margin: 0 0 16px 0; font-size: 13px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Your Document Library</h4>
                <div class="documents-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;">
                    ${fileItemsHTML}
                    ${emptyHTML}
                </div>
            </div>

        </div>
    `;
}

export function bindDocumentsLibraryEvents(onUploadStart, onUploadSuccess, onUploadError, onDeleteSuccess) {
    // Process Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const fileInput = document.getElementById('docFileInput');
    const dropzone = document.getElementById('documentUploadDropzone');
    const loader = document.getElementById('uploadLoader');

    if (fileInput && dropzone) {
        // Drag Over highlight effects
        fileInput.addEventListener('dragenter', () => {
            dropzone.style.background = 'rgba(255, 160, 0, 0.06)';
            dropzone.style.borderColor = 'white';
        });
        
        fileInput.addEventListener('dragleave', () => {
            dropzone.style.background = 'rgba(255, 160, 0, 0.02)';
            dropzone.style.borderColor = 'var(--accent-gold)';
        });

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate PDF format
            if (file.type !== 'application/pdf') {
                alert("Only PDF brochure files are allowed.");
                return;
            }

            // Validate file size limit (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds the 5MB limit.");
                return;
            }

            // Start upload loaders
            if (loader) loader.style.display = 'flex';
            if (onUploadStart) onUploadStart();

            try {
                const name = file.name.replace('.pdf', '');
                const result = await Api.uploadDocument(file, name);
                
                if (loader) loader.style.display = 'none';
                if (onUploadSuccess) onUploadSuccess(result);
            } catch (err) {
                if (loader) loader.style.display = 'none';
                console.error("Brochure upload failed:", err);
                alert(err.message || "Failed to upload brochure to Supabase storage. Please try again.");
                if (onUploadError) onUploadError(err);
            }
        });
    }

    // Bind link copy buttons
    document.querySelectorAll('.copy-doc-link-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            navigator.clipboard.writeText(url).then(() => {
                const originalText = btn.innerHTML;
                btn.innerHTML = '✓ Copied!';
                btn.style.color = 'var(--accent-gold)';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.color = '';
                }, 2000);
            });
        });
    });

    // Bind deletion actions
    document.querySelectorAll('.delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            const path = btn.getAttribute('data-path');

            const confirmDelete = confirm("Are you sure you want to permanently delete this brochure collateral?");
            if (!confirmDelete) return;

            btn.innerText = 'Deleting...';
            btn.disabled = true;

            try {
                await Api.deleteDocument(id, path);
                if (onDeleteSuccess) onDeleteSuccess(id);
            } catch (err) {
                btn.innerHTML = '<i data-lucide="trash-2" style="width: 13px; height: 13px;"></i> Delete';
                if (window.lucide) window.lucide.createIcons();
                btn.disabled = false;
                console.error("Deletion failed:", err);
                alert("Failed to delete document from library.");
            }
        });
    });

    // Bind custom shortlink slug save buttons
    document.querySelectorAll('.save-doc-slug-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            const input = document.querySelector(`.doc-slug-input[data-id="${id}"]`);
            if (!input) return;

            let slug = input.value.trim().toLowerCase();
            if (slug && !/^[a-z0-9-_]+$/i.test(slug)) {
                alert("Custom short link names can only contain letters, numbers, hyphens, and underscores.");
                return;
            }

            btn.disabled = true;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '...';

            try {
                // Update slug column in Supabase
                const { error } = await Api.supabase
                    .from('documents')
                    .update({ slug: slug || null })
                    .eq('id', id);

                if (error) {
                    if (error.message && error.message.includes('unique')) {
                        throw new Error("This custom short link name is already taken. Please choose another.");
                    }
                    throw error;
                }

                btn.innerHTML = '<i data-lucide="check" style="width: 12px; height: 12px; color: var(--accent-gold);"></i>';
                if (window.lucide) window.lucide.createIcons();
                
                // Update local cache
                if (window._userDocuments) {
                    const doc = window._userDocuments.find(d => d.id === id);
                    if (doc) doc.slug = slug || null;
                }
                
                // Update copy buttons URL dynamically
                const copyBtn = btn.closest('.document-card')?.querySelector('.copy-doc-link-btn');
                if (copyBtn) {
                    const code = slug || id;
                    copyBtn.setAttribute('data-url', `${window.location.origin}${window.location.pathname}#/d/${code}`);
                }

                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    if (window.lucide) window.lucide.createIcons();
                    btn.disabled = false;
                }, 1500);

            } catch (err) {
                btn.innerHTML = originalHTML;
                if (window.lucide) window.lucide.createIcons();
                btn.disabled = false;
                console.error("Failed to save custom short link:", err);
                alert(err.message || "Failed to save custom short link.");
            }
        });
    });
}
