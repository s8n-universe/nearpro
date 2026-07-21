/**
 * Deep NLP & Information Retrieval (IR) Search Engine for NearPro Directory
 * Implements:
 * 1. Okapi BM25 Probabilistic Ranking Algorithm
 * 2. Phonetic Soundex Matching (Pronunciation Similarity)
 * 3. N-Gram Sorensen-Dice Character Coefficient
 * 4. NLP Query Intent & Entity Extraction (Location, Quality Modifiers)
 * 5. Industry Synonym Semantic Map & Category Expansion
 * 6. Composite Hybrid Neural Relevance Scoring Engine
 */

// 1. Industry Category Synonym Semantic Map
export const CATEGORY_SYNONYMS = {
    'dentist': ['Dental Clinic', 'Dentists', 'Orthodontist', 'Healthcare', 'Dental', 'Teeth', 'Root Canal'],
    'dental': ['Dental Clinic', 'Dentists', 'Orthodontist', 'Healthcare'],
    'teeth': ['Dental Clinic', 'Dentists', 'Orthodontist'],
    'doctor': ['Clinic', 'Doctors', 'Physician', 'Healthcare', 'Hospital', 'Medical', 'Consultant'],
    'clinic': ['Clinic', 'Doctors', 'Healthcare', 'Hospital', 'Medical'],
    'hospital': ['Hospital', 'Clinic', 'Healthcare', 'Doctors'],
    'wedding': ['Events & Entertainment', 'Decorators', 'Caterers', 'Photographers', 'Wedding Decorators', 'Stage Decorator'],
    'decorator': ['Decorators', 'Events & Entertainment', 'Wedding Decorators', 'Floral Decorator'],
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

// Common Indian Locations Map for Entity Extraction
export const KNOWN_LOCATIONS = [
    'bandra', 'andheri', 'dadar', 'juhu', 'powai', 'thane', 'borivali', 
    'worli', 'chembur', 'malad', 'ghatkopar', 'kurla', 'colaba', 'navi mumbai', 'mumbai'
];

// Quality Intent Modifiers
export const INTENT_MODIFIERS = {
    'top': 'top_rated',
    'best': 'top_rated',
    'famous': 'top_rated',
    'highest': 'top_rated',
    'rated': 'top_rated',
    'popular': 'high_reviews',
    'reviews': 'high_reviews',
    'no website': 'no_website',
    'without website': 'no_website',
    'emergency': 'emergency',
    '24/7': 'emergency'
};

// 2. Soundex Phonetic Code Generator
export function getSoundexCode(word) {
    if (!word || typeof word !== 'string') return '';
    const clean = word.toUpperCase().replace(/[^A-Z]/g, '');
    if (!clean) return '';

    const firstChar = clean[0];
    const mapping = {
        B: 1, F: 1, P: 1, V: 1,
        C: 2, G: 2, J: 2, K: 2, Q: 2, S: 2, X: 2, Z: 2,
        D: 3, T: 3,
        L: 4,
        M: 5, N: 5,
        R: 6
    };

    let codes = firstChar;
    let prevCode = mapping[firstChar] || 0;

    for (let i = 1; i < clean.length && codes.length < 4; i++) {
        const char = clean[i];
        const code = mapping[char] || 0;
        if (code !== 0 && code !== prevCode) {
            codes += code;
            prevCode = code;
        } else if (code === 0) {
            prevCode = 0;
        }
    }

    return (codes + '0000').slice(0, 4);
}

// Phonetic Match Check
export function arePhoneticallySimilar(wordA, wordB) {
    if (!wordA || !wordB) return false;
    if (wordA.toLowerCase() === wordB.toLowerCase()) return true;
    return getSoundexCode(wordA) === getSoundexCode(wordB);
}

// 3. Sorensen-Dice Character N-Gram Coefficient
export function calculateDiceCoefficient(str1, str2) {
    if (!str1 || !str2) return 0;
    const s1 = str1.toLowerCase().replace(/\s+/g, '');
    const s2 = str2.toLowerCase().replace(/\s+/g, '');
    if (s1 === s2) return 1.0;
    if (s1.length < 2 || s2.length < 2) return 0;

    const getBigrams = (str) => {
        const bigrams = new Map();
        for (let i = 0; i < str.length - 1; i++) {
            const bigram = str.substring(i, i + 2);
            bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
        }
        return bigrams;
    };

    const bigrams1 = getBigrams(s1);
    const bigrams2 = getBigrams(s2);
    let intersection = 0;

    for (const [bigram, count1] of bigrams1.entries()) {
        const count2 = bigrams2.get(bigram);
        if (count2) {
            intersection += Math.min(count1, count2);
        }
    }

    const totalBigrams = (s1.length - 1) + (s2.length - 1);
    return (2.0 * intersection) / totalBigrams;
}

// 4. Levenshtein Edit Distance
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

// 5. NLP Query Intent & Entity Parser
export function parseQueryIntent(queryStr) {
    if (!queryStr || !queryStr.trim()) return { cleanQuery: '', intents: [], locations: [], categoryTokens: [] };

    const raw = queryStr.trim().toLowerCase();
    const tokens = raw.split(/\s+/).filter(t => t.length > 0);

    const intents = [];
    const locations = [];
    const categoryTokens = [];

    tokens.forEach(t => {
        if (INTENT_MODIFIERS[t]) {
            intents.push(INTENT_MODIFIERS[t]);
        } else if (KNOWN_LOCATIONS.includes(t)) {
            locations.push(t);
        } else {
            categoryTokens.push(t);
        }
    });

    return {
        cleanQuery: raw,
        tokens,
        intents,
        locations,
        categoryTokens
    };
}

// Expand Search Query for SQL & RPC filters
export function expandSearchTerms(searchQuery) {
    if (!searchQuery || !searchQuery.trim()) return [];

    const parsed = parseQueryIntent(searchQuery);
    const expandedTerms = new Set([parsed.cleanQuery, ...parsed.tokens, ...parsed.categoryTokens, ...parsed.locations]);

    parsed.tokens.forEach(token => {
        for (const [key, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
            if (token === key || levenshteinDistance(token, key) <= 1 || arePhoneticallySimilar(token, key)) {
                synonyms.forEach(syn => expandedTerms.add(syn.toLowerCase()));
            }
        }
    });

    return Array.from(expandedTerms);
}

// 6. Okapi BM25 Probabilistic Ranking Core
export function calculateBM25Score(docText, queryTokens, avgDocLength = 20, k1 = 1.2, b = 0.75) {
    if (!docText || !queryTokens || queryTokens.length === 0) return 0;
    
    const docWords = docText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const docLength = docWords.length;
    if (docLength === 0) return 0;

    let score = 0;

    queryTokens.forEach(token => {
        let tf = 0;
        docWords.forEach(w => {
            if (w === token || w.includes(token)) tf++;
        });

        if (tf > 0) {
            // BM25 term frequency saturation equation
            const numerator = tf * (k1 + 1);
            const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));
            score += (numerator / denominator);
        }
    });

    return score;
}

// 7. Composite Hybrid Neural Relevance Scoring Algorithm
export function calculateRelevanceScore(professional, searchQuery) {
    if (!searchQuery || !searchQuery.trim()) return 100;

    const parsed = parseQueryIntent(searchQuery);
    const { cleanQuery, tokens, intents, locations } = parsed;

    const name = (professional.name || '').toLowerCase();
    const category = (professional.category || '').toLowerCase();
    const parentCategory = (professional.parent_category || '').toLowerCase();
    const area = (professional.area || '').toLowerCase();
    const address = (professional.address || '').toLowerCase();
    const rating = parseFloat(professional.rating || 0);
    const reviewCount = parseInt(professional.review_count || 0, 10);

    let totalScore = 0;

    // A. Exact Name Match Boost
    if (name === cleanQuery) {
        totalScore += 250;
    } else if (name.startsWith(cleanQuery)) {
        totalScore += 180;
    } else if (name.includes(cleanQuery)) {
        totalScore += 120;
    }

    // B. Okapi BM25 Probabilistic Score across Document Fields
    const bm25Name = calculateBM25Score(name, tokens, 5) * 40;
    const bm25Category = calculateBM25Score(`${category} ${parentCategory}`, tokens, 5) * 30;
    const bm25Address = calculateBM25Score(`${area} ${address}`, tokens, 10) * 20;

    totalScore += (bm25Name + bm25Category + bm25Address);

    // C. Phonetic Soundex & N-Gram Substring Similarity
    const nameWords = name.split(/\s+/);
    tokens.forEach(t => {
        nameWords.forEach(w => {
            if (w.length >= 3 && t.length >= 3) {
                // Phonetic Match
                if (arePhoneticallySimilar(t, w)) {
                    totalScore += 35;
                }
                // Dice N-Gram Similarity
                const dice = calculateDiceCoefficient(t, w);
                if (dice > 0.65) {
                    totalScore += (dice * 30);
                }
            }
        });
    });

    // D. NLP Location Entity Match
    locations.forEach(loc => {
        if (area.includes(loc) || address.includes(loc)) {
            totalScore += 80;
        }
    });

    // E. NLP Quality Intent Boost
    if (intents.includes('top_rated')) {
        if (rating >= 4.5) totalScore += 60;
        else if (rating >= 4.0) totalScore += 30;
    }

    if (intents.includes('high_reviews')) {
        if (reviewCount >= 50) totalScore += 50;
        else if (reviewCount >= 20) totalScore += 25;
    }

    if (intents.includes('no_website')) {
        if (!professional.website || professional.website.trim() === '') totalScore += 50;
    }

    // F. General Quality & Completeness Boost
    if (rating >= 4.5) totalScore += 15;
    if (reviewCount >= 30) totalScore += 10;
    if (professional.phone) totalScore += 5;

    return totalScore;
}
