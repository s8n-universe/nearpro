import { State } from '../state.js';
import { Api } from '../api.js';

export function renderCancelSubscriptionModal() {
    if (!State.cancel_subscription_modal_open) return '';

    const currentTier = (State.profile?.subscription_tier || State.user?.tier || 'Scout').toUpperCase();

    return `
        <div class="modal-overlay open" id="cancelSubscriptionModalOverlay" style="z-index: 100055; background: rgba(0, 0, 0, 0.86) !important; backdrop-filter: blur(14px) !important; -webkit-backdrop-filter: blur(14px) !important;">
            <div class="modal-card" style="max-width: 480px; width: 92%; padding: 32px; text-align: center; position: relative; background: #09090b !important; color: #ffffff !important; border: 1.5px solid rgba(239, 68, 68, 0.4) !important; box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(239, 68, 68, 0.18); border-radius: 20px;">
                
                <button class="modal-close-btn" id="closeCancelSubscriptionModalBtn" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-size: 20px; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">&times;</button>
                
                <!-- Safeguard Header Badge -->
                <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 20px; color: #f87171; font-size: 11px; font-family: var(--font-mono); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                    ⚠️ SUBSCRIPTION CANCELLATION SAFEGUARD
                </div>

                <h3 style="font-family: var(--font-heading); font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
                    Cancel Your ${currentTier} Subscription?
                </h3>
                <p style="font-size: 13px; color: var(--text-secondary, #94a3b8); margin: 0 0 20px 0; line-height: 1.5;">
                    Cancelling will immediately downgrade your workspace to the free <strong style="color: #ffffff;">Explorer Plan</strong>. You will lose unlocked owner phone numbers, lead export privileges, and custom CRM sync.
                </p>

                <!-- Confirmation Code Input -->
                <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left;">
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #f87171; margin-bottom: 8px; font-family: var(--font-mono);">
                        To confirm cancellation, type "CANCEL" below:
                    </label>
                    <input type="text" id="confirmCancelMatchInput" placeholder="Type CANCEL here" style="width: 100%; padding: 10px 14px; background: rgba(0,0,0,0.6); border: 1px solid rgba(239, 68, 68, 0.4); color: white; border-radius: 8px; font-family: var(--font-mono); font-size: 14px; font-weight: 700; outline: none; text-transform: uppercase; letter-spacing: 1px;">
                </div>

                <!-- Action Controls -->
                <div style="display: flex; gap: 12px;">
                    <button id="keepSubscriptionBtn" class="secondary-btn" style="flex: 1; padding: 12px; font-size: 13px; font-weight: 700; border-radius: 10px; justify-content: center;">
                        Keep Subscription
                    </button>
                    <button id="executeCancelSubscriptionBtn" disabled class="brand-btn" style="flex: 1.2; padding: 12px; font-size: 13px; font-weight: 700; border-radius: 10px; justify-content: center; background: #ef4444; color: white; opacity: 0.4; cursor: not-allowed; transition: all 0.2s ease;">
                        Confirm Cancellation
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function bindCancelSubscriptionModalEvents() {
    const overlay = document.getElementById('cancelSubscriptionModalOverlay');
    if (!overlay) return;

    const closeBtn = document.getElementById('closeCancelSubscriptionModalBtn');
    const keepBtn = document.getElementById('keepSubscriptionBtn');
    const executeBtn = document.getElementById('executeCancelSubscriptionBtn');
    const matchInput = document.getElementById('confirmCancelMatchInput');

    const close = () => {
        State.setCancelSubscriptionModal(false);
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (keepBtn) keepBtn.addEventListener('click', close);

    if (matchInput && executeBtn) {
        matchInput.addEventListener('input', () => {
            const val = matchInput.value.trim().toUpperCase();
            if (val === 'CANCEL') {
                executeBtn.disabled = false;
                executeBtn.style.opacity = '1';
                executeBtn.style.cursor = 'pointer';
            } else {
                executeBtn.disabled = true;
                executeBtn.style.opacity = '0.4';
                executeBtn.style.cursor = 'not-allowed';
            }
        });
    }

    if (executeBtn) {
        executeBtn.addEventListener('click', async () => {
            if (matchInput.value.trim().toUpperCase() !== 'CANCEL') return;

            executeBtn.innerText = 'Cancelling Subscription...';
            executeBtn.disabled = true;

            try {
                await Api.cancelSubscription();
                close();
                alert("✅ Subscription cancelled successfully. Workspace set to Explorer Plan.");
                window.location.hash = '#/dashboard/directory';
            } catch (err) {
                console.error("Cancellation error:", err);
                alert("❌ Cancellation failed. Please try again or contact support.");
                executeBtn.innerText = 'Confirm Cancellation';
                executeBtn.disabled = false;
            }
        });
    }
}
