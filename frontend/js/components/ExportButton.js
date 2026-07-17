import { State } from '../state.js';
import { Api } from '../api.js';

export function renderExportButton() {
    const count = State.selected_ids.length;
    const isVisible = count > 0;
    
    if (!isVisible) return '';

    return `
        <div style="display: flex; gap: 8px; margin-bottom: 24px; align-items: center; justify-content: flex-end;">
            <span style="font-size: 13px; color: var(--text-muted); font-family: var(--font-mono); margin-right: 8px;">
                ${count} lead${count > 1 ? 's' : ''} selected:
            </span>
            <button id="exportCSVBtn" class="brand-btn" style="padding: 8px 16px; font-size: 12px; border-radius: var(--radius-sm);">
                Export CSV
            </button>
            <button id="exportWebhookBtn" class="secondary-btn" style="padding: 8px 16px; font-size: 12px; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 4px;">
                <span>Send to Webhook</span>
            </button>
        </div>
    `;
}

export function bindExportButtonEvents(selectedLeadsFetcher) {
    const csvBtn = document.getElementById('exportCSVBtn');
    const webhookBtn = document.getElementById('exportWebhookBtn');

    if (csvBtn) {
        csvBtn.addEventListener('click', async () => {
            if (selectedLeadsFetcher) {
                const leads = await selectedLeadsFetcher();
                Api.exportToCSV(leads);
            }
        });
    }

    if (webhookBtn) {
        webhookBtn.addEventListener('click', async () => {
            if (selectedLeadsFetcher) {
                const leads = await selectedLeadsFetcher();
                
                // Get webhook URL from build/env config
                const webhookUrl = import.meta.env.VITE_EXPORT_WEBHOOK_URL || 'http://localhost:5678/webhook/export-trigger';
                const apiKey = import.meta.env.VITE_EXPORT_API_KEY || '';

                try {
                    const response = await fetch(webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            source: "nearpro",
                            exported_at: new Date().toISOString(),
                            leads: leads
                        })
                    });

                    if (response.ok) {
                        alert(`Successfully sent ${leads.length} leads to outreach pipeline!`);
                        State.clearSelection();
                    } else {
                        const txt = await response.text();
                        alert(`Failed to trigger webhook outreach: ${response.status} - ${txt}`);
                    }
                } catch (e) {
                    console.error("Webhook POST failed: ", e);
                    alert(`Network error connecting to webhook pipeline: ${e.message}`);
                }
            }
        });
    }
}
