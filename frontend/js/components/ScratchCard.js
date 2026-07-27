import { State } from '../state.js';
import { Api } from '../api.js';

export function renderScratchCardWidget(remainingCount = 42) {
    return `
        <div class="scratch-card-container" style="background: linear-gradient(135deg, rgba(255, 160, 0, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%); border: 1.5px solid rgba(255, 160, 0, 0.3); border-radius: var(--radius-lg, 16px); padding: 24px; text-align: center; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.4); max-width: 480px; margin: 0 auto 28px;">
            
            <!-- Badge Header -->
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(255, 160, 0, 0.15); border: 1px solid rgba(255, 160, 0, 0.4); border-radius: 20px; color: var(--accent-gold, #ffa000); font-size: 11.5px; font-family: var(--font-mono); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; animation: pulse 2s infinite;">
                🔥 LAUNCH SPECIAL • FIRST 100 USERS GET SCOUT PLAN FREE
            </div>

            <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 6px;">
                Scratch Below to Claim Your Free Scout Plan! 🎁
            </h3>
            <p style="font-size: 12.5px; color: var(--text-secondary, #94a3b8); margin-bottom: 16px; line-height: 1.4;">
                Scratch off the silver card to reveal your 100% OFF coupon code.
            </p>

            <!-- Scratch Canvas Container -->
            <div style="position: relative; width: 280px; height: 75px; margin: 0 auto 16px; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.5); user-select: none;">
                
                <!-- Underneath Revealed Secret Code -->
                <div id="scratchCodeSecret" style="position: absolute; inset: 0; background: linear-gradient(135deg, #09090b, #18181b); border: 2px dashed var(--accent-gold, #ffa000); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1;">
                    <span style="font-size: 10px; font-family: var(--font-mono); color: var(--accent-gold); font-weight: 700; text-transform: uppercase;">Your Secret 100% OFF Code</span>
                    <span style="font-size: 24px; font-family: var(--font-mono); font-weight: 900; color: #ffffff; letter-spacing: 3px;">LAUNCH100</span>
                </div>

                <!-- Interactive Canvas Foil Overlay -->
                <canvas id="scratchCanvas" width="280" height="75" style="position: absolute; inset: 0; z-index: 2; cursor: pointer; touch-action: none;"></canvas>
            </div>

            <!-- Claim Status Bar -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; background: rgba(0,0,0,0.4); padding: 10px 14px; border-radius: 8px; font-size: 12px;">
                <span style="color: var(--text-secondary);">⚡ Remaining Free Coupons:</span>
                <span style="font-family: var(--font-mono); font-weight: 800; color: #22c55e;" id="scratchCardRemainingText">${remainingCount} / 100 Left</span>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 10px; margin-top: 14px;">
                <button id="copyScratchCodeBtn" class="secondary-btn" style="flex: 1; padding: 10px; font-size: 12.5px; border-radius: var(--radius-sm, 8px); justify-content: center; display: flex; align-items: center; gap: 6px;">
                    📋 Copy Code (LAUNCH100)
                </button>
                <button id="claimScratchCodeBtn" class="brand-btn" style="flex: 1.2; padding: 10px; font-size: 12.5px; font-weight: 700; border-radius: var(--radius-sm, 8px); justify-content: center; display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, var(--accent-gold, #ffa000), #ea580c); color: white;">
                    Claim Free Scout ➔
                </button>
            </div>
        </div>
    `;
}

export function initScratchCardCanvas() {
    const canvas = document.getElementById('scratchCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Draw metallic silver foil coating
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#94a3b8');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(1, '#64748b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Add metallic texture dots & text
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SCRATCH HERE WITH CURSOR ✨', width / 2, height / 2 + 5);

    let isScratching = false;

    function scratch(x, y) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    canvas.addEventListener('mousedown', (e) => { isScratching = true; const pos = getPos(e); scratch(pos.x, pos.y); });
    canvas.addEventListener('mousemove', (e) => { if (isScratching) { const pos = getPos(e); scratch(pos.x, pos.y); } });
    window.addEventListener('mouseup', () => { isScratching = false; });

    canvas.addEventListener('touchstart', (e) => { isScratching = true; const pos = getPos(e); scratch(pos.x, pos.y); });
    canvas.addEventListener('touchmove', (e) => { if (isScratching) { const pos = getPos(e); scratch(pos.x, pos.y); } });
    window.addEventListener('touchend', () => { isScratching = false; });

    // Copy Code Event
    const copyBtn = document.getElementById('copyScratchCodeBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('LAUNCH100');
            copyBtn.innerHTML = '✅ Code Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '📋 Copy Code (LAUNCH100)';
            }, 2000);
        });
    }

    // Claim Free Scout Plan Event
    const claimBtn = document.getElementById('claimScratchCodeBtn');
    if (claimBtn) {
        claimBtn.addEventListener('click', () => {
            State.setPricingModal(false);
            State.pending_checkout_plan = { planId: 'scout', interval: 'monthly', coupon: 'LAUNCH100' };
            if (!State.user) {
                localStorage.setItem('selected_nearpro_tier', 'scout');
                localStorage.setItem('selected_nearpro_coupon', 'LAUNCH100');
                State.setAuthModal(true);
            } else {
                State.checkout_consent_modal_open = true;
                State.notify();
            }
        });
    }
}
