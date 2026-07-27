import { renderScratchCardWidget, initScratchCardCanvas } from './ScratchCard.js';

export function renderMarketingHero(stats = null) {
    // Dynamic values with default fallbacks
    const totalLeads = stats?.total_professionals 
        ? `${stats.total_professionals.toLocaleString('en-IN')}+` 
        : '12,358+';
    const avgRating = stats?.average_rating 
        ? `${stats.average_rating}★` 
        : '4.7★';
    const totalCategories = stats?.total_categories 
        ? `${stats.total_categories}+` 
        : '400+';

    return `
        <section class="marketing-hero">
            <div class="container hero-content">
                <div class="hero-tag">INTELLIGENCE, ARCHITECTED</div>
                <div id="heroWaitlistBanner" style="margin: 0 auto 20px; display: inline-flex; align-items: center; gap: 10px; padding: 8px 18px; background: rgba(255, 160, 0, 0.1); border: 1px solid rgba(255, 160, 0, 0.25); border-radius: 100px; backdrop-filter: blur(8px); cursor: pointer; transition: all 0.2s ease; flex-wrap: wrap; justify-content: center;" onclick="window.State.setWaitlistModal(true, 'Pune')" onmouseover="this.style.background='rgba(255, 160, 0, 0.18)'; this.style.borderColor='rgba(255, 160, 0, 0.4)'" onmouseout="this.style.background='rgba(255, 160, 0, 0.1)'; this.style.borderColor='rgba(255, 160, 0, 0.25)'">
                    <span style="font-size: 13px; color: var(--accent-gold); font-weight: 700;">📍 Live in Mumbai (${totalLeads} Verified Leads)</span>
                    <span style="color: rgba(255,255,255,0.4);">•</span>
                    <span style="font-size: 13px; color: #ffffff; font-weight: 500;">Pune, Delhi & Bangalore Dropping Next Month!</span>
                    <span style="padding: 4px 10px; background: var(--accent-gold); color: #000; font-size: 11px; font-weight: 800; border-radius: 20px; font-family: var(--font-mono); text-transform: uppercase;">Join Waitlist 🚀</span>
                </div>
                
                <!-- Interactive Scratch Card Hero Widget -->
                ${renderScratchCardWidget(42)}

                <h1 class="hero-title">No More Inaccurate Directories. <br>Find, Pitch, and Close <span class="brand-text">Premium B2B Clients.</span></h1>
                <p class="hero-desc" style="max-width: 680px; margin: 0 auto 32px; line-height: 1.6;">
                    The AI-powered sales workstation for B2B agencies. Map verified leads, run automated audits, generate customized proposals, and sync deals to your CRM on autopilot.
                </p>
                <div class="hero-search-widget" style="max-width: 580px; margin: 0 auto 36px; padding: 6px; background: rgba(10, 10, 12, 0.65); border: 1.5px solid var(--border); border-radius: 100px; backdrop-filter: blur(12px); box-shadow: 0 16px 40px rgba(0,0,0,0.5); display: flex; gap: 4px; align-items: center;">
                    <div style="flex: 1.2; padding-left: 16px; display: flex; align-items: center; gap: 8px; border-right: 1px solid rgba(255,255,255,0.08);">
                        <span style="font-size: 14px;">🎯</span>
                        <select id="heroSectorSelect" style="width: 100%; background: transparent; border: none; color: white; font-size: 13.5px; font-weight: 600; outline: none; cursor: pointer;">
                            <option value="Healthcare" style="background:#0a0a0c;">🩺 Healthcare / Doctors</option>
                            <option value="Beauty & Wellness" style="background:#0a0a0c;">💅 Beauty &amp; Wellness</option>
                            <option value="Real Estate" style="background:#0a0a0c;">🏢 Real Estate Agents</option>
                            <option value="Food & Dining" style="background:#0a0a0c;">🍕 Food &amp; Dining</option>
                        </select>
                    </div>
                    <div style="flex: 1; padding-left: 12px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 14px;">📍</span>
                        <select id="heroAreaSelect" style="width: 100%; background: transparent; border: none; color: white; font-size: 13.5px; font-weight: 600; outline: none; cursor: pointer;">
                            <option value="Bandra" style="background:#0a0a0c;">Bandra West</option>
                            <option value="Andheri" style="background:#0a0a0c;">Andheri East</option>
                            <option value="Worli" style="background:#0a0a0c;">Worli Suburb</option>
                            <option value="Dadar" style="background:#0a0a0c;">Dadar Central</option>
                            <option value="Juhu" style="background:#0a0a0c;">Juhu Beach</option>
                        </select>
                    </div>
                    <button id="heroSearchBtn" class="brand-btn" style="padding: 12px 28px; font-size: 13.5px; font-weight: 700; border-radius: 100px; white-space: nowrap; box-shadow: 0 4px 15px rgba(255, 160, 0, 0.35);">
                        Find Free Leads ➔
                    </button>
                </div>
                <script>
                    setTimeout(() => {
                        const btn = document.getElementById('heroSearchBtn');
                        if (btn) {
                            btn.addEventListener('click', () => {
                                const sector = document.getElementById('heroSectorSelect').value;
                                const area = document.getElementById('heroAreaSelect').value;
                                window.State.updateFilters({
                                    parentCategory: sector,
                                    area: area,
                                    min_rating: "4.0",
                                    has_email: true,
                                    has_phone: true,
                                    has_website: true,
                                    website_filter: "has_website"
                                });
                                window.location.hash = '#/dashboard/directory';
                            });
                        }
                    }, 100);
                </script>
                <div class="hero-bullets">
                    <span id="heroTotalLeads">${totalLeads} Verified Leads</span>
                    <span id="heroTotalCategories">${totalCategories} Sub Categories</span>
                    <span id="heroAvgRating">${avgRating} Average Rating</span>
                    <span>India Focused</span>
                </div>
            </div>
        </section>
    `;
}
