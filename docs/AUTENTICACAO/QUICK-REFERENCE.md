# 🚀 Quick Reference - Guia Rápido de Implementação

> **Documento de referência rápida para consulta durante o desenvolvimento**

## 📁 Estrutura de Arquivos Completa

```
gestor-nf/
├── src/
│   ├── app/
│   │   ├── (auth)/                          # 🆕 Grupo de rotas públicas
│   │   │   ├── layout.tsx                   # 🆕 Layout para páginas de auth
│   │   │   ├── login/
│   │   │   │   └── page.tsx                 # 🆕 Página de login
│   │   │   ├── registro/
│   │   │   │   └── page.tsx                 # 🆕 Página de registro
│   │   │   ├── recuperar-senha/
│   │   │   │   └── page.tsx                 # 🆕 Recuperar senha
│   │   │   ├── redefinir-senha/
│   │   │   │   └── page.tsx                 # 🆕 Redefinir senha
│   │   │   └── verificar-email/
│   │   │       └── page.tsx                 # 🆕 Verificar email
│   │   │
│   │   ├── (protected)/                     # 🆕 Grupo de rotas protegidas
│   │   │   ├── layout.tsx                   # 🆕 Layout com AuthGuard
│   │   │   └── ...                          # Rotas protegidas existentes
│   │   │
│   │   ├── layout.tsx                       # ✏️ Modificar: adicionar AuthProvider
│   │   └── page.tsx                         # ✏️ Mover para (protected)
│   │
│   ├── components/
│   │   ├── Auth/                            # 🆕 Componentes de autenticação
│   │   │   ├── LoginForm/
│   │   │   │   └── index.tsx                # 🆕 Formulário de login
│   │   │   ├── RegisterForm/
│   │   │   │   └── index.tsx                # 🆕 Formulário de registro
│   │   │   ├── RecoverPasswordForm/
│   │   │   │   └── index.tsx                # 🆕 Recuperar senha
│   │   │   ├── ResetPasswordForm/
│   │   │   │   └── index.tsx                # 🆕 Redefinir senha
│   │   │   ├── AuthGuard/
│   │   │   │   └── index.tsx                # 🆕 Proteção client-side
│   │   │   ├── PasswordStrength/
│   │   │   │   └── index.tsx                # 🆕 Indicador de senha
│   │   │   └── VerifyEmailMessage/
│   │   │       └── index.tsx                # 🆕 Mensagem de verificação
│   │   │
│   │   └── Admin/
│   │       └── MenuNav/
│   │           └── index.tsx                # ✏️ Modificar: integrar auth real
│   │
│   ├── hooks/
│   │   └── useAuth.tsx                      # ✏️ Melhorar mensagens de erro
│   │
│   └── lib/
│       ├── authErrors.ts                    # 🆕 Traduções de erros
│       └── authHelpers.ts                   # 🆕 Funções auxiliares
│
├── middleware.ts                            # 🆕 Middleware de proteção
└── README.md                                # ✏️ Atualizar documentação

🆕 = Arquivo novo
✏️ = Arquivo a modificar
```

---

## 🎨 Templates de Código

### 1. LoginForm Component

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido";
    }
    
    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await signIn(email, password);
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta.",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          disabled={loading}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}
```

### 2. AuthGuard Component

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "accountant" | "viewer";
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

export default function AuthGuard({
  children,
  requiredRole,
  fallback,
  loadingFallback,
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Loading
  if (loading) {
    return loadingFallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Não autenticado
  if (!user) {
    return fallback || null;
  }

  // Verificar role se necessário
  if (requiredRole && user.profile?.role !== requiredRole) {
    if (requiredRole === "admin" && user.profile?.role !== "admin") {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
            <p>Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
```

### 3. Middleware

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Rotas públicas
  const publicRoutes = ['/login', '/registro', '/recuperar-senha', '/redefinir-senha', '/verificar-email']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Se está em rota pública e autenticado, redirecionar para home
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Se não está autenticado e tentando acessar rota protegida
  if (!isPublicRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 4. AuthLayout

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Gestor NF",
  description: "Sistema de gestão de notas fiscais",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            Gestor NF
          </h1>
          <p className="text-gray-600">
            Sistema de Gestão de Notas Fiscais
          </p>
        </div>

        {/* Card com formulário */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2025 Gestor NF. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
```

### 5. Página de Login

```typescript
import LoginForm from "@/components/Auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Bem-vindo de volta</h2>
        <p className="text-gray-600 mt-2">
          Entre com suas credenciais para acessar o sistema
        </p>
      </div>

      <LoginForm />

      <div className="space-y-3 text-center text-sm">
        <Link
          href="/recuperar-senha"
          className="text-blue-600 hover:underline block"
        >
          Esqueci minha senha
        </Link>

        <div className="border-t pt-3">
          <span className="text-gray-600">Não tem uma conta? </span>
          <Link
            href="/registro"
            className="text-blue-600 hover:underline font-medium"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### 6. Tradução de Erros

```typescript
// src/lib/authErrors.ts

export const authErrorMessages: Record<string, string> = {
  // Supabase Auth Errors
  'Invalid login credentials': 'Email ou senha incorretos',
  'Email not confirmed': 'Por favor, confirme seu email antes de fazer login',
  'User already registered': 'Este email já está cadastrado',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
  'Unable to validate email address: invalid format': 'Formato de email inválido',
  'Password too weak': 'Senha muito fraca. Use pelo menos 8 caracteres, uma letra maiúscula e um número',
  'Signup disabled': 'Cadastro de novos usuários está desabilitado',
  'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos e tente novamente',
  'Invalid token': 'Link inválido ou expirado',
  'Token has expired': 'Este link expirou. Solicite um novo',
  'User not found': 'Usuário não encontrado',
  
  // Erros genéricos
  'Network request failed': 'Erro de conexão. Verifique sua internet',
  'Failed to fetch': 'Erro de conexão. Verifique sua internet',
  'Authentication session missing': 'Sessão expirada. Faça login novamente',
  'Auth session missing': 'Sessão expirada. Faça login novamente',
  
  // Default
  'default': 'Ocorreu um erro. Tente novamente',
};

export function translateAuthError(error: string): string {
  return authErrorMessages[error] || authErrorMessages['default'];
}
```

---

## 🎯 Checklist de Implementação Rápida

### Sprint 1 - MVP (2 dias)

```
Dia 1 - Manhã
[ ] Criar estrutura de pastas (auth)
[ ] Criar AuthLayout
[ ] Criar página /login vazia
[ ] Testar routing

Dia 1 - Tarde
[ ] Implementar LoginForm completo
[ ] Adicionar validações
[ ] Testar login manual
[ ] Adicionar mensagens de erro

Dia 2 - Manhã
[ ] Adicionar AuthProvider no layout principal
[ ] Criar middleware básico
[ ] Testar proteção de rotas
[ ] Ajustar redirecionamentos

Dia 2 - Tarde
[ ] Integrar dados reais no MenuNav
[ ] Implementar logout funcional
[ ] Testes completos do fluxo
[ ] Correções de bugs
```

### Sprint 2 - Registro (2 dias)

```
Dia 3 - Manhã
[ ] Criar RegisterForm
[ ] Adicionar validações de senha
[ ] Criar PasswordStrength component
[ ] Testar criação de usuário

Dia 3 - Tarde
[ ] Configurar emails no Supabase
[ ] Criar página de verificação
[ ] Testar fluxo completo de registro
[ ] Ajustes de UX

Dia 4 - Manhã
[ ] Criar RecoverPasswordForm
[ ] Criar ResetPasswordForm
[ ] Configurar fluxo de recuperação
[ ] Testar fluxo completo

Dia 4 - Tarde
[ ] Criar AuthGuard component
[ ] Aplicar em rotas necessárias
[ ] Testes de proteção
[ ] Ajustes finais
```

---

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install @supabase/auth-helpers-nextjs

# Rodar em desenvolvimento
npm run dev

# Verificar tipos
npx tsc --noEmit

# Lint
npm run lint

# Build para produção
npm run build
```

---

## 🐛 Troubleshooting Rápido

### Erro: "Supabase client is not initialized"
**Solução**: Verificar variáveis de ambiente em `.env.local`

### Erro: "Middleware redirect loop"
**Solução**: Verificar configuração de rotas públicas no middleware

### Erro: "Session not persisting"
**Solução**: Usar `createMiddlewareClient` do Supabase Auth Helpers

### Erro: "Invalid login credentials"
**Solução**: Verificar se usuário existe e senha está correta no Supabase Dashboard

### Erro: "Email not confirmed"
**Solução**: Desabilitar confirmação de email em dev ou confirmar no Supabase Dashboard

---

## 📱 Breakpoints Responsivos

```typescript
// Tailwind breakpoints padrão
sm: '640px'   // Mobile landscape / Tablet portrait
md: '768px'   // Tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
2xl: '1536px' // Extra large
```

---

## 🎨 Variáveis CSS do Projeto

```css
--cor-primaria: #1976d2
--cor-secundaria: #219b9d
--background-color: #ffffff
--cor-texto: #333333
--cor-borda: #e0e0e0
--sombra-suave: 0 2px 8px rgba(0, 0, 0, 0.1)
--transicao-suave: all 0.2s ease
```

---

## ✅ Critérios de Pronto (DoD)

Antes de marcar uma tarefa como completa:

- [ ] Código implementado e funcionando
- [ ] Tipos TypeScript corretos (sem `any`)
- [ ] Sem erros de linter
- [ ] Testado manualmente
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Mensagens de erro amigáveis
- [ ] Loading states implementados
- [ ] Validações (cliente e servidor)

---

## 📞 Quando Precisar de Ajuda

1. **Revisar documentação**: [Planejamento Completo](./PLANEJAMENTO-AUTENTICACAO.md)
2. **Consultar fase específica**: Cada fase tem critérios de sucesso claros
3. **Verificar exemplos**: Este documento tem templates prontos
4. **Documentação oficial**: Supabase e Next.js docs

---

**Última atualização**: 2025-10-22
**Versão**: 1.0.0

