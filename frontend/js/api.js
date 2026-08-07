import { supabase } from './supabase.js';
import { State } from './state.js';
import { calculateRelevanceScore, expandSearchTerms } from './searchEngine.js';

export function generateBrowserFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return "fallback_" + Math.random().toString(36).substring(7);
        
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("NearProFingerprint!", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("NearProFingerprint!", 4, 17);
        
        const data = canvas.toDataURL();
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            hash = (hash << 5) - hash + data.charCodeAt(i);
            hash |= 0;
        }
        
        const entropy = [
            navigator.userAgent.replace(/[^a-zA-Z0-9]/g, '').slice(0, 40),
            navigator.language,
            screen.width + "x" + screen.height,
            new Date().getTimezoneOffset()
        ].join('_');
        
        return Math.abs(hash).toString(16) + "_" + entropy;
    } catch (e) {
        return "fallback_" + Math.random().toString(36).substring(7);
    }
}

// Open now parsing helper (Vulnerability V6 Mitigation)
export function isOpenNow(hours) {
    if (!hours || typeof hours !== 'object' || Object.keys(hours).length === 0) {
        return null; // data unavailable
    }
    
    // Convert current time to India Standard Time (IST: UTC + 5:30)
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utc + (3600000 * 5.5));
    
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayDay = dayNames[istTime.getDay()]; // "Mon", "Tue", etc.
    const todayHours = hours[todayDay];
    
    if (!todayHours || todayHours.trim().toLowerCase() === 'closed') {
        return false;
    }
    
    // Handle "Open 24 hours"
    if (todayHours.toLowerCase().includes("24 hours") || todayHours.toLowerCase().includes("open 24")) {
        return true;
    }
    
    try {
        // Formats are usually like: "9:00 am – 6:00 pm" or "9:00 AM - 6:00 PM"
        const cleanHours = todayHours.replace(/[\u2013\u2014]/g, "-").replace(/\u202f/g, " "); // normalize dashes & spaces
        const parts = cleanHours.split("-");
        if (parts.length !== 2) return null;
        
        const parseTimeStr = (timeStr) => {
            const match = timeStr.trim().match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
            if (!match) return null;
            
            let hours = parseInt(match[1]);
            const minutes = match[2] ? parseInt(match[2]) : 0;
            const ampm = match[3].toUpperCase();
            
            if (ampm === "PM" && hours < 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;
            
            const timeDate = new Date(istTime);
            timeDate.setHours(hours, minutes, 0, 0);
            return timeDate;
        };
        
        const openTime = parseTimeStr(parts[0]);
        const closeTime = parseTimeStr(parts[1]);
        
        if (!openTime || !closeTime) return null;
        
        // Handle closing times that overflow past midnight (e.g. 9:00 PM - 2:00 AM)
        if (closeTime < openTime) {
            closeTime.setDate(closeTime.getDate() + 1);
            // If current time is early morning, shift it to match closing comparison
            if (istTime.getHours() < 6) {
                const shiftedTime = new Date(istTime);
                shiftedTime.setDate(shiftedTime.getDate() + 1);
                return istTime >= openTime || shiftedTime <= closeTime;
            }
        }
        
        return istTime >= openTime && istTime <= closeTime;
    } catch (e) {
        console.warn("Error parsing hours details: ", todayHours, e);
        return null;
    }
}

// Cache keys and TTLs for reducing Supabase load under traffic spikes
const STATS_CACHE_KEY = 'np_stats_cache';
const STATS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CATEGORIES_CACHE_KEY = 'np_categories_cache';
const CATEGORIES_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const INSIGHTS_CACHE_KEY = 'np_insights_cache';
const INSIGHTS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCached(key, ttl) {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const { data, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp < ttl) return data;
    } catch (e) { /* ignore parse errors */ }
    return null;
}

function setCache(key, data) {
    try {
        sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) { /* ignore quota errors */ }
}

export const Api = {
    supabase,
    async getStats() {
        const cached = getCached(STATS_CACHE_KEY, STATS_CACHE_TTL);
        if (cached) return cached;
        const { data, error } = await supabase.rpc('get_stats');
        if (error) throw error;
        if (data) setCache(STATS_CACHE_KEY, data);
        return data;
    },
    
    async getCategories() {
        const cached = getCached(CATEGORIES_CACHE_KEY, CATEGORIES_CACHE_TTL);
        if (cached) return cached;
        const { data, error } = await supabase.rpc('get_category_groups');
        if (error) throw error;
        const result = data || [];
        if (result.length > 0) setCache(CATEGORIES_CACHE_KEY, result);
        return result;
    },
    
    async getAreaInsights() {
        const cached = getCached(INSIGHTS_CACHE_KEY, INSIGHTS_CACHE_TTL);
        if (cached) return cached;
        const { data, error } = await supabase.rpc('get_area_insights');
        if (error) throw error;
        const result = data || { area_density: [], category_distribution: [] };
        if (result.area_density?.length > 0) setCache(INSIGHTS_CACHE_KEY, result);
        return result;
    },

    async joinCityWaitlist({ email, requested_city, user_role }) {
        const { data, error } = await supabase
            .from('city_waitlist')
            .insert([{ email, requested_city, user_role }])
            .select()
            .maybeSingle();
        if (error && error.code !== '23505') { // Ignore duplicate key errors silently
            throw error;
        }
        return data || { success: true };
    },

    async getCouponStatus(code = 'LAUNCH100') {
        try {
            // First check RPC if available
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_coupon_status', { p_code: code });
            if (!rpcError && rpcData) return rpcData;

            // Direct query to count live LAUNCH100 coupon code redemptions in Supabase
            const { count, error } = await supabase
                .from('profiles')
                .select('id', { count: 'exact', head: true })
                .or(`applied_coupon.eq.${code.toUpperCase()},applied_coupon.eq.${code.toLowerCase()}`);

            const redemptions = (count !== null && count !== undefined) ? count : 0;
            const maxRedemptions = 100;
            const remaining = Math.max(0, maxRedemptions - redemptions);

            return {
                valid: remaining > 0,
                remaining: remaining,
                max_redemptions: maxRedemptions,
                redemption_count: redemptions
            };
        } catch (e) {
            return { valid: true, remaining: 100, max_redemptions: 100, redemption_count: 0 };
        }
    },

    async applyCouponCode(code, userId) {
        const cleanCode = (code || 'LAUNCH100').toUpperCase();
        try {
            const { data, error } = await supabase.rpc('apply_coupon_code', { p_code: cleanCode, p_user_id: userId || 'anonymous' });
            if (!error && data && data.success !== undefined) {
                if (userId) {
                    await supabase.from('profiles').update({ tier: 'scout', subscription_tier: 'scout', applied_coupon: cleanCode }).eq('id', userId);
                }
                return data;
            }
        } catch (e) {
            console.warn("Supabase RPC apply_coupon_code fallback:", e);
        }

        // Ensure State.profile, State.user and localStorage are updated with Scout tier
        if (!State.profile) {
            State.profile = { subscription_tier: 'scout', tier: 'scout', applied_coupon: cleanCode };
        } else {
            State.profile.subscription_tier = 'scout';
            State.profile.tier = 'scout';
            State.profile.applied_coupon = cleanCode;
        }

        if (State.user) {
            State.user.tier = 'scout';
            State.user.subscription_tier = 'scout';
            localStorage.setItem('nearpro_user', JSON.stringify(State.user));
        }
        localStorage.setItem('nearpro_user_tier', 'scout');
        localStorage.setItem('claimed_coupon_LAUNCH100', 'true');

        if (userId) {
            try {
                await supabase.from('profiles').update({ tier: 'scout', subscription_tier: 'scout', applied_coupon: cleanCode }).eq('id', userId);
            } catch (err) {
                console.warn("Supabase profiles update fallback:", err);
            }
        }

        State.notify();

        return {
            success: true,
            message: 'Coupon LAUNCH100 applied successfully! Free Scout plan activated.',
            tier: 'scout'
        };
    },
    
    async getProfessional(id) {
        const { data, error } = await supabase.from('professionals').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    },
    
    async checkTrial(fingerprint) {
        const { data, error } = await supabase
            .from('anonymous_trials')
            .select('*')
            .eq('fingerprint', fingerprint)
            .maybeSingle();
        if (error) throw error;
        return data;
    },
    
    async startTrial(fingerprint) {
        const { data, error } = await supabase
            .from('anonymous_trials')
            .insert([{ fingerprint }])
            .select()
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    _latestSearchRequestId: 0,

    async getProfessionals(filters, offset = 0, limit = 24, fingerprint = '') {
        const requestId = ++this._latestSearchRequestId;

        // Dynamic query execution helper to support query retry loops
        const runQuery = async (f) => {
            // 1. Query the total count matching the filters securely (selecting only ID)
            let countQuery = supabase.from('professionals').select('id', { count: 'exact', head: true });
            
            if (f.parentCategory) countQuery = countQuery.eq('parent_category', f.parentCategory);
            if (f.category) countQuery = countQuery.eq('category', f.category);
            if (f.area) countQuery = countQuery.eq('area', f.area);
            
            // Rating range or minimum filtering
            if (f.rating_min !== undefined && f.rating_min !== null) {
                countQuery = countQuery.gte('rating', parseFloat(f.rating_min));
            } else if (f.min_rating) {
                countQuery = countQuery.gte('rating', parseFloat(f.min_rating));
            }
            if (f.rating_max !== undefined && f.rating_max !== null) {
                countQuery = countQuery.lte('rating', parseFloat(f.rating_max));
            }

            if (f.has_email) countQuery = countQuery.not('email', 'is', null).neq('email', '');
            if (f.has_phone) countQuery = countQuery.not('phone', 'is', null).neq('phone', '');
            
            if (f.has_website || f.website_filter === 'has_website') {
                countQuery = countQuery.not('website', 'is', null).neq('website', '');
            } else if (f.no_website || f.website_filter === 'no_website') {
                countQuery = countQuery.or('website.is.null,website.eq.');
            }
            if (f.search && f.search.trim()) {
                const s = f.search.trim();
                const expandedTerms = expandSearchTerms(s);
                const orConditions = expandedTerms.slice(0, 6).map(t => 
                    `name.ilike.%${t}%,address.ilike.%${t}%,category.ilike.%${t}%,parent_category.ilike.%${t}%,area.ilike.%${t}%`
                ).join(',');
                countQuery = countQuery.or(orConditions);
            }
            
            const { error: countErr, count } = await countQuery;
            if (countErr) throw countErr;

            // 2. Fetch the paginated and masked results via get_professionals_v2 RPC
            let items = [];
            let errorOccurred = false;
            
            try {
                const rpcParams = {
                    client_fingerprint: fingerprint || '',
                    parent_cat: f.parentCategory || null,
                    sub_cat: f.category || null,
                    filter_area: f.area || null,
                    min_rat: f.rating_min ? parseFloat(f.rating_min) : (f.min_rating ? parseFloat(f.min_rating) : null),
                    has_em: !!f.has_email,
                    has_ph: !!f.has_phone,
                    has_web: f.has_website || f.website_filter === 'has_website',
                    search_term: f.search && f.search.trim() ? f.search.trim() : null,
                    sort_col: f.sort_by || 'rating_desc',
                    offset_val: offset,
                    limit_val: limit
                };
                
                if (f.no_website || f.website_filter === 'no_website') {
                    rpcParams.has_no_web = true;
                }
                
                let { data, error } = await supabase.rpc('get_professionals_v2', rpcParams);
                
                if (error) {
                    if (error.code === '42883' && (f.no_website || f.website_filter === 'no_website')) {
                        delete rpcParams.has_no_web;
                        const retryResult = await supabase.rpc('get_professionals_v2', rpcParams);
                        if (retryResult.error) {
                            if (retryResult.error.code === '42883' || retryResult.error.message.includes('Could not find the function') || retryResult.error.message.includes('schema cache')) {
                                errorOccurred = true;
                            } else {
                                throw retryResult.error;
                            }
                        } else {
                            data = retryResult.data;
                        }
                    } else if (error.code === '42883' || error.message.includes('Could not find the function') || error.message.includes('schema cache')) {
                        errorOccurred = true;
                    } else {
                        throw error;
                    }
                }
                
                if (!errorOccurred) {
                    items = data || [];
                }
            } catch (e) {
                if (e.message && (e.message.includes('Could not find') || e.message.includes('schema cache'))) {
                    errorOccurred = true;
                } else {
                    throw e;
                }
            }
            
            if (errorOccurred) {
                let fallbackQuery = supabase.from('professionals').select('*');
                if (f.parentCategory) fallbackQuery = fallbackQuery.eq('parent_category', f.parentCategory);
                if (f.category) fallbackQuery = fallbackQuery.eq('category', f.category);
                if (f.area) fallbackQuery = fallbackQuery.eq('area', f.area);

                if (f.rating_min !== undefined && f.rating_min !== null) {
                    fallbackQuery = fallbackQuery.gte('rating', parseFloat(f.rating_min));
                } else if (f.min_rating) {
                    fallbackQuery = fallbackQuery.gte('rating', parseFloat(f.min_rating));
                }
                if (f.rating_max !== undefined && f.rating_max !== null) {
                    fallbackQuery = fallbackQuery.lte('rating', parseFloat(f.rating_max));
                }

                if (f.has_email) fallbackQuery = fallbackQuery.not('email', 'is', null).neq('email', '');
                if (f.has_phone) fallbackQuery = fallbackQuery.not('phone', 'is', null).neq('phone', '');
                
                if (f.has_website || f.website_filter === 'has_website') {
                    fallbackQuery = fallbackQuery.not('website', 'is', null).neq('website', '');
                } else if (f.no_website || f.website_filter === 'no_website') {
                    fallbackQuery = fallbackQuery.or('website.is.null,website.eq.');
                }
                
                if (f.search && f.search.trim()) {
                    const s = f.search.trim();
                    const expandedTerms = expandSearchTerms(s);
                    const orConditions = expandedTerms.slice(0, 6).map(t => 
                        `name.ilike.%${t}%,address.ilike.%${t}%,category.ilike.%${t}%,parent_category.ilike.%${t}%,area.ilike.%${t}%`
                    ).join(',');
                    fallbackQuery = fallbackQuery.or(orConditions);
                }
                
                if (f.sort_by === 'rating_desc') {
                    fallbackQuery = fallbackQuery.order('rating', { ascending: false }).order('review_count', { ascending: false });
                } else if (f.sort_by === 'reviews_desc') {
                    fallbackQuery = fallbackQuery.order('review_count', { ascending: false });
                } else if (f.sort_by === 'scraped_desc' || f.sort_by === 'indexed_desc') {
                    fallbackQuery = fallbackQuery.order('scraped_at', { ascending: false });
                } else if (f.sort_by === 'completeness_desc') {
                    fallbackQuery = fallbackQuery.order('completeness_score', { ascending: false });
                }
                
                fallbackQuery = fallbackQuery.range(offset, offset + limit - 1);
                const { data: fallbackData, error: fallbackErr } = await fallbackQuery;
                if (fallbackErr) throw fallbackErr;
                items = fallbackData || [];
            }

            if (f.open_now) {
                items = items.filter(p => isOpenNow(p.hours) === true);
            }

            // -------------------------------------------------------------
            // STRICT CLIENT-SIDE GUARANTEE POST-FILTERING
            // Guarantees zero filter leaks regardless of RPC/Supabase quirks
            // -------------------------------------------------------------
            if (items && items.length > 0) {
                if (f.rating_min !== undefined && f.rating_min !== null) {
                    const rMin = parseFloat(f.rating_min);
                    items = items.filter(p => p.rating !== null && p.rating !== undefined && parseFloat(p.rating) >= rMin);
                } else if (f.min_rating) {
                    const rMin = parseFloat(f.min_rating);
                    items = items.filter(p => p.rating !== null && p.rating !== undefined && parseFloat(p.rating) >= rMin);
                }

                if (f.rating_max !== undefined && f.rating_max !== null) {
                    const rMax = parseFloat(f.rating_max);
                    items = items.filter(p => p.rating !== null && p.rating !== undefined && parseFloat(p.rating) <= rMax);
                }

                if (f.has_website || f.website_filter === 'has_website') {
                    items = items.filter(p => p.website && typeof p.website === 'string' && p.website.trim() !== '' && p.website.trim().toLowerCase() !== 'n/a' && p.website.trim().toLowerCase() !== 'null');
                } else if (f.no_website || f.website_filter === 'no_website') {
                    items = items.filter(p => !p.website || typeof p.website !== 'string' || p.website.trim() === '' || p.website.trim().toLowerCase() === 'n/a' || p.website.trim().toLowerCase() === 'null');
                }

                if (f.has_phone) {
                    items = items.filter(p => p.phone && typeof p.phone === 'string' && p.phone.trim() !== '' && p.phone.trim().toLowerCase() !== 'n/a');
                }

                if (f.has_email) {
                    items = items.filter(p => p.email && typeof p.email === 'string' && p.email.trim() !== '' && p.email.trim().toLowerCase() !== 'n/a');
                }
            }

            return { items, count: count || items.length };
        };

        // 1. Initial query execution
        let activeFilters = { ...filters };
        let { items, count } = await runQuery(activeFilters);

        // 2. Sequential query relaxation loop (ONLY run if NO explicit user filters/search are set)
        const hasExplicitUserFilters = !!(
            activeFilters.rating_min || activeFilters.rating_max ||
            (activeFilters.min_rating && activeFilters.min_rating !== "4.0") ||
            activeFilters.has_email || activeFilters.has_phone ||
            activeFilters.has_website || activeFilters.no_website ||
            (activeFilters.website_filter && activeFilters.website_filter !== 'all') ||
            activeFilters.open_now || activeFilters.area || activeFilters.category || activeFilters.parentCategory ||
            (activeFilters.search && activeFilters.search.trim())
        );

        if (!hasExplicitUserFilters && items.length < 12) {
            console.log(`⚠️ Search returned only ${items.length} leads on default view. Relaxing default filters...`);
            if (activeFilters.open_now || activeFilters.min_rating) {
                activeFilters.open_now = false;
                activeFilters.min_rating = null;
                const retry = await runQuery(activeFilters);
                if (retry.items.length > items.length) {
                    items = retry.items;
                    count = retry.count;
                }
            }
        }

        // Deep weighted relevance ranking algorithm
        if (filters.search && filters.search.trim() && items.length > 0) {
            const searchTerm = filters.search.trim();
            items.sort((a, b) => calculateRelevanceScore(b, searchTerm) - calculateRelevanceScore(a, searchTerm));
        }

        if (requestId !== this._latestSearchRequestId) {
            console.log(`ℹ️ Discarding stale search response #${requestId} (latest is #${this._latestSearchRequestId})`);
            return { items: [], total: 0, offset, limit, has_more: false, stale: true };
        }

        return {
            items,
            total: count || items.length,
            offset,
            limit,
            has_more: (offset + limit) < (count || items.length)
        };
    },
    
    // Client-side CSV Exporter with tier-based limits
    exportToCSV(leads) {
        if (!leads || leads.length === 0) return;

        // Tier-based export enforcement
        const profile = State?.profile;
        const tier = (profile?.subscription_tier || profile?.tier || 'free').toLowerCase();

        const EXPORT_LIMITS = {
            free: 15,
            scout: 250,
            hunter: 1000,
            agency: 5000,
            enterprise: 999999
        };

        const limit = EXPORT_LIMITS[tier] || EXPORT_LIMITS.free;
        const used = profile?.monthly_export_rows_used || 0;

        if (tier !== 'enterprise') {
            if (used + leads.length > limit) {
                const remaining = Math.max(0, limit - used);
                if (remaining === 0) {
                    alert(`🚫 Monthly CSV export limit reached for ${tier.toUpperCase()} tier (${used}/${limit} rows). Please upgrade to export more leads.`);
                    State?.setPricingModal(true);
                    return;
                }
                alert(`⚠️ You only have ${remaining} row exports remaining this month. Exporting first ${remaining} leads.`);
                leads = leads.slice(0, remaining);
            }
        }
        
        const headers = ["Name", "Category", "Parent Category", "Address", "Area", "Phone", "Website", "Email", "Rating", "Reviews", "Completeness", "Latitude", "Longitude", "Indexed At"];
        const rows = leads.map(l => [
            l.name,
            l.category || "",
            l.parent_category || "",
            l.address || "",
            l.area || "",
            l.phone || "",
            l.website || "",
            l.email || "",
            l.rating || "",
            l.review_count || "",
            l.completeness_score || 0,
            l.latitude || "",
            l.longitude || "",
            l.indexed_at || l.scraped_at || ""
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `nearpro_leads_export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Update usage counter in profile (best-effort, non-blocking)
        if (profile && tier !== 'enterprise') {
            const newUsed = (profile.monthly_export_rows_used || 0) + leads.length;
            profile.monthly_export_rows_used = newUsed;
            supabase.from('profiles')
                .update({ monthly_export_rows_used: newUsed })
                .eq('id', profile.id)
                .then(() => {})
                .catch(err => console.error("Failed to update export usage:", err));
        }
    },

    async getProfile(userId) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (error) throw error;
        return data;
    },

    async updateOnboardingTask(userId, taskId, completed) {
        const profile = await this.getProfile(userId);
        let completedTasks = profile.onboarding_tasks_completed || [];
        if (completed) {
            if (!completedTasks.includes(taskId)) {
                completedTasks.push(taskId);
            }
        } else {
            completedTasks = completedTasks.filter(id => id !== taskId);
        }
        
        let updateData = { onboarding_tasks_completed: completedTasks };
        
        const allTasks = ['task_directory', 'task_save_lead', 'task_proposal', 'task_enrichment_keys', 'task_sequence', 'task_audit'];
        const completedAll = allTasks.every(t => completedTasks.includes(t));
        
        let creditsAwarded = false;
        if (completedAll && !profile.onboarding_credits_awarded) {
            updateData.onboarding_credits_awarded = true;
            updateData.enrichment_credits = (profile.enrichment_credits || 0) + 30;
            creditsAwarded = true;
        }
        
        const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();
            
        if (error) throw error;
        return { profile: updatedProfile, creditsAwarded };
    },

    async updateProfileTier(userId, tier) {
        const { data, error } = await supabase.from('profiles').update({ 
            tier: tier,
            subscription_tier: tier 
        }).eq('id', userId).select().single();
        if (error) throw error;
        return data;
    },

    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return data;
    },

    async signInWithZoho() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'custom:zoho',
            options: {
                scopes: 'openid email profile',
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return data;
    },

    async signInWithLinkedIn() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'linkedin_oidc',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return data;
    },

    async signInWithHubspot() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'custom:hubspot',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return data;
    },

    // --- v3 Dashboard & CRM API Methods ---

    async getDashboardStats(userId) {
        const { data, error } = await supabase.rpc('get_dashboard_stats', { p_user_id: userId });
        if (error) throw error;
        return data;
    },

    async getCRMPipeline(userId) {
        const { data, error } = await supabase.rpc('get_crm_pipeline', { p_user_id: userId });
        if (error) throw error;
        return data || [];
    },

    async getLeadLists() {
        const { data, error } = await supabase
            .from('lead_lists')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async getTeamMembers() {
        try {
            const { data, error } = await supabase
                .from('team_members')
                .select('*');
            if (error) {
                console.warn("team_members table query warning:", error);
                return [];
            }
            return data || [];
        } catch (e) {
            console.warn("getTeamMembers fallback:", e);
            return [];
        }
    },

    async inviteTeamMember(email, role) {
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;
        if (!userId) throw new Error("User session not found");

        const { data, error } = await supabase
            .from('team_members')
            .insert([{ 
                owner_id: userId,
                email: email,
                role: role,
                status: 'invited'
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async removeTeamMember(email) {
        const { data, error } = await supabase
            .from('team_members')
            .delete()
            .eq('email', email);
        if (error) throw error;
        return data;
    },

    async getDataRequests() {
        try {
            const { data, error } = await supabase
                .from('data_requests')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                console.warn("data_requests table query warning:", error);
                return [];
            }
            return data || [];
        } catch (e) {
            console.warn("getDataRequests fallback:", e);
            return [];
        }
    },

    async requestCustomData(niche, city, notes = '') {
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;
        if (!userId) throw new Error("User session not found");

        const { data, error } = await supabase
            .from('data_requests')
            .insert([{ 
                user_id: userId,
                requested_niche: niche,
                requested_city: city,
                notes: notes,
                status: 'pending'
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async createLeadList(name, description = '', color = '#ffa000') {
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;
        if (!userId) throw new Error("User session not found");

        const { data, error } = await supabase
            .from('lead_lists')
            .insert([{ 
                user_id: userId,
                name: name,
                description: description,
                color: color
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async saveLead(listId, professionalId) {
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;
        if (!userId) throw new Error("User session not found");

        const { data, error } = await supabase
            .from('saved_leads')
            .insert([{ 
                user_id: userId,
                list_id: listId || null,
                professional_id: professionalId,
                status: 'new'
            }])
            .select()
            .single();
        if (error) throw error;

        try {
            import('./components/ConnectionHub.js').then(m => {
                if (m && typeof m.triggerN8nWebhook === 'function') {
                    m.triggerN8nWebhook('lead_tracked', {
                        lead_id: professionalId,
                        list_id: listId,
                        status: 'new'
                    });
                }
            }).catch(e => console.warn("Webhook dispatch warning: ", e));
        } catch (e) {
            console.warn("Webhook dispatch failed: ", e);
        }

        return data;
    },

    async updateLeadStatus(savedLeadId, status) {
        const { data, error } = await supabase
            .from('saved_leads')
            .update({ status: status, updated_at: new Date().toISOString() })
            .eq('id', savedLeadId)
            .select()
            .single();
        if (error) throw error;

        try {
            import('./components/ConnectionHub.js').then(m => {
                if (m && typeof m.triggerN8nWebhook === 'function') {
                    m.triggerN8nWebhook('crm_status_changed', {
                        saved_lead_id: savedLeadId,
                        status: status
                    });
                }
            }).catch(e => console.warn("Webhook dispatch warning: ", e));
        } catch (e) {
            console.warn("Webhook dispatch failed: ", e);
        }

        // Auto sync to Zoho CRM via proxy Edge Function if auto sync is enabled
        if (State.profile?.zoho_auto_sync_enabled) {
            try {
                supabase.functions.invoke('zoho-proxy', {
                    body: {
                        action: 'push_lead',
                        saved_lead_id: savedLeadId,
                        status: status
                    }
                }).catch(e => console.warn("Zoho auto sync warning: ", e));
            } catch (e) {
                console.warn("Zoho auto sync failed: ", e);
            }
        }

        return data;
    },

    async updateLeadNotes(savedLeadId, notes) {
        const { data, error } = await supabase
            .from('saved_leads')
            .update({ notes: notes, updated_at: new Date().toISOString() })
            .eq('id', savedLeadId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateLeadFollowUp(savedLeadId, followUpDueAt) {
        const { data, error } = await supabase
            .from('saved_leads')
            .update({ follow_up_due_at: followUpDueAt, updated_at: new Date().toISOString() })
            .eq('id', savedLeadId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteSavedLead(savedLeadId) {
        const { error } = await supabase
            .from('saved_leads')
            .delete()
            .eq('id', savedLeadId);
        if (error) throw error;
        return true;
    },

    async getSavedLeads(listId) {
        let query = supabase
            .from('saved_leads')
            .select('*, professionals(*)');
        
        if (listId) {
            query = query.eq('list_id', listId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async checkoutSubscription(planId, interval = 'monthly', couponCode = '') {
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;
        if (!userId) throw new Error("User session not found");

        const offerId = (couponCode.toUpperCase() === 'LAUNCH100' || planId === 'scout') ? 'offer_TIh4tH1szwNNKb' : null;

        let data = null;
        try {
            const res = await supabase.functions.invoke('create-razorpay-subscription', {
                body: { plan_id: planId, interval: interval, offer_id: offerId }
            });
            if (res.error) throw res.error;
            data = res.data;
        } catch (funcErr) {
            console.warn("Edge function create-razorpay-subscription unavailable or errored. Falling back to test checkout mode:", funcErr);
            data = { mock: true };
        }

        if (!data || data.mock) {
            // Direct Razorpay Live Mode fallback using production Key ID
            data = {
                key_id: "rzp_live_TEzu9yAFgXuxzh",
                name: `NearPro ${planId.toUpperCase()} Plan`,
                description: `1-${interval === 'yearly' ? 'Year' : 'Month'} Subscription to NearPro Workspace`,
                amount: (planId === 'scout' ? (interval === 'yearly' ? 499900 : 49900) : (planId === 'hunter' ? (interval === 'yearly' ? 999900 : 99900) : (interval === 'yearly' ? 2499900 : 249900))),
                prefill: {
                    email: State.user?.email || "",
                    name: State.profile?.full_name || ""
                }
            };
        }

        if (!window.Razorpay) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        }

        return new Promise((resolve, reject) => {
            const options = {
                key: data.key_id,
                subscription_id: data.subscription_id,
                name: data.name,
                description: data.description,
                handler: async function (response) {
                    try {
                        const updated = await supabase.from('profiles').update({
                            tier: planId,
                            subscription_tier: planId,
                            subscription_status: 'active',
                            razorpay_subscription_id: data.subscription_id
                        }).eq('id', userId).select().single();
                        
                        if (updated.error) throw updated.error;

                        const upgradeData = {
                            tier: planId,
                            netPaid: data.amount ? Math.round(data.amount / 100) : (planId === 'scout' ? '499' : (planId === 'hunter' ? '999' : '2,499')),
                            paymentId: response.razorpay_payment_id || `pay_${Math.random().toString(36).slice(2, 8)}`
                        };

                        // Trigger invoice email send asynchronously
                        Api.sendInvoiceEmail(upgradeData);

                        const { showPreparationLoader } = await import('./components/PreparationLoader.js');
                        showPreparationLoader(upgradeData, () => {
                            State.profile = updated.data;
                            State.notify();
                            resolve(true);
                        });
                    } catch (err) {
                        reject(err);
                    }
                },
                prefill: data.prefill,
                theme: {
                    color: "#ffa000"
                }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        });
    },

    async cancelSubscription() {
        let userId = null;
        try {
            const { data: userSession } = await supabase.auth.getSession();
            userId = userSession?.session?.user?.id || (State.user && State.user.id) || null;
        } catch (e) {
            console.warn("Could not retrieve session for cancellation:", e);
        }

        if (userId) {
            try {
                await supabase.functions.invoke('cancel-razorpay-subscription');
            } catch (funcErr) {
                console.warn("Edge function cancel-razorpay-subscription fallback:", funcErr);
            }

            try {
                await supabase
                    .from('profiles')
                    .update({
                        tier: 'free',
                        subscription_tier: 'free',
                        subscription_status: 'cancelled',
                        razorpay_subscription_id: null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);
            } catch (updateErr) {
                console.warn("Supabase profiles cancellation update error:", updateErr);
            }
        }

        // Always update local application state & localStorage to free/Explorer plan
        if (!State.profile) {
            State.profile = { subscription_tier: 'free', tier: 'free', subscription_status: 'cancelled' };
        } else {
            State.profile.subscription_tier = 'free';
            State.profile.tier = 'free';
            State.profile.subscription_status = 'cancelled';
        }

        if (State.user) {
            State.user.tier = 'free';
            State.user.subscription_tier = 'free';
            localStorage.setItem('nearpro_user', JSON.stringify(State.user));
        }

        localStorage.setItem('nearpro_user_tier', 'free');
        localStorage.removeItem('claimed_coupon_LAUNCH100');

        State.notify();

        return { success: true, message: "Subscription cancelled successfully." };
    },

    async sendInvoiceEmail(upgradeData) {
        try {
            const { State } = window;
            const email = State.user?.email;
            if (!email) return;

            const name = State.profile?.full_name || email.split('@')[0];
            const company = State.profile?.company_name || '';

            await supabase.functions.invoke('send-invoice-email', {
                body: {
                    user_email: email,
                    user_name: name,
                    plan_id: upgradeData.tier,
                    net_paid: upgradeData.netPaid,
                    payment_id: upgradeData.paymentId,
                    company_name: company
                }
            });
        } catch (e) {
            console.warn("Invoice email dispatch skipped:", e);
        }
    },

    async submitOptOutRequest(ticketId, businessName, phone, email, category) {
        try {
            const { data, error } = await supabase.from('opt_out_requests').insert({
                ticket_id: ticketId,
                business_name: businessName,
                phone: phone,
                email: email,
                request_category: category,
                status: 'pending'
            }).select().single();

            if (error) {
                console.warn("Supabase opt_out_requests insert fallback (saving locally):", error);
            }
            return data;
        } catch (e) {
            console.warn("Error submitting opt-out request:", e);
            return null;
        }
    },

    async generateAIOutreach(professionalId, channel, language, tone, regenerateDay = null, existingDay1 = null, existingDay3 = null, existingDay7 = null) {
        try {
            const { data, error } = await supabase.functions.invoke('generate-ai-outreach', {
                body: { 
                    professional_id: professionalId, 
                    channel: channel, 
                    language: language, 
                    tone: tone,
                    regenerate_day: regenerateDay,
                    existing_day1: existingDay1,
                    existing_day3: existingDay3,
                    existing_day7: existingDay7
                }
            });
            if (!error && data && data.day1) {
                return data;
            }
        } catch (e) {
            console.warn("Edge function invocation warning, falling back to local AI outreach generator:", e);
        }

        // Robust client-side AI Pitch Generator Engine fallback
        let lead = null;
        try {
            const { data: prof } = await supabase
                .from('professionals')
                .select('*')
                .eq('id', professionalId)
                .single();
            lead = prof;
        } catch (err) {
            console.warn("Could not fetch lead details for local AI pitch:", err);
        }

        // Fetch current profile stats and increment AI usage limit
        let currentUsed = State.profile?.monthly_ai_generations_used || 0;
        let updatedUsed = currentUsed + 1;
        try {
            if (State.user?.id) {
                await supabase
                    .from('profiles')
                    .update({ monthly_ai_generations_used: updatedUsed })
                    .eq('id', State.user.id);
            }
        } catch (updateErr) {
            console.warn("Could not update local AI outreach generation count:", updateErr);
        }

        const sequence = this.buildLocalAISequence(lead, channel, language, tone, regenerateDay, existingDay1, existingDay3, existingDay7);
        sequence.used = updatedUsed;
        return sequence;
    },

    buildLocalAISequence(lead, channel, language, tone, regenerateDay = null, existingDay1 = null, existingDay3 = null, existingDay7 = null) {
        const name = lead?.name || 'your business';
        const area = lead?.area || 'Mumbai';
        const rating = lead?.rating ? `${lead.rating}★` : '4.8★';
        const reviews = lead?.review_count || 50;
        const hasWebsite = lead?.website && lead.website.trim() !== '';
        const isHinglish = language === 'hinglish';
        const isWhatsApp = channel === 'whatsapp';

        let hook_type = 'STANDARD';
        if (lead?.rating && lead.rating >= 4.0 && !hasWebsite) hook_type = 'HIGH_RATING_NO_WEB';
        else if (!hasWebsite) hook_type = 'ZERO_DIGITAL';
        else if (reviews > 80) hook_type = 'HIGH_RATING_LOW_REVIEWS';

        let d1_msg = isHinglish ? (isWhatsApp 
            ? `Namaste ${name} team! 🙏 Noticed your clinic in ${area} has a stellar ${rating} rating with ${reviews}+ reviews, but missing an official website link.\n\nYou are losing 20+ direct client calls every week to competitors. We built a custom mobile audit report showing how to fix this: nearpro.s8n.in\n\nWould you be open to a 2-minute quick look?`
            : `Hi ${name} team,\n\nI was reviewing top rated businesses in ${area} and came across your listing. You have a stellar ${rating} rating with over ${reviews} customer reviews, which is fantastic.\n\nHowever, I noticed your profile lacks a direct mobile website link. In ${area}, this means approximately 25-30 potential clients per week end up calling competitors instead.\n\nWe put together a complimentary 3-page digital audit proposal for ${name}. Would you be open to reviewing it?\n\nBest regards,\nAgency Director`
        ) : (isWhatsApp
            ? `Hi ${name} team! Noticed your business in ${area} holds a fantastic ${rating} rating with ${reviews}+ reviews, but lacks an active website link.\n\nPotential clients searching in ${area} are calling competitor listings instead. We generated a free 30-sec audit report for you: nearpro.s8n.in\n\nWould you like me to send over the PDF breakdown?`
            : `Dear ${name} Management,\n\nWhile analyzing top-performing local businesses in ${area}, I came across your profile. Your ${rating} rating across ${reviews}+ customer reviews clearly reflects great service quality.\n\nHowever, your listing does not currently link to a dedicated website. In competitive areas like ${area}, an missing website leads to lost client inquiries every single day.\n\nWe have prepared a customized digital audit and growth proposal for ${name}. Would you be open to reviewing the analysis?\n\nSincerely,\nB2B Growth Specialist`
        );

        let d3_msg = isHinglish ? (isWhatsApp
            ? `Hi ${name} team, following up on my previous note! Did you get a chance to review the ${area} market audit report?\n\nHappy to share a quick 1-page design mockup tailored for ${name} with zero obligation. Let me know if tomorrow works!`
            : `Hi ${name} team,\n\nQuick follow up regarding the digital presence audit for ${name} in ${area}.\n\nWe recently helped a similar business in your niche increase direct patient inquiries by 40% within 14 days by fixing their mobile landing page.\n\nWould you have 5 minutes this Thursday for a brief chat?\n\nBest regards,\nAgency Director`
        ) : (isWhatsApp
            ? `Hi ${name} team, following up on my message earlier this week! Have you had a chance to check the digital visibility report for ${area}?\n\nWe can set up a high-converting mobile page for ${name} in under 48 hours. Let me know if you're interested!`
            : `Dear ${name} Management,\n\nFollowing up on my previous email regarding the digital audit for ${name}.\n\nWe specialize in building lightweight, fast-loading mobile experiences for local businesses in ${area} that convert search traffic into direct calls.\n\nAre you available for a brief 5-minute call later this week?\n\nSincerely,\nB2B Growth Specialist`
        );

        let d7_msg = isHinglish ? (isWhatsApp
            ? `Hi team at ${name}, final check from my end! I know you are busy managing operations in ${area}.\n\nIf you ever want to capture more direct bookings from Google search, feel free to reply here. Wishing you continued success!`
            : `Hi ${name} team,\n\nI understand you are busy running daily operations in ${area}. I won't crowd your inbox further.\n\nIf improving your online client bookings ever becomes a priority for ${name}, you can access your audit report anytime here: nearpro.s8n.in\n\nWishing your team all the best!\n\nBest regards,\nAgency Director`
        ) : (isWhatsApp
            ? `Hi ${name} team, last follow up from my side. If you ever decide to optimize your online presence and capture more leads in ${area}, feel free to reach out anytime!\n\nBest of luck with your growth!`
            : `Dear ${name} Management,\n\nI realize you are focused on serving your clients in ${area}, so I will make this my final note.\n\nIf you would like to explore capturing more direct inquiries for ${name} in the future, you can view your digital report anytime. Thank you for your time!\n\nSincerely,\nB2B Growth Specialist`
        );

        const sequence = {
            hook_type: hook_type,
            day1: {
                subject_a: `Website optimization for ${name}`,
                subject_b: `Quick question about ${name} in ${area}`,
                subject_c: `Local maps rating gap for ${name}`,
                subject: `Website optimization for ${name}`,
                message: existingDay1 || d1_msg
            },
            day3: {
                subject: `Re: Website optimization for ${name}`,
                message: existingDay3 || d3_msg
            },
            day7: {
                subject: `Re: Website optimization for ${name}`,
                message: existingDay7 || d7_msg
            },
            used: 1
        };

        if (regenerateDay && sequence[regenerateDay]) {
            if (regenerateDay === 'day1') sequence.day1.message = d1_msg;
            if (regenerateDay === 'day3') sequence.day3.message = d3_msg;
            if (regenerateDay === 'day7') sequence.day7.message = d7_msg;
        }

        return sequence;
    },

    async generateWebsitePrompt(professionalId, platform) {
        const { data, error } = await supabase.functions.invoke('generate-website-prompt', {
            body: { 
                professional_id: professionalId, 
                platform: platform
            }
        });
        if (error) {
            let detail = error.message || 'Edge Function error';
            if (error.context && typeof error.context === 'object' && typeof error.context.text === 'function') {
                try {
                    const text = await error.context.text();
                    try {
                        const parsed = JSON.parse(text);
                        detail = parsed.error || parsed.message || text;
                    } catch (_) {
                        detail = text;
                    }
                } catch (_) {}
            }
            throw new Error(detail);
        }
        return data;
    },

    async getDocuments(userId) {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async uploadDocument(file, name) {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        if (!userId) throw new Error("User session not found");

        const fileExt = file.name.split('.').pop();
        const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Date.now() + '.' + fileExt;
        const filePath = `${userId}/${cleanName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);
        
        const fileUrl = urlData.publicUrl;

        // Generate a random 6-character alphanumeric slug
        const shortSlug = Math.random().toString(36).substring(2, 8);

        const { data, error } = await supabase
            .from('documents')
            .insert([{
                user_id: userId,
                name: name || file.name,
                file_path: filePath,
                file_url: fileUrl,
                file_size: file.size,
                slug: shortSlug
            }])
            .select()
            .single();
        if (error) {
            await supabase.storage.from('documents').remove([filePath]);
            throw error;
        }

        return data;
    },

    async deleteDocument(documentId, filePath) {
        const { error: dbError } = await supabase
            .from('documents')
            .delete()
            .eq('id', documentId);
        if (dbError) throw dbError;

        if (filePath) {
            await supabase.storage.from('documents').remove([filePath]);
        }
        return true;
    },

    async generatePDFProposal(professionalId, customNotes = '') {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("User authentication required");

        const { data, error } = await supabase.functions.invoke('generate-pdf-proposal', {
            body: {
                professional_id: professionalId,
                custom_notes: customNotes
            }
        });

        if (error) {
            let errMsg = error.message;
            if (error.context && typeof error.context.text === 'function') {
                try {
                    const txt = await error.context.text();
                    const parsed = JSON.parse(txt);
                    if (parsed.error) errMsg = parsed.error;
                } catch (_) {}
            }
            throw new Error(errMsg);
        }

        return data;
    },

    async generateCallScript(professionalId, callAngle = 'REPUTATION_AND_REVENUE') {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("User authentication required");

        const { data, error } = await supabase.functions.invoke('generate-call-script', {
            body: {
                professional_id: professionalId,
                call_angle: callAngle
            }
        });

        if (error) {
            let errMsg = error.message;
            if (error.context && typeof error.context.text === 'function') {
                try {
                    const txt = await error.context.text();
                    const parsed = JSON.parse(txt);
                    if (parsed.error) errMsg = parsed.error;
                } catch (_) {}
            }
            throw new Error(errMsg);
        }

        return data;
    },

    // --- Missing Production API Methods (Audit Fix) ---

    /**
     * Generic profile field updater.
     * Used by Connection Hub to save integration tokens/URLs.
     */
    async updateProfile(fields) {
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;
        if (!userId) throw new Error("User session not found");

        const { data, error } = await supabase
            .from('profiles')
            .update({ ...fields, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;

        // Sync local state
        if (State.profile) {
            Object.assign(State.profile, data);
        }
        return data;
    },

    /**
     * Invite a team member to the workspace.
     * Persists to team_members table in Supabase.
     */
    async inviteTeamMember(email, role = 'sales') {
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;
        if (!userId) throw new Error("User session not found");

        const { data, error } = await supabase
            .from('team_members')
            .insert([{
                workspace_owner_id: userId,
                email: email,
                role: role,
                status: 'invited'
            }])
            .select()
            .single();

        if (error) {
            // Handle duplicate invitation gracefully
            if (error.code === '23505') {
                throw new Error(`${email} has already been invited to your workspace.`);
            }
            throw error;
        }
        return data;
    },

    /**
     * Remove a team member from the workspace.
     */
    async removeTeamMember(email) {
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;
        if (!userId) throw new Error("User session not found");

        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('workspace_owner_id', userId)
            .eq('email', email);
        if (error) throw error;
        return true;
    },

    /**
     * Fetch all team members for the current workspace owner.
     */
    async getTeamMembers() {
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;
        if (!userId) throw new Error("User session not found");

        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('workspace_owner_id', userId)
            .order('invited_at', { ascending: false });

        if (error) {
            // Table may not exist yet if migration hasn't been run
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
                console.warn("team_members table not found. Run v3_team_members_migration.sql.");
                return [];
            }
            throw error;
        }
        return data || [];
    },

    /**
     * Submit a custom niche data extraction request.
     * Persists to data_requests table in Supabase.
     */
    async requestCustomData(niche, city, notes = '') {
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;
        if (!userId) throw new Error("User session not found");

        const { data, error } = await supabase
            .from('data_requests')
            .insert([{
                user_id: userId,
                request_type: 'niche',
                requested_niche: niche,
                requested_city: city,
                notes: notes,
                status: 'pending'
            }])
            .select()
            .single();
        if (error) {
            // Table may not exist yet
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
                console.warn("data_requests table not found. Run v3_complete_migration.sql.");
                throw new Error("Data requests feature is not yet configured. Please contact support.");
            }
            throw error;
        }
        return data;
    },

    /**
     * Fetch all data extraction requests for the current user.
     */
    async getDataRequests() {
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;
        if (!userId) throw new Error("User session not found");

        const { data, error } = await supabase
            .from('data_requests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
                console.warn("data_requests table not found. Run v3_complete_migration.sql.");
                return [];
            }
            throw error;
        }
        return data || [];
    }
};
