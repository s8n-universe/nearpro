import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const accountsUrlMap: Record<string, string> = {
  in: 'https://accounts.zoho.in',
  com: 'https://accounts.zoho.com',
  eu: 'https://accounts.zoho.eu',
  au: 'https://accounts.zoho.com.au',
  jp: 'https://accounts.zoho.jp',
}

const apiBaseUrlMap: Record<string, string> = {
  in: 'https://www.zohoapis.in',
  com: 'https://www.zohoapis.com',
  eu: 'https://www.zohoapis.eu',
  au: 'https://www.zohoapis.com.au',
  jp: 'https://www.zohoapis.jp',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? "";
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Auth Header
    const authHeader = req.headers.get('Authorization') ?? "";
    const jwt = authHeader.replace('Bearer ', '').trim();
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Missing authorization token" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Authenticate the user calling this function
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user session" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { action, saved_lead_id, status, leads, credentials, region, list_id } = await req.json();

    if (action === 'save_credentials') {
      const { refresh_token, client_id, client_secret, region: targetRegion } = credentials ?? {};
      if (!refresh_token) {
        return new Response(JSON.stringify({ error: "Refresh token is required" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const activeRegion = targetRegion ?? 'in';

      // Save to credentials table (service role)
      const { error: dbError } = await supabase
        .from('zoho_credentials')
        .upsert({
          user_id: user.id,
          refresh_token,
          client_id: client_id ?? null,
          client_secret: client_secret ?? null,
          region: activeRegion,
          updated_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      // Update client visible profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          zoho_auto_sync_enabled: true,
          zoho_region: activeRegion,
          zoho_last_sync_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      return new Response(JSON.stringify({ success: true, message: "Zoho credentials stored successfully" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch user Zoho credentials
    const { data: creds, error: credsError } = await supabase
      .from('zoho_credentials')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (credsError || !creds) {
      return new Response(JSON.stringify({ error: "Zoho credentials not found. Connect your account in Connection Hub." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Refresh Token Flow Helper
    const getAccessToken = async () => {
      const now = new Date();
      if (creds.access_token && creds.access_token_expires_at && new Date(creds.access_token_expires_at) > now) {
        return creds.access_token;
      }

      // We need to refresh the token
      const clientId = creds.client_id || Deno.env.get('ZOHO_CLIENT_ID') || "";
      const clientSecret = creds.client_secret || Deno.env.get('ZOHO_CLIENT_SECRET') || "";
      const userRegion = creds.region || 'in';
      const accountsUrl = accountsUrlMap[userRegion] || accountsUrlMap.in;

      if (!clientId || !clientSecret) {
        throw new Error("Missing Zoho Client ID or Client Secret credentials");
      }

      const params = new URLSearchParams();
      params.append('refresh_token', creds.refresh_token);
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('grant_type', 'refresh_token');

      const tokenRes = await fetch(`${accountsUrl}/oauth/v2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        throw new Error(`Zoho token refresh failed: ${tokenRes.status} ${errorText}`);
      }

      const tokenData = await tokenRes.json();
      if (tokenData.error) {
        throw new Error(`Zoho token refresh payload error: ${tokenData.error}`);
      }

      const accessToken = tokenData.access_token;
      const expiresIn = tokenData.expires_in || 3600; // in seconds
      const expiresAt = new Date(Date.now() + (expiresIn - 60) * 1000).toISOString(); // 1 minute buffer

      // Cache new access token
      await supabase
        .from('zoho_credentials')
        .update({
          access_token: accessToken,
          access_token_expires_at: expiresAt,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      return accessToken;
    };

    const accessToken = await getAccessToken();
    const userRegion = creds.region || 'in';
    const apiBaseUrl = apiBaseUrlMap[userRegion] || apiBaseUrlMap.in;

    if (action === 'push_lead') {
      if (!saved_lead_id) {
        return new Response(JSON.stringify({ error: "saved_lead_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Fetch saved lead details joined with professional info
      const { data: savedLead, error: leadError } = await supabase
        .from('saved_leads')
        .select(`
          id,
          status,
          zoho_lead_id,
          professionals (
            id,
            name,
            category,
            address,
            area,
            phone,
            website,
            email,
            rating,
            review_count
          )
        `)
        .eq('id', saved_lead_id)
        .single();

      if (leadError || !savedLead) {
        throw new Error("Saved lead details could not be found");
      }

      const p = savedLead.professionals;
      if (!p) throw new Error("Professional profile associated with lead is missing");

      // Map NearPro pipeline stage to Zoho Lead Status field
      let leadStatus = 'None';
      if (status === 'contacted') leadStatus = 'Attempted to Contact';
      else if (status === 'responded') leadStatus = 'Contacted';
      else if (status === 'converted') leadStatus = 'Contacted';
      else if (status === 'closed') leadStatus = 'Lost Lead';

      // Check if audit details exist in audit_cache
      let auditScore = "";
      let estLostRevenue = "";
      if (p.website) {
        const { data: cachedAudit } = await supabase
          .from('audit_cache')
          .select('*')
          .eq('url', p.website.trim().toLowerCase())
          .maybeSingle();

        if (cachedAudit) {
          auditScore = String(cachedAudit.page_speed_score || "");
          estLostRevenue = String(cachedAudit.est_lost_revenue_per_month || "");
        }
      }

      const leadPayload = {
        data: [{
          First_Name: p.name.split(' ')[0],
          Last_Name: p.name.split(' ').slice(1).join(' ') || '.',
          Email: p.email || "",
          Phone: p.phone || "",
          Company: p.name || "",
          City: p.area || "",
          Street: p.address || "",
          Lead_Status: leadStatus,
          Description: `Source: NearPro Lead Discovery. Rating: ${p.rating || 0} (${p.review_count || 0} reviews). Category: ${p.category || ""}. PageSpeed Score: ${auditScore}. Estimated monthly revenue loss: INR ${estLostRevenue}.`
        }]
      };

      let zohoLeadId = savedLead.zoho_lead_id;
      let zohoRes;

      if (zohoLeadId) {
        // Update existing lead in Zoho
        leadPayload.data[0]['id'] = zohoLeadId;
        zohoRes = await fetch(`${apiBaseUrl}/crm/v2/Leads`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Zoho-oauthtoken ${accessToken}`
          },
          body: JSON.stringify(leadPayload)
        });
      } else {
        // Create new lead in Zoho
        zohoRes = await fetch(`${apiBaseUrl}/crm/v2/Leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Zoho-oauthtoken ${accessToken}`
          },
          body: JSON.stringify(leadPayload)
        });
      }

      if (!zohoRes.ok) {
        const errorText = await zohoRes.text();
        throw new Error(`Zoho API call failed: ${zohoRes.status} ${errorText}`);
      }

      const resData = await zohoRes.json();
      const actionResult = resData.data?.[0];
      if (actionResult?.status === 'error') {
        throw new Error(`Zoho API response error: ${actionResult.message}`);
      }

      const newZohoId = actionResult?.details?.id || zohoLeadId;

      // Update saved_leads table
      await supabase
        .from('saved_leads')
        .update({
          zoho_lead_id: newZohoId,
          zoho_last_synced_at: new Date().toISOString(),
          zoho_deal_stage: leadStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', saved_lead_id);

      // Increment profile count
      const { data: profileObj } = await supabase
        .from('profiles')
        .select('zoho_sync_count')
        .eq('id', user.id)
        .single();
      const newCount = (profileObj?.zoho_sync_count || 0) + 1;

      await supabase
        .from('profiles')
        .update({
          zoho_sync_count: newCount,
          zoho_last_sync_at: new Date().toISOString()
        })
        .eq('id', user.id);

      return new Response(JSON.stringify({ success: true, zoho_lead_id: newZohoId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'batch_push_leads') {
      if (!list_id) {
        return new Response(JSON.stringify({ error: "list_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Fetch all leads in this list
      const { data: savedLeads, error: listError } = await supabase
        .from('saved_leads')
        .select(`
          id,
          status,
          zoho_lead_id,
          professionals (
            id,
            name,
            category,
            address,
            area,
            phone,
            website,
            email,
            rating,
            review_count
          )
        `)
        .eq('list_id', list_id);

      if (listError || !savedLeads || savedLeads.length === 0) {
        return new Response(JSON.stringify({ success: true, count: 0, message: "No leads to sync" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Convert and batch pushes (up to 100 leads per request)
      const dataPayloads = savedLeads.map(sl => {
        const p = sl.professionals;
        let leadStatus = 'None';
        if (sl.status === 'contacted') leadStatus = 'Attempted to Contact';
        else if (sl.status === 'responded') leadStatus = 'Contacted';
        else if (sl.status === 'converted') leadStatus = 'Contacted';
        else if (sl.status === 'closed') leadStatus = 'Lost Lead';

        const row: Record<string, string> = {
          First_Name: p.name.split(' ')[0],
          Last_Name: p.name.split(' ').slice(1).join(' ') || '.',
          Email: p.email || "",
          Phone: p.phone || "",
          Company: p.name || "",
          City: p.area || "",
          Street: p.address || "",
          Lead_Status: leadStatus
        };

        if (sl.zoho_lead_id) {
          row['id'] = sl.zoho_lead_id;
        }
        return row;
      });

      // Split into chunks of 100
      const chunkSize = 100;
      let syncSuccessCount = 0;

      for (let i = 0; i < dataPayloads.length; i += chunkSize) {
        const chunk = dataPayloads.slice(i, i + chunkSize);
        
        // Since Zoho handles upsert using put/post depending on presence of ID,
        // we split the chunk into inserts (no ID) and updates (has ID)
        const updates = chunk.filter(item => item.id);
        const inserts = chunk.filter(item => !item.id);

        const executeRequest = async (method: 'POST' | 'PUT', records: Record<string, string>[]) => {
          if (records.length === 0) return;

          const res = await fetch(`${apiBaseUrl}/crm/v2/Leads`, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Zoho-oauthtoken ${accessToken}`
            },
            body: JSON.stringify({ data: records })
          });

          if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Zoho API batch failed: ${res.status} ${errBody}`);
          }

          const resJson = await res.json();
          const results = resJson.data || [];

          for (let idx = 0; idx < results.length; idx++) {
            const itemRes = results[idx];
            if (itemRes.status === 'success') {
              const recordId = itemRes.details?.id;
              // Map index back to list item to identify saved_lead_id
              const matchingRecord = records[idx];
              const originalLead = savedLeads.find(sl => 
                sl.zoho_lead_id === matchingRecord.id || 
                (sl.professionals.email === matchingRecord.Email && sl.professionals.phone === matchingRecord.Phone)
              );

              if (originalLead) {
                await supabase
                  .from('saved_leads')
                  .update({
                    zoho_lead_id: recordId,
                    zoho_last_synced_at: new Date().toISOString(),
                    zoho_deal_stage: matchingRecord.Lead_Status,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', originalLead.id);
                syncSuccessCount++;
              }
            }
          }
        };

        await executeRequest('PUT', updates);
        await executeRequest('POST', inserts);
      }

      // Update sync count on profile
      const { data: profileObj } = await supabase
        .from('profiles')
        .select('zoho_sync_count')
        .eq('id', user.id)
        .single();
      const currentSyncCount = profileObj?.zoho_sync_count || 0;

      await supabase
        .from('profiles')
        .update({
          zoho_sync_count: currentSyncCount + syncSuccessCount,
          zoho_last_sync_at: new Date().toISOString()
        })
        .eq('id', user.id);

      return new Response(JSON.stringify({ success: true, count: syncSuccessCount, message: `Pushed ${syncSuccessCount} leads to Zoho Leads` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: `Unsupported action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Zoho Proxy Exception: ", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
