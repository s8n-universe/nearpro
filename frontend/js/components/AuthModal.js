import { State } from '../state.js';
import { Api } from '../api.js';

export function renderAuthModal() {
    if (!State.auth_modal_open || State.user) return '';

    return `
        <div class="modal-overlay open" id="authModalOverlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #09090b; z-index: 100000; display: flex; align-items: center; justify-content: center; overflow: hidden; font-family: 'Plus Jakarta Sans', sans-serif;">
            <div class="auth-split-container" style="display: grid; grid-template-columns: 1fr 1.1fr; width: 100%; height: 100%; max-width: 100%; border-radius: 0;">
                
                <!-- Left Pane: The actual login form -->
                <div class="auth-left-pane" style="padding: 48px 64px; display: flex; flex-direction: column; justify-content: center; overflow-y: auto; background: #09090b; position: relative;">
                    
                    <!-- Close Button -->
                    <button class="modal-close-btn" id="closeAuthModalBtn" style="position: absolute; top: 24px; right: 24px; font-size: 28px; color: var(--text-muted); background: none; border: none; cursor: pointer; transition: color 0.2s;">&times;</button>
                    
                    <div style="max-width: 400px; margin: 0 auto; width: 100%;">
                        <h2 style="font-size: 28px; margin-bottom: 28px; text-align: left; font-family: var(--font-heading); color: white; display: flex; align-items: center; gap: 8px;">
                            <img src="/NearPro_logo_nobg.png" alt="NearPro Logo" style="height: 32px; width: auto; object-fit: contain;">
                            Access NearPro
                        </h2>
                        
                        <!-- Google Authentication -->
                        <button id="googleAuthBtn" class="secondary-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 12px; padding: 12px; border-radius: var(--radius-sm); border: 1px solid #cbd5e1; background: white; color: #0f172a; font-weight: 600; cursor: pointer;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21.35,11.1H12v2.7h5.3c-0.22,1.2 -0.9,2.2 -1.9,2.9v2.4h3.1c1.8,-1.7 2.9,-4.1 2.9,-7c0,-0.3 -0.03,-0.7 -0.05,-1z" fill="#4285F4"/>
                                <path d="M12,20.5c2.3,0 4.2,-0.8 5.6,-2.1l-3.1,-2.4c-0.9,0.6 -2,0.9 -2.5,0.9 -2.1,0 -3.9,-1.4 -4.5,-3.3H4.3v2.5C5.7,18.8 8.6,20.5 12,20.5z" fill="#34A853"/>
                                <path d="M7.5,13.6c-0.1,-0.4 -0.2,-0.8 -0.2,-1.2c0,-0.4 0.1,-0.8 0.2,-1.2V8.7H4.3C3.5,10.2 3.1,11.9 3.1,13.6c0,1.7 0.4,3.4 1.2,4.9l3.2,-2.5c-0.6,-0.6 -1,-1.5 -1,-2.4z" fill="#FBBC05"/>
                                <path d="M12,6.5c1.2,0 2.3,0.4 3.2,1.2l2.4,-2.4C16.1,4 14.2,3.1 12,3.1c-3.4,0 -6.3,1.7 -7.7,4.6l3.2,2.5c0.6,-1.9 2.4,-3.3 4.5,-3.3z" fill="#EA4335"/>
                            </svg>
                            <span>Login with Google</span>
                        </button>

                        <!-- LinkedIn Authentication -->
                        <button id="linkedinAuthBtn" class="secondary-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 12px; padding: 12px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.1); background: #0b0c10; color: white; font-weight: 600; cursor: pointer;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a66c2">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                            <span>Login with LinkedIn</span>
                        </button>

                        <!-- HubSpot Authentication -->
                        <button id="hubspotAuthBtn" class="secondary-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 12px; padding: 12px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.1); background: #0b0c10; color: white; font-weight: 600; cursor: pointer;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff7a59">
                                <path d="M19.9 12.4c-.4-.4-.9-.6-1.5-.7v-3c.8-.4 1.3-1.3 1.3-2.3 0-1.5-1.2-2.7-2.7-2.7S14.3 4.9 14.3 6.4c0 1 .5 1.9 1.3 2.3v3c-.6.1-1.1.3-1.5.7l-4.5-4.5c.3-.5.4-1.1.4-1.8 0-1.9-1.5-3.4-3.4-3.4S3.2 4.1 3.2 6c0 1.9 1.5 3.4 3.4 3.4.7 0 1.3-.2 1.8-.5l4.5 4.5c-.4.4-.6.9-.7 1.5H9.3c-.4-.8-1.3-1.3-2.3-1.3-1.5 0-2.7 1.2-2.7 2.7S5.5 19 7 19c1 0 1.9-.5 2.3-1.3h2.9c.1.6.3 1.1.7 1.5l-3.3 3.3c-.3-.1-.6-.2-.9-.2-1.3 0-2.3 1-2.3 2.3s1 2.3 2.3 2.3 2.3-1 2.3-2.3c0-.3-.1-.6-.2-.9l3.3-3.3c.4.4.9.6 1.5.7v2.9c-.8.4-1.3 1.3-1.3 2.3 0 1.5 1.2 2.7 2.7 2.7s2.7-1.2 2.7-2.7c0-1-.5-1.9-1.3-2.3v-2.9c.6-.1 1.1-.3 1.5-.7l3.3 3.3c-.1.3-.2.6-.2.9 0 1.3 1 2.3 2.3 2.3s2.3-1 2.3-2.3-1-2.3-2.3-2.3c-.3 0-.6.1-.9.2l-3.3-3.3c.4-.4.6-.9.7-1.5h3c.4.8 1.3 1.3 2.3 1.3 1.5 0 2.7-1.2 2.7-2.7s-1.2-2.7-2.7-2.7c-1 0-1.9.5-2.3 1.3h-3c-.1-.6-.3-1.1-.7-1.5l4.5-4.5zm-2.9-6c0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4-.8 0-1.4-.6-1.4-1.4zM6.6 7.4c-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4zm.4 10.2c-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4zm10.9-4.2c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4zm.5 5.2c-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4z"/>
                            </svg>
                            <span>Login with HubSpot</span>
                        </button>

                        <!-- Zoho Authentication -->
                        <button id="zohoAuthBtn" class="secondary-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 24px; padding: 12px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.1); background: #0b0c10; color: white; font-weight: 600; cursor: pointer;">
                            <img src="https://cdn.brandfetch.io/idssig0_jY/w/800/h/344/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1687855848599" alt="Zoho Logo" style="height: 18px; width: auto; object-fit: contain; margin-right: 4px;">
                            <span>Login with Zoho</span>
                        </button>
                        
                        <div style="display: flex; align-items: center; margin-bottom: 24px;">
                            <hr style="flex: 1; border: none; border-top: 1px solid var(--border); opacity: 0.15;">
                            <span style="padding: 0 12px; font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);">OR</span>
                            <hr style="flex: 1; border: none; border-top: 1px solid var(--border); opacity: 0.15;">
                        </div>
                        
                        <!-- Tab headers -->
                        <div style="display: flex; gap: 16px; border-bottom: 1px solid var(--border); margin-bottom: 24px; border-bottom-color: rgba(255,255,255,0.08);">
                            <button id="signInTabBtn" class="tab-header-btn active" style="flex: 1; padding-bottom: 8px; font-size: 14px; background: none; border: none; border-bottom: 2px solid var(--accent-gold); color: white; cursor: pointer; font-weight: 600;">
                                Sign In
                            </button>
                            <button id="signUpTabBtn" class="tab-header-btn" style="flex: 1; padding-bottom: 8px; font-size: 14px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-muted); cursor: pointer; font-weight: 600;">
                                Register
                            </button>
                        </div>
                        
                        <!-- Form body -->
                        <form id="authForm">
                            <div style="margin-bottom: 16px;">
                                <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-family: var(--font-mono);">Email Address</label>
                                <input type="email" id="authEmailInput" class="auth-input" required placeholder="name@domain.com" style="width:100%; padding:12px; background:#18181b; border:1px solid rgba(255,255,255,0.08); border-radius:6px; color:white; font-size:14px; outline:none;">
                            </div>
                            
                            <div style="margin-bottom: 24px;">
                                <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-family: var(--font-mono);">Password</label>
                                <input type="password" id="authPasswordInput" class="auth-input" required placeholder="••••••••" style="width:100%; padding:12px; background:#18181b; border:1px solid rgba(255,255,255,0.08); border-radius:6px; color:white; font-size:14px; outline:none;">
                            </div>

                            <!-- Registration Agreement Checkbox -->
                            <div id="signUpConsentWrapper" style="display: none; margin-bottom: 20px;">
                                <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px; color: var(--text-secondary); line-height: 1.4; cursor: pointer;">
                                    <input type="checkbox" id="authTermsConsentCb" style="margin-top: 2px; cursor: pointer;">
                                    <span>
                                        I agree to NearPro's <a href="#/terms" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Terms of Service</a> &amp; <a href="#/privacy" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Privacy Policy</a>.
                                    </span>
                                </label>
                            </div>
                            
                            <div id="authErrorMsg" style="color: var(--accent-pink); font-size: 12px; margin-bottom: 16px; display: none; line-height: 1.4;"></div>
                            
                            <button type="submit" id="authSubmitBtn" class="brand-btn" style="width: 100%; padding: 12px; font-size: 14px; font-weight: 700; cursor: pointer;">
                                Sign In
                            </button>
                            
                            <div style="margin-top: 20px; text-align: center; font-size: 13px; color: var(--text-secondary);">
                                <span id="authToggleHintText">New to NearPro?</span>
                                <a href="#" id="authToggleLinkBtn" style="color: var(--accent-gold); text-decoration: underline; margin-left: 4px;">Create an account</a>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Right Pane: Platform details & high quality features details -->
                <div class="auth-right-pane" style="padding: 64px; display: flex; flex-direction: column; justify-content: center; background: radial-gradient(circle at top right, rgba(245, 158, 11, 0.08), transparent 60%), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.05), transparent 60%), #0d0d10; border-left: 1px solid rgba(255,255,255,0.05); position: relative; text-align: left; overflow-y: auto;">
                    
                    <div style="max-width: 480px; margin: 0 auto; width: 100%;">
                        <span style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--accent-gold); font-weight: 700; letter-spacing: 1px;">AUTONOMOUS AGENCY OPERATING SYSTEM</span>
                        <h1 style="font-size: 32px; font-weight: 800; font-family: var(--font-heading); color: white; margin-top: 12px; margin-bottom: 16px; line-height: 1.25;">
                            Lead Intelligence and Outreach Engine
                        </h1>
                        <p style="color: var(--text-secondary); font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
                            NearPro transforms raw business directory search results into actionable sales pipelines. Find local leads, audit websites, generate outreach copy, and close clients.
                        </p>

                        <!-- Value propositions grid -->
                        <div style="display: flex; flex-direction: column; gap: 24px; margin-bottom: 32px;">
                            <div style="display: flex; gap: 16px; align-items: flex-start;">
                                <div style="background: rgba(245, 158, 11, 0.1); width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(245, 158, 11, 0.15);">
                                    <span style="font-size: 18px;">📍</span>
                                </div>
                                <div>
                                    <h4 style="font-size: 14.5px; font-weight: 700; color: white; margin: 0 0 4px 0;">Smart Pipelines and Mapping</h4>
                                    <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.5; margin: 0;">Pin leads live on an interactive coordinate map, segment them into campaigns, and track deals in our Lead CRM Kanban board.</p>
                                </div>
                            </div>

                            <div style="display: flex; gap: 16px; align-items: flex-start;">
                                <div style="background: rgba(236, 72, 153, 0.1); width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(236, 72, 153, 0.15);">
                                    <span style="font-size: 18px;">⚡</span>
                                </div>
                                <div>
                                    <h4 style="font-size: 14.5px; font-weight: 700; color: white; margin: 0 0 4px 0;">Instant Website Audits</h4>
                                    <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.5; margin: 0;">Run 10 second automated audits on PageSpeed, mobile layouts, and SSL status. Estimate lost monthly revenue instantly to back your pitch.</p>
                                </div>
                            </div>

                            <div style="display: flex; gap: 16px; align-items: flex-start;">
                                <div style="background: rgba(245, 158, 11, 0.1); width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(245, 158, 11, 0.15);">
                                    <span style="font-size: 18px;">🤖</span>
                                </div>
                                <div>
                                    <h4 style="font-size: 14.5px; font-weight: 700; color: white; margin: 0 0 4px 0;">AI Outreach and Personalization</h4>
                                    <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.5; margin: 0;">Evaluate prospects with Conversion Scores. Automatically write customized cold pitches for WhatsApp, email, or Instagram in Hinglish and English.</p>
                                </div>
                            </div>

                            <div style="display: flex; gap: 16px; align-items: flex-start;">
                                <div style="background: rgba(236, 72, 153, 0.1); width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(236, 72, 153, 0.15);">
                                    <span style="font-size: 18px;">💼</span>
                                </div>
                                <div>
                                    <h4 style="font-size: 14.5px; font-weight: 700; color: white; margin: 0 0 4px 0;">HubSpot and Zoho CRM Sync</h4>
                                    <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.5; margin: 0;">Push tracked leads directly to your CRM, synchronize deal pipeline stages automatically, or trigger custom n8n webhooks instantly.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Live stats display -->
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 16px 20px; border-radius: var(--radius-sm); font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 12px; line-height: 1.4;">
                            <span style="font-size: 20px; animation: pulse 2s infinite; flex-shrink: 0;">📈</span>
                            <span>Join hundreds of B2B professionals using NearPro to automate lead acquisition and close high ticket clients.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            @media (max-width: 900px) {
                .auth-split-container {
                    grid-template-columns: 1fr !important;
                }
                .auth-right-pane {
                    display: none !important;
                }
                .auth-left-pane {
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
