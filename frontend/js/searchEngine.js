/**
 * Deep Search Engine Utility for NearPro Directory
 * Implements:
 * 1. Tokenization & Normalization
 * 2. Industry Synonym & Category Alias Expansion
 * 3. Levenshtein Distance Typo Tolerance
 * 4. Multi-Field Weighted Relevance Scoring Engine
 */

// Category & Synonym Alias Expansion Dictionary
export const CATEGORY_SYNONYMS = {
    'dentist': ['Dental Clinic', 'Dentists', 'Orthodontist', 'Healthcare', 'Dental', 'Teeth'],
    'dental': ['Dental Clinic', 'Dentists', 'Orthodontist', 'Healthcare'],
    'teeth': ['Dental Clinic', 'Dentists', 'Orthodontist'],
    'doctor': ['Clinic', 'Doctors', 'Physician', 'Healthcare', 'Hospital', 'Medical'],
    'clinic': ['Clinic', 'Doctors', 'Healthcare', 'Hospital'],
    'hospital': ['Hospital', 'Clinic', 'Healthcare', 'Doctors'],
    'wedding': ['Events & Entertainment', 'Decorators', 'Caterers', 'Photographers', 'Wedding Decorators'],
    'decorator': ['Decorators', 'Events & Entertainment', 'Wedding Decorators'],
    'catering': ['Caterers', 'Food & Dining', 'Events & Entertainment'],
    'salon': ['Beauty & Wellness', 'Salons', 'Spa', 'Hair Salon', 'Beauty Parlour'],
    'spa': ['Beauty & Wellness', 'Spa', 'Salons'],
    'beauty': ['Beauty & Wellness', 'Salons', 'Spa'],
    'restaurant': ['Food & Dining', 'Restaurants', 'Cafes', 'Dining'],
    'food': ['Food & Dining', 'Restaurants', 'Cafes'],
    'cafe': ['Food & Dining', 'Cafes', 'Restaurants'],
    'coaching': ['Education', 'Coaching Classes', 'Institutes', 'Tuition'],
    'tuition': ['Education', 'Coaching Classes', 'Tuition'],
    'school': ['Education', 'Schools', 'Institutes'],
    'real estate': ['Real Estate', 'Property', 'Builders', 'Agents'],
    'property': ['Real Estate', 'Property', 'Builders'],
    'ca': ['Finance & Legal', 'Chartered Accountants', 'Tax Consultants'],
    'accountant': ['Finance & Legal', 'Chartered Accountants'],
    'lawyer': ['Finance & Legal', 'Lawyers', 'Advocates', 'Legal Services'],
    'plumber': ['Daily Services', 'Plumbers', 'Repair'],
    'electrician': ['Daily Services', 'Electricians', 'Repair'],
    'repair': ['Daily Services', 'Repair & Maintenance'],
    'garage': ['Auto Services', 'Car Service', 'Mechanics'],
    'mechanic': ['Auto Services', 'Mechanics', 'Car Service']
};

// Levenshtein distance for fuzzy matching
export function levenshteinDistance(a, b) {
    if (!a || !b) return (a || b || '').length;
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a === b) return 0;

    const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,       // deletion
                matrix[i][j - 1] + 1,       // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }
    return matrix[a.length][b.length];
}

// Expand search terms with category aliases and synonyms
export function expandSearchTerms(searchQuery) {
    if (!searchQuery || !searchQuery.trim()) return [];

    const raw = searchQuery.trim().toLowerCase();
    const tokens = raw.split(/\s+/).filter(t => t.length > 1);
    const expandedTerms = new Set([raw, ...tokens]);

    for (const token of tokens) {
        for (const [key, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
            if (token === key || levenshteinDistance(token, key) <= 1) {
                synonyms.forEach(syn => expandedTerms.add(syn.toLowerCase()));
            }
        }
    }

    return Array.from(expandedTerms);
}

// Deep Relevance Scoring Engine
export function calculateRelevanceScore(professional, searchQuery) {
    if (!searchQuery || !searchQuery.trim()) return 100;

    const queryLower = searchQuery.trim().toLowerCase();
    const tokens = queryLower.split(/\s+/).filter(t => t.length > 1);
    
    let score = 0;

    const name = (professional.name || '').toLowerCase();
    const category = (professional.category || '').toLowerCase();
    const parentCategory = (professional.parent_category || '').toLowerCase();
    const area = (professional.area || '').toLowerCase();
    const address = (professional.address || '').toLowerCase();
    const rating = parseFloat(professional.rating || 0);
    const reviewCount = parseInt(professional.review_count || 0, 10);

    // 1. Exact & Substring Name Matching
    if (name === queryLower) {
        score += 150;
    } else if (name.startsWith(queryLower)) {
        score += 120;
    } else if (name.includes(queryLower)) {
        score += 90;
    }

    // 2. Token-by-Token Match & Fuzzy Distance
    for (const token of tokens) {
        // Name Token Matching
        if (name.includes(token)) {
            score += 50;
        } else {
            // Check Levenshtein fuzzy distance against words in business name
            const nameWords = name.split(/\s+/);
            for (const word of nameWords) {
                if (word.length >= 3 && token.length >= 3) {
                    const dist = levenshteinDistance(token, word);
                    if (dist === 1) score += 35;
                    else if (dist === 2) score += 20;
                }
            }
        }

        // Category & Sub-category Matching
        if (category.includes(token) || parentCategory.includes(token)) {
            score += 45;
        }

        // Area & Location Matching
        if (area.includes(token)) {
            score += 60;
        } else if (address.includes(token)) {
            score += 30;
        }

        // Synonym / Alias Category Matching
        for (const [key, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
            if (token === key || (token.length >= 4 && levenshteinDistance(token, key) <= 1)) {
                for (const syn of synonyms) {
                    const synLower = syn.toLowerCase();
                    if (category.includes(synLower) || parentCategory.includes(synLower)) {
                        score += 50;
                    }
                }
            }
        }
    }

    // 3. Quality & Social Proof Booster
    if (rating >= 4.5) score += 15;
    else if (rating >= 4.0) score += 8;

    if (reviewCount >= 50) score += 10;
    else if (reviewCount >= 10) score += 5;

    if (professional.phone) score += 5;
    if (professional.email) score += 5;

    return score;
}
