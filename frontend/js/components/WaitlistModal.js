import { State } from '../state.js';
import { Api } from '../api.js';

export function renderWaitlistModal() {
    if (!State.waitlist_modal_open) return '';

    const defaultEmail = State.user ? (State.user.email || '') : '';
    const selectedCity = State.waitlist_city || 'Pune';

    return `
        <div class="modal-overlay active" id="waitlistModalOverlay" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 100000; padding: 20px; animation: fadeIn 0.2s ease;">
            <div class="modal-card" style="background: var(--bg-surface, #0d1117); border: 1.5px solid rgba(255, 160, 0, 0.3); border-radius: var(--radius-lg, 16px); width: 100%; max-width: 520px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 160, 0, 0.15); overflow: hidden; position: relative;">
                
                <!-- Close Button -->
                <button id="closeWaitlistModalBtn" style="position: absolute; top: 16px; right: 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); color: var(--text-muted); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#fff'; this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.color='var(--text-muted)'; this.style.background='rgba(255,255,255,0.05)'">
                    ✕
                </button>

                <div style="padding: 32px 28px 24px;">
                    <!-- Badge -->
                    <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(255, 160, 0, 0.12); border: 1px solid rgba(255, 160, 0, 0.3); border-radius: 20px; color: var(--accent-gold, #ffa000); font-size: 11.5px; font-family: var(--font-mono); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                        📍 Live in Mumbai • 12,358+ Verified Businesses
                    </div>

                    <!-- Title & Copy -->
                    <h2 style="font-family: var(--font-heading); font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 10px; line-height: 1.3;">
                        Request Your City & Join Priority Waitlist 🚀
                    </h2>
                    <p style="color: var(--text-secondary, #94a3b8); font-size: 13.5px; line-height: 1.6; margin-bottom: 24px;">
                        We start with Mumbai because it’s India’s #1 B2B hub — <strong>12,358+ verified business profiles</strong>. Pune, Delhi / NCR & Bangalore are dropping next month! Request your city below to get notified & unlock <strong>1 Month Free Scout Tier</strong> when data goes live.
                    </p>

                    <!-- Form -->
                    <form id="cityWaitlistForm" style="display: flex; flex-direction: column; gap: 16px;">
                        <div>
                            <label style="display: block; font-size: 12px; font-family: var(--font-mono); color: var(--text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Your Work Email</label>
                            <input type="email" id="waitlistEmailInput" required value="${defaultEmail}" placeholder="name@agency.com or phone" style="width: 100%; padding: 12px 14px; background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border, #334155); border-radius: var(--radius-sm, 8px); color: #ffffff; font-size: 14px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--accent-gold)'" onblur="this.style.borderColor='var(--border)'">
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="display: block; font-size: 12px; font-family: var(--font-mono); color: var(--text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Target City</label>
                                <select id="waitlistCitySelect" style="width: 100%; padding: 12px 14px; background: #0f172a; border: 1px solid var(--border, #334155); border-radius: var(--radius-sm, 8px); color: #ffffff; font-size: 13.5px; outline: none; cursor: pointer;">
                                    <option value="Pune" ${selectedCity === 'Pune' ? 'selected' : ''}>Pune</option>
                                    <option value="Delhi / NCR" ${selectedCity === 'Delhi / NCR' || selectedCity === 'Delhi' ? 'selected' : ''}>Delhi / NCR</option>
                                    <option value="Bangalore" ${selectedCity === 'Bangalore' ? 'selected' : ''}>Bangalore</option>
                                    <option value="Hyderabad" ${selectedCity === 'Hyderabad' ? 'selected' : ''}>Hyderabad</option>
                                    <option value="Ahmedabad" ${selectedCity === 'Ahmedabad' ? 'selected' : ''}>Ahmedabad</option>
                                    <option value="Kolkata" ${selectedCity === 'Kolkata' ? 'selected' : ''}>Kolkata</option>
                                    <option value="Chennai" ${selectedCity === 'Chennai' ? 'selected' : ''}>Chennai</option>
                                    <option value="Surat" ${selectedCity === 'Surat' ? 'selected' : ''}>Surat</option>
                                    <option value="Jaipur" ${selectedCity === 'Jaipur' ? 'selected' : ''}>Jaipur</option>
                                    <option value="Other">Other City</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; font-family: var(--font-mono); color: var(--text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Your Profession</label>
                                <select id="waitlistRoleSelect" style="width: 100%; padding: 12px 14px; background: #0f172a; border: 1px solid var(--border, #334155); border-radius: var(--radius-sm, 8px); color: #ffffff; font-size: 13.5px; outline: none; cursor: pointer;">
                                    <option value="Digital Marketing Agency">Agency Owner</option>
                                    <option value="Freelancer">Freelancer</option>
                                    <option value="Web Developer">Web Developer</option>
                                    <option value="B2B Sales Rep">B2B Sales Rep</option>
                                    <option value="Business Owner">Business Owner</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" id="submitWaitlistBtn" class="brand-btn" style="width: 100%; padding: 14px; font-size: 14px; font-weight: 700; background: linear-gradient(135deg, var(--accent-gold, #ffa000), #ea580c); color: white; border: none; border-radius: var(--radius-sm, 8px); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px; box-shadow: 0 4px 15px rgba(255, 160, 0, 0.3);">
                            Join Priority Waitlist ➔
                        </button>
                    </form>

                    <div id="waitlistSuccessMessage" style="display: none; padding: 16px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: var(--radius-sm, 8px); color: #4ade80; text-align: center; font-size: 14px; margin-top: 16px; line-height: 1.5;">
                        🎉 <strong>You're on the priority waitlist!</strong><br>We will notify your email the moment data for your requested city drops.
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function bindWaitlistModalEvents() {
    const closeBtn = document.getElementById('closeWaitlistModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            State.setWaitlistModal(false);
        });
    }

    const overlay = document.getElementById('waitlistModalOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                State.setWaitlistModal(false);
            }
        });
    }

    const form = document.getElementById('cityWaitlistForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submitWaitlistBtn');
            const successMsg = document.getElementById('waitlistSuccessMessage');
            const email = document.getElementById('waitlistEmailInput').value.trim();
            const requested_city = document.getElementById('waitlistCitySelect').value;
            const user_role = document.getElementById('waitlistRoleSelect').value;

            if (!email) return;

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Submitting...';
            }

            try {
                await Api.joinCityWaitlist({ email, requested_city, user_role });
                
                // Trigger automated Resend confirmation email
                try {
                    await Api.supabase.functions.invoke('send-invoice-email', {
                        body: {
                            type: 'waitlist',
                            user_email: email,
                            user_name: email.split('@')[0]
                        }
                    });
                } catch (emailErr) {
                    console.warn("Failed to send waitlist email via Resend:", emailErr);
                }

                if (form) form.style.display = 'none';
                if (successMsg) {
                    successMsg.style.display = 'block';
                    successMsg.innerHTML = `🎉 <strong>You're on the priority waitlist for ${requested_city}!</strong><br>A confirmation email has been sent to <strong>${email}</strong>. We will notify you the moment data goes live.`;
                }
                setTimeout(() => {
                    State.setWaitlistModal(false);
                }, 3000);
            } catch (err) {
                console.error("Waitlist submission failed: ", err);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Join Priority Waitlist ➔';
                }
                alert("Failed to join waitlist. Please try again.");
            }
        });
    }
}
