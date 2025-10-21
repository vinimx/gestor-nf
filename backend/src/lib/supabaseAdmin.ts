import { createClient } from "@supabase/supabase-js";

// Cria e retorna um supabase admin client sob demanda.
// Evita lançar erro no momento do import do módulo (que quebraria o carregamento de rotas).
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Supabase admin client not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment."
    );
  }

  try {
    // Validação simples da URL
    // eslint-disable-next-line no-new
    new URL(supabaseUrl);
  } catch (err) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL is not a valid URL: ${String(err)}`
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
