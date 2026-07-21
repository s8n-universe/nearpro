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
                'Notes & Status Tagging',
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
        },
        enterprise: {
            id: 'enterprise',
            level: 4,
            name: 'Enterprise Plan',
            tagline: 'Enterprise Tier',
            priceMonthly: 'Custom',
            priceYearly: 'Custom',
            subtext: 'Contact sales for custom solutions',
            badge: userTier === 'enterprise' ? 'CURRENT ACTIVE PLAN' : 'CUSTOM SOLUTIONS',
            features: [
                'Unlimited team seats & shared lists',
                'Developer API access (PostgREST)',
                'Custom city database discovery runs',
                'Salesforce and HubSpot CRM sync',
                'Dedicated account manager & SLA'
            ]
        }
    };

    // Filter out plans that are less than or equal to the user's active tier
    // (Show only strictly higher upgrade plans)
    const availablePlanKeys = ['scout', 'hunter', 'agency', 'enterprise'].filter(key => {
        const lvl = planDetails[key].level;
        return lvl > userLevel;
    });

    const plansToRender = availablePlanKeys.map(k => planDetails[k]);

    if (plansToRender.length === 0) {
        return `
            <div class="modal-overlay open" id="pricingModalOverlay" style="z-index: 10000;">
                <div class="modal-card pricing-modal-inner" style="max-width: 500px; width: 95%; padding: 36px; text-align: center; position: relative;">
                    <button class="modal-close-btn" id="closePricingModalBtn" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer;">&times;</button>
                    <div style="font-size: 40px; margin-bottom: 12px;">👑</div>
                    <h2 style="font-size: 24px; margin-bottom: 12px; font-family: var(--font-heading); color: white; font-weight: 700;">
                        Enterprise Tier Active
                    </h2>
                    <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
                        You are currently on the highest plan (Enterprise Plan). Thank you for using NearPro! If you need to make any changes to your subscription, please contact support.
                    </p>
                    <a href="mailto:s8nservice@gmail.com?subject=NearPro%20Subscription%20Inquiry" class="brand-btn" style="padding: 10px 24px; text-decoration: none; display: inline-block;">
                        Contact Support
                    </a>
                </div>
            </div>
        `;
    }

    return `
        <div class="modal-overlay open" id="pricingModalOverlay" style="z-index: 10000;">
            <style>
                .pricing-plans-grid {
                    display: grid;
                    grid-template-columns: repeat(${plansToRender.length}, 1fr);
                    gap: 16px;
                    margin-bottom: 28px;
                    text-align: left;
                    align-items: stretch;
                }
                @media (max-width: 1024px) {
                    .pricing-plans-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 600px) {
                    .pricing-plans-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .pricing-modal-inner {
                        padding: 24px 16px !important;
                    }
                }
            </style>
            <div class="modal-card pricing-modal-inner" style="max-width: 1200px; width: 95%; padding: 36px; text-align: center; position: relative; max-height: 90vh; overflow-y: auto;">
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
                <div class="pricing-plans-grid">
                    ${plansToRender.map(plan => {
                        const isCurrentActive = plan.id === userTier;
                        const isHunter = plan.id === 'hunter';
                        const price = plan.id === 'enterprise' ? 'Custom' : (cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly);
                        const period = plan.id === 'enterprise' ? '' : (cycle === 'yearly' ? '/year' : '/month');

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
                        } else if (plan.id === 'enterprise') {
                            borderColor = 'rgba(255, 255, 255, 0.3)';
                            bgGradient = 'rgba(255, 255, 255, 0.02)';
                        }

                        return `
                            <div style="background: ${bgGradient}; border: 1.5px solid ${borderColor}; border-radius: var(--radius-md); padding: 24px; display: flex; flex-direction: column; justify-content: space-between; position: relative; backdrop-filter: blur(12px);">
                                
                                ${plan.badge ? `
                                    <div style="position: absolute; top: -12px; right: 16px; background: ${isCurrentActive ? '#10b981' : (isHunter ? 'var(--accent-gold)' : (plan.id === 'agency' ? 'var(--accent-pink)' : '#64748b'))}; color: ${plan.id === 'enterprise' ? 'white' : 'black'}; font-size: 9px; font-family: var(--font-mono); padding: 3px 10px; border-radius: 50px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
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
                                    ` : plan.id === 'enterprise' ? `
                                        <a href="mailto:s8nservice@gmail.com?subject=NearPro%20Enterprise%20Plan%20Inquiry" class="brand-btn" style="width: 100%; padding: 11px; font-size: 12.5px; font-weight: 700; text-decoration: none; text-align: center; display: block; box-sizing: border-box; background: var(--bg-surface); color: white; border: 1px solid var(--border);">
                                            Contact Us
                                        </a>
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
                    🔒 Secure Encrypted Checkout • 7-Day Money-Back Guarantee • Cancel Anytime
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
