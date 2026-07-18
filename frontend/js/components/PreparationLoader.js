import { State } from '../state.js';

export function showPreparationLoader(callback) {
    // Remove any existing loader
    const existing = document.getElementById('preparationLoaderOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'preparationLoaderOverlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(9, 9, 11, 0.85)';
    overlay.style.backdropFilter = 'blur(16px)';
    overlay.style.webkitBackdropFilter = 'blur(16px)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '99999';
    overlay.style.fontFamily = 'var(--font-sans, "Inter", sans-serif)';
    overlay.style.color = 'white';
    overlay.style.padding = '24px';
    overlay.style.textAlign = 'center';

    overlay.innerHTML = `
        <div style="max-width: 440px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 24px;">
            <!-- Glowing Loader Ring -->
            <div style="position: relative; width: 80px; height: 80px;">
                <div style="position: absolute; inset: 0; border: 4px solid rgba(255, 160, 0, 0.1); border-radius: 50%;"></div>
                <div style="position: absolute; inset: 0; border: 4px solid transparent; border-top-color: var(--accent-gold, #ffa000); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <h3 style="font-size: 20px; font-weight: 700; margin: 0; font-family: var(--font-heading, inherit);">Preparing Your Profile</h3>
                <p id="loaderStatusText" style="font-size: 13px; color: var(--text-secondary, #a1a1aa); margin: 0; height: 20px; transition: opacity 0.3s ease;">Initializing premium credentials...</p>
            </div>

            <!-- Progress Bar Container -->
            <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.03);">
                <div id="loaderProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--accent-gold, #ffa000), var(--accent-pink, #ec4899)); border-radius: 10px; transition: width 0.1s linear;"></div>
            </div>

            <div id="loaderPercentage" style="font-size: 12px; font-family: var(--font-mono, monospace); color: var(--accent-gold, #ffa000); font-weight: 600;">0%</div>
        </div>

        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;

    document.body.appendChild(overlay);

    const statusTexts = [
        "Initializing premium credentials...",      // 0s - 3s
        "Configuring database pipelines...",        // 3s - 6s
        "Personalizing lead intelligence models...", // 6s - 9s
        "Enabling advanced search filters...",      // 9s - 12s
        "Finalizing your secure workspace..."       // 12s - 15s
    ];

    const duration = 15000; // 15 seconds
    const interval = 100; // Update progress bar every 100ms
    let elapsed = 0;

    const progressTimer = setInterval(() => {
        elapsed += interval;
        const percent = Math.min(100, Math.round((elapsed / duration) * 100));
        
        const progressBar = document.getElementById('loaderProgressBar');
        const percentageText = document.getElementById('loaderPercentage');
        const statusTextEl = document.getElementById('loaderStatusText');

        if (progressBar) progressBar.style.width = `${percent}%`;
        if (percentageText) percentageText.innerText = `${percent}%`;

        // Update status text every 3 seconds (3000ms)
        const textIdx = Math.min(statusTexts.length - 1, Math.floor(elapsed / 3000));
        if (statusTextEl && statusTextEl.innerText !== statusTexts[textIdx]) {
            statusTextEl.style.opacity = '0';
            setTimeout(() => {
                statusTextEl.innerText = statusTexts[textIdx];
                statusTextEl.style.opacity = '1';
            }, 300);
        }

        if (elapsed >= duration) {
            clearInterval(progressTimer);
            // Completed! Clean up overlay and invoke callback
            setTimeout(() => {
                overlay.remove();
                if (callback) callback();
            }, 500);
        }
    }, interval);
}
