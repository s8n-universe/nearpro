import { State } from '../state.js';

export function renderUpgradeSuccessModal() {
    if (!State.upgrade_success_modal_open || !State.upgrade_success_data) return '';

    const data = State.upgrade_success_data;
    const tierName = (data.tier || 'Hunter').toUpperCase();
    const netPaid = data.netPaid || '999';
    const credit = data.creditApplied || '0';
    const paymentId = data.paymentId || `pay_mock_${Math.random().toString(36).slice(2, 8)}`;
    const features = data.features || [
        'WhatsApp AI Pitches (Hinglish/English)',
        'Business Health Check & Lead Scores',
        'Unlimited Lead Exports & Pipeline Tracking'
    ];

    return `
        <div class="modal-overlay open" id="upgradeSuccessModalOverlay" style="z-index: 10040;">
            <div class="modal-card" style="max-width: 520px; padding: 32px; text-align: center; position: relative; max-height: 90vh; overflow-y: auto;">
                <button class="modal-close-btn" id="closeUpgradeSuccessModalBtn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer;">&times;</button>
                
                <!-- Celebration Icon -->
                <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>

                <h2 style="font-size: 22px; color: white; margin: 0 0 6px 0; font-family: var(--font-heading); font-weight: 700;">
                    Subscription Purchase Confirmed!
                </h2>
                
                <p style="color: var(--text-secondary); font-size: 13px; margin: 0 0 24px 0;">
                    Your workspace is now active on the <strong style="color: var(--accent-gold);">${tierName} PLAN</strong>.
                </p>

                <!-- Receipt Summary Card -->
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; text-align: left; margin-bottom: 24px;">
                    <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; font-weight: bold; letter-spacing: 0.5px;">
                        Payment & Billing Receipt
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">
                        <span>Activated Plan:</span>
                        <span style="color: white; font-weight: 700;">${tierName} Plan</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">
                        <span>Amount Paid Today:</span>
                        <span style="color: #10b981; font-weight: 700;">₹${netPaid}</span>
                    </div>

                    ${credit && credit !== '0' ? `
                        <div style="display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">
                            <span>Previous Plan Credit Applied:</span>
                            <span style="color: var(--text-muted);">-₹${credit}</span>
                        </div>
                    ` : ''}

                    <div style="display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-secondary); border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px; margin-top: 4px;">
                        <span>Transaction Ref:</span>
                        <span style="font-family: var(--font-mono); color: var(--text-muted);">${paymentId}</span>
                    </div>
                </div>

                <!-- Unlocked Features Summary -->
                <div style="background: rgba(255, 160, 0, 0.03); border: 1px solid rgba(255, 160, 0, 0.2); border-radius: var(--radius-md); padding: 16px; text-align: left; margin-bottom: 24px;">
                    <div style="font-size: 11px; font-family: var(--font-mono); color: var(--accent-gold); font-weight: bold; margin-bottom: 8px;">
                        UNLOCKED WORKSPACE CAPABILITIES
                    </div>
                    <ul style="list-style: none; padding: 0; margin: 0; font-size: 12px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px;">
                        ${features.map(f => `
                            <li style="display: flex; align-items: center; gap: 8px;">
                                <span style="color: #10b981; font-weight: bold;">✓</span>
                                <span style="color: white;">${f}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <button class="brand-btn" id="finishUpgradeSuccessBtn" style="width: 100%; padding: 12px; font-weight: 700; font-size: 14px;">
                    Start Using ${tierName} Features
                </button>
            </div>
        </div>
    `;
}

export function bindUpgradeSuccessModalEvents() {
    const overlay = document.getElementById('upgradeSuccessModalOverlay');
    if (!overlay) return;

    const closeBtn = document.getElementById('closeUpgradeSuccessModalBtn');
    const finishBtn = document.getElementById('finishUpgradeSuccessBtn');

    const close = () => {
        State.upgrade_success_modal_open = false;
        State.upgrade_success_data = null;
        State.notify();
        window.location.hash = '#/dashboard/directory';
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (finishBtn) finishBtn.addEventListener('click', close);
}
