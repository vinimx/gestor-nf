"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert, Lock, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Props do componente AuthGuard
 */
export interface AuthGuardProps {
  /**
   * Conteúdo a ser protegido
   */
  children: ReactNode;
  
  /**
   * Role mínima necessária para acessar o conteúdo
   * Se não especificado, apenas autenticação é necessária
   */
  requiredRole?: "admin" | "accountant" | "viewer";
  
  /**
   * Lista de roles permitidas (alternativa a requiredRole)
   * Permite acesso se o usuário tiver QUALQUER uma das roles listadas
   */
  allowedRoles?: Array<"admin" | "accountant" | "viewer">;
  
  /**
   * Componente customizado a ser exibido quando não autenticado
   */
  fallback?: ReactNode;
  
  /**
   * Componente customizado a ser exibido durante o carregamento
   */
  loadingFallback?: ReactNode;
  
  /**
   * Componente customizado a ser exibido quando acesso é negado por role
   */
  accessDeniedFallback?: ReactNode;
  
  /**
   * Se true, não redireciona automaticamente para /login quando não autenticado
   * @default false
   */
  noRedirect?: boolean;
  
  /**
   * URL para redirecionar quando não autenticado (se noRedirect for false)
   * @default "/login"
   */
  redirectTo?: string;
  
  /**
   * Se true, usa uma tela de loading/erro em fullscreen
   * Se false, usa apenas o conteúdo sem layout adicional
   * @default true
   */
  fullScreen?: boolean;
}

/**
 * AuthGuard - Componente de proteção client-side
 * 
 * Protege conteúdo baseado em autenticação e roles.
 * Complementa a proteção do middleware (server-side).
 * 
 * @example
 * // Proteção básica (apenas autenticação)
 * <AuthGuard>
 *   <ConteudoProtegido />
 * </AuthGuard>
 * 
 * @example
 * // Proteção com role específica
 * <AuthGuard requiredRole="admin">
 *   <PainelAdmin />
 * </AuthGuard>
 * 
 * @example
 * // Proteção com múltiplas roles permitidas
 * <AuthGuard allowedRoles={["admin", "accountant"]}>
 *   <GerenciarNotas />
 * </AuthGuard>
 * 
 * @example
 * // Com fallbacks customizados
 * <AuthGuard
 *   loadingFallback={<MeuLoading />}
 *   accessDeniedFallback={<MeuAcessoNegado />}
 * >
 *   <Conteudo />
 * </AuthGuard>
 */
export default function AuthGuard({
  children,
  requiredRole,
  allowedRoles,
  fallback,
  loadingFallback,
  accessDeniedFallback,
  noRedirect = false,
  redirectTo = "/login",
  fullScreen = true,
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirecionar para login se não autenticado (apenas se noRedirect for false)
  useEffect(() => {
    if (!loading && !user && !noRedirect) {
      const url = new URL(redirectTo, window.location.origin);
      // Preservar URL atual para redirecionar após login
      if (pathname && pathname !== "/") {
        url.searchParams.set("redirect", pathname);
      }
      router.push(url.pathname + url.search);
    }
  }, [user, loading, router, pathname, noRedirect, redirectTo]);

  // ============================================
  // ESTADO: LOADING
  // ============================================
  if (loading) {
    if (loadingFallback) {
      return <>{loadingFallback}</>;
    }

    // Loading padrão
    if (fullScreen) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div
                className="p-4 rounded-full animate-pulse"
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                }}
              >
                <svg
                  className="h-12 w-12 animate-spin"
                  style={{ color: "var(--cor-primaria)" }}
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
            <div>
              <p className="text-lg font-semibold text-gray-800">
                Verificando permissões...
              </p>
              <p className="text-sm text-gray-600 mt-1">Aguarde um momento</p>
            </div>
          </div>
        </div>
      );
    }

    // Loading inline (sem fullscreen)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // ============================================
  // ESTADO: NÃO AUTENTICADO
  // ============================================
  if (!user) {
    // Se tem fallback customizado, usar ele
    if (fallback) {
      return <>{fallback}</>;
    }

    // Se noRedirect, mostrar mensagem padrão
    if (noRedirect && fullScreen) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center max-w-md p-8">
            <div className="flex justify-center mb-6">
              <div
                className="p-4 rounded-full"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                }}
              >
                <ShieldAlert className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-3 text-gray-800">
              Autenticação Necessária
            </h1>
            <p className="text-gray-600 mb-6">
              Você precisa estar autenticado para acessar este conteúdo.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="w-full"
              style={{
                background: "var(--cor-primaria)",
              }}
            >
              Fazer Login
            </Button>
          </div>
        </div>
      );
    }

    // Retornar null (vai redirecionar via useEffect)
    return null;
  }

  // ============================================
  // ESTADO: VERIFICAÇÃO DE ROLE
  // ============================================
  const userRole = user.profile?.role;

  // Hierarquia de roles: admin > accountant > viewer
  const roleHierarchy: Record<string, number> = {
    admin: 3,
    accountant: 2,
    viewer: 1,
  };

  let hasPermission = true;

  // Verificar se tem role mínima requerida (hierárquica)
  if (requiredRole) {
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    const userLevel = roleHierarchy[userRole || ""] || 0;
    hasPermission = userLevel >= requiredLevel;
  }

  // Verificar se está na lista de roles permitidas (não hierárquica)
  if (allowedRoles && allowedRoles.length > 0) {
    hasPermission = allowedRoles.includes(userRole as any);
  }

  // Se não tem permissão, mostrar acesso negado
  if (!hasPermission) {
    // Fallback customizado
    if (accessDeniedFallback) {
      return <>{accessDeniedFallback}</>;
    }

    // Acesso negado padrão
    if (fullScreen) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
          <div className="text-center max-w-md p-8 space-y-6">
            <div className="flex justify-center">
              <div
                className="p-6 rounded-full"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                }}
              >
                <Lock className="h-16 w-16 text-red-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-800">
                Acesso Negado
              </h1>
              <p className="text-gray-600">
                Você não tem permissão para acessar esta página.
              </p>
            </div>

            <div
              className="p-4 rounded-lg text-sm text-left"
              style={{
                background: "rgba(239, 68, 68, 0.05)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <p className="font-semibold text-gray-800 mb-1">
                Seu nível de acesso:
              </p>
              <p className="text-gray-600">
                {userRole ? (
                  <>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                      {userRole}
                    </span>
                  </>
                ) : (
                  "Nenhum role atribuído"
                )}
              </p>
              {(requiredRole || allowedRoles) && (
                <>
                  <p className="font-semibold text-gray-800 mb-1 mt-3">
                    Acesso necessário:
                  </p>
                  <p className="text-gray-600">
                    {requiredRole && (
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                        {requiredRole} ou superior
                      </span>
                    )}
                    {allowedRoles && (
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                        {allowedRoles.join(", ")}
                      </span>
                    )}
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={() => router.push("/")}
                className="flex-1"
                style={{
                  background: "var(--cor-primaria)",
                }}
              >
                <Home className="h-4 w-4 mr-2" />
                Ir para Início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Acesso negado inline (sem fullscreen)
    return (
      <div className="p-6 rounded-lg border border-red-200 bg-red-50">
        <div className="flex items-start space-x-3">
          <Lock className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Acesso Negado</h3>
            <p className="text-sm text-gray-600 mt-1">
              Você não tem permissão para visualizar este conteúdo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ESTADO: AUTORIZADO - RENDERIZAR CONTEÚDO
  // ============================================
  return <>{children}</>;
}

