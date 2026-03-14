import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serverSupabase: SupabaseClient | null = null;

export function createServerSupabase() {
  if (!serverSupabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    serverSupabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return serverSupabase;
}
