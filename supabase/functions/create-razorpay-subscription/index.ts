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

    // Get Auth user
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

    const { plan_id, interval } = await req.json();
    if (!plan_id) {
      return new Response(JSON.stringify({ error: 'Plan ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const plan = plan_id.trim().toLowerCase();
    const cycle = (interval || 'monthly').trim().toLowerCase();

    // Map plans to pricing
    const planPricing: Record<string, Record<string, { price: number; name: string }>> = {
      scout: {
        monthly: { price: 499, name: "Scout Plan (Monthly)" },
        yearly: { price: 4999, name: "Scout Plan (Yearly)" }
      },
      hunter: {
        monthly: { price: 999, name: "Hunter Plan (Monthly)" },
        yearly: { price: 9999, name: "Hunter Plan (Yearly)" }
      },
      agency: {
        monthly: { price: 2499, name: "Agency Plan (Monthly)" },
        yearly: { price: 24999, name: "Agency Plan (Yearly)" }
      }
    };

    const targetPlan = planPricing[plan]?.[cycle];
    if (!targetPlan) {
      return new Response(JSON.stringify({ error: 'Invalid plan or billing cycle selected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') ?? "";
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? "";

    if (!razorpayKeyId || !razorpayKeySecret) {
      // --- MOCK CHECKOUT MODE (Credential missing) ---
      console.log(`Razorpay credentials missing. Running mock checkout activation for: ${plan} (${cycle})`);
      
      const startDate = new Date();
      const days = cycle === 'yearly' ? 365 : 30;
      const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          tier: plan,
          subscription_tier: plan,
          subscription_status: 'active',
          subscription_started_at: startDate.toISOString(),
          subscription_ends_at: endDate.toISOString(),
          razorpay_subscription_id: `sub_mock_${Math.random().toString(36).slice(2, 10)}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateErr) throw updateErr;

      return new Response(JSON.stringify({
        mock: true,
        message: `${targetPlan.name} activated successfully under test mode`,
        status: 'active',
        subscription_id: `sub_mock_${Math.random().toString(36).slice(2, 10)}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- REAL RAZORPAY SUBSCRIPTION CREATION ---
    const planIdMap: Record<string, Record<string, string>> = {
      scout: {
        monthly: Deno.env.get('RAZORPAY_PLAN_SCOUT_MONTHLY') ?? "plan_scout_monthly_default",
        yearly: Deno.env.get('RAZORPAY_PLAN_SCOUT_YEARLY') ?? "plan_scout_yearly_default"
      },
      hunter: {
        monthly: Deno.env.get('RAZORPAY_PLAN_HUNTER_MONTHLY') ?? "plan_hunter_monthly_default",
        yearly: Deno.env.get('RAZORPAY_PLAN_HUNTER_YEARLY') ?? "plan_hunter_yearly_default"
      },
      agency: {
        monthly: Deno.env.get('RAZORPAY_PLAN_AGENCY_MONTHLY') ?? "plan_agency_monthly_default",
        yearly: Deno.env.get('RAZORPAY_PLAN_AGENCY_YEARLY') ?? "plan_agency_yearly_default"
      }
    };

    const razorpayPlanId = planIdMap[plan]?.[cycle];
    const totalCount = cycle === 'yearly' ? 5 : 12; // 5 years max vs 12 months renew
    
    const razorpayEndpoint = "https://api.razorpay.com/v1/subscriptions";
    const res = await fetch(razorpayEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`
      },
      body: JSON.stringify({
        plan_id: razorpayPlanId,
        total_count: totalCount,
        quantity: 1,
        customer_notify: 1
      })
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Razorpay API error: ${res.status} - ${errBody}`);
    }

    const rzpSubscription = await res.json();

    return new Response(JSON.stringify({
      mock: false,
      subscription_id: rzpSubscription.id,
      key_id: razorpayKeyId,
      amount: targetPlan.price * 100, // in paise
      name: "NearPro Lead Intelligence",
      description: targetPlan.name,
      prefill: {
        email: user.email
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Razorpay subscription error: ", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
