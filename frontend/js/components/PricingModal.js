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
                'Website Prompt Engine (3 trial runs)',
                'Masked contact phone & email details',
                'Create 1 custom list (up to 5 leads)'
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
                'Website Prompt Engine (30 runs/month)',
                'Track 5 Custom Lead Lists (50 leads each)',
                'Interactive Map Views & Suburb Radar',
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
                'Website Prompt Engine (60 runs/month)',
                'Business Health Check & Lead Scores',
                '500 AI Outreach runs (Hinglish/English)',
                'Unlimited Lead CSV & Excel Exports',
                '20 Custom Lead Lists & Pipeline Tracking',
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
                'Website Prompt Engine (100 runs/month)',
                'Unlimited AI Outreach runs',
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
            <div class="modal-overlay open" id="pricingModalOverlay" style="z-index: 100050; background: rgba(15,23,42,0.4) !important; backdrop-filter: blur(4px) !important;">
                <div class="modal-card pricing-modal-inner" style="max-width: 500px; width: 95%; padding: 36px; text-align: center; position: relative; background: #ffffff !important; color: #0f172a !important; border: 1px solid #e2e8f0 !important; border-radius:16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
                    <button class="modal-close-btn" id="closePricingModalBtn" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: #64748b; font-size: 24px; cursor: pointer;">&times;</button>
                    <div style="font-size: 40px; margin-bottom: 12px;">👑</div>
                    <h2 style="font-size: 22px; margin-bottom: 12px; font-family: var(--font-heading); color: #0f172a; font-weight: 800;">
                        Enterprise Tier Active
                    </h2>
                    <p style="color: #475569; font-size: 13.5px; line-height: 1.5; margin-bottom: 24px;">
                        You are currently on the highest plan (Enterprise Plan). Thank you for using NearPro! If you need to make any changes to your subscription, please contact support.
                    </p>
                    <a href="mailto:s8nservice@gmail.com?subject=NearPro%20Subscription%20Inquiry" class="brand-btn" style="padding: 10px 24px; text-decoration: none; display: inline-block; background: #2563eb; color: white; border: none; border-radius: 6px; font-weight: 700;">
                        Contact Support
                    </a>
                </div>
            </div>
        `;
    }

    return `
        <div class="modal-overlay open" id="pricingModalOverlay" style="z-index: 100050; background: rgba(15,23,42,0.4) !important; backdrop-filter: blur(4px) !important;">
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
            <div class="modal-card pricing-modal-inner" style="max-width: 1100px; width: 95%; padding: 36px; text-align: center; position: relative; max-height: 90vh; overflow-y: auto; background: #ffffff !important; color: #0f172a !important; border: 1px solid #e2e8f0 !important; border-radius:16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
                <button class="modal-close-btn" id="closePricingModalBtn" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: #64748b; font-size: 24px; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#0f172a'" onmouseout="this.style.color='#64748b'">&times;</button>
                
                <div style="font-size: 32px; margin-bottom: 12px;">🚀</div>
                
                <h2 style="font-size: 24px; margin-bottom: 6px; font-family: var(--font-heading); color: #0f172a; font-weight: 800;">
                    Choose your plan
                </h2>
                
                <p style="color: #475569; font-size: 13.5px; margin-bottom: 24px; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                    Access verified lead intelligence, AI outreach tools, and CRM pipelines.
                </p>

                <!-- Billing Switcher Control -->
                <div style="display: inline-flex; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 50px; padding: 4px; margin-bottom: 32px; gap: 4px;">
                    <button class="cycle-tab-btn ${cycle === 'monthly' ? 'active' : ''}" id="cycleMonthlyBtn" style="background:${cycle==='monthly'?'#ffffff':'none'}; color:${cycle==='monthly'?'#0f172a':'#64748b'}; border:none; padding:8px 20px; border-radius:50px; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s ease; box-shadow:${cycle==='monthly'?'0 2px 4px rgba(0,0,0,0.05)':'none'};">
                        Monthly
                    </button>
                    <button class="cycle-tab-btn ${cycle === 'yearly' ? 'active' : ''}" id="cycleYearlyBtn" style="background:${cycle==='yearly'?'#2563eb':'none'}; color:${cycle==='yearly'?'#ffffff':'#64748b'}; border:none; padding:8px 20px; border-radius:50px; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s ease; box-shadow:${cycle==='yearly'?'0 2px 4px rgba(37,99,235,0.15)':'none'};">
                        Annual (Save 20%)
                    </button>
                </div>
                
                <!-- Grid of Plan Cards -->
                <div class="pricing-plans-grid">
                    ${plansToRender.map(plan => {
                        const isCurrentActive = plan.id === userTier;
                        const isHunter = plan.id === 'hunter';
                        const price = plan.id === 'enterprise' ? 'Custom' : (cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly);
                        const period = plan.id === 'enterprise' ? '' : (cycle === 'yearly' ? '/year' : '/month');

                        let borderColor = '#e2e8f0';
                        let bgGradient = '#ffffff';
                        let badgeBg = '#f1f5f9';
                        let badgeColor = '#475569';

                        if (isCurrentActive) {
                            borderColor = '#10b981';
                            bgGradient = '#f0fdf4';
                            badgeBg = '#dcfce7';
                            badgeColor = '#15803d';
                        } else if (isHunter) {
                            borderColor = '#2563eb';
                            bgGradient = '#eff6ff';
                            badgeBg = '#dbeafe';
                            badgeColor = '#1d4ed8';
                        } else if (plan.id === 'agency') {
                            borderColor = '#db2777';
                            bgGradient = '#fdf2f8';
                            badgeBg = '#fce7f3';
                            badgeColor = '#c9186b';
                        }

                        return `
                            <div style="background: ${bgGradient}; border: 1.5px solid ${borderColor}; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
                                
                                ${plan.badge ? `
                                    <div style="position: absolute; top: -12px; right: 16px; background: ${badgeBg}; color: ${badgeColor}; font-size: 9px; font-family: var(--font-mono); padding: 3px 10px; border-radius: 50px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid ${borderColor};">
                                        ${plan.badge}
                                    </div>
                                ` : ''}

                                <div>
                                    <div style="font-size: 10px; font-family: var(--font-mono); color: #64748b; text-transform: uppercase; margin-bottom: 4px; font-weight: bold;">
                                        ${plan.tagline}
                                    </div>

                                    <h3 style="font-size: 16px; color: #0f172a; margin: 0 0 10px 0; font-family: var(--font-heading); font-weight: 800;">
                                        ${plan.name}
                                    </h3>

                                    <div style="margin-bottom: 16px; display: flex; align-items: baseline; gap: 4px;">
                                        <span style="font-size: 24px; font-weight: 800; color: #0f172a; font-family: var(--font-heading);">${price}</span>
                                        <span style="font-size: 11px; color: #64748b; font-family: var(--font-mono);">${period}</span>
                                    </div>

                                    <div style="font-size: 11px; color: #475569; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 14px; min-height: 32px;">
                                        ${plan.subtext}
                                    </div>

                                    <!-- Bullet Features Checklist -->
                                    <ul style="list-style: none; padding: 0; margin: 0 0 24px 0; display: flex; flex-direction: column; gap: 10px;">
                                        ${plan.features.map(f => `
                                            <li style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #475569; line-height: 1.4;">
                                                <span style="color: #10b981; font-weight: bold; flex-shrink: 0; margin-top: 1px;">✓</span>
                                                <span style="color: #334155;">${f}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>

                                <!-- Action Button -->
                                <div>
                                    ${isCurrentActive ? `
                                        <button class="secondary-btn" disabled style="width: 100%; padding: 11px; font-size: 12px; font-weight: 700; opacity: 0.7; cursor: not-allowed; border: 1.5px solid #cbd5e1; background: #f8fafc; color: #64748b; border-radius:6px;">
                                            Current active plan
                                        </button>
                                    ` : plan.id === 'enterprise' ? `
                                        <a href="mailto:s8nservice@gmail.com?subject=NearPro%20Enterprise%20Plan%20Inquiry" class="brand-btn" style="width: 100%; padding: 11px; font-size: 12px; font-weight: 700; text-decoration: none; text-align: center; display: block; box-sizing: border-box; background: #ffffff; color: #0f172a; border: 1px solid #cbd5e1; border-radius:6px;">
                                            Contact sales
                                        </a>
                                    ` : `
                                        <button class="brand-btn" style="width: 100%; padding: 11px; font-size: 12px; font-weight: 700; background: ${plan.id === 'agency' ? '#db2777' : '#2563eb'}; color: white; border: none; cursor: pointer; border-radius:6px;" onclick="window.State.selectPlan('${plan.id}', '${cycle}');">
                                            ${plan.level > userLevel ? 'Upgrade plan' : 'Switch plan'}
                                        </button>
                                    `}
                                </div>

                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="font-size: 11.5px; color: #64748b; font-family: var(--font-mono);">
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
