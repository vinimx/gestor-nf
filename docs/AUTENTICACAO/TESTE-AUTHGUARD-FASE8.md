# 🧪 Checklist de Testes - AuthGuard (Fase 8)

## 📋 Visão Geral

Este documento contém uma lista completa de testes para validar o funcionamento do **AuthGuard** (proteção client-side) implementado na Fase 8.

**Data de Criação**: 2025-10-22  
**Fase**: 8 - AuthGuard (Proteção Client-Side)  
**Componentes Testados**:
- `AuthGuard` component
- Layouts protegidos: `(protected)` e `(admin)`

---

## ✅ Checklist de Testes

### 1. **Proteção Básica (Apenas Autenticação)**

#### 1.1 Usuário Não Autenticado
- [ ] AuthGuard sem props → redireciona para `/login`
- [ ] Parâmetro `redirect` é adicionado à URL
- [ ] Loading aparece brevemente durante verificação
- [ ] Conteúdo NÃO é renderizado (segurança)

#### 1.2 Usuário Autenticado
- [ ] AuthGuard sem props → renderiza conteúdo normalmente
- [ ] Não há redirecionamento
- [ ] Loading desaparece após verificação
- [ ] Conteúdo é renderizado

---

### 2. **Verificação de Role - requiredRole**

#### 2.1 Admin Acessando
- [ ] `requiredRole="admin"` + user admin → renderiza conteúdo ✅
- [ ] `requiredRole="accountant"` + user admin → renderiza conteúdo ✅ (hierarquia)
- [ ] `requiredRole="viewer"` + user admin → renderiza conteúdo ✅ (hierarquia)

#### 2.2 Accountant Acessando
- [ ] `requiredRole="admin"` + user accountant → acesso negado ⛔
- [ ] `requiredRole="accountant"` + user accountant → renderiza conteúdo ✅
- [ ] `requiredRole="viewer"` + user accountant → renderiza conteúdo ✅ (hierarquia)

#### 2.3 Viewer Acessando
- [ ] `requiredRole="admin"` + user viewer → acesso negado ⛔
- [ ] `requiredRole="accountant"` + user viewer → acesso negado ⛔
- [ ] `requiredRole="viewer"` + user viewer → renderiza conteúdo ✅

#### 2.4 Sem Role
- [ ] Usuário sem profile.role → acesso negado para qualquer `requiredRole`
- [ ] Mensagem apropriada: "Nenhum role atribuído"

---

### 3. **Verificação de Role - allowedRoles (Não Hierárquica)**

#### 3.1 Lista de Roles Permitidas
- [ ] `allowedRoles={["admin"]}` + user admin → renderiza ✅
- [ ] `allowedRoles={["admin"]}` + user accountant → acesso negado ⛔
- [ ] `allowedRoles={["admin", "accountant"]}` + user admin → renderiza ✅
- [ ] `allowedRoles={["admin", "accountant"]}` + user accountant → renderiza ✅
- [ ] `allowedRoles={["admin", "accountant"]}` + user viewer → acesso negado ⛔

#### 3.2 Diferença de allowedRoles vs requiredRole
- [ ] `allowedRoles={["accountant"]}` + user admin → acesso negado ⛔ (não hierárquica!)
- [ ] `requiredRole="accountant"` + user admin → renderiza ✅ (hierárquica!)
- [ ] Comportamento diferente está documentado

---

### 4. **Loading States**

#### 4.1 Loading Padrão (fullScreen=true)
- [ ] Exibe tela fullscreen com gradient azul/teal
- [ ] Spinner animado centralizado
- [ ] Texto: "Verificando permissões..."
- [ ] Design consistente com tema do app

#### 4.2 Loading Inline (fullScreen=false)
- [ ] Exibe apenas spinner pequeno
- [ ] Não ocupa tela inteira
- [ ] Padding apropriado (py-12)

#### 4.3 Loading Customizado
- [ ] `loadingFallback={<Custom />}` → renderiza componente customizado
- [ ] Loading padrão NÃO aparece
- [ ] Skeleton screens funcionam

---

### 5. **Acesso Negado (Role Insuficiente)**

#### 5.1 Tela Fullscreen (fullScreen=true)
- [ ] Gradient vermelho/laranja de fundo
- [ ] Ícone de cadeado (Lock) grande
- [ ] Título: "Acesso Negado"
- [ ] Mostra role do usuário atual
- [ ] Mostra role necessária
- [ ] Botões: "Voltar" e "Ir para Início"
- [ ] Botão "Voltar" chama `router.back()`
- [ ] Botão "Início" redireciona para `/`

#### 5.2 Tela Inline (fullScreen=false)
- [ ] Card vermelho claro com borda
- [ ] Ícone de cadeado pequeno
- [ ] Mensagem curta de acesso negado
- [ ] Não ocupa tela inteira
- [ ] Integra-se com o layout existente

#### 5.3 Acesso Negado Customizado
- [ ] `accessDeniedFallback={<Custom />}` → renderiza componente customizado
- [ ] Tela padrão NÃO aparece
- [ ] Componente recebe controle total

---

### 6. **Usuário Não Autenticado**

#### 6.1 Com Redirecionamento (noRedirect=false - padrão)
- [ ] Redireciona automaticamente para `/login`
- [ ] Parâmetro `redirect` inclui URL atual
- [ ] Não exibe conteúdo protegido
- [ ] Redirecionamento é rápido (< 500ms)

#### 6.2 Sem Redirecionamento (noRedirect=true, fullScreen=true)
- [ ] Exibe tela fullscreen com ShieldAlert icon
- [ ] Gradient cinza de fundo
- [ ] Título: "Autenticação Necessária"
- [ ] Botão: "Fazer Login" → redireciona para `/login`

#### 6.3 Com Fallback Customizado
- [ ] `fallback={<Custom />}` → renderiza componente customizado
- [ ] Tela padrão NÃO aparece
- [ ] Não redireciona (mesmo com noRedirect=false)

---

### 7. **Props Customizáveis**

#### 7.1 redirectTo
- [ ] `redirectTo="/custom-login"` → redireciona para rota customizada
- [ ] Parâmetro `redirect` ainda é adicionado
- [ ] URL customizada é respeitada

#### 7.2 noRedirect
- [ ] `noRedirect=true` → não redireciona automaticamente
- [ ] Mostra tela de autenticação necessária
- [ ] Conteúdo protegido NÃO é renderizado

#### 7.3 fullScreen
- [ ] `fullScreen=true` (padrão) → telas ocupam altura total
- [ ] `fullScreen=false` → componentes inline/pequenos
- [ ] Transição entre modos funciona

---

### 8. **Integração com Layouts**

#### 8.1 Layout (protected)
- [ ] Criado em `src/app/(protected)/layout.tsx`
- [ ] Envolve children com `<AuthGuard>`
- [ ] Páginas dentro do grupo são protegidas automaticamente
- [ ] Não autenticado → redireciona para login

#### 8.2 Layout (admin)
- [ ] Criado em `src/app/(admin)/layout.tsx`
- [ ] Envolve children com `<AuthGuard requiredRole="admin">`
- [ ] Apenas admins podem acessar páginas do grupo
- [ ] Não-admin → tela de acesso negado

#### 8.3 AuthErrorHandler
- [ ] Incluído em ambos os layouts
- [ ] Erros do middleware são capturados
- [ ] Toasts são exibidos

---

### 9. **Renderização Condicional**

#### 9.1 Componente Inline (noRedirect + fullScreen=false)
- [ ] Componente aparece/desaparece baseado em role
- [ ] Não causa layout shift significativo
- [ ] Não exibe erros no console

#### 9.2 Múltiplos AuthGuards na Mesma Página
- [ ] `<AuthGuard requiredRole="admin">` + `<AuthGuard requiredRole="viewer">`
- [ ] Ambos funcionam independentemente
- [ ] Renderizam conteúdo apropriado para cada role
- [ ] Performance aceitável

---

### 10. **Props Interface e TypeScript**

#### 10.1 Tipos Corretos
- [ ] `children: ReactNode` aceita qualquer conteúdo React
- [ ] `requiredRole` aceita apenas: "admin", "accountant", "viewer"
- [ ] `allowedRoles` aceita array de roles válidas
- [ ] `fallback`, `loadingFallback`, `accessDeniedFallback` aceitam ReactNode
- [ ] `noRedirect`, `fullScreen` são boolean
- [ ] `redirectTo` é string

#### 10.2 Defaults
- [ ] `noRedirect` = false por padrão
- [ ] `redirectTo` = "/login" por padrão
- [ ] `fullScreen` = true por padrão

#### 10.3 Props Opcionais
- [ ] Todas as props são opcionais exceto `children`
- [ ] TypeScript não reclama de props ausentes
- [ ] Comportamento padrão é sensato

---

### 11. **Performance**

#### 11.1 Tempo de Verificação
- [ ] Verificação de autenticação < 100ms
- [ ] Verificação de role < 50ms (já tem user em context)
- [ ] Renderização de conteúdo é imediata após verificação

#### 11.2 Re-renders
- [ ] AuthGuard não causa re-renders desnecessários
- [ ] useAuth context atualiza apenas quando necessário
- [ ] Mudanças de rota não causam flicker

---

### 12. **Segurança**

#### 12.1 Conteúdo Nunca Exposto
- [ ] Conteúdo protegido NUNCA renderiza antes de verificação
- [ ] Inspecionar DOM não revela conteúdo protegido
- [ ] DevTools não mostram conteúdo em nenhum momento

#### 12.2 Dupla Proteção (Middleware + AuthGuard)
- [ ] Middleware bloqueia no servidor
- [ ] AuthGuard bloqueia no cliente
- [ ] Se middleware falhar, AuthGuard captura
- [ ] Se AuthGuard falhar, middleware já bloqueou

#### 12.3 Falha Segura
- [ ] Em caso de erro no useAuth → assume não autenticado
- [ ] Em caso de role undefined → assume sem permissão
- [ ] Nunca "abre" acesso por engano

---

### 13. **UX e Acessibilidade**

#### 13.1 Loading States
- [ ] Loading sempre visível durante verificação
- [ ] Não há "flash" de conteúdo protegido
- [ ] Transições suaves entre estados

#### 13.2 Mensagens Claras
- [ ] Textos explicam claramente o problema
- [ ] Mensagens são amigáveis, não técnicas
- [ ] Botões têm labels descritivos

#### 13.3 Navegação
- [ ] Botões de navegação funcionam corretamente
- [ ] `router.back()` funciona em todos os casos
- [ ] Redirecionamento para home sempre funciona

#### 13.4 Responsividade
- [ ] Telas fullscreen funcionam em mobile
- [ ] Botões são clicáveis em touch screens
- [ ] Layout adapta em diferentes tamanhos
- [ ] Texto é legível em telas pequenas

---

### 14. **Exemplos Práticos**

#### 14.1 Arquivo examples.tsx
- [ ] Todos os 10 exemplos estão implementados
- [ ] Exemplos cobrem casos de uso comuns
- [ ] Código é executável (não apenas pseudocódigo)
- [ ] Comentários explicam cada exemplo

#### 14.2 Uso dos Exemplos
- [ ] Exemplo 1 (Básico) funciona
- [ ] Exemplo 2 (Admin) funciona
- [ ] Exemplo 3 (Múltiplas Roles) funciona
- [ ] Exemplo 4 (Inline) funciona
- [ ] Exemplo 5 (Loading Custom) funciona
- [ ] Exemplo 6 (Acesso Negado Custom) funciona
- [ ] Exemplo 7 (Sem Redirect) funciona
- [ ] Exemplo 8 (Componente Específico) funciona
- [ ] Exemplo 9 (Layouts) funciona
- [ ] Exemplo 10 (Renderização Condicional) funciona

---

### 15. **Documentação**

#### 15.1 JSDoc
- [ ] Componente principal tem JSDoc completo
- [ ] Todas as props têm descrições
- [ ] Exemplos de uso no JSDoc
- [ ] Tags `@example` estão corretas

#### 15.2 Comentários no Código
- [ ] Cada seção tem comentário explicativo
- [ ] Lógica complexa tem comentários inline
- [ ] TODO items (se houver) estão marcados

#### 15.3 TypeScript
- [ ] Interface exportada: `AuthGuardProps`
- [ ] Tipos são precisos e úteis
- [ ] Auto-complete funciona no IDE

---

### 16. **Edge Cases**

#### 16.1 Cenários Raros
- [ ] User existe mas profile é null → trata como sem role
- [ ] Role inválida/desconhecida → nega acesso
- [ ] Loading nunca termina → timeout do AuthProvider resolve
- [ ] Múltiplos AuthGuards aninhados → funcionam corretamente

#### 16.2 Navegação Complexa
- [ ] Navegar de rota protegida para pública → OK
- [ ] Navegar de rota pública para protegida → OK
- [ ] Refresh em rota protegida → mantém acesso
- [ ] Logout em rota protegida → redireciona para login

---

### 17. **Testes de Integração**

#### 17.1 Fluxo Completo: Login → Rota Protegida
1. [ ] Não autenticado tenta acessar rota com `<AuthGuard>`
2. [ ] AuthGuard redireciona para `/login?redirect=/rota`
3. [ ] Usuário faz login
4. [ ] Redireciona de volta para `/rota`
5. [ ] AuthGuard verifica sessão → OK
6. [ ] Conteúdo é renderizado

#### 17.2 Fluxo Completo: Viewer Tenta Acessar Admin
1. [ ] Viewer acessa rota com `<AuthGuard requiredRole="admin">`
2. [ ] AuthGuard verifica role → insuficiente
3. [ ] Exibe tela "Acesso Negado"
4. [ ] Mostra role atual (viewer) e necessária (admin)
5. [ ] Botões de navegação funcionam

#### 17.3 Fluxo Completo: Mudança de Role
1. [ ] Admin está em rota admin (renderizando)
2. [ ] Role é alterada para viewer (no banco)
3. [ ] useAuth detecta mudança (após refresh ou re-fetch)
4. [ ] AuthGuard re-verifica
5. [ ] Exibe "Acesso Negado"

---

### 18. **Comparação: Middleware vs AuthGuard**

#### 18.1 Quando Usar Cada Um

| Cenário | Middleware | AuthGuard | Ambos |
|---------|------------|-----------|-------|
| Proteger página inteira | ✅ | ✅ | ✅✅ |
| Proteger seção da página | ❌ | ✅ | - |
| Proteger componente | ❌ | ✅ | - |
| Evitar carregamento de JS | ✅ | ❌ | - |
| Fallback customizado | ❌ | ✅ | - |
| Verificação server-side | ✅ | ❌ | - |
| Verificação client-side | ❌ | ✅ | - |

#### 18.2 Teste: Desabilitar Middleware
- [ ] Com middleware desabilitado, AuthGuard ainda protege
- [ ] Rota protegida ainda redireciona (mas mais lento)
- [ ] Conteúdo nunca vaza

#### 18.3 Teste: Desabilitar AuthGuard
- [ ] Com AuthGuard desabilitado, middleware ainda protege
- [ ] Página não carrega sem autenticação
- [ ] Redirecionamento acontece no servidor

---

## 📊 Resumo de Testes

**Total de Testes**: ~150 casos

### Categorias:
- ✅ Proteção Básica: 4 testes
- ✅ Verificação de Role (requiredRole): 13 testes
- ✅ Verificação de Role (allowedRoles): 8 testes
- ✅ Loading States: 9 testes
- ✅ Acesso Negado: 11 testes
- ✅ Usuário Não Autenticado: 9 testes
- ✅ Props Customizáveis: 8 testes
- ✅ Integração com Layouts: 8 testes
- ✅ Renderização Condicional: 5 testes
- ✅ TypeScript: 9 testes
- ✅ Performance: 5 testes
- ✅ Segurança: 7 testes
- ✅ UX e Acessibilidade: 12 testes
- ✅ Exemplos Práticos: 11 testes
- ✅ Documentação: 8 testes
- ✅ Edge Cases: 8 testes
- ✅ Testes de Integração: 13 testes
- ✅ Comparação: 8 testes

---

## 🚀 Como Testar

### Preparação
1. Certifique-se de ter usuários de teste com diferentes roles:
   - Admin, Accountant, Viewer
2. Abra DevTools (F12)
3. Use modo anônimo para testar fluxos de não autenticado

### Executar Testes
1. **Testes Manuais**: Seguir cada item do checklist
2. **Validação**: Marcar ✅ cada teste que passar
3. **Bugs**: Documentar qualquer falha encontrada

### Casos de Teste Rápidos

#### Teste 1: Proteção Básica (1min)
```tsx
<AuthGuard>
  <p>Conteúdo Protegido</p>
</AuthGuard>
```
- ✅ Não autenticado → redireciona
- ✅ Autenticado → renderiza

#### Teste 2: Role Admin (1min)
```tsx
<AuthGuard requiredRole="admin">
  <p>Apenas Admin</p>
</AuthGuard>
```
- ✅ Admin → renderiza
- ✅ Não-admin → acesso negado

#### Teste 3: Inline (30s)
```tsx
<AuthGuard fullScreen={false} noRedirect requiredRole="admin">
  <button>Admin Only</button>
</AuthGuard>
```
- ✅ Admin → botão aparece
- ✅ Não-admin → nada aparece

---

## ✅ Critérios de Aceitação

A Fase 8 é considerada **COMPLETA** quando:

- [ ] ✅ 100% dos testes de proteção básica passam
- [ ] ✅ 100% dos testes de verificação de role passam
- [ ] ✅ Todos os fallbacks customizáveis funcionam
- [ ] ✅ Layouts protegidos funcionam corretamente
- [ ] ✅ Exemplos práticos são executáveis
- [ ] ✅ Documentação completa e precisa
- [ ] ✅ TypeScript sem erros
- [ ] ✅ Performance aceitável
- [ ] ✅ Segurança validada
- [ ] ✅ Sem bugs críticos

---

**Última atualização**: 2025-10-22  
**Responsável pelos testes**: Marcos Rocha  
**Status**: Aguardando execução


