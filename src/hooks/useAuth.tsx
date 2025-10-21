"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabaseClient";
import { AuthUser, getCurrentUser } from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🚀 AuthProvider montado, iniciando verificação...");
    
    // Timeout de segurança: se após 10 segundos ainda estiver carregando, força parar
    const timeoutId = setTimeout(() => {
      console.warn("⚠️ Timeout de autenticação atingido! Forçando loading = false");
      setLoading(false);
    }, 10000);

    // Verificar sessão atual
    checkUser();

    // Escutar mudanças na autenticação
    const supabase = getSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log("🔄 Auth state changed:", event, session?.user?.email || "sem usuário");
      
      if (session?.user) {
        const authUser = await getCurrentUser();
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
      clearTimeout(timeoutId);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const checkUser = async () => {
    try {
      console.log("🔍 checkUser: Iniciando verificação...");
      const authUser = await getCurrentUser();
      console.log("✅ checkUser: Resultado:", authUser ? `Usuário ${authUser.email}` : "Nenhum usuário");
      setUser(authUser);
    } catch (error) {
      console.error("❌ checkUser: Erro ao verificar usuário:", error);
      setUser(null);
    } finally {
      console.log("🏁 checkUser: Finalizando (loading = false)");
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome?: string) => {
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Criar profile do usuário
        try {
          const response = await fetch("/api/auth/profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              nome,
              role: "viewer",
            }),
          });

          if (!response.ok) {
            console.error("Erro ao criar profile");
          }
        } catch (profileError) {
          console.error("Erro ao criar profile:", profileError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
