import { supabase } from './supabase.js';

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

export const Api = {
    async getStats() {
        const { data, error } = await supabase.rpc('get_stats');
        if (error) throw error;
        return data;
    },
    
    async getCategories() {
        const { data, error } = await supabase.rpc('get_category_groups');
        if (error) throw error;
        return data || [];
    },
    
    async getAreaInsights() {
        const { data, error } = await supabase.rpc('get_area_insights');
        if (error) throw error;
        return data || { area_density: [], category_distribution: [] };
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

    async getProfessionals(filters, offset = 0, limit = 24, fingerprint = '') {
        // 1. Query the total count matching the filters securely (selecting only ID)
        let countQuery = supabase.from('professionals').select('id', { count: 'exact', head: true });
        
        if (filters.parentCategory) {
            countQuery = countQuery.eq('parent_category', filters.parentCategory);
        }
        if (filters.category) {
            countQuery = countQuery.eq('category', filters.category);
        }
        if (filters.area) {
            countQuery = countQuery.eq('area', filters.area);
        }
        if (filters.min_rating) {
            countQuery = countQuery.gte('rating', parseFloat(filters.min_rating));
        }
        if (filters.has_email) {
            countQuery = countQuery.not('email', 'is', null).neq('email', '');
        }
        if (filters.has_phone) {
            countQuery = countQuery.not('phone', 'is', null).neq('phone', '');
        }
        if (filters.has_website) {
            countQuery = countQuery.not('website', 'is', null).neq('website', '');
        }
        if (filters.search && filters.search.trim()) {
            const s = filters.search.trim();
            countQuery = countQuery.or(`name.ilike.%${s}%,address.ilike.%${s}%,category.ilike.%${s}%`);
        }
        
        const { error: countErr, count } = await countQuery;
        if (countErr) throw countErr;

        // 2. Fetch the paginated and masked results via get_professionals_v2 RPC
        let items = [];
        let errorOccurred = false;
        let clientSideFilterNoWeb = false;
        
        try {
            const rpcParams = {
                client_fingerprint: fingerprint || '',
                parent_cat: filters.parentCategory || null,
                sub_cat: filters.category || null,
                filter_area: filters.area || null,
                min_rat: filters.min_rating ? parseFloat(filters.min_rating) : null,
                has_em: !!filters.has_email,
                has_ph: !!filters.has_phone,
                has_web: filters.website_filter === 'has_website',
                search_term: filters.search && filters.search.trim() ? filters.search.trim() : null,
                sort_col: filters.sort_by || 'rating_desc',
                offset_val: offset,
                limit_val: limit
            };
            
            if (filters.website_filter === 'no_website') {
                rpcParams.has_no_web = true;
            }
            
            let { data, error } = await supabase.rpc('get_professionals_v2', rpcParams);
            
            if (error) {
                if (error.code === '42883' && filters.website_filter === 'no_website') {
                    console.warn("⚠️ get_professionals_v2 signature mismatch for has_no_web. Retrying without has_no_web and filtering client-side.");
                    clientSideFilterNoWeb = true;
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
                if (clientSideFilterNoWeb) {
                    items = items.filter(p => !p.website || p.website === '');
                }
            }
        } catch (e) {
            if (e.message && (e.message.includes('Could not find') || e.message.includes('schema cache'))) {
                errorOccurred = true;
            } else {
                throw e;
            }
        }
        
        if (errorOccurred) {
            console.warn("⚠️ get_professionals_v2 RPC function not found in Supabase. Falling back to direct public table query. Please run the Supabase database migration script!");
            
            let fallbackQuery = supabase.from('professionals').select('*');
            if (filters.parentCategory) fallbackQuery = fallbackQuery.eq('parent_category', filters.parentCategory);
            if (filters.category) fallbackQuery = fallbackQuery.eq('category', filters.category);
            if (filters.area) fallbackQuery = fallbackQuery.eq('area', filters.area);
            if (filters.min_rating) fallbackQuery = fallbackQuery.gte('rating', parseFloat(filters.min_rating));
            if (filters.has_email) fallbackQuery = fallbackQuery.not('email', 'is', null).neq('email', '');
            if (filters.has_phone) fallbackQuery = fallbackQuery.not('phone', 'is', null).neq('phone', '');
            
            if (filters.website_filter === 'has_website') {
                fallbackQuery = fallbackQuery.not('website', 'is', null).neq('website', '');
            } else if (filters.website_filter === 'no_website') {
                fallbackQuery = fallbackQuery.or('website.is.null,website.eq.');
            }
            
            if (filters.search && filters.search.trim()) {
                const s = filters.search.trim();
                fallbackQuery = fallbackQuery.or(`name.ilike.%${s}%,address.ilike.%${s}%,category.ilike.%${s}%`);
            }
            
            if (filters.sort_by === 'rating_desc') {
                fallbackQuery = fallbackQuery.order('rating', { ascending: false }).order('review_count', { ascending: false });
            } else if (filters.sort_by === 'reviews_desc') {
                fallbackQuery = fallbackQuery.order('review_count', { ascending: false });
            } else if (filters.sort_by === 'scraped_desc') {
                fallbackQuery = fallbackQuery.order('scraped_at', { ascending: false });
            } else if (filters.sort_by === 'completeness_desc') {
                fallbackQuery = fallbackQuery.order('completeness_score', { ascending: false });
            }
            
            fallbackQuery = fallbackQuery.range(offset, offset + limit - 1);
            const { data: fallbackData, error: fallbackErr } = await fallbackQuery;
            if (fallbackErr) throw fallbackErr;
            items = fallbackData || [];
        }

        if (filters.open_now) {
            items = items.filter(p => isOpenNow(p.hours) === true);
        }

        return {
            items,
            total: count || 0,
            offset,
            limit,
            has_more: (offset + limit) < (count || 0)
        };
    },
    
    // Client-side CSV Exporter (Zero server dependencies)
    exportToCSV(leads) {
        if (!leads || leads.length === 0) return;
        
        const headers = ["Name", "Category", "Parent Category", "Address", "Area", "Phone", "Website", "Email", "Rating", "Reviews", "Completeness", "Latitude", "Longitude", "Scraped At"];
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
            l.scraped_at || ""
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
    },

    async getProfile(userId) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (error) throw error;
        return data;
    },

    async updateProfileTier(userId, tier) {
        const { data, error } = await supabase.from('profiles').update({ tier: tier }).eq('id', userId).select().single();
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
    }
};
