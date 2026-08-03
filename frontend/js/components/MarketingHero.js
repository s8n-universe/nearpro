export function renderMarketingHero(stats = null) {
    // Dynamic values with default fallbacks
    const totalLeads = stats?.total_professionals 
        ? `${stats.total_professionals.toLocaleString('en-IN')}+` 
        : '12,358+';
    const avgRating = stats?.average_rating 
        ? `${stats.average_rating}` 
        : '4.7';
    const totalCategories = stats?.total_categories 
        ? `${stats.total_categories}+` 
        : '400+';

    return `
        <section class="marketing-hero" style="padding-top: 18px;">
            <div class="container hero-content" style="max-width: 820px;">

                <!-- Top Announcement Capsule -->
                <div id="heroAnnouncementBanner" style="margin: 0 auto 28px; display: inline-flex; align-items: center; gap: 8px; padding: 7px 16px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 100px; cursor: pointer; transition: all 0.2s ease;" onclick="window.location.hash = '#/docs'" onmouseover="this.style.background='rgba(255,255,255,0.07)'; this.style.borderColor='rgba(255,255,255,0.14)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'; this.style.borderColor='rgba(255,255,255,0.08)'">
                    <span style="display: inline-flex; align-items: center; justify-content: center; background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.5px;">New</span>
                    <span style="font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 500;">Documentation is now public. Explore API & integration guides</span>
                    <span style="font-size: 11px; color: rgba(255,255,255,0.4); margin-left: 2px;">➔</span>
                </div>

                <!-- Main headline -->
                <h1 class="hero-title" style="font-size: 52px; font-weight: 700; line-height: 1.12; letter-spacing: -1.8px; margin-bottom: 20px;">
                    Find local businesses.<br>Close more deals.
                </h1>

                <p class="hero-desc" style="max-width: 560px; margin: 0 auto 36px; line-height: 1.65; font-size: 17px;">
                    Stop buying cold lead lists. NearPro surfaces warm, signal ready local businesses for Indian digital agencies in real time.
                </p>

                <!-- CTA row — clean, Apollo-style -->
                <div class="hero-ctas" style="max-width: 460px; margin: 0 auto 20px; display: flex; gap: 0; align-items: center; background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden;">
                    <input type="email" id="heroEmailInput" placeholder="Enter your work email" style="flex: 1; padding: 14px 18px; background: transparent; border: none; color: #ffffff; font-size: 14.5px; font-weight: 500; outline: none; font-family: inherit;" />
                    <button id="heroSignupBtn" style="padding: 14px 28px; background: var(--accent-gold, #ffa000); color: #000000; font-size: 14px; font-weight: 700; border: none; cursor: pointer; white-space: nowrap; font-family: inherit; letter-spacing: 0.1px; transition: background 0.15s;" onmouseover="this.style.background='#ffb733'" onmouseout="this.style.background='var(--accent-gold, #ffa000)'">
                        Get started free
                    </button>
                </div>

                <p style="font-size: 12.5px; color: rgba(255,255,255,0.35); margin: 0 0 54px 0; font-weight: 400;">No credit card required</p>

                <!-- Integrations & Stack compatibility Strip -->
                <div class="hero-bullets" style="display: flex; flex-direction: column; align-items: center; gap: 18px;">
                    <div style="font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.35);">Compatible with your existing agency stack</div>
                    <div style="display: flex; justify-content: center; align-items: center; gap: 28px; flex-wrap: wrap; opacity: 0.5;">
                        <span style="font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            Google Sheets
                        </span>
                        <span style="font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>
                            HubSpot
                        </span>
                        <span style="font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                            Zoho CRM
                        </span>
                        <span style="font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                            Make.com
                        </span>
                        <span style="font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                            n8n Workflow
                        </span>
                    </div>
                </div>
            </div>
        </section>
    `;
}
