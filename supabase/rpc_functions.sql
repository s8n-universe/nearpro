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
            COUNT(*) as total,
            MAX(scraped_at) as last_updated,
            json_agg(json_build_object(
                'name', category,
                'slug', LOWER(REPLACE(category, ' ', '-')),
                'count', sub_count
            ) ORDER BY sub_count DESC) as subcategories
        FROM (
            SELECT parent_category, category, COUNT(*) as sub_count
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
