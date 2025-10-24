import { NextRequest } from "next/server";
import { getSupabase } from "./supabaseClient";
import { logger } from "./logger";
import { UserProfile } from "@/types/models";

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = getSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      // "Auth session missing!" é esperado quando usuário não está logado
      // Não é um erro crítico, apenas indica que não há sessão ativa
      return null;
    }

    if (!user) {
      return null;
    }

    // Buscar profile do usuário
    try {
      const { data: profile, error: profileError } = await supabase
        .from("users_profile")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        // Log apenas erros críticos, não "não encontrado"
        if (profileError.code !== 'PGRST116') {
          logger.error("❌ Erro ao buscar profile:", profileError.message);
        }
        
        // Retornar usuário sem profile
        return {
          id: user.id,
          email: user.email || "",
          profile: null,
        };
      }

      return {
        id: user.id,
        email: user.email || "",
        profile: profile || null,
      };
    } catch (profileError: any) {
      // Log apenas erros críticos
      logger.error("❌ Exceção ao buscar profile:", profileError?.message);
      
      return {
        id: user.id,
        email: user.email || "",
        profile: null,
      };
    }
  } catch (error) {
    logger.error("❌ Erro crítico na autenticação:", error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  return user;
}

// Versão para API routes com NextRequest
export async function requireAuthFromRequest(request: NextRequest): Promise<{ user: AuthUser; error: string | null }> {
  try {
    // Para API routes, precisamos usar o Supabase Admin para verificar a sessão
    const { createSupabaseAdmin } = await import("./supabaseAdmin");
    const supabaseAdmin = createSupabaseAdmin();
    
    // Extrair o token do header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null as any, error: "Token de autorização não encontrado" };
    }
    
    const token = authHeader.substring(7);
    
    // Verificar o token com Supabase Admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return { user: null as any, error: "Token inválido ou expirado" };
    }

    // Buscar profile do usuário
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users_profile")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      logger.error("Erro ao buscar profile:", profileError);
      return { user: null as any, error: "Erro ao buscar perfil do usuário" };
    }

    return { 
      user: {
        id: user.id,
        email: user.email || "",
        profile: profile || null,
      }, 
      error: null 
    };
  } catch (error) {
    logger.error("Erro na autenticação da API:", error);
    return { user: null as any, error: "Erro de autenticação" };
  }
}

export async function requireRole(allowedRoles: string[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!user.profile || !allowedRoles.includes(user.profile.role)) {
    throw new Error("Acesso negado - permissão insuficiente");
  }

  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  return requireRole(["admin"]);
}

export async function requireAccountantOrAdmin(): Promise<AuthUser> {
  return requireRole(["admin", "accountant"]);
}

export async function createUserProfile(
  userId: string,
  email: string,
  role: string = "viewer",
  empresaId?: string
): Promise<UserProfile> {
  try {
    const { data, error } = await getSupabase()
      .from("users_profile")
      .insert([
        {
          id: userId,
          email,
          role,
          empresa_id: empresaId,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar profile: ${error.message}`);
    }

    return data;
  } catch (error) {
    logger.error("Erro ao criar profile do usuário:", error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signUp(email: string, password: string, nome?: string) {
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.user) {
    // Criar profile do usuário
    try {
      await createUserProfile(data.user.id, email, "viewer");
    } catch (profileError) {
      logger.error("Erro ao criar profile após signup:", profileError);
      // Não falhar o signup por causa do profile
    }
  }

  return data;
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function resetPassword(email: string) {
  const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}



