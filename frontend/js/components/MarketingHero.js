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

                <!-- Top pill banner -->
                <div id="heroWaitlistBanner" style="margin: 0 auto 28px; display: inline-flex; align-items: center; gap: 8px; padding: 7px 16px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 100px; cursor: pointer; transition: all 0.2s ease;" onclick="window.State.setWaitlistModal(true, 'Pune')" onmouseover="this.style.background='rgba(255,255,255,0.07)'; this.style.borderColor='rgba(255,255,255,0.14)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'; this.style.borderColor='rgba(255,255,255,0.08)'">
                    <span style="width: 6px; height: 6px; background: #22c55e; border-radius: 50%; flex-shrink: 0;"></span>
                    <span id="heroTopBannerLeads" style="font-size: 13px; color: rgba(255,255,255,0.7); font-weight: 500;">Live in Mumbai with ${totalLeads} verified leads</span>
                    <span style="color: rgba(255,255,255,0.2);">·</span>
                    <span style="font-size: 13px; color: rgba(255,255,255,0.5); font-weight: 500;">Pune, Delhi & Bangalore coming soon</span>
                </div>

                <!-- Main headline -->
                <h1 class="hero-title" style="font-size: 52px; font-weight: 700; line-height: 1.12; letter-spacing: -1.8px; margin-bottom: 20px;">
                    Find local businesses.<br>Close more deals.
                </h1>

                <!-- Subtitle -->
                <p class="hero-desc" style="max-width: 560px; margin: 0 auto 36px; line-height: 1.65; font-size: 17px;">
                    Stop buying cold lead lists. NearPro surfaces warm, signal ready local businesses for Indian digital agencies — in real time.
                </p>

                <!-- CTA row — clean, Apollo-style -->
                <div class="hero-ctas" style="max-width: 460px; margin: 0 auto 20px; display: flex; gap: 0; align-items: center; background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden;">
                    <input type="email" id="heroEmailInput" placeholder="Enter your work email" style="flex: 1; padding: 14px 18px; background: transparent; border: none; color: #ffffff; font-size: 14.5px; font-weight: 500; outline: none; font-family: inherit;" />
                    <button id="heroSignupBtn" style="padding: 14px 28px; background: var(--accent-gold, #ffa000); color: #000000; font-size: 14px; font-weight: 700; border: none; cursor: pointer; white-space: nowrap; font-family: inherit; letter-spacing: 0.1px; transition: background 0.15s;" onmouseover="this.style.background='#ffb733'" onmouseout="this.style.background='var(--accent-gold, #ffa000)'">
                        Get started free
                    </button>
                </div>

                <p style="font-size: 12.5px; color: rgba(255,255,255,0.35); margin: 0 0 44px 0; font-weight: 400;">No credit card required</p>

                <!-- Trust stats strip -->
                <div class="hero-bullets" style="display: flex; justify-content: center; gap: 32px; flex-wrap: wrap;">
                    <span id="heroTotalLeads" style="font-size: 13px;">${totalLeads} Verified Leads</span>
                    <span id="heroTotalCategories" style="font-size: 13px;">${totalCategories} Categories</span>
                    <span id="heroAvgRating" style="font-size: 13px;">${avgRating} Avg Rating</span>
                    <span style="font-size: 13px;">India Focused</span>
                </div>
            </div>
        </section>
    `;
}
