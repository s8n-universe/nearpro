import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { preCallComplianceCheck, hashPhone } from "./compliance.ts"
import { createCallSession } from "./livekit.ts"
import { AGENT_SYSTEM_PROMPT, CallParams } from "./agent.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? "";
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Authenticate user session
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

    // Parse URL path and body
    const urlObj = new URL(req.url);
    const pathname = urlObj.pathname.replace(/\/$/, ""); // Strip trailing slash
    const isWebhook = pathname.endsWith('/webhook-call-end');
    const isStartCall = pathname.endsWith('/start-call') || pathname.endsWith('/voice-agent-orchestrator');

    const body = await req.json().catch(() => ({}));
    const action = body.action || (isWebhook ? 'call_end' : 'start_call');

    // -------------------------------------------------------------
    // ACTION: START CALL
    // -------------------------------------------------------------
    if (action === 'start_call' || action === 'test_call' || isStartCall) {
      const {
        phone,
        lead_id,          // professional_id
        saved_lead_id,    // saved_lead_id
        campaign_id,
        lead_name = 'Test Recipient',
        lead_business_name = 'Test Business',
        lead_area = 'Mumbai',
        lead_category = 'Local Business',
        lead_rating,
        lead_reviews,
        caller_company = 'My Company',
        caller_service = 'Our Services',
        call_goal = 'Qualify Interest',
        voice_name = 'Priya',
        language = 'hinglish'
      } = body;

      if (!phone) {
        return new Response(JSON.stringify({ error: 'phone parameter is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check pre-call compliance (bypass compliance hour gates for self-test calls)
      const compliance = action === 'test_call'
        ? { passed: true, reason: undefined, code: undefined }
        : await preCallComplianceCheck(supabase, phone, user.id);

      const phoneHash = await hashPhone(phone);
      const utcDate = new Date();
      const kolkataTime = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
      const istHour = kolkataTime.getUTCHours();

      if (!compliance.passed) {
        // Log the failed/suppressed attempt to audit log for TRAI auditability
        await supabase.from('call_audit_log').insert([{
          campaign_id: campaign_id || null,
          called_number_hash: phoneHash,
          initiated_by_user: user.id,
          professional_id: lead_id || null,
          saved_lead_id: saved_lead_id || null,
          pe_registration_id: Deno.env.get('DLT_PE_REGISTRATION_ID') || 'PE_MOCK_REG_123',
          dlt_template_id: Deno.env.get('DLT_TEMPLATE_ID') || 'DLT_MOCK_TEMP_456',
          virtual_did_used: Deno.env.get('EXOTEL_VIRTUAL_DID') || '+911400000000',
          dnd_status_at_call: compliance.code === 'DND_REGISTERED' ? 'DND' : 'NOT_DND',
          calling_hour_ist: istHour,
          call_status: 'FAILED',
          call_outcome_tag: compliance.reason,
          duration_seconds: 0,
        }]);

        return new Response(JSON.stringify({ 
          success: false, 
          error: compliance.reason, 
          code: compliance.code 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Generate LiveKit token & session room
      const session = await createCallSession(user.id);

      // Generate System Prompt
      const params: CallParams = {
        leadName: lead_name,
        leadBusinessName: lead_business_name,
        leadArea: lead_area,
        leadCategory: lead_category,
        leadRating: lead_rating,
        leadReviews: lead_reviews,
        callerCompany: caller_company,
        callerService: caller_service,
        callGoal: call_goal,
        voiceName: voice_name,
        language: language as 'hinglish' | 'english'
      };

      const systemPrompt = AGENT_SYSTEM_PROMPT(params);

      // Insert initiated call log
      const { data: auditRecord, error: auditErr } = await supabase
        .from('call_audit_log')
        .insert([{
          campaign_id: campaign_id || null,
          called_number_hash: phoneHash,
          initiated_by_user: user.id,
          professional_id: lead_id || null,
          saved_lead_id: saved_lead_id || null,
          pe_registration_id: Deno.env.get('DLT_PE_REGISTRATION_ID') || 'PE_MOCK_REG_123',
          dlt_template_id: Deno.env.get('DLT_TEMPLATE_ID') || 'DLT_MOCK_TEMP_456',
          virtual_did_used: Deno.env.get('EXOTEL_VIRTUAL_DID') || '+911400000000',
          dnd_status_at_call: 'NOT_DND',
          calling_hour_ist: istHour,
          call_status: 'INITIATED',
          duration_seconds: 0,
        }])
        .select()
        .single();

      if (auditErr) {
        throw new Error("Failed to create call audit record: " + auditErr.message);
      }

      // If campaign_id is provided, increment total dialed leads
      if (campaign_id) {
        await supabase.rpc('increment_campaign_dialed', { campaign_uuid: campaign_id });
      }

      return new Response(JSON.stringify({
        success: true,
        call_id: auditRecord.id,
        room_name: session.roomName,
        token: session.token,
        system_prompt: systemPrompt
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // -------------------------------------------------------------
    // ACTION: WEBHOOK CALL END (Deduct Credits, Save logs, CRM Sync)
    // -------------------------------------------------------------
    if (action === 'call_end' || isWebhook) {
      const {
        call_id,
        duration_seconds = 0,
        call_status = 'NO_ANSWER',
        call_outcome_tag,
        transcript = '',
        recording_url = '',
        opt_out_requested = false
      } = body;

      if (!call_id) {
        return new Response(JSON.stringify({ error: 'call_id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Fetch the call audit log
      const { data: auditLog, error: fetchErr } = await supabase
        .from('call_audit_log')
        .select('*')
        .eq('id', call_id)
        .single();

      if (fetchErr || !auditLog) {
        return new Response(JSON.stringify({ error: 'Call audit log not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 1. Upload transcript file if provided (DPDP compliant Mumbai storage bucket)
      let transcriptPath = null;
      if (transcript) {
        transcriptPath = `transcripts/${auditLog.initiated_by_user}/${call_id}.txt`;
        const { error: uploadErr } = await supabase.storage
          .from('call-assets')
          .upload(transcriptPath, new Blob([transcript], { type: 'text/plain' }), {
            upsert: true
          });

        if (uploadErr) {
          console.error("Storage: failed to save transcript file", uploadErr);
        }
      }

      // 2. Upload or reference recording URL
      let recordingPath = recording_url || null;

      const isAnswered = call_status === 'ANSWERED';
      const answeredAt = isAnswered ? new Date(Date.now() - duration_seconds * 1000).toISOString() : null;

      // 3. Update compliance audit log
      const { error: updateErr } = await supabase
        .from('call_audit_log')
        .update({
          call_status,
          call_outcome_tag,
          duration_seconds,
          transcript_path: transcriptPath,
          recording_path: recordingPath,
          answered_at: answeredAt,
          ended_at: new Date().toISOString(),
          opt_out_requested,
          opt_out_at: opt_out_requested ? new Date().toISOString() : null
        })
        .eq('id', call_id);

      if (updateErr) {
        console.error("AuditLog: failed to update records", updateErr);
      }

      // 4. Handle DNC registration if opt-out requested
      if (opt_out_requested) {
        await supabase
          .from('global_dnc_suppression_list')
          .insert([{
            phone_hash: auditLog.called_number_hash,
            reason: 'USER_OPT_OUT',
            source_call_id: call_id
          }])
          .select()
          .maybeSingle()
          .catch((e) => console.error("DNC check insertion exception:", e));
      }

      // 5. Credit deduction logic (Deduct strictly only if answered AND duration > 5 seconds)
      let creditsDeducted = 0;
      if (isAnswered && duration_seconds > 5) {
        // Fetch user profile current credits
        const { data: profile } = await supabase
          .from('profiles')
          .select('voice_call_credits')
          .eq('id', auditLog.initiated_by_user)
          .single();

        if (profile && (profile.voice_call_credits || 0) >= 1) {
          const newCredits = profile.voice_call_credits - 1;
          
          // Deduct credits from profiles
          await supabase
            .from('profiles')
            .update({ voice_call_credits: newCredits })
            .eq('id', auditLog.initiated_by_user);

          creditsDeducted = 1;

          // Record inside the audit log
          await supabase
            .from('call_audit_log')
            .update({ credits_charged: 1 })
            .eq('id', call_id);

          // Add transaction to credit ledger
          await supabase
            .from('voice_credit_ledger')
            .insert([{
              user_id: auditLog.initiated_by_user,
              amount: -1,
              transaction_type: 'DEDUCTION',
              reference_call_id: call_id,
              balance_after: newCredits
            }]);
        }
      }

      // 6. Update campaign outcome counters if it was part of a campaign
      if (auditLog.campaign_id) {
        const updateFields: any = {};
        if (isAnswered) {
          updateFields.answered_count = supabase.rpc('increment_campaign_answered', { campaign_uuid: auditLog.campaign_id });
        }
        if (call_outcome_tag === 'INTERESTED_CALLBACK' || call_outcome_tag === 'INTERESTED_NOW') {
          updateFields.interested_count = supabase.rpc('increment_campaign_interested', { campaign_uuid: auditLog.campaign_id });
        }
        // General updates to campaigns can be called via database sync
      }

      // 7. CRM Sync: update saved_leads status
      if (auditLog.saved_lead_id) {
        let crmStatus = 'contacted';
        if (call_outcome_tag === 'INTERESTED_CALLBACK' || call_outcome_tag === 'INTERESTED_NOW') {
          crmStatus = 'responded';
        } else if (call_outcome_tag === 'NOT_INTERESTED') {
          crmStatus = 'not_interested';
        } else if (call_outcome_tag === 'OPT_OUT') {
          crmStatus = 'not_interested';
        } else if (call_outcome_tag === 'CALL_BACK_LATER') {
          crmStatus = 'follow_up';
        }

        await supabase
          .from('saved_leads')
          .update({
            status: crmStatus,
            outreach_channel: 'phone',
            outreach_sent_at: new Date().toISOString(),
            notes: `AI Voice Call outcome: ${call_outcome_tag || 'Completed'}. Duration: ${duration_seconds}s.`
          })
          .eq('id', auditLog.saved_lead_id);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        credits_charged: creditsDeducted 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Invalid action
    return new Response(JSON.stringify({ error: 'Invalid action parameter' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
