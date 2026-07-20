import { State } from '../state.js';
import { getUserTier, TIER_LEVELS } from '../auth.js';

export function renderPricingModal() {
    if (!State.pricing_modal_open) return '';

    const cycle = State.billing_cycle || 'monthly';
    const userTier = getUserTier();
    const userLevel = TIER_LEVELS[userTier] || 0;

    // Helper for rendering tier action button
    const renderTierBtn = (planId, btnStyle = '') => {
        if (planId === userTier) {
            return `<button class="secondary-btn" disabled style="padding: 8px 14px; font-size: 11.5px; flex-shrink: 0; opacity: 0.7; cursor: not-allowed; border-color: rgba(16, 185, 129, 0.4); color: #10b981; font-weight: 600;">Current Active Plan</button>`;
        }
        const targetLevel = TIER_LEVELS[planId] || 0;
        const planName = planId.charAt(0).toUpperCase() + planId.slice(1);
        if (targetLevel > userLevel) {
            return `<button class="brand-btn" style="padding: 8px 14px; font-size: 11.5px; flex-shrink: 0; ${btnStyle}" onclick="window.State.selectPlan('${planId}', '${cycle}');">Upgrade to ${planName}</button>`;
        } else {
            return `<button class="secondary-btn" style="padding: 8px 14px; font-size: 11.5px; flex-shrink: 0;" onclick="window.State.selectPlan('${planId}', '${cycle}');">Switch to ${planName}</button>`;
        }
    };

    // Pricing details mapping
    const pricing = {
        scout: cycle === 'monthly' 
            ? { price: '₹499', period: 'month', label: 'Billed monthly' } 
            : { price: '₹4,999', period: 'year', label: 'Billed yearly (Save ₹989)' },
        hunter: cycle === 'monthly' 
            ? { price: '₹999', period: 'month', label: 'Billed monthly' } 
            : { price: '₹9,999', period: 'year', label: 'Billed yearly (Save ₹1,989)' },
        agency: cycle === 'monthly' 
            ? { price: '₹2,499', period: 'month', label: 'Billed monthly' } 
            : { price: '₹24,999', period: 'year', label: 'Billed yearly (Save ₹4,989)' }
    };

    return `
        <div class="modal-overlay open" id="pricingModalOverlay" style="z-index: 10000;">
            <div class="modal-card" style="max-width: 580px; padding: 32px; text-align: center; position: relative; max-height: 90vh; overflow-y: auto;">
                <button class="modal-close-btn" id="closePricingModalBtn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer;">&times;</button>
                
                <div style="font-size: 40px; margin-bottom: 12px;">🚀</div>
                
                <h2 style="font-size: 22px; margin-bottom: 6px; font-family: var(--font-heading); color: white;">
                    Choose Your Growth Tier
                </h2>
                
                <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 20px; line-height: 1.5;">
                    Access verified lead intelligence and outreach tools designed for India. Choose a tier to unlock your pipeline.
                </p>

                <!-- Billing Switcher Segmented Control -->
                <div style="display: inline-flex; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 50px; padding: 4px; margin-bottom: 24px; gap: 4px;">
                    <button class="cycle-tab-btn ${cycle === 'monthly' ? 'active' : ''}" id="cycleMonthlyBtn" style="background:${cycle==='monthly'?'var(--accent-gold)':'none'}; color:${cycle==='monthly'?'black':'white'}; border:none; padding:6px 16px; border-radius:50px; font-size:11.5px; font-weight:600; cursor:pointer; transition:all 0.2s ease;">
                        Monthly Billing
                    </button>
                    <button class="cycle-tab-btn ${cycle === 'yearly' ? 'active' : ''}" id="cycleYearlyBtn" style="background:${cycle==='yearly'?'var(--accent-gold)':'none'}; color:${cycle==='yearly'?'black':'white'}; border:none; padding:6px 16px; border-radius:50px; font-size:11.5px; font-weight:600; cursor:pointer; transition:all 0.2s ease;">
                        Yearly Billing (Save 20%)
                    </button>
                </div>
                
                <!-- Plan Options Stack -->
                <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; text-align: left;">
                    
                    <!-- Explorer (Free) -->
                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); padding: 18px 20px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                        <div style="flex: 1;">
                            <h4 style="font-size: 14px; color: white; margin: 0 0 4px 0; font-family: var(--font-heading); display: flex; align-items: center; gap: 6px;">
                                Explorer — Free Forever
                                ${userTier === 'free' ? `<span style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #10b981; font-size: 9px; font-family: var(--font-mono); padding: 2px 6px; border-radius: 4px; font-weight: bold;">ACTIVE</span>` : ''}
                            </h4>
                            <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.4;">
                                Browse 12 profiles per search with masked contacts. Setup 1 list up to 5 leads. No exports or AI.
                            </p>
                        </div>
                        ${userTier === 'free' 
                            ? `<button class="secondary-btn" disabled style="padding: 8px 14px; font-size: 11.5px; flex-shrink: 0; opacity: 0.6; cursor: not-allowed; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">Current Active Plan</button>`
                            : `<button class="secondary-btn" style="padding: 8px 14px; font-size: 11.5px; flex-shrink: 0;" onclick="window.State.selectPlan('free');">Switch to Free</button>`
                        }
                    </div>
 
                    <!-- Scout -->
                    <div style="background: rgba(255, 160, 0, 0.02); border: 1px solid ${userTier === 'scout' ? 'rgba(16,185,129,0.5)' : 'rgba(255, 160, 0, 0.12)'}; padding: 18px 20px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                        <div style="flex: 1;">
                            <h4 style="font-size: 14px; color: var(--accent-gold); margin: 0 0 4px 0; font-family: var(--font-heading); display: flex; align-items: center; gap: 6px;">
                                Scout — ${pricing.scout.price}/${pricing.scout.period === 'month' ? 'mo' : 'yr'}
                                ${userTier === 'scout' ? `<span style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #10b981; font-size: 9px; font-family: var(--font-mono); padding: 2px 6px; border-radius: 4px; font-weight: bold;">ACTIVE PLAN</span>` : ''}
                            </h4>
                            <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.4; margin-bottom:4px;">
                                Unlocked phone numbers and websites. Map views active. Export 100 leads per month. Track 5 lists up to 50 leads each. Notes and QR codes active. **Includes basic rating & completeness stats**.
                            </p>
                            <span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase;">${pricing.scout.label}</span>
                        </div>
                        ${renderTierBtn('scout')}
                    </div>
 
                    <!-- Hunter -->
                    <div style="background: rgba(255, 160, 0, 0.04); border: 1px solid ${userTier === 'hunter' ? 'rgba(16,185,129,0.5)' : 'var(--accent-gold)'}; padding: 18px 20px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; gap: 12px; position: relative; box-shadow: 0 4px 20px rgba(255, 160, 0, 0.05);">
                        <div style="position: absolute; top: -10px; right: 12px; background: var(--accent-gold); color: black; font-size: 8px; font-family: var(--font-mono); padding: 2px 8px; border-radius: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Best Value</div>
                        <div style="flex: 1;">
                            <h4 style="font-size: 14px; color: var(--accent-gold); margin: 0 0 4px 0; font-family: var(--font-heading); display: flex; align-items: center; gap: 6px;">
                                Hunter — ${pricing.hunter.price}/${pricing.hunter.period === 'month' ? 'mo' : 'yr'}
                                ${userTier === 'hunter' ? `<span style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #10b981; font-size: 9px; font-family: var(--font-mono); padding: 2px 6px; border-radius: 4px; font-weight: bold;">ACTIVE PLAN</span>` : ''}
                            </h4>
                            <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.4; margin-bottom:4px;">
                                Business Health Check active. Lead Intelligence Scores visible. **500 WhatsApp AI Pitches (Hinglish/English)**. Unlimited exports. 20 lists. Pipeline tracking. **Includes geospatial metrics & target opportunities**.
                            </p>
                            <span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase;">${pricing.hunter.label}</span>
                        </div>
                        ${renderTierBtn('hunter')}
                    </div>
 
                    <!-- Agency -->
                    <div style="background: rgba(236, 72, 153, 0.02); border: 1px solid ${userTier === 'agency' ? 'rgba(16,185,129,0.5)' : 'rgba(236, 72, 153, 0.12)'}; padding: 18px 20px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                        <div style="flex: 1;">
                            <h4 style="font-size: 14px; color: var(--accent-pink); margin: 0 0 4px 0; font-family: var(--font-heading); display: flex; align-items: center; gap: 6px;">
                                Agency — ${pricing.agency.price}/${pricing.agency.period === 'month' ? 'mo' : 'yr'}
                                ${userTier === 'agency' ? `<span style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #10b981; font-size: 9px; font-family: var(--font-mono); padding: 2px 6px; border-radius: 4px; font-weight: bold;">ACTIVE PLAN</span>` : ''}
                            </h4>
                            <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.4; margin-bottom:4px;">
                                Website Prompt Engine active. CRM Kanban pipeline view. **Unlimited WhatsApp AI Pitches**. n8n webhook/Google Sheets integration. 3 team seats. **Includes density heatmaps & niche gap analysis**.
                            </p>
                            <span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase;">${pricing.agency.label}</span>
                        </div>
                        ${renderTierBtn('agency', 'background: linear-gradient(135deg, var(--accent-pink), #a855f7);')}
                    </div>

                    <!-- Enterprise -->
                    <div style="background: rgba(255, 255, 255, 0.01); border: 1px dashed rgba(255, 255, 255, 0.15); padding: 18px 20px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                        <div style="flex: 1;">
                            <h4 style="font-size: 14px; color: white; margin: 0 0 4px 0; font-family: var(--font-heading);">Enterprise — Custom</h4>
                            <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.4; margin-bottom:4px;">
                                Unlimited team seats, API access (PostgREST), multi-city data scraping on request, Salesforce/HubSpot integrations, and dedicated SLA support.
                            </p>
                            <span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase;">For large teams & custom scraping</span>
                        </div>
                        <a href="mailto:s8nservice@gmail.com?subject=NearPro%20Enterprise%20Plan%20Inquiry" class="brand-btn" style="padding: 8px 14px; font-size: 11.5px; flex-shrink: 0; background: var(--bg-surface); color: white; border: 1px solid var(--border); text-decoration: none; text-align: center; display: inline-block;">
                            Contact Us
                        </a>
                    </div>

                </div>
                
                <div style="font-size: 11px; color: var(--text-muted);">
                    All plans are billed in INR. Cancel your subscription anytime.
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

    const monthlyBtn = document.getElementById('cycleMonthlyBtn');
    const yearlyBtn = document.getElementById('cycleYearlyBtn');

    if (monthlyBtn) {
        monthlyBtn.addEventListener('click', () => {
            State.billing_cycle = 'monthly';
            State.notify();
        });
    }

    if (yearlyBtn) {
        yearlyBtn.addEventListener('click', () => {
            State.billing_cycle = 'yearly';
            State.notify();
        });
    }
}
