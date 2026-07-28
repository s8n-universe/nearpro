import { State } from '../state.js';
import { Api } from '../api.js';

export function renderAuthModal() {
    if (!State.auth_modal_open || State.user) return '';

    return `
        <div class="modal-overlay open" id="authModalOverlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #09090b; z-index: 100000; display: flex; align-items: center; justify-content: center; overflow: hidden; font-family: 'Space Grotesk', sans-serif; padding: 0 !important;">
            <div class="auth-split-container">
                
                <!-- Left Pane Concise Light Theme Login Form -->
                <div class="auth-left-pane">
                    
                    <div style="width: 100%; max-width: 360px; margin: 0 auto;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                            <!-- Inline Back Arrow Button -->
                            <button class="modal-close-btn" id="closeAuthModalBtn" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; border: 1px solid #cbd5e1; background: rgba(0, 0, 0, 0.03); color: #475569; cursor: pointer; transition: all 0.2s; outline: none; padding: 0; flex-shrink: 0;" onmouseover="this.style.background='rgba(0,0,0,0.06)'; this.style.color='#0f172a';" onmouseout="this.style.background='rgba(0,0,0,0.03)'; this.style.color='#475569';">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12"></line>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                            </button>
                            
                            <!-- Logo and Title -->
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <img src="/NearPro_logo_nobg.png" alt="NearPro Logo" style="height: 32px; width: auto; object-fit: contain;">
                                <span style="font-family: var(--font-heading); font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">NearPro<sup style="font-size: 11px; font-weight: bold; color: var(--accent-gold, #ffa000); margin-left: 2px;">™</sup></span>
                            </div>
                        </div>
                        <h2 style="font-size: 32px; font-weight: 800; margin-bottom: 8px; text-align: left; font-family: var(--font-heading); color: #0f172a; letter-spacing: -0.5px;">
                            Welcome back
                        </h2>
                        <p style="font-size: 14px; color: #64748b; margin: 0 0 24px 0; line-height: 1.5;">
                            Log in to your Account. Enter your credentials to access the platform.
                        </p>
                        
                        <!-- Social Login Grid -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px;">
                            <!-- Google -->
                            <button id="googleAuthBtn" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; font-size: 13px; font-weight: 600; cursor: pointer; transition: background-color 0.2s, border-color 0.2s;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21.35,11.1H12v2.7h5.3c-0.22,1.2 -0.9,2.2 -1.9,2.9v2.4h3.1c1.8,-1.7 2.9,-4.1 2.9,-7c0,-0.3 -0.03,-0.7 -0.05,-1z" fill="#4285F4"/>
                                    <path d="M12,20.5c2.3,0 4.2,-0.8 5.6,-2.1l-3.1,-2.4c-0.9,0.6 -2,0.9 -2.5,0.9 -2.1,0 -3.9,-1.4 -4.5,-3.3H4.3v2.5C5.7,18.8 8.6,20.5 12,20.5z" fill="#34A853"/>
                                    <path d="M7.5,13.6c-0.1,-0.4 -0.2,-0.8 -0.2,-1.2c0,-0.4 0.1,-0.8 0.2,-1.2V8.7H4.3C3.5,10.2 3.1,11.9 3.1,13.6c0,1.7 0.4,3.4 1.2,4.9l3.2,-2.5c-0.6,-0.6 -1,-1.5 -1,-2.4z" fill="#FBBC05"/>
                                    <path d="M12,6.5c1.2,0 2.3,0.4 3.2,1.2l2.4,-2.4C16.1,4 14.2,3.1 12,3.1c-3.4,0 -6.3,1.7 -7.7,4.6l3.2,2.5c0.6,-1.9 2.4,-3.3 4.5,-3.3z" fill="#EA4335"/>
                                </svg>
                                <span>Google</span>
                            </button>
                            
                            <!-- LinkedIn -->
                            <button id="linkedinAuthBtn" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; font-size: 13px; font-weight: 600; cursor: pointer; transition: background-color 0.2s, border-color 0.2s;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a66c2">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                                <span>LinkedIn</span>
                            </button>
                            
                            <!-- HubSpot -->
                            <button id="hubspotAuthBtn" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; font-size: 13px; font-weight: 600; cursor: pointer; transition: background-color 0.2s, border-color 0.2s;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff7a59">
                                    <path d="M19.9 12.4c-.4-.4-.9-.6-1.5-.7v-3c.8-.4 1.3-1.3 1.3-2.3 0-1.5-1.2-2.7-2.7-2.7S14.3 4.9 14.3 6.4c0 1 .5 1.9 1.3 2.3v3c-.6.1-1.1.3-1.5.7l-4.5-4.5c.3-.5.4-1.1.4-1.8 0-1.9-1.5-3.4-3.4-3.4S3.2 4.1 3.2 6c0 1.9 1.5 3.4 3.4 3.4.7 0 1.3-.2 1.8-.5l4.5 4.5c-.4.4-.6.9-.7 1.5H9.3c-.4-.8-1.3-1.3-2.3-1.3-1.5 0-2.7 1.2-2.7 2.7S5.5 19 7 19c1 0 1.9-.5 2.3-1.3h2.9c.1.6.3 1.1.7 1.5l-3.3 3.3c-.3-.1-.6-.2-.9-.2-1.3 0-2.3 1-2.3 2.3s1 2.3 2.3 2.3 2.3-1 2.3-2.3c0-.3-.1-.6-.2-.9l3.3-3.3c.4.4.9.6 1.5.7v2.9c-.8.4-1.3 1.3-1.3 2.3c0 1.5 1.2 2.7 2.7 2.7s2.7-1.2 2.7-2.7c0-1-.5-1.9-1.3-2.3v-2.9c.6-.1 1.1-.3 1.5-.7l3.3 3.3c-.1.3-.2.6-.2.9 0 1.3 1 2.3 2.3 2.3s2.3-1 2.3-2.3-1-2.3-2.3-2.3c-.3 0-.6.1-.9.2l-3.3-3.3c.4-.4.6-.9.7-1.5h3c.4.8 1.3 1.3 2.3 1.3 1.5 0 2.7-1.2 2.7-2.7s-1.2-2.7-2.7-2.7c-1 0-1.9.5-2.3 1.3h-3c-.1-.6-.3-1.1-.7-1.5l4.5-4.5zm-2.9-6c0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4-.8 0-1.4-.6-1.4-1.4zM6.6 7.4c-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4zm.4 10.2c-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4zm10.9-4.2c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4zm.5 5.2c-.8 0-1.4-.6-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4 0 .8-.6 1.4-1.4 1.4z"/>
                                </svg>
                                <span>HubSpot</span>
                            </button>
                            
                            <!-- Zoho -->
                            <button id="zohoAuthBtn" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; font-size: 13px; font-weight: 600; cursor: pointer; transition: background-color 0.2s, border-color 0.2s;">
                                <img src="https://cdn.brandfetch.io/idssig0_jY/w/800/h/344/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1687855848599" alt="Zoho Logo" style="height: 12px; width: auto; object-fit: contain;">
                                <span>Zoho</span>
                            </button>
                        </div>
                        
                        <div style="display: flex; align-items: center; margin-bottom: 24px;">
                            <hr style="flex: 1; border: none; border-top: 1px solid #e2e8f0; margin: 0;">
                            <span style="padding: 0 16px; font-size: 12px; color: #94a3b8; font-weight: 500;">or continue with email</span>
                            <hr style="flex: 1; border: none; border-top: 1px solid #e2e8f0; margin: 0;">
                        </div>
                        
                        <!-- Tab headers -->
                        <div style="display: flex; gap: 16px; border-bottom: 1px solid #f1f5f9; margin-bottom: 24px;">
                            <button id="signInTabBtn" class="tab-header-btn active" style="flex: 1; padding-bottom: 10px; font-size: 14px; background: none; border: none; cursor: pointer; font-weight: 700;">
                                Sign In
                            </button>
                            <button id="signUpTabBtn" class="tab-header-btn" style="flex: 1; padding-bottom: 10px; font-size: 14px; background: none; border: none; cursor: pointer; font-weight: 700;">
                                Register
                            </button>
                        </div>
                        
                        <!-- Form body -->
                        <form id="authForm">
                            <div style="margin-bottom: 16px;">
                                <label style="display: block; font-size: 13px; color: #334155; margin-bottom: 6px; font-weight: 600;">Email Address</label>
                                <input type="email" id="authEmailInput" class="auth-input" required placeholder="name@domain.com" style="width:100%; padding:12px 14px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; color:#0f172a; font-size:14px; outline:none; transition: border-color 0.2s, box-shadow 0.2s;">
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <label style="display: block; font-size: 13px; color: #334155; margin-bottom: 6px; font-weight: 600;">Password</label>
                                <div style="position: relative;">
                                    <input type="password" id="authPasswordInput" class="auth-input" required placeholder="••••••••" style="width:100%; padding:12px 14px; padding-right: 40px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; color:#0f172a; font-size:14px; outline:none; transition: border-color 0.2s, box-shadow 0.2s;">
                                    <button type="button" id="togglePasswordVisibilityBtn" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px;">
                                        <svg id="passwordVisibilityIcon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <!-- Under field options -->
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; font-size: 13px;">
                                <label style="display: flex; align-items: center; gap: 8px; color: #475569; cursor: pointer; font-weight: 500;">
                                    <input type="checkbox" style="cursor: pointer; border-radius: 4px;">
                                    <span>Remember me</span>
                                </label>
                                <a href="#" style="color: var(--accent-gold); text-decoration: none; font-weight: 600;">Forgot password?</a>
                            </div>

                            <!-- Registration Agreement Checkbox -->
                            <div id="signUpConsentWrapper" style="display: none; margin-bottom: 16px;">
                                <label style="display: flex; align-items: flex-start; gap: 6px; font-size: 11px; color: #475569; line-height: 1.4; cursor: pointer;">
                                    <input type="checkbox" id="authTermsConsentCb" checked style="margin-top: 2px; cursor: pointer;">
                                    <span>
                                        I agree to NearPro's <a href="#/terms" target="_blank" style="color: var(--accent-gold); text-decoration: underline; font-weight: 600;">Terms of Service</a> and <a href="#/privacy" target="_blank" style="color: var(--accent-gold); text-decoration: underline; font-weight: 600;">Privacy Policy</a>.
                                    </span>
                                </label>
                            </div>
                            
                            <div id="authErrorMsg" style="color: var(--accent-pink); font-size: 11.5px; margin-bottom: 12px; display: none; line-height: 1.4;"></div>
                            
                            <button type="submit" id="authSubmitBtn" class="brand-btn" style="width: 100%; padding: 12px; font-size: 15px; font-weight: 700; cursor: pointer; background: linear-gradient(135deg, var(--accent-gold), #ea580c); color: white; border: none; border-radius: 8px; margin-top: 8px; transition: opacity 0.2s;">
                                Sign In
                            </button>
                            
                            <div style="margin-top: 20px; text-align: center; font-size: 13px; color: #475569;">
                                <span id="authToggleHintText">New to NearPro?</span>
                                <a href="#" id="authToggleLinkBtn" style="color: var(--accent-gold); text-decoration: underline; margin-left: 2px; font-weight: 600;">Create an account</a>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Right Pane Product Showcase -->
                <div class="auth-right-pane">
                    <!-- Subtle Ambient Background Glows & Pattern -->
                    <div style="position: absolute; top: -60px; right: -60px; width: 450px; height: 450px; background: rgba(255, 255, 255, 0.16); filter: blur(100px); border-radius: 50%; pointer-events: none; z-index: 1;"></div>
                    <div style="position: absolute; bottom: -80px; left: 80px; width: 500px; height: 500px; background: rgba(236, 72, 153, 0.35); filter: blur(120px); border-radius: 50%; pointer-events: none; z-index: 1;"></div>

                    <div style="z-index: 2; display: flex; flex-direction: column; gap: 20px; width: 100%; height: 100%; justify-content: space-between;">
                        
                        <!-- Top Header & Features Area (Full Width) -->
                        <div style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
                            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.18); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding: 5px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.28); box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                                    <span style="width: 7px; height: 7px; border-radius: 50%; background: #4ade80; display: inline-block; box-shadow: 0 0 8px #4ade80;"></span>
                                    <span style="font-size: 11px; font-weight: 800; color: white; text-transform: uppercase; letter-spacing: 0.9px;">NearPro Agency Suite</span>
                                </div>
                                <div style="display: flex; gap: 16px; font-size: 11.5px; font-weight: 700; color: rgba(255,255,255,0.9);">
                                    <span>⚡ 12,800+ Leads Extracted</span>
                                    <span>&bull;</span>
                                    <span>🎯 99.8% Verified Mobiles</span>
                                </div>
                            </div>

                            <div style="width: 100%; text-align: left;">
                                <h1 style="font-size: 34px; font-weight: 800; font-family: var(--font-heading); color: #ffffff; line-height: 1.2; margin: 0 0 8px 0; letter-spacing: -0.6px; text-shadow: 0 2px 10px rgba(0,0,0,0.15);">
                                    Simplify Your Business Operations
                                </h1>
                                <p style="color: rgba(255, 255, 255, 0.95); font-size: 14.5px; line-height: 1.5; margin: 0; font-weight: 400; max-width: 900px;">
                                    From search directory mapping to instant pipeline syncing, everything your agency needs is right here.
                                </p>
                            </div>

                            <!-- Full Width Responsive Glassmorphic Feature Cards Grid (4 Columns across wide screen) -->
                            <div class="auth-features-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 4px; width: 100%;">
                                <div style="background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.22); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-radius: 12px; padding: 12px 14px; display: flex; gap: 10px; align-items: flex-start;">
                                    <div style="background: rgba(255,255,255,0.22); border-radius: 8px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 800; flex-shrink: 0; margin-top: 1px; box-shadow: inset 0 1px 1px rgba(255,255,255,0.4);">✓</div>
                                    <div>
                                        <div style="font-size: 13px; font-weight: 700; color: #ffffff;">Unlimited Lead Mapping</div>
                                        <div style="font-size: 11px; color: rgba(255,255,255,0.85); margin-top: 2px; line-height: 1.3;">Extract verified directories with direct phones.</div>
                                    </div>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.22); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-radius: 12px; padding: 12px 14px; display: flex; gap: 10px; align-items: flex-start;">
                                    <div style="background: rgba(255,255,255,0.22); border-radius: 8px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 800; flex-shrink: 0; margin-top: 1px; box-shadow: inset 0 1px 1px rgba(255,255,255,0.4);">✓</div>
                                    <div>
                                        <div style="font-size: 13px; font-weight: 700; color: #ffffff;">1-Click CRM Sync</div>
                                        <div style="font-size: 11px; color: rgba(255,255,255,0.85); margin-top: 2px; line-height: 1.3;">Push leads to Sheets, Zoho, or your CRM.</div>
                                    </div>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.22); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-radius: 12px; padding: 12px 14px; display: flex; gap: 10px; align-items: flex-start;">
                                    <div style="background: rgba(255,255,255,0.22); border-radius: 8px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 800; flex-shrink: 0; margin-top: 1px; box-shadow: inset 0 1px 1px rgba(255,255,255,0.4);">✓</div>
                                    <div>
                                        <div style="font-size: 13px; font-weight: 700; color: #ffffff;">Instant Site Audits</div>
                                        <div style="font-size: 11px; color: rgba(255,255,255,0.85); margin-top: 2px; line-height: 1.3;">Generate PDF proposals with site gaps.</div>
                                    </div>
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.22); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-radius: 12px; padding: 12px 14px; display: flex; gap: 10px; align-items: flex-start;">
                                    <div style="background: rgba(255,255,255,0.22); border-radius: 8px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 800; flex-shrink: 0; margin-top: 1px; box-shadow: inset 0 1px 1px rgba(255,255,255,0.4);">✓</div>
                                    <div>
                                        <div style="font-size: 13px; font-weight: 700; color: #ffffff;">AI Outreach Composer</div>
                                        <div style="font-size: 11px; color: rgba(255,255,255,0.85); margin-top: 2px; line-height: 1.3;">Draft personalized pitch emails on autopilot.</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- High Fidelity Interactive Dashboard Preview Frame (Edge-to-Edge Width) -->
                        <div style="position: relative; width: 100%; flex: 1; min-height: 380px; max-height: 480px; margin: 6px 0 10px 0;">
                            
                            <!-- Floating Glass Badge: Top Right -->
                            <div style="position: absolute; top: -14px; right: 24px; z-index: 10; background: rgba(15, 23, 42, 0.88); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px; padding: 6px 16px; display: flex; align-items: center; gap: 8px; box-shadow: 0 12px 24px rgba(0,0,0,0.35); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); animation: pulseFloat 4s ease-in-out infinite;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 10px #22c55e;"></span>
                                <span style="font-size: 11.5px; font-weight: 700; color: #ffffff;">⚡ +1,248 Verified Leads Mapped Today</span>
                            </div>

                            <!-- Floating Glass Badge: Bottom Left -->
                            <div style="position: absolute; bottom: -12px; left: 28px; z-index: 10; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.22); border-radius: 20px; padding: 6px 16px; display: flex; align-items: center; gap: 8px; box-shadow: 0 12px 24px rgba(0,0,0,0.35); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
                                <span style="font-size: 12px;">🔄</span>
                                <span style="font-size: 11.5px; font-weight: 700; color: #ffffff;">Auto-Synced with Google Sheets, Zoho & Custom CRM</span>
                            </div>

                            <!-- Main Browser Window -->
                            <div class="auth-browser-mockup" style="width: 100%; height: 100%; background: rgba(15, 23, 42, 0.82); border: 1px solid rgba(255,255,255,0.18); border-radius: 14px; box-shadow: 0 35px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.12); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; flex-direction: column; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; transition: all 0.3s ease;">
                                
                                <!-- Browser Header Bar -->
                                <div style="background: rgba(30, 41, 59, 0.65); padding: 10px 20px; display: flex; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); gap: 16px;">
                                    <!-- Window buttons -->
                                    <div style="display: flex; gap: 7px;">
                                        <span style="width: 11px; height: 11px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
                                        <span style="width: 11px; height: 11px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
                                        <span style="width: 11px; height: 11px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
                                    </div>
                                    <!-- Address Bar -->
                                    <div style="flex: 1; max-width: 420px; margin: 0 auto; background: rgba(15, 23, 42, 0.5); border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); padding: 4px 14px; text-align: center; color: rgba(255,255,255,0.6); font-size: 11px; font-family: monospace; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                        app.nearpro.com/agency/dashboard
                                    </div>
                                    <!-- Status Indicator -->
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e;"></span>
                                        <span style="font-size: 10.5px; color: rgba(255,255,255,0.7); font-weight: 600;">Engine Active</span>
                                    </div>
                                </div>

                                <!-- Browser Inner Layout Split -->
                                <div style="display: flex; flex: 1; overflow: hidden; height: calc(100% - 37px);">
                                    <!-- Left Navigation Sidebar inside Mockup -->
                                    <div style="width: 140px; background: rgba(30, 41, 59, 0.4); border-right: 1px solid rgba(255,255,255,0.06); padding: 14px 10px; display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;">
                                        <div style="background: rgba(245, 158, 11, 0.18); border-left: 3px solid var(--accent-gold, #f59e0b); color: #ffffff; padding: 7px 10px; border-radius: 0 6px 6px 0; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                                            <span>📊</span> Overview
                                        </div>
                                        <div style="color: rgba(255,255,255,0.6); padding: 7px 10px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                            <span>📍</span> Lead Map
                                        </div>
                                        <div style="color: rgba(255,255,255,0.6); padding: 7px 10px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                            <span>⚡</span> Outreach CRM
                                        </div>
                                        <div style="color: rgba(255,255,255,0.6); padding: 7px 10px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                            <span>📄</span> PDF Audits
                                        </div>

                                        <div style="margin-top: auto; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 8px; text-align: center;">
                                            <div style="font-size: 9px; color: rgba(255,255,255,0.4); text-transform: uppercase; font-weight: 700;">Scraper Health</div>
                                            <div style="font-size: 12px; font-weight: 800; color: #22c55e; margin-top: 2px;">99.8% Uptime</div>
                                        </div>
                                    </div>

                                    <!-- Main Panel Display inside Mockup -->
                                    <div style="flex: 1; padding: 18px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto;">
                                        <!-- Header row inside Mockup -->
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <div>
                                                <div style="font-size: 15px; font-weight: 800; color: #ffffff; letter-spacing: -0.2px;">Agency Lead Pipeline & Workstation</div>
                                                <div style="font-size: 10.5px; color: rgba(255,255,255,0.5);">Real-time local directory extraction & automated outreach</div>
                                            </div>
                                            <div style="display: flex; gap: 8px;">
                                                <span style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; border: 1px solid rgba(245, 158, 11, 0.3);">Export CSV</span>
                                                <span style="background: rgba(34, 197, 94, 0.15); color: #22c55e; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; border: 1px solid rgba(34, 197, 94, 0.3);">+ Auto-Sync All</span>
                                            </div>
                                        </div>

                                        <!-- Stat Metric Grid Row -->
                                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                                            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); padding: 10px 14px; border-radius: 8px;">
                                                <div style="font-size: 9.5px; color: rgba(255,255,255,0.5); font-weight: 600;">Total Leads Mapped</div>
                                                <div style="font-size: 17px; font-weight: 800; color: #ffffff; margin-top: 2px; display: flex; align-items: baseline; gap: 6px;">
                                                    12,840
                                                    <span style="font-size: 9.5px; color: #22c55e; font-weight: 700;">+18% today</span>
                                                </div>
                                            </div>
                                            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); padding: 10px 14px; border-radius: 8px;">
                                                <div style="font-size: 9.5px; color: rgba(255,255,255,0.5); font-weight: 600;">Mobile Direct Dials</div>
                                                <div style="font-size: 17px; font-weight: 800; color: #38bdf8; margin-top: 2px; display: flex; align-items: baseline; gap: 6px;">
                                                    98.4%
                                                    <span style="font-size: 9.5px; color: rgba(255,255,255,0.4);">Verified</span>
                                                </div>
                                            </div>
                                            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); padding: 10px 14px; border-radius: 8px;">
                                                <div style="font-size: 9.5px; color: rgba(255,255,255,0.5); font-weight: 600;">CRM Auto-Sync</div>
                                                <div style="font-size: 17px; font-weight: 800; color: #22c55e; margin-top: 2px; display: flex; align-items: baseline; gap: 6px;">
                                                    100% Active
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Lead Pipeline Table Feed -->
                                        <div style="display: flex; flex-direction: column; gap: 8px;">
                                            <!-- Lead Row 1 -->
                                            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
                                                <div style="display: flex; align-items: center; gap: 12px;">
                                                    <div style="width: 32px; height: 32px; border-radius: 6px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px;">AW</div>
                                                    <div>
                                                        <div style="font-size: 12.5px; font-weight: 700; color: #ffffff;">Apex Web Developers</div>
                                                        <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 1px;">📞 +1 (555) 019-2834 &bull; Mobile Verified &bull; San Francisco, CA</div>
                                                    </div>
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 10px;">
                                                    <span style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 3px 8px; border-radius: 4px; font-size: 9.5px; font-weight: 700;">Speed Gap: 42</span>
                                                    <span style="background: linear-gradient(135deg, #f59e0b, #ea580c); color: #ffffff; padding: 4px 12px; border-radius: 5px; font-size: 10px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(234, 88, 12, 0.4);">⚡ Sync CRM</span>
                                                </div>
                                            </div>
                                            
                                            <!-- Lead Row 2 -->
                                            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
                                                <div style="display: flex; align-items: center; gap: 12px;">
                                                    <div style="width: 32px; height: 32px; border-radius: 6px; background: linear-gradient(135deg, #10b981, #047857); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px;">BD</div>
                                                    <div>
                                                        <div style="font-size: 12.5px; font-weight: 700; color: #ffffff;">Bandra Dental Clinic</div>
                                                        <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 1px;">📞 +1 (555) 014-9921 &bull; Direct Mobile &bull; Mumbai, MH</div>
                                                    </div>
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 10px;">
                                                    <span style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); padding: 3px 8px; border-radius: 4px; font-size: 9.5px; font-weight: 700;">Score: 95</span>
                                                    <span style="color: rgba(255,255,255,0.5); font-size: 10px; font-weight: 600; padding: 4px 8px;">✓ Synced to Zoho</span>
                                                </div>
                                            </div>

                                            <!-- Lead Row 3 -->
                                            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
                                                <div style="display: flex; align-items: center; gap: 12px;">
                                                    <div style="width: 32px; height: 32px; border-radius: 6px; background: linear-gradient(135deg, #8b5cf6, #6d28d9); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px;">NV</div>
                                                    <div>
                                                        <div style="font-size: 12.5px; font-weight: 700; color: #ffffff;">Nova Architecture Studio</div>
                                                        <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 1px;">📞 +1 (555) 017-4820 &bull; Mobile Verified &bull; Austin, TX</div>
                                                    </div>
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 10px;">
                                                    <span style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 3px 8px; border-radius: 4px; font-size: 9.5px; font-weight: 700;">Audit Needed</span>
                                                    <span style="background: rgba(255,255,255,0.08); color: #ffffff; padding: 4px 12px; border-radius: 5px; font-size: 10px; font-weight: 700; cursor: pointer;">PDF Audit</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Bottom Footer Context -->
                        <div style="font-size: 12px; color: rgba(255,255,255,0.6); display: flex; justify-content: space-between; align-items: center; width: 100%; padding-top: 4px;">
                            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.6);">
                                <span>🔒</span> 256-Bit Encrypted Data &bull; SOC2 Type II Certified &bull; 99.99% Uptime Guarantee
                            </div>
                            <div style="display: flex; gap: 16px; align-items: center;">
                                <a href="#/terms" style="color: rgba(255,255,255,0.7); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Terms of Service</a>
                                <span>&bull;</span>
                                <a href="#/privacy" style="color: rgba(255,255,255,0.7); text-decoration: none; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">Privacy Policy</a>
                            </div>
                        </div>
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
                background: #ffffff;
            }
            .auth-left-pane {
                width: 440px;
                flex-shrink: 0;
                padding: 48px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                background: #ffffff;
                position: relative;
            }
            .auth-right-pane {
                flex: 1;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 25%, #d97706 50%, #e11d48 80%, #be185d 100%);
                background-image: radial-gradient(rgba(255, 255, 255, 0.16) 1.2px, transparent 1.2px), linear-gradient(135deg, #f97316 0%, #ea580c 25%, #d97706 50%, #e11d48 80%, #be185d 100%);
                background-size: 24px 24px, 100% 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 48px 56px;
                position: relative;
                overflow: hidden;
            }
            .auth-left-pane .tab-header-btn {
                background: none;
                border: none;
                padding-bottom: 10px;
                font-size: 14px;
                cursor: pointer;
                font-weight: 700;
                transition: all 0.2s ease;
                border-bottom: 2px solid transparent !important;
            }
            .auth-left-pane .tab-header-btn:hover {
                color: #0f172a !important;
                border-bottom: 2px solid #ffa000 !important;
            }
            .auth-left-pane .tab-header-btn.active {
                color: #0f172a !important;
                border-bottom: 2px solid var(--accent-gold) !important;
            }
            .auth-left-pane .tab-header-btn:not(.active) {
                color: #64748b !important;
                border-bottom: 2px solid transparent !important;
            }
            .auth-input::placeholder {
                color: #94a3b8 !important;
                opacity: 1 !important;
            }
            .auth-left-pane .auth-input {
                background: #f8fafc !important;
                border: 1px solid #cbd5e1 !important;
                color: #0f172a !important;
            }
            .auth-left-pane .auth-input:focus {
                border-color: var(--accent-gold) !important;
                box-shadow: 0 0 0 2px rgba(255, 160, 0, 0.15) !important;
            }
            .auth-browser-mockup:hover {
                transform: translateY(-4px) scale(1.005);
                border-color: rgba(255, 255, 255, 0.35) !important;
                box-shadow: 0 45px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.2) !important;
            }
            @keyframes pulseFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-6px); }
            }
            #googleAuthBtn:hover, #linkedinAuthBtn:hover, #hubspotAuthBtn:hover, #zohoAuthBtn:hover {
                background-color: #f8fafc !important;
                border-color: #cbd5e1 !important;
            }
            .auth-input:focus {
                border-color: var(--accent-gold) !important;
                box-shadow: 0 0 0 2px rgba(255, 160, 0, 0.15) !important;
            }
            @media (max-width: 1280px) {
                .auth-features-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                }
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
            if (signInTab) signInTab.classList.add('active');
            if (signUpTab) signUpTab.classList.remove('active');
            submitBtn.innerText = 'Sign In';
            toggleHint.innerText = 'New to NearPro?';
            toggleLink.innerText = 'Create an account';
            if (errorMsg) errorMsg.style.display = 'none';
        } else {
            currentTab = 'signup';
            if (signUpTab) signUpTab.classList.add('active');
            if (signInTab) signInTab.classList.remove('active');
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

    // Password Visibility Toggle
    const togglePasswordBtn = document.getElementById('togglePasswordVisibilityBtn');
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            const iconSvg = document.getElementById('passwordVisibilityIcon');
            if (iconSvg) {
                if (isPassword) {
                    iconSvg.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
                } else {
                    iconSvg.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
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

                    // Trigger automated Resend Welcome Email
                    try {
                        await Api.supabase.functions.invoke('send-invoice-email', {
                            body: {
                                type: 'welcome',
                                user_email: email,
                                user_name: email.split('@')[0]
                            }
                        });
                    } catch (welcomeEmailErr) {
                        console.warn("Failed to trigger welcome email:", welcomeEmailErr);
                    }

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
