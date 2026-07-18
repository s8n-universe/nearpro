import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? "";
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Authenticate user
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

    // 2. Parse request body
    const { professional_id, channel, language, tone } = await req.json();
    if (!professional_id) {
      return new Response(JSON.stringify({ error: 'Professional ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Get user profile details (tier, limits, usage)
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('subscription_tier, monthly_ai_generations_used, monthly_ai_generations_limit, full_name, company_name, portfolio_url, booking_url')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      throw new Error(`Profile loading failed: ${profileErr?.message || 'not found'}`);
    }

    // Gating check
    const allowedTiers = ['hunter', 'agency', 'enterprise'];
    const currentTier = (profile.subscription_tier || 'free').toLowerCase();
    if (!allowedTiers.includes(currentTier)) {
      return new Response(JSON.stringify({ 
        error: 'AI Outreach generation requires the Hunter or Agency plan.' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Limit check (only enforce for Hunter since Agency is unlimited, but check standard rules)
    const maxLimit = profile.monthly_ai_generations_limit ?? 500;
    const currentUsed = profile.monthly_ai_generations_used ?? 0;
    
    if (currentTier === 'hunter' && currentUsed >= maxLimit) {
      return new Response(JSON.stringify({ 
        error: 'You have reached your limit of 500 AI generations this month. Upgrade to Agency for unlimited generations.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Fetch lead details for prompt context
    const { data: lead, error: leadErr } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', professional_id)
      .single();

    if (leadErr || !lead) {
      return new Response(JSON.stringify({ error: 'Lead professional record not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 5. Call Gemini API
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set in Supabase");
    }

    // Format target variables
    const bizName = lead.name;
    const bizCategory = lead.category || lead.parent_category || "business";
    const rating = lead.rating ? `${lead.rating} stars` : "N/A";
    const reviews = lead.review_count ? `${lead.review_count} reviews` : "0 reviews";
    const area = lead.area || "Mumbai";
    const hasWebsite = !!lead.website;

    // Copy parameters
    const targetChannel = (channel || 'whatsapp').toLowerCase();
    const targetLanguage = (language || 'hinglish').toLowerCase();
    const targetTone = (tone || 'friendly').toLowerCase();

    const senderName = profile.full_name || "Shri";
    const senderCompany = profile.company_name || "NearPro Agency";
    const bookingUrl = profile.booking_url || "";
    let portfolioUrl = `https://lovable.dev/preview/nearpro_${professional_id.slice(0, 8)}`;
    if (profile.portfolio_url) {
      const base = profile.portfolio_url;
      const prefix = base.endsWith('/') ? base : base + '/';
      portfolioUrl = `${prefix}preview/nearpro_${professional_id.slice(0, 8)}`;
    }

    // Construct prompt
    let promptInstructions = "";
    if (targetLanguage === 'hinglish') {
      promptInstructions = `Write a Hinglish message. Use a natural, friendly mix of Hindi and English written in the Latin alphabet (e.g. "Maine aapka Google Maps profile dekha, kaafi achha review rating hai par..."). Ensure you write in a highly conversational and respectful tone, using "Aap" instead of "Tum".`;
    } else {
      promptInstructions = `Write the message in clear, engaging English. Keep the tone natural and professional.`;
    }

    let channelFormat = "";
    if (targetChannel === 'whatsapp') {
      channelFormat = `Make the draft suitable for a quick WhatsApp chat. Keep it short (under 120 words), use single line spaces, and insert emojis to make it friendly. Use bold markdown (*text*) for key metrics (like rating or reviews) to grab attention. Avoid paragraphs; make it look like a chat message.`;
    } else {
      channelFormat = `Make the draft suitable for an email. Include a catchy, personalized Subject line at the beginning (e.g. "Subject: Quick question about [business name]"). Keep it concise (under 180 words) with clear spacing.`;
    }

    const promptText = `
You are a senior sales copywriter. Write a highly personalized sales pitch for the business: "${bizName}".
Their details are:
- Category: ${bizCategory}
- Location: ${area}
- Rating: ${rating} with ${reviews}
- Website presence: ${hasWebsite ? "They have a website" : "They do not have a website (it is missing from their profile)"}

Pitch Context:
- Tone: ${targetTone}
- Medium: ${targetChannel}
- Language: ${targetLanguage}

Rules:
1. ${promptInstructions}
2. ${channelFormat}
3. STRICT HYPHEN CONSTRAINT: Do not use any hyphens ( - ) anywhere in your generated output under any circumstances. Replace all hyphens with spaces, commas, or normal words (e.g., instead of "10-20" say "10 to 20", instead of using a hyphen to separate text, use a comma or a new line).
4. Do not mention that you are an AI or references to templates.
5. Sign off using the sender name: "${senderName}" (representing "${senderCompany}"). Never use "[Your Name]" or placeholders.
6. Only pitch a website preview link (${portfolioUrl}) if they do not have a website. If they already have a website, do not pitch a new website preview link.
7. If relevant to schedule a call, use this booking link: ${bookingUrl}.
8. Provide ONLY the final pitch message.
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`;
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: promptText
          }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errText}`);
    }

    const geminiData = await geminiResponse.json();
    let generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Secondary safety cleanup (regex remove hyphens if any slipped past the AI instructions)
    generatedText = generatedText.replace(/-/g, " ");

    // 6. Update user's generation count in database
    const { error: countErr } = await supabase
      .from('profiles')
      .update({
        monthly_ai_generations_used: currentUsed + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (countErr) {
      console.error("Failed to increment AI usage counter: ", countErr);
    }

    // 7. Return generated response
    return new Response(JSON.stringify({ 
      text: generatedText,
      used: currentUsed + 1,
      limit: maxLimit
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("AI Generation execution failed: ", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
