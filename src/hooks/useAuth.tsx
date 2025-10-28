"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useCallback,
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
  
  // Refs para evitar re-execuções desnecessárias
  const authStateChangeRef = useRef<boolean>(false);
  const profileLoadingRef = useRef<boolean>(false);

  // Função otimizada para carregar profile
  const loadUserProfile = useCallback(async (userId: string, userEmail: string) => {
    if (profileLoadingRef.current) return;
    
    profileLoadingRef.current = true;
    try {
      const fullUser = await getCurrentUser();
      if (fullUser && fullUser.id === userId) {
        setUser(fullUser);
      }
    } catch (err) {
      // Reduzir logs de debug para evitar spam
    } finally {
      profileLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
      // Evitar múltiplas inicializações
      if (authStateChangeRef.current) return;
      authStateChangeRef.current = true;
      
      // Timeout de segurança: 3 segundos
      const timeoutId = setTimeout(() => {
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
      
      // Eventos possíveis: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        if (session?.user) {
          // Atualizar usuário básico imediatamente
          const basicUser = {
            id: session.user.id,
            email: session.user.email || "",
            profile: null,
          };
          
          setUser(basicUser);
          
          // Buscar profile em background apenas se não estiver carregando
          if (!profileLoadingRef.current) {
            loadUserProfile(session.user.id, session.user.email || "");
          }
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
      authStateChangeRef.current = false;
    };
  }, [loadUserProfile]); // Dependência otimizada

  // Desabilitar completamente o polling para evitar Fast Refresh
  // useEffect(() => {
  //   if (!user?.id || !user?.profile) return;
    
  //   // Apenas em produção, desabilitar completamente em desenvolvimento
  //   if (process.env.NODE_ENV === 'development') return;

  //   const pollingInterval = setInterval(() => {
  //     // Evitar polling se já estiver carregando
  //     if (profileLoadingRef.current) return;
      
  //     // Evitar polling se a página não estiver visível
  //     if (document.hidden) return;
      
  //     getCurrentUser()
  //       .then((updatedUser) => {
  //         if (updatedUser && updatedUser.profile?.role !== user?.profile?.role) {
  //           setUser(updatedUser);
  //         }
  //       })
  //       .catch((err) => {
  //       });
  //   }, 300000); // 5 minutos em produção

  //   return () => {
  //     clearInterval(pollingInterval);
  //   };
  // }, [user?.id, user?.profile?.role]); // Dependências mais específicas

  const checkUser = useCallback(async () => {
    try {
      const supabase = getSupabase();
      const sessionResult = await supabase.auth.getSession();
      const session = sessionResult?.data?.session;
      
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        setInitialCheckComplete(true);
        return;
      }
      
      // Setar usuário básico imediatamente
      const basicUser = {
        id: session.user.id,
        email: session.user.email || "",
        profile: null,
      };
      
      setUser(basicUser);
      setLoading(false);
      setInitialCheckComplete(true);
      
      // Buscar profile em background
      if (!profileLoadingRef.current) {
        loadUserProfile(session.user.id, session.user.email || "");
      }
      
    } catch (error: any) {
      logger.error("❌ Erro crítico na autenticação:", error);
      setUser(null);
      setLoading(false);
      setInitialCheckComplete(true);
    }
  }, [loadUserProfile]);

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
    
    try {
      const updatedUser = await getCurrentUser();
      
      if (updatedUser) {
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
