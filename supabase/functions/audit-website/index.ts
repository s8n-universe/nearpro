import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? "";
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const { url, professional_id } = await req.json();
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Clean URL
    const cleanUrl = url.trim().toLowerCase();

    // 1. Check Cache first
    const { data: cached, error: cacheErr } = await supabase
      .from('audit_cache')
      .select('*')
      .eq('url', cleanUrl)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cached) {
      console.log(`Cache hit for URL: ${cleanUrl}`);
      
      // Update professional flag in background if needed
      if (professional_id) {
        await supabase
          .from('professionals')
          .update({ audit_cached: true })
          .eq('id', professional_id);
      }

      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Fetch from Google PageSpeed API
    console.log(`Cache miss. Auditing URL: ${cleanUrl}`);
    const pageSpeedApiKey = Deno.env.get('GOOGLE_PAGESPEED_API_KEY') ?? "";
    const keyParam = pageSpeedApiKey ? `&key=${pageSpeedApiKey}` : "";
    const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(cleanUrl)}&strategy=mobile${keyParam}`;

    const res = await fetch(apiEndpoint);
    if (!res.ok) {
      throw new Error(`Google PageSpeed API returned status: ${res.status}`);
    }

    const json = await res.json();
    const lighthouse = json.lighthouseResult;
    const categories = lighthouse?.categories;
    const audits = lighthouse?.audits;

    // Extract metrics
    const pageSpeedScore = Math.round((categories?.performance?.score ?? 0.5) * 100);
    const hasHttps = cleanUrl.startsWith('https://');
    const isMobileFriendly = (audits?.['viewport']?.score ?? 1) === 1;
    
    // Check for JSON-LD schema or general schema
    const hasSchema = (audits?.['structured-data']?.score ?? 1) === 1 || 
                      (lighthouse?.requestedUrl?.includes('https') ? true : false); // fallback heuristic

    const loadTimeMs = Math.round(audits?.['speed-index']?.numericValue ?? 3000);

    // Compute Gaps (Strictly avoiding hyphens in copy!)
    const gaps: string[] = [];
    if (pageSpeedScore < 50) {
      gaps.push("Slow loading speeds on mobile displays");
    }
    if (!hasHttps) {
      gaps.push("Insecure connection warning due to missing HTTPS encryption");
    }
    if (!isMobileFriendly) {
      gaps.push("Missing optimized layouts for phone screens");
    }
    if (!hasSchema) {
      gaps.push("Structured schema data is missing for Google Search display");
    }

    if (gaps.length === 0) {
      gaps.push("No major gaps found but speed optimization can improve");
    }

    const biggestGap = gaps[0];

    // Estimated lost revenue factor based on PageSpeed score
    // Indian Local business average conversion leak model (in INR, no hyphens)
    const trafficVolumeFactor = 200; // estimated monthly visits
    const averageOrderValue = 1500; // average transaction value in INR
    const conversionLossPercent = (100 - pageSpeedScore) * 0.003; // speed penalty leakage
    const estLostRevenue = Math.round(trafficVolumeFactor * averageOrderValue * conversionLossPercent);

    const auditResult = {
      url: cleanUrl,
      page_speed_score: pageSpeedScore,
      mobile_friendly: isMobileFriendly,
      has_https: hasHttps,
      has_schema: hasSchema,
      load_time_ms: loadTimeMs,
      gaps: gaps,
      biggest_gap: biggestGap,
      est_lost_revenue_per_month: estLostRevenue,
      audited_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 day TTL
    };

    // 3. Upsert into Cache
    const { error: upsertErr } = await supabase
      .from('audit_cache')
      .upsert(auditResult, { onConflict: 'url' });

    if (upsertErr) {
      console.error("Failed to upsert cache: ", upsertErr);
    }

    // 4. Update professionals table flag
    if (professional_id) {
      const { error: updateErr } = await supabase
        .from('professionals')
        .update({ 
          audit_cached: true, 
          conversion_score: Math.min(100, (pageSpeedScore < 50 ? 40 : 80)) // dynamic updates
        })
        .eq('id', professional_id);
        
      if (updateErr) {
        console.error("Failed to update professional: ", updateErr);
      }
    }

    return new Response(JSON.stringify(auditResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Edge Function error: ", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
