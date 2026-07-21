import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type HookType =
  | 'HIGH_RATING_NO_WEB'
  | 'HIGH_RATING_LOW_REVIEWS'
  | 'REPUTATION_OPPORTUNITY'
  | 'HIDDEN_GEM'
  | 'ZERO_DIGITAL'
  | 'STRONG_BRAND_GROWTH'
  | 'STANDARD';

function selectHookType(
  rating: number | null,
  reviews: number | null,
  hasWebsite: boolean,
  hasEmail: boolean
): HookType {
  const r = rating ?? 0;
  const rv = reviews ?? 0;

  if (r >= 4.5 && rv >= 50 && !hasWebsite)   return 'HIGH_RATING_NO_WEB';
  if (r >= 4.5 && rv >= 50 && hasWebsite)     return 'STRONG_BRAND_GROWTH';
  if (r >= 4.3 && rv < 20)                    return 'HIDDEN_GEM';
  if (r < 4.0 && rv >= 20)                    return 'REPUTATION_OPPORTUNITY';
  if (!hasWebsite && !hasEmail)               return 'ZERO_DIGITAL';
  if (r >= 4.0 && rv >= 20 && !hasWebsite)   return 'HIGH_RATING_NO_WEB';
  if (r >= 4.0 && rv >= 20 && hasWebsite)    return 'STRONG_BRAND_GROWTH';
  return 'STANDARD';
}

const HOOK_LABELS: Record<HookType, string> = {
  HIGH_RATING_NO_WEB: "Strong Rating, Missing Web Presence",
  HIGH_RATING_LOW_REVIEWS: "Hidden Gem — High Quality, Low Visibility",
  REPUTATION_OPPORTUNITY: "Reputation Growth Opportunity",
  HIDDEN_GEM: "Under-the-Radar Quality Business",
  ZERO_DIGITAL: "Offline-First Business",
  STRONG_BRAND_GROWTH: "Established Business — Growth Angle",
  STANDARD: "Observation + Question"
};

const HOOK_INSTRUCTIONS: Record<HookType, string> = {
  HIGH_RATING_NO_WEB: `
HOOK TO USE: The business has strong social proof (high rating, many reviews) but no website — meaning they're trusted but invisible online.
Open with GENUINE RECOGNITION of their strong reputation, then in the same breath surface the visibility gap.
Example structure (adapt, don't copy): "Aapka [X] star rating with [Y]+ reviews dekha — clearly patients/customers trust you. Lekin Google search mein website nahi hai, which means [specific consequence for their category]."
The gap must feel like a discovery, not a criticism.`,

  HIGH_RATING_LOW_REVIEWS: `
HOOK TO USE: Hidden gem — great quality signal (high rating) but low review volume means satisfied customers aren't leaving reviews and the business is underrepresented online.
Open with the paradox: great quality, not enough people know about it.
The observation: "With a [rating] rating, clearly the quality is there. But [review_count] reviews means you're not capturing the appreciation of every happy customer."`,

  REPUTATION_OPPORTUNITY: `
HOOK TO USE: Rating below 4.0 with enough reviews to be statistically real.
DO NOT open by criticizing their rating. Open with empathy and curiosity.
Approach: "I noticed your Google profile and wanted to ask — are you getting feedback from customers that explains the [rating] rating, or is it something you're actively looking at?"
This opens a conversation rather than lecturing them.
Important: be genuinely curious, not condescending.`,

  HIDDEN_GEM: `
HOOK TO USE: Solid rating but very few reviews — the business is good but flying under the radar.
The insight: in their category, competitors with more reviews rank higher on Google even if their rating is lower.
Open with the discovery angle: you noticed their quality but saw they haven't captured much social proof yet.`,

  ZERO_DIGITAL: `
HOOK TO USE: No website, no email — relies entirely on walk-ins and word of mouth. In urban India, this means missing 60-70% of potential customers who research online first.
Open with a genuine curiosity question — not a lecture.
Example: "Saw your [category] business in [area] — how are you currently getting new customers? Mostly referrals, or has online been part of it?"
This is conversational and non-pushy. It opens dialogue.`,

  STRONG_BRAND_GROWTH: `
HOOK TO USE: This business is already doing well — strong rating, good reviews, has website. Generic pitches will not land.
Open with recognition of their strength and pivot to a specific ADVANCED opportunity. Do not pitch basics. Instead, reference something category-specific that helps businesses at THEIR level grow further.
Examples: review velocity campaigns, Google ad optimisation for their category, WhatsApp appointment automation, B2B referral networks.`,

  STANDARD: `
HOOK TO USE: No dominant signal. Use the "observation + question" structure.
Open with one specific thing you noticed about their Google profile (use the data you have — their area, their category, their rating).
Then ask one question that relates to a business challenge typical in their category. Do not pitch anything in the first message.`
};

const CATEGORY_PAIN_POINTS: Record<string, string> = {
  Healthcare: `
CATEGORY CONTEXT: Healthcare businesses (clinics, hospitals, dental, doctors) lose patients when they can't find booking info at night. Medical decisions happen at 11pm when the pain starts. If a patient can't find the number or book online at that moment, they call whoever's next on the list.
If pitching a web developer: missed appointment bookings = missed revenue.
If pitching SEO: patients compare ratings before choosing any doctor.
If pitching general B2B: referral relationships between complementary health services are extremely valuable.`,

  'Beauty & Wellness': `
CATEGORY CONTEXT: Salons and spas book 40-60% of appointments digitally in urban India. WhatsApp booking is the norm but walk-ins are still common.
The gap: Instagram presence without a booking link wastes social media effort.
Google visibility matters because "best salon near me" searches spike on Thursday-Friday before weekends.
Seasonal hooks: wedding season (Nov-Feb), Diwali, summer.`,

  'Real Estate': `
CATEGORY CONTEXT: Property buyers research at night on weekends. They visit 3-5 projects online before agreeing to a site visit. A developer with no website or poor website loses the shortlisting round before any agent call.
Post-pandemic: 70%+ of HNI buyers expect a virtual tour or at minimum a detailed digital brochure before committing to a site visit.
The hook: "How many inquiries are you getting from Google vs referrals?"
Most developers don't know — and the answer surprises them.`,

  Education: `
CATEGORY CONTEXT: Parents research coaching institutes and schools before admissions in two peak seasons: March-April (board results) and October-November (planning ahead).
Key pain: institutes with no Google reviews lose to competitors with 50+ reviews even if quality is higher.
Trust signals matter: faculty credentials, batch results, demo class availability.
The hook: "Are parents finding your coaching center when they search [subject] coaching in [area]?"`,

  'Food & Dining': `
CATEGORY CONTEXT: Restaurants and cafes face a unique challenge: Zomato/Swiggy take 20-30% commission on every order. Direct orders (WhatsApp, Google order button) cost nothing.
The hook for web/digital services: "Are you getting direct orders, or is Zomato taking commission on everything?"
For SEO/local: lunch hour and weekend searches spike. Being in the top 3 results for "[cuisine] in [area]" is worth more than any paid ad.`,

  'Finance & Legal': `
CATEGORY CONTEXT: CAs, lawyers, and financial consultants get clients through referrals primarily. The digital opportunity is in capturing second-degree referrals — when someone asks a friend for a CA recommendation and the friend Googles the CA they mentioned to confirm credibility.
The hook: "If someone Googles your firm's name, what do they see?"
A Google profile with no reviews and no website loses credibility.`,

  Technology: `
CATEGORY CONTEXT: Tech companies found via Google are evaluated on their portfolio and case studies before any call is made.
The pain: many IT companies have good client work but poor case study documentation, meaning prospects can't evaluate them online.
The hook: "How do your prospects typically evaluate you before the first meeting?"`,

  'Daily Services': `
CATEGORY CONTEXT: Plumbers, electricians, carpenters get called in emergencies.
Emergency decisions = person who shows up first on Google.
The search pattern: "[service] near me" at 8pm with a leaking pipe.
The hook: "When someone in [area] searches for emergency [service], are you appearing in the top results?"`,

  'Retail & Shopping': `
CATEGORY CONTEXT: Retail in India is going omni-channel fast. Physical stores that don't appear in "near me" Google searches are losing foot traffic to those that do.
The hook: "Are you appearing when people search for [product type] in [area]?"`,

  'Events & Entertainment': `
CATEGORY CONTEXT: Event businesses (photographers, DJs, caterers, venues) are booked 3-6 months in advance. The discovery happens via Google + Instagram.
Wedding season (Nov-Feb) and festival season (Oct-Nov) drive 60-70% of bookings.
The hook: "How are couples or event planners finding you currently? Are they coming from Instagram, Google, or mostly word of mouth?"`,

  Other: `
CATEGORY CONTEXT: No specific category data available. Use the business's city and area to make the message feel local.
Reference the fact that [area] is a competitive location for their type of business — standing out online matters more in dense urban markets.`
};

interface OutreachInput {
  bizName: string;
  bizCategory: string;
  parentCategory: string;
  area: string;
  city: string;
  rating: number | null;
  reviewCount: number | null;
  hasWebsite: boolean;
  website: string | null;
  hasEmail: boolean;
  
  senderName: string;
  senderCompany: string;
  senderRole: string;
  senderService: string;
  portfolioUrl: string | null;
  bookingUrl: string | null;
  
  channel: 'whatsapp' | 'email' | 'instagram';
  language: 'hinglish' | 'english';
  tone: 'friendly' | 'professional' | 'direct';

  regenerateDay?: 'day1' | 'day3' | 'day7';
  existingDay1?: string;
  existingDay3?: string;
  existingDay7?: string;
}

function countWords(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function trimMessage(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
  let result = "";
  let count = 0;
  for (const s of sentences) {
    const sWords = s.trim().split(/\s+/).filter(Boolean).length;
    if (count + sWords <= maxWords) {
      result += s;
      count += sWords;
    } else {
      break;
    }
  }
  if (!result) {
    result = words.slice(0, maxWords).join(" ") + " ...";
  } else if (count < words.length) {
    result = result.trim() + " ...";
  }
  return result;
}

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
    const { professional_id, channel, language, tone, regenerate_day, existing_day1, existing_day3, existing_day7 } = payload;
    
    if (!professional_id) {
      return new Response(JSON.stringify({ error: 'Professional ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Load user profile personalization settings
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('subscription_tier, monthly_ai_generations_used, monthly_ai_generations_limit, full_name, company_name, portfolio_url, booking_url, role, survey_role, sender_service_blurb')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      throw new Error(`Profile loading failed: ${profileErr?.message || 'not found'}`);
    }

    // Check limits
    const allowedTiers = ['scout', 'hunter', 'agency', 'enterprise'];
    const currentTier = (profile.subscription_tier || 'free').toLowerCase();
    if (!allowedTiers.includes(currentTier)) {
      return new Response(JSON.stringify({ 
        error: 'AI Outreach generation requires the Scout, Hunter or Agency plan.' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const maxLimit = profile.monthly_ai_generations_limit ?? 500;
    const currentUsed = profile.monthly_ai_generations_used ?? 0;
    
    if (currentTier === 'scout' && currentUsed >= 10) {
      return new Response(JSON.stringify({ 
        error: 'Aapne Scout plan ke 10 free AI pitches complete kar liye hain. Upgrade to Hunter to unlock 500 pitches/month!' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (currentTier === 'hunter' && currentUsed >= maxLimit) {
      return new Response(JSON.stringify({ 
        error: `You have reached your limit of ${maxLimit} AI generations this month.` 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Fetch lead details
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

    // 5. Signal analysis & context assembly
    const r = lead.rating;
    const rv = lead.review_count;
    const hasWebsite = !!lead.website;
    const hasEmail = !!lead.email;
    const hookType = selectHookType(r, rv, hasWebsite, hasEmail);
    const hookInstruction = HOOK_INSTRUCTIONS[hookType];
    const parentCat = lead.parent_category || "Other";
    const painPoint = CATEGORY_PAIN_POINTS[parentCat] || CATEGORY_PAIN_POINTS['Other'];

    // Map role
    const rawRole = profile.role || profile.survey_role || "freelancer";
    const roleMap: Record<string, string> = {
      web_developer: "Web Developer",
      seo_marketer: "SEO Marketer",
      finance_ca: "Chartered Accountant",
      real_estate: "Real Estate Consultant",
      sales_team: "Sales Representative",
      startup: "Startup Founder",
      freelancer: "Web Developer"
    };
    const senderRole = roleMap[rawRole] || "Business Consultant";
    const senderService = profile.sender_service_blurb || "I build high converting websites for local businesses";

    const inputData: OutreachInput = {
      bizName: lead.name,
      bizCategory: lead.category || lead.parent_category || "business",
      parentCategory: parentCat,
      area: lead.area || "Mumbai",
      city: "Mumbai",
      rating: r,
      reviewCount: rv,
      hasWebsite: hasWebsite,
      website: lead.website,
      hasEmail: hasEmail,
      senderName: profile.full_name || "Shri",
      senderCompany: profile.company_name || "NearPro Agency",
      senderRole: senderRole,
      senderService: senderService,
      portfolioUrl: profile.portfolio_url,
      bookingUrl: profile.booking_url,
      channel: channel || 'whatsapp',
      language: language || 'hinglish',
      tone: tone || 'friendly',
      regenerateDay: regenerate_day,
      existingDay1: existing_day1,
      existingDay3: existing_day3,
      existingDay7: existing_day7
    };

    // Construct instructions
    let promptInstructions = "";
    if (inputData.language === 'hinglish') {
      promptInstructions = `Write a Hinglish message. Use a natural, friendly mix of Hindi and English written in the Latin alphabet (e.g. "Aapka Google Maps profile dekha, kaafi achha reviews hain par..."). Ensure you write in a highly conversational and respectful tone, using "Aap" instead of "Tum".`;
    } else {
      promptInstructions = `Write the message in clear, engaging English. Keep the tone natural and professional.`;
    }

    let channelFormat = "";
    if (inputData.channel === 'whatsapp') {
      channelFormat = `Make the draft suitable for a quick WhatsApp chat. Keep it short (under 75 words), use single line spaces, and insert emojis to make it friendly. Use bold markdown (*text*) for key metrics (like rating or reviews) to grab attention. Avoid paragraphs; make it look like a chat message.`;
    } else {
      channelFormat = `Make the draft suitable for an email. Include a catchy, personalized Subject line at the beginning (e.g. "Subject: Quick question about [business name]"). Keep it concise (under 180 words) with clear spacing.`;
    }

    const reviewText = inputData.reviewCount ? `${inputData.reviewCount}+ reviews` : 'some reviews';
    
    // Master prompt assembly
    let masterPrompt = `
You are ${inputData.senderName}, ${inputData.senderRole} at ${inputData.senderCompany}.
You are writing a REAL personal message to the owner of "${inputData.bizName}", a ${inputData.bizCategory} business in ${inputData.area}, ${inputData.city}.

You found their business on Google and you are reaching out because you genuinely noticed something specific about them.

THEIR PROFILE DATA:
- Rating: ${inputData.rating ? `${inputData.rating} stars` : 'not available'}
- Reviews: ${reviewText}
- Website: ${inputData.hasWebsite ? `Yes — ${inputData.website}` : 'No website found'}
- Email: ${inputData.hasEmail ? 'Yes' : 'Not listed publicly'}

HOOK TO USE FOR THIS BUSINESS:
${hookInstruction}

INDUSTRY CONTEXT (use this knowledge, do not quote it directly):
${painPoint}

SENDER CONTEXT:
- What ${inputData.senderName} offers: ${inputData.senderService}
- Portfolio/demo link: ${inputData.portfolioUrl || 'not provided'}
- Booking link: ${inputData.bookingUrl || 'not provided'}
- Tone: ${inputData.tone}

WHAT TO GENERATE:
Generate exactly THREE messages as a sequence. Label them clearly.

───────────────────────────────────
MESSAGE 1: DAY 1 — INITIAL OUTREACH
Channel: ${inputData.channel}
Language: ${inputData.language}
Word limit: ${inputData.channel === 'whatsapp' ? '120 words maximum' : '280 words maximum'}
${inputData.channel === 'email' ? 'Generate THREE catchy, personalized subject line options (A, B, C) above the email body.' : ''}

GOLD-STANDARD PITCH LAYOUT TO FOLLOW:
Model your output on this high-converting structure:

1. Warm & Natural Introduction:
   "Hi, ${inputData.senderName} here from ${inputData.senderCompany}."

2. Genuine Compliment & Data Observation:
   Compliment their specific rating and review count.
   (e.g., "I came across ${inputData.bizName} and noticed you have a ${inputData.rating ? `${inputData.rating}⭐` : 'fantastic'} Google rating, which is brilliant.")

3. Strategic Opportunity Gap:
   Highlight why competitors with more reviews or website presence rank higher for searches in their category.
   (e.g., "However, with only ${inputData.reviewCount ? `${inputData.reviewCount}` : 'a few'} Google reviews, competitors with lower ratings but more reviews often end up ranking higher for ${inputData.bizCategory} searches in ${inputData.area}.")

4. Empathy Question:
   "This made me wonder... Are most of your enquiries currently coming through word of mouth and referrals?"

5. Concept / Demo Showcase (Include URL if provided or sample demo link):
   "While looking into your business, we also created a sample website concept to show how your online presence could be enhanced and how potential customers could have a smoother enquiry experience."
   🌐 Sample Website Concept: ${inputData.portfolioUrl || 'https://celestial-gatherings-co.lovable.app/'}
   "This is just a concept created specifically for ${inputData.bizName} to demonstrate what's possible."

6. Value Offer & Free Consultation CTA:
   "If you'd like, I'd be happy to walk you through a few ideas on how AI automation and a stronger digital presence can help generate more enquiries, streamline follow ups, and convert more visitors into bookings."
   🎁 Your first consultation is completely FREE.
   📅 Book your complimentary consultation: ${inputData.bookingUrl || 'https://topmate.io/shriraj_naik_21/2167683'}

7. Professional Social Proof Footer:
   🌐 S8N Website: https://s8n.in
   💼 LinkedIn: https://www.linkedin.com/company/s8n-ai-services/

   Looking forward to connecting.

   ${inputData.senderName}
   ${inputData.senderRole}, ${inputData.senderCompany}

───────────────────────────────────
MESSAGE 2: DAY 3 — FOLLOW-UP (if no reply)
Channel: ${inputData.channel}
Language: ${inputData.language}
Word limit: ${inputData.channel === 'whatsapp' ? '60 words MAXIMUM' : '120 words maximum'}

This message must take a DIFFERENT ANGLE than Message 1.
Do not repeat the same observation. Do not say "Just following up."
Instead: add ONE new piece of value or social proof (e.g. how similar ${inputData.bizCategory} businesses in ${inputData.area} automated their customer enquiries).
End with the complimentary consultation booking link: ${inputData.bookingUrl || 'https://topmate.io/shriraj_naik_21/2167683'}

───────────────────────────────────
MESSAGE 3: DAY 7 — FINAL TOUCH
Channel: ${inputData.channel}
Language: ${inputData.language}
Word limit: ${inputData.channel === 'whatsapp' ? '50 words MAXIMUM' : '90 words maximum'}

This is the last message. Make it human, warm, and low-pressure.
Acknowledge it may not be the right time, leave the door open, and provide ${inputData.senderName}'s direct booking link for future reference.

───────────────────────────────────

ABSOLUTE RULES (violations will cause the output to be rejected):

FORBIDDEN — never use these in any of the three messages:
- "Hope this finds you well" or any variation
- "I wanted to reach out" 
- "Touching base" / "Following up" (Day 3 especially)
- "Please feel free to"
- "Synergy" / "Leverage" / "Value-add" 
- "Dear Sir/Madam" / "To Whom It May Concern"
- Starting any sentence with "I" as the first word
- Mentioning that you are an AI or that this is a template
- Brackets or placeholder text like "[Your Name]" or "[Insert]"
- Hyphens in normal sentence prose — use "to", spaces, commas, or new lines instead. (NOTE: Hyphens inside valid web URLs like celestial-gatherings-co or s8n-ai-services are ALLOWED and must be preserved!).

REQUIRED:
- Language Requirement: ${promptInstructions}
- Channel Format: ${channelFormat}
- Paragraph Spacing: Use double line breaks (\n\n) to create clean paragraphs. Always structure with clear paragraph spacing. Never output a single continuous block of text without line breaks.
- Every message must feel like it was written specifically for THIS business
- Use their business name naturally at least once in Message 1
- If Hinglish: write in Latin script, use "Aap" not "Tum", mix Hindi naturally (not translated English)
- If English: conversational, not corporate
- WhatsApp messages: short paragraphs of 1-2 lines each, with a blank line between them
- Email: must include a subject line. Three options (A/B/C) only for Message 1. Messages 2 and 3: one subject line each with "Re:" prefix
`;

    // Handle single-message regeneration modification
    if (inputData.regenerateDay) {
      masterPrompt += `
───────────────────────────────────
REGENERATION TASK:
You are asked to regenerate ONLY the message for "${inputData.regenerateDay}".
Keep the other messages exactly identical to the existing messages provided below:
- Existing Day 1: ${inputData.existingDay1 || 'none'}
- Existing Day 3: ${inputData.existingDay3 || 'none'}
- Existing Day 7: ${inputData.existingDay7 || 'none'}

Generate a fresh version of ${inputData.regenerateDay} using a different angle/copy but preserving the same hook type, format and constraints.
`;
    }

    masterPrompt += `
OUTPUT FORMAT — return ONLY this JSON structure, nothing else:
{
  "hook_type": "${hookType}",
  "day1": {
    "subject_a": "(email subject option A, else null)",
    "subject_b": "(email subject option B, else null)", 
    "subject_c": "(email subject option C, else null)",
    "message": "(Day 1 body text)"
  },
  "day3": {
    "subject": "(email subject with 'Re:', else null)",
    "message": "(Day 3 body text)"
  },
  "day7": {
    "subject": "(email subject with 'Re:', else null)",
    "message": "(Day 7 body text)"
  }
}
`;

    const defaultGeminiKey = Deno.env.get('GEMINI_API_KEY');
    const paidGeminiKey = Deno.env.get('GEMINI_PAID_API_KEY');

    if (!defaultGeminiKey && !paidGeminiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set in Supabase");
    }

    const modelsToTry = [
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-2.0-flash',
      'gemini-3.1-flash-lite',
      'gemini-pro-latest'
    ];

    const keysToTry: { key: string; label: string }[] = [];
    if (defaultGeminiKey) keysToTry.push({ key: defaultGeminiKey, label: 'Free/Default API Key' });
    if (paidGeminiKey && paidGeminiKey !== defaultGeminiKey) keysToTry.push({ key: paidGeminiKey, label: 'Paid Backup API Key' });

    let attempt = 0;
    let finalJSON: any = null;

    // Retry loop up to 3 times to ensure word limit and JSON schema compliance
    while (attempt < 3) {
      attempt++;
      let response: Response | null = null;
      let lastError: Error | null = null;

      outerLoop:
      for (const keyObj of keysToTry) {
        for (const modelName of modelsToTry) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${keyObj.key}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000); // Allow up to 25s for active generation completion

            const res = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                contents: [{ parts: [{ text: masterPrompt }] }],
                generationConfig: {
                  temperature: 0.7,
                  responseMimeType: "application/json"
                }
              })
            });
            clearTimeout(timeoutId);

            if (res.status === 200) {
              response = res;
              break outerLoop;
            } else {
              const errText = await res.text();
              lastError = new Error(`Gemini API error (${keyObj.label} / ${modelName}): ${res.status} - ${errText}`);
            }
          } catch (err) {
            lastError = err;
          }
        }
      }

      if (!response) {
        throw lastError || new Error("All attempts to call Gemini API across models and keys failed");
      }

      let resData;
      try {
        resData = await response.json();
      } catch (jsonErr) {
        const textBody = await response.text();
        throw new Error(`Failed to parse Gemini response as JSON. Body: ${textBody.slice(0, 500)}`);
      }
      let rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Clean markdown code blocks
      rawText = rawText.trim();
      if (rawText.startsWith("```")) {
        rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }

      try {
        const parsed = JSON.parse(rawText);
        
        // Remove trailing or accidental hyphens if AI slipped
        const removeHyphens = (t: string) => t ? t.replace(/-/g, " ") : "";
        if (parsed.day1) parsed.day1.message = removeHyphens(parsed.day1.message);
        if (parsed.day3) parsed.day3.message = removeHyphens(parsed.day3.message);
        if (parsed.day7) parsed.day7.message = removeHyphens(parsed.day7.message);

        // Word count verification loop
        const w1 = countWords(parsed.day1?.message || "");
        const w3 = countWords(parsed.day3?.message || "");
        const w7 = countWords(parsed.day7?.message || "");

        const lim1 = inputData.channel === 'whatsapp' ? 75 : 150;
        const lim3 = inputData.channel === 'whatsapp' ? 50 : 100;
        const lim7 = inputData.channel === 'whatsapp' ? 40 : 80;

        if (w1 <= lim1 && w3 <= lim3 && w7 <= lim7) {
          finalJSON = parsed;
          break; // Perfect compliance!
        } else {
          console.warn(`Attempt ${attempt} failed word limits. Day 1: ${w1}/${lim1}, Day 3: ${w3}/${lim3}, Day 7: ${w7}/${lim7}. Retrying...`);
          if (attempt === 3) {
            // Apply sentence level trimming as a final defensive gate
            parsed.day1.message = trimMessage(parsed.day1.message, lim1);
            parsed.day3.message = trimMessage(parsed.day3.message, lim3);
            parsed.day7.message = trimMessage(parsed.day7.message, lim7);
            finalJSON = parsed;
          }
        }
      } catch (err) {
        console.error(`Attempt ${attempt} JSON parse failure: `, err);
        if (attempt === 3) throw err;
      }
    }

    // 6. Increment AI usage stats
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

    // 7. Send final structured JSON
    return new Response(JSON.stringify({ 
      hook_type: finalJSON.hook_type || hookType,
      day1: finalJSON.day1,
      day3: finalJSON.day3,
      day7: finalJSON.day7,
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
