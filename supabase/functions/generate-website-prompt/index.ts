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

    let platformInstructions = "";
    if (platform === 'lovable') {
      platformInstructions = `
Guidelines for Lovable.dev target prompt:
- Direct Lovable to build a highly visual React single-page app using Vite, Tailwind CSS, and shadcn/ui.
- Instruct it to use rich animations (Framer Motion), interactive micro-interactions, and pre-built shadcn components (accordion, cards, dial, toast).
- Make sure it implements a clean Supabase storage integration or state-based mocking for forms (booking, reviews, inquiry).
- Emphasize component division: Hero, Features, Service Catalog, Review Grid with rating stars, Interactive Booking Calendar/Modal, Map Placeholder, and FAQ.
- Highlight visual accents: modern typography (Outfit / Space Grotesk), dark glassmorphism styling, and custom SVG icons/illustrations.`;
    } else if (platform === 'bolt') {
      platformInstructions = `
Guidelines for Bolt.new target prompt:
- Direct Bolt to bootstrap a complete Vite + React + Lucide Icons environment.
- Instruct it to install package dependencies explicitly in package.json (e.g. lucide-react, canvas-confetti, framer-motion).
- Provide a detailed file structure blueprint for them to follow: App.tsx, components/, and index.css.
- Ensure the layout is a stunning single-page web app with interactive features (interactive booking calendar, responsive mobile menu, testimonial sliders).
- Advise Bolt to start the local dev server using 'npm run dev' and keep execution self-contained.`;
    } else if (platform === 'v0') {
      platformInstructions = `
Guidelines for v0.dev target prompt:
- Direct v0 to generate a modern, responsive React/Next.js component layout using Tailwind CSS and shadcn/ui.
- Focus on clean visual styling, cards layout grids, and interactive mockup states (like a booking scheduler modal, pricing tiers, and FAQ accordions).
- Emphasize copy-paste convenience for shadcn component blocks.`;
    } else if (platform === 'cursor') {
      platformInstructions = `
Guidelines for Cursor IDE target prompt:
- Direct Cursor to act as a senior frontend engineer building a Vite + React + TypeScript local website.
- Instruct it to output clear steps to set up a '.cursorrules' configuration file.
- Provide instructions for generating separate modular React TSX components (Hero.tsx, Services.tsx, Booking.tsx) and importing them cleanly into App.tsx.
- Advise it on strict typescript typing, lint error prevention, and clean file tree management.`;
    } else if (platform === 'claude') {
      platformInstructions = `
Guidelines for Claude Code target prompt:
- Direct Claude to write clean, modular React/HTML/Tailwind files or update existing project files.
- Tell Claude exactly what files to create or modify (e.g. index.html, components/, style.css) in their workspace.
- Instruct Claude to verify correct HTML semantic structure, compile CSS build, and run local dev/build servers to check for errors.
- Focus on raw coding efficiency, clean layout hierarchy, and robust, zero-dependency Javascript features (e.g. form validations, scroll animations-based visibility).`;
    }

    let formattedHours = "Not Specified";
    if (lead.hours) {
      try {
        const hoursObj = typeof lead.hours === 'string' ? JSON.parse(lead.hours) : lead.hours;
        formattedHours = Object.entries(hoursObj)
          .map(([day, time]) => `${day}: ${time}`)
          .join(', ');
      } catch (e) {
        formattedHours = JSON.stringify(lead.hours);
      }
    }

    const systemPrompt = `You are an expert system prompt engineer. Your job is to output a customized prompt that a user can paste into builder tools like Lovable, Bolt.new, or Claude Code to build a highly optimized single-page landing page website for a local business.
Generate a tailored, highly specific, and creative system prompt that incorporates the business details and matches the requested builder platform.

${platformInstructions}

CRITICAL RULES:
- The generated prompt MUST explicitly instruct the target builder to include the specific physical address, original website domain (if any), and business operating hours in the footer or contact sections so that the generated demo site is fully operational and client-oriented.`;

    const userMessage = `Generate a website builder prompt for:
Name: ${lead.name}
Category: ${lead.category}
Area: ${lead.area || 'Mumbai'}
Rating: ${lead.rating || '4.5'}
Review Count: ${lead.review_count || '25'}
Phone: ${phone}
WhatsApp link suffix: ${cleanPhone}
Address: ${lead.address || 'Not specified'}
Website URL: ${lead.website || 'No existing website'}
Business Hours: ${formattedHours}
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
