import { supabase } from './supabase.js';

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
    
    async getProfessionals(filters, offset = 0, limit = 24) {
        // Base Query
        let query = supabase.from('professionals').select('*', { count: 'exact' });
        
        // Apply Filters
        if (filters.parentCategory) {
            query = query.eq('parent_category', filters.parentCategory);
        }
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.area) {
            query = query.eq('area', filters.area);
        }
        if (filters.min_rating) {
            query = query.gte('rating', parseFloat(filters.min_rating));
        }
        if (filters.has_email) {
            query = query.not('email', 'is', null).neq('email', '');
        }
        if (filters.has_phone) {
            query = query.not('phone', 'is', null).neq('phone', '');
        }
        if (filters.has_website) {
            query = query.not('website', 'is', null).neq('website', '');
        }
        
        // Full text search
        if (filters.search && filters.search.trim()) {
            const s = filters.search.trim();
            query = query.or(`name.ilike.%${s}%,address.ilike.%${s}%,category.ilike.%${s}%`);
        }
        
        // Sort order
        if (filters.sort_by === 'rating_desc') {
            query = query.order('rating', { ascending: false }).order('review_count', { ascending: false });
        } else if (filters.sort_by === 'reviews_desc') {
            query = query.order('review_count', { ascending: false });
        } else if (filters.sort_by === 'scraped_desc') {
            query = query.order('scraped_at', { ascending: false });
        } else if (filters.sort_by === 'completeness_desc') {
            query = query.order('completeness_score', { ascending: false });
        }
        
        // Pagination Range
        query = query.range(offset, offset + limit - 1);
        
        const { data, error, count } = await query;
        if (error) throw error;
        
        // Client-side Open Now filtering (Mitigates TZ alignment issues)
        let items = data || [];
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
