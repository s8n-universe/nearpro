import { State } from '../state.js';
import { Api } from '../api.js';

export function renderPersonalizationModal() {
    if (!State.personalization_modal_open) return '';

    const name = State.profile?.full_name || '';
    const company = State.profile?.company_name || '';
    const portfolio = State.profile?.portfolio_url || '';
    const booking = State.profile?.booking_url || '';

    return `
        <div class="modal-overlay open" id="personalizationModalOverlay" style="z-index: 11000; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px);">
            <div class="modal-card" style="max-width: 480px; padding: 36px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(18, 18, 18, 0.95); border-radius: var(--radius-lg); position: relative; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
                <button class="modal-close-btn" id="closePersonalizationModalBtn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer;">&times;</button>
                
                <div style="font-size: 36px; margin-bottom: 12px;">🚀</div>
                <h2 style="font-size: 20px; margin-bottom: 8px; font-family: var(--font-heading); color: white; font-weight: 700;">Personalize Your Outreach Profile</h2>
                <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 24px; line-height: 1.5;">Welcome to NearPro Premium! Configure your personalization settings to customize your generated AI pitches, emails, and portfolio audit URLs automatically.</p>
                
                <form id="personalizationForm" style="text-align: left; display: flex; flex-direction: column; gap: 16px;">
                    <!-- Step 1: Sender Name -->
                    <div>
                        <label style="font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; display: block; margin-bottom: 6px;">Your Name <span style="color: var(--accent-pink);">*</span></label>
                        <input type="text" id="personalizeName" value="${name}" placeholder="e.g. Shri Naik" style="width: 100%; padding: 10px 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px;" required />
                    </div>

                    <!-- Step 2: Agency / Business Name -->
                    <div>
                        <label style="font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; display: block; margin-bottom: 6px;">Agency / Business Name <span style="color: var(--accent-pink);">*</span></label>
                        <input type="text" id="personalizeCompany" value="${company}" placeholder="e.g. NearPro Agency" style="width: 100%; padding: 10px 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px;" required />
                    </div>

                    <!-- Step 3: Custom Portfolio / Website URL -->
                    <div>
                        <label style="font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; display: block; margin-bottom: 6px;">Custom Portfolio URL (Optional)</label>
                        <input type="url" id="personalizePortfolio" value="${portfolio}" placeholder="e.g. https://myagency.com" style="width: 100%; padding: 10px 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px;" />
                        <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px;">Replaces default demo mock links with your agency's website link.</span>
                    </div>

                    <!-- Step 4: Calendly / Booking Link -->
                    <div>
                        <label style="font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); text-transform: uppercase; display: block; margin-bottom: 6px;">Meeting Booking Link (Optional)</label>
                        <input type="url" id="personalizeBooking" value="${booking}" placeholder="e.g. https://calendly.com/shri" style="width: 100%; padding: 10px 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: white; font-size: 13px;" />
                        <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px;">Replaces booking placeholders with your direct Calendly or booking URL.</span>
                    </div>

                    <button type="submit" class="brand-btn" style="width: 100%; padding: 12px; margin-top: 12px; font-size: 13.5px; font-weight: 600; cursor: pointer;">
                        Save & Activate Outreach
                    </button>
                </form>
            </div>
        </div>
    `;
}

export function bindPersonalizationModalEvents() {
    const closeBtn = document.getElementById('closePersonalizationModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            State.setPersonalizationModal(false);
        });
    }

    const form = document.getElementById('personalizationForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('personalizeName').value.strip ? document.getElementById('personalizeName').value.strip() : document.getElementById('personalizeName').value.trim();
            const company = document.getElementById('personalizeCompany').value.strip ? document.getElementById('personalizeCompany').value.strip() : document.getElementById('personalizeCompany').value.trim();
            const portfolio = document.getElementById('personalizePortfolio').value.trim();
            const booking = document.getElementById('personalizeBooking').value.trim();

            try {
                // Persist personalization details to profiles table
                const { error } = await Api.supabase.from('profiles').update({
                    full_name: name,
                    company_name: company,
                    portfolio_url: portfolio,
                    booking_url: booking,
                    updated_at: new Date().toISOString()
                }).eq('id', State.user.id);

                if (error) throw error;

                if (State.profile) {
                    State.profile.full_name = name;
                    State.profile.company_name = company;
                    State.profile.portfolio_url = portfolio;
                    State.profile.booking_url = booking;
                }

                State.setPersonalizationModal(false);
                
                // Show confirmation to user
                alert("Personalization profile saved successfully!");
                State.notify();
            } catch (err) {
                console.error("Failed to save personalization details:", err);
                alert("Could not save your preferences. Please try again.");
            }
        });
    }
}
