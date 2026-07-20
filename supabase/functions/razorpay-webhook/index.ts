import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

async function verifyRazorpaySignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify", "sign"]
    );
    const data = encoder.encode(body);
    const signatureBytes = new Uint8Array(
      signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    return await crypto.subtle.verify("HMAC", key, signatureBytes, data);
  } catch (e) {
    console.error("Signature verification error:", e);
    return false;
  }
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? "";
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get("X-Razorpay-Signature") || "";
    const rawBody = await req.text();
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "";

    if (webhookSecret) {
      if (!signature) {
        console.warn("Unauthorized: Razorpay signature header missing");
        return new Response("Unauthorized: Signature missing", { status: 401 });
      }
      const isVerified = await verifyRazorpaySignature(rawBody, signature, webhookSecret);
      if (!isVerified) {
        console.warn("Unauthorized: Razorpay signature verification failed");
        return new Response("Unauthorized: Signature mismatch", { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const rzpSubscription = payload.payload?.subscription?.entity;

    if (!event || !rzpSubscription) {
      return new Response("Invalid payload", { status: 400 });
    }

    console.log(`Received Webhook event: ${event} for subscription: ${rzpSubscription.id}`);

    const subscriptionId = rzpSubscription.id;
    const planId = rzpSubscription.plan_id;
    const status = rzpSubscription.status; // 'active', 'cancelled', 'completed', 'halted'

    // Determine target tier from monthly and yearly plan maps
    let tier = 'free';
    const scoutMonthly = Deno.env.get('RAZORPAY_PLAN_SCOUT_MONTHLY') ?? "plan_scout_monthly_default";
    const scoutYearly = Deno.env.get('RAZORPAY_PLAN_SCOUT_YEARLY') ?? "plan_scout_yearly_default";
    const hunterMonthly = Deno.env.get('RAZORPAY_PLAN_HUNTER_MONTHLY') ?? "plan_hunter_monthly_default";
    const hunterYearly = Deno.env.get('RAZORPAY_PLAN_HUNTER_YEARLY') ?? "plan_hunter_yearly_default";
    const agencyMonthly = Deno.env.get('RAZORPAY_PLAN_AGENCY_MONTHLY') ?? "plan_agency_monthly_default";
    const agencyYearly = Deno.env.get('RAZORPAY_PLAN_AGENCY_YEARLY') ?? "plan_agency_yearly_default";

    if (planId === scoutMonthly || planId === scoutYearly) tier = 'scout';
    else if (planId === hunterMonthly || planId === hunterYearly) tier = 'hunter';
    else if (planId === agencyMonthly || planId === agencyYearly) tier = 'agency';

    let updateData: Record<string, any> = {
      subscription_status: status,
      updated_at: new Date().toISOString()
    };

    if (event === 'subscription.charged') {
      const endsAt = new Date(rzpSubscription.current_end * 1000).toISOString();
      updateData = {
        ...updateData,
        tier: tier,
        subscription_tier: tier,
        subscription_status: 'active',
        subscription_ends_at: endsAt
      };
    } else if (event === 'subscription.cancelled' || event === 'subscription.halted') {
      updateData = {
        ...updateData,
        subscription_status: status
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('razorpay_subscription_id', subscriptionId)
      .select();

    if (error) {
      console.error("Failed to update profile via webhook: ", error);
      return new Response(`Database update failed: ${error.message}`, { status: 500 });
    }

    console.log(`Successfully updated profiles for subscription ${subscriptionId}`);
    return new Response("ok", { status: 200 });

  } catch (err) {
    console.error("Webhook processing error: ", err);
    return new Response(`Internal server error: ${err.message}`, { status: 500 });
  }
});
