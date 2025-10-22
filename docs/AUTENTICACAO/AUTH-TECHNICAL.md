# 🏗️ Documentação Técnica - Sistema de Autenticação

## 📋 Visão Geral

Este documento descreve a arquitetura técnica, fluxos de dados e implementação do sistema de autenticação do Gestor de Notas Fiscais.

**Tecnologias**:
- **Backend**: Supabase Auth
- **Frontend**: Next.js 15, React 19, TypeScript
- **Proteção**: Middleware (servidor) + AuthGuard (cliente)
- **Estado**: React Context API
- **Validação**: Zod + validação customizada
- **UI**: Tailwind CSS + shadcn/ui

---

## 🏛️ Arquitetura

### Camadas de Segurança

O sistema implementa **defesa em profundidade** com 3 camadas:

```
┌─────────────────────────────────────────┐
│  1. MIDDLEWARE (Servidor)               │
│  - Verifica sessão antes da página     │
│  - Redireciona não autenticados         │
│  - Valida roles para rotas admin        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. AUTHGUARD (Cliente)                 │
│  - Proteção adicional no React          │
│  - Verifica roles específicos            │
│  - Fallbacks customizáveis               │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. RLS (Banco de Dados)                │
│  - Políticas no Supabase                │
│  - Filtro automático de dados            │
│  - Fail secure                           │
└─────────────────────────────────────────┘
```

### Componentes Principais

```
src/
├── hooks/
│   └── useAuth.tsx              # Context Provider + hooks
├── lib/
│   ├── auth.ts                  # Funções de autenticação
│   ├── authErrors.ts            # Tradução de erros
│   └── logger.ts                # Logger com controle por env
├── components/
│   └── Auth/
│       ├── LoginForm/           # Formulário de login
│       ├── RegisterForm/        # Formulário de registro
│       ├── RecoverPasswordForm/ # Recuperação de senha
│       ├── ResetPasswordForm/   # Redefinição de senha
│       ├── AuthGuard/           # Proteção client-side
│       └── AuthErrorHandler/    # Handler de erros
├── app/
│   ├── (auth)/                  # Route group público
│   ├── (protected)/             # Route group protegido
│   └── (admin)/                 # Route group admin
└── middleware.ts                # Proteção server-side
```

---

## 🔄 Fluxos de Dados

### 1. Fluxo de Login

```
1. Usuário acessa /login
   ↓
2. Middleware: permite (rota pública)
   ↓
3. Página renderiza LoginForm
   ↓
4. Usuário preenche email/senha
   ↓
5. Validação client-side (tempo real)
   ↓
6. Submit → useAuth.signIn(email, password)
   ↓
7. auth.ts → supabase.auth.signInWithPassword()
   ↓
8. Supabase valida credenciais
   ↓
9. Supabase retorna sessão + user
   ↓
10. getCurrentUser() busca profile (users_profile)
    ↓
11. setUser({ id, email, profile })
    ↓
12. AuthContext atualizado (todos componentes notificados)
    ↓
13. Toast: "Login realizado com sucesso!"
    ↓
14. Router.push(redirect || "/")
    ↓
15. Middleware: permite (usuário autenticado)
    ↓
16. Dashboard renderizado
```

### 2. Fluxo de Registro

```
1. Usuário acessa /registro
   ↓
2. Middleware: permite (rota pública)
   ↓
3. Página renderiza RegisterForm
   ↓
4. Usuário preenche nome, email, senha
   ↓
5. Validação em tempo real:
   - Email: formato válido
   - Senha: força (indicador visual)
   - Confirmação: senhas coincidem
   ↓
6. Submit → useAuth.signUp(email, password, nome)
   ↓
7. auth.ts → supabase.auth.signUp()
   ↓
8. Supabase cria usuário no Auth
   ↓
9. Supabase dispara trigger: create_user_profile()
   ↓
10. Profile criado em users_profile (role: viewer)
    ↓
11. Supabase envia email de verificação
    ↓
12. Toast: "Cadastro realizado! Verifique seu email"
    ↓
13. Router.push(/verificar-email?email=...)
    ↓
14. Usuário recebe email com link
    ↓
15. Clica no link → Supabase confirma email
    ↓
16. Usuário pode fazer login
```

### 3. Fluxo de Proteção de Rota

```
MIDDLEWARE (executa em TODAS as requisições)
↓
1. Criar Supabase client com cookies
   ↓
2. await supabase.auth.getSession()
   ↓
3. Tem sessão?
   ├─ NÃO → 4a
   └─ SIM → 4b

4a. NÃO AUTENTICADO:
    ↓
    Rota é pública? (/login, /registro)
    ├─ SIM → Permitir acesso
    └─ NÃO → Redirecionar para /login?redirect=...

4b. AUTENTICADO:
    ↓
    Rota é pública?
    ├─ SIM → Redirecionar para / (já está logado)
    └─ NÃO → 5

5. Rota requer role específica? (/admin/*)
   ├─ NÃO → Permitir acesso
   └─ SIM → 6

6. Buscar profile do usuário
   ↓
7. Verificar se role é suficiente
   ├─ SIM → Permitir acesso
   └─ NÃO → Redirecionar para /?error=unauthorized
```

### 4. Fluxo de Logout

```
1. Usuário clica em "Sair" (MenuNav)
   ↓
2. handleLogout() executado
   ↓
3. setIsLoggingOut(true)
   ↓
4. UI: Spinner + "Saindo..."
   ↓
5. await signOut()
   ↓
6. auth.ts → supabase.auth.signOut()
   ↓
7. Supabase limpa sessão (cookies)
   ↓
8. setUser(null) → AuthContext limpo
   ↓
9. Toast: "Logout realizado"
   ↓
10. setTimeout 500ms (permite ver toast)
    ↓
11. Router.push("/login")
    ↓
12. Middleware: redireciona (sem sessão)
    ↓
13. Página de login exibida
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `users_profile`

```sql
CREATE TABLE users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'accountant', 'viewer')),
  empresa_id UUID REFERENCES empresas(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos**:
- `id`: UUID que referencia `auth.users` (Supabase Auth)
- `email`: Email do usuário (único)
- `nome`: Nome completo do usuário
- `role`: Nível de acesso (admin, accountant, viewer)
- `empresa_id`: Empresa associada (para accountant)
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### Políticas RLS

```sql
-- Usuários podem ver seu próprio profile
CREATE POLICY "Users can view own profile" ON users_profile
FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio profile (exceto role)
CREATE POLICY "Users can update own profile" ON users_profile
FOR UPDATE USING (auth.uid() = id);

-- Admins podem ver todos os profiles
CREATE POLICY "Admins can view all profiles" ON users_profile
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins podem gerenciar profiles
CREATE POLICY "Admins can manage profiles" ON users_profile
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### Trigger: Criar Profile Automaticamente

```sql
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profile (id, email, nome, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();
```

---

## 🔑 Sistema de Roles

### Hierarquia

```
admin (nível 3)
  ↓ pode tudo que accountant pode +
  ↓ gerenciar usuários
  ↓ gerenciar todas as empresas
  
accountant (nível 2)
  ↓ pode tudo que viewer pode +
  ↓ criar/editar notas fiscais da sua empresa
  
viewer (nível 1)
  ↓ apenas visualizar dados
```

### Verificação de Role

**Hierárquica** (role >= required):
```typescript
const roleHierarchy = {
  admin: 3,
  accountant: 2,
  viewer: 1,
};

const userLevel = roleHierarchy[user.role];
const requiredLevel = roleHierarchy[requiredRole];
const hasPermission = userLevel >= requiredLevel;
```

**Lista** (role IN allowed):
```typescript
const allowedRoles = ['admin', 'accountant'];
const hasPermission = allowedRoles.includes(user.role);
```

### Adicionar Nova Role

1. **Atualizar tipo no TypeScript**:
```typescript
// src/types/models.ts
export type UserRole = 'admin' | 'accountant' | 'viewer' | 'nova_role';
```

2. **Atualizar constraint no banco**:
```sql
ALTER TABLE users_profile 
DROP CONSTRAINT users_profile_role_check;

ALTER TABLE users_profile 
ADD CONSTRAINT users_profile_role_check 
CHECK (role IN ('admin', 'accountant', 'viewer', 'nova_role'));
```

3. **Atualizar hierarquia**:
```typescript
// src/components/Auth/AuthGuard/index.tsx
const roleHierarchy = {
  admin: 4,
  nova_role: 3,
  accountant: 2,
  viewer: 1,
};
```

4. **Adicionar tradução**:
```typescript
// src/components/Admin/MenuNav/index.tsx
const roleNames = {
  admin: "Administrador",
  accountant: "Contador",
  viewer: "Visualizador",
  nova_role: "Nova Role",
};
```

---

## 🛡️ Segurança

### Princípios Implementados

1. **Nunca confie no cliente**
   - Validação no servidor (middleware)
   - RLS no banco de dados
   - Tokens seguros

2. **Defesa em profundidade**
   - 3 camadas de proteção
   - Cada camada independente
   - Fail secure

3. **Menor privilégio**
   - Role padrão: viewer
   - Usuários só veem seus dados
   - Admins explicitamente definidos

4. **Fail secure**
   - Em erro, negar acesso
   - Timeouts com fallback
   - Validação rigorosa

### Tokens e Sessões

**JWT Token**:
- Duração: 1 hora
- Armazenado em cookie HTTP-only
- Refresh automático antes de expirar

**Refresh Token**:
- Duração: 30 dias (padrão Supabase)
- Usado para gerar novo JWT
- Revogado ao fazer logout

**Session Storage**:
- Cookies: `sb-access-token`, `sb-refresh-token`
- localStorage: usado pelo Supabase client
- Limpo ao fazer logout

### Rate Limiting

**Supabase** (configurado no dashboard):
- Login: 5 tentativas por hora por IP
- Registro: 10 por hora por IP
- Recuperação senha: 3 por hora por email

**Future**: Implementar rate limiting adicional no middleware

---

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Obrigatórias
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # NUNCA expor ao cliente!

# Opcionais
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Para redirects
NODE_ENV=development  # Controla logs (via logger.ts)
```

### Configuração Supabase Dashboard

**Authentication > Settings**:
```
☑ Enable email confirmations
☑ Double confirm email changes
☐ Disable phone confirmations (não usado)
☑ Enable custom SMTP (recomendado para produção)
```

**Authentication > URL Configuration**:
```
Site URL: http://localhost:3000 (dev) | https://seu-dominio.com (prod)
Redirect URLs: 
  - http://localhost:3000/**
  - https://seu-dominio.com/**
```

**Authentication > Email Templates**:
- Customizar templates (ver `EMAIL-TEMPLATES.md`)
- Usar logo e cores da marca
- Mensagens em português

---

## 🐛 Troubleshooting

### "Auth session missing!"

**Causa**: Usuário não está autenticado  
**Solução**: Esperado quando não há sessão. Não é erro crítico.

**No código**:
```typescript
// src/lib/auth.ts
if (authError) {
  logger.debug("ℹ️ Sessão não encontrada:", authError.message);
  return null; // Não é erro, apenas sem sessão
}
```

### "Timeout ao buscar profile"

**Causa**: Banco de dados lento ou conexão ruim  
**Solução**: Timeout aumentado para 8s com fallback

**No código**:
```typescript
// src/lib/auth.ts
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error("Timeout")), 8000)
);
```

### Loop de redirecionamento

**Causa**: Middleware e página em conflito  
**Solução**: 
1. Verificar que existe APENAS `src/app/(protected)/page.tsx`
2. NÃO deve existir `src/app/page.tsx`
3. Reiniciar servidor dev

### Sessão não persiste

**Causa**: Cookies não estão sendo salvos  
**Solução**:
1. Verificar que `@supabase/ssr` está instalado
2. Verificar que middleware usa `createServerClient`
3. Limpar cookies e localStorage

---

## 📊 Métricas e Monitoramento

### Logs em Desenvolvimento

```typescript
// src/lib/logger.ts
// Só exibe em NODE_ENV=development
logger.debug("🔍 Info de debug");
logger.warn("⚠️ Aviso");

// Sempre exibe
logger.error("❌ Erro crítico");
```

### Logs no Middleware

```
🔍 Middleware executado para: /
📍 Sessão encontrada: ✅ SIM
📧 Email: usuario@exemplo.com
✅ Middleware: Acesso autorizado para /
```

### Auditoria (Future)

Implementar tabela de auditoria:
```sql
CREATE TABLE auth_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'login', 'logout', 'failed_login'
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Performance

### Otimizações Implementadas

1. **Cache de usuário**: Context evita múltiplas queries
2. **Timeout razoável**: 8s para evitar warnings
3. **Fallback de profile**: Continua sem profile se timeout
4. **Bundle otimizado**: Components code-split
5. **Lazy loading**: AuthGuard só carrega quando necessário

### Métricas Esperadas

- **Login**: < 2s
- **Verificação de auth**: < 1s
- **Middleware**: < 500ms
- **Bundle auth**: ~50KB

---

## 📚 Referências

### Documentação Externa

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [@supabase/ssr](https://github.com/supabase/auth-helpers)

### Documentação Interna

- `PLANEJAMENTO-AUTENTICACAO.md` - Fases 1-12
- `FLUXOS.md` - Diagramas de fluxo
- `AUTH-DEVELOPER-GUIDE.md` - Guia prático
- `FASE-*-IMPLEMENTACAO.md` - Detalhes de cada fase

---

**Documento atualizado**: 2025-10-22  
**Versão do Sistema**: 1.0.0  
**Mantenedor**: Marcos Rocha


