/**
 * Exemplos de Uso do AuthGuard
 * 
 * Este arquivo contém exemplos práticos de como usar o componente AuthGuard
 * em diferentes cenários.
 */

import AuthGuard from "./index";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================
// EXEMPLO 1: Proteção Básica
// ============================================

/**
 * Protege uma página inteira, apenas verificando autenticação
 */
export function ExemploBasico() {
  return (
    <AuthGuard>
      <div>
        <h1>Conteúdo Protegido</h1>
        <p>Apenas usuários autenticados podem ver isso.</p>
      </div>
    </AuthGuard>
  );
}

// ============================================
// EXEMPLO 2: Proteção com Role Específica
// ============================================

/**
 * Apenas administradores podem acessar
 */
export function ExemploAdmin() {
  return (
    <AuthGuard requiredRole="admin">
      <div>
        <h1>Painel Administrativo</h1>
        <p>Apenas administradores têm acesso.</p>
      </div>
    </AuthGuard>
  );
}

/**
 * Contador ou superior (admin também pode acessar)
 */
export function ExemploContador() {
  return (
    <AuthGuard requiredRole="accountant">
      <div>
        <h1>Gerenciar Notas Fiscais</h1>
        <p>Contadores e admins podem acessar.</p>
      </div>
    </AuthGuard>
  );
}

// ============================================
// EXEMPLO 3: Múltiplas Roles Permitidas
// ============================================

/**
 * Permite acesso para admin OU accountant (mas não viewer)
 */
export function ExemploMultiplasRoles() {
  return (
    <AuthGuard allowedRoles={["admin", "accountant"]}>
      <div>
        <h1>Editar Empresa</h1>
        <p>Apenas admin e accountant podem editar.</p>
      </div>
    </AuthGuard>
  );
}

// ============================================
// EXEMPLO 4: Proteção Inline (não fullscreen)
// ============================================

/**
 * Protege apenas uma seção da página, não a página inteira
 */
export function ExemploInline() {
  return (
    <div>
      <h1>Página Pública</h1>
      <p>Este conteúdo é visível para todos.</p>

      {/* Apenas esta seção é protegida */}
      <AuthGuard fullScreen={false} requiredRole="admin">
        <div className="mt-6 p-4 border rounded">
          <h2>Seção Admin</h2>
          <p>Apenas admins veem esta seção.</p>
        </div>
      </AuthGuard>

      <p className="mt-6">Mais conteúdo público aqui.</p>
    </div>
  );
}

// ============================================
// EXEMPLO 5: Com Loading Customizado
// ============================================

/**
 * Loading customizado com skeleton
 */
export function ExemploLoadingCustomizado() {
  return (
    <AuthGuard
      loadingFallback={
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      }
    >
      <div>
        <h1>Conteúdo com Loading Customizado</h1>
        <p>Durante o carregamento, mostra skeleton screens.</p>
      </div>
    </AuthGuard>
  );
}

// ============================================
// EXEMPLO 6: Com Fallback de Acesso Negado Customizado
// ============================================

/**
 * Mensagem customizada quando acesso é negado
 */
export function ExemploAcessoNegadoCustomizado() {
  return (
    <AuthGuard
      requiredRole="admin"
      accessDeniedFallback={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ops!</h2>
          <p className="text-gray-600 mb-4">
            Esta página é restrita a administradores.
          </p>
          <p className="text-sm text-gray-500">
            Entre em contato com o suporte se precisar de acesso.
          </p>
        </div>
      }
    >
      <div>
        <h1>Página Administrativa</h1>
      </div>
    </AuthGuard>
  );
}

// ============================================
// EXEMPLO 7: Sem Redirecionamento Automático
// ============================================

/**
 * Não redireciona automaticamente, apenas mostra mensagem
 */
export function ExemploSemRedirect() {
  return (
    <AuthGuard noRedirect fullScreen={false}>
      <div className="p-6">
        <h1>Área Restrita</h1>
        <p>Conteúdo protegido aqui.</p>
      </div>
    </AuthGuard>
  );
}

// ============================================
// EXEMPLO 8: Proteção de Componente Específico
// ============================================

/**
 * Componente de botão que só aparece para admins
 */
export function BotaoAdmin({ onClick }: { onClick: () => void }) {
  return (
    <AuthGuard requiredRole="admin" fullScreen={false} noRedirect>
      <button
        onClick={onClick}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Excluir Tudo (Admin Only)
      </button>
    </AuthGuard>
  );
}

/**
 * Seção que aparece apenas para contadores e admins
 */
export function SecaoContadores() {
  return (
    <AuthGuard
      allowedRoles={["admin", "accountant"]}
      fullScreen={false}
      noRedirect
    >
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Ferramentas do Contador</h3>
        <p className="text-sm text-gray-600">
          Opções especiais para contadores e administradores.
        </p>
      </div>
    </AuthGuard>
  );
}

// ============================================
// EXEMPLO 9: Layout Protegido
// ============================================

/**
 * Layout que protege todas as páginas filhas
 */
export function LayoutProtegido({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold">Área Protegida</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 px-4">{children}</main>
      </div>
    </AuthGuard>
  );
}

/**
 * Layout Admin - apenas para administradores
 */
export function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-100">
        <header className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 px-4">{children}</main>
      </div>
    </AuthGuard>
  );
}

// ============================================
// EXEMPLO 10: Renderização Condicional Baseada em Role
// ============================================

/**
 * Mostra diferentes conteúdos dependendo da role do usuário
 */
export function ConteudoPorRole() {
  return (
    <div className="space-y-4">
      <h1>Dashboard</h1>

      {/* Admin vê tudo */}
      <AuthGuard requiredRole="admin" fullScreen={false} noRedirect>
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="font-bold text-red-800">Admin Dashboard</h2>
          <p className="text-sm text-red-600">Você tem acesso total.</p>
        </div>
      </AuthGuard>

      {/* Contador vê isso */}
      <AuthGuard
        allowedRoles={["admin", "accountant"]}
        fullScreen={false}
        noRedirect
      >
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="font-bold text-blue-800">Ferramentas Contábeis</h2>
          <p className="text-sm text-blue-600">
            Gerenciar notas e relatórios.
          </p>
        </div>
      </AuthGuard>

      {/* Todos usuários autenticados veem isso */}
      <AuthGuard fullScreen={false} noRedirect>
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <h2 className="font-bold text-green-800">Área Comum</h2>
          <p className="text-sm text-green-600">
            Todos usuários autenticados têm acesso.
          </p>
        </div>
      </AuthGuard>

      {/* Público - sem AuthGuard */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded">
        <h2 className="font-bold text-gray-800">Área Pública</h2>
        <p className="text-sm text-gray-600">Visível para todos.</p>
      </div>
    </div>
  );
}

