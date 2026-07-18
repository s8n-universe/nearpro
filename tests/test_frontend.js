// Mock localStorage for Node environment
global.localStorage = {
    getItem: () => null,
    setItem: () => null,
    removeItem: () => null
};

async function main() {
    const { hasAccess, TIER_LEVELS } = await import('../frontend/js/auth.js');
    const { computeConversionScore } = await import('../frontend/js/scoring.js');

console.log("=== Running Frontend Logic Unit Tests ===");

// 1. Test hasAccess
console.log("\nTesting hasAccess()...");
const tests = [
    { user: 'free', req: 'scout', expected: false },
    { user: 'scout', req: 'free', expected: true },
    { user: 'scout', req: 'scout', expected: true },
    { user: 'scout', req: 'hunter', expected: false },
    { user: 'hunter', req: 'scout', expected: true },
    { user: 'hunter', req: 'hunter', expected: true },
    { user: 'hunter', req: 'agency', expected: false },
    { user: 'agency', req: 'hunter', expected: true },
    { user: 'enterprise', req: 'agency', expected: true }
];

let passCount = 0;
for (const t of tests) {
    const result = hasAccess(t.user, t.req);
    if (result === t.expected) {
        console.log(`  [OK] hasAccess('${t.user}', '${t.req}') -> ${result}`);
        passCount++;
    } else {
        console.error(`  [FAIL] hasAccess('${t.user}', '${t.req}') expected ${t.expected}, got ${result}`);
    }
}

// 2. Test computeConversionScore
console.log("\nTesting computeConversionScore()...");
const pro1 = {
    category: "Dentist in Bandra",
    website: "https://bandradentist.com",
    phone: "+91 98765 43210",
    email: "info@dentist.com",
    rating: 4.5,
    review_count: 20
};
// Expected score:
// no website = 0 (exists)
// review_volume = min(20, round(20/5)) = 4
// rating = >= 4.0 = 15
// recency = reviews > 20 ? 10 : (reviews > 5 ? 5 : 0) = 5
// reachable = phone(5)+website(5)+email(5) = 15
// industry_fit = dentist in Bandra -> includes dentist -> 15
// Total = 0 + 4 + 15 + 5 + 15 + 15 = 54
const score1 = computeConversionScore(pro1);
if (score1 === 54) {
    console.log(`  [OK] computeConversionScore(Dentist, 20 reviews) -> ${score1}`);
    passCount++;
} else {
    console.error(`  [FAIL] computeConversionScore(Dentist, 20 reviews) expected 54, got ${score1}`);
}

const pro2 = {
    category: "Retail Store",
    website: null,
    phone: null,
    email: null,
    rating: 3.2,
    review_count: 2
};
// Expected score:
// no website = 25 (missing)
// review_volume = min(20, round(2/5)) = 0
// rating = < 3.5 = 0
// recency = 0
// reachable = 0
// industry_fit = retail store -> general category -> 8
// Total = 25 + 0 + 0 + 0 + 0 + 8 = 33
const score2 = computeConversionScore(pro2);
if (score2 === 33) {
    console.log(`  [OK] computeConversionScore(Retail, no contacts) -> ${score2}`);
    passCount++;
} else {
    console.error(`  [FAIL] computeConversionScore(Retail, no contacts) expected 33, got ${score2}`);
}

console.log(`\nFrontend verification finished: ${passCount}/${tests.length + 2} passed.`);
    if (passCount !== tests.length + 2) {
        process.exit(1);
    }
}

main().catch(err => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
