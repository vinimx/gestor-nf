# 📖 Guia do Desenvolvedor - Sistema de Autenticação

## 🎯 Objetivo

Este guia ensina como usar o sistema de autenticação no dia a dia do desenvolvimento. Se você quer detalhes técnicos, veja [AUTH-TECHNICAL.md](./AUTH-TECHNICAL.md).

---

## 🚀 Quick Start

### Como verificar se usuário está logado

```typescript
import { useAuth } from "@/hooks/useAuth";

export default function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <p>Você precisa estar logado</p>;
  }

  return <p>Olá, {user.profile?.nome || user.email}!</p>;
}
```

### Como proteger uma página inteira

```typescript
// src/app/minha-pagina/page.tsx
import AuthGuard from "@/components/Auth/AuthGuard";
import MeuConteudo from "./MeuConteudo";

export default function MinhaPageProtegida() {
  return (
    <AuthGuard>
      <MeuConteudo />
    </AuthGuard>
  );
}
```

### Como proteger um componente específico

```typescript
import { useAuth } from "@/hooks/useAuth";

export default function BotaoExcluir() {
  const { user } = useAuth();

  // Apenas admins podem excluir
  if (user?.profile?.role !== "admin") {
    return null;
  }

  return <Button variant="destructive">Excluir</Button>;
}
```

---

## 🔐 useAuth Hook

### Métodos Disponíveis

```typescript
const {
  user,              // Usuário autenticado ou null
  loading,           // true enquanto verifica auth
  signIn,            // Função de login
  signUp,            // Função de registro
  signOut,           // Função de logout
  resetPassword,     // Recuperação de senha
} = useAuth();
```

### user: Estrutura

```typescript
user = {
  id: "uuid",
  email: "usuario@exemplo.com",
  profile: {
    id: "uuid",
    email: "usuario@exemplo.com",
    nome: "João Silva",
    role: "admin",  // 'admin' | 'accountant' | 'viewer'
    empresa_id: "uuid" | null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  }
}
```

### Exemplos de Uso

#### 1. Login

```typescript
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

function LoginComponent() {
  const { signIn, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signIn(email, password);
      
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta.",
      });
      
      // Redirecionar (opcional, já é feito automaticamente)
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
```

#### 2. Registro

```typescript
import { useAuth } from "@/hooks/useAuth";

function RegisterComponent() {
  const { signUp, loading } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signUp(email, password, nome);
      
      // Usuário criado! Redireciona para verificar email
      router.push(`/verificar-email?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      // Tratar erro
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input 
        placeholder="Nome completo"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <Input 
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input 
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}
```

#### 3. Logout

```typescript
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

function LogoutButton() {
  const { signOut, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      // Erro ao deslogar (raro)
      // Mesmo assim, redirecionar para login
      router.push("/login");
    }
  };

  return (
    <Button onClick={handleLogout} disabled={loading}>
      {loading ? "Saindo..." : "Sair"}
    </Button>
  );
}
```

#### 4. Recuperar Senha

```typescript
import { useAuth } from "@/hooks/useAuth";

function RecoverPasswordComponent() {
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await resetPassword(email);
      
      // Email enviado (sempre mostra sucesso, mesmo se email não existir)
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada.",
      });
    } catch (error: any) {
      // Tratar erro
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input 
        type="email"
        placeholder="Seu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar"}
      </Button>
    </form>
  );
}
```

---

## 🛡️ AuthGuard Component

### Props

```typescript
interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: "admin" | "accountant" | "viewer";
  allowedRoles?: Array<"admin" | "accountant" | "viewer">;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  accessDeniedFallback?: ReactNode;
  noRedirect?: boolean;
  redirectTo?: string;
  fullScreen?: boolean;
}
```

### Exemplos

#### 1. Proteção Básica (Qualquer Usuário Autenticado)

```typescript
import AuthGuard from "@/components/Auth/AuthGuard";

export default function MinhaPage() {
  return (
    <AuthGuard>
      <h1>Conteúdo protegido</h1>
      <p>Apenas usuários autenticados veem isto.</p>
    </AuthGuard>
  );
}
```

#### 2. Proteção com Role Específica (Hierárquica)

```typescript
// Apenas admin e roles superiores
<AuthGuard requiredRole="admin">
  <AdminPanel />
</AuthGuard>

// Admin e accountant (hierarquia: admin > accountant > viewer)
<AuthGuard requiredRole="accountant">
  <GerenciarNotas />
</AuthGuard>
```

#### 3. Proteção com Lista de Roles (Não Hierárquica)

```typescript
// Apenas admin OU accountant (viewer não)
<AuthGuard allowedRoles={["admin", "accountant"]}>
  <EditarNota />
</AuthGuard>

// Apenas viewer (admin e accountant não)
<AuthGuard allowedRoles={["viewer"]}>
  <MensagemParaVisualizadores />
</AuthGuard>
```

#### 4. Fallback Customizado

```typescript
<AuthGuard
  fallback={
    <div>
      <h2>Acesso Restrito</h2>
      <p>Você não tem permissão para acessar este conteúdo.</p>
      <Button onClick={() => router.push("/")}>Voltar</Button>
    </div>
  }
>
  <ConteudoRestrito />
</AuthGuard>
```

#### 5. Loading Customizado

```typescript
<AuthGuard
  loadingFallback={
    <div className="flex items-center justify-center h-screen">
      <LoadingSpinner size="xl" text="Verificando permissões..." />
    </div>
  }
>
  <ConteudoProtegido />
</AuthGuard>
```

#### 6. Sem Redirecionamento Automático

```typescript
// Útil para componentes inline que não devem redirecionar a página
<AuthGuard noRedirect fullScreen={false}>
  <BotaoAdmin />
</AuthGuard>
```

#### 7. Proteger Layout Inteiro

```typescript
// src/app/(admin)/layout.tsx
import AuthGuard from "@/components/Auth/AuthGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="admin">
      <div className="admin-layout">
        <AdminSidebar />
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}
```

---

## 🚪 Middleware

O middleware é automático e não precisa de configuração. Ele protege rotas no servidor.

### Rotas Públicas (Sem Autenticação)

Estas rotas **NÃO** precisam de autenticação:

- `/login`
- `/registro`
- `/recuperar-senha`
- `/redefinir-senha`
- `/verificar-email`

### Rotas Protegidas (Precisa Estar Logado)

Todas as outras rotas requerem autenticação.

### Rotas Admin (Precisa Role Admin)

Rotas que começam com `/admin` requerem `role: "admin"`.

### Como Adicionar Nova Rota Pública

```typescript
// middleware.ts

const publicRoutes = [
  "/login",
  "/registro",
  "/recuperar-senha",
  "/redefinir-senha",
  "/verificar-email",
  "/minha-nova-rota-publica",  // Adicionar aqui
];
```

### Como Adicionar Nova Rota Admin

```typescript
// middleware.ts

const adminRoutes = [
  "/admin",
  "/usuarios",
  "/minha-nova-rota-admin",  // Adicionar aqui
];
```

---

## 🎨 UI Components

### LoadingSpinner

```typescript
import { LoadingSpinner, LoadingSpinnerFullScreen } from "@/components/ui";

// Simples
<LoadingSpinner />

// Com tamanho e texto
<LoadingSpinner size="lg" text="Carregando..." />

// Tela cheia
<LoadingSpinnerFullScreen text="Aguarde..." />

// Inline em botão
<Button disabled={loading}>
  {loading ? <LoadingSpinnerInline /> : "Salvar"}
</Button>
```

### SkeletonLoader

```typescript
import { SkeletonEmpresaCard, SkeletonForm } from "@/components/ui";

// Durante carregamento
{loading ? (
  <SkeletonEmpresaCard count={6} />
) : (
  empresas.map(e => <EmpresaCard key={e.id} {...e} />)
)}

// Formulário
{loading ? <SkeletonForm fields={5} /> : <Form />}
```

### Toast

```typescript
import { useToast } from "@/hooks/useToast";

const { toast } = useToast();

// Sucesso
toast({
  title: "Sucesso!",
  description: "Operação concluída.",
});

// Erro
toast({
  variant: "destructive",
  title: "Erro",
  description: "Algo deu errado.",
});
```

---

## ✅ Validação de Formulários

### Padrão Recomendado

```typescript
import { useState, useRef } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function FormularioExemplo() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean }>({});
  const emailRef = useRef<HTMLInputElement>(null);

  // Validação
  const validateEmail = (value: string): string | undefined => {
    if (!value) return "Email é obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email inválido";
    return undefined;
  };

  // Handler onBlur (marcar como touched)
  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    const error = validateEmail(email);
    setErrors(prev => ({ ...prev, email: error }));
  };

  // Handler onChange (validar se já tocado)
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      const error = validateEmail(value);
      setErrors(prev => ({ ...prev, email: error }));
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <div className="relative">
        <Input
          id="email"
          ref={emailRef}
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          onBlur={handleEmailBlur}
          className={cn(
            touched.email && errors.email && "border-red-500",
            touched.email && !errors.email && "border-green-500"
          )}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {/* Ícone de feedback */}
        {touched.email && (
          <div className="absolute right-3 top-3">
            {errors.email ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
          </div>
        )}
      </div>
      {/* Mensagem de erro */}
      {touched.email && errors.email && (
        <p id="email-error" className="text-sm text-red-600 mt-1">
          {errors.email}
        </p>
      )}
    </div>
  );
}
```

---

## 🔍 Como Verificar Role do Usuário

### Em Componentes

```typescript
import { useAuth } from "@/hooks/useAuth";

function MeuComponente() {
  const { user } = useAuth();

  // Verificar role específica
  if (user?.profile?.role === "admin") {
    return <AdminView />;
  }

  if (user?.profile?.role === "accountant") {
    return <AccountantView />;
  }

  return <ViewerView />;
}
```

### Hierárquica

```typescript
function isRoleAtLeast(userRole: string, requiredRole: string): boolean {
  const hierarchy = {
    admin: 3,
    accountant: 2,
    viewer: 1,
  };

  return hierarchy[userRole] >= hierarchy[requiredRole];
}

// Uso
const { user } = useAuth();

if (isRoleAtLeast(user?.profile?.role, "accountant")) {
  // Pode editar notas (accountant e admin)
}
```

### Lista

```typescript
function hasAnyRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

// Uso
const { user } = useAuth();

if (hasAnyRole(user?.profile?.role, ["admin", "accountant"])) {
  // Admin OU accountant
}
```

---

## 🌐 API Requests Autenticadas

### Com useAuth

```typescript
import { useAuth } from "@/hooks/useAuth";

function MeuComponente() {
  const { user } = useAuth();

  const fetchData = async () => {
    // Token é enviado automaticamente nos cookies
    const response = await fetch("/api/minhaRota");
    const data = await response.json();
    return data;
  };

  // ...
}
```

### Headers Customizados (Se Necessário)

```typescript
import { getSupabase } from "@/lib/supabaseClient";

const supabase = getSupabase();
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch("/api/minhaRota", {
  headers: {
    "Authorization": `Bearer ${session?.access_token}`,
  },
});
```

---

## 🚨 Tratamento de Erros

### Erros Traduzidos

```typescript
import { translateAuthError } from "@/lib/authErrors";

try {
  await signIn(email, password);
} catch (error: any) {
  const friendlyMessage = translateAuthError(error.message);
  
  toast({
    variant: "destructive",
    title: "Erro ao fazer login",
    description: friendlyMessage,
  });
}
```

### Erros Comuns

| Erro Original | Tradução |
|---------------|----------|
| `Invalid login credentials` | Email ou senha incorretos |
| `Email not confirmed` | Por favor, confirme seu email antes de fazer login |
| `User already registered` | Este email já está cadastrado |
| `Password too weak` | Senha muito fraca. Use pelo menos 8 caracteres... |
| `Token has expired` | Este link expirou. Solicite um novo |

---

## 📝 Boas Práticas

### ✅ DO (Faça)

1. **Sempre use useAuth para estado de auth**
   ```typescript
   const { user, loading } = useAuth();
   ```

2. **Proteja rotas com middleware + AuthGuard**
   ```typescript
   <AuthGuard requiredRole="admin">
     <AdminPanel />
   </AuthGuard>
   ```

3. **Mostre loading states**
   ```typescript
   if (loading) return <LoadingSpinner />;
   ```

4. **Dê feedback ao usuário**
   ```typescript
   toast({ title: "Ação realizada com sucesso!" });
   ```

5. **Valide no cliente E no servidor**
   ```typescript
   // Cliente: feedback imediato
   // Servidor: segurança real
   ```

### ❌ DON'T (Não Faça)

1. **Não confie apenas em proteção client-side**
   ```typescript
   // ❌ Ruim (fácil de bypassar)
   if (user.role !== 'admin') return null;
   
   // ✅ Bom (middleware + RLS)
   <AuthGuard requiredRole="admin">...</AuthGuard>
   ```

2. **Não armazene senha em estado**
   ```typescript
   // ❌ Nunca
   const [password, setPassword] = useState("");
   localStorage.setItem("password", password);
   ```

3. **Não exponha tokens**
   ```typescript
   // ❌ Nunca
   console.log(session?.access_token);
   ```

4. **Não ignore loading states**
   ```typescript
   // ❌ Ruim
   return <div>{user.name}</div>; // Pode quebrar se loading
   
   // ✅ Bom
   if (loading) return <LoadingSpinner />;
   return <div>{user?.name}</div>;
   ```

5. **Não faça validação só no cliente**
   ```typescript
   // ❌ Inseguro
   // Apenas validação no React
   
   // ✅ Seguro
   // Validação no React + API + RLS
   ```

---

## 🎓 Exemplos Completos

### Página Protegida com Role

```typescript
// src/app/admin/dashboard/page.tsx
import AuthGuard from "@/components/Auth/AuthGuard";
import { useAuth } from "@/hooks/useAuth";

function DashboardContent() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard Admin</h1>
      <p>Bem-vindo, {user?.profile?.nome}!</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthGuard requiredRole="admin">
      <DashboardContent />
    </AuthGuard>
  );
}
```

### Componente com Permissões Diferentes

```typescript
import { useAuth } from "@/hooks/useAuth";

function GerenciadorNotas() {
  const { user } = useAuth();
  const role = user?.profile?.role;

  return (
    <div>
      <h2>Notas Fiscais</h2>
      
      {/* Todos podem ver */}
      <NotasList />
      
      {/* Apenas accountant e admin podem editar */}
      {(role === "admin" || role === "accountant") && (
        <Button onClick={handleEdit}>Editar</Button>
      )}
      
      {/* Apenas admin pode excluir */}
      {role === "admin" && (
        <Button variant="destructive" onClick={handleDelete}>
          Excluir
        </Button>
      )}
    </div>
  );
}
```

---

## 🆘 Perguntas Frequentes

### Como sei se o usuário está logado?

```typescript
const { user } = useAuth();
const isLoggedIn = !!user;
```

### Como redirecionar após login?

Use o parâmetro `redirect`:
```
/login?redirect=/empresas
```

O sistema redireciona automaticamente após login.

### Como fazer logout?

```typescript
const { signOut } = useAuth();
await signOut();
```

### Como mudar a role de um usuário?

Via SQL (apenas admins):
```sql
UPDATE users_profile 
SET role = 'admin' 
WHERE email = 'usuario@exemplo.com';
```

### Como adicionar campos customizados ao profile?

1. Adicionar coluna no banco:
```sql
ALTER TABLE users_profile ADD COLUMN telefone TEXT;
```

2. Atualizar tipo TypeScript:
```typescript
// src/types/models.ts
export interface UserProfile {
  // ... campos existentes
  telefone?: string;
}
```

---

**Precisa de mais ajuda?**

- 🏗️ [Documentação Técnica](./AUTH-TECHNICAL.md)
- 📋 [Planejamento Completo](./PLANEJAMENTO-AUTENTICACAO.md)
- 🔄 [Diagramas de Fluxo](./FLUXOS.md)

---

**Última atualização**: 2025-10-22  
**Mantenedor**: Marcos Rocha


