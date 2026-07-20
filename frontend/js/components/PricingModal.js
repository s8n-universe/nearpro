import { State } from '../state.js';
import { getUserTier, TIER_LEVELS } from '../auth.js';

export function renderPricingModal() {
    if (!State.pricing_modal_open) return '';

    const cycle = State.billing_cycle || 'monthly';
    const userTier = getUserTier();
    const userLevel = TIER_LEVELS[userTier] || 0;

    // Detailed Plan Information mapping
    const planDetails = {
        free: {
            id: 'free',
            level: 0,
            name: 'Explorer Plan',
            tagline: 'Free Forever',
            priceMonthly: '₹0',
            priceYearly: '₹0',
            subtext: 'Basic search & evaluation access',
            badge: userTier === 'free' ? 'CURRENT ACTIVE PLAN' : null,
            features: [
                'Browse 12 verified leads per search',
                'Masked contact phone & email details',
                'Create 1 custom list (up to 5 leads)',
                'Basic category & area filtering'
            ]
        },
        scout: {
            id: 'scout',
            level: 1,
            name: 'Scout Plan',
            tagline: 'Lead Discovery Tier',
            priceMonthly: '₹499',
            priceYearly: '₹4,999',
            subtext: cycle === 'monthly' ? 'Billed monthly' : 'Billed yearly (Save ₹989)',
            badge: userTier === 'scout' ? 'CURRENT ACTIVE PLAN' : null,
            features: [
                'Unlocked Phone Numbers & Websites',
                'Export 100 Verified Leads per month',
                'Track 5 Custom Lead Lists (50 leads each)',
                'Interactive Map Views & Suburb Radar',
                'Notes, Status Tagging & QR Codes',
                'Rating & Completeness Score Filters'
            ]
        },
        hunter: {
            id: 'hunter',
            level: 2,
            name: 'Hunter Plan',
            tagline: 'Outreach & Growth Tier',
            priceMonthly: '₹999',
            priceYearly: '₹9,999',
            subtext: cycle === 'monthly' ? 'Billed monthly' : 'Billed yearly (Save ₹1,989)',
            badge: userTier === 'hunter' ? 'CURRENT ACTIVE PLAN' : 'BEST VALUE',
            features: [
                'Business Health Check & Lead Scores',
                '500 WhatsApp AI Pitches (Hinglish/English)',
                'Unlimited Lead CSV & Excel Exports',
                '20 Custom Lead Lists & Pipeline Tracking',
                'Geospatial Metrics & Opportunity Radar',
                'All Scout Plan Features Included'
            ]
        },
        agency: {
            id: 'agency',
            level: 3,
            name: 'Agency Plan',
            tagline: 'Scale & Automation Tier',
            priceMonthly: '₹2,499',
            priceYearly: '₹24,999',
            subtext: cycle === 'monthly' ? 'Billed monthly' : 'Billed yearly (Save ₹4,989)',
            badge: userTier === 'agency' ? 'CURRENT ACTIVE PLAN' : 'MAXIMUM POWER',
            features: [
                'Website Prompt Engine (AI Web Redesign)',
                'Unlimited WhatsApp AI Pitch Generation',
                'n8n Webhooks & Google Sheets Live Sync',
                '3 Workspace Seats & Density Heatmaps',
                'Niche Gap Analysis & Lead Scoring',
                'All Hunter Plan Features Included'
            ]
        }
    };

    // Filter out plans that are lower than the user's active tier
    // (e.g. If user is on Scout, hide Explorer; if on Hunter, hide Explorer & Scout)
    const availablePlanKeys = ['free', 'scout', 'hunter', 'agency'].filter(key => {
        const lvl = planDetails[key].level;
        if (userLevel === 0) return true; // Show all plans for free users
        return lvl >= userLevel; // For paid users, show current active plan and higher upgrade plans
    });

    const plansToRender = availablePlanKeys.map(k => planDetails[k]);

    return `
        <div class="modal-overlay open" id="pricingModalOverlay" style="z-index: 10000;">
            <div class="modal-card" style="max-width: 960px; width: 95%; padding: 36px; text-align: center; position: relative; max-height: 90vh; overflow-y: auto;">
                <button class="modal-close-btn" id="closePricingModalBtn" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='var(--text-muted)'">&times;</button>
                
                <div style="font-size: 40px; margin-bottom: 12px;">🚀</div>
                
                <h2 style="font-size: 26px; margin-bottom: 6px; font-family: var(--font-heading); color: white; font-weight: 700;">
                    Choose Your Growth Tier
                </h2>
                
                <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                    Access verified lead intelligence, AI outreach tools, and CRM pipelines designed for India.
                </p>

                <!-- Billing Switcher Segmented Control -->
                <div style="display: inline-flex; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 50px; padding: 4px; margin-bottom: 32px; gap: 4px;">
                    <button class="cycle-tab-btn ${cycle === 'monthly' ? 'active' : ''}" id="cycleMonthlyBtn" style="background:${cycle==='monthly'?'var(--accent-gold)':'none'}; color:${cycle==='monthly'?'black':'white'}; border:none; padding:8px 20px; border-radius:50px; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s ease;">
                        Monthly Billing
                    </button>
                    <button class="cycle-tab-btn ${cycle === 'yearly' ? 'active' : ''}" id="cycleYearlyBtn" style="background:${cycle==='yearly'?'var(--accent-gold)':'none'}; color:${cycle==='yearly'?'black':'white'}; border:none; padding:8px 20px; border-radius:50px; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s ease;">
                        Yearly Billing (Save 20%)
                    </button>
                </div>
                
                <!-- Grid of Plan Cards -->
                <div style="display: grid; grid-template-columns: repeat(${Math.min(plansToRender.length, 3)}, 1fr); gap: 20px; margin-bottom: 28px; text-align: left; align-items: stretch;">
                    ${plansToRender.map(plan => {
                        const isCurrentActive = plan.id === userTier;
                        const isHunter = plan.id === 'hunter';
                        const price = cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
                        const period = cycle === 'yearly' ? '/year' : '/month';

                        let borderColor = 'rgba(255, 255, 255, 0.1)';
                        let bgGradient = 'rgba(15, 23, 42, 0.6)';

                        if (isCurrentActive) {
                            borderColor = 'rgba(16, 185, 129, 0.5)';
                            bgGradient = 'rgba(16, 185, 129, 0.03)';
                        } else if (isHunter) {
                            borderColor = 'var(--accent-gold)';
                            bgGradient = 'rgba(255, 160, 0, 0.04)';
                        } else if (plan.id === 'agency') {
                            borderColor = 'rgba(236, 72, 153, 0.3)';
                            bgGradient = 'rgba(236, 72, 153, 0.03)';
                        }

                        return `
                            <div style="background: ${bgGradient}; border: 1.5px solid ${borderColor}; border-radius: var(--radius-md); padding: 24px; display: flex; flex-direction: column; justify-content: space-between; position: relative; backdrop-filter: blur(12px);">
                                
                                ${plan.badge ? `
                                    <div style="position: absolute; top: -12px; right: 16px; background: ${isCurrentActive ? '#10b981' : (isHunter ? 'var(--accent-gold)' : 'var(--accent-pink)')}; color: black; font-size: 9px; font-family: var(--font-mono); padding: 3px 10px; border-radius: 50px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                                        ${plan.badge}
                                    </div>
                                ` : ''}

                                <div>
                                    <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; font-weight: bold;">
                                        ${plan.tagline}
                                    </div>

                                    <h3 style="font-size: 18px; color: white; margin: 0 0 10px 0; font-family: var(--font-heading); font-weight: 700;">
                                        ${plan.name}
                                    </h3>

                                    <div style="margin-bottom: 16px; display: flex; align-items: baseline; gap: 4px;">
                                        <span style="font-size: 26px; font-weight: 800; color: white; font-family: var(--font-heading);">${price}</span>
                                        <span style="font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);">${period}</span>
                                    </div>

                                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 14px;">
                                        ${plan.subtext}
                                    </div>

                                    <!-- Bullet Features Checklist -->
                                    <ul style="list-style: none; padding: 0; margin: 0 0 24px 0; display: flex; flex-direction: column; gap: 10px;">
                                        ${plan.features.map(f => `
                                            <li style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
                                                <span style="color: #10b981; font-weight: bold; flex-shrink: 0; margin-top: 1px;">✓</span>
                                                <span style="color: #e2e8f0;">${f}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>

                                <!-- Action Button -->
                                <div>
                                    ${isCurrentActive ? `
                                        <button class="secondary-btn" disabled style="width: 100%; padding: 11px; font-size: 12.5px; font-weight: 700; opacity: 0.7; cursor: not-allowed; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
                                            Current Active Plan
                                        </button>
                                    ` : `
                                        <button class="brand-btn" style="width: 100%; padding: 11px; font-size: 12.5px; font-weight: 700; ${plan.id === 'agency' ? 'background: linear-gradient(135deg, var(--accent-pink), #a855f7);' : ''}" onclick="window.State.selectPlan('${plan.id}', '${cycle}');">
                                            ${plan.level > userLevel ? `Upgrade to ${plan.name.split(' ')[0]}` : `Switch to ${plan.name.split(' ')[0]}`}
                                        </button>
                                    `}
                                </div>

                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="font-size: 11.5px; color: var(--text-muted); font-family: var(--font-mono);">
                    🔒 256-Bit Encrypted Razorpay Checkout • 7-Day Money-Back Guarantee • Cancel Anytime
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
