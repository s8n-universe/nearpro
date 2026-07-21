import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PROMPT_LIMITS = {
  free: 3,
  scout: 30,
  hunter: 60,
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
    const { professional_id, platform } = payload;

    if (!professional_id || !platform) {
      return new Response(JSON.stringify({ error: 'Professional ID and Platform are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Load user profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('subscription_tier, monthly_prompt_copies_used')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      throw new Error(`Profile loading failed: ${profileErr?.message || 'not found'}`);
    }

    const tier = (profile.subscription_tier || 'free').toLowerCase();
    const count = profile.monthly_prompt_copies_used ?? 0;
    const limit = PROMPT_LIMITS[tier] || 0;

    if (count >= limit) {
      return new Response(JSON.stringify({ 
        error: `Usage limit reached: your current plan (${tier.toUpperCase()}) allows up to ${limit} prompt copies. Please upgrade for more access.` 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Fetch professional details
    const { data: lead, error: leadErr } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', professional_id)
      .single();

    if (leadErr || !lead) {
      throw new Error(`Professional listing loading failed: ${leadErr?.message || 'not found'}`);
    }

    // 5. Query Gemini API to generate custom website prompt
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set in Supabase");
    }

    const jsonLdType = (lead.category || '').toLowerCase().includes('dentist') ? 'Dentist' : 'LocalBusiness';
    const phone = lead.phone || '+91 98765 43210';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const systemPrompt = `You are an expert system prompt engineer. Your job is to output a customized prompt that a user can paste into builder tools like Lovable, Bolt.new, or Claude Code to build a highly optimized single-page landing page website for a local business.
Generate a tailored, highly specific, and creative system prompt that incorporates the business details and matches the requested builder platform.`;

    const userMessage = `Generate a website builder prompt for:
Name: ${lead.name}
Category: ${lead.category}
Area: ${lead.area || 'Mumbai'}
Rating: ${lead.rating || '4.5'}
Review Count: ${lead.review_count || '25'}
Phone: ${phone}
WhatsApp link suffix: ${cleanPhone}
Target Platform: ${platform}
JSON-LD Type: ${jsonLdType}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const resJson = await response.json();
    const generatedText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("Failed to get response text from Gemini API");
    }

    // 6. Update usage in profiles table
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ monthly_prompt_copies_used: count + 1 })
      .eq('id', user.id);

    if (updateErr) {
      throw new Error(`Failed to update prompt copies usage count: ${updateErr.message}`);
    }

    return new Response(JSON.stringify({ 
      prompt: generatedText,
      used: count + 1,
      limit: limit
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
