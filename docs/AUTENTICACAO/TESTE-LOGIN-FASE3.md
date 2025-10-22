# ✅ Checklist de Testes - FASE 3: LoginForm

## 🎯 Objetivo
Validar todas as funcionalidades do LoginForm implementadas na Fase 3

---

## 📋 Testes de Validação

### 1. Validação de Email

#### Teste 1.1: Email vazio
- [ ] Deixar campo de email vazio
- [ ] Clicar fora do campo (blur)
- [ ] **Resultado esperado**: Ícone vermelho (⚠️) + mensagem "Email é obrigatório"
- [ ] **Resultado esperado**: Borda vermelha no campo

#### Teste 1.2: Email inválido
- [ ] Digitar "teste" (sem @)
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone vermelho + mensagem "Email inválido"

#### Teste 1.3: Email inválido (sem domínio)
- [ ] Digitar "teste@"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone vermelho + mensagem "Email inválido"

#### Teste 1.4: Email válido
- [ ] Digitar "teste@email.com"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone verde (✓) + borda verde
- [ ] **Resultado esperado**: Mensagem de erro desaparece

### 2. Validação de Senha

#### Teste 2.1: Senha vazia
- [ ] Deixar campo de senha vazio
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone vermelho + mensagem "Senha é obrigatória"

#### Teste 2.2: Senha curta
- [ ] Digitar "123" (menos de 6 caracteres)
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone vermelho + mensagem "Senha deve ter pelo menos 6 caracteres"

#### Teste 2.3: Senha válida
- [ ] Digitar "123456" (6+ caracteres)
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone verde (✓) + borda verde

### 3. Toggle Mostrar/Ocultar Senha

#### Teste 3.1: Mostrar senha
- [ ] Digitar uma senha
- [ ] Clicar no ícone do olho (👁️)
- [ ] **Resultado esperado**: Senha visível em texto plano
- [ ] **Resultado esperado**: Ícone muda para olho cortado (🚫👁️)

#### Teste 3.2: Ocultar senha
- [ ] Com senha visível, clicar novamente no ícone
- [ ] **Resultado esperado**: Senha volta a ser ocultada (••••••)
- [ ] **Resultado esperado**: Ícone volta para olho normal (👁️)

---

## 🔄 Testes de Fluxo

### 4. Validação em Tempo Real

#### Teste 4.1: Correção de erro
- [ ] Deixar email vazio e sair do campo (erro aparece)
- [ ] Voltar ao campo e digitar email válido
- [ ] **Resultado esperado**: Erro desaparece em tempo real
- [ ] **Resultado esperado**: Ícone muda de vermelho para verde

#### Teste 4.2: Validação durante digitação
- [ ] Deixar email vazio e sair do campo (campo "tocado")
- [ ] Voltar ao campo e digitar caractere por caractere
- [ ] **Resultado esperado**: Validação acontece a cada tecla digitada
- [ ] **Resultado esperado**: Feedback visual atualiza dinamicamente

### 5. Submit com Erros

#### Teste 5.1: Submit com campos vazios
- [ ] Deixar todos os campos vazios
- [ ] Clicar no botão "Entrar"
- [ ] **Resultado esperado**: Ambos os campos mostram erro
- [ ] **Resultado esperado**: Foco automático no campo de email
- [ ] **Resultado esperado**: Formulário não é enviado

#### Teste 5.2: Submit com apenas email válido
- [ ] Preencher email válido
- [ ] Deixar senha vazia
- [ ] Clicar em "Entrar"
- [ ] **Resultado esperado**: Apenas campo de senha mostra erro
- [ ] **Resultado esperado**: Foco automático no campo de senha

---

## 🔐 Testes de Autenticação

### 6. Login com Credenciais Inválidas

#### Teste 6.1: Email não cadastrado
- [ ] Digitar "naocadastrado@email.com"
- [ ] Digitar qualquer senha
- [ ] Clicar em "Entrar"
- [ ] **Resultado esperado**: Toast de erro aparece
- [ ] **Resultado esperado**: Mensagem: "Email ou senha incorretos"
- [ ] **Resultado esperado**: Foco volta para o campo de senha
- [ ] **Resultado esperado**: Senha é selecionada automaticamente

#### Teste 6.2: Senha incorreta
- [ ] Digitar email cadastrado
- [ ] Digitar senha errada
- [ ] Clicar em "Entrar"
- [ ] **Resultado esperado**: Toast de erro (mesma mensagem)
- [ ] **Resultado esperado**: Foco e seleção na senha

### 7. Login com Credenciais Válidas

#### Teste 7.1: Login bem-sucedido
- [ ] Digitar credenciais válidas
- [ ] Clicar em "Entrar"
- [ ] **Resultado esperado**: Botão mostra loading spinner
- [ ] **Resultado esperado**: Botão muda para "Entrando..."
- [ ] **Resultado esperado**: Campos ficam desabilitados
- [ ] **Resultado esperado**: Toast de sucesso aparece
- [ ] **Resultado esperado**: Redirecionamento para "/"

#### Teste 7.2: Login com redirecionamento
- [ ] Acessar `/login?redirect=/empresas`
- [ ] Fazer login com credenciais válidas
- [ ] **Resultado esperado**: Redirecionamento para `/empresas`

---

## ♿ Testes de Acessibilidade

### 8. Navegação por Teclado

#### Teste 8.1: Ordem de tab
- [ ] Pressionar Tab a partir do topo da página
- [ ] **Resultado esperado**: Foco vai para campo de email
- [ ] Pressionar Tab novamente
- [ ] **Resultado esperado**: Foco vai para campo de senha
- [ ] Pressionar Tab novamente
- [ ] **Resultado esperado**: Foco vai para botão "Entrar"

#### Teste 8.2: Submit com Enter
- [ ] Preencher credenciais válidas
- [ ] Pressionar Enter (sem clicar no botão)
- [ ] **Resultado esperado**: Formulário é submetido normalmente

#### Teste 8.3: Navegação reversa
- [ ] Usar Shift+Tab para voltar
- [ ] **Resultado esperado**: Ordem inversa funciona corretamente

### 9. Screen Readers

#### Teste 9.1: Labels descritivos
- [ ] Verificar que cada campo tem um `<Label>` associado
- [ ] **Resultado esperado**: `id` do input corresponde ao `htmlFor` do label

#### Teste 9.2: Mensagens de erro
- [ ] Gerar erro de validação
- [ ] **Resultado esperado**: Mensagem tem `id` único
- [ ] **Resultado esperado**: Input tem `aria-describedby` apontando para a mensagem

#### Teste 9.3: Estado de erro
- [ ] Gerar erro
- [ ] **Resultado esperado**: Input tem `aria-invalid="true"`

#### Teste 9.4: Labels de botões
- [ ] Verificar botão de toggle senha
- [ ] **Resultado esperado**: Tem `aria-label` apropriado

---

## 📱 Testes de Responsividade

### 10. Mobile (< 640px)

#### Teste 10.1: Layout mobile
- [ ] Abrir DevTools e mudar para visualização mobile
- [ ] **Resultado esperado**: Formulário ocupa largura adequada
- [ ] **Resultado esperado**: Botões têm tamanho touch-friendly (mín 44x44px)
- [ ] **Resultado esperado**: Texto legível sem zoom

#### Teste 10.2: Teclado virtual
- [ ] Focar em campo de email
- [ ] **Resultado esperado**: Teclado de email aparece (com @)
- [ ] Focar em campo de senha
- [ ] **Resultado esperado**: Teclado apropriado para senha

### 11. Tablet (640-1024px)

#### Teste 11.1: Layout tablet
- [ ] Testar em resolução de tablet
- [ ] **Resultado esperado**: Layout se adapta corretamente
- [ ] **Resultado esperado**: Espaçamentos adequados

### 12. Desktop (> 1024px)

#### Teste 12.1: Layout desktop
- [ ] Testar em tela grande
- [ ] **Resultado esperado**: Formulário não fica muito largo
- [ ] **Resultado esperado**: Elementos bem espaçados

---

## 🎨 Testes Visuais

### 13. Estados de Loading

#### Teste 13.1: Loading durante login
- [ ] Iniciar login
- [ ] **Resultado esperado**: Spinner animado aparece
- [ ] **Resultado esperado**: Texto muda para "Entrando..."
- [ ] **Resultado esperado**: Botão fica desabilitado
- [ ] **Resultado esperado**: Campos ficam desabilitados

### 14. Estados de Foco

#### Teste 14.1: Auto-foco inicial
- [ ] Recarregar a página de login
- [ ] **Resultado esperado**: Campo de email já está focado
- [ ] **Resultado esperado**: Pode começar a digitar imediatamente

#### Teste 14.2: Foco após erro
- [ ] Submeter com email inválido
- [ ] **Resultado esperado**: Foco retorna ao campo de email
- [ ] Submeter com senha inválida
- [ ] **Resultado esperado**: Foco retorna ao campo de senha

### 15. Feedback Visual

#### Teste 15.1: Ícones de status
- [ ] Email válido
- [ ] **Resultado esperado**: Ícone verde de check (✓)
- [ ] Email inválido
- [ ] **Resultado esperado**: Ícone vermelho de alerta (⚠️)

#### Teste 15.2: Cores de borda
- [ ] Campo válido
- [ ] **Resultado esperado**: Borda verde
- [ ] Campo inválido
- [ ] **Resultado esperado**: Borda vermelha
- [ ] Campo neutro
- [ ] **Resultado esperado**: Borda cinza padrão

---

## 🔒 Testes de Segurança

### 16. Proteção de Dados

#### Teste 16.1: Senha não exposta
- [ ] Digitar senha
- [ ] Inspecionar elemento no DevTools
- [ ] **Resultado esperado**: Input type="password" (não type="text")
- [ ] **Resultado esperado**: Valor não visível no HTML

#### Teste 16.2: Autocomplete
- [ ] Verificar campo de email
- [ ] **Resultado esperado**: Tem `autocomplete="email"`
- [ ] Verificar campo de senha
- [ ] **Resultado esperado**: Tem `autocomplete="current-password"`

#### Teste 16.3: Mensagens genéricas
- [ ] Testar login com email não cadastrado
- [ ] **Resultado esperado**: Mensagem não revela se email existe
- [ ] **Resultado esperado**: Usa mensagem genérica "Email ou senha incorretos"

---

## ✅ Resumo de Aceitação

**A Fase 3 está COMPLETA quando:**

- [ ] ✅ Todas as validações funcionando (cliente)
- [ ] ✅ Validação em tempo real (onBlur + onChange)
- [ ] ✅ Feedback visual imediato (ícones + bordas + mensagens)
- [ ] ✅ Auto-foco funcionando (inicial + após erros)
- [ ] ✅ Login funcional com credenciais válidas
- [ ] ✅ Mensagens de erro amigáveis e traduzidas
- [ ] ✅ Loading states visíveis e apropriados
- [ ] ✅ Redirecionamento correto (com e sem query param)
- [ ] ✅ Acessibilidade completa (ARIA, keyboard nav)
- [ ] ✅ Responsivo em todos os tamanhos
- [ ] ✅ Segurança básica (mensagens genéricas, autocomplete)
- [ ] ✅ 0 erros de linter
- [ ] ✅ 0 erros de TypeScript

---

## 📸 Capturas Recomendadas

Para documentação, tirar prints de:
1. Estado inicial (campos vazios)
2. Validação de erro (email inválido)
3. Validação de sucesso (ambos válidos)
4. Estado de loading (durante login)
5. Mobile view
6. Tablet view
7. Desktop view

---

**Data de criação**: 2025-10-22  
**Fase**: 3 - LoginForm  
**Status**: Pronto para testes  
**Testador**: Marcos Rocha

