import { State } from '../state.js';

export function renderPricingModal() {
    if (!State.pricing_modal_open) return '';

    return `
        <div class="modal-overlay open" id="pricingModalOverlay" style="z-index: 10000;">
            <div class="modal-card" style="max-width: 440px; padding: 40px; text-align: center; position: relative;">
                <button class="modal-close-btn" id="closePricingModalBtn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer;">&times;</button>
                
                <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
                
                <h2 style="font-size: 24px; margin-bottom: 8px; font-family: var(--font-heading); color: white;">
                    Unlock Premium Access
                </h2>
                
                <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; line-height: 1.5;">
                    Gain full access to the most complete Mumbai verified directory database and lead generation analytics.
                </p>
                
                <!-- Pricing Highlights -->
                <div style="background: rgba(255, 160, 0, 0.08); border: 1px dashed var(--accent-gold); padding: 16px; border-radius: var(--radius-md); margin-bottom: 28px;">
                    <div style="font-size: 32px; font-family: var(--font-heading); color: var(--accent-gold); font-weight: bold; margin-bottom: 4px;">
                        ₹29 <span style="font-size: 14px; font-weight: normal; color: var(--text-muted);">/ month</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); font-family: var(--font-mono);">
                        SPECIAL PROMOTIONAL RATE • CANCEL ANYTIME
                    </div>
                </div>
                
                <!-- Benefits list -->
                <ul style="list-style: none; padding: 0; margin: 0 0 32px 0; text-align: left; font-size: 13.5px; line-height: 1.8; color: var(--text-secondary);">
                    <li style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 8px;">
                        <span style="color: var(--accent-gold);">✓</span>
                        <div><strong>Unlimited Searches</strong>: Unlock all 4,700+ verified professionals (no row gating bounds).</div>
                    </li>
                    <li style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 8px;">
                        <span style="color: var(--accent-gold);">✓</span>
                        <div><strong>Niche Opportunity Mapping</strong>: Locate local suburbs with high demand but zero competition.</div>
                    </li>
                    <li style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 8px;">
                        <span style="color: var(--accent-gold);">✓</span>
                        <div><strong>Bulk CSV Database Exports</strong>: Download complete phone lists and email directories.</div>
                    </li>
                    <li style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 8px;">
                        <span style="color: var(--accent-gold);">✓</span>
                        <div><strong>Coordinate Accuracy Maps</strong>: Access verified maps and clusters with 99% accuracy.</div>
                    </li>
                </ul>
                
                <!-- Call to action -->
                <button id="activatePremiumBtn" class="brand-btn" style="width: 100%; padding: 14px; font-size: 14px; margin-bottom: 16px;">
                    Activate Premium — ₹29 Monthly
                </button>
                
                <div style="font-size: 11px; color: var(--text-muted);">
                    By subscribing, you agree to create an account for access sync.
                </div>
            </div>
        </div>
    `;
}

export function bindPricingModalEvents() {
    const closeBtn = document.getElementById('closePricingModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            State.setPricingModal(false);
        });
    }

    const activateBtn = document.getElementById('activatePremiumBtn');
    if (activateBtn) {
        activateBtn.addEventListener('click', () => {
            // Close pricing and open auth register modal
            State.setPricingModal(false);
            State.setAuthModal(true);
        });
    }
}
