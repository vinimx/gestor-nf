"use client";

import AuthGuard from "@/components/Auth/AuthGuard";
import AuthErrorHandler from "@/components/Auth/AuthErrorHandler";

/**
 * Layout Protegido
 * 
 * Todas as páginas dentro deste grupo de rotas (protected)
 * serão automaticamente protegidas por autenticação.
 * 
 * Usuários não autenticados serão redirecionados para /login.
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AuthErrorHandler />
      {children}
    </AuthGuard>
  );
}

