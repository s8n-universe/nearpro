import { State } from '../state.js';
import { Api } from '../api.js';

export function renderCheckoutConsentModal() {
    if (!State.checkout_consent_modal_open || !State.pending_checkout_plan) return '';

    const { planId, interval } = State.pending_checkout_plan;
    const cycle = interval || 'monthly';

    // Pricing details mapping
    const planDetails = {
        scout: {
            name: 'Scout',
            price: cycle === 'monthly' ? '₹499' : '₹4,999',
            period: cycle === 'monthly' ? 'month' : 'year',
            cycleLabel: cycle === 'monthly' ? 'Billed Monthly' : 'Billed Yearly (Save ₹989)',
            features: [
                'Unlocked Phone Numbers & Websites',
                'Export 100 Leads per Month',
                'Track 5 Custom Lead Lists',
                'Interactive Map & Notes Access'
            ]
        },
        hunter: {
            name: 'Hunter',
            price: cycle === 'monthly' ? '₹999' : '₹9,999',
            period: cycle === 'monthly' ? 'month' : 'year',
            cycleLabel: cycle === 'monthly' ? 'Billed Monthly' : 'Billed Yearly (Save ₹1,989)',
            features: [
                '500 WhatsApp AI Pitches (Hinglish/English)',
                'Lead Conversion & Health Scores',
                'Unlimited Lead Exports',
                'Pipeline & CRM Tracking'
            ]
        },
        agency: {
            name: 'Agency',
            price: cycle === 'monthly' ? '₹2,499' : '₹24,999',
            period: cycle === 'monthly' ? 'month' : 'year',
            cycleLabel: cycle === 'monthly' ? 'Billed Monthly' : 'Billed Yearly (Save ₹4,989)',
            features: [
                'Unlimited WhatsApp AI Pitches',
                '3 Team Workspace Seats',
                'n8n Webhook & Google Sheets Push',
                'Density Heatmaps & Niche Gap Analysis'
            ]
        }
    };

    const details = planDetails[planId] || planDetails.hunter;

    return `
        <div class="modal-overlay open" id="checkoutConsentModalOverlay" style="z-index: 10030;">
            <div class="modal-card" style="max-width: 620px; padding: 32px; text-align: left; position: relative; max-height: 90vh; overflow-y: auto;">
                <button class="modal-close-btn" id="closeCheckoutConsentModalBtn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer;">&times;</button>
                
                <!-- Header -->
                <div style="margin-bottom: 24px;">
                    <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 160, 0, 0.08); border: 1px solid rgba(255, 160, 0, 0.2); color: var(--accent-gold); padding: 4px 12px; border-radius: 50px; font-size: 11px; font-family: var(--font-mono); font-weight: 600; margin-bottom: 10px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        Pre-Payment Verification
                    </div>
                    
                    <h2 style="font-size: 22px; color: white; margin: 0 0 6px 0; font-family: var(--font-heading); font-weight: 700;">
                        Order Review & Consumer Guarantee
                    </h2>
                    
                    <p style="color: var(--text-secondary); font-size: 13px; margin: 0; line-height: 1.5;">
                        Review your plan summary, safety commitments, and terms before proceeding to secure payment.
                    </p>
                </div>

                <!-- 2-Box Column Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                    
                    <!-- Box 1: Plan Summary Card -->
                    <div style="background: rgba(255, 160, 0, 0.03); border: 1px solid var(--accent-gold); padding: 20px; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="font-size: 10px; color: var(--accent-gold); font-family: var(--font-mono); text-transform: uppercase; font-weight: bold; margin-bottom: 6px; letter-spacing: 0.5px;">
                                Selected Plan
                            </div>
                            
                            <h3 style="font-size: 18px; color: white; margin: 0 0 4px 0; font-family: var(--font-heading);">
                                ${details.name} Plan
                            </h3>
                            
                            <div style="font-size: 22px; color: var(--accent-gold); font-weight: 700; margin-bottom: 4px; font-family: var(--font-heading);">
                                ${details.price}<span style="font-size: 13px; color: var(--text-muted); font-weight: normal;">/${details.period}</span>
                            </div>
                            
                            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 16px;">
                                ${details.cycleLabel}
                            </div>
                            
                            <ul style="list-style: none; padding: 0; margin: 0; font-size: 11.5px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
                                ${details.features.map(f => `
                                    <li style="display: flex; align-items: center; gap: 8px;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" style="flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
                                        <span>${f}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>

                    <!-- Box 2: Consumer Guarantees Card -->
                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); padding: 20px; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; font-weight: bold; margin-bottom: 12px; letter-spacing: 0.5px;">
                                Consumer Protections
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 14px;">
                                <!-- Item 1 -->
                                <div style="display: flex; gap: 10px; align-items: flex-start;">
                                    <div style="width: 28px; height: 28px; border-radius: 6px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                                    </div>
                                    <div>
                                        <div style="font-size: 12px; color: white; font-weight: 600; font-family: var(--font-heading);">1-Click Cancel Anytime</div>
                                        <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">Manage or stop renewal easily in Settings without long commitments.</div>
                                    </div>
                                </div>

                                <!-- Item 2 -->
                                <div style="display: flex; gap: 10px; align-items: flex-start;">
                                    <div style="width: 28px; height: 28px; border-radius: 6px; background: rgba(255, 160, 0, 0.1); border: 1px solid rgba(255, 160, 0, 0.2); color: var(--accent-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                                    </div>
                                    <div>
                                        <div style="font-size: 12px; color: white; font-weight: 600; font-family: var(--font-heading);">7-Day Refund Guarantee</div>
                                        <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">100% money-back window for initial purchase window.</div>
                                    </div>
                                </div>

                                <!-- Item 3 -->
                                <div style="display: flex; gap: 10px; align-items: flex-start;">
                                    <div style="width: 28px; height: 28px; border-radius: 6px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); color: #3b82f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    </div>
                                    <div>
                                        <div style="font-size: 12px; color: white; font-weight: 600; font-family: var(--font-heading);">256-Bit Encrypted Checkout</div>
                                        <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">Processed directly via Razorpay PCI-DSS Level 1 infrastructure.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Agreement & Action Controls -->
                <div style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px;">
                    <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
                        <input type="checkbox" id="checkoutConsentCb" style="margin-top: 2px; cursor: pointer;">
                        <span>
                            I agree to NearPro's <a href="#/terms" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Terms of Service</a> and <a href="#/privacy" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Privacy Policy</a>.
                        </span>
                    </label>
                </div>

                <div style="display: flex; gap: 12px;">
                    <button id="cancelCheckoutConsentBtn" class="secondary-btn" style="flex: 1; padding: 12px; font-size: 13px;">
                        Return to Plans
                    </button>
                    <button id="proceedToPaymentBtn" class="brand-btn" disabled style="flex: 1.5; padding: 12px; font-size: 13.5px; opacity: 0.5; cursor: not-allowed; transition: all 0.2s ease;">
                        Proceed to Payment (${details.price})
                    </button>
                </div>

            </div>
        </div>
    `;
}

export function bindCheckoutConsentModalEvents() {
    const overlay = document.getElementById('checkoutConsentModalOverlay');
    if (!overlay) return;

    const closeBtn = document.getElementById('closeCheckoutConsentModalBtn');
    const cancelBtn = document.getElementById('cancelCheckoutConsentBtn');
    const consentCb = document.getElementById('checkoutConsentCb');
    const proceedBtn = document.getElementById('proceedToPaymentBtn');

    const close = () => {
        State.checkout_consent_modal_open = false;
        State.pending_checkout_plan = null;
        State.notify();
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (cancelBtn) cancelBtn.addEventListener('click', close);

    if (consentCb && proceedBtn) {
        consentCb.addEventListener('change', () => {
            if (consentCb.checked) {
                proceedBtn.disabled = false;
                proceedBtn.style.opacity = '1';
                proceedBtn.style.cursor = 'pointer';
            } else {
                proceedBtn.disabled = true;
                proceedBtn.style.opacity = '0.5';
                proceedBtn.style.cursor = 'not-allowed';
            }
        });
    }

    if (proceedBtn) {
        proceedBtn.addEventListener('click', async () => {
            if (!consentCb || !consentCb.checked) return;

            const pending = State.pending_checkout_plan;
            if (!pending) return;

            proceedBtn.innerText = 'Initializing Razorpay...';
            proceedBtn.disabled = true;

            try {
                close();
                await Api.checkoutSubscription(pending.planId, pending.interval);
            } catch (err) {
                console.error("Subscription checkout error:", err);
                alert("Payment initiation failed. Please try again.");
            }
        });
    }
}
