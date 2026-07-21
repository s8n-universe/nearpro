import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PROPOSAL_LIMITS = {
  free: 0,
  scout: 3,
  hunter: 25,
  agency: 100,
  enterprise: 999999
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? "";
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Authenticate user session
    const authHeader = req.headers.get('Authorization') ?? "";
    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Parse request payload
    const payload = await req.json();
    const { professional_id, custom_notes } = payload;

    if (!professional_id) {
      return new Response(JSON.stringify({ error: 'Professional ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Load user profile & check proposal tier quota
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      throw new Error(`Profile loading failed: ${profileErr?.message || 'not found'}`);
    }

    const tier = (profile.subscription_tier || 'free').toLowerCase();
    const limit = PROPOSAL_LIMITS[tier] !== undefined ? PROPOSAL_LIMITS[tier] : PROPOSAL_LIMITS.free;
    const currentUsed = profile.monthly_proposals_used || 0;

    if (currentUsed >= limit && tier !== 'enterprise') {
      return new Response(JSON.stringify({
        error: `Proposal generation limit reached for ${tier.toUpperCase()} tier (${currentUsed}/${limit}). Please upgrade your plan to generate more proposals.`
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Fetch target professional business details
    const { data: lead, error: leadErr } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', professional_id)
      .single();

    if (leadErr || !lead) {
      throw new Error(`Lead details not found for ID: ${professional_id}`);
    }

    // 5. Gather Gemini API Keys for resilient multi-model fallback execution
    const keysToTry: string[] = [];
    const mainKey = Deno.env.get('GEMINI_API_KEY');
    if (mainKey) keysToTry.push(mainKey);
    for (let i = 1; i <= 5; i++) {
      const k = Deno.env.get(`GEMINI_API_KEY_${i}`);
      if (k && !keysToTry.includes(k)) keysToTry.push(k);
    }

    if (keysToTry.length === 0) {
      throw new Error("API configuration missing. Please ensure GEMINI_API_KEY is configured.");
    }

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-2.0-flash',
      'gemini-3.1-flash-lite',
      'gemini-pro-latest'
    ];

    const senderName = profile.full_name || 'S8N Growth Specialist';
    const senderCompany = profile.company_name || 'S8N Digital Agency';
    const bookingUrl = profile.booking_url || 'https://topmate.io/shriraj';

    const systemPrompt = `You are a world-class senior digital agency growth strategist creating a highly detailed 3-Page Client Proposal for a local business lead.

LEAD DETAILS:
- Business Name: ${lead.name}
- Category: ${lead.category || lead.parent_category || 'Local Business'}
- Google Rating: ${lead.rating || 'N/A'}⭐
- Review Count: ${lead.review_count || 0} reviews
- Area/City: ${lead.area || lead.address || 'Mumbai'}
- Address: ${lead.address || 'Local Market'}
- Website: ${lead.website ? lead.website : 'No Website'}
- Phone: ${lead.phone || 'Available'}
- Email: ${lead.email || 'N/A'}
- Additional Agency Notes: ${custom_notes || 'Focus on mobile speed, lead generation, and review volume.'}

AGENCY SENDER DETAILS:
- Strategist Name: ${senderName}
- Agency Name: ${senderCompany}
- Booking URL: ${bookingUrl}

YOUR TASK:
Return a valid, strict JSON object (NO markdown backticks, NO markdown formatting outside JSON) containing structured proposal fields:

{
  "executive_summary": {
    "headline": "Digital Growth & Local Dominance Strategy for ${lead.name}",
    "subheadline": "Custom 3-Page Audit, Competitor Benchmark & Growth Roadmap",
    "business_name": "${lead.name}",
    "category": "${lead.category || 'Local Business'}",
    "rating": ${lead.rating || 4.5},
    "review_count": ${lead.review_count || 12},
    "location": "${lead.area || 'Mumbai'}",
    "has_website": ${!!lead.website},
    "audit_scores": {
      "seo_visibility": 42,
      "mobile_speed": 35,
      "conversion_clarity": 38,
      "local_pack_rank": "Position #6"
    },
    "overview_text": "An executive analysis of ${lead.name}'s current digital presence in ${lead.area || 'Mumbai'} and immediate growth opportunities."
  },
  "gap_analysis": {
    "competitor_review_avg": 85,
    "review_gap": ${(85 - (lead.review_count || 12)) > 0 ? (85 - (lead.review_count || 12)) : 45},
    "monthly_search_volume": 8500,
    "estimated_revenue_leak": "₹8,500 - ₹25,000 / month",
    "revenue_leak_explanation": "Due to a gap in review volume and absence of a fast mobile booking funnel, an estimated 60-70% of online searchers choose competitors with higher review counts.",
    "key_gaps": [
      "Competitors with more reviews rank higher on Google Maps search.",
      "Absence of instant 1-tap WhatsApp booking on mobile.",
      "Missing LocalBusiness structured schema markup."
    ]
  },
  "solution_architecture": {
    "title": "Tailored Digital Architecture & Lead Engine",
    "features": [
      {
        "name": "Sub-Second Mobile Architecture",
        "description": "Ultra-fast Next.js/Vite layout loading in under 800ms to stop visitor drop-offs."
      },
      {
        "name": "1-Tap Direct WhatsApp Trigger",
        "description": "Instant messaging button connecting high-intent customers directly to your team."
      },
      {
        "name": "Automated Google Review Velocity",
        "description": "Post-service SMS/WhatsApp triggers to systematically grow 5-star Google reviews."
      },
      {
        "name": "Verified Local Business Schema",
        "description": "Rich structured metadata so Google displays your ratings, address, and hours prominently."
      }
    ]
  },
  "pricing_packages": [
    {
      "name": "Starter Boost",
      "price": "₹14,999",
      "subtitle": "Essential Web Presence & WhatsApp Booking",
      "included": ["Custom Mobile Site", "1-Tap WhatsApp Trigger", "Basic Local SEO", "Standard Hosting"]
    },
    {
      "name": "Growth Dominance",
      "price": "₹29,999",
      "popular": true,
      "subtitle": "Full Conversion Architecture + Review System",
      "included": ["High-Converting Mobile Funnel", "WhatsApp & Call Triggers", "Google Review Velocity Automation", "LocalBusiness Schema Markup", "Monthly Analytics Report"]
    },
    {
      "name": "Agency Retainer",
      "price": "₹49,999",
      "subtitle": "Complete Digital Takeover & Ads Management",
      "included": ["Everything in Growth", "Google Maps Rank Optimization", "Monthly Content & Offers", "Dedicated Account Manager", "24/7 Priority Support"]
    }
  ],
  "consultation_cta": {
    "headline": "Claim Your Complimentary 1-on-1 Strategy Session",
    "body": "We are offering a free 30-minute consultation to walk you through this concept prototype and tailor the roadmap for ${lead.name}.",
    "button_label": "📅 Book Free Consultation",
    "booking_url": "${bookingUrl}",
    "sender_name": "${senderName}",
    "sender_company": "${senderCompany}"
  }
}`;

    let proposalJson: any = null;
    let lastError: any = null;

    // Multi-key x Multi-model execution loop
    outerLoop:
    for (const apiKey of keysToTry) {
      for (const modelName of modelsToTry) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 2048,
                responseMimeType: "application/json"
              }
            })
          });

          if (!res.ok) {
            const errTxt = await res.text();
            lastError = `Model ${modelName} HTTP ${res.status}: ${errTxt}`;
            continue;
          }

          const resData = await res.json();
          const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

          try {
            proposalJson = JSON.parse(cleanedText);
            if (proposalJson && proposalJson.executive_summary) {
              break outerLoop;
            }
          } catch (jsonErr) {
            lastError = `JSON parse failed: ${jsonErr.message}`;
          }
        } catch (e) {
          lastError = e.message;
        }
      }
    }

    if (!proposalJson) {
      throw new Error(`AI Proposal generation failed across all models. Details: ${lastError || 'Unknown error'}`);
    }

    // 6. Save Proposal to Documents Table
    const shortSlug = 'prop_' + Math.random().toString(36).substring(2, 8);
    const docName = `Proposal - ${lead.name}`;
    const filePath = `proposals/${user.id}/${shortSlug}.json`;
    const docUrl = `${req.headers.get('origin') || ''}#/d/${shortSlug}`;

    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert([{
        user_id: user.id,
        name: docName,
        file_path: filePath,
        file_url: docUrl,
        file_size: 185000,
        slug: shortSlug,
        content_json: proposalJson
      }])
      .select()
      .single();

    if (docError) {
      throw new Error(`Failed to save proposal document: ${docError.message}`);
    }

    // 7. Increment user's monthly proposals counter
    await supabase
      .from('profiles')
      .update({ monthly_proposals_used: currentUsed + 1 })
      .eq('id', user.id);

    return new Response(JSON.stringify({
      success: true,
      proposal: proposalJson,
      document_id: docData.id,
      slug: shortSlug,
      public_url: docUrl,
      quota: {
        used: currentUsed + 1,
        limit: limit
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
