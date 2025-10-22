/**
 * Utilitários para redirecionamento baseado em roles
 */

export type UserRole = "admin" | "accountant" | "viewer";

/**
 * Retorna a URL de redirecionamento baseada no role do usuário
 */
export function getRedirectUrlByRole(role?: UserRole): string {
  switch (role) {
    case "admin":
      return "/"; // Admin vai para dashboard principal
    case "accountant":
      return "/"; // Contador vai para dashboard com suas empresas
    case "viewer":
      return "/"; // Viewer vai para dashboard read-only
    default:
      return "/"; // Fallback para home
  }
}

/**
 * Verifica se o usuário tem permissão para acessar uma rota específica
 */
export function canAccessRoute(userRole?: UserRole, requiredRole?: UserRole): boolean {
  if (!requiredRole) return true; // Rota pública
  if (!userRole) return false; // Sem role, sem acesso

  // Hierarquia: admin > accountant > viewer
  const hierarchy: Record<UserRole, number> = {
    admin: 3,
    accountant: 2,
    viewer: 1,
  };

  return hierarchy[userRole] >= hierarchy[requiredRole];
}

/**
 * Verifica se o usuário tem uma das roles permitidas
 */
export function hasAnyRole(userRole?: UserRole, allowedRoles?: UserRole[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRole) return false;

  return allowedRoles.includes(userRole);
}

