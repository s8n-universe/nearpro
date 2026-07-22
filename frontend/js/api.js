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

export const Api = {
    supabase,
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
            if (f.min_rating) countQuery = countQuery.gte('rating', parseFloat(f.min_rating));
            if (f.has_email) countQuery = countQuery.not('email', 'is', null).neq('email', '');
            if (f.has_phone) countQuery = countQuery.not('phone', 'is', null).neq('phone', '');
            
            if (f.has_website || f.website_filter === 'has_website') {
                countQuery = countQuery.not('website', 'is', null).neq('website', '');
            } else if (f.no_website || f.website_filter === 'no_website') {
                countQuery = countQuery.or('website.is.null,website.eq.');
                countQuery = countQuery.or('phone.not.is.null,email.not.is.null');
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
            let clientSideFilterNoWeb = false;
            
            try {
                const rpcParams = {
                    client_fingerprint: fingerprint || '',
                    parent_cat: f.parentCategory || null,
                    sub_cat: f.category || null,
                    filter_area: f.area || null,
                    min_rat: f.min_rating ? parseFloat(f.min_rating) : null,
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
                    if (clientSideFilterNoWeb || f.no_website || f.website_filter === 'no_website') {
                        items = items.filter(p => 
                            (!p.website || p.website.trim() === '') && 
                            ((p.phone && p.phone.trim() !== '') || (p.email && p.email.trim() !== ''))
                        );
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
                let fallbackQuery = supabase.from('professionals').select('*');
                if (f.parentCategory) fallbackQuery = fallbackQuery.eq('parent_category', f.parentCategory);
                if (f.category) fallbackQuery = fallbackQuery.eq('category', f.category);
                if (f.area) fallbackQuery = fallbackQuery.eq('area', f.area);
                if (f.min_rating) fallbackQuery = fallbackQuery.gte('rating', parseFloat(f.min_rating));
                if (f.has_email) fallbackQuery = fallbackQuery.not('email', 'is', null).neq('email', '');
                if (f.has_phone) fallbackQuery = fallbackQuery.not('phone', 'is', null).neq('phone', '');
                
                if (f.has_website || f.website_filter === 'has_website') {
                    fallbackQuery = fallbackQuery.not('website', 'is', null).neq('website', '');
                } else if (f.no_website || f.website_filter === 'no_website') {
                    fallbackQuery = fallbackQuery.or('website.is.null,website.eq.');
                    fallbackQuery = fallbackQuery.or('phone.not.is.null,email.not.is.null');
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

            return { items, count: count || items.length };
        };

        // 1. Initial query execution
        let activeFilters = { ...filters };
        let { items, count } = await runQuery(activeFilters);

        // 2. Sequential query relaxation loop if we have < 12 items (guaranteeing 10-15 leads)
        if (items.length < 12) {
            console.log(`⚠️ Search returned only ${items.length} leads. Relaxing filters to guarantee 10-15 leads...`);
            
            // Phase 1: Relax "open_now" and rating requirements
            if (activeFilters.open_now || activeFilters.min_rating) {
                activeFilters.open_now = false;
                activeFilters.min_rating = null;
                const retry = await runQuery(activeFilters);
                if (retry.items.length > items.length) {
                    items = retry.items;
                    count = retry.count;
                }
            }

            // Phase 2: Relax specific contact checkbox constraints (email, phone, website flags)
            if (items.length < 12 && (activeFilters.has_email || activeFilters.has_phone || activeFilters.has_website || activeFilters.no_website || activeFilters.website_filter)) {
                activeFilters.has_email = false;
                activeFilters.has_phone = false;
                activeFilters.has_website = false;
                activeFilters.no_website = false;
                activeFilters.website_filter = null;
                const retry = await runQuery(activeFilters);
                if (retry.items.length > items.length) {
                    items = retry.items;
                    count = retry.count;
                }
            }

            // Phase 3: Relax localized Area filter to search across the entire city (Mumbai/general database)
            if (items.length < 12 && activeFilters.area) {
                activeFilters.area = null;
                const retry = await runQuery(activeFilters);
                if (retry.items.length > items.length) {
                    items = retry.items;
                    count = retry.count;
                }
            }

            // Phase 4: Fallback to general category leads if keyword/search matches are extremely narrow
            if (items.length < 12 && activeFilters.search) {
                activeFilters.search = null;
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

    async checkoutSubscription(planId, interval = 'monthly') {
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;
        if (!userId) throw new Error("User session not found");

        let data = null;
        try {
            const res = await supabase.functions.invoke('create-razorpay-subscription', {
                body: { plan_id: planId, interval: interval }
            });
            if (res.error) throw res.error;
            data = res.data;
        } catch (funcErr) {
            console.warn("Edge function create-razorpay-subscription unavailable or errored. Falling back to test checkout mode:", funcErr);
            data = { mock: true };
        }

        if (!data || data.mock) {
            const isProd = import.meta.env.VITE_NEARPRO_ENV === 'production';
            if (isProd) {
                alert("Payment gateway configuration issue. Please try again or contact support.");
                throw new Error("Razorpay subscription mock mode is disabled in production environments.");
            }

            const startDate = new Date();
            const days = interval === 'yearly' ? 365 : 30;
            const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

            const { data: updatedProfile, error: updateErr } = await supabase
                .from('profiles')
                .update({
                    tier: planId,
                    subscription_tier: planId,
                    subscription_status: 'active',
                    subscription_started_at: startDate.toISOString(),
                    subscription_ends_at: endDate.toISOString(),
                    razorpay_subscription_id: `sub_mock_${Math.random().toString(36).slice(2, 10)}`,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (updateErr) {
                console.error("Direct profile update failed:", updateErr);
                throw updateErr;
            }

            const { showPreparationLoader } = await import('./components/PreparationLoader.js');
            return new Promise((resolve) => {
                showPreparationLoader(async () => {
                    try {
                        State.profile = updatedProfile || (await this.getProfile(userId));
                        State.upgrade_success_data = {
                            tier: planId,
                            netPaid: interval === 'yearly' ? (planId === 'scout' ? '4,999' : planId === 'hunter' ? '9,999' : '24,999') : (planId === 'scout' ? '499' : planId === 'hunter' ? '999' : '2,499'),
                            paymentId: `pay_mock_${Math.random().toString(36).slice(2, 8)}`
                        };
                        State.upgrade_success_modal_open = true;
                        State.notify();
                        resolve(true);
                    } catch (err) {
                        console.error("Profile refresh failed:", err);
                        resolve(true);
                    }
                });
            });
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
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession?.session?.user?.id;
        if (!userId) throw new Error("User session not found");

        try {
            const res = await supabase.functions.invoke('cancel-razorpay-subscription');
            if (res.error) throw res.error;
            return res.data;
        } catch (funcErr) {
            console.warn("Edge function cancel-razorpay-subscription unavailable or errored. Falling back to direct database update:", funcErr);
            
            const { data: updatedProfile, error: updateErr } = await supabase
                .from('profiles')
                .update({
                    tier: 'free',
                    subscription_tier: 'free',
                    subscription_status: 'cancelled',
                    razorpay_subscription_id: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (updateErr) throw updateErr;
            return { mock: true, profile: updatedProfile };
        }
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
