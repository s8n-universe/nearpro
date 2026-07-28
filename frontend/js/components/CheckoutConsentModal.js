import { State } from '../state.js';
import { Api } from '../api.js';
import { getUserTier, TIER_LEVELS } from '../auth.js';

/**
 * Fullscreen Glassmorphic Workspace Activation Loader Overlay
 */
function showActivationAnimationSequence(onComplete) {
    let loader = document.getElementById('workspaceActivationLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'workspaceActivationLoader';
        loader.style.position = 'fixed';
        loader.style.inset = '0';
        loader.style.zIndex = '100095';
        loader.style.background = 'rgba(9, 9, 11, 0.96)';
        loader.style.backdropFilter = 'blur(16px)';
        loader.style.webkitBackdropFilter = 'blur(16px)';
        loader.style.display = 'flex';
        loader.style.flexDirection = 'column';
        loader.style.alignItems = 'center';
        loader.style.justifyContent = 'center';
        loader.style.color = '#ffffff';
        loader.style.fontFamily = 'var(--font-heading, Inter, sans-serif)';
        loader.style.padding = '32px';
        loader.style.textAlign = 'center';
        document.body.appendChild(loader);
    }

    loader.innerHTML = `
        <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, rgba(255, 160, 0, 0.2), rgba(236, 72, 153, 0.2)); border: 2px solid var(--accent-gold, #ffa000); display: flex; align-items: center; justify-content: center; font-size: 36px; margin-bottom: 24px; box-shadow: 0 0 30px rgba(255,160,0,0.4);">
            ⚡
        </div>
        <h3 id="loaderStepTitle" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.5px;">
            Validating Coupon LAUNCH100...
        </h3>
        <p id="loaderStepSubtitle" style="font-size: 14px; color: var(--text-secondary, #94a3b8); max-width: 420px; margin: 0 0 28px 0; line-height: 1.5;">
            Securing 100% OFF Free Scout Subscription for 1 Month.
        </p>
        <div style="width: 260px; height: 6px; background: rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; position: relative;">
            <div id="loaderProgressBar" style="position: absolute; top:0; left:0; bottom:0; width: 18%; background: linear-gradient(90deg, #ffa000, #ec4899); border-radius: 10px; transition: width 0.6s ease;"></div>
        </div>
    `;

    const titleEl = document.getElementById('loaderStepTitle');
    const subEl = document.getElementById('loaderStepSubtitle');
    const progressEl = document.getElementById('loaderProgressBar');

    setTimeout(() => {
        if (titleEl) titleEl.innerText = "🎁 Claiming 100% FREE Scout Subscription...";
        if (subEl) subEl.innerText = "Unlocking 1-Month Unlimited Phone Numbers & Export Privileges...";
        if (progressEl) progressEl.style.width = "65%";
    }, 700);

    setTimeout(() => {
        if (titleEl) titleEl.innerText = "🚀 Configuring AI Agency Workspace...";
        if (subEl) subEl.innerText = "Preparing Verified B2B Lead Filters & Proposal Generators!";
        if (progressEl) progressEl.style.width = "100%";
    }, 1400);

    setTimeout(() => {
        if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
        if (onComplete) onComplete();
    }, 2100);
}

export function renderCheckoutConsentModal() {
    if (!State.checkout_consent_modal_open || !State.pending_checkout_plan) return '';

    const pending = State.pending_checkout_plan || {};
    const { planId, interval } = pending;
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
                'All Scout Plan Features',
                'Business Health Audit & Lead Scores',
                'WhatsApp AI Outreach Studio (Hinglish/Eng)',
                '1-Click PDF Proposal Generator',
                'Export 500 Leads per Month'
            ]
        },
        agency: {
            name: 'Agency OS',
            price: cycle === 'monthly' ? '₹2,499' : '₹24,999',
            period: cycle === 'monthly' ? 'month' : 'year',
            cycleLabel: cycle === 'monthly' ? 'Billed Monthly' : 'Billed Yearly (Save ₹4,989)',
            features: [
                'All Hunter Plan Features',
                'Unlimited Lead Exports & Tele-Sales Scripts',
                'Team Workspace & Member Seats',
                'n8n / Make / Google Sheets Webhooks',
                'Priority Dedicated Support'
            ]
        }
    };

    const targetPlan = planDetails[planId] || planDetails.hunter;

    return `
        <div class="modal-overlay open" id="checkoutConsentModalOverlay" style="z-index: 100040; background: rgba(0, 0, 0, 0.85) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important;">
            <div class="modal-card" style="max-width: 680px; width: 92%; padding: 32px; text-align: left; position: relative; background: #09090b !important; color: #ffffff !important; border: 1.5px solid var(--border) !important; box-shadow: 0 25px 60px rgba(0,0,0,0.8); border-radius: 20px; max-height: 90vh; overflow-y: auto;">
                
                <button class="modal-close-btn" id="closeCheckoutConsentModalBtn" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-size: 20px; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">&times;</button>
                
                <div style="font-size: 11px; font-family: var(--font-mono); color: var(--accent-gold); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                    ⚡ CHECKOUT & ACTIVATION SUMMARY
                </div>

                <h3 style="font-family: var(--font-heading); font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
                    Complete Your Workspace Activation
                </h3>
                <p style="font-size: 13px; color: var(--text-secondary, #94a3b8); margin: 0 0 24px 0; line-height: 1.5;">
                    Review your plan summary, safety commitments, and terms before proceeding to secure payment.
                </p>

                <!-- Summary Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    
                    <!-- Selected Plan Card -->
                    <div style="background: rgba(255, 160, 0, 0.04); border: 1.5px solid rgba(255, 160, 0, 0.3); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="font-size: 10px; font-family: var(--font-mono); color: var(--accent-gold); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                                Selected Plan
                            </div>
                            <h4 style="font-size: 20px; color: white; margin: 0 0 6px 0; font-family: var(--font-heading); font-weight: 800;">
                                ${targetPlan.name} Plan
                            </h4>
                            <div style="font-size: 22px; font-weight: 800; color: var(--accent-gold); margin-bottom: 4px; font-family: var(--font-mono);">
                                ${targetPlan.price} <span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">/${targetPlan.period}</span>
                            </div>
                            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 14px;">
                                ${targetPlan.cycleLabel}
                            </div>
                            <div style="border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 10px; font-size: 12px; color: var(--text-secondary); display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Base Price:</span>
                                <span style="color: white; font-weight: 700;">${targetPlan.price}</span>
                            </div>
                        </div>

                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 11.5px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px;">
                            ${targetPlan.features.map(f => `
                                <li style="display: flex; align-items: flex-start; gap: 6px;">
                                    <span style="color: #22c55e; font-weight: bold;">✓</span>
                                    <span>${f}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <!-- Consumer Protections & Guarantees Card -->
                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                                Consumer Protections
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 14px;">
                                <!-- Item 1 -->
                                <div style="display: flex; gap: 10px; align-items: flex-start;">
                                    <div style="width: 28px; height: 28px; border-radius: 6px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #22c55e; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
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

                <!-- Coupon Code Section -->
                <div style="background: rgba(255, 160, 0, 0.05); border: 1px dashed rgba(255, 160, 0, 0.3); padding: 14px 16px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                    <div style="flex: 1;">
                        <div style="font-size: 11px; color: var(--accent-gold); font-family: var(--font-mono); font-weight: 700; text-transform: uppercase;">Have a Coupon Code?</div>
                        <input type="text" id="consentCouponInput" placeholder="e.g. LAUNCH100" value="${pending.coupon || ''}" style="width: 100%; max-width: 220px; background: rgba(0,0,0,0.4); border: 1px solid var(--border); color: white; padding: 6px 10px; border-radius: 6px; font-size: 12.5px; font-family: var(--font-mono); outline: none; margin-top: 4px;">
                    </div>
                    <button id="applyConsentCouponBtn" class="secondary-btn" style="padding: 8px 14px; font-size: 12px; font-weight: 700; border-color: rgba(255, 160, 0, 0.4); color: var(--accent-gold);">
                        Apply Code
                    </button>
                </div>
                <div id="consentCouponFeedback" style="font-size: 12px; margin-bottom: 16px; display: none;"></div>

                <!-- Agreement & Action Controls -->
                <div style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px;">
                    <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
                        <input type="checkbox" id="checkoutConsentCb" style="margin-top: 2px; cursor: pointer;" checked>
                        <span>
                            I agree to NearPro's <a href="#/terms" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Terms of Service</a> and <a href="#/privacy" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Privacy Policy</a>.
                        </span>
                    </label>
                </div>

                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <button id="returnToPlansBtn" class="secondary-btn" style="flex: 1; padding: 12px; font-size: 13.5px; font-weight: 600; border-radius: var(--radius-md);">
                        Return to Plans
                    </button>
                    <button id="proceedToPaymentBtn" class="brand-btn" style="flex: 1.6; padding: 12px; font-size: 14px; font-weight: 700; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--accent-gold), #ec4899); color: white;">
                        Proceed to Secure Checkout ➔
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
    const returnBtn = document.getElementById('returnToPlansBtn');
    const proceedBtn = document.getElementById('proceedToPaymentBtn');
    const consentCb = document.getElementById('checkoutConsentCb');
    const couponInput = document.getElementById('consentCouponInput');
    const applyCouponBtn = document.getElementById('applyConsentCouponBtn');
    const couponFeedback = document.getElementById('consentCouponFeedback');

    let activeCoupon = null;

    const close = () => {
        State.checkout_consent_modal_open = false;
        State.notify();
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            close();
            State.setPricingModal(true);
        });
    }

    if (applyCouponBtn && couponInput) {
        applyCouponBtn.addEventListener('click', async () => {
            const code = couponInput.value.trim().toUpperCase();
            if (!code) return;

            applyCouponBtn.disabled = true;
            applyCouponBtn.innerText = 'Validating...';

            try {
                const res = await Api.getCouponStatus(code);
                if (res.valid) {
                    activeCoupon = code;
                    if (couponFeedback) {
                        couponFeedback.style.display = 'block';
                        couponFeedback.style.color = '#4ade80';
                        couponFeedback.innerHTML = `🎉 Coupon <strong>${code}</strong> valid! 100% OFF applied (${res.remaining} free plans left).`;
                    }
                    if (proceedBtn) {
                        proceedBtn.innerText = 'Activate Free Scout Plan ➔';
                    }
                } else {
                    if (couponFeedback) {
                        couponFeedback.style.display = 'block';
                        couponFeedback.style.color = '#f87171';
                        couponFeedback.innerHTML = `❌ ${res.message || 'Invalid coupon code.'}`;
                    }
                }
            } catch (err) {
                if (couponFeedback) {
                    couponFeedback.style.display = 'block';
                    couponFeedback.style.color = '#f87171';
                    couponFeedback.innerHTML = '❌ Failed to validate coupon code.';
                }
            } finally {
                applyCouponBtn.disabled = false;
                applyCouponBtn.innerText = 'Apply Code';
            }
        });
    }

    // Auto-apply pre-selected coupon code if passed in pending_checkout_plan
    const pending = State.pending_checkout_plan;
    if (pending && pending.coupon && applyCouponBtn) {
        setTimeout(() => {
            if (couponInput) couponInput.value = pending.coupon;
            applyCouponBtn.click();
            if (consentCb) {
                consentCb.checked = true;
                consentCb.dispatchEvent(new Event('change'));
            }
        }, 150);
    }

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

            if (activeCoupon === 'LAUNCH100' || pending.coupon === 'LAUNCH100') {
                proceedBtn.innerText = 'Activating Free Scout Plan...';
                proceedBtn.disabled = true;

                showActivationAnimationSequence(async () => {
                    try {
                        const userId = (State.user && State.user.id) ? State.user.id : null;
                        const result = await Api.applyCouponCode('LAUNCH100', userId);
                        
                        if (result && result.success) {
                            if (!State.profile) {
                                State.profile = { subscription_tier: 'scout', tier: 'scout' };
                            } else {
                                State.profile.subscription_tier = 'scout';
                                State.profile.tier = 'scout';
                            }

                            if (State.user) {
                                State.user.tier = 'scout';
                                State.user.subscription_tier = 'scout';
                                localStorage.setItem('nearpro_user', JSON.stringify(State.user));
                            }
                            localStorage.setItem('nearpro_user_tier', 'scout');
                            localStorage.setItem('claimed_coupon_LAUNCH100', 'true');

                            // Ensure pricing modal & consent modal are both closed
                            State.pricing_modal_open = false;
                            State.checkout_consent_modal_open = false;
                            close();
                            
                            // Set celebration success modal data
                            State.upgrade_success_data = {
                                tier: 'SCOUT PLAN (1-MONTH FREE)',
                                netPaid: '₹0 (100% OFF Coupon Claimed)',
                                paymentId: `claim_LAUNCH100_${Math.random().toString(36).slice(2, 8)}`,
                                features: [
                                    'Unlocked Phone Numbers & Website Details',
                                    'Export 100 Verified Leads per month',
                                    'Track 5 Custom Lead Lists',
                                    'Interactive Map Views & Suburb Radar'
                                ]
                            };
                            State.upgrade_success_modal_open = true;
                            State.notify();
                        }
                    } catch (e) {
                        console.error("Coupon redemption error:", e);
                        alert("Coupon redemption failed. Please try again.");
                        proceedBtn.innerText = 'Activate Free Scout Plan ➔';
                        proceedBtn.disabled = false;
                    }
                });
                return;
            }

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
