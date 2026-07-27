import { State } from '../state.js';
import { Api } from '../api.js';

/**
 * Floating Top-Right Circular Glowing Trigger Button
 */
export function renderFloatingScratchTrigger(remainingCount = 58) {
    return `
        <style>
            @keyframes pulseGlowRing {
                0% {
                    box-shadow: 0 0 0 0 rgba(255, 160, 0, 0.6), 0 0 15px rgba(236, 72, 153, 0.4);
                    transform: scale(1);
                }
                50% {
                    box-shadow: 0 0 0 10px rgba(255, 160, 0, 0), 0 0 25px rgba(236, 72, 153, 0.6);
                    transform: scale(1.03);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(255, 160, 0, 0), 0 0 15px rgba(236, 72, 153, 0.4);
                    transform: scale(1);
                }
            }
            .floating-top-right-scratch {
                position: fixed;
                top: 14px;
                right: 140px;
                z-index: 99990;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 14px;
                background: linear-gradient(135deg, rgba(20, 20, 26, 0.95), rgba(9, 9, 11, 0.98));
                border: 1.5px solid rgba(255, 160, 0, 0.6);
                border-radius: 50px;
                backdrop-filter: blur(16px);
                color: #ffffff;
                cursor: pointer;
                animation: pulseGlowRing 3s infinite ease-in-out;
                transition: all 0.2s ease;
                user-select: none;
            }
            .floating-top-right-scratch:hover {
                transform: translateY(-1px) scale(1.05) !important;
                border-color: #ffa000 !important;
            }
            @media (max-width: 900px) {
                .floating-top-right-scratch {
                    right: 90px;
                    top: 12px;
                }
            }
            @media (max-width: 600px) {
                .floating-top-right-scratch {
                    top: auto;
                    bottom: 20px;
                    right: 16px;
                }
            }
        </style>
        <div class="floating-top-right-scratch" id="floatingScratchTriggerBtn" onclick="window.State.setScratchModal(true)" title="Scratch to unlock 100% Free Scout Plan!">
            <span style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #ffa000, #ea580c); display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(255, 160, 0, 0.5);">🎁</span>
            <span style="font-size: 11.5px; font-weight: 800; font-family: var(--font-heading); color: var(--accent-gold);">Scratch & Claim</span>
            <span style="font-size: 10.5px; font-family: var(--font-mono); font-weight: 700; color: #22c55e;" id="floatingRemainingBadgeText">${remainingCount} / 100 Left</span>
        </div>
    `;
}

/**
 * Celebratory Confetti Particle Burst FX
 */
function triggerConfettiBurst() {
    const count = 60;
    const defaults = { origin: { y: 0.6 } };
    
    // Create lightweight HTML canvas confetti burst overlay
    let confettiCanvas = document.getElementById('confettiCanvasOverlay');
    if (!confettiCanvas) {
        confettiCanvas = document.createElement('canvas');
        confettiCanvas.id = 'confettiCanvasOverlay';
        confettiCanvas.style.position = 'fixed';
        confettiCanvas.style.inset = '0';
        confettiCanvas.style.width = '100vw';
        confettiCanvas.style.height = '100vh';
        confettiCanvas.style.pointerEvents = 'none';
        confettiCanvas.style.zIndex = '100060';
        document.body.appendChild(confettiCanvas);
    }

    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ffa000', '#ec4899', '#10b981', '#ffffff', '#3b82f6', '#f59e0b'];

    for (let i = 0; i < count; i++) {
        particles.push({
            x: confettiCanvas.width / 2,
            y: confettiCanvas.height / 2,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.7) * 16,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rSpeed: (Math.random() - 0.5) * 12,
            opacity: 1
        });
    }

    let startTime = Date.now();
    function animate() {
        const elapsed = Date.now() - startTime;
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        let activeCount = 0;
        particles.forEach(p => {
            if (p.opacity <= 0) return;
            activeCount++;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.4; // Gravity
            p.rotation += p.rSpeed;
            p.opacity -= 0.015;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        if (activeCount > 0 && elapsed < 2500) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }

    animate();
}

/**
 * Dedicated Scratch Card Modal Overlay
 */
export function renderScratchModal() {
    if (!State.scratch_modal_open) return '';

    return `
        <div class="modal-overlay open" id="scratchModalOverlay" style="z-index: 100050; background: rgba(0, 0, 0, 0.85) !important; backdrop-filter: blur(14px) !important; -webkit-backdrop-filter: blur(14px) !important;">
            <div class="modal-card" style="max-width: 480px; width: 92%; padding: 32px; text-align: center; position: relative; background: #09090b !important; color: #ffffff !important; border: 1.5px solid rgba(255, 160, 0, 0.4) !important; box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(255,160,0,0.18); border-radius: 20px;">
                
                <button class="modal-close-btn" id="closeScratchModalBtn" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-size: 20px; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">&times;</button>
                
                <!-- Header Badge -->
                <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(255, 160, 0, 0.15); border: 1px solid rgba(255, 160, 0, 0.4); border-radius: 20px; color: var(--accent-gold, #ffa000); font-size: 11px; font-family: var(--font-mono); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;">
                    🔥 LAUNCH SPECIAL • FIRST 100 USERS GET SCOUT PLAN FREE
                </div>

                <h3 style="font-family: var(--font-heading); font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
                    Scratch Below to Claim Free Access! 🎁
                </h3>
                <p style="font-size: 13px; color: var(--text-secondary, #94a3b8); margin: 0 0 20px 0; line-height: 1.5;">
                    Scratch off the silver card below to reveal your secret 100% OFF coupon code.
                </p>

                <!-- Scratch Canvas Container -->
                <div style="position: relative; width: 290px; height: 80px; margin: 0 auto 20px; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.6); user-select: none;">
                    
                    <!-- Underneath Revealed Secret Code -->
                    <div id="scratchCodeSecret" style="position: absolute; inset: 0; background: linear-gradient(135deg, #09090b, #18181b); border: 2px dashed var(--accent-gold, #ffa000); border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1;">
                        <span style="font-size: 10px; font-family: var(--font-mono); color: var(--accent-gold); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Your Secret 100% OFF Code</span>
                        <span style="font-size: 26px; font-family: var(--font-mono); font-weight: 900; color: #ffffff; letter-spacing: 3px;">LAUNCH100</span>
                    </div>

                    <!-- Interactive Canvas Foil Overlay -->
                    <canvas id="scratchCanvas" width="290" height="80" style="position: absolute; inset: 0; z-index: 2; cursor: pointer; touch-action: none;"></canvas>
                </div>

                <!-- Claim Status Bar -->
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 10px; font-size: 12.5px; margin-bottom: 20px;">
                    <span style="color: var(--text-secondary);">⚡ Remaining Free Coupons:</span>
                    <span style="font-family: var(--font-mono); font-weight: 800; color: #22c55e;" id="modalScratchRemainingText">Loading...</span>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 10px;">
                    <button id="copyScratchCodeBtn" class="secondary-btn" style="flex: 1; padding: 11px; font-size: 12.5px; border-radius: 10px; justify-content: center; display: flex; align-items: center; gap: 6px;">
                        📋 Copy Secret Code
                    </button>
                    <button id="claimScratchCodeBtn" class="brand-btn" style="flex: 1.2; padding: 11px; font-size: 13px; font-weight: 700; border-radius: 10px; justify-content: center; display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, var(--accent-gold, #ffa000), #ea580c); color: white;">
                        Claim Free Scout ➔
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Initialize Scratch Modal Canvas & Event Listeners
 */
export function bindScratchModalEvents() {
    // Modal Close Click
    const closeBtn = document.getElementById('closeScratchModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            State.setScratchModal(false);
        });
    }

    // Fetch live status from Supabase
    Api.getCouponStatus('LAUNCH100').then(res => {
        const remaining = (res && typeof res.remaining === 'number') ? res.remaining : 58;
        const total = (res && res.max_redemptions) || 100;
        
        const bannerEl = document.getElementById('heroBannerRemainingText');
        if (bannerEl) bannerEl.innerText = `${remaining} / ${total} Left`;

        const modalEl = document.getElementById('modalScratchRemainingText');
        if (modalEl) modalEl.innerText = `${remaining} / ${total} Left`;
    }).catch(err => {
        console.warn("Failed to fetch live coupon status:", err);
    });

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
    let hasTriggeredConfetti = false;

    function scratch(x, y) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();

        if (!hasTriggeredConfetti) {
            hasTriggeredConfetti = true;
            triggerConfettiBurst();
        }
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

    // Copy Code Event with Confetti
    const copyBtn = document.getElementById('copyScratchCodeBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('LAUNCH100');
            copyBtn.innerHTML = '🎉 LAUNCH100 Copied!';
            triggerConfettiBurst();
            setTimeout(() => {
                copyBtn.innerHTML = '📋 Copy Secret Code';
            }, 3500);
        });
    }

    // Claim Free Scout Plan Event
    const claimBtn = document.getElementById('claimScratchCodeBtn');
    if (claimBtn) {
        claimBtn.addEventListener('click', () => {
            State.setScratchModal(false);
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
