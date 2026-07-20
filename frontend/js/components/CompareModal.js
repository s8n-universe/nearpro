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
    // Generate comparison rows
    const headerCols = professionals.map(p => `<th>${p.name}</th>`).join('');
    
    const categoryRow = professionals.map(p => `<td><span class="category-badge">${p.category || p.parent_category}</span></td>`).join('');
    
    const areaRow = professionals.map(p => `<td>${p.area || "Mumbai"}</td>`).join('');
    
    const ratingRow = professionals.map(p => {
        const rating = p.rating || 0;
        const count = p.review_count || 0;
        return `<td><strong>★ ${rating}</strong> <span style="color: var(--text-muted);">(${count})</span></td>`;
    }).join('');

    const completenessRow = professionals.map(p => {
        const score = p.completeness_score || 0;
        let dots = '';
        for (let i = 0; i < 5; i++) {
            dots += `<span class="complete-dot ${i < score ? 'filled' : ''}" style="display: inline-block; margin: 0 2px;"></span>`;
        }
        return `<td><div style="display: flex; justify-content: center; gap: 4px;">${dots}</div></td>`;
    }).join('');
    
    const phoneRow = professionals.map(p => `<td>${p.phone ? `<a href="tel:${p.phone}" style="color: var(--accent-gold); text-decoration: underline;">${p.phone}</a>` : '<span style="color: var(--text-muted);">None</span>'}</td>`).join('');
    
    const websiteRow = professionals.map(p => `<td>${p.website ? `<a href="${p.website}" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Visit Site</a>` : '<span style="color: var(--text-muted);">None</span>'}</td>`).join('');
    
    const emailRow = professionals.map(p => `<td>${p.email || '<span style="color: var(--text-muted);">None</span>'}</td>`).join('');

    const actionRow = professionals.map(p => `
        <td>
            <a href="#" class="brand-btn" style="padding: 6px 12px; font-size: 12px; border-radius: var(--radius-sm);">
                Connect
            </a>
        </td>
    `).join('');

    return `
        <div class="modal-card" style="max-width: 900px;">
            <button class="modal-close-btn" id="closeCompareModalBtn">&times;</button>
            <div class="modal-content" style="padding: 32px;">
                <h2 style="font-size: 22px; margin-bottom: 24px; font-family: var(--font-heading);">Professional Comparison</h2>
                
                <div class="compare-table-wrap">
                    <table class="compare-table">
                        <thead>
                            <tr>
                                <th style="text-align: left; background: var(--bg-base);">Feature</th>
                                ${headerCols}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Category</td>
                                ${categoryRow}
                            </tr>
                            <tr>
                                <td>Neighborhood Area</td>
                                ${areaRow}
                            </tr>
                            <tr>
                                <td>Rating & Reviews</td>
                                ${ratingRow}
                            </tr>
                            <tr>
                                <td>Completeness</td>
                                ${completenessRow}
                            </tr>
                            <tr>
                                <td>Phone</td>
                                ${phoneRow}
                            </tr>
                            <tr>
                                <td>Website</td>
                                ${websiteRow}
                            </tr>
                            <tr>
                                <td>Email</td>
                                ${emailRow}
                            </tr>
                            <tr>
                                <td>MappCall Link</td>
                                ${actionRow}
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
