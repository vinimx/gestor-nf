# 🧪 Checklist de Testes - Middleware e Proteção de Rotas (Fase 7)

## 📋 Visão Geral

Este documento contém uma lista completa de testes para validar o funcionamento do **Middleware de Autenticação e Autorização** implementado na Fase 7.

**Data de Criação**: 2025-10-22  
**Fase**: 7 - Proteção de Rotas (Middleware)  
**Componentes Testados**:
- `middleware.ts`
- `AuthErrorHandler`

---

## ✅ Checklist de Testes

### 1. **Rotas Públicas (Usuário NÃO Autenticado)**

#### 1.1 Acesso a Páginas de Autenticação
- [ ] Acessar `/login` → deve carregar normalmente
- [ ] Acessar `/registro` → deve carregar normalmente
- [ ] Acessar `/recuperar-senha` → deve carregar normalmente
- [ ] Acessar `/redefinir-senha` → deve carregar normalmente
- [ ] Acessar `/verificar-email` → deve carregar normalmente

#### 1.2 Redirecionamento para Login
- [ ] Tentar acessar `/` → deve redirecionar para `/login?redirect=/`
- [ ] Tentar acessar `/empresas` → deve redirecionar para `/login?redirect=/empresas`
- [ ] Tentar acessar `/notas` → deve redirecionar para `/login?redirect=/notas`
- [ ] Tentar acessar `/admin` → deve redirecionar para `/login?redirect=/admin`
- [ ] Verificar que o parâmetro `redirect` preserva a URL original

#### 1.3 Logs de Desenvolvimento (apenas em dev)
- [ ] Console mostra: `🔒 Middleware: Redirecionando usuário não autenticado de [rota] para /login`

---

### 2. **Rotas Públicas (Usuário Autenticado)**

#### 2.1 Redirecionamento para Home
- [ ] Usuário logado acessa `/login` → deve redirecionar para `/`
- [ ] Usuário logado acessa `/registro` → deve redirecionar para `/`
- [ ] Usuário logado acessa `/recuperar-senha` → deve redirecionar para `/`
- [ ] Usuário logado acessa `/redefinir-senha` → deve redirecionar para `/`

#### 2.2 Redirecionamento com Parâmetro
- [ ] Usuário logado acessa `/login?redirect=/empresas` → deve redirecionar para `/empresas`
- [ ] Usuário logado acessa `/login?redirect=/notas` → deve redirecionar para `/notas`
- [ ] Parâmetro `redirect=/` → deve redirecionar para `/` (não em loop)

#### 2.3 Logs de Desenvolvimento (apenas em dev)
- [ ] Console mostra: `🏠 Middleware: Usuário autenticado em rota pública, redirecionando para [destino]`

---

### 3. **Rotas Protegidas (Usuário Autenticado Normal)**

#### 3.1 Acesso Permitido
- [ ] Acessar `/` → deve carregar normalmente
- [ ] Acessar `/empresas` → deve carregar normalmente
- [ ] Acessar `/notas` → deve carregar normalmente
- [ ] Acessar qualquer rota protegida não-admin → deve funcionar

#### 3.2 Verificação de Sessão
- [ ] Sessão válida → acesso permitido
- [ ] Token não expirado → acesso permitido
- [ ] Cookies de autenticação presentes → acesso permitido

#### 3.3 Logs de Desenvolvimento (apenas em dev)
- [ ] Console mostra: `✅ Middleware: Acesso autorizado para [rota]`

---

### 4. **Rotas Admin (Usuário Admin)**

#### 4.1 Acesso Permitido para Admin
- [ ] Admin acessa `/admin` → deve carregar normalmente
- [ ] Admin acessa `/usuarios` → deve carregar normalmente
- [ ] Admin acessa qualquer subrota de `/admin/*` → deve funcionar

#### 4.2 Verificação de Role
- [ ] Middleware busca profile do usuário no banco
- [ ] Verifica que `role === 'admin'`
- [ ] Permite acesso apenas se role for `admin`

#### 4.3 Logs de Desenvolvimento (apenas em dev)
- [ ] Console mostra: `✅ Middleware: Acesso admin autorizado para [rota]`

---

### 5. **Rotas Admin (Usuário NÃO Admin)**

#### 5.1 Acesso Negado
- [ ] Usuário com `role: 'accountant'` tenta acessar `/admin` → redireciona para `/?error=unauthorized`
- [ ] Usuário com `role: 'viewer'` tenta acessar `/admin` → redireciona para `/?error=unauthorized`
- [ ] Usuário sem profile tenta acessar `/admin` → redireciona para `/?error=profile_not_found`

#### 5.2 Toast de Erro Exibido
- [ ] Erro `unauthorized` → mostra "Acesso Negado - Você não tem permissão..."
- [ ] Erro `profile_not_found` → mostra "Erro de Autenticação - Não foi possível..."
- [ ] Erro `verification_failed` → mostra "Erro de Verificação - Ocorreu um erro..."

#### 5.3 Limpeza de Parâmetros
- [ ] Após exibir o toast, o parâmetro `?error=...` é removido da URL
- [ ] URL fica limpa: `/?error=unauthorized` → `/`

#### 5.4 Logs de Desenvolvimento (apenas em dev)
- [ ] Console mostra: `🚫 Middleware: Acesso negado - Role [role] tentou acessar rota admin: [rota]`

---

### 6. **Persistência de Sessão**

#### 6.1 Refresh da Página
- [ ] Usuário autenticado → refresh da página → continua autenticado
- [ ] Usuário em rota protegida → refresh → permanece na mesma rota
- [ ] Cookies são mantidos após refresh

#### 6.2 Navegação entre Rotas
- [ ] Navegar de `/empresas` para `/notas` → sem necessidade de reautenticar
- [ ] Navegar entre rotas protegidas → middleware valida sessão
- [ ] Performance: validação rápida (< 100ms)

---

### 7. **Expiração de Sessão**

#### 7.1 Token Expirado
- [ ] Token JWT expira → próxima request → redireciona para `/login`
- [ ] Supabase tenta auto-refresh → se falhar → logout automático
- [ ] Mensagem clara de sessão expirada (se configurado)

#### 7.2 Logout Manual
- [ ] Usuário faz logout → cookies limpos
- [ ] Tentar acessar rota protegida → redireciona para `/login`
- [ ] Histórico de navegação não permite voltar para rotas protegidas

---

### 8. **Erros e Edge Cases**

#### 8.1 Erros de Banco de Dados
- [ ] Supabase indisponível → middleware lida graciosamente
- [ ] Erro ao buscar profile → redireciona com `error=verification_failed`
- [ ] Timeout na query → fail secure (nega acesso)

#### 8.2 Dados Inválidos
- [ ] Profile sem campo `role` → nega acesso
- [ ] `role` com valor inválido → nega acesso
- [ ] Session com dados corrompidos → nega acesso

#### 8.3 URLs Especiais
- [ ] Acessar `/login?redirect=/login` → deve redirecionar para `/` (evitar loop)
- [ ] Acessar rota com query params → `/?tab=empresas` → preserva query params
- [ ] Acessar rota com hash → `/#section` → preserva hash (se aplicável)

---

### 9. **Performance**

#### 9.1 Tempo de Resposta
- [ ] Middleware executa em < 100ms (rota normal)
- [ ] Middleware executa em < 200ms (rota admin com query DB)
- [ ] Sem lag perceptível na navegação

#### 9.2 Otimização
- [ ] Middleware não executa em rotas de assets (`_next/static`)
- [ ] Middleware não executa em imagens (`*.svg`, `*.png`, etc.)
- [ ] Matcher configurado corretamente para evitar execuções desnecessárias

---

### 10. **Segurança**

#### 10.1 Fail Secure
- [ ] Em caso de dúvida ou erro → SEMPRE negar acesso
- [ ] Nunca expor razão exata do erro de autenticação ao usuário
- [ ] Logs detalhados apenas em desenvolvimento

#### 10.2 Proteção contra Bypass
- [ ] Não é possível acessar rota protegida via manipulação de cookies
- [ ] Não é possível acessar rota admin alterando role no client-side
- [ ] Verificação sempre feita no servidor (middleware)

#### 10.3 Injeção de Parâmetros
- [ ] Parâmetro `redirect` não aceita URLs externas
- [ ] Redirecionamento sempre dentro do domínio
- [ ] Sanitização de parâmetros de erro

---

### 11. **Compatibilidade com Next.js**

#### 11.1 Matcher
- [ ] Config `matcher` exclui corretamente: `_next/static`, `_next/image`, `favicon.ico`
- [ ] Config `matcher` exclui arquivos de imagem: `*.svg`, `*.png`, `*.jpg`, etc.
- [ ] Middleware NÃO executa em rotas da API (se aplicável)

#### 11.2 Integração com App Router
- [ ] Funciona com route groups: `(auth)`, `(protected)`
- [ ] Funciona com rotas dinâmicas: `[id]`
- [ ] Funciona com catch-all routes: `[...slug]`

---

### 12. **AuthErrorHandler Component**

#### 12.1 Detecção de Erros
- [ ] Detecta parâmetro `?error=unauthorized` na URL
- [ ] Detecta parâmetro `?error=profile_not_found` na URL
- [ ] Detecta parâmetro `?error=verification_failed` na URL
- [ ] Detecta parâmetro `?error=session_expired` na URL

#### 12.2 Exibição de Toast
- [ ] Toast é exibido automaticamente ao detectar erro
- [ ] Título e descrição corretos para cada tipo de erro
- [ ] Variante `destructive` (vermelho) usada
- [ ] Toast desaparece após tempo padrão

#### 12.3 Limpeza de URL
- [ ] Parâmetro `error` é removido da URL após toast
- [ ] Remoção não causa reload da página
- [ ] Navegação no histórico funciona corretamente

---

### 13. **Logs de Desenvolvimento**

#### 13.1 Console Limpo em Produção
- [ ] Em produção (`NODE_ENV=production`) → sem logs no console
- [ ] Em desenvolvimento (`NODE_ENV=development`) → logs informativos

#### 13.2 Logs Úteis em Dev
- [ ] Logs usam emojis para facilitar identificação
- [ ] Logs incluem informações relevantes (rota, role, etc.)
- [ ] Logs de erro incluem stack trace (quando necessário)

---

### 14. **Testes de Integração**

#### 14.1 Fluxo Completo: Não Autenticado → Login → Rota Protegida
1. [ ] Acessar `/empresas` sem estar logado
2. [ ] Ser redirecionado para `/login?redirect=/empresas`
3. [ ] Fazer login com credenciais válidas
4. [ ] Ser redirecionado automaticamente para `/empresas`
5. [ ] Acessar a página normalmente

#### 14.2 Fluxo Completo: Logout → Tentar Acessar Rota Protegida
1. [ ] Estar logado em rota protegida
2. [ ] Fazer logout
3. [ ] Tentar acessar rota protegida
4. [ ] Ser redirecionado para `/login`

#### 14.3 Fluxo Completo: Viewer Tenta Acessar Admin
1. [ ] Fazer login como `viewer`
2. [ ] Tentar acessar `/admin`
3. [ ] Ser redirecionado para `/?error=unauthorized`
4. [ ] Ver toast de "Acesso Negado"
5. [ ] Permanecer na home

---

### 15. **Testes em Múltiplos Navegadores**

#### 15.1 Chrome
- [ ] Middleware funciona corretamente
- [ ] Cookies são preservados
- [ ] Redirecionamentos funcionam

#### 15.2 Firefox
- [ ] Middleware funciona corretamente
- [ ] Cookies são preservados
- [ ] Redirecionamentos funcionam

#### 15.3 Safari
- [ ] Middleware funciona corretamente
- [ ] Cookies são preservados (importante no Safari!)
- [ ] Redirecionamentos funcionam

#### 15.4 Edge
- [ ] Middleware funciona corretamente
- [ ] Cookies são preservados
- [ ] Redirecionamentos funcionam

---

### 16. **Testes em Dispositivos Móveis**

#### 16.1 Android Chrome
- [ ] Middleware funciona
- [ ] Performance aceitável
- [ ] Redirecionamentos suaves

#### 16.2 iOS Safari
- [ ] Middleware funciona
- [ ] Cookies persistem (crítico no iOS!)
- [ ] Redirecionamentos suaves

---

## 📊 Resumo de Testes

**Total de Testes**: ~100 casos

### Categorias:
- ✅ Rotas Públicas (não autenticado): 8 testes
- ✅ Rotas Públicas (autenticado): 7 testes
- ✅ Rotas Protegidas: 6 testes
- ✅ Rotas Admin (admin): 5 testes
- ✅ Rotas Admin (não admin): 8 testes
- ✅ Persistência de Sessão: 5 testes
- ✅ Expiração de Sessão: 5 testes
- ✅ Erros e Edge Cases: 9 testes
- ✅ Performance: 5 testes
- ✅ Segurança: 6 testes
- ✅ Compatibilidade Next.js: 5 testes
- ✅ AuthErrorHandler: 9 testes
- ✅ Logs: 5 testes
- ✅ Integração: 11 testes
- ✅ Navegadores: 12 testes
- ✅ Mobile: 6 testes

---

## 🚀 Como Testar

### Preparação
1. Certifique-se de ter pelo menos 3 usuários de teste:
   - Um com `role: 'admin'`
   - Um com `role: 'accountant'`
   - Um com `role: 'viewer'`

2. Abra o console do navegador (F12) para ver os logs

3. Use modo anônimo para testar fluxos de não autenticado

### Executar Testes
1. **Testes Manuais**: Seguir cada item do checklist acima
2. **Validação**: Marcar ✅ cada teste que passar
3. **Bugs**: Documentar qualquer falha encontrada

---

## 🐛 Bugs Conhecidos / Issues

| # | Descrição | Severidade | Status |
|---|-----------|------------|--------|
| - | Nenhum conhecido | - | - |

---

## ✅ Critérios de Aceitação

A Fase 7 é considerada **COMPLETA** quando:

- [ ] ✅ 100% dos testes de rotas públicas passam
- [ ] ✅ 100% dos testes de rotas protegidas passam
- [ ] ✅ 100% dos testes de rotas admin passam
- [ ] ✅ Todos os redirecionamentos funcionam corretamente
- [ ] ✅ AuthErrorHandler exibe mensagens apropriadas
- [ ] ✅ Performance aceitável (< 200ms)
- [ ] ✅ Funciona em todos os navegadores principais
- [ ] ✅ Segurança validada (fail secure)
- [ ] ✅ Sem bugs críticos ou de segurança

---

**Última atualização**: 2025-10-22  
**Responsável pelos testes**: Marcos Rocha  
**Status**: Aguardando execução


