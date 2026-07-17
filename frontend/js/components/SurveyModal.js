import { State } from '../state.js';

export function renderSurveyModal() {
    if (!State.survey_modal_open) return '';

    const suburbs = [
        "Bandra", "Andheri", "Borivali", "Malad", "Goregaon", 
        "Kandivali", "Powai", "Vikhroli", "Ghatkopar", "Kurla", 
        "Chembur", "Worli", "Lower Parel", "Prabhadevi", "Dadar", 
        "Matunga", "BKC", "Juhu", "Versova", "Lokhandwala", 
        "Thane", "Navi Mumbai", "Vashi", "Kharghar", "Belapur", 
        "Mulund", "Bhandup", "Colaba", "Churchgate", "Fort"
    ];

    const parentCategories = [
        "Healthcare", "Beauty & Wellness", "Real Estate", "Education", 
        "Food & Dining", "Finance & Legal", "Technology", "Daily Services", 
        "Retail & Shopping", "Events & Entertainment"
    ];

    const survey = State.user_survey || { role: '', base_suburb: '', target_industry: '' };

    return `
        <div class="modal-overlay open" id="surveyModalOverlay" style="z-index: 11000;">
            <div class="modal-card survey-card" style="max-width: 480px; padding: 36px; position: relative;">
                <button class="modal-close-btn" id="closeSurveyModalBtn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer;">&times;</button>
                
                <div style="font-size: 36px; margin-bottom: 12px;">🎯</div>
                <h2 style="font-size: 20px; margin-bottom: 8px; font-family: var(--font-heading); color: white;">Sales Profile Settings</h2>
                <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 24px; line-height: 1.4;">Configure your business profile to activate personalized client matching, cold outreach templates, and distance mapping.</p>
                
                <form id="surveyForm" style="text-align: left; display: flex; flex-direction: column; gap: 16px;">
                    <!-- Step 1: Role Selection -->
                    <div>
                        <label style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 6px;">Your Core Service Role</label>
                        <select id="surveyRole" class="filter-select" style="width: 100%; padding: 8px 12px; cursor: pointer;" required>
                            <option value="" disabled ${!survey.role ? 'selected' : ''}>Select your specialization...</option>
                            <option value="web_developer" ${survey.role === 'web_developer' ? 'selected' : ''}>💻 Freelance Web Developer (Targets: No Website)</option>
                            <option value="seo_marketer" ${survey.role === 'seo_marketer' ? 'selected' : ''}>📈 SEO & Reputation Marketer (Targets: Low Rating Gaps)</option>
                            <option value="finance_ca" ${survey.role === 'finance_ca' ? 'selected' : ''}>⚖️ Chartered Accountant / Auditor</option>
                            <option value="real_estate" ${survey.role === 'real_estate' ? 'selected' : ''}>🏢 Real Estate Broker / Agent</option>
                            <option value="other" ${survey.role === 'other' ? 'selected' : ''}>💼 General B2B Services / Sales</option>
                        </select>
                    </div>

                    <!-- Step 2: Base Suburb Location -->
                    <div>
                        <label style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 6px;">Your Base Suburb Location</label>
                        <select id="surveyBase" class="filter-select" style="width: 100%; padding: 8px 12px; cursor: pointer;" required>
                            <option value="" disabled ${!survey.base_suburb ? 'selected' : ''}>Select base area...</option>
                            ${suburbs.map(s => `<option value="${s}" ${survey.base_suburb === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Step 3: Target Client Category -->
                    <div>
                        <label style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 6px;">Primary Target Client Industry</label>
                        <select id="surveyIndustry" class="filter-select" style="width: 100%; padding: 8px 12px; cursor: pointer;" required>
                            <option value="" disabled ${!survey.target_industry ? 'selected' : ''}>Select target sector...</option>
                            ${parentCategories.map(c => `<option value="${c}" ${survey.target_industry === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>

                    <button type="submit" class="brand-btn" style="width: 100%; padding: 12px; margin-top: 12px; font-size: 13px;">
                        Save & Personalize Feed
                    </button>
                </form>
            </div>
        </div>
    `;
}

export function bindSurveyModalEvents() {
    const closeBtn = document.getElementById('closeSurveyModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            State.setSurveyModal(false);
        });
    }

    const form = document.getElementById('surveyForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const role = document.getElementById('surveyRole').value;
            const base_suburb = document.getElementById('surveyBase').value;
            const target_industry = document.getElementById('surveyIndustry').value;

            State.setSurvey({
                role,
                base_suburb,
                target_industry
            });

            State.setSurveyModal(false);
        });
    }
}
