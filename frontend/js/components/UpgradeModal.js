import { State } from '../state.js';

export function renderUpgradeModal() {
    if (!State.upgrade_modal_open || !State.upgrade_modal_config) return '';

    const config = State.upgrade_modal_config;

    return `
        <div class="modal-overlay open" id="upgradeModalOverlay" style="z-index: 10010;">
            <div class="modal-card" style="max-width: 440px; padding: 32px; text-align: center; position: relative;">
                <button class="modal-close-btn" id="closeUpgradeModalBtn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer;">&times;</button>
                
                <div style="font-size: 44px; margin-bottom: 16px;">🔒</div>
                
                <h3 style="font-size: 18px; color: white; margin: 0 0 8px 0; font-family: var(--font-heading);">
                    ${config.headline || 'Feature Locked'}
                </h3>
                
                <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.5; margin: 0 0 24px 0;">
                    ${config.description || 'This premium feature is locked on your current plan.'}
                </p>

                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 10px; text-align: left;">
                    <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase;">Required Plan</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 15px; color: var(--accent-gold); font-weight: bold; font-family: var(--font-heading);">${config.tierName} Plan</span>
                        <span style="font-size: 14px; color: white; font-weight: 500;">${config.pricing?.label || 'Custom'}</span>
                    </div>
                </div>

                <button class="brand-btn" id="upgradeModalCtaBtn" style="width: 100%; padding: 12px; margin-bottom: 12px;">
                    ${config.cta}
                </button>
                
                <button class="secondary-btn" id="cancelUpgradeModalBtn" style="width: 100%; padding: 12px;">
                    Keep Current Plan
                </button>
            </div>
        </div>
    `;
}

export function bindUpgradeModalEvents() {
    const closeBtn = document.getElementById('closeUpgradeModalBtn');
    const cancelBtn = document.getElementById('cancelUpgradeModalBtn');
    const ctaBtn = document.getElementById('upgradeModalCtaBtn');

    const close = () => {
        State.upgrade_modal_open = false;
        State.upgrade_modal_config = null;
        State.notify();
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (cancelBtn) cancelBtn.addEventListener('click', close);

    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            close();
            // Open central pricing modal
            State.setPricingModal(true);
        });
    }
}
