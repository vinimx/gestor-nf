import { getSupabase } from "./supabaseClient";
import { UserProfile } from "@/types/models";

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const {
      data: { user },
      error: authError,
    } = await getSupabase().auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Buscar profile do usuário
    const { data: profile, error: profileError } = await getSupabase()
      .from("users_profile")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Erro ao buscar profile:", profileError);
      // Retornar usuário sem profile se não encontrar
      return {
        id: user.id,
        email: user.email || "",
        profile: null,
      };
    }

    return {
      id: user.id,
      email: user.email || "",
      profile,
    };
  } catch (error) {
    console.error("Erro na autenticação:", error);
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
