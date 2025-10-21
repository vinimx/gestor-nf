import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  console.log("🔧 Inicializando Supabase Client...");
  console.log("📍 URL:", SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : "❌ NÃO CONFIGURADO");
  console.log("🔑 ANON_KEY:", SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : "❌ NÃO CONFIGURADO");

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("⚠️ Supabase não configurado! Verifique suas variáveis de ambiente.");
    console.error("NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✓ Configurado" : "✗ Faltando");
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", SUPABASE_ANON_KEY ? "✓ Configurado" : "✗ Faltando");
    
    // Retornar um stub leve para evitar crashes durante SSR/dev quando variáveis não estiverem configuradas.
    _supabase = {
      auth: {
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signInWithPassword: async () => ({
          error: new Error("Supabase não configurado. Verifique o arquivo .env.local"),
        }),
        signUp: async () => ({
          data: null,
          error: new Error("Supabase não configurado. Verifique o arquivo .env.local"),
        }),
        signOut: async () => ({ error: new Error("Supabase não configurado") }),
        resetPasswordForEmail: async () => ({
          error: new Error("Supabase não configurado"),
        }),
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: (tableName: string) => ({
        select: (_sel?: any) => ({
          eq: (_col: string, _val: any) => ({
            single: async () => ({
              data: null,
              error: new Error("Supabase não configurado"),
            }),
          }),
        }),
        insert: (_rows: any[]) => ({
          select: () => ({
            single: async () => ({
              data: null,
              error: new Error("Supabase não configurado"),
            }),
          }),
        }),
      }),
    } as any as SupabaseClient;
    return _supabase;
  }

  _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("✅ Supabase Client criado com sucesso!");
  return _supabase;
}



