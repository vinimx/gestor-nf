# ✅ Checklist de Testes - FASE 6: AuthProvider e Estado Global

## 🎯 Objetivo
Validar a integração do AuthProvider e verificar que o estado de autenticação funciona globalmente

---

## 📋 Testes do AuthProvider

### 1. Verificação Inicial

#### Teste 1.1: Loading screen aparece
- [ ] Abrir aplicação (primeira vez ou após limpar cache)
- [ ] **Resultado esperado**: Loading screen azul aparece
- [ ] **Resultado esperado**: Spinner animado visível
- [ ] **Resultado esperado**: Texto "Verificando autenticação..."
- [ ] **Resultado esperado**: Duração máxima de 3-5 segundos

#### Teste 1.2: Verificação rápida (usuário logado)
- [ ] Fazer login
- [ ] Recarregar página (F5)
- [ ] **Resultado esperado**: Loading screen aparece brevemente (<1s)
- [ ] **Resultado esperado**: Redireciona para dashboard
- [ ] **Resultado esperado**: Dados do usuário carregados

#### Teste 1.3: Verificação rápida (sem login)
- [ ] Sem estar logado
- [ ] Acessar URL protegida diretamente
- [ ] **Resultado esperado**: Loading screen aparece brevemente
- [ ] **Resultado esperado**: Redireciona para `/login`

### 2. onAuthStateChange Listener

#### Teste 2.1: Evento SIGNED_IN
- [ ] Estar deslogado
- [ ] Fazer login
- [ ] **Resultado esperado**: Console mostra "🔄 Auth state changed: SIGNED_IN"
- [ ] **Resultado esperado**: User state atualizado
- [ ] **Resultado esperado**: App re-renderiza com usuário logado

#### Teste 2.2: Evento SIGNED_OUT
- [ ] Estar logado
- [ ] Clicar em "Sair"
- [ ] **Resultado esperado**: Console mostra "🔄 Auth state changed: SIGNED_OUT"
- [ ] **Resultado esperado**: User state = null
- [ ] **Resultado esperado**: Redireciona para `/login`

#### Teste 2.3: Evento TOKEN_REFRESHED
- [ ] Estar logado
- [ ] Aguardar ~50 minutos (ou forçar refresh)
- [ ] **Resultado esperado**: Token atualiza silenciosamente
- [ ] **Resultado esperado**: Console mostra "TOKEN_REFRESHED"
- [ ] **Resultado esperado**: Usuário permanece logado
- [ ] **Resultado esperado**: Sem interrupção na experiência

### 3. Timeout e Fallback

#### Teste 3.1: Timeout de profile (3s)
- [ ] Simular lentidão na busca de profile
- [ ] **Resultado esperado**: Após 3s, usa dados básicos do Supabase
- [ ] **Resultado esperado**: Console mostra "⚠️ checkUser: Usando dados básicos sem profile"
- [ ] **Resultado esperado**: App funciona (email visível, profile=null)

#### Teste 3.2: Timeout geral (10s)
- [ ] Simular Supabase offline
- [ ] **Resultado esperado**: Após 10s, força loading=false
- [ ] **Resultado esperado**: Console mostra "⚠️ Timeout de autenticação atingido!"
- [ ] **Resultado esperado**: App carrega (sem usuário)

### 4. Estado Global

#### Teste 4.1: Estado compartilhado entre componentes
- [ ] Fazer login
- [ ] Verificar MenuNav (exibe nome do usuário)
- [ ] Verificar outras partes do app
- [ ] **Resultado esperado**: Todos componentes veem o mesmo user
- [ ] **Resultado esperado**: useAuth() retorna dados consistentes

#### Teste 4.2: Sincronização automática
- [ ] Abrir app em 2 abas
- [ ] Fazer login na aba 1
- [ ] **Resultado esperado**: Aba 2 atualiza automaticamente
- [ ] **Resultado esperado**: Ambas mostram usuário logado

#### Teste 4.3: Logout em múltiplas abas
- [ ] Abrir app em 2 abas (logado)
- [ ] Fazer logout na aba 1
- [ ] **Resultado esperado**: Aba 2 detecta logout
- [ ] **Resultado esperado**: Ambas redirecionam para `/login`

---

## 🎨 Testes Visuais

### 5. Loading Screen

#### Teste 5.1: Design do loading
- [ ] Loading screen tem gradiente azul/verde
- [ ] Spinner branco animado
- [ ] Fundo com efeito blur/transparência
- [ ] Texto "Gestor NF" visível
- [ ] Subtítulo "Verificando autenticação..."

#### Teste 5.2: Animações
- [ ] Spinner gira suavemente
- [ ] Círculo de fundo pulsa (animate-pulse)
- [ ] Transição suave ao sair do loading

### 6. PageSkeleton (Bonus)

#### Teste 6.1: Estrutura do skeleton
- [ ] Header com logo e avatar (cinza)
- [ ] Cards de conteúdo (cinza)
- [ ] Animação de pulse
- [ ] Layout responsivo

---

## 🔄 Testes de Persistência

### 7. Sessão Persistente

#### Teste 7.1: Reload mantém sessão
- [ ] Fazer login
- [ ] Recarregar página (F5)
- [ ] **Resultado esperado**: Permanece logado
- [ ] **Resultado esperado**: Dados do usuário mantidos
- [ ] **Resultado esperado**: Não pede login novamente

#### Teste 7.2: Fechar e reabrir navegador
- [ ] Fazer login
- [ ] Fechar navegador completamente
- [ ] Reabrir e acessar app
- [ ] **Resultado esperado**: Ainda logado (se não expirou)
- [ ] **Resultado esperado**: Token válido

#### Teste 7.3: Nova aba mantém sessão
- [ ] Estar logado
- [ ] Abrir nova aba e acessar app
- [ ] **Resultado esperado**: Já logado na nova aba
- [ ] **Resultado esperado**: Sem necessidade de novo login

---

## 🔒 Testes de Segurança

### 8. Proteção de Dados

#### Teste 8.1: Token não exposto
- [ ] Fazer login
- [ ] Abrir DevTools → Console
- [ ] **Resultado esperado**: Token JWT não visível em console.logs
- [ ] **Resultado esperado**: Dados sensíveis não expostos

#### Teste 8.2: Limpeza ao logout
- [ ] Fazer logout
- [ ] Verificar localStorage/cookies
- [ ] **Resultado esperado**: Token removido
- [ ] **Resultado esperado**: Dados de usuário limpos
- [ ] **Resultado esperado**: Não é possível acessar rotas protegidas

### 9. Tratamento de Erros

#### Teste 9.1: Supabase offline
- [ ] Desconectar internet/bloquear Supabase
- [ ] Tentar fazer login
- [ ] **Resultado esperado**: Erro tratado graciosamente
- [ ] **Resultado esperado**: Mensagem amigável ao usuário
- [ ] **Resultado esperado**: App não quebra

#### Teste 9.2: Token inválido
- [ ] Manipular token no localStorage
- [ ] Recarregar app
- [ ] **Resultado esperado**: Detecta token inválido
- [ ] **Resultado esperado**: Faz logout automático
- [ ] **Resultado esperado**: Redireciona para `/login`

#### Teste 9.3: Sessão expirada
- [ ] Aguardar expiração do token (30 dias default)
- [ ] Tentar acessar app
- [ ] **Resultado esperado**: Detecta expiração
- [ ] **Resultado esperado**: Pede novo login
- [ ] **Resultado esperado**: Mensagem "Sessão expirada"

---

## 🚀 Testes de Performance

### 10. Velocidade de Verificação

#### Teste 10.1: Primeira carga (cold start)
- [ ] Limpar cache
- [ ] Acessar app
- [ ] **Resultado esperado**: Loading < 3 segundos
- [ ] **Resultado esperado**: Verificação completa < 5 segundos

#### Teste 10.2: Carga subsequente (warm start)
- [ ] Recarregar página
- [ ] **Resultado esperado**: Loading < 1 segundo
- [ ] **Resultado esperado**: App disponível rapidamente

#### Teste 10.3: Login e atualização
- [ ] Fazer login
- [ ] Medir tempo até dashboard carregar
- [ ] **Resultado esperado**: < 2 segundos total

---

## 📱 Testes de Responsividade

### 11. Loading Screen Responsivo

#### Teste 11.1: Mobile
- [ ] Loading screen centralizado
- [ ] Spinner tamanho adequado
- [ ] Texto legível

#### Teste 11.2: Tablet
- [ ] Layout adaptado
- [ ] Elementos bem posicionados

#### Teste 11.3: Desktop
- [ ] Loading screen não muito grande
- [ ] Bem centralizado

---

## 🔍 Testes de Console Logs

### 12. Logs Informativos

#### Teste 12.1: Sequência de logs esperada (login)
```
🚀 AuthProvider montado, iniciando verificação...
🔍 checkUser: Iniciando verificação...
✅ checkUser: Resultado: Usuário user@email.com
🏁 checkUser: Finalizando (loading = false)
🔄 Auth state changed: SIGNED_IN user@email.com
```

#### Teste 12.2: Sequência de logs esperada (sem login)
```
🚀 AuthProvider montado, iniciando verificação...
🔍 checkUser: Iniciando verificação...
✅ checkUser: Resultado: Nenhum usuário
🏁 checkUser: Finalizando (loading = false)
```

#### Teste 12.3: Logs de erro (timeout)
```
🚀 AuthProvider montado, iniciando verificação...
🔍 checkUser: Iniciando verificação...
❌ checkUser: Erro ao verificar usuário: Timeout ao buscar usuário
⚠️ checkUser: Usando dados básicos sem profile
🏁 checkUser: Finalizando (loading = false)
```

---

## 🧪 Testes de Integração

### 13. Integração com Rotas

#### Teste 13.1: Proteção de rotas
- [ ] Tentar acessar `/` sem login
- [ ] **Resultado esperado**: AuthProvider verifica
- [ ] **Resultado esperado**: Middleware redireciona para `/login`

#### Teste 13.2: Acesso após login
- [ ] Fazer login
- [ ] Acessar rota protegida
- [ ] **Resultado esperado**: AuthProvider confirma usuário
- [ ] **Resultado esperado**: Acesso permitido

### 14. Integração com Componentes

#### Teste 14.1: useAuth em componentes
- [ ] Usar `const { user, loading } = useAuth()` em qualquer componente
- [ ] **Resultado esperado**: Dados disponíveis
- [ ] **Resultado esperado**: Loading state correto

#### Teste 14.2: Erro ao usar fora do Provider
- [ ] Tentar usar useAuth() fora de AuthProvider
- [ ] **Resultado esperado**: Erro: "useAuth must be used within an AuthProvider"

---

## ✅ Resumo de Aceitação

**A Fase 6 está COMPLETA quando:**

- [ ] ✅ AuthProvider integrado no layout.tsx
- [ ] ✅ Loading screen aparece apenas na verificação inicial
- [ ] ✅ onAuthStateChange listener funcionando
- [ ] ✅ Eventos SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED tratados
- [ ] ✅ Timeout de 3s para profile
- [ ] ✅ Timeout de 10s de segurança
- [ ] ✅ Fallback para dados básicos do Supabase
- [ ] ✅ Estado global acessível via useAuth()
- [ ] ✅ Sincronização entre múltiplas abas
- [ ] ✅ Sessão persiste entre reloads
- [ ] ✅ Token refresh automático (Supabase)
- [ ] ✅ Logs informativos no console
- [ ] ✅ Tratamento de erros robusto
- [ ] ✅ Performance adequada (< 3s first load)
- [ ] ✅ Loading screen responsivo
- [ ] ✅ ComponentesAuthLoading e PageSkeleton criados
- [ ] ✅ 0 erros de linter
- [ ] ✅ TypeScript 100%

---

## 📸 Capturas Recomendadas

Para documentação, tirar prints de:
1. Loading screen (primeira carga)
2. Loading screen mobile
3. Console logs (verificação bem-sucedida)
4. Console logs (timeout)
5. DevTools → Application → Local Storage (token)
6. DevTools → Console (auth state changes)
7. Multiple tabs sincronizadas

---

## 🎓 Cenários de Uso Reais

### Cenário 1: Primeiro Acesso
- [ ] Usuário nunca acessou antes
- [ ] Loading screen aparece
- [ ] Verificação detecta "sem usuário"
- [ ] Redireciona para login

### Cenário 2: Usuário Retornando
- [ ] Usuário já fez login antes
- [ ] Token ainda válido
- [ ] Loading screen < 1s
- [ ] Dashboard carrega imediatamente

### Cenário 3: Sessão Expirada
- [ ] Usuário retorna após muitos dias
- [ ] Token expirado
- [ ] Detecta expiração
- [ ] Pede novo login

### Cenário 4: Múltiplas Abas
- [ ] Usuário abre 2 abas
- [ ] Faz login na primeira
- [ ] Segunda aba atualiza automaticamente
- [ ] Ambas sincronizadas

### Cenário 5: Logout em Uma Aba
- [ ] Múltiplas abas abertas
- [ ] Logout em uma
- [ ] Todas detectam e redirecionam

---

## 🔧 Troubleshooting

### Problema: Loading infinito
**Solução**: Verificar console logs, deve ter timeout de 10s

### Problema: Não sincroniza entre abas
**Solução**: Verificar onAuthStateChange listener

### Problema: Perde sessão ao recarregar
**Solução**: Verificar se Supabase está salvando token corretamente

### Problema: Erro "useAuth must be used within AuthProvider"
**Solução**: Garantir que componente está dentro de AuthProvider

---

**Data de criação**: 2025-10-22  
**Fase**: 6 - AuthProvider e Estado Global  
**Status**: Pronto para testes  
**Testador**: Marcos Rocha

