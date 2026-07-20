import { State } from '../state.js';
import { Api } from '../api.js';

export function renderAuthModal() {
    if (!State.auth_modal_open) return '';

    return `
        <div class="modal-overlay open" id="authModalOverlay">
            <div class="modal-card" style="max-width: 400px; padding: 32px;">
                <button class="modal-close-btn" id="closeAuthModalBtn">&times;</button>
                
                <h2 style="font-size: 24px; margin-bottom: 24px; text-align: center; font-family: var(--font-heading);">
                    Access NearPro
                </h2>
                
                <!-- Google Authentication -->
                <button id="googleAuthBtn" class="secondary-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 24px; padding: 12px; border-radius: var(--radius-sm);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.35,11.1H12v2.7h5.3c-0.22,1.2 -0.9,2.2 -1.9,2.9v2.4h3.1c1.8,-1.7 2.9,-4.1 2.9,-7c0,-0.3 -0.03,-0.7 -0.05,-1z" fill="#4285F4"/>
                        <path d="M12,20.5c2.3,0 4.2,-0.8 5.6,-2.1l-3.1,-2.4c-0.9,0.6 -2,0.9 -2.5,0.9 -2.1,0 -3.9,-1.4 -4.5,-3.3H4.3v2.5C5.7,18.8 8.6,20.5 12,20.5z" fill="#34A853"/>
                        <path d="M7.5,13.6c-0.1,-0.4 -0.2,-0.8 -0.2,-1.2c0,-0.4 0.1,-0.8 0.2,-1.2V8.7H4.3C3.5,10.2 3.1,11.9 3.1,13.6c0,1.7 0.4,3.4 1.2,4.9l3.2,-2.5c-0.6,-0.6 -1,-1.5 -1,-2.4z" fill="#FBBC05"/>
                        <path d="M12,6.5c1.2,0 2.3,0.4 3.2,1.2l2.4,-2.4C16.1,4 14.2,3.1 12,3.1c-3.4,0 -6.3,1.7 -7.7,4.6l3.2,2.5c0.6,-1.9 2.4,-3.3 4.5,-3.3z" fill="#EA4335"/>
                    </svg>
                    <span>Login with Google</span>
                </button>
                
                <div style="display: flex; align-items: center; margin-bottom: 24px;">
                    <hr style="flex: 1; border: none; border-top: 1px solid var(--border);">
                    <span style="padding: 0 12px; font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);">OR</span>
                    <hr style="flex: 1; border: none; border-top: 1px solid var(--border);">
                </div>
                
                <!-- Tab headers -->
                <div style="display: flex; gap: 16px; border-bottom: 1px solid var(--border); margin-bottom: 24px;">
                    <button id="signInTabBtn" class="tab-header-btn active" style="flex: 1; padding-bottom: 8px; font-size: 14px; background: none; border: none; border-bottom: 2px solid var(--accent-gold); color: white; cursor: pointer;">
                        Sign In
                    </button>
                    <button id="signUpTabBtn" class="tab-header-btn" style="flex: 1; padding-bottom: 8px; font-size: 14px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-muted); cursor: pointer;">
                        Register
                    </button>
                </div>
                
                <!-- Form body -->
                <form id="authForm">
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-family: var(--font-mono);">Email Address</label>
                        <input type="email" id="authEmailInput" required placeholder="name@domain.com" style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-base); color: white; outline: none; font-size: 14px;">
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-family: var(--font-mono);">Password</label>
                        <input type="password" id="authPasswordInput" required placeholder="••••••••" style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-base); color: white; outline: none; font-size: 14px;">
                    </div>

                    <!-- Mandatory Affirmative Registration Consent Checkbox (DPDP Act 2023 / Consumer Protection Rules) -->
                    <div id="signUpConsentWrapper" style="display: none; margin-bottom: 20px;">
                        <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px; color: var(--text-secondary); line-height: 1.4; cursor: pointer;">
                            <input type="checkbox" id="authTermsConsentCb" style="margin-top: 2px; cursor: pointer;">
                            <span>
                                I agree to NearPro's <a href="#/terms" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Terms of Service</a> & <a href="#/privacy" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Privacy Policy</a>, and provide explicit consent for account data processing under the DPDP Act 2023.
                            </span>
                        </label>
                    </div>
                    
                    <div id="authErrorMsg" style="color: var(--accent-pink); font-size: 12px; margin-bottom: 16px; display: none; line-height: 1.4;"></div>
                    
                    <button type="submit" id="authSubmitBtn" class="brand-btn" style="width: 100%; padding: 12px; font-size: 14px;">
                        Sign In
                    </button>
                    
                    <div style="margin-top: 20px; text-align: center; font-size: 13px; color: var(--text-secondary);">
                        <span id="authToggleHintText">New to NearPro?</span>
                        <a href="#" id="authToggleLinkBtn" style="color: var(--accent-gold); text-decoration: underline; margin-left: 4px;">Create an account</a>
                    </div>
                </form>
            </div>
        </div>
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
            submitBtn.innerText = currentTab === 'signin' ? 'Signing In...' : 'Registering...';
            submitBtn.disabled = true;

            try {
                if (currentTab === 'signin') {
                    const result = await Api.signIn(email, password);
                    // Clear any stale queued tier from localStorage to prevent
                    // accidental Razorpay checkout triggers on future sign-ins
                    localStorage.removeItem('selected_nearpro_tier');
                    localStorage.removeItem('selected_nearpro_interval');
                    State.setAuthModal(false);
                    window.location.hash = '#/dashboard/directory';

                    // Fetch user profile and redirect to pricing modal if they are on free tier
                    if (result?.user) {
                        try {
                            const profile = await Api.getProfile(result.user.id);
                            const tier = (profile?.subscription_tier || profile?.tier || 'free').toLowerCase();
                            if (tier === 'free') {
                                State.setPricingModal(true);
                            }
                        } catch (err) {
                            console.error("Failed to check user tier on sign in:", err);
                        }
                    }
                } else {
                    await Api.signUp(email, password);
                    localStorage.removeItem('selected_nearpro_tier');
                    localStorage.removeItem('selected_nearpro_interval');
                    State.setAuthModal(false);
                    window.location.hash = '#/dashboard/directory';
                    // Since it's a new signup, they are Explorer (free) by default. Show pricing modal.
                    State.setPricingModal(true);
                    alert("Registration successful. Please check your inbox for verification links.");
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
