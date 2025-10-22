# 🔄 Fluxos de Autenticação - Diagramas

Este documento contém todos os fluxos de autenticação do sistema em formato visual (texto).

---

## 🔐 Fluxo 1: Login

```
┌─────────────────────────────────────────────────────────────────┐
│                          FLUXO DE LOGIN                          │
└─────────────────────────────────────────────────────────────────┘

Usuário
   │
   ├──> Acessa /login
   │
   v
┌──────────────────┐
│  Página de Login │
│  - Campo email   │
│  - Campo senha   │
│  - Botão entrar  │
└────────┬─────────┘
         │
         ├──> Preenche credenciais
         │
         v
┌──────────────────────┐
│  Validação Cliente   │
│  - Email válido?     │
│  - Senha >= 6 chars? │
└────────┬─────────────┘
         │
         ├─── Erro? ──> Exibir mensagem
         │
         v
┌──────────────────────┐
│  useAuth.signIn()    │
│  - Chama Supabase    │
│  - Loading state     │
└────────┬─────────────┘
         │
         v
    Supabase Auth
         │
         ├─── Credenciais válidas?
         │
     ┌───┴───┐
   SIM      NÃO
     │        │
     v        v
  Sucesso   Erro
     │        │
     │        └──> Toast: "Email ou senha incorretos"
     │
     v
┌──────────────────────┐
│  Salvar Sessão       │
│  - Token JWT         │
│  - Cookies           │
│  - localStorage      │
└────────┬─────────────┘
         │
         v
┌──────────────────────┐
│  Buscar Profile      │
│  - users_profile     │
│  - Nome, Role, etc   │
└────────┬─────────────┘
         │
         v
┌──────────────────────┐
│  Atualizar Context   │
│  - setUser(data)     │
│  - setLoading(false) │
└────────┬─────────────┘
         │
         v
┌──────────────────────┐
│  Redirecionar        │
│  - Se redirect query │
│  - Senão → "/"       │
└────────┬─────────────┘
         │
         v
    Dashboard
```

---

## 📝 Fluxo 2: Registro

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUXO DE REGISTRO                         │
└─────────────────────────────────────────────────────────────────┘

Usuário
   │
   ├──> Acessa /registro
   │
   v
┌──────────────────────┐
│  Página de Registro  │
│  - Campo nome        │
│  - Campo email       │
│  - Campo senha       │
│  - Confirmar senha   │
│  - Botão registrar   │
└────────┬─────────────┘
         │
         ├──> Preenche dados
         │
         v
┌──────────────────────────────┐
│  Validação em Tempo Real     │
│  - Email: formato válido     │
│  - Senha: força (indicador)  │
│  - Confirmar: senhas iguais  │
└────────┬─────────────────────┘
         │
         ├─── Erro? ──> Feedback imediato
         │
         v
┌──────────────────────────────┐
│  Validação Final (Submit)    │
│  - Todas validações OK?      │
└────────┬─────────────────────┘
         │
         ├─── Não ──> Exibir mensagens de erro
         │
         v
┌──────────────────────────────┐
│  useAuth.signUp()            │
│  - Chama Supabase            │
│  - Loading state             │
└────────┬─────────────────────┘
         │
         v
    Supabase Auth
         │
         ├─── Email já existe?
         │
     ┌───┴───┐
   NÃO      SIM
     │        │
     │        └──> Erro: "Email já cadastrado"
     │
     v
┌──────────────────────────────┐
│  Criar Usuário Auth          │
│  - Gerar ID                  │
│  - Hash senha                │
│  - Gerar token verificação   │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Criar Profile               │
│  - INSERT users_profile      │
│  - Nome, Email, Role         │
│  - Role padrão: "viewer"     │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Enviar Email Verificação    │
│  - Template customizado      │
│  - Link com token            │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Mostrar Mensagem Sucesso    │
│  "Verifique seu email..."    │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Redirecionar                │
│  → /verificar-email          │
└──────────────────────────────┘
```

---

## 🔑 Fluxo 3: Recuperação de Senha

```
┌─────────────────────────────────────────────────────────────────┐
│                   FLUXO DE RECUPERAÇÃO DE SENHA                  │
└─────────────────────────────────────────────────────────────────┘

Usuário
   │
   ├──> Clica "Esqueci minha senha"
   │
   v
┌──────────────────────────────┐
│  Página Recuperar Senha      │
│  - Campo email               │
│  - Botão enviar              │
└────────┬─────────────────────┘
         │
         ├──> Insere email
         │
         v
┌──────────────────────────────┐
│  Validação                   │
│  - Email válido?             │
└────────┬─────────────────────┘
         │
         ├─── Não ──> Exibir erro
         │
         v
┌──────────────────────────────┐
│  useAuth.resetPassword()     │
│  - Chama Supabase            │
│  - Loading state             │
└────────┬─────────────────────┘
         │
         v
    Supabase Auth
         │
         ├─── Email existe?
         │
     ┌───┴───┐
   SIM      NÃO
     │        │
     │        ├──> (Não revelar ao usuário)
     │        │
     v        v
┌──────────────────────────────┐
│  Enviar Email (se existir)   │
│  - Link com token único      │
│  - Expiração: 1 hora         │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Mensagem Genérica           │
│  "Se o email existir,        │
│   enviaremos instruções"     │
└────────┬─────────────────────┘
         │
         v
    Aguardando...
         │
         v
┌──────────────────────────────┐
│  Usuário Recebe Email        │
│  - Clica no link             │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Validar Token               │
│  - Token válido?             │
│  - Não expirado?             │
│  - Não usado?                │
└────────┬─────────────────────┘
         │
         ├─── Inválido ──> "Link inválido ou expirado"
         │
         v
┌──────────────────────────────┐
│  Página Redefinir Senha      │
│  - Campo nova senha          │
│  - Confirmar nova senha      │
│  - Indicador de força        │
│  - Botão salvar              │
└────────┬─────────────────────┘
         │
         ├──> Preenche nova senha
         │
         v
┌──────────────────────────────┐
│  Validações                  │
│  - Senha >= 8 chars          │
│  - Força adequada            │
│  - Senhas coincidem          │
└────────┬─────────────────────┘
         │
         ├─── Não ──> Exibir erros
         │
         v
┌──────────────────────────────┐
│  Atualizar Senha             │
│  - Supabase Auth             │
│  - Hash nova senha           │
│  - Invalidar token           │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Invalidar Sessões Antigas   │
│  - Logout de todos devices   │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Sucesso                     │
│  "Senha alterada!"           │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Redirecionar                │
│  → /login                    │
│  (com mensagem de sucesso)   │
└──────────────────────────────┘
```

---

## 🚪 Fluxo 4: Logout

```
┌─────────────────────────────────────────────────────────────────┐
│                          FLUXO DE LOGOUT                         │
└─────────────────────────────────────────────────────────────────┘

Usuário (autenticado)
   │
   ├──> Clica no menu de usuário
   │
   v
┌──────────────────────────────┐
│  Dropdown Menu               │
│  - Perfil                    │
│  - Configurações             │
│  - [Sair]  ← Clica aqui      │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  useAuth.signOut()           │
│  - setLoading(true)          │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Supabase Auth               │
│  - Invalidar token JWT       │
│  - Limpar cookies            │
│  - Remover sessão            │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Limpar Estado Local         │
│  - setUser(null)             │
│  - Limpar localStorage       │
│  - Reset context             │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Toast                       │
│  "Você saiu com sucesso"     │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Redirecionar                │
│  → /login                    │
└──────────────────────────────┘
```

---

## 🛡️ Fluxo 5: Proteção de Rotas (Middleware)

```
┌─────────────────────────────────────────────────────────────────┐
│                   FLUXO DE PROTEÇÃO DE ROTAS                     │
└─────────────────────────────────────────────────────────────────┘

Usuário tenta acessar URL
         │
         v
┌──────────────────────────────┐
│  Next.js Middleware          │
│  (middleware.ts)             │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Criar Supabase Client       │
│  - Com cookies da request    │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Verificar Sessão            │
│  - getSession()              │
└────────┬─────────────────────┘
         │
         v
    Tem sessão válida?
         │
     ┌───┴───┐
   SIM      NÃO
     │        │
     v        v
  [A]       [B]


[A] USUÁRIO AUTENTICADO:
         │
         v
    URL é pública?
    (/login, /registro)
         │
     ┌───┴───┐
   SIM      NÃO
     │        │
     v        v
  Redir    Permitir
  para     acesso
   "/"      ↓
          [C]


[B] USUÁRIO NÃO AUTENTICADO:
         │
         v
    URL é pública?
         │
     ┌───┴───┐
   SIM      NÃO
     │        │
     v        v
  Permitir  Redir
  acesso   /login
             ↓
         (salvar
          redirect
           URL)


[C] VERIFICAR PERMISSÕES:
         │
         v
    Rota requer role?
    (ex: /admin → admin)
         │
     ┌───┴───┐
   SIM      NÃO
     │        │
     v        │
  Buscar     │
  profile    │
     │        │
     v        │
  Tem role?  │
     │        │
 ┌───┴───┐   │
SIM    NÃO   │
 │      │    │
 v      v    v
Permitir ┌───────────┐
acesso   │  Redir    │
         │  → "/"    │
         │  (+ erro) │
         └───────────┘
```

---

## 🔄 Fluxo 6: Verificação de Autenticação (AuthProvider)

```
┌─────────────────────────────────────────────────────────────────┐
│              FLUXO DE VERIFICAÇÃO DE AUTENTICAÇÃO                │
└─────────────────────────────────────────────────────────────────┘

App Inicia
   │
   v
┌──────────────────────────────┐
│  AuthProvider montado        │
│  - useEffect inicial         │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  setLoading(true)            │
│  Timeout de segurança (10s)  │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  getCurrentUser()            │
│  - Supabase.auth.getUser()   │
└────────┬─────────────────────┘
         │
         v
    Usuário encontrado?
         │
     ┌───┴───┐
   SIM      NÃO
     │        │
     v        v
  [A]       [B]


[A] USUÁRIO ENCONTRADO:
         │
         v
┌──────────────────────────────┐
│  Buscar Profile              │
│  - Query users_profile       │
│  - Timeout: 3s               │
└────────┬─────────────────────┘
         │
         ├─── Timeout/Erro ──> Continuar sem profile
         │
         v
┌──────────────────────────────┐
│  setUser({                   │
│    id,                       │
│    email,                    │
│    profile                   │
│  })                          │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  setLoading(false)           │
└────────┬─────────────────────┘
         │
         v
    App renderiza
    (usuário logado)


[B] USUÁRIO NÃO ENCONTRADO:
         │
         v
┌──────────────────────────────┐
│  setUser(null)               │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  setLoading(false)           │
└────────┬─────────────────────┘
         │
         v
    App renderiza
    (usuário não logado)
         │
         v
    Middleware redireciona
    para /login


LISTENER DE MUDANÇAS:
┌──────────────────────────────┐
│  onAuthStateChange()         │
│  - Escuta eventos:           │
│    * SIGNED_IN               │
│    * SIGNED_OUT              │
│    * TOKEN_REFRESHED         │
└────────┬─────────────────────┘
         │
         v
    Evento detectado
         │
         v
┌──────────────────────────────┐
│  Atualizar estado            │
│  - Se SIGNED_IN: buscar user │
│  - Se SIGNED_OUT: setUser(null)│
└──────────────────────────────┘
```

---

## 👤 Fluxo 7: Verificação de Role

```
┌─────────────────────────────────────────────────────────────────┐
│                   FLUXO DE VERIFICAÇÃO DE ROLE                   │
└─────────────────────────────────────────────────────────────────┘

Usuário acessa página
   │
   v
┌──────────────────────────────┐
│  AuthGuard Component         │
│  <AuthGuard                  │
│    requiredRole="admin"      │
│  >                           │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  useAuth()                   │
│  - Obter user                │
│  - Obter loading             │
└────────┬─────────────────────┘
         │
         v
    Loading?
         │
     ┌───┴───┐
   SIM      NÃO
     │        │
     v        v
  Exibir    [A]
  Loading
  Spinner


[A] VERIFICAR USUÁRIO:
         │
         v
    User existe?
         │
     ┌───┴───┐
   SIM      NÃO
     │        │
     v        v
   [B]    Redirecionar
          → /login


[B] VERIFICAR ROLE:
         │
         v
    Role requerida?
         │
     ┌───┴───┐
   SIM      NÃO
     │        │
     v        │
  user.      │
  profile.   │
  role ==    │
  required   │
  Role?      │
     │        │
 ┌───┴───┐   │
SIM    NÃO   │
 │      │    │
 v      v    v
Renderizar ┌──────────────┐
children   │  Exibir      │
           │  "Acesso     │
           │  Negado"     │
           └──────────────┘


EXEMPLOS DE ROLES:
┌────────────────────────────────────────┐
│  admin      → Acesso total             │
│  accountant → Gerenciar notas          │
│  viewer     → Apenas visualizar        │
└────────────────────────────────────────┘

HIERARQUIA:
  admin > accountant > viewer

VERIFICAÇÕES COMUNS:
┌────────────────────────────────────────┐
│  requireAuth()                         │
│  → Qualquer usuário autenticado        │
│                                        │
│  requireRole(['admin'])                │
│  → Apenas admin                        │
│                                        │
│  requireRole(['admin', 'accountant'])  │
│  → Admin ou contador                   │
└────────────────────────────────────────┘
```

---

## 🔄 Fluxo 8: Refresh de Token

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE REFRESH DE TOKEN                     │
└─────────────────────────────────────────────────────────────────┘

Sessão ativa
   │
   v
┌──────────────────────────────┐
│  Supabase Client             │
│  - Monitora expiração        │
│  - Token JWT (1 hora)        │
└────────┬─────────────────────┘
         │
         │ (tempo passa...)
         │
         v
    Token próximo
    da expiração?
    (< 5 minutos)
         │
         v
┌──────────────────────────────┐
│  Auto Refresh                │
│  - Supabase faz              │
│    automaticamente           │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Chamar refresh endpoint     │
│  - Com refresh token         │
└────────┬─────────────────────┘
         │
         v
    Refresh válido?
         │
     ┌───┴───┐
   SIM      NÃO
     │        │
     v        v
  [A]       [B]


[A] REFRESH SUCESSO:
         │
         v
┌──────────────────────────────┐
│  Novo Token JWT              │
│  - Nova expiração (1h)       │
│  - Atualizar cookies         │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Disparar evento             │
│  TOKEN_REFRESHED             │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  AuthProvider listener       │
│  - Atualizar estado          │
└────────┬─────────────────────┘
         │
         v
    Continuar sessão


[B] REFRESH FALHOU:
         │
         v
┌──────────────────────────────┐
│  Refresh token inválido      │
│  - Expirado                  │
│  - Revogado                  │
│  - Corrompido                │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Limpar sessão               │
│  - setUser(null)             │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Toast                       │
│  "Sessão expirada"           │
└────────┬─────────────────────┘
         │
         v
┌──────────────────────────────┐
│  Redirecionar                │
│  → /login                    │
└──────────────────────────────┘


TIMING:
┌────────────────────────────────────────┐
│  Token JWT: 1 hora                     │
│  Refresh Token: 30 dias (default)      │
│  Auto-refresh: 5 min antes expiração   │
└────────────────────────────────────────┘
```

---

## 🎯 Decisões de Arquitetura

### Por que Middleware + AuthGuard?

```
┌─────────────────────────────────────────────────────────────────┐
│                       DUPLA PROTEÇÃO                             │
└─────────────────────────────────────────────────────────────────┘

MIDDLEWARE (Server-Side)
   │
   ├─> Roda ANTES da página carregar
   ├─> Protege rotas no servidor
   ├─> Evita flicker de conteúdo protegido
   ├─> Redireciona antes de renderizar
   └─> Performance: não carrega JS desnecessário

       +

AUTH GUARD (Client-Side)
   │
   ├─> Roda DEPOIS da página carregar
   ├─> Proteção adicional no cliente
   ├─> Verifica roles específicos
   ├─> Permite fallbacks customizados
   └─> Feedback visual de carregamento

       =

SEGURANÇA EM CAMADAS
   │
   ├─> Se middleware falhar → AuthGuard pega
   ├─> Se AuthGuard falhar → API valida
   └─> Defense in depth
```

### Por que AuthProvider global?

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESTADO GLOBAL DE AUTH                         │
└─────────────────────────────────────────────────────────────────┘

SEM AuthProvider:
   │
   ├─> Cada componente busca usuário
   ├─> Múltiplas chamadas ao Supabase
   ├─> Estado inconsistente
   ├─> Performance ruim
   └─> Código duplicado

COM AuthProvider:
   │
   ├─> Busca usuário UMA vez
   ├─> Estado compartilhado
   ├─> Sincronização automática
   ├─> Performance otimizada
   └─> Código reutilizável
```

---

**Última atualização**: 2025-10-22
**Versão**: 1.0.0

