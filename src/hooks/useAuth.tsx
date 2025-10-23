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
  refreshUser: () => Promise<void>; // Nova função para forçar atualização
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  useEffect(() => {
    logger.debug("🚀 AuthProvider montado, iniciando verificação...");
    
    // Timeout de segurança: 3 segundos
    const timeoutId = setTimeout(() => {
      logger.warn("⚠️ Timeout de autenticação atingido após 3s");
      setLoading(false);
      setInitialCheckComplete(true);
    }, 3000);

    // Verificar sessão atual
    checkUser();

    // Escutar mudanças na autenticação
    const supabase = getSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      logger.debug("🔄 Auth state changed:", event);
      
      // Eventos possíveis: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        if (session?.user) {
          logger.debug("📝 Auth change: Atualizando usuário...");
          // Atualizar usuário básico imediatamente
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            profile: null,
          });
          
          // Buscar profile em background (não bloqueia)
          getCurrentUser()
            .then((fullUser) => {
              if (fullUser) {
                logger.debug("✅ Auth change: Profile carregado");
                setUser(fullUser);
              }
            })
            .catch((err) => {
              logger.warn("⚠️ Auth change: Erro ao buscar profile:", err);
            });
        }
      } else if (event === "SIGNED_OUT") {
        logger.debug("👋 Auth change: Usuário deslogado");
        setUser(null);
      }
      
      setLoading(false);
      setInitialCheckComplete(true);
      clearTimeout(timeoutId);
    });

    // Polling: Verificar atualizações do profile a cada 10 segundos
    const pollingInterval = setInterval(() => {
      if (user?.id) {
        logger.debug("🔄 Polling: Verificando atualizações do profile...");
        getCurrentUser()
          .then((updatedUser) => {
            if (updatedUser && updatedUser.profile?.role !== user?.profile?.role) {
              logger.debug("✨ Polling: Role atualizado!", {
                antes: user?.profile?.role,
                depois: updatedUser.profile?.role,
              });
              setUser(updatedUser);
            }
          })
          .catch((err) => {
            logger.debug("⚠️ Polling: Erro ao verificar atualizações (não crítico):", err);
          });
      }
    }, 10000); // A cada 10 segundos (reduzido de 30)

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
      clearInterval(pollingInterval);
    };
  }, [user?.id, user?.profile?.role]);

  const checkUser = async () => {
    logger.debug("🔍 checkUser: INÍCIO");
    
    try {
      logger.debug("📞 checkUser: Criando Supabase client...");
      const supabase = getSupabase();
      logger.debug("✅ checkUser: Supabase client criado");
      
      logger.debug("🔐 checkUser: Chamando getSession()...");
      const sessionResult = await supabase.auth.getSession();
      logger.debug("✅ checkUser: getSession() retornou", sessionResult);
      
      const session = sessionResult?.data?.session;
      
      if (!session?.user) {
        logger.debug("ℹ️ checkUser: Nenhuma sessão ativa");
        setUser(null);
        setLoading(false);
        setInitialCheckComplete(true);
        return;
      }
      
      logger.debug("✅ checkUser: Sessão encontrada para", session.user.email);
      
      // Setar usuário IMEDIATAMENTE
      const basicUser = {
        id: session.user.id,
        email: session.user.email || "",
        profile: null,
      };
      
      logger.debug("💾 checkUser: Definindo usuário básico...");
      setUser(basicUser);
      logger.debug("✅ checkUser: Usuário definido!");
      
      logger.debug("🎯 checkUser: Liberando UI...");
      setLoading(false);
      setInitialCheckComplete(true);
      logger.debug("✅ checkUser: UI LIBERADA!");
      
      // Buscar profile em background (não espera)
      logger.debug("🔄 checkUser: Iniciando busca de profile em background...");
      getCurrentUser()
        .then((fullUser) => {
          if (fullUser?.profile) {
            logger.debug("✅ Background: Profile carregado", fullUser.profile);
            setUser(fullUser);
          } else {
            logger.debug("ℹ️ Background: Sem profile, mantendo dados básicos");
          }
        })
        .catch((err) => {
          logger.warn("⚠️ Background: Erro ao buscar profile (não é crítico):", err);
        });
      
      logger.debug("🏁 checkUser: FIM (sucesso)");
      
    } catch (error: any) {
      logger.error("❌ checkUser: ERRO CRÍTICO:", error);
      logger.error("❌ Stack:", error?.stack);
      setUser(null);
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

  /**
   * Força atualização do perfil do usuário
   * Útil quando o role ou dados foram alterados no banco de dados
   */
  const refreshUser = async () => {
    logger.debug("🔄 Forçando atualização do perfil do usuário...");
    
    try {
      const updatedUser = await getCurrentUser();
      
      if (updatedUser) {
        logger.debug("✅ Perfil atualizado com sucesso", updatedUser);
        setUser(updatedUser);
      } else {
        logger.warn("⚠️ Nenhum usuário encontrado ao atualizar");
        setUser(null);
      }
    } catch (error) {
      logger.error("❌ Erro ao atualizar perfil:", error);
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
    refreshUser,
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
