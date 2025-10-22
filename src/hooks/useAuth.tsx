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
import { logger } from "@/lib/logger";
import { AuthUser, getCurrentUser } from "@/lib/auth";
import { translateAuthError } from "@/lib/authErrors";

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
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  useEffect(() => {
    logger.debug("🚀 AuthProvider montado, iniciando verificação...");
    
    // Timeout de segurança: se após 10 segundos ainda estiver carregando, força parar
    const timeoutId = setTimeout(() => {
      logger.warn("⚠️ Timeout de autenticação atingido! Forçando loading = false");
      setLoading(false);
      setInitialCheckComplete(true);
    }, 10000);

    // Verificar sessão atual
    checkUser();

    // Escutar mudanças na autenticação
    const supabase = getSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      logger.debug("🔄 Auth state changed:", event);
      
      // Eventos possíveis: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        if (session?.user) {
          const authUser = await getCurrentUser();
          setUser(authUser);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
      
      setLoading(false);
      setInitialCheckComplete(true);
      clearTimeout(timeoutId);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const checkUser = async () => {
    try {
      logger.debug("🔍 checkUser: Iniciando verificação...");
      
      // Timeout de 8 segundos para buscar profile
      const timeoutPromise = new Promise<AuthUser | null>((_, reject) => {
        setTimeout(() => reject({ timeout: true }), 8000);
      });

      const userPromise = getCurrentUser();
      const authUser = await Promise.race([userPromise, timeoutPromise]);
      
      logger.debug("✅ checkUser: Usuário verificado com sucesso");
      setUser(authUser);
    } catch (error: any) {
      // Se foi timeout ou outro erro, tenta fallback silenciosamente
      if (error?.timeout) {
        logger.warn("⚠️ checkUser: Timeout ao buscar profile, tentando fallback...");
      } else {
        logger.warn("⚠️ checkUser: Erro ao verificar usuário, tentando fallback...");
      }
      
      // Em caso de timeout/erro, tenta pegar só os dados básicos do Supabase
      try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Dados mínimos sem profile
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            profile: null,
          });
          logger.debug("✅ checkUser: Usando dados básicos do Supabase (sem profile)");
        } else {
          setUser(null);
          logger.debug("ℹ️ checkUser: Nenhuma sessão ativa");
        }
      } catch (fallbackError) {
        logger.error("❌ checkUser: Erro no fallback:", fallbackError);
        setUser(null);
      }
    } finally {
      logger.debug("🏁 checkUser: Finalizando (loading = false)");
      setLoading(false);
      setInitialCheckComplete(true);
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
        throw new Error(translateAuthError(error.message));
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
        throw new Error(translateAuthError(error.message));
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
        throw new Error(translateAuthError(error.message));
      }
      
      // Limpar estado do usuário
      setUser(null);
    } catch (error) {
      // Mesmo em caso de erro, limpar o usuário localmente
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) {
        throw new Error(translateAuthError(error.message));
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

  // Mostrar loading screen apenas na verificação inicial
  if (loading && !initialCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div
              className="p-6 rounded-full animate-pulse"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <svg
                className="h-12 w-12 text-white animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              Gestor NF
            </h2>
            <p className="text-white/90 text-sm drop-shadow-md">
              Verificando autenticação...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
