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

    // Zoho CRM webhooks can send data as JSON or as query parameters
    let payload: any = null;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      // Fallback to reading URL parameters for test webhooks
      const url = new URL(req.url);
      const leadId = url.searchParams.get("lead_id");
      const status = url.searchParams.get("status");
      if (leadId && status) {
        payload = {
          data: [{
            id: leadId,
            Lead_Status: status
          }]
        };
      }
    }

    if (!payload || !payload.data || payload.data.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid webhook payload structure" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const records = payload.data;
    let updateCount = 0;

    for (const record of records) {
      const zohoLeadId = record.id;
      const zohoStatus = record.Lead_Status;

      if (!zohoLeadId || !zohoStatus) continue;

      // Map Zoho Lead Status string to NearPro pipeline status
      let nearproStatus = 'new';
      const cleanStatus = zohoStatus.toLowerCase().trim();

      if (cleanStatus.includes("attempted") || cleanStatus === "contacted") {
        nearproStatus = 'contacted';
      } else if (cleanStatus.includes("proposal") || cleanStatus.includes("offer") || cleanStatus === "interested") {
        nearproStatus = 'responded';
      } else if (cleanStatus.includes("won") || cleanStatus.includes("converted") || cleanStatus === "qualified") {
        nearproStatus = 'converted';
      } else if (cleanStatus.includes("lost") || cleanStatus.includes("closed") || cleanStatus.includes("not interested")) {
        nearproStatus = 'closed';
      }

      // Update the matching saved lead in database
      const { data, error } = await supabase
        .from('saved_leads')
        .update({
          status: nearproStatus,
          zoho_deal_stage: zohoStatus,
          updated_at: new Date().toISOString()
        })
        .eq('zoho_lead_id', zohoLeadId)
        .select();

      if (!error && data && data.length > 0) {
        updateCount += data.length;
      }
    }

    return new Response(JSON.stringify({ success: true, updated: updateCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Zoho Webhook Error: ", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
