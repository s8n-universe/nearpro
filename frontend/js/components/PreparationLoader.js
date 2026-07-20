import { State } from '../state.js';

export function showPreparationLoader(upgradeData, onCompleteCallback) {
    // Remove any existing loader
    const existing = document.getElementById('preparationLoaderOverlay');
    if (existing) existing.remove();

    const tierName = (upgradeData?.tier || 'Hunter').toUpperCase();
    const netPaid = upgradeData?.netPaid || '999';
    const paymentId = upgradeData?.paymentId || `pay_${Math.random().toString(36).slice(2, 8)}`;

    const overlay = document.createElement('div');
    overlay.id = 'preparationLoaderOverlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(5, 5, 10, 0.92)';
    overlay.style.backdropFilter = 'blur(20px)';
    overlay.style.webkitBackdropFilter = 'blur(20px)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '999999';
    overlay.style.fontFamily = 'var(--font-sans, "Inter", sans-serif)';
    overlay.style.color = 'white';
    overlay.style.padding = '24px';

    // Step 1 HTML: Progress & Processing Animation
    overlay.innerHTML = `
        <div id="loaderCardContainer" style="max-width: 460px; width: 100%; background: var(--bg-surface, #12121a); border: 1px solid rgba(255, 160, 0, 0.25); border-radius: var(--radius-lg, 16px); padding: 32px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.6); position: relative;">
            
            <div id="loaderProcessingView" style="display: flex; flex-direction: column; align-items: center; gap: 24px;">
                <!-- Glowing Loader Ring -->
                <div style="position: relative; width: 72px; height: 72px;">
                    <div style="position: absolute; inset: 0; border: 4px solid rgba(255, 160, 0, 0.12); border-radius: 50%;"></div>
                    <div style="position: absolute; inset: 0; border: 4px solid transparent; border-top-color: var(--accent-gold, #ffa000); border-radius: 50%; animation: spin 0.9s linear infinite;"></div>
                    <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 24px;">⚡</div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <h3 style="font-size: 20px; font-weight: 700; margin: 0; font-family: var(--font-heading, inherit); color: white;">Processing Payment</h3>
                    <p id="loaderStatusText" style="font-size: 13px; color: var(--text-secondary, #a1a1aa); margin: 0; height: 20px; transition: opacity 0.2s ease;">Verifying Razorpay signature & security...</p>
                </div>

                <!-- Progress Bar -->
                <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.04);">
                    <div id="loaderProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ffa000, #22c55e); border-radius: 10px; transition: width 0.1s linear;"></div>
                </div>

                <div id="loaderPercentage" style="font-size: 12px; font-family: var(--font-mono, monospace); color: var(--accent-gold, #ffa000); font-weight: 600;">0%</div>
            </div>

        </div>

        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.96); }
                to { opacity: 1; transform: scale(1); }
            }
        </style>
    `;

    document.body.appendChild(overlay);

    const statusTexts = [
        "Verifying Razorpay security & payment signature...",  // 0s - 1s
        "Generating tax invoice & transaction receipt...",      // 1s - 2s
        "Activating your premium workspace tier..."             // 2s - 3s
    ];

    const totalTime = 3000; // 3 seconds crisp processing
    const stepInterval = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
        elapsed += stepInterval;
        const pct = Math.min(100, Math.round((elapsed / totalTime) * 100));

        const bar = document.getElementById('loaderProgressBar');
        const pctText = document.getElementById('loaderPercentage');
        const statusEl = document.getElementById('loaderStatusText');

        if (bar) bar.style.width = `${pct}%`;
        if (pctText) pctText.innerText = `${pct}%`;

        const idx = Math.min(statusTexts.length - 1, Math.floor((elapsed / totalTime) * statusTexts.length));
        if (statusEl && statusEl.innerText !== statusTexts[idx]) {
            statusEl.style.opacity = '0';
            setTimeout(() => {
                if (statusEl) {
                    statusEl.innerText = statusTexts[idx];
                    statusEl.style.opacity = '1';
                }
            }, 150);
        }

        if (elapsed >= totalTime) {
            clearInterval(timer);
            showConfirmationCard();
        }
    }, stepInterval);

    function showConfirmationCard() {
        const container = document.getElementById('loaderCardContainer');
        if (!container) return;

        let countdown = 3;
        let isNavigated = false;

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; animation: fadeIn 0.3s ease;">
                <!-- Green Success Badge -->
                <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(34, 197, 94, 0.12); border: 1.5px solid rgba(34, 197, 94, 0.4); color: #22c55e; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                    ✓
                </div>

                <div>
                    <span style="font-size: 10.5px; font-family: var(--font-mono); font-weight: 700; color: #22c55e; letter-spacing: 0.8px; text-transform: uppercase; background: rgba(34, 197, 94, 0.12); padding: 3px 10px; border-radius: 4px;">
                        PAYMENT CONFIRMED
                    </span>
                    <h2 style="font-size: 22px; color: white; margin: 8px 0 4px 0; font-family: var(--font-heading); font-weight: 700;">
                        Subscription Active!
                    </h2>
                    <p style="color: var(--text-secondary); font-size: 13px; margin: 0;">
                        Your account is now upgraded to the <strong style="color: var(--accent-gold);">${tierName} PLAN</strong>.
                    </p>
                </div>

                <!-- Receipt Card -->
                <div style="width: 100%; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; text-align: left;">
                    <div style="font-size: 10.5px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px; font-weight: bold; letter-spacing: 0.5px;">
                        TAX INVOICE & RECEIPT
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">
                        <span>Activated Plan:</span>
                        <span style="color: white; font-weight: 700;">${tierName} Plan</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">
                        <span>Amount Paid Today:</span>
                        <span style="color: #22c55e; font-weight: 700;">₹${netPaid}</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-secondary); border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px; margin-top: 4px;">
                        <span>Transaction Ref:</span>
                        <span style="font-family: var(--font-mono); color: var(--text-muted);">${paymentId}</span>
                    </div>
                </div>

                <button id="enterWorkspaceModalBtn" class="brand-btn" style="width: 100%; padding: 12px; font-weight: 700; font-size: 14px; border-radius: var(--radius-md); cursor: pointer;">
                    Enter My Workspace 🚀 (<span id="countdownSec">${countdown}</span>s)
                </button>
            </div>
        `;

        const redirect = () => {
            if (isNavigated) return;
            isNavigated = true;
            clearInterval(autoRedirectTimer);
            overlay.remove();
            if (onCompleteCallback) onCompleteCallback();
            window.location.hash = '#/dashboard/directory';
        };

        const enterBtn = document.getElementById('enterWorkspaceModalBtn');
        if (enterBtn) enterBtn.addEventListener('click', redirect);

        const autoRedirectTimer = setInterval(() => {
            countdown -= 1;
            const cdEl = document.getElementById('countdownSec');
            if (cdEl) cdEl.innerText = countdown;

            if (countdown <= 0) {
                clearInterval(autoRedirectTimer);
                redirect();
            }
        }, 1000);
    }
}
