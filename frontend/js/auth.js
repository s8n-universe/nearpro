/**
 * NearPro v3 Tier Gating & Access Control
 * Single source of truth for all paywall checks.
 */

import { State } from './state.js';

/**
 * Tier hierarchy — higher number = more access.
 * Use hasAccess() for all checks, never hardcode tier strings.
 */
export const TIER_LEVELS = {
    free: 0,
    scout: 1,
    hunter: 2,
    agency: 3,
    enterprise: 4
};

/**
 * Tier display names (no hyphens, per brand rules).
 */
export const TIER_NAMES = {
    free: "Explorer",
    scout: "Scout",
    hunter: "Hunter",
    agency: "Agency",
    enterprise: "Enterprise"
};

/**
 * Tier pricing for display.
 */
export const TIER_PRICING = {
    free: { monthly: 0, annual: 0, label: "Free Forever" },
    scout: { monthly: 499, annual: 4999, label: "₹499/mo" },
    hunter: { monthly: 999, annual: 9999, label: "₹999/mo" },
    agency: { monthly: 2499, annual: 24999, label: "₹2,499/mo" },
    enterprise: { monthly: "Custom", annual: "Custom", label: "Enterprise Plan" }
};

/**
 * Check if a user tier meets the required tier level.
 * @param {string} userTier - Current user's tier (e.g. 'scout')
 * @param {string} requiredTier - Minimum tier needed (e.g. 'hunter')
 * @returns {boolean}
 */
export function hasAccess(userTier, requiredTier) {
    return (TIER_LEVELS[userTier] || 0) >= (TIER_LEVELS[requiredTier] || 0);
}

/**
 * Get the current user's tier from State.
 * Falls back through subscription_tier → tier → 'free'.
 * @returns {string}
 */
export function getUserTier() {
    if (!State.profile) return 'free';
    return State.profile.subscription_tier
        || State.profile.tier
        || 'free';
}

/**
 * Check if current user has access to a feature requiring a given tier.
 * Convenience wrapper around hasAccess + getUserTier.
 * @param {string} requiredTier
 * @returns {boolean}
 */
export function currentUserHasAccess(requiredTier) {
    return hasAccess(getUserTier(), requiredTier);
}

/**
 * Show the upgrade modal for a locked feature.
 * @param {Object} config
 * @param {string} config.feature - Feature name (e.g. "Business Health Check")
 * @param {string} config.requiredTier - Minimum tier needed
 * @param {string} config.headline - Modal headline
 * @param {string} config.description - Feature description
 * @param {string} [config.cta] - CTA button text (auto generated if omitted)
 */
export function showUpgradeModal({ feature, requiredTier, headline, description, cta }) {
    const tierName = TIER_NAMES[requiredTier] || requiredTier;
    const pricing = TIER_PRICING[requiredTier];
    const ctaText = cta || `Upgrade to ${tierName} — ${pricing?.label || 'Contact Sales'}`;

    State.upgrade_modal_config = {
        feature,
        requiredTier,
        headline,
        description,
        cta: ctaText,
        tierName,
        pricing
    };
    State.upgrade_modal_open = true;
    State.notify();
}

/**
 * Feature gate definitions — maps feature names to required tiers.
 * Used by UI components to check access and show appropriate gates.
 */
export const FEATURE_GATES = {
    // Scout+ features
    contact_unlock: 'scout',
    csv_export: 'scout',
    lead_lists: 'scout',
    lead_crm: 'scout',
    lead_notes: 'scout',
    compare_modal: 'scout',

    // Hunter+ features
    website_audit: 'hunter',
    conversion_score: 'hunter',
    outreach_studio: 'hunter',
    unlimited_export: 'hunter',
    follow_up_reminders: 'hunter',

    // Agency+ features
    prompt_generator: 'agency',
    bulk_outreach: 'agency',
    integration_hub: 'agency',
    team_workspace: 'agency',
    data_requests: 'agency',
    density_heatmap: 'agency',
    gap_analysis: 'agency',
    whitelabel_reports: 'agency'
};
