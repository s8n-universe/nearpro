import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"

export interface ComplianceCheck {
  passed: boolean;
  reason?: string;
  code?: 'DND_REGISTERED' | 'OUTSIDE_HOURS' | 'MAX_ATTEMPTS' | 
          'INSUFFICIENT_CREDITS' | 'CONSENT_EXPIRED';
}

// SHA-256 phone hashing for privacy
export async function hashPhone(phone: string): Promise<string> {
  const normalized = phone.replace(/[^0-9]/g, '');
  const msgUint8 = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function preCallComplianceCheck(
  supabase: SupabaseClient,
  phone: string,
  userId: string
): Promise<ComplianceCheck> {

  const phoneHash = await hashPhone(phone);

  // Check 1: Calling hours (9:00 AM - 9:00 PM IST)
  // IST is UTC + 5:30. Adjusting time from UTC.
  const utcDate = new Date();
  const kolkataTime = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
  const istHour = kolkataTime.getUTCHours();
  
  if (istHour < 9 || istHour >= 21) {
    return { 
      passed: false, 
      reason: "Outside permitted calling hours (9 AM - 9 PM IST)", 
      code: 'OUTSIDE_HOURS' 
    };
  }

  // Check 2: Max 3 call attempts per number per day (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countErr } = await supabase
    .from('call_audit_log')
    .select('id', { count: 'exact', head: true })
    .eq('called_number_hash', phoneHash)
    .eq('initiated_by_user', userId)
    .gte('initiated_at', oneDayAgo);

  if (countErr) {
    console.error("Compliance: error checking call attempts", countErr);
  }

  if ((count || 0) >= 3) {
    return { 
      passed: false, 
      reason: "Max 3 attempts per number per day reached", 
      code: 'MAX_ATTEMPTS' 
    };
  }

  // Check 3: Global DNC Check
  const { data: dncEntry, error: dncErr } = await supabase
    .from('global_dnc_suppression_list')
    .select('id')
    .eq('phone_hash', phoneHash)
    .maybeSingle();

  if (dncErr) {
    console.error("Compliance: error checking global DNC list", dncErr);
  }

  if (dncEntry) {
    return { 
      passed: false, 
      reason: "Number is registered on Global Do-Not-Call suppression list", 
      code: 'DND_REGISTERED' 
    };
  }

  // Check 4: User credit balance check
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('voice_call_credits')
    .eq('id', userId)
    .single();

  if (profileErr || !profile) {
    return { 
      passed: false, 
      reason: "Failed to verify credit balance: " + (profileErr?.message || "profile not found"), 
      code: 'INSUFFICIENT_CREDITS' 
    };
  }

  if ((profile.voice_call_credits || 0) < 1) {
    return { 
      passed: false, 
      reason: "Insufficient call credits. Please upgrade or purchase more credits.", 
      code: 'INSUFFICIENT_CREDITS' 
    };
  }

  return { passed: true };
}
