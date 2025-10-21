import { createClient } from "@supabase/supabase-js";

let _supabase: any = null;

function getEnvironmentVars() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return { supabaseUrl, supabaseAnonKey };
  } catch (error) {
    return { supabaseUrl: undefined, supabaseAnonKey: undefined };
  }
}

export function getSupabase() {
  if (_supabase) return _supabase;

  const { supabaseUrl, supabaseAnonKey } = getEnvironmentVars();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables not configured");
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}
