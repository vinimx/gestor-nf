# Planejamento de Implementação - Sistema de Autenticação Completo

## 📋 Visão Geral

Este documento descreve o planejamento completo para implementar o sistema de autenticação no Gestor de Notas Fiscais, conectando a infraestrutura backend já existente com uma interface de usuário moderna e segura.

## 🎯 Situação Atual

### ✅ O que já temos
- Hook `useAuth` com Context Provider completo
- Funções de autenticação no backend (signIn, signUp, signOut, resetPassword)
- Integração com Supabase Auth configurada
- Sistema de roles e permissões (admin, accountant, viewer)
- Controles de autorização (requireAuth, requireRole, requireAdmin)
- Tabela `users_profile` no banco de dados

### ❌ O que falta
- Interface de usuário (páginas de login, registro, recuperação de senha)
- Proteção de rotas (middleware/guards)
- AuthProvider integrado na aplicação
- Feedback visual de estados de autenticação
- Tratamento de erros e mensagens amigáveis
- Redirecionamento automático baseado em autenticação

## 🎯 Objetivos

1. **Segurança**: Proteger todas as rotas e funcionalidades sensíveis
2. **UX**: Criar uma experiência fluida e intuitiva de autenticação
3. **Escalabilidade**: Implementar solução que suporte crescimento futuro
4. **Manutenibilidade**: Código limpo, organizado e bem documentado
5. **Compatibilidade**: Integrar perfeitamente com o sistema existente

---

## 📅 FASE 1: Preparação e Estrutura Base

**Objetivo**: Preparar a estrutura de pastas e componentes base para autenticação

### 1.1 Criar estrutura de diretórios
```
src/
├── app/
│   ├── (auth)/                    # Grupo de rotas de autenticação
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── registro/
│   │   │   └── page.tsx
│   │   ├── recuperar-senha/
│   │   │   └── page.tsx
│   │   ├── redefinir-senha/
│   │   │   └── page.tsx
│   │   └── layout.tsx             # Layout específico para auth
│   └── (protected)/               # Grupo de rotas protegidas
│       ├── layout.tsx
│       └── ...
├── components/
│   └── Auth/
│       ├── LoginForm/
│       │   └── index.tsx
│       ├── RegisterForm/
│       │   └── index.tsx
│       ├── RecoverPasswordForm/
│       │   └── index.tsx
│       ├── ResetPasswordForm/
│       │   └── index.tsx
│       └── AuthGuard/
│           └── index.tsx
└── middleware.ts                  # Middleware do Next.js
```

### 1.2 Componentes base necessários
- `LoginForm`: Formulário de login com validação
- `RegisterForm`: Formulário de registro com validação
- `RecoverPasswordForm`: Formulário de recuperação de senha
- `ResetPasswordForm`: Formulário de redefinição de senha
- `AuthGuard`: Componente para proteger rotas no lado do cliente
- `AuthLayout`: Layout limpo para páginas de autenticação

### 1.3 Melhorias no useAuth
- Adicionar mensagens de erro amigáveis
- Implementar feedback de loading states
- Adicionar validação de email e senha no frontend
- Implementar tratamento de erros do Supabase

### Critérios de Sucesso
- ✅ Estrutura de pastas criada
- ✅ Componentes base criados (vazios ou com skeleton)
- ✅ Rotas configuradas no Next.js
- ✅ Imports e exports funcionando

---

## 📅 FASE 2: Implementação do Layout de Autenticação

**Objetivo**: Criar um layout visual moderno e responsivo para as páginas de autenticação

### 2.1 AuthLayout Component
```typescript
// Características:
- Layout centralizado e responsivo
- Branding (logo, nome do sistema)
- Animações suaves de transição
- Modo claro/escuro (se aplicável)
- Background atrativo mas profissional
```

### 2.2 Design System
- Reutilizar componentes UI existentes (Button, Input, Card)
- Manter consistência visual com o resto da aplicação
- Cores: usar variáveis CSS já definidas (--cor-primaria, etc.)
- Ícones: usar Lucide React (já instalado)

### 2.3 Responsividade
- Mobile-first approach
- Breakpoints: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Touch-friendly (botões com tamanho adequado)

### Critérios de Sucesso
- ✅ Layout de autenticação funcional e bonito
- ✅ Responsivo em todos os tamanhos de tela
- ✅ Consistente com o design do resto da aplicação
- ✅ Acessível (ARIA labels, navegação por teclado)

---

## 📅 FASE 3: Implementação do LoginForm

**Objetivo**: Criar formulário de login funcional e seguro

### 3.1 Funcionalidades
- Input de email com validação
- Input de senha com toggle show/hide
- Checkbox "Lembrar-me" (opcional)
- Link para "Esqueci minha senha"
- Link para "Criar conta"
- Botão de submit com loading state
- Mensagens de erro específicas

### 3.2 Validações
**Cliente (Imediatas)**:
- Email: formato válido, não vazio
- Senha: mínimo 6 caracteres, não vazio
- Feedback visual em tempo real

**Servidor**:
- Credenciais válidas via Supabase
- Conta ativa/verificada
- Tratamento de rate limiting

### 3.3 Fluxo de Login
```
1. Usuário preenche email e senha
2. Validação client-side
3. Submit → loading state
4. Chamada useAuth.signIn()
5. Sucesso:
   - Salvar sessão no Supabase
   - Redirecionar para página apropriada baseado no role
6. Erro:
   - Mostrar mensagem amigável
   - Manter email preenchido
   - Focar no campo de senha
```

### 3.4 Segurança
- Não mostrar se email existe ou não (mensagem genérica)
- Rate limiting no backend
- HTTPS obrigatório em produção
- Sanitização de inputs

### Critérios de Sucesso
- ✅ Login funcional com credenciais válidas
- ✅ Validações funcionando (cliente e servidor)
- ✅ Mensagens de erro claras e amigáveis
- ✅ Loading states visíveis
- ✅ Redirecionamento correto após login

---

## 📅 FASE 4: Implementação do RegisterForm

**Objetivo**: Criar formulário de registro de novos usuários

### 4.1 Funcionalidades
- Input de nome completo
- Input de email com validação
- Input de senha com requisitos visíveis
- Input de confirmação de senha
- Checkbox de aceite dos termos (opcional)
- Botão de submit com loading state
- Link para "Já tenho conta"

### 4.2 Validações
**Cliente**:
- Nome: mínimo 3 caracteres, não vazio
- Email: formato válido, não duplicado (verificar ao blur)
- Senha: 
  - Mínimo 8 caracteres
  - Pelo menos uma maiúscula
  - Pelo menos um número
  - Indicador visual de força da senha
- Confirmação: deve ser igual à senha

**Servidor**:
- Email único no sistema
- Todas as validações do cliente
- Criar usuário no Supabase Auth
- Criar profile na tabela users_profile

### 4.3 Fluxo de Registro
```
1. Usuário preenche formulário
2. Validação em tempo real
3. Submit → loading state
4. Chamada useAuth.signUp()
5. Sucesso:
   - Enviar email de verificação (Supabase)
   - Mostrar mensagem de sucesso
   - Redirecionar para página de "Verificar Email"
6. Erro:
   - Mostrar mensagem específica
   - Manter dados preenchidos (exceto senhas)
```

### 4.4 Email de Verificação
- Configurar template no Supabase
- Criar página de confirmação
- Mensagem clara sobre próximos passos

### Critérios de Sucesso
- ✅ Registro funcional criando usuário no Supabase
- ✅ Profile criado automaticamente
- ✅ Email de verificação enviado
- ✅ Validações robustas (cliente e servidor)
- ✅ Indicador de força de senha funcional
- ✅ Mensagens claras e amigáveis

---

## 📅 FASE 5: Recuperação e Redefinição de Senha

**Objetivo**: Implementar fluxo completo de recuperação de senha

### 5.1 RecoverPasswordForm
**Funcionalidades**:
- Input de email
- Botão de enviar
- Mensagem de sucesso
- Link para voltar ao login

**Fluxo**:
```
1. Usuário insere email
2. Submit → loading
3. Chamada useAuth.resetPassword()
4. Supabase envia email com token
5. Mostrar mensagem de sucesso (sempre, mesmo se email não existir)
6. Redirecionar para login após 5 segundos
```

### 5.2 ResetPasswordForm
**Funcionalidades**:
- Input de nova senha
- Input de confirmação de senha
- Validação de força de senha
- Botão de salvar

**Fluxo**:
```
1. Usuário clica no link do email
2. Token validado automaticamente pelo Supabase
3. Página de redefinição carrega
4. Usuário insere nova senha
5. Submit → loading
6. Senha atualizada no Supabase
7. Redirecionar para login com mensagem de sucesso
```

### 5.3 Segurança
- Token com expiração (1 hora)
- Uso único do token
- Mesmas validações de senha do registro
- Logout de todas as sessões após redefinição

### Critérios de Sucesso
- ✅ Email de recuperação enviado
- ✅ Token funcionando corretamente
- ✅ Nova senha salva com sucesso
- ✅ Todas as sessões antigas invalidadas
- ✅ Usuário pode fazer login com nova senha

---

## 📅 FASE 6: Integração do AuthProvider

**Objetivo**: Integrar o AuthProvider na aplicação e garantir que o estado de autenticação seja global

### 6.1 Atualizar layout.tsx principal
```typescript
// src/app/layout.tsx
import { AuthProvider } from "@/hooks/useAuth";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 6.2 Criar componente de Loading
- Tela de loading enquanto verifica autenticação
- Skeleton screens para melhor UX
- Timeout de segurança (já implementado)

### 6.3 Atualizar useAuth
- Persistir estado de loading
- Cache de usuário autenticado
- Listener de mudanças de auth state
- Refresh token automático

### Critérios de Sucesso
- ✅ AuthProvider envolvendo toda a aplicação
- ✅ Estado de autenticação global e reativo
- ✅ Loading state funcionando corretamente
- ✅ Sessão persistindo entre reloads

---

## 📅 FASE 7: Proteção de Rotas (Middleware)

**Objetivo**: Implementar middleware do Next.js para proteger rotas automaticamente

### 7.1 Criar middleware.ts
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Verificar autenticação
  // Redirecionar baseado em role
  // Permitir acesso a rotas públicas
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|registro).*)',
  ]
}
```

### 7.2 Rotas e Regras
**Rotas Públicas** (sem autenticação):
- `/login`
- `/registro`
- `/recuperar-senha`
- `/redefinir-senha`
- `/verificar-email`

**Rotas Protegidas** (requer autenticação):
- `/` (dashboard/empresas)
- `/empresas/*`
- `/notas/*`
- `/configuracoes`

**Rotas Admin** (requer role admin):
- `/admin/*`
- `/usuarios/*`

### 7.3 Lógica de Redirecionamento
```
Se não autenticado E tentando acessar rota protegida:
  → Redirecionar para /login?redirect=/rota-original

Se autenticado E tentando acessar /login:
  → Redirecionar para / (ou última página visitada)

Se autenticado mas sem permissão para rota:
  → Redirecionar para / com mensagem de erro
```

### Critérios de Sucesso
- ✅ Rotas protegidas inacessíveis sem login
- ✅ Redirecionamento automático funcional
- ✅ Rotas públicas sempre acessíveis
- ✅ Verificação de roles funcionando
- ✅ Performance não degradada

---

## 📅 FASE 8: AuthGuard (Proteção Client-Side)

**Objetivo**: Criar componente para proteção adicional no lado do cliente

### 8.1 Componente AuthGuard
```typescript
// Funcionalidades:
- Verificar autenticação no cliente
- Mostrar loading enquanto verifica
- Redirecionar se não autenticado
- Verificar roles específicos
- Fallback UI customizável
```

### 8.2 Uso
```typescript
// Proteger página inteira
<AuthGuard>
  <PaginaProtegida />
</AuthGuard>

// Proteger com role específico
<AuthGuard requiredRole="admin">
  <PaginaAdmin />
</AuthGuard>

// Proteção condicional
<AuthGuard
  fallback={<LoginPrompt />}
  loadingFallback={<LoadingSkeleton />}
>
  <ConteudoProtegido />
</AuthGuard>
```

### 8.3 Integração com Layouts
- Layout protegido para páginas privadas
- Layout público para páginas de auth
- Compartilhamento de componentes UI

### Critérios de Sucesso
- ✅ AuthGuard funcional e reutilizável
- ✅ Integrado com useAuth
- ✅ Loading states apropriados
- ✅ Fallbacks customizáveis
- ✅ Proteção por role funcional

---

## 📅 FASE 9: Atualização da UI Existente

**Objetivo**: Integrar autenticação na UI existente (MenuNav, PainelAdmin)

### 9.1 Atualizar MenuNav
**Adicionar**:
- Avatar do usuário (com fallback)
- Nome do usuário no dropdown
- Role/cargo do usuário
- Funcionalidade de logout real
- Link para perfil

**Modificar**:
```typescript
// Usar dados reais do useAuth
const { user, signOut } = useAuth();

// Mostrar informações do usuário
<span>{user?.profile?.nome || user?.email}</span>
<span className="text-xs">{translateRole(user?.profile?.role)}</span>

// Logout funcional
<DropdownMenuItem onClick={signOut}>
  <LogOut /> Sair
</DropdownMenuItem>
```

### 9.2 Atualizar PainelAdmin
**Modificar**:
- Filtrar empresas baseado no role
- Admins veem tudo
- Accountants veem apenas sua empresa
- Viewers têm acesso read-only

### 9.3 Feedback Visual
- Indicador de usuário logado
- Badge de role
- Estados de loading ao fazer logout
- Transições suaves

### Critérios de Sucesso
- ✅ Informações do usuário exibidas corretamente
- ✅ Logout funcional
- ✅ Filtragem por role implementada
- ✅ UI responsiva e bonita
- ✅ Transições suaves

---

## 📅 FASE 10: Mensagens e Feedback

**Objetivo**: Implementar sistema robusto de mensagens e feedback para o usuário

### 10.1 Toast Notifications
**Cenários**:
- Login bem-sucedido
- Logout bem-sucedido
- Registro bem-sucedido
- Email de recuperação enviado
- Senha redefinida
- Erros de autenticação
- Sessão expirada

### 10.2 Mensagens de Erro Amigáveis
**Traduzir erros do Supabase**:
```typescript
const errorMessages = {
  'Invalid login credentials': 'Email ou senha incorretos',
  'Email not confirmed': 'Por favor, confirme seu email primeiro',
  'User already registered': 'Este email já está cadastrado',
  'Password too weak': 'Senha muito fraca. Use pelo menos 8 caracteres',
  // ... mais mensagens
}
```

### 10.3 Estados de Loading
- Skeleton screens
- Spinners contextuais
- Desabilitar botões durante loading
- Indicadores de progresso

### 10.4 Validação em Tempo Real
- Feedback imediato nos inputs
- Ícones de sucesso/erro
- Mensagens contextuais
- Prevenção de erros

### Critérios de Sucesso
- ✅ Todas as ações têm feedback visual
- ✅ Mensagens de erro claras e amigáveis
- ✅ Loading states em todos os lugares apropriados
- ✅ Validação em tempo real funcionando
- ✅ UX fluida e profissional

---

## 📅 FASE 11: Testes e Validação

**Objetivo**: Garantir que todo o sistema de autenticação está funcionando corretamente

### 11.1 Testes Manuais
**Fluxos Principais**:
- [ ] Registro de novo usuário
- [ ] Verificação de email
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas
- [ ] Recuperação de senha
- [ ] Redefinição de senha
- [ ] Logout
- [ ] Tentativa de acessar rota protegida sem login
- [ ] Tentativa de acessar rota admin sem ser admin
- [ ] Persistência de sessão (reload da página)
- [ ] Expiração de sessão

**Cenários de Erro**:
- [ ] Email inválido
- [ ] Senha fraca
- [ ] Senhas não coincidem
- [ ] Email já cadastrado
- [ ] Token expirado
- [ ] Token inválido
- [ ] Sem conexão com internet
- [ ] Erro no servidor

### 11.2 Testes em Múltiplos Dispositivos
- [ ] Desktop (Chrome, Firefox, Safari, Edge)
- [ ] Tablet (iPad, Android)
- [ ] Mobile (iOS Safari, Chrome Android)
- [ ] Diferentes resoluções
- [ ] Modo paisagem/retrato

### 11.3 Testes de Segurança
- [ ] SQL Injection nos inputs
- [ ] XSS nos inputs
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Força bruta (múltiplas tentativas de login)
- [ ] Manipulação de tokens
- [ ] Acesso direto a rotas protegidas

### 11.4 Testes de Performance
- [ ] Tempo de carregamento das páginas
- [ ] Tempo de resposta do login
- [ ] Tempo de verificação de autenticação
- [ ] Impacto do middleware
- [ ] Bundle size

### Critérios de Sucesso
- ✅ Todos os fluxos principais funcionando
- ✅ Erros tratados graciosamente
- ✅ Funcional em todos os dispositivos
- ✅ Seguro contra ataques comuns
- ✅ Performance aceitável (< 2s para login)

---

## 📅 FASE 12: Documentação e Refinamento

**Objetivo**: Documentar o sistema e fazer ajustes finais

### 12.1 Atualizar README.md
- [ ] Remover item "✅ Autenticação" da seção MVP (ou marcá-lo corretamente)
- [ ] Adicionar seção detalhada sobre autenticação
- [ ] Documentar fluxos de autenticação
- [ ] Adicionar screenshots (opcional)
- [ ] Documentar variáveis de ambiente necessárias
- [ ] Atualizar instruções de setup

### 12.2 Criar Documentação Técnica
**Documento: AUTH-TECHNICAL.md**
```markdown
- Arquitetura de autenticação
- Fluxo de dados
- Estrutura de tabelas
- Roles e permissões
- Como adicionar novas roles
- Como proteger novos endpoints
- Troubleshooting comum
```

### 12.3 Criar Guia do Desenvolvedor
**Documento: AUTH-DEVELOPER-GUIDE.md**
```markdown
- Como usar useAuth
- Como proteger componentes
- Como proteger rotas
- Como verificar roles
- Como adicionar novos fluxos de auth
- Exemplos de código
```

### 12.4 Comentários no Código
- Adicionar JSDoc nos componentes principais
- Comentar lógica complexa
- Adicionar TODOs para melhorias futuras
- Documentar props e tipos

### 12.5 Refinamentos Finais
- [ ] Revisar todos os textos e mensagens
- [ ] Verificar acessibilidade (ARIA, navegação por teclado)
- [ ] Otimizar imports e bundle
- [ ] Remover console.logs desnecessários
- [ ] Padronizar nomes de variáveis
- [ ] Revisar estilos e responsividade
- [ ] Adicionar animações suaves
- [ ] Verificar dark mode (se aplicável)

### Critérios de Sucesso
- ✅ README atualizado e preciso
- ✅ Documentação técnica completa
- ✅ Guia do desenvolvedor útil
- ✅ Código bem comentado
- ✅ Refinamentos aplicados

---

## 🔒 Considerações de Segurança

### Princípios Fundamentais
1. **Nunca confie no cliente**: Sempre validar no servidor
2. **Defesa em profundidade**: Múltiplas camadas de proteção
3. **Princípio do menor privilégio**: Usuários só acessam o necessário
4. **Fail secure**: Em caso de erro, negar acesso

### Checklist de Segurança
- [ ] Senhas hasheadas (Supabase Auth faz isso)
- [ ] Tokens seguros e com expiração
- [ ] HTTPS em produção
- [ ] CORS configurado corretamente
- [ ] Rate limiting implementado
- [ ] Validação de entrada (cliente e servidor)
- [ ] Sanitização de dados
- [ ] Proteção contra CSRF
- [ ] Headers de segurança configurados
- [ ] Logs de auditoria (tentativas de login, etc.)
- [ ] Variáveis de ambiente seguras
- [ ] Service Role Key nunca exposta ao cliente
- [ ] RLS (Row Level Security) no Supabase

---

## 📊 Métricas de Sucesso

### Funcionalidade
- 100% dos fluxos de autenticação funcionando
- 0% de rotas protegidas acessíveis sem auth
- 100% de validações funcionando corretamente

### Performance
- < 2s tempo de login
- < 1s verificação de autenticação
- < 500ms para middleware

### UX
- 0 erros confusos ou técnicos visíveis ao usuário
- Feedback visual em todas as ações
- Responsivo em todos os dispositivos

### Segurança
- 0 vulnerabilidades conhecidas
- Proteção contra ataques comuns
- Logs de auditoria funcionando

---

## 🚀 Melhorias Futuras (Pós-MVP)

### Curto Prazo
- [ ] OAuth (Google, GitHub, Microsoft)
- [ ] Autenticação de dois fatores (2FA)
- [ ] Logs de atividade de login
- [ ] Sessões ativas (visualizar e encerrar)
- [ ] Notificação de login em novo dispositivo

### Médio Prazo
- [ ] Biometria (Touch ID, Face ID)
- [ ] Magic link (login sem senha)
- [ ] SSO (Single Sign-On) empresarial
- [ ] Whitelist de IPs para contas admin
- [ ] Análise de segurança de contas

### Longo Prazo
- [ ] Multi-tenancy completo
- [ ] Audit logs completos
- [ ] Dashboard de segurança
- [ ] Compliance (LGPD, GDPR)
- [ ] Certificações de segurança

---

## 📝 Notas Importantes

### Dependências Necessárias
```json
{
  "@supabase/auth-helpers-nextjs": "^0.8.0",
  "@supabase/supabase-js": "^2.38.0",
  "zod": "^3.22.0" // já instalado
}
```

### Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= # nunca expor ao cliente
NEXT_PUBLIC_APP_URL=
```

### Configurações do Supabase
- Confirmar que Auth está habilitado
- Configurar template de emails
- Configurar redirect URLs
- Habilitar providers desejados
- Configurar políticas RLS

---

## ✅ Checklist Final

Antes de considerar a autenticação completa, verificar:

### Funcionalidades
- [ ] Login funcional
- [ ] Registro funcional
- [ ] Recuperação de senha funcional
- [ ] Redefinição de senha funcional
- [ ] Logout funcional
- [ ] Proteção de rotas funcional
- [ ] Verificação de roles funcional

### UI/UX
- [ ] Design consistente
- [ ] Responsivo
- [ ] Acessível
- [ ] Feedback visual adequado
- [ ] Mensagens claras
- [ ] Loading states

### Segurança
- [ ] Validações (cliente e servidor)
- [ ] Rate limiting
- [ ] Tokens seguros
- [ ] RLS configurado
- [ ] Variáveis de ambiente seguras

### Código
- [ ] DRY (sem duplicação)
- [ ] Bem organizado
- [ ] Comentado adequadamente
- [ ] Sem console.logs desnecessários
- [ ] Tipos TypeScript corretos

### Documentação
- [ ] README atualizado
- [ ] Documentação técnica criada
- [ ] Guia do desenvolvedor criado
- [ ] Comentários no código

### Testes
- [ ] Testes manuais completos
- [ ] Testado em múltiplos dispositivos
- [ ] Testado cenários de erro
- [ ] Testado segurança básica

---

## 🎓 Recursos e Referências

### Documentação Oficial
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

### Boas Práticas
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Web Security Guidelines](https://developer.mozilla.org/en-US/docs/Web/Security)

### Inspiração de UI
- Supabase Dashboard
- Vercel Login
- GitHub Auth Flow
- Notion Login

---

**Documento criado em**: 2025-10-22
**Última atualização**: 2025-10-22
**Status**: Planejamento
**Responsável**: Marcos Rocha

