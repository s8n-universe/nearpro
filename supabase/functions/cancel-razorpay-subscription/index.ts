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

    // Get current profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const subscriptionId = profile.razorpay_subscription_id;

    if (!subscriptionId) {
      return new Response(JSON.stringify({ error: 'No active subscription found to cancel' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const isMock = subscriptionId.startsWith('sub_mock_');

    if (isMock) {
      // Mock cancellation: Update profile immediately
      const { data: updatedProfile, error: updateErr } = await supabase
        .from('profiles')
        .update({
          tier: 'free',
          subscription_tier: 'free',
          subscription_status: 'cancelled',
          razorpay_subscription_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      return new Response(JSON.stringify({
        success: true,
        message: 'Mock subscription cancelled successfully',
        profile: updatedProfile
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Real Razorpay subscription cancellation
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') ?? "";
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? "";

    if (!razorpayKeyId || !razorpayKeySecret) {
      // Fallback if credentials are missing
      const { data: updatedProfile, error: updateErr } = await supabase
        .from('profiles')
        .update({
          tier: 'free',
          subscription_tier: 'free',
          subscription_status: 'cancelled',
          razorpay_subscription_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      return new Response(JSON.stringify({
        success: true,
        message: 'Subscription cancelled locally (Razorpay config missing)',
        profile: updatedProfile
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Call Razorpay API to cancel
    const razorpayEndpoint = `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`;
    const res = await fetch(razorpayEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`
      },
      body: JSON.stringify({
        cancel_at_cycle_end: 0 // Cancel immediately
      })
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.warn(`Razorpay API cancel returned non-200: ${res.status} - ${errBody}`);
    }

    // Update profile in local database
    const { data: updatedProfile, error: updateErr } = await supabase
      .from('profiles')
      .update({
        tier: 'free',
        subscription_tier: 'free',
        subscription_status: 'cancelled',
        razorpay_subscription_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({
      success: true,
      message: 'Subscription cancelled successfully on Razorpay and local profile updated',
      profile: updatedProfile
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Razorpay subscription cancellation error: ", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
