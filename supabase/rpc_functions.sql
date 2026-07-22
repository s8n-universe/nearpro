-- 1. Stats endpoint (replaces GET /api/stats)
CREATE OR REPLACE FUNCTION get_stats()
RETURNS JSON AS $$
    SELECT json_build_object(
        'total_professionals', COUNT(*),
        'total_categories', COUNT(DISTINCT category),
        'total_areas', COUNT(DISTINCT area),
        'average_rating', ROUND(AVG(rating)::numeric, 1),
        'with_phone', COUNT(phone),
        'with_website', COUNT(website),
        'with_email', COUNT(email),
        'with_coordinates', COUNT(latitude),
        'last_scraped', MAX(scraped_at),
        'freshness', json_build_object(
            'last_7_days', COUNT(*) FILTER (WHERE scraped_at > NOW() - INTERVAL '7 days'),
            'last_30_days', COUNT(*) FILTER (WHERE scraped_at > NOW() - INTERVAL '30 days'),
            'older', COUNT(*) FILTER (WHERE scraped_at <= NOW() - INTERVAL '30 days')
        )
    )
    FROM professionals;
$$ LANGUAGE SQL STABLE;

-- 2. Category groups (replaces GET /api/categories)
CREATE OR REPLACE FUNCTION get_category_groups()
RETURNS JSON AS $$
    SELECT json_agg(row_to_json(t))
    FROM (
        SELECT 
            parent_category as name,
            SUM(sub_count) as total,
            MAX(last_updated) as last_updated,
            json_agg(json_build_object(
                'name', category,
                'slug', LOWER(REPLACE(category, ' ', '_')),
                'count', sub_count
            ) ORDER BY sub_count DESC) as subcategories
        FROM (
            SELECT parent_category, category, COUNT(*) as sub_count, MAX(scraped_at) as last_updated
            FROM professionals
            WHERE parent_category IS NOT NULL
            GROUP BY parent_category, category
        ) sub
        GROUP BY parent_category
        ORDER BY total DESC
    ) t;
$$ LANGUAGE SQL STABLE;


-- 3. Area insights (replaces GET /api/insights)
CREATE OR REPLACE FUNCTION get_area_insights()
RETURNS JSON AS $$
    SELECT json_build_object(
        'area_density', (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT area, COUNT(*) as count, 
                       COUNT(DISTINCT category) as categories,
                       ROUND(AVG(rating)::numeric, 1) as avg_rating
                FROM professionals
                WHERE area IS NOT NULL AND area != 'Mumbai'
                GROUP BY area
                ORDER BY count DESC
            ) t
        ),
        'category_distribution', (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT parent_category as category, COUNT(*) as count,
                       ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM professionals) * 100, 1) as percentage
                FROM professionals
                WHERE parent_category IS NOT NULL
                GROUP BY parent_category
                ORDER BY count DESC
            ) t
        )
    );
$$ LANGUAGE SQL STABLE;

-- 4. Secure professional retriever with automated trials check & data masking
CREATE OR REPLACE FUNCTION get_professionals_v2(
    client_fingerprint TEXT,
    parent_cat TEXT DEFAULT NULL,
    sub_cat TEXT DEFAULT NULL,
    filter_area TEXT DEFAULT NULL,
    min_rat REAL DEFAULT NULL,
    has_em BOOLEAN DEFAULT FALSE,
    has_ph BOOLEAN DEFAULT FALSE,
    has_web BOOLEAN DEFAULT FALSE,
    search_term TEXT DEFAULT NULL,
    sort_col TEXT DEFAULT 'rating_desc',
    offset_val INT DEFAULT 0,
    limit_val INT DEFAULT 24,
    has_no_web BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    category TEXT,
    parent_category TEXT,
    address TEXT,
    area TEXT,
    phone TEXT,
    website TEXT,
    email TEXT,
    rating REAL,
    review_count INT,
    completeness_score INT,
    hours JSONB,
    latitude REAL,
    longitude REAL,
    source TEXT,
    source_url TEXT,
    scraped_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ
) AS $$
DECLARE
    is_premium_user BOOLEAN := FALSE;
    is_trial_active BOOLEAN := FALSE;
    user_tier TEXT := 'free';
BEGIN
    -- Check if authenticated user is premium
    IF auth.uid() IS NOT NULL THEN
        SELECT 
            COALESCE(is_premium, FALSE),
            COALESCE(subscription_tier, COALESCE(tier, 'free'))
        INTO is_premium_user, user_tier
        FROM public.profiles
        WHERE profiles.id = auth.uid();

        IF user_tier IN ('scout', 'hunter', 'agency', 'enterprise', 'connect', 'pro') THEN
            is_premium_user := TRUE;
        END IF;
    END IF;
    
    -- Check if anonymous 2-minute trial is active
    IF NOT is_premium_user AND client_fingerprint IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.anonymous_trials
            WHERE fingerprint = client_fingerprint
              AND (NOW() - started_at) < INTERVAL '2 minutes'
        ) INTO is_trial_active;
    END IF;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.category,
        p.parent_category,
        p.address,
        p.area,
        CASE 
            WHEN is_premium_user OR is_trial_active THEN p.phone
            ELSE NULL
        END as phone,
        CASE 
            WHEN is_premium_user OR is_trial_active THEN p.website
            ELSE NULL
        END as website,
        p.email,
        p.rating,
        p.review_count,
        p.completeness_score,
        p.hours,
        p.latitude,
        p.longitude,
        p.source,
        p.source_url,
        p.scraped_at,
        p.synced_at
    FROM professionals p
    WHERE 
        (parent_cat IS NULL OR p.parent_category = parent_cat)
        AND (sub_cat IS NULL OR p.category = sub_cat)
        AND (filter_area IS NULL OR p.area = filter_area)
        AND (min_rat IS NULL OR p.rating >= min_rat)
        AND (NOT has_em OR (p.email IS NOT NULL AND p.email != ''))
        AND (NOT has_ph OR (p.phone IS NOT NULL AND p.phone != ''))
        AND (NOT has_web OR (p.website IS NOT NULL AND p.website != ''))
        AND (NOT has_no_web OR (p.website IS NULL OR p.website = ''))
        AND (search_term IS NULL OR p.name ILIKE '%' || search_term || '%' OR p.address ILIKE '%' || search_term || '%' OR p.category ILIKE '%' || search_term || '%')
    ORDER BY
        CASE WHEN sort_col = 'rating_desc' THEN p.rating END DESC,
        CASE WHEN sort_col = 'reviews_desc' THEN p.review_count END DESC,
        CASE WHEN sort_col = 'completeness_desc' THEN p.completeness_score END DESC,
        CASE WHEN sort_col = 'scraped_desc' THEN p.scraped_at END DESC
    OFFSET offset_val
    LIMIT limit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
