import { State } from '../state.js';

export function renderPricingModal() {
    if (!State.pricing_modal_open) return '';

    return `
        <div class="modal-overlay open" id="pricingModalOverlay" style="z-index: 10000;">
            <div class="modal-card" style="max-width: 460px; padding: 32px; text-align: center; position: relative;">
                <button class="modal-close-btn" id="closePricingModalBtn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer;">&times;</button>
                
                <div style="font-size: 40px; margin-bottom: 12px;">🚀</div>
                
                <h2 style="font-size: 22px; margin-bottom: 6px; font-family: var(--font-heading); color: white;">
                    Unlock Premium Access
                </h2>
                
                <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 24px; line-height: 1.5;">
                    Spend ₹29 on random snacks vs spend ₹29 on verified local data to scale your freelancer client outreach and business revenue. Choose your tier:
                </p>
                
                <!-- Plan Options Stack -->
                <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; text-align: left;">
                    
                    <!-- Starter Row -->
                    <div style="background: rgba(255, 160, 0, 0.02); border: 1px solid rgba(255, 160, 0, 0.12); padding: 18px 20px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: var(--transition);">
                        <div>
                            <h4 style="font-size: 14px; color: var(--accent-gold); margin: 0 0 4px 0; font-family: var(--font-heading);">Starter Plan — ₹29/mo</h4>
                            <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.4;">Spot High-Opportunity Leads. Unlimited searches, categories, and completeness indexes to find businesses missing digital assets.</p>
                        </div>
                        <button class="brand-btn" style="padding: 8px 14px; font-size: 11.5px; flex-shrink: 0;" onclick="localStorage.setItem('selected_nearpro_tier', 'starter'); window.State.locked = false; window.State.session_started = null; window.State.setPricingModal(false); window.State.setAuthModal(true);">
                            Choose ₹29
                        </button>
                    </div>

                    <!-- Connect Row -->
                    <div style="background: rgba(255, 160, 0, 0.04); border: 1px solid var(--accent-gold); padding: 18px 20px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; gap: 12px; position: relative; box-shadow: 0 4px 20px rgba(255, 160, 0, 0.05);">
                        <div style="position: absolute; top: -10px; right: 12px; background: var(--accent-gold); color: black; font-size: 8px; font-family: var(--font-mono); padding: 2px 8px; border-radius: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Best Value</div>
                        <div>
                            <h4 style="font-size: 14px; color: var(--accent-gold); margin: 0 0 4px 0; font-family: var(--font-heading);">Connect Plan — ₹59/mo</h4>
                            <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.4;">Direct Outreach Ready. Adds unmasked phone numbers, direct website links, and location pins for calling and pitching clients.</p>
                        </div>
                        <button class="brand-btn" style="padding: 8px 14px; font-size: 11.5px; flex-shrink: 0;" onclick="localStorage.setItem('selected_nearpro_tier', 'connect'); window.State.locked = false; window.State.session_started = null; window.State.setPricingModal(false); window.State.setAuthModal(true);">
                            Choose ₹59
                        </button>
                    </div>

                    <!-- Elite Pro Row -->
                    <div style="background: rgba(236, 72, 153, 0.02); border: 1px solid rgba(236, 72, 153, 0.12); padding: 18px 20px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: var(--transition);">
                        <div>
                            <h4 style="font-size: 14px; color: var(--accent-pink); margin: 0 0 4px 0; font-family: var(--font-heading);">Elite Pro Plan — ₹99/mo</h4>
                            <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.4;">Full Database & Gaps. Adds direct CSV lead exporter, underserved market gap opportunity tables, and category density maps.</p>
                        </div>
                        <button class="brand-btn" style="padding: 8px 14px; font-size: 11.5px; flex-shrink: 0; background: linear-gradient(135deg, var(--accent-pink), #a855f7);" onclick="localStorage.setItem('selected_nearpro_tier', 'pro'); window.State.locked = false; window.State.session_started = null; window.State.setPricingModal(false); window.State.setAuthModal(true);">
                            Choose ₹99
                        </button>
                    </div>

                </div>
                
                <div style="font-size: 11px; color: var(--text-muted);">
                    Select a plan to start your registration. Cancel your subscription anytime.
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
}
