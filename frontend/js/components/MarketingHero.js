export function renderMarketingHero() {
    return `
        <section class="marketing-hero">
            <div class="container hero-content">
                <div class="hero-tag">INTELLIGENCE, ARCHITECTED</div>
                <h1 class="hero-title">Discover Local Professionals <br>with <span class="brand-text">Verified Data.</span></h1>
                <p class="hero-desc" style="max-width: 680px; margin: 0 auto 32px; line-height: 1.6;">
                    India's first trusted lead intelligence platform. While US tools guess Indian business details, NearPro maps every suburb, street, and pin code with 100% verified data.
                </p>
                <div class="hero-ctas">
                    <a href="#/browse" class="brand-btn">
                        Browse Professional Directory
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                    <button class="secondary-btn" onclick="localStorage.removeItem('nearpro_demo_completed'); window.State.locked = false; window.State.session_started = null; window.location.hash = '#/browse';" style="cursor: pointer;">
                        Start Guided Tour
                    </button>
                </div>
                <div class="hero-bullets">
                    <span>4,700+ Verified Leads</span>
                    <span>11 Active Parent Industries</span>
                    <span>99% Coordinate Accuracy</span>
                    <span>Mumbai Focus</span>
                </div>
            </div>
        </section>
    `;
}
