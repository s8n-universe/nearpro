import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CALL_SCRIPT_LIMITS = {
  free: 0,
  scout: 5,
  hunter: 30,
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

    // 1. Authenticate session
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

    // 2. Parse payload
    const payload = await req.json();
    const { professional_id, call_angle } = payload;

    if (!professional_id) {
      return new Response(JSON.stringify({ error: 'Professional ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Load user profile & check call script tier quota
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('subscription_tier, monthly_call_scripts_used, full_name, company_name, booking_url, portfolio_url')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      throw new Error(`Profile loading failed: ${profileErr?.message || 'not found'}`);
    }

    const tier = (profile.subscription_tier || 'free').toLowerCase();
    const limit = CALL_SCRIPT_LIMITS[tier] !== undefined ? CALL_SCRIPT_LIMITS[tier] : CALL_SCRIPT_LIMITS.free;
    const currentUsed = profile.monthly_call_scripts_used || 0;

    if (currentUsed >= limit && tier !== 'enterprise') {
      return new Response(JSON.stringify({
        error: `Call script limit reached for ${tier.toUpperCase()} tier (${currentUsed}/${limit}). Please upgrade your plan.`
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

    const callerName = profile.full_name || 'Shriraj';
    const callerCompany = profile.company_name || 'S8N Digital';
    const bookingUrl = profile.booking_url || 'https://topmate.io/shriraj';

    const systemPrompt = `You are an elite B2B tele-sales coach crafting a highly effective, natural Cold Calling Script & Live Objection Handling Guide for an Indian agency founder calling a local business owner.

TARGET LEAD DETAILS:
- Business Name: ${lead.name}
- Category: ${lead.category || lead.parent_category || 'Local Business'}
- Google Rating: ${lead.rating || 'N/A'}⭐
- Review Count: ${lead.review_count || 0} reviews
- Area/City: ${lead.area || lead.address || 'Mumbai'}
- Website: ${lead.website ? lead.website : 'No Website'}
- Phone: ${lead.phone || 'Available'}
- Angle: ${call_angle || 'REPUTATION_AND_REVENUE'}

CALLER DETAILS:
- Caller Name: ${callerName}
- Agency Name: ${callerCompany}
- Booking URL: ${bookingUrl}

TONE & LANGUAGE:
Natural, respectful, high-converting Hinglish/English mix used in Indian business calls. Professional, non-pushy, curiosity-driven.

YOUR TASK:
Return a valid, strict JSON object (NO markdown backticks, NO markdown formatting outside JSON) containing structured script sections:

{
  "business_name": "${lead.name}",
  "caller_name": "${callerName}",
  "caller_company": "${callerCompany}",
  "opening_pattern_interrupt": {
    "script_text": "Hello ${lead.name} team, main ${callerName} bol raha hoon ${callerCompany} Mumbai se. Maine dekha aapka Google rating 5 star hai. Quick 30 seconds hain aapke paas?",
    "coaching_tip": "Speak warmly and unhurriedly. Give a 2-second pause after asking for 30 seconds."
  },
  "observation_hook": {
    "script_text": "Main ${lead.area || 'Mumbai'} mein ${lead.category || 'local business'} profiles research kar raha tha. Aapka rating ${lead.rating || 5.0}⭐ hai which is excellent, but ${lead.review_count || 12} reviews hone se competitors with lower ratings online search mein aage nikal rahe hain.",
    "key_data_point": "${lead.rating}⭐ rating with ${lead.review_count} Google reviews in ${lead.area || 'Mumbai'}"
  },
  "empathy_question": {
    "script_text": "Isliye main puchna chahta tha — kya aapki major new enquiries word-of-mouth se aati hain ya Google search se bhi regular leads aate hain?"
  },
  "value_pitch": {
    "script_text": "Sahi hai. Humne aapke brand ke liye ek tailored custom concept prototype demo design kiya hai showing how you can easily capture 3x more local search enquiries with 1-tap WhatsApp booking.",
    "concept_url_mention": "Main aapko hamara 3-page custom concept link WhatsApp pe share kar sakta hoon."
  },
  "objection_handlers": [
    {
      "objection_id": "word_of_mouth",
      "objection_title": "1. 'Humari saari enquiries word of mouth se aati hain'",
      "rebuttal_script": "Bilkul sahi sir! Word of mouth matlab aapka service quality top class hai. Par modern customers word of mouth sunne ke baad pehle Google pe verify karte hain. Jab unhe review gap dikhta hai, to 40% drop-off ho jata hai. Wahi leak hum fix karte hain.",
      "strategic_angle": "Validate quality, then highlight silent drop-off from referral leads."
    },
    {
      "objection_id": "already_have_website",
      "objection_title": "2. 'Humare paas pehle se website hai'",
      "rebuttal_script": "Great sir! Website hona bahut achhi baat hai. Par kya aapki current site sub-second mobile fast hai aur 1-tap WhatsApp booking trigger hai? Maine dekha mobile loading mein slight lag hai, jis se potential clients exit ho rahe hain.",
      "strategic_angle": "Praise existing site, then pivot to mobile speed & WhatsApp conversion."
    },
    {
      "objection_id": "not_interested_budget",
      "objection_title": "3. 'Hum abhi interested nahi hain / budget issue'",
      "rebuttal_script": "Samajh sakta hoon sir. Main aaj aapko kuch bech nahi raha hoon. Hum sirf ek complimentary 15-minute audit review offer kar rahe hain completely free of charge. Agar pasand aaye to aage baat karenge, varna aap presentation retain kar sakte hain.",
      "strategic_angle": "Take away sales pressure. Offer zero-risk complimentary strategy session."
    },
    {
      "objection_id": "send_on_whatsapp",
      "objection_title": "4. 'Aap WhatsApp / Email pe details bhej do'",
      "rebuttal_script": "Sure sir! Main abhi aapko WhatsApp pe hamara PDF Proposal & Concept Demo Link bhej raha hoon. Aaj evening 5 PM ya kal morning 11 AM, kab 5 minutes baat karke isko discuss kar sakte hain?",
      "strategic_angle": "Agree immediately, send proposal link, and lock in specific callback time."
    }
  ],
  "call_closing": {
    "script_text": "Kya hum kal brief 15-minute consultation call fix kar sakte hain jahan main aapko live walk-through dikhaoon?",
    "booking_url": "${bookingUrl}"
  },
  "whatsapp_followup_message": "Hi ${lead.name} team! Main ${callerName} from ${callerCompany}. As discussed over call, yahan aapka custom 3-Page Digital Proposal & Concept Demo URL hai: ${bookingUrl}. Looking forward to discussing this! Best regards, ${callerName}."
}`;

    let scriptJson: any = null;
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
            scriptJson = JSON.parse(cleanedText);
            if (scriptJson && scriptJson.opening_pattern_interrupt) {
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

    if (!scriptJson) {
      throw new Error(`AI Call script generation failed across all models. Details: ${lastError || 'Unknown error'}`);
    }

    // 6. Save Call Script to Documents Table
    const shortSlug = 'script_' + Math.random().toString(36).substring(2, 8);
    const docName = `Call Script - ${lead.name}`;
    const filePath = `scripts/${user.id}/${shortSlug}.json`;
    const docUrl = `${req.headers.get('origin') || ''}#/d/${shortSlug}`;

    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert([{
        user_id: user.id,
        name: docName,
        file_path: filePath,
        file_url: docUrl,
        file_size: 95000,
        slug: shortSlug,
        content_json: scriptJson
      }])
      .select()
      .single();

    if (docError) {
      throw new Error(`Failed to save call script document: ${docError.message}`);
    }

    // 7. Increment user's monthly call scripts counter
    await supabase
      .from('profiles')
      .update({ monthly_call_scripts_used: currentUsed + 1 })
      .eq('id', user.id);

    return new Response(JSON.stringify({
      success: true,
      call_script: scriptJson,
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
