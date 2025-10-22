# ✅ Checklist de Testes - FASE 5: Recuperação e Redefinição de Senha

## 🎯 Objetivo
Validar todas as funcionalidades de recuperação e redefinição de senha implementadas na Fase 5

---

## 📋 Testes de RecoverPasswordForm

### 1. Validação de Email

#### Teste 1.1: Email vazio
- [ ] Deixar campo vazio
- [ ] Clicar fora do campo (blur)
- [ ] **Resultado esperado**: Ícone vermelho (⚠️) + mensagem "Email é obrigatório"
- [ ] **Resultado esperado**: Borda vermelha

#### Teste 1.2: Email inválido
- [ ] Digitar "teste" (sem @)
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone vermelho + mensagem "Email inválido"

#### Teste 1.3: Email válido
- [ ] Digitar "teste@email.com"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone verde (✓) + borda verde
- [ ] **Resultado esperado**: Mensagem de erro desaparece

### 2. Validação em Tempo Real

#### Teste 2.1: Correção em tempo real
- [ ] Deixar email vazio e sair do campo (erro aparece)
- [ ] Voltar e digitar email válido
- [ ] **Resultado esperado**: Erro desaparece instantaneamente
- [ ] **Resultado esperado**: Ícone muda para verde

### 3. Submit do Formulário

#### Teste 3.1: Submit com email vazio
- [ ] Clicar em "Enviar Email de Recuperação" sem preencher
- [ ] **Resultado esperado**: Erro aparece
- [ ] **Resultado esperado**: Foco permanece no campo
- [ ] **Resultado esperado**: Formulário não é enviado

#### Teste 3.2: Submit com email válido
- [ ] Digitar email válido
- [ ] Clicar em "Enviar"
- [ ] **Resultado esperado**: Botão mostra loading spinner
- [ ] **Resultado esperado**: Texto muda para "Enviando..."
- [ ] **Resultado esperado**: Campo desabilitado
- [ ] **Resultado esperado**: Toast de sucesso aparece

### 4. Tela de Sucesso (Email Enviado)

#### Teste 4.1: Conteúdo da tela
- [ ] Após envio bem-sucedido
- [ ] **Resultado esperado**: Ícone de email grande
- [ ] **Resultado esperado**: Título "Email Enviado!"
- [ ] **Resultado esperado**: Mensagem com email preenchido visível
- [ ] **Resultado esperado**: Info box com instruções:
  - "Verifique sua caixa de entrada"
  - "Procure também no spam/lixo eletrônico"
  - "O link expira em 1 hora"

#### Teste 4.2: Botão de voltar
- [ ] Clicar em "Voltar para Login"
- [ ] **Resultado esperado**: Redireciona para `/login`

#### Teste 4.3: Redirecionamento automático
- [ ] Aguardar após envio
- [ ] **Resultado esperado**: Mensagem "Redirecionando... em 5 segundos"
- [ ] **Resultado esperado**: Redireciona para `/login` após 5s

### 5. Mensagem de Segurança

#### Teste 5.1: Mensagem genérica
- [ ] Usar email não cadastrado
- [ ] Enviar formulário
- [ ] **Resultado esperado**: Mesma mensagem de sucesso
- [ ] **Resultado esperado**: "Se existe uma conta com o email..."
- [ ] **Resultado esperado**: Não revela se email existe ou não

---

## 📋 Testes de ResetPasswordForm

### 6. Validação de Senha

#### Teste 6.1: Senha vazia
- [ ] Deixar campo vazio
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone vermelho + mensagem "Senha é obrigatória"

#### Teste 6.2: Senha curta
- [ ] Digitar "abc123" (menos de 8 caracteres)
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Mensagem de erro
- [ ] **Resultado esperado**: Indicador de força mostra "Muito fraca"

#### Teste 6.3: Senha sem maiúscula
- [ ] Digitar "senha1234"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Mensagem "Deve conter pelo menos uma letra maiúscula"

#### Teste 6.4: Senha sem minúscula
- [ ] Digitar "SENHA1234"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Mensagem "Deve conter pelo menos uma letra minúscula"

#### Teste 6.5: Senha sem número
- [ ] Digitar "SenhaForte"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Mensagem "Deve conter pelo menos um número"

#### Teste 6.6: Senha válida
- [ ] Digitar "Senha123"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone verde + borda verde
- [ ] **Resultado esperado**: Indicador mostra força adequada

### 7. Validação de Confirmação de Senha

#### Teste 7.1: Confirmar senha vazia
- [ ] Preencher senha
- [ ] Deixar confirmação vazia
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Mensagem "Confirme sua senha"

#### Teste 7.2: Senhas não coincidem
- [ ] Senha: "Senha123"
- [ ] Confirmar: "Senha456"
- [ ] Clicar fora do campo de confirmação
- [ ] **Resultado esperado**: Ícone vermelho + "As senhas não coincidem"

#### Teste 7.3: Senhas coincidem
- [ ] Senha: "Senha123"
- [ ] Confirmar: "Senha123"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone verde + borda verde

#### Teste 7.4: Revalidação ao mudar senha principal
- [ ] Preencher senha: "Senha123"
- [ ] Confirmar: "Senha123" (verde)
- [ ] Voltar e mudar senha para "Senha456"
- [ ] **Resultado esperado**: Confirmação volta a mostrar erro
- [ ] **Resultado esperado**: "As senhas não coincidem"

### 8. Indicador de Força da Senha

#### Teste 8.1: Funcionamento completo
- [ ] Digitar senha progressivamente
- [ ] **Resultado esperado**: Barra atualiza em tempo real
- [ ] **Resultado esperado**: Requisitos mudam de ✗ para ✓
- [ ] **Resultado esperado**: Label de força atualiza (Fraca → Forte)

#### Teste 8.2: Lista de requisitos
- [ ] Verificar que mostra 5 requisitos:
  - Mínimo 8 caracteres
  - Letra maiúscula
  - Letra minúscula
  - Número
  - Caractere especial
- [ ] Senha "Senha123!" cumpre 5/5 requisitos

### 9. Info Box de Segurança

#### Teste 9.1: Presença do info box
- [ ] Verificar presença do box amarelo/laranja
- [ ] **Resultado esperado**: Ícone de cadeado
- [ ] **Resultado esperado**: Título "Por segurança:"
- [ ] **Resultado esperado**: 3 itens listados:
  - Desconectar de todos dispositivos
  - Usar senha forte
  - Não compartilhar senha

### 10. Submit do Formulário

#### Teste 10.1: Submit com campos vazios
- [ ] Clicar em "Redefinir Senha" sem preencher
- [ ] **Resultado esperado**: Ambos os campos mostram erro
- [ ] **Resultado esperado**: Foco automático no campo de senha
- [ ] **Resultado esperado**: Formulário não é enviado

#### Teste 10.2: Submit com apenas senha válida
- [ ] Preencher apenas senha
- [ ] Clicar em "Redefinir Senha"
- [ ] **Resultado esperado**: Apenas confirmação mostra erro
- [ ] **Resultado esperado**: Foco no campo de confirmação

#### Teste 10.3: Submit com dados válidos
- [ ] Preencher ambos corretamente
- [ ] Clicar em "Redefinir Senha"
- [ ] **Resultado esperado**: Botão mostra loading
- [ ] **Resultado esperado**: Texto "Redefinindo..."
- [ ] **Resultado esperado**: Campos desabilitados
- [ ] **Resultado esperado**: Toast de sucesso
- [ ] **Resultado esperado**: Redirecionamento para `/login` após 2s

---

## 🔄 Testes de Fluxo Completo

### 11. Fluxo Completo de Recuperação

#### Teste 11.1: Fluxo feliz (Happy Path)
- [ ] **Passo 1**: Acessar `/recuperar-senha`
- [ ] **Passo 2**: Digitar email válido
- [ ] **Passo 3**: Clicar em "Enviar"
- [ ] **Passo 4**: Ver tela de sucesso
- [ ] **Passo 5**: Abrir email recebido
- [ ] **Passo 6**: Clicar no link do email
- [ ] **Passo 7**: Redirecionar para `/redefinir-senha`
- [ ] **Passo 8**: Digitar nova senha forte
- [ ] **Passo 9**: Confirmar senha
- [ ] **Passo 10**: Clicar em "Redefinir Senha"
- [ ] **Passo 11**: Ver toast de sucesso
- [ ] **Passo 12**: Redirecionar para `/login`
- [ ] **Passo 13**: Fazer login com nova senha
- [ ] **Resultado esperado**: Login bem-sucedido

#### Teste 11.2: Token expirado
- [ ] Solicitar recuperação de senha
- [ ] Aguardar mais de 1 hora
- [ ] Clicar no link do email
- [ ] **Resultado esperado**: Mensagem "Link inválido ou expirado"
- [ ] **Resultado esperado**: Sugestão para solicitar novo link

#### Teste 11.3: Token já usado
- [ ] Solicitar recuperação
- [ ] Usar o link e redefinir senha
- [ ] Tentar usar o mesmo link novamente
- [ ] **Resultado esperado**: Mensagem "Link inválido ou expirado"

---

## 🎨 Testes Visuais

### 12. Toggle Mostrar/Ocultar Senha

#### Teste 12.1: Campo senha
- [ ] Digitar senha
- [ ] Clicar no ícone do olho
- [ ] **Resultado esperado**: Senha visível
- [ ] **Resultado esperado**: Ícone muda para olho cortado
- [ ] Clicar novamente
- [ ] **Resultado esperado**: Senha oculta

#### Teste 12.2: Campo confirmar senha
- [ ] Mesmo comportamento independente

### 13. Ícones de Status

#### Teste 13.1: RecoverPasswordForm
- [ ] Email inválido: AlertCircle vermelho
- [ ] Email válido: CheckCircle2 verde

#### Teste 13.2: ResetPasswordForm
- [ ] Senha inválida: AlertCircle vermelho
- [ ] Senha válida: CheckCircle2 verde
- [ ] Confirmação incorreta: AlertCircle vermelho
- [ ] Confirmação correta: CheckCircle2 verde

### 14. Bordas Coloridas

#### Teste 14.1: Estados
- [ ] Neutro: borda cinza
- [ ] Erro: borda vermelha
- [ ] Válido: borda verde

### 15. Estados de Loading

#### Teste 15.1: RecoverPasswordForm
- [ ] Spinner animado
- [ ] Texto "Enviando..."
- [ ] Botão desabilitado
- [ ] Campo desabilitado

#### Teste 15.2: ResetPasswordForm
- [ ] Spinner animado
- [ ] Texto "Redefinindo..."
- [ ] Botão desabilitado
- [ ] Campos desabilitados

---

## ♿ Testes de Acessibilidade

### 16. Navegação por Teclado

#### Teste 16.1: RecoverPasswordForm
- [ ] Tab: email → botão enviar
- [ ] Shift+Tab: ordem reversa
- [ ] Enter no campo: submete formulário

#### Teste 16.2: ResetPasswordForm
- [ ] Tab: senha → confirmar → botão
- [ ] Shift+Tab: ordem reversa
- [ ] Enter: submete formulário

### 17. ARIA e Screen Readers

#### Teste 17.1: Labels
- [ ] Cada campo tem Label associado
- [ ] ID do input = htmlFor do label

#### Teste 17.2: Descrição de erros
- [ ] Campo com erro tem `aria-describedby`
- [ ] Mensagem tem ID único
- [ ] `aria-invalid="true"` quando há erro

#### Teste 17.3: AutoComplete
- [ ] RecoverPasswordForm: `autocomplete="email"`
- [ ] ResetPasswordForm senha: `autocomplete="new-password"`
- [ ] ResetPasswordForm confirmar: `autocomplete="new-password"`

---

## 📱 Testes de Responsividade

### 18. Mobile (< 640px)

#### Teste 18.1: RecoverPasswordForm
- [ ] Layout adaptado
- [ ] Botões touch-friendly
- [ ] Info box legível
- [ ] Tela de sucesso bem formatada

#### Teste 18.2: ResetPasswordForm
- [ ] Campos de senha legíveis
- [ ] Toggle senha acessível
- [ ] Indicador de força não quebra
- [ ] Info box de segurança legível

### 19. Tablet (640-1024px)

#### Teste 19.1: Layouts
- [ ] Espaçamentos adequados
- [ ] Elementos bem posicionados

### 20. Desktop (> 1024px)

#### Teste 20.1: Layouts
- [ ] Formulário não muito largo
- [ ] Hover states funcionam
- [ ] Info boxes bem posicionados

---

## 🔒 Testes de Segurança

### 21. Proteção de Dados

#### Teste 21.1: Senha oculta por padrão
- [ ] Input type="password"
- [ ] Valor não visível no DevTools
- [ ] Apenas visível ao clicar no toggle

#### Teste 21.2: Mensagens seguras
- [ ] Recuperação não revela se email existe
- [ ] Mensagem sempre genérica: "Se o email existir..."

#### Teste 21.3: Token único
- [ ] Link de recuperação funciona apenas uma vez
- [ ] Após usar, link se torna inválido

#### Teste 21.4: Expiração de token
- [ ] Link expira em 1 hora
- [ ] Após expirar, mostra mensagem apropriada

---

## 🔗 Testes de Integração

### 22. Integração com Emails

#### Teste 22.1: Email de recuperação recebido
- [ ] Email chega na caixa de entrada
- [ ] Assunto claro
- [ ] Design profissional (templates HTML)
- [ ] Link funcional
- [ ] Informações de expiração presentes

#### Teste 22.2: Conteúdo do email
- [ ] Logo/branding presente
- [ ] Mensagem clara
- [ ] Botão destacado
- [ ] Link alternativo (fallback)
- [ ] Info sobre expiração (1 hora)
- [ ] Footer com contato

### 23. Integração com Supabase

#### Teste 23.1: RecoverPasswordForm
- [ ] Integra corretamente com `useAuth.resetPassword()`
- [ ] Email enviado pelo Supabase
- [ ] Token gerado corretamente

#### Teste 23.2: ResetPasswordForm
- [ ] Integra com `supabase.auth.updateUser()`
- [ ] Senha atualizada no banco
- [ ] Sessões antigas invalidadas

---

## 📧 Testes de Email (Templates HTML)

### 24. Compatibilidade de Email Clients

#### Teste 24.1: Gmail
- [ ] Renderiza corretamente
- [ ] Gradientes funcionam
- [ ] Botão clicável
- [ ] Link alternativo visível

#### Teste 24.2: Outlook
- [ ] Renderiza (pode perder gradientes)
- [ ] Botão funcional
- [ ] Texto legível
- [ ] Link alternativo funciona

#### Teste 24.3: Apple Mail
- [ ] Renderização completa
- [ ] Melhor suporte visual

#### Teste 24.4: Mobile Email
- [ ] Responsivo em mobile
- [ ] Botão touch-friendly
- [ ] Texto legível sem zoom

---

## ✅ Resumo de Aceitação

**A Fase 5 está COMPLETA quando:**

- [ ] ✅ RecoverPasswordForm funcional
- [ ] ✅ Validação de email em tempo real
- [ ] ✅ Tela de sucesso após envio
- [ ] ✅ Redirecionamento automático (5s)
- [ ] ✅ ResetPasswordForm funcional
- [ ] ✅ Validações de senha forte
- [ ] ✅ Indicador de força visível e funcional
- [ ] ✅ Confirmação de senha com revalidação
- [ ] ✅ Info box de segurança presente
- [ ] ✅ Auto-foco em campos apropriados
- [ ] ✅ Feedback visual completo (ícones + bordas + mensagens)
- [ ] ✅ Loading states visíveis
- [ ] ✅ Acessibilidade WCAG AAA
- [ ] ✅ Responsivo em todos os tamanhos
- [ ] ✅ Email recebido com template profissional
- [ ] ✅ Link de recuperação funcional
- [ ] ✅ Token expira em 1 hora
- [ ] ✅ Token uso único
- [ ] ✅ Senha redefinida com sucesso
- [ ] ✅ Login com nova senha funciona
- [ ] ✅ 0 erros de linter
- [ ] ✅ TypeScript 100%

---

## 📸 Capturas Recomendadas

Para documentação, tirar prints de:

### RecoverPasswordForm:
1. Estado inicial
2. Validação de email (erro + sucesso)
3. Estado de loading
4. Tela de sucesso (email enviado)
5. Info box com instruções

### ResetPasswordForm:
6. Estado inicial
7. Indicador de força em diferentes níveis
8. Lista de requisitos (cumpridos/não cumpridos)
9. Confirmação de senha (erro de não coincidência)
10. Info box de segurança
11. Estado de loading

### Emails:
12. Email de recuperação no Gmail
13. Email de recuperação no mobile
14. Link alternativo (fallback)

### Responsividade:
15. Mobile view (ambos formulários)
16. Tablet view
17. Desktop view

---

## 🎯 Cenários de Uso Reais

### Cenário 1: Usuário Esqueceu Senha
- [ ] Vai para login
- [ ] Clica "Esqueci minha senha"
- [ ] Preenche email
- [ ] Recebe email rapidamente
- [ ] Clica no link
- [ ] Define nova senha forte
- [ ] Faz login com sucesso

### Cenário 2: Usuário Não Recebeu Email
- [ ] Solicita recuperação
- [ ] Não recebe email
- [ ] Verifica spam/lixo
- [ ] Solicita novamente
- [ ] Recebe e completa fluxo

### Cenário 3: Link Expirado
- [ ] Solicita recuperação
- [ ] Demora mais de 1 hora
- [ ] Tenta usar link
- [ ] Vê mensagem de expiração
- [ ] Solicita novo link
- [ ] Completa rapidamente

---

**Data de criação**: 2025-10-22  
**Fase**: 5 - Recuperação e Redefinição de Senha  
**Status**: Pronto para testes  
**Testador**: Marcos Rocha

