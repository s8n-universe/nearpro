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

                <p style="font-size: 12.5px; color: rgba(255,255,255,0.35); margin: 0 0 54px 0; font-weight: 400;">No credit card required</p>

                <!-- Trust Logo Strip -->
                <div class="hero-bullets" style="display: flex; flex-direction: column; align-items: center; gap: 18px;">
                    <div style="font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.35);">Trusted by founders at India's leading B2B agencies</div>
                    <div style="display: flex; justify-content: center; align-items: center; gap: 36px; flex-wrap: wrap; opacity: 0.45;">
                        <span style="font-size: 13.5px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'Inter', sans-serif;">PeakGrowth</span>
                        <span style="font-size: 13.5px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'Inter', sans-serif;">OutreachLabs</span>
                        <span style="font-size: 13.5px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'Inter', sans-serif;">ScaleUp</span>
                        <span style="font-size: 13.5px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'Inter', sans-serif;">ClientFlow</span>
                        <span style="font-size: 13.5px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'Inter', sans-serif;">PixelCraft</span>
                    </div>
                </div>
            </div>
        </section>
    `;
}
