import { State } from '../state.js';
import { Api } from '../api.js';
import { getUserTier, TIER_LEVELS, TIER_PRICING } from '../auth.js';

export function renderCheckoutPage(planId = 'hunter', cycle = 'monthly') {
    const userTier = getUserTier();
    const userLevel = TIER_LEVELS[userTier] || 0;
    const targetLevel = TIER_LEVELS[planId] || 2;
    const isUpgrade = targetLevel > userLevel && userLevel > 0;

    // Pricing mapping
    const planInfo = {
        scout: {
            name: 'Scout Plan',
            monthlyPrice: 499,
            yearlyPrice: 4999,
            features: [
                'Unlocked Phone Numbers & Websites',
                'Export 100 Leads per Month',
                'Website Prompt Engine (30 runs/month)',
                'Interactive Map & Suburb Radar'
            ]
        },
        hunter: {
            name: 'Hunter Plan',
            monthlyPrice: 999,
            yearlyPrice: 9999,
            features: [
                'Website Prompt Engine (60 runs/month)',
                '500 AI Outreach runs (Hinglish/English)',
                'Business Health Check & Lead Scores',
                'Unlimited Lead Exports'
            ]
        },
        agency: {
            name: 'Agency Plan',
            monthlyPrice: 2499,
            yearlyPrice: 24999,
            features: [
                'Website Prompt Engine (100 runs/month)',
                'Unlimited AI Outreach runs',
                'n8n Webhook & Google Sheets Integration',
                '3 Workspace Seats & Density Heatmaps'
            ]
        }
    };

    const details = planInfo[planId] || planInfo.hunter;
    const basePrice = cycle === 'yearly' ? details.yearlyPrice : details.monthlyPrice;
    
    // Proration calculation for mid-cycle upgrades
    let prorationCredit = 0;
    if (isUpgrade) {
        const prevInfo = planInfo[userTier];
        if (prevInfo) {
            const prevPrice = cycle === 'yearly' ? prevInfo.yearlyPrice : prevInfo.monthlyPrice;
            // Calculate ~66% unused credit assumption for mid-cycle upgrade simulation
            prorationCredit = Math.round((prevPrice / 30) * 20);
        }
    }

    const netPayable = Math.max(0, basePrice - prorationCredit);

    const userName = State.profile?.full_name || '';
    const userEmail = State.user?.email || '';
    const userPhone = State.profile?.phone || '';
    const userCompany = State.profile?.company_name || '';

    return `
        <style>
            .checkout-grid {
                display: grid;
                grid-template-columns: 1.15fr 0.85fr;
                gap: 32px;
                align-items: start;
            }
            .checkout-sub-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            @media (max-width: 768px) {
                .checkout-grid {
                    grid-template-columns: 1fr !important;
                    gap: 24px !important;
                }
                .checkout-sub-grid {
                    grid-template-columns: 1fr !important;
                    gap: 16px !important;
                }
                .checkout-page-wrapper {
                    padding: 20px 10px !important;
                }
            }
        </style>
        <div class="checkout-page-wrapper" style="min-height: 100vh; background: var(--bg-base); color: white; padding: 40px 20px;">
            <div style="max-width: 1000px; margin: 0 auto;">
                
                <!-- Page Top Bar -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                    <a href="#/pricing" style="color: var(--text-secondary); text-decoration: none; font-size: 13.5px; display: inline-flex; align-items: center; gap: 6px; font-weight: 500;" onmouseover="this.style.color='white'" onmouseout="this.style.color='var(--text-secondary)'">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        Return to Pricing Options
                    </a>

                    <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; padding: 6px 14px; border-radius: 50px; font-size: 12px; font-family: var(--font-mono); font-weight: 600;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        256-Bit SSL Encrypted Checkout
                    </div>
                </div>

                <!-- Page Header -->
                <div style="margin-bottom: 32px;">
                    <h1 style="font-size: 28px; font-family: var(--font-heading); font-weight: 700; margin: 0 0 8px 0; color: white;">
                        ${isUpgrade ? 'Upgrade Subscription Checkout' : 'Complete Your Purchase'}
                    </h1>
                    <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                        ${isUpgrade ? `Upgrading from ${userTier.toUpperCase()} Plan to ${details.name}. Review your itemized invoice below.` : `Subscribe to NearPro ${details.name} and unlock your lead generation pipeline.`}
                    </p>
                </div>

                <!-- 2-Column Checkout Grid -->
                <div class="checkout-grid">
                    
                    <!-- Left Column: Billing Details & Payment Actions -->
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        
                        <!-- Card 1: Customer Billing Info -->
                        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; backdrop-filter: blur(12px);">
                            <h3 style="font-size: 16px; color: white; font-family: var(--font-heading); font-weight: 700; margin: 0 0 18px 0; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
                                1. Billing & Contact Details
                            </h3>

                            <div style="display: flex; flex-direction: column; gap: 16px;">
                                <div class="checkout-sub-grid">
                                    <div>
                                        <label style="display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; margin-bottom: 6px; font-family: var(--font-heading);">Full Name</label>
                                        <input type="text" id="checkoutFullName" value="${userName}" placeholder="Shri Naik" style="width: 100%; padding: 10px 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none;" />
                                    </div>
                                    <div>
                                        <label style="display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; margin-bottom: 6px; font-family: var(--font-heading);">Email Address</label>
                                        <input type="email" id="checkoutEmail" value="${userEmail}" readonly style="width: 100%; padding: 10px 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 13.5px; outline: none; cursor: not-allowed;" />
                                    </div>
                                </div>

                                <div class="checkout-sub-grid">
                                    <div>
                                        <label style="display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; margin-bottom: 6px; font-family: var(--font-heading);">Phone Number (Optional)</label>
                                        <input type="tel" id="checkoutPhone" value="${userPhone}" placeholder="+91 98765 43210" style="width: 100%; padding: 10px 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none;" />
                                    </div>
                                    <div>
                                        <label style="display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; margin-bottom: 6px; font-family: var(--font-heading);">Company Name (Optional)</label>
                                        <input type="text" id="checkoutCompany" value="${userCompany}" placeholder="NearPro Agency" style="width: 100%; padding: 10px 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none;" />
                                    </div>
                                </div>

                                <div>
                                    <label style="display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; margin-bottom: 6px; font-family: var(--font-heading);">
                                        GSTIN Number <span style="font-weight: normal; color: var(--text-muted);">(Optional for B2B GST Tax Invoice)</span>
                                    </label>
                                    <input type="text" id="checkoutGstin" placeholder="e.g. 27AAAAA0000A1Z5" style="width: 100%; padding: 10px 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13.5px; outline: none; font-family: var(--font-mono); text-transform: uppercase;" />
                                </div>
                            </div>
                        </div>

                        <!-- Card 2: Consumer Protection Guarantees -->
                        <div class="checkout-sub-grid" style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; backdrop-filter: blur(12px);">
                            <div style="display: flex; gap: 10px; align-items: flex-start;">
                                <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                                </div>
                                <div>
                                    <div style="font-size: 12.5px; color: white; font-weight: 600; font-family: var(--font-heading);">7-Day Money Back Guarantee</div>
                                    <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">100% refund window for all initial subscriptions.</div>
                                </div>
                            </div>

                            <div style="display: flex; gap: 10px; align-items: flex-start;">
                                <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(255, 160, 0, 0.1); border: 1px solid rgba(255, 160, 0, 0.2); color: var(--accent-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                                </div>
                                <div>
                                    <div style="font-size: 12.5px; color: white; font-weight: 600; font-family: var(--font-heading);">1-Click Cancel Anytime</div>
                                    <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">Stop renewal easily in Settings without long lock-ins.</div>
                                </div>
                            </div>
                        </div>

                        <!-- Card 3: Terms Authorization & Payment Action Button -->
                        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; backdrop-filter: blur(12px);">
                            
                            <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px;">
                                <input type="checkbox" id="checkoutTermsConsentCb" style="margin-top: 2px; cursor: pointer;">
                                <span>
                                    I agree to NearPro's <a href="#/terms" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Terms of Service</a> & <a href="#/privacy" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Privacy Policy</a>, and authorize subscription billing via Razorpay.
                                </span>
                            </label>

                            <button id="startRazorpayCheckoutBtn" class="brand-btn" disabled style="width: 100%; padding: 14px; font-size: 15px; font-weight: 700; opacity: 0.5; cursor: not-allowed; transition: all 0.2s ease;">
                                Pay ₹${netPayable.toLocaleString('en-IN')} via Razorpay
                            </button>
                        </div>

                    </div>

                    <!-- Right Column: Itemized Order Summary Card -->
                    <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--accent-gold); border-radius: var(--radius-md); padding: 24px; backdrop-filter: blur(12px); position: sticky; top: 20px;">
                        
                        <div style="font-size: 11px; color: var(--accent-gold); font-family: var(--font-mono); text-transform: uppercase; font-weight: bold; margin-bottom: 6px; letter-spacing: 0.5px;">
                            Order Summary
                        </div>

                        <h3 style="font-size: 20px; color: white; margin: 0 0 4px 0; font-family: var(--font-heading);">
                            ${details.name}
                        </h3>

                        <div style="font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 18px;">
                            ${cycle === 'yearly' ? 'Billed Yearly (Save 20%)' : 'Billed Monthly'}
                        </div>

                        <ul style="list-style: none; padding: 0; margin: 0 0 24px 0; font-size: 12px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px; border-bottom: 1px solid var(--border); padding-bottom: 18px;">
                            ${details.features.map(f => `
                                <li style="display: flex; align-items: center; gap: 8px;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" style="flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
                                    <span>${f}</span>
                                </li>
                            `).join('')}
                        </ul>

                        <!-- Itemized Financial Math Table -->
                        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
                            <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
                                <span>Base Plan Price:</span>
                                <span style="color: white; font-weight: 600;">₹${basePrice.toLocaleString('en-IN')}</span>
                            </div>

                            ${isUpgrade ? `
                                <div style="display: flex; justify-content: space-between; color: #10b981;">
                                    <span>Unused ${userTier.toUpperCase()} Credit:</span>
                                    <span style="font-weight: 600;">-₹${prorationCredit.toLocaleString('en-IN')}</span>
                                </div>
                            ` : ''}

                            <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
                                <span>GST / Taxes:</span>
                                <span style="color: var(--text-muted);">Included</span>
                            </div>

                            <div style="border-top: 1px dashed rgba(255, 255, 255, 0.15); padding-top: 12px; margin-top: 4px; display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 14px; font-weight: 700; color: white; font-family: var(--font-heading);">Total Payable Today:</span>
                                <span style="font-size: 22px; font-weight: 800; color: var(--accent-gold); font-family: var(--font-heading);">₹${netPayable.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    `;
}

export function bindCheckoutPageEvents(planId = 'hunter', cycle = 'monthly') {
    const consentCb = document.getElementById('checkoutTermsConsentCb');
    const payBtn = document.getElementById('startRazorpayCheckoutBtn');

    // Calculate netPayable for fallback text on error
    const userTier = getUserTier();
    const userLevel = TIER_LEVELS[userTier] || 0;
    const targetLevel = TIER_LEVELS[planId] || 2;
    const isUpgrade = targetLevel > userLevel && userLevel > 0;
    const planInfo = {
        scout: { monthlyPrice: 499, yearlyPrice: 4999 },
        hunter: { monthlyPrice: 999, yearlyPrice: 9999 },
        agency: { monthlyPrice: 2499, yearlyPrice: 24999 }
    };
    const details = planInfo[planId] || planInfo.hunter;
    const basePrice = cycle === 'yearly' ? details.yearlyPrice : details.monthlyPrice;
    let prorationCredit = 0;
    if (isUpgrade) {
        const prevInfo = planInfo[userTier];
        if (prevInfo) {
            const prevPrice = cycle === 'yearly' ? prevInfo.yearlyPrice : prevInfo.monthlyPrice;
            prorationCredit = Math.round((prevPrice / 30) * 20);
        }
    }
    const netPayable = Math.max(0, basePrice - prorationCredit);

    if (consentCb && payBtn) {
        consentCb.addEventListener('change', () => {
            if (consentCb.checked) {
                payBtn.disabled = false;
                payBtn.style.opacity = '1';
                payBtn.style.cursor = 'pointer';
            } else {
                payBtn.disabled = true;
                payBtn.style.opacity = '0.5';
                payBtn.style.cursor = 'not-allowed';
            }
        });
    }

    if (payBtn) {
        payBtn.addEventListener('click', async () => {
            if (!consentCb || !consentCb.checked) return;

            payBtn.innerText = 'Initializing Secure Payment...';
            payBtn.disabled = true;

            try {
                // Save updated billing info
                const name = document.getElementById('checkoutFullName')?.value.trim();
                const phone = document.getElementById('checkoutPhone')?.value.trim();
                const company = document.getElementById('checkoutCompany')?.value.trim();

                if (name && State.user?.id) {
                    await Api.supabase.from('profiles').update({
                        full_name: name,
                        phone: phone,
                        company_name: company
                    }).eq('id', State.user.id);
                }

                await Api.checkoutSubscription(planId, cycle);
            } catch (err) {
                console.error("Checkout payment error:", err);
                payBtn.innerText = `Pay ₹${netPayable.toLocaleString('en-IN')} via Razorpay`;
                payBtn.disabled = false;
                const statusDiv = document.getElementById('checkoutErrorStatusDiv');
                if (statusDiv) {
                    statusDiv.innerText = err.message || "Payment processing failed. Please try again.";
                    statusDiv.style.display = 'block';
                }
            }
        });
    }
}
