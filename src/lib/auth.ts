import { getSupabase } from "./supabaseClient";
import { UserProfile } from "@/types/models";

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    console.log("🔍 Verificando usuário autenticado...");
    
    const supabase = getSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("❌ Erro na autenticação:", authError);
      return null;
    }

    if (!user) {
      console.log("ℹ️ Nenhum usuário autenticado");
      return null;
    }

    console.log("✅ Usuário encontrado:", user.email);

    // Tentar buscar profile do usuário (opcional) com timeout
    try {
      const profilePromise = supabase
        .from("users_profile")
        .select("*")
        .eq("id", user.id)
        .single();

      // Adicionar timeout de 3 segundos para a busca do profile
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout ao buscar profile")), 3000)
      );

      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (profileError) {
        console.warn("⚠️ Profile não encontrado (não é erro crítico):", profileError.message);
      }

      console.log("✅ Profile encontrado:", profile?.email || "sem profile");

      return {
        id: user.id,
        email: user.email || "",
        profile: profile || null,
      };
    } catch (profileError) {
      // Se não conseguir buscar profile, retornar usuário sem profile
      console.warn("⚠️ Erro ao buscar profile, continuando sem ele:", profileError);
      return {
        id: user.id,
        email: user.email || "",
        profile: null,
      };
    }
  } catch (error) {
    console.error("❌ Erro crítico na autenticação:", error);
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
    console.error("Erro ao criar profile do usuário:", error);
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
      console.error("Erro ao criar profile após signup:", profileError);
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



