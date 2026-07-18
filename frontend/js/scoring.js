/**
 * NearPro v3 Conversion Scoring Engine
 * Port of Lead to Launch lib/scoring.ts — exact same formula.
 * 
 * Computes a 0 to 100 "Lead Intelligence Score" for each professional
 * based on website quality, review volume, rating, reachability, and niche fit.
 */

const HIGH_FIT_NICHES = [
    "dentist", "salon", "clinic", "spa", "gym", "restaurant",
    "cafe", "lawyer", "doctor", "coaching", "ca", "architect", "interior"
];

/**
 * Compute conversion score for a professional.
 * @param {Object} professional - Professional record from Supabase
 * @param {Object|null} audit - Audit cache data (if available)
 * @returns {number} Score from 0 to 100
 */
export function computeConversionScore(professional, audit = null) {
    // Factor 1: No website or bad website (max 25 pts)
    const noOrBadSite = !professional.website ? 25
        : audit?.page_speed_score < 50 ? 20
        : audit?.page_speed_score < 70 ? 10 : 0;

    // Factor 2: Review volume (max 20 pts)
    const reviews = professional.review_count || 0;
    const reviewVolume = Math.min(20, Math.round(reviews / 5));

    // Factor 3: Rating quality (max 15 pts)
    const ratingVal = professional.rating || 0;
    const rating = ratingVal >= 4 ? 15
        : ratingVal >= 3.5 ? 8 : 0;

    // Factor 4: Recency / active business signal (max 10 pts)
    const recency = reviews > 20 ? 10 : reviews > 5 ? 5 : 0;

    // Factor 5: Reachability (max 15 pts)
    const reachable = (professional.phone ? 5 : 0) +
                      (professional.website ? 5 : 0) +
                      (professional.email ? 5 : 0);

    // Factor 6: Industry/niche fit (max 15 pts)
    const categoryLower = (professional.category || "").toLowerCase();
    const fit = HIGH_FIT_NICHES.some(n => categoryLower.includes(n)) ? 15 : 8;

    const total = noOrBadSite + reviewVolume + rating + recency + reachable + fit;
    return Math.min(100, total);
}

/**
 * Compute the full breakdown object for storage in conversion_score_breakdown.
 * @param {Object} professional
 * @param {Object|null} audit
 * @returns {{score: number, breakdown: Object}}
 */
export function computeConversionScoreWithBreakdown(professional, audit = null) {
    const noOrBadSite = !professional.website ? 25
        : audit?.page_speed_score < 50 ? 20
        : audit?.page_speed_score < 70 ? 10 : 0;

    const reviews = professional.review_count || 0;
    const reviewVolume = Math.min(20, Math.round(reviews / 5));

    const ratingVal = professional.rating || 0;
    const rating = ratingVal >= 4 ? 15
        : ratingVal >= 3.5 ? 8 : 0;

    const recency = reviews > 20 ? 10 : reviews > 5 ? 5 : 0;

    const reachable = (professional.phone ? 5 : 0) +
                      (professional.website ? 5 : 0) +
                      (professional.email ? 5 : 0);

    const categoryLower = (professional.category || "").toLowerCase();
    const industryFit = HIGH_FIT_NICHES.some(n => categoryLower.includes(n)) ? 15 : 8;

    const total = Math.min(100, noOrBadSite + reviewVolume + rating + recency + reachable + industryFit);

    return {
        score: total,
        breakdown: {
            noOrBadSite,
            reviewVolume,
            rating,
            recency,
            reachable,
            industryFit
        }
    };
}

/**
 * Get display badge for a conversion score.
 * @param {number} score
 * @returns {{label: string, color: string, emoji: string}|null} Null if score < 40
 */
export function getScoreBadge(score) {
    if (score >= 80) return { label: "High", color: "#22c55e", emoji: "🔥" };
    if (score >= 60) return { label: "Good", color: "#eab308", emoji: "⚡" };
    if (score >= 40) return { label: "Moderate", color: "#6b7280", emoji: "📊" };
    return null; // Don't show badge for low scores
}
