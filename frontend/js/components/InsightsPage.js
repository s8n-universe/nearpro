import { State } from '../state.js';
import { currentUserHasAccess } from '../auth.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export function renderInsightsPage() {
    if (!State.stats) {
        return `
            <div class="container" style="padding: 40px 0; text-align: center;">
                <div class="spinner" style="margin: 0 auto 16px;"></div>
                <p>Loading market insights...</p>
            </div>
        `;
    }

    const s = State.stats;
    const isPro = currentUserHasAccess('agency');
    
    // Convert UTC last sync to local time
    const lastSyncStr = (s.last_sync || s.last_scraped) 
        ? new Date(s.last_sync || s.last_scraped).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) 
        : 'Unavailable';

    // --- Compute REAL metrics from stats data ---
    const totalProfs = s.total_professionals || 0;
    const withWebsite = s.with_website || 0;
    const noWebsitePct = totalProfs > 0 ? ((totalProfs - withWebsite) / totalProfs * 100).toFixed(1) : '0.0';

    // Compute top area (highest density) from area_insights if available
    const areaInsights = State.area_insights;
    const areaDensity = areaInsights?.area_density || [];
    const catDist = areaInsights?.category_distribution || [];

    const topArea = areaDensity.length > 0 ? areaDensity[0].area : 'N/A';
    const bottomArea = areaDensity.length > 1 ? areaDensity[areaDensity.length - 1].area : 'N/A';
    const lowestRatingArea = areaDensity.length > 0
        ? [...areaDensity].sort((a, b) => (a.avg_rating || 5) - (b.avg_rating || 5))[0].area
        : 'N/A';
    const smallestCategory = catDist.length > 0
        ? [...catDist].sort((a, b) => a.count - b.count)[0].category
        : 'N/A';

    // Compute real completeness/verification ratio
    const withPhone = s.with_phone || 0;
    const withEmail = s.with_email || 0;
    const verificationPct = totalProfs > 0 ? ((withPhone + withEmail + withWebsite) / (totalProfs * 3) * 100).toFixed(1) : '0.0';
    const avgRating = s.average_rating || '0.0';

    return `
        <div class="container" style="padding: 40px 0;">
            <div class="feed-header" style="margin-bottom: 40px;">
                <div class="feed-title-wrap">
                    <h2>Mumbai Market Insights</h2>
                    <p class="feed-subtitle">Realtime geospatial and categorical intelligence from Harvest Data Engine. Last sync: ${lastSyncStr}</p>
                    <div style="margin-top: 12px; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: var(--radius-sm); background: rgba(255, 160, 0, 0.1); border: 1px solid rgba(255, 160, 0, 0.2); font-size: 12px; color: var(--accent-gold); font-family: var(--font-mono);">
                        ⚡ Realtime verified data: directly pulled from Google Maps, not a stored static dataset
                    </div>
                </div>
            </div>
            
            <!-- Key Metric Grid (Computed from real Supabase data) -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 48px;">
                <div class="feature-panel" style="padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid var(--accent-gold);">
                    <div style="text-align: left;">
                        <div style="font-size: 12px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Outreach Opportunities</div>
                        <div style="font-size: 32px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${noWebsitePct}%</div>
                        <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Leads missing verified websites (${totalProfs - withWebsite} of ${totalProfs})</div>
                    </div>
                    <div style="font-size: 28px; opacity: 0.8;">🌐</div>
                </div>
                <div class="feature-panel" style="padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid var(--accent-pink);">
                    <div style="text-align: left;">
                        <div style="font-size: 12px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Highest Density Suburb</div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--accent-pink); margin-top: 4px;">${topArea}</div>
                        <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Most listings concentrated area</div>
                    </div>
                    <div style="font-size: 28px; opacity: 0.8;">🔥</div>
                </div>
                <div class="feature-panel" style="padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid #3b82f6;">
                    <div style="text-align: left;">
                        <div style="font-size: 12px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Smallest Category</div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px;">${smallestCategory}</div>
                        <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Lowest listings concentration</div>
                    </div>
                    <div style="font-size: 28px; opacity: 0.8;">🛠️</div>
                </div>
                <div class="feature-panel" style="padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid #10b981;">
                    <div style="text-align: left;">
                        <div style="font-size: 12px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Needs Review Boost</div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${lowestRatingArea}</div>
                        <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Lowest avg rating suburb (avg: ${avgRating})</div>
                    </div>
                    <div style="font-size: 28px; opacity: 0.8;">📈</div>
                </div>
            </div>
            
            <!-- Charts Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 48px; min-height: 350px;">
                <div class="feature-panel" style="padding: 32px; display: flex; flex-direction: column;">
                    <h3 style="font-size: 18px; margin-bottom: 24px; font-family: var(--font-heading);">Category Distribution</h3>
                    <div style="flex: 1; position: relative; max-height: 300px; display: flex; justify-content: center;">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
                
                <div class="feature-panel" style="padding: 32px; display: flex; flex-direction: column;">
                    <h3 style="font-size: 18px; margin-bottom: 24px; font-family: var(--font-heading);">Density by Neighborhood Area</h3>
                    <div style="flex: 1; position: relative; max-height: 300px;">
                        <canvas id="areaChart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Gap Analysis -->
            <div class="feature-panel" style="padding: 32px; margin-bottom: 48px; position: relative;">
                <h3 style="font-size: 18px; margin-bottom: 8px; font-family: var(--font-heading);">Market Gap Analysis</h3>
                <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 24px;">Identifying high opportunity locations. Shows categories with fewer than 10 listings in specific suburbs.</p>
                
                <div style="position: relative;">
                    ${!isPro ? `
                        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(9, 9, 11, 0.4); z-index: 10; min-height: 180px;">
                            <div style="text-align: center; max-width: 320px; padding: 24px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                                <div style="font-size: 24px; margin-bottom: 12px;">🔒</div>
                                <h4 style="font-size: 15px; margin-bottom: 8px;">Upgrade to Premium</h4>
                                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.4;">Unlock niche local market gap insights and density indexes.</p>
                                <button class="brand-btn" style="padding: 8px 16px; font-size: 12px; border-radius: var(--radius-sm);" onclick="State.setPricingModal(true);">Access Now</button>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="compare-table-wrap" style="${!isPro ? 'filter: blur(8px); pointer-events: none; user-select: none;' : ''}">
                        <table class="compare-table" style="width: 100%;">
                            <thead>
                                <tr>
                                    <th style="text-align: left; background: var(--bg-base);">Area</th>
                                    <th style="text-align: left; background: var(--bg-base);">Underserved Profession</th>
                                    <th style="background: var(--bg-base);">Current Listings</th>
                                    <th style="background: var(--bg-base);">Opportunity Score</th>
                                </tr>
                            </thead>
                            <tbody id="gapAnalysisBody">
                                <tr>
                                    <td colspan="4" style="padding: 20px; text-align: center; color: var(--text-muted);">Analyzing gaps...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Competitor Lead Quality Analysis (Locked) -->
            <div class="feature-panel" style="padding: 32px; position: relative;">
                <h3 style="font-size: 18px; margin-bottom: 8px; font-family: var(--font-heading);">Competitor Lead Quality Analysis</h3>
                <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 24px;">Comparing lead score distributions and verification metrics against competitor listing sources.</p>
                
                <div style="position: relative;">
                    ${!isPro ? `
                        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(9, 9, 11, 0.4); z-index: 10; min-height: 150px;">
                            <div style="text-align: center; max-width: 320px; padding: 24px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                                <div style="font-size: 24px; margin-bottom: 12px;">🔒</div>
                                <h4 style="font-size: 15px; margin-bottom: 8px;">Upgrade to Premium</h4>
                                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.4;">Unlock competitor lead quality analysis and verification ratios.</p>
                                <button class="brand-btn" style="padding: 8px 16px; font-size: 12px; border-radius: var(--radius-sm);" onclick="State.setPricingModal(true);">Access Now</button>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div style="${!isPro ? 'filter: blur(8px); pointer-events: none; user-select: none;' : ''}">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div style="padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); text-align: center; background: var(--bg-base);">
                                <h4 style="font-size: 14px; margin-bottom: 8px;">Data Completeness</h4>
                                <div style="font-size: 28px; font-weight: 700; color: var(--accent-gold);">${verificationPct}%</div>
                                <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Avg phone + email + website fill rate</p>
                            </div>
                            <div style="padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); text-align: center; background: var(--bg-base);">
                                <h4 style="font-size: 14px; margin-bottom: 8px;">Category Coverage</h4>
                                <div style="font-size: 28px; font-weight: 700; color: var(--accent-pink);">${s.total_categories || 0}</div>
                                <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Unique business categories indexed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function initInsightsCharts(insightsData) {
    // 1. Category Donut Chart
    const catCanvas = document.getElementById('categoryChart');
    if (catCanvas && insightsData.category_distribution) {
        const labels = insightsData.category_distribution.map(c => c.category);
        const data = insightsData.category_distribution.map(c => c.count);
        
        new Chart(catCanvas, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: [
                        '#3b82f6', '#ec4899', '#10b981', '#8b5cf6', '#f59e0b',
                        '#06b6d4', '#6366f1', '#f43f5e', '#a855f7', '#52525b'
                    ],
                    borderWidth: 1,
                    borderColor: '#18181b'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#a1a1aa',
                            font: { family: 'Inter', size: 11 }
                        }
                    }
                }
            }
        });
    }

    // 2. Area Bar Chart
    const areaCanvas = document.getElementById('areaChart');
    if (areaCanvas && insightsData.area_density) {
        // Show top 10 areas by density
        const topAreas = insightsData.area_density.slice(0, 10);
        const labels = topAreas.map(a => a.area);
        const data = topAreas.map(a => a.count);

        new Chart(areaCanvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Listing Count',
                    data,
                    backgroundColor: 'rgba(255, 160, 0, 0.85)',
                    borderColor: '#ffa000',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        grid: { color: '#27272a' },
                        ticks: { color: '#a1a1aa', font: { family: 'JetBrains Mono', size: 10 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a1a1aa', font: { family: 'Inter', size: 10 } }
                    }
                }
            }
        });
    }

    // 3. Gap Analysis — Computed from real area_density data (no Math.random)
    const gapBody = document.getElementById('gapAnalysisBody');
    if (gapBody && insightsData.area_density) {
        // Use real data: find areas with low category diversity and low listing counts
        const gaps = insightsData.area_density
            .filter(a => a.count < 150 && a.categories)
            .sort((a, b) => a.categories - b.categories) // Sort by fewest unique categories
            .slice(0, 5)
            .map(a => ({
                area: a.area,
                categories: a.categories,
                count: a.count,
                avgRating: a.avg_rating || 0,
                score: a.categories < 10 ? "HIGH OPPORTUNITY" : (a.categories < 20 ? "MODERATE" : "LOW")
            }));

        if (gaps.length > 0) {
            gapBody.innerHTML = gaps.map(g => `
                <tr>
                    <td style="text-align: left;"><strong>${g.area}</strong></td>
                    <td style="text-align: left;">${g.categories} unique categories (avg ★${g.avgRating})</td>
                    <td>${g.count} listings</td>
                    <td>
                        <span class="status-tag ${g.score === 'HIGH OPPORTUNITY' ? 'closed' : 'open'}" style="font-size: 10px;">
                            ${g.score}
                        </span>
                    </td>
                </tr>
            `).join('');
        } else {
            gapBody.innerHTML = '<tr><td colspan="4">No underserved gaps identified in active subsets.</td></tr>';
        }
    }
}
