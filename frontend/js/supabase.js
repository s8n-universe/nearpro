import { createClient } from '@supabase/supabase-js';

// Read values from Vite environment variables
// Deployed Vercel config will inject these at build time
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qlpopdudfomjuwagjizy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-acmCbtzTI_VbEHA_Jfehg_i1Xp29og';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase config variables are missing!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
