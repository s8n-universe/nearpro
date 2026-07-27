import { State } from '../state.js';
import { Api } from '../api.js';

export function renderComparePanel() {
    const count = State.selected_ids.length;
    const isVisible = count > 0;
    
    return `
        <div class="compare-panel ${isVisible ? 'visible' : ''}">
            <span style="font-size: 13.5px; font-weight: 600; color: var(--text-primary);">
                ${count} verified business${count > 1 ? 'es' : ''} selected
            </span>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <button id="triggerExportExcelBtn" class="brand-btn" style="padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm); background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
                    <i data-lucide="file-spreadsheet" style="width:14px; height:14px;"></i> Export ${count} Verified Lead${count > 1 ? 's' : ''} to Excel
                </button>
                ${count >= 2 ? `
                    <button id="triggerCompareBtn" class="secondary-btn" style="padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm);">
                        Compare Selected
                    </button>
                ` : ''}
                <button id="clearCompareBtn" class="secondary-btn" style="padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm);">
                    Clear Selection
                </button>
            </div>
        </div>
    `;
}

export function renderCompareModalContent(professionals) {
    // Column Headers for Businesses
    const headerCols = professionals.map(p => `
        <th style="padding: 16px 20px; text-align: center; color: #0f172a; font-size: 15px; font-weight: 800; font-family: var(--font-heading); border-bottom: 2px solid #e2e8f0; background: #f8fafc;">
            ${p.name || 'Business Lead'}
        </th>
    `).join('');
    
    // Category Badges
    const categoryRow = professionals.map(p => `
        <td style="padding: 14px 18px; text-align: center; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
            <span style="display: inline-block; padding: 4px 12px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 20px; font-size: 12px; font-weight: 700;">
                ${p.category || p.parent_category || 'Local Business'}
            </span>
        </td>
    `).join('');
    
    // Neighborhood Area
    const areaRow = professionals.map(p => `
        <td style="padding: 14px 18px; text-align: center; color: #334155; font-size: 13.5px; font-weight: 600; border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
            📍 ${p.area || "Mumbai"}
        </td>
    `).join('');
    
    // Rating & Reviews
    const ratingRow = professionals.map(p => {
        const rating = p.rating || 0;
        const count = p.review_count || 0;
        return `
            <td style="padding: 14px 18px; text-align: center; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
                <span style="color: #d97706; font-weight: 800; font-size: 14.5px;">★ ${rating}</span> 
                <span style="color: #64748b; font-size: 12.5px; font-weight: 600;">(${count} reviews)</span>
            </td>
        `;
    }).join('');

    // Profile Completeness
    const completenessRow = professionals.map(p => {
        const score = p.completeness_score || 0;
        const pct = Math.round((score / 5) * 100);
        let dots = '';
        for (let i = 0; i < 5; i++) {
            const isFilled = i < score;
            dots += `<span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${isFilled ? '#f59e0b' : '#cbd5e1'}; margin: 0 2px;"></span>`;
        }
        return `
            <td style="padding: 14px 18px; text-align: center; border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                    ${dots}
                    <span style="font-size: 12px; font-weight: 700; color: #475569; font-family: var(--font-mono); margin-left: 4px;">${pct}%</span>
                </div>
            </td>
        `;
    }).join('');
    
    // Phone Contact
    const phoneRow = professionals.map(p => `
        <td style="padding: 14px 18px; text-align: center; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
            ${p.phone 
                ? `<a href="tel:${p.phone}" style="color: #2563eb; text-decoration: none; font-weight: 700; background: #eff6ff; padding: 6px 12px; border-radius: 6px; border: 1px solid #dbeafe; display: inline-flex; align-items: center; gap: 4px; font-size: 13px;">📞 ${p.phone}</a>` 
                : '<span style="color: #94a3b8; font-size: 13px; font-weight: 500;">Not Listed</span>'
            }
        </td>
    `).join('');
    
    // Website Link
    const websiteRow = professionals.map(p => `
        <td style="padding: 14px 18px; text-align: center; border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
            ${p.website 
                ? `<a href="${p.website}" target="_blank" rel="noopener noreferrer" style="color: #059669; text-decoration: none; font-weight: 700; background: #ecfdf5; padding: 6px 12px; border-radius: 6px; border: 1px solid #a7f3d0; display: inline-flex; align-items: center; gap: 4px; font-size: 13px;">🌐 Visit Website ➔</a>` 
                : '<span style="color: #94a3b8; font-size: 13px; font-weight: 500;">No Website</span>'
            }
        </td>
    `).join('');
    
    // Email Address
    const emailRow = professionals.map(p => `
        <td style="padding: 14px 18px; text-align: center; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
            ${p.email 
                ? `<span style="color: #1e293b; font-weight: 600; background: #f1f5f9; padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: var(--font-mono); font-size: 12.5px; display: inline-block;">✉️ ${p.email}</span>` 
                : '<span style="color: #94a3b8; font-size: 13px; font-weight: 500;">Not Provided</span>'
            }
        </td>
    `).join('');

    return `
        <div class="modal-card compare-modal-light" style="max-width: 960px; background: #ffffff !important; color: #0f172a !important; border: 1px solid #cbd5e1 !important; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35); overflow: hidden; position: relative;">
            <button class="modal-close-btn" id="closeCompareModalBtn" style="position: absolute; top: 18px; right: 20px; width: 36px; height: 36px; border-radius: 50%; background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; font-size: 22px; line-height: 1; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; z-index: 10;" onmouseover="this.style.background='#e2e8f0'; this.style.color='#0f172a';" onmouseout="this.style.background='#f1f5f9'; this.style.color='#475569';">&times;</button>
            
            <div class="modal-content" style="padding: 32px 36px; background: #ffffff;">
                <div style="margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span style="font-size: 20px;">⚡</span>
                        <h2 style="font-size: 22px; font-weight: 800; font-family: var(--font-heading); color: #0f172a; margin: 0; letter-spacing: -0.3px;">Verified Business Comparison</h2>
                    </div>
                    <p style="font-size: 13.5px; color: #64748b; margin: 0; font-family: var(--font-body);">Side-by-side metric analysis of selected target leads in Mumbai</p>
                </div>
                
                <div class="compare-table-wrap" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin-top: 0;">
                    <table class="compare-table" style="width: 100%; border-collapse: collapse; background: #ffffff;">
                        <thead>
                            <tr>
                                <th style="text-align: left; background: #f8fafc; color: #475569; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 16px 20px; border-bottom: 2px solid #e2e8f0;">Feature Metric</th>
                                ${headerCols}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="text-align: left; font-weight: 700; color: #334155; font-size: 13.5px; padding: 14px 18px; border-bottom: 1px solid #f1f5f9; background: #ffffff;">Category</td>
                                ${categoryRow}
                            </tr>
                            <tr>
                                <td style="text-align: left; font-weight: 700; color: #334155; font-size: 13.5px; padding: 14px 18px; border-bottom: 1px solid #f1f5f9; background: #f8fafc;">Neighborhood Area</td>
                                ${areaRow}
                            </tr>
                            <tr>
                                <td style="text-align: left; font-weight: 700; color: #334155; font-size: 13.5px; padding: 14px 18px; border-bottom: 1px solid #f1f5f9; background: #ffffff;">Rating & Reviews</td>
                                ${ratingRow}
                            </tr>
                            <tr>
                                <td style="text-align: left; font-weight: 700; color: #334155; font-size: 13.5px; padding: 14px 18px; border-bottom: 1px solid #f1f5f9; background: #f8fafc;">Completeness</td>
                                ${completenessRow}
                            </tr>
                            <tr>
                                <td style="text-align: left; font-weight: 700; color: #334155; font-size: 13.5px; padding: 14px 18px; border-bottom: 1px solid #f1f5f9; background: #ffffff;">Phone Contact</td>
                                ${phoneRow}
                            </tr>
                            <tr>
                                <td style="text-align: left; font-weight: 700; color: #334155; font-size: 13.5px; padding: 14px 18px; border-bottom: 1px solid #f1f5f9; background: #f8fafc;">Website</td>
                                ${websiteRow}
                            </tr>
                            <tr>
                                <td style="text-align: left; font-weight: 700; color: #334155; font-size: 13.5px; padding: 14px 18px; border-bottom: 1px solid #f1f5f9; background: #ffffff;">Email Address</td>
                                ${emailRow}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

export function bindComparePanelEvents(onTriggerCompare) {
    const triggerBtn = document.getElementById('triggerCompareBtn');
    const clearBtn = document.getElementById('clearCompareBtn');
    const exportExcelBtn = document.getElementById('triggerExportExcelBtn');

    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => {
            const selectedLeads = State.professionals.filter(p => State.selected_ids.includes(p.id));
            if (selectedLeads.length > 0) {
                Api.exportToCSV(selectedLeads);
            }
        });
    }
    
    if (triggerBtn) {
        triggerBtn.addEventListener('click', async () => {
            if (onTriggerCompare) {
                // Fetch the full details of all selected professionals
                const list = [];
                for (const id of State.selected_ids) {
                    try {
                        const prof = await Api.getProfessional(id);
                        list.push(prof);
                    } catch (e) {
                        console.error("Failed to load details for comparison: ", id, e);
                    }
                }
                onTriggerCompare(list);
            }
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            State.clearSelection();
        });
    }
}
