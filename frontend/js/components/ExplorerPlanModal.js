import { State } from '../state.js';

export function renderExplorerPlanModal() {
    if (!State.explorer_plan_modal_open) return '';

    return `
        <div class="modal-overlay open" id="explorerPlanModalOverlay" style="z-index: 10005; background: rgba(0, 0, 0, 0.7) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important;">
            <div class="modal-card pricing-modal-inner" style="max-width: 520px; width: 95%; padding: 36px; text-align: center; position: relative; background: #0a0a0c !important; color: #ffffff !important; border: 1.5px solid var(--accent-gold) !important; border-radius: var(--radius-lg); box-shadow: 0 0 25px rgba(255, 160, 0, 0.25);">
                <button class="modal-close-btn" id="closeExplorerPlanModalBtn" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#94a3b8'">&times;</button>
                
                <div style="font-size: 44px; margin-bottom: 16px; filter: drop-shadow(0 0 10px rgba(255,160,0,0.4));">🧭</div>
                
                <h2 style="font-size: 24px; margin-bottom: 6px; font-family: var(--font-heading); color: white; font-weight: 800; letter-spacing: -0.5px;">
                    Explorer Plan (Free Forever)
                </h2>
                
                <p style="color: #cbd5e1; font-size: 13.5px; margin-bottom: 24px; line-height: 1.5;">
                    Unlock instant access to NearPro's lead intelligence & cold outreach suite absolutely free.
                </p>

                <!-- Features Checklist -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-md); padding: 20px; margin-bottom: 28px; text-align: left; display: flex; flex-direction: column; gap: 12px;">
                    <div style="font-size: 11px; font-family: var(--font-mono); color: var(--accent-gold); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Included Free Features:</div>
                    
                    <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                        <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: #cbd5e1; line-height: 1.4;">
                            <span style="color: var(--accent-gold); font-weight: bold; flex-shrink: 0; margin-top: 1px;">✓</span>
                            <span><strong>12 Leads per Search</strong>: Fully unlocked contact phone & web details</span>
                        </div>
                        <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: #cbd5e1; line-height: 1.4;">
                            <span style="color: var(--accent-gold); font-weight: bold; flex-shrink: 0; margin-top: 1px;">✓</span>
                            <span><strong>CSV Lead Exports</strong>: Export up to 15 leads / month</span>
                        </div>
                        <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: #cbd5e1; line-height: 1.4;">
                            <span style="color: var(--accent-gold); font-weight: bold; flex-shrink: 0; margin-top: 1px;">✓</span>
                            <span><strong>Business Health Checks</strong>: 2 website audits / month</span>
                        </div>
                        <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: #cbd5e1; line-height: 1.4;">
                            <span style="color: var(--accent-gold); font-weight: bold; flex-shrink: 0; margin-top: 1px;">✓</span>
                            <span><strong>AI Outreach Studio</strong>: Draft 3 personalized cold pitches / month</span>
                        </div>
                        <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: #cbd5e1; line-height: 1.4;">
                            <span style="color: var(--accent-gold); font-weight: bold; flex-shrink: 0; margin-top: 1px;">✓</span>
                            <span><strong>Smart List Pipelines</strong>: Track 1 custom list of up to 10 leads</span>
                        </div>
                        <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: #cbd5e1; line-height: 1.4;">
                            <span style="color: var(--accent-gold); font-weight: bold; flex-shrink: 0; margin-top: 1px;">✓</span>
                            <span><strong>Proposals & Sales Scripts</strong>: 1 proposal & 1 script / month</span>
                        </div>
                    </div>
                </div>

                <button class="brand-btn" id="explorerPlanClaimBtn" style="width: 100%; padding: 13px; font-size: 13.5px; font-weight: 700; background: linear-gradient(135deg, var(--accent-gold), #ea580c); color: white; border: none; cursor: pointer; border-radius: var(--radius-sm); box-shadow: 0 4px 15px rgba(251, 191, 36, 0.25);">
                    Sign Up / Log In Free Now ➔
                </button>
            </div>
        </div>
    `;
}

export function bindExplorerPlanModalEvents() {
    const closeBtn = document.getElementById('closeExplorerPlanModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            State.explorer_plan_modal_open = false;
            State.notify();
        });
    }

    const claimBtn = document.getElementById('explorerPlanClaimBtn');
    if (claimBtn) {
        claimBtn.addEventListener('click', () => {
            State.explorer_plan_modal_open = false;
            State.setAuthModal(true);
        });
    }
}
