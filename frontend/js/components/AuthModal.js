import { State } from '../state.js';
import { Api } from '../api.js';

export function renderAuthModal() {
    if (!State.auth_modal_open || State.user) return '';

    return `
        <div class="modal-overlay open" id="authModalOverlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #09090b; z-index: 100000; display: flex; align-items: center; justify-content: center; overflow: hidden; font-family: 'Space Grotesk', sans-serif;">
            <div class="auth-split-container">
                
                <!-- Left Pane: Suppressed & Concise Login Form -->
                <div class="auth-left-pane">
                    
                    <!-- Close Button -->
                    <button class="modal-close-btn" id="closeAuthModalBtn" style="position: absolute; top: 20px; right: 20px; font-size: 24px; color: var(--text-muted); background: none; border: none; cursor: pointer; transition: color 0.2s; z-index: 10;">&times;</button>
                    
                    <div style="width: 100%; max-width: 340px; margin: 0 auto;">
                        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 24px; text-align: left; font-family: var(--font-heading); color: white; display: flex; align-items: center; gap: 8px;">
                            <img src="/NearPro_logo_nobg.png" alt="NearPro Logo" style="height: 28px; width: auto; object-fit: contain;">
                            Access NearPro
                        </h2>
                        
                        <!-- Google Authentication -->
                        <button id="googleAuthBtn" class="secondary-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid #cbd5e1; background: white; color: #0f172a; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21.35,11.1H12v2.7h5.3c-0.22,1.2 -0.9,2.2 -1.9,2.9v2.4h3.1c1.8,-1.7 2.9,-4.1 2.9,-7c0,-0.3 -0.03,-0.7 -0.05,-1z" fill="#4285F4"/>
                                <path d="M12,20.5c2.3,0 4.2,-0.8 5.6,-2.1l-3.1,-2.4c-0.9,0.6 -2,0.9 -2.5,0.9 -2.1,0 -3.9,-1.4 -4.5,-3.3H4.3v2.5C5.7,18.8 8.6,20.5 12,20.5z" fill="#34A853"/>
                                <path d="M7.5,13.6c-0.1,-0.4 -0.2,-0.8 -0.2,-1.2c0,-0.4 0.1,-0.8 0.2,-1.2V8.7H4.3C3.5,10.2 3.1,11.9 3.1,13.6c0,1.7 0.4,3.4 1.2,4.9l3.2,-2.5c-0.6,-0.6 -1,-1.5 -1,-2.4z" fill="#FBBC05"/>
                                <path d="M12,6.5c1.2,0 2.3,0.4 3.2,1.2l2.4,-2.4C16.1,4 14.2,3.1 12,3.1c-3.4,0 -6.3,1.7 -7.7,4.6l3.2,2.5c0.6,-1.9 2.4,-3.3 4.5,-3.3z" fill="#EA4335"/>
                            </svg>
                            <span>Login with Google</span>
                        </button>

                        <!-- LinkedIn Authentication -->
                        <button id="linkedinAuthBtn" class="secondary-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.08); background: #0c0c0e; color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a66c2">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                            <span>Login with LinkedIn</span>
                        </button>

                        <!-- HubSpot Authentication -->
                        <button id="hubspotAuthBtn" class="secondary-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.08); background: #0c0c0e; color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff7a59">
                                <path d="M19.9 12.4c-.4-.4-.9-.6-1.5-.7v-3c.8-.4 1.3-1.3 1.3-2.3 0-1.5-1.2-2.7-2.7-2.7S14.3 4.9 14.3 6.4c0 1 .5 1.9 1.3 2.3v3c-.6.1-1.1.3-1.5.7l-4.5-4.5c.3-.5.4-1.1.4-1.8 0-1.9-1.5-3.4-3.4-3.4S3.2 4.1 3.2 6c0 1.9 1.5 3.4 3.4 3.4.7 0 1.3-.2 1.8-.5l4.5 4.5c-.4.4-.6.9-.7 1.5H9.3c-.4-.8-1.3-1.3-2.3-1.3-1.5 0-2.7 1.2-2.7 2.7S5.5 19 7 19c1 0 1.9-.5 2.3-1.3h2.9c.1.6.3 1.1.7 1.5l-3.3 3.3c-.3-.1-.6-.2-.9-.2-1.3 0-2.3 1-2.3 2.3s1 2.3 2.3 2.3 2.3-1 2.3-2.3c0-.3-.1-.6-.2-.9l3.3-3.3c.4.4.9.6 1.5.7v2.9c-.8.4-1.3 1.3-1.3 2.3 0 1.5 1.2 2.7 2.7 2.7s2.7-1.2 2.7-2.7c0-1-.5-1.9-1.3-2.3v-2.9c.6-.1 1.1-.3 1.5-.7l3.3 3.3c-.1.3-.2.6-.2.9 0 1.3 1 2.3 2.3 2.3s2.3-1 2.3-2.3-1-2.3-2.3-2.3c-.3 0-.6.1-.9.2l-3.3-3.3c.4-.4.6-.9.7-1.5h3c.4.8 1.3 1.3 2.3 1.3 1.5 0 2.7-1.2 2.7-2.7s-1.2-2.7-2.7-2.7c-1 0-1.9.5-2.3 1.3h-3c-.1-.6-.3-1.1-.7-1.5l4.5-4.5zm-2.9-6c0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4-.8 0-1.4-.6-1.4-1.4zM6.6 7.4c-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4zm.4 10.2c-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4zm10.9-4.2c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4zm.5 5.2c-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4z"/>
                            </svg>
                            <span>Login with HubSpot</span>
                        </button>

                        <!-- Zoho Authentication -->
                        <button id="zohoAuthBtn" class="secondary-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.08); background: #0c0c0e; color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                            <img src="https://cdn.brandfetch.io/idssig0_jY/w/800/h/344/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1687855848599" alt="Zoho Logo" style="height: 16px; width: auto; object-fit: contain; margin-right: 4px;">
                            <span>Login with Zoho</span>
                        </button>
                        
                        <div style="display: flex; align-items: center; margin-bottom: 20px;">
                            <hr style="flex: 1; border: none; border-top: 1px solid var(--border); opacity: 0.1;">
                            <span style="padding: 0 10px; font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">OR</span>
                            <hr style="flex: 1; border: none; border-top: 1px solid var(--border); opacity: 0.1;">
                        </div>
                        
                        <!-- Tab headers -->
                        <div style="display: flex; gap: 12px; border-bottom: 1px solid var(--border); margin-bottom: 20px; border-bottom-color: rgba(255,255,255,0.08);">
                            <button id="signInTabBtn" class="tab-header-btn active" style="flex: 1; padding-bottom: 6px; font-size: 13px; background: none; border: none; border-bottom: 2px solid var(--accent-gold); color: white; cursor: pointer; font-weight: 600;">
                                Sign In
                            </button>
                            <button id="signUpTabBtn" class="tab-header-btn" style="flex: 1; padding-bottom: 6px; font-size: 13px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-muted); cursor: pointer; font-weight: 600;">
                                Register
                            </button>
                        </div>
                        
                        <!-- Form body -->
                        <form id="authForm">
                            <div style="margin-bottom: 12px;">
                                <label style="display: block; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px; font-family: var(--font-mono);">Email Address</label>
                                <input type="email" id="authEmailInput" class="auth-input" required placeholder="name@domain.com" style="width:100%; padding:10px 12px; background:#18181b; border:1px solid rgba(255,255,255,0.08); border-radius:6px; color:white; font-size:13px; outline:none;">
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px; font-family: var(--font-mono);">Password</label>
                                <input type="password" id="authPasswordInput" class="auth-input" required placeholder="••••••••" style="width:100%; padding:12px; background:#18181b; border:1px solid rgba(255,255,255,0.08); border-radius:6px; color:white; font-size:13px; outline:none;">
                            </div>

                            <!-- Registration Agreement Checkbox -->
                            <div id="signUpConsentWrapper" style="display: none; margin-bottom: 16px;">
                                <label style="display: flex; align-items: flex-start; gap: 6px; font-size: 11px; color: var(--text-secondary); line-height: 1.4; cursor: pointer;">
                                    <input type="checkbox" id="authTermsConsentCb" style="margin-top: 2px; cursor: pointer;">
                                    <span>
                                        I agree to NearPro's <a href="#/terms" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Terms of Service</a> &amp; <a href="#/privacy" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Privacy Policy</a>.
                                    </span>
                                </label>
                            </div>
                            
                            <div id="authErrorMsg" style="color: var(--accent-pink); font-size: 11.5px; margin-bottom: 12px; display: none; line-height: 1.4;"></div>
                            
                            <button type="submit" id="authSubmitBtn" class="brand-btn" style="width: 100%; padding: 10px; font-size: 13.5px; font-weight: 700; cursor: pointer;">
                                Sign In
                            </button>
                            
                            <div style="margin-top: 16px; text-align: center; font-size: 12.5px; color: var(--text-secondary);">
                                <span id="authToggleHintText">New to NearPro?</span>
                                <a href="#" id="authToggleLinkBtn" style="color: var(--accent-gold); text-decoration: underline; margin-left: 2px;">Create an account</a>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Right Pane: Platform details & interactive dashboard card mockup -->
                <div class="auth-right-pane">
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; z-index: 2;">
                        <span style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--accent-gold); font-weight: 700; letter-spacing: 1.5px;">NearPro Platform Preview</span>
                        <span style="font-size: 11.5px; color: var(--text-muted); font-family: var(--font-mono);">v3.2.0</span>
                    </div>

                    <div style="z-index: 2; margin: auto 0; display: flex; flex-direction: column; gap: 40px;">
                        <div style="max-width: 520px;">
                            <h1 style="font-size: 38px; font-weight: 800; font-family: var(--font-heading); color: white; line-height: 1.2; margin: 0 0 16px 0; letter-spacing: -0.5px;">
                                Accelerate your agency client acquisition
                            </h1>
                            <p style="color: var(--text-secondary); font-size: 15.5px; line-height: 1.6; margin: 0;">
                                Empower your sales and outreach teams with real time lead coordinate mapping, automated website audits, and instant Zoho CRM synchronization.
                            </p>
                        </div>

                        <!-- CSS Mockup Dashboard -->
                        <div class="auth-mockup-wrapper" style="position: relative; height: 260px; width: 100%; max-width: 580px; margin-top: 10px;">
                            
                            <!-- Audits Card -->
                            <div class="auth-mockup-card" style="position: absolute; left: 0; top: 20px; width: 260px; background: rgba(18, 18, 22, 0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); z-index: 3; transition: all 0.3s ease; cursor: default;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                                    <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase;">Website Health Check</span>
                                    <span style="background: rgba(34, 197, 94, 0.15); color: #22c55e; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; font-family: var(--font-mono);">PASSED</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 16px;">
                                    <!-- Radial Progress -->
                                    <div style="position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: radial-gradient(closest-side, #121216 79%, transparent 80% 100%), conic-gradient(#22c55e 98%, rgba(255,255,255,0.05) 0);">
                                        <span style="font-size: 15px; font-weight: bold; color: white; font-family: var(--font-mono);">98</span>
                                    </div>
                                    <div>
                                        <div style="font-size: 13.5px; font-weight: bold; color: white; margin-bottom: 2px;">PageSpeed Score</div>
                                        <div style="font-size: 11px; color: var(--text-muted);">SSL Active &amp; Mobile Responsive</div>
                                    </div>
                                </div>
                            </div>

                            <!-- CRM Sync Card -->
                            <div class="auth-mockup-card" style="position: absolute; right: 20px; top: -10px; width: 280px; background: rgba(18, 18, 22, 0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); z-index: 2; transition: all 0.3s ease; cursor: default;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></span>
                                        <span style="font-size: 12.5px; font-weight: bold; color: white;">CA Rahul</span>
                                    </div>
                                    <span style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 2px 6px; border-radius: 4px; font-size: 9.5px; font-weight: bold; font-family: var(--font-mono); display: flex; align-items: center; gap: 4px;">
                                        <span style="display: inline-block; width: 4px; height: 4px; border-radius: 50%; background: #3b82f6;"></span>
                                        Zoho Synced
                                    </span>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11.5px; color: var(--text-secondary);">
                                    <div style="display: flex; justify-content: space-between;">
                                        <span>Campaign:</span>
                                        <span style="color: white; font-weight: 500;">Local CA</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span>Revenue Lost:</span>
                                        <span style="color: var(--accent-pink); font-weight: bold;">₹45,000 / mo</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span>Status:</span>
                                        <span style="color: var(--accent-gold); font-weight: bold;">Contacted</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Coordinate Map Card -->
                            <div class="auth-mockup-card" style="position: absolute; left: 80px; bottom: -20px; width: 230px; background: rgba(18, 18, 22, 0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 18px; box-shadow: 0 15px 35px rgba(0,0,0,0.45); z-index: 4; transition: all 0.3s ease; cursor: default; display: flex; align-items: center; gap: 10px;">
                                <div style="background: rgba(245, 158, 11, 0.1); width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(245, 158, 11, 0.2);">
                                    <span style="font-size: 15px; animation: bounce 2s infinite;">📍</span>
                                </div>
                                <div>
                                    <div style="font-size: 12.5px; font-weight: bold; color: white;">Bandra coordinates</div>
                                    <div style="font-size: 10.5px; color: var(--text-muted);">48 Leads mapped</div>
                                </div>
                            </div>
                            
                        </div>
                    </div>

                    <!-- Bottom Footer Context -->
                    <div style="z-index: 2; font-size: 11.5px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
                        <span>&copy; 2026 S8N Technologies</span>
                        <a href="#/privacy" style="color: var(--text-muted); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='var(--text-muted)'">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .auth-split-container {
                display: flex;
                width: 100vw;
                height: 100vh;
                max-width: 100%;
                border-radius: 0;
                background: #09090b;
            }
            .auth-left-pane {
                width: 420px;
                flex-shrink: 0;
                padding: 48px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                background: #09090b;
                position: relative;
                overflow-y: auto;
                border-right: 1px solid rgba(255,255,255,0.05);
            }
            .auth-right-pane {
                flex: 1;
                background: radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.08), transparent 50%), radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.05), transparent 50%), #0c0c0e;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 64px;
                position: relative;
                overflow: hidden;
            }
            .auth-mockup-card:hover {
                transform: translateY(-4px) scale(1.02);
                border-color: rgba(245, 158, 11, 0.2) !important;
                box-shadow: 0 30px 60px rgba(0,0,0,0.6) !important;
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            @media (max-width: 900px) {
                .auth-split-container {
                    flex-direction: column;
                }
                .auth-right-pane {
                    display: none !important;
                }
                .auth-left-pane {
                    width: 100% !important;
                    padding: 32px 24px !important;
                }
            }
        </style>
    `;
}

export function bindAuthModalEvents() {
    const overlay = document.getElementById('authModalOverlay');
    if (!overlay) return;

    const closeBtn = document.getElementById('closeAuthModalBtn');
    const googleBtn = document.getElementById('googleAuthBtn');
    const signInTab = document.getElementById('signInTabBtn');
    const signUpTab = document.getElementById('signUpTabBtn');
    const form = document.getElementById('authForm');
    const emailInput = document.getElementById('authEmailInput');
    const passwordInput = document.getElementById('authPasswordInput');
    const consentWrapper = document.getElementById('signUpConsentWrapper');
    const termsConsentCb = document.getElementById('authTermsConsentCb');
    const errorMsg = document.getElementById('authErrorMsg');
    const submitBtn = document.getElementById('authSubmitBtn');
    const toggleLink = document.getElementById('authToggleLinkBtn');
    const toggleHint = document.getElementById('authToggleHintText');

    let currentTab = 'signin'; // 'signin' | 'signup'

    const updateConsentState = () => {
        if (currentTab === 'signup') {
            if (consentWrapper) consentWrapper.style.display = 'block';
            if (termsConsentCb && !termsConsentCb.checked) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.5';
                submitBtn.style.cursor = 'not-allowed';
            } else {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }
        } else {
            if (consentWrapper) consentWrapper.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
    };

    if (termsConsentCb) {
        termsConsentCb.addEventListener('change', updateConsentState);
    }

    const setTab = (tab) => {
        if (tab === 'signin') {
            currentTab = 'signin';
            if (signInTab) {
                signInTab.style.borderBottomColor = 'var(--accent-gold)';
                signInTab.style.color = 'white';
            }
            if (signUpTab) {
                signUpTab.style.borderBottomColor = 'transparent';
                signUpTab.style.color = 'var(--text-muted)';
            }
            submitBtn.innerText = 'Sign In';
            toggleHint.innerText = 'New to NearPro?';
            toggleLink.innerText = 'Create an account';
            if (errorMsg) errorMsg.style.display = 'none';
        } else {
            currentTab = 'signup';
            if (signUpTab) {
                signUpTab.style.borderBottomColor = 'var(--accent-gold)';
                signUpTab.style.color = 'white';
            }
            if (signInTab) {
                signInTab.style.borderBottomColor = 'transparent';
                signInTab.style.color = 'var(--text-muted)';
            }
            submitBtn.innerText = 'Register';
            toggleHint.innerText = 'Already using NearPro?';
            toggleLink.innerText = 'Sign In';
            if (errorMsg) errorMsg.style.display = 'none';
        }
        updateConsentState();
    };

    // Close Modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            State.setAuthModal(false);
        });
    }

    // Google Sign In
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                await Api.signInWithGoogle();
            } catch (err) {
                console.error("Google Auth failed: ", err);
                if (errorMsg) {
                    errorMsg.innerText = err.message || "Google authentication failed";
                    errorMsg.style.display = 'block';
                }
            }
        });
    }
    // Zoho Sign In
    const zohoBtn = document.getElementById('zohoAuthBtn');
    if (zohoBtn) {
        zohoBtn.addEventListener('click', async () => {
            try {
                await Api.signInWithZoho();
            } catch (err) {
                console.error("Zoho Auth failed: ", err);
                if (errorMsg) {
                    errorMsg.innerText = err.message || "Zoho authentication failed";
                    errorMsg.style.display = 'block';
                }
            }
        });
    }

    // LinkedIn Sign In
    const linkedinBtn = document.getElementById('linkedinAuthBtn');
    if (linkedinBtn) {
        linkedinBtn.addEventListener('click', async () => {
            try {
                await Api.signInWithLinkedIn();
            } catch (err) {
                console.error("LinkedIn Auth failed: ", err);
                if (errorMsg) {
                    errorMsg.innerText = err.message || "LinkedIn authentication failed";
                    errorMsg.style.display = 'block';
                }
            }
        });
    }

    // HubSpot Sign In
    const hubspotBtn = document.getElementById('hubspotAuthBtn');
    if (hubspotBtn) {
        hubspotBtn.addEventListener('click', async () => {
            try {
                await Api.signInWithHubspot();
            } catch (err) {
                console.error("HubSpot Auth failed: ", err);
                if (errorMsg) {
                    errorMsg.innerText = err.message || "HubSpot authentication failed";
                    errorMsg.style.display = 'block';
                }
            }
        });
    }
    // Tab toggles
    if (signInTab) {
        signInTab.addEventListener('click', () => setTab('signin'));
    }

    if (signUpTab) {
        signUpTab.addEventListener('click', () => setTab('signup'));
    }

    if (toggleLink) {
        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            setTab(currentTab === 'signin' ? 'signup' : 'signin');
        });
    }

    // Form Submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (errorMsg) errorMsg.style.display = 'none';

            if (currentTab === 'signup') {
                const minLength = 8;
                const hasNum = /\d/.test(password);
                if (password.length < minLength || !hasNum) {
                    if (errorMsg) {
                        errorMsg.innerText = "Password must be at least 8 characters and contain at least one digit.";
                        errorMsg.style.display = 'block';
                    }
                    return;
                }
            }

            submitBtn.innerText = currentTab === 'signin' ? 'Signing In...' : 'Registering...';
            submitBtn.disabled = true;

            try {
                const queuedTier = localStorage.getItem('selected_nearpro_tier');
                const queuedInterval = localStorage.getItem('selected_nearpro_interval') || 'monthly';

                if (currentTab === 'signin') {
                    const result = await Api.signIn(email, password);
                    localStorage.removeItem('selected_nearpro_tier');
                    localStorage.removeItem('selected_nearpro_interval');
                    State.setAuthModal(false);

                    if (queuedTier && queuedTier !== 'free') {
                        State.pending_checkout_plan = { planId: queuedTier, interval: queuedInterval };
                        State.checkout_consent_modal_open = true;
                        window.location.hash = '#/dashboard/settings';
                    } else {
                        window.location.hash = '#/dashboard/overview';
                    }
                } else {
                    await Api.signUp(email, password);
                    localStorage.removeItem('selected_nearpro_tier');
                    localStorage.removeItem('selected_nearpro_interval');
                    State.setAuthModal(false);

                    if (queuedTier && queuedTier !== 'free') {
                        State.pending_checkout_plan = { planId: queuedTier, interval: queuedInterval };
                        State.checkout_consent_modal_open = true;
                        window.location.hash = '#/dashboard/settings';
                    } else {
                        window.location.hash = '#/dashboard/overview';
                    }
                    alert("Registration successful. Welcome to NearPro!");
                }
            } catch (err) {
                console.error("Authentication failed: ", err);
                if (errorMsg) {
                    errorMsg.innerText = err.message || "Authentication credentials rejected";
                    errorMsg.style.display = 'block';
                }
            } finally {
                submitBtn.innerText = currentTab === 'signin' ? 'Sign In' : 'Register';
                submitBtn.disabled = false;
            }
        });
    }
}
