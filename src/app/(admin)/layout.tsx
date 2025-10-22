"use client";

import AuthGuard from "@/components/Auth/AuthGuard";
import AuthErrorHandler from "@/components/Auth/AuthErrorHandler";

/**
 * Layout Admin
 * 
 * Todas as páginas dentro deste grupo de rotas (admin)
 * serão automaticamente protegidas e restritas a usuários
 * com role "admin".
 * 
 * Usuários sem permissão verão uma tela de "Acesso Negado".
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="admin">
      <AuthErrorHandler />
      {children}
    </AuthGuard>
  );
}

