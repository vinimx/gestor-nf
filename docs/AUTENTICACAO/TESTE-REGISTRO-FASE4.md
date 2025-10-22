# ✅ Checklist de Testes - FASE 4: RegisterForm

## 🎯 Objetivo
Validar todas as funcionalidades do RegisterForm implementadas na Fase 4

---

## 📋 Testes de Validação de Nome

### 1. Campo Nome Completo

#### Teste 1.1: Nome vazio
- [ ] Deixar campo de nome vazio
- [ ] Clicar fora do campo (blur)
- [ ] **Resultado esperado**: Ícone vermelho (⚠️) + mensagem "Nome é obrigatório"
- [ ] **Resultado esperado**: Borda vermelha no campo

#### Teste 1.2: Nome muito curto
- [ ] Digitar "Jo" (menos de 3 caracteres)
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone vermelho + mensagem "Nome deve ter pelo menos 3 caracteres"

#### Teste 1.3: Nome com números
- [ ] Digitar "João123"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone vermelho + mensagem "Nome deve conter apenas letras"

#### Teste 1.4: Nome com caracteres especiais
- [ ] Digitar "João@Silva"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone vermelho + mensagem "Nome deve conter apenas letras"

#### Teste 1.5: Nome válido
- [ ] Digitar "João da Silva"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone verde (✓) + borda verde
- [ ] **Resultado esperado**: Mensagem de erro desaparece

#### Teste 1.6: Nome com acentos
- [ ] Digitar "José María Ñoño"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Aceito sem erros (ícone verde)

---

## 📋 Testes de Validação de Email

### 2. Campo Email

#### Teste 2.1: Email vazio
- [ ] Deixar campo vazio
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone vermelho + mensagem "Email é obrigatório"

#### Teste 2.2: Email sem @
- [ ] Digitar "joaosilva.com"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone vermelho + mensagem "Email inválido"

#### Teste 2.3: Email sem domínio
- [ ] Digitar "joao@"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone vermelho + mensagem "Email inválido"

#### Teste 2.4: Email válido
- [ ] Digitar "joao@empresa.com"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone verde + borda verde

---

## 📋 Testes de Validação de Senha

### 3. Campo Senha

#### Teste 3.1: Senha vazia
- [ ] Deixar campo vazio
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone vermelho + mensagem "Senha é obrigatória"

#### Teste 3.2: Senha muito curta
- [ ] Digitar "abc123" (menos de 8 caracteres)
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone vermelho + mensagem de erro
- [ ] **Resultado esperado**: Indicador de força mostra "Muito fraca"

#### Teste 3.3: Senha sem maiúscula
- [ ] Digitar "senha123" (8+ caracteres, sem maiúscula)
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Mensagem "Deve conter pelo menos uma letra maiúscula"

#### Teste 3.4: Senha sem minúscula
- [ ] Digitar "SENHA123"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Mensagem "Deve conter pelo menos uma letra minúscula"

#### Teste 3.5: Senha sem número
- [ ] Digitar "SenhaForte"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Mensagem "Deve conter pelo menos um número"

#### Teste 3.6: Senha válida (requisitos mínimos)
- [ ] Digitar "Senha123"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone verde + borda verde
- [ ] **Resultado esperado**: Todos os requisitos obrigatórios em verde (✓)

#### Teste 3.7: Senha forte completa
- [ ] Digitar "S3nh@Fort3!"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Indicador mostra "Muito forte"
- [ ] **Resultado esperado**: Todos os 5 requisitos em verde
- [ ] **Resultado esperado**: Barra de força completamente verde

---

## 📋 Testes do Indicador de Força da Senha

### 4. PasswordStrength Component

#### Teste 4.1: Aparecer apenas quando há senha
- [ ] Campo de senha vazio
- [ ] **Resultado esperado**: Indicador não aparece
- [ ] Começar a digitar
- [ ] **Resultado esperado**: Indicador aparece imediatamente

#### Teste 4.2: Atualização em tempo real
- [ ] Digitar "a" → verificar barra (1/5 vermelho)
- [ ] Digitar "abcd" → verificar barra (1/5 vermelho)
- [ ] Digitar "abcd1234" → verificar barra (2/5 laranja)
- [ ] Digitar "Abcd1234" → verificar barra (3/5 amarelo)
- [ ] Digitar "Abcd1234!" → verificar barra (4/5 azul)
- [ ] Digitar "Abcd1234!@#$" → verificar barra (5/5 verde)

#### Teste 4.3: Lista de requisitos
- [ ] Verificar que lista mostra 5 requisitos:
  - Mínimo 8 caracteres
  - Letra maiúscula (A-Z)
  - Letra minúscula (a-z)
  - Número (0-9)
  - Caractere especial (!@#$%)
- [ ] Requisitos não atendidos: X cinza
- [ ] Requisitos atendidos: ✓ verde + texto verde em negrito

#### Teste 4.4: Contador de requisitos
- [ ] Senha "abc" → "0/5 requisitos"
- [ ] Senha "abcdefgh" → "1/5 requisitos"
- [ ] Senha "Abcdefgh" → "2/5 requisitos"
- [ ] Senha "Abcdefg1" → "3/5 requisitos"
- [ ] Senha "Abcdefg1!" → "5/5 requisitos"

---

## 📋 Testes de Confirmação de Senha

### 5. Campo Confirmar Senha

#### Teste 5.1: Confirmar senha vazia
- [ ] Preencher senha
- [ ] Deixar confirmação vazia
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Mensagem "Confirme sua senha"

#### Teste 5.2: Senhas não coincidem
- [ ] Senha: "Senha123"
- [ ] Confirmar: "Senha456"
- [ ] Clicar fora do campo de confirmação
- [ ] **Resultado esperado**: Ícone vermelho + mensagem "As senhas não coincidem"

#### Teste 5.3: Senhas coincidem
- [ ] Senha: "Senha123"
- [ ] Confirmar: "Senha123"
- [ ] Clicar fora do campo
- [ ] **Resultado esperado**: Ícone verde + borda verde

#### Teste 5.4: Revalidação ao mudar senha principal
- [ ] Preencher senha: "Senha123"
- [ ] Confirmar: "Senha123" (válido, verde)
- [ ] Voltar à senha e mudar para "Senha456"
- [ ] **Resultado esperado**: Campo de confirmação volta a mostrar erro
- [ ] **Resultado esperado**: Mensagem "As senhas não coincidem"

---

## 🔄 Testes de Validação em Tempo Real

### 6. Feedback Imediato

#### Teste 6.1: Validação onBlur (primeira interação)
- [ ] Focar em campo de email
- [ ] Sair do campo sem digitar
- [ ] **Resultado esperado**: Erro aparece
- [ ] Voltar ao campo e começar a digitar
- [ ] **Resultado esperado**: Validação em tempo real ativa

#### Teste 6.2: Correção em tempo real
- [ ] Campo com erro visível
- [ ] Começar a corrigir
- [ ] **Resultado esperado**: Erro desaparece assim que se torna válido
- [ ] **Resultado esperado**: Ícone muda para verde

#### Teste 6.3: Estados não prematuros
- [ ] Carregar página
- [ ] **Resultado esperado**: Nenhum erro visível inicialmente
- [ ] **Resultado esperado**: Bordas neutras (cinza)
- [ ] **Resultado esperado**: Sem ícones de status

---

## 🎯 Testes de Submit

### 7. Submissão do Formulário

#### Teste 7.1: Submit com campos vazios
- [ ] Clicar em "Criar Conta" sem preencher nada
- [ ] **Resultado esperado**: Todos os campos mostram erro
- [ ] **Resultado esperado**: Foco automático no campo de nome
- [ ] **Resultado esperado**: Formulário não é enviado

#### Teste 7.2: Submit com apenas nome válido
- [ ] Preencher apenas nome
- [ ] Clicar em "Criar Conta"
- [ ] **Resultado esperado**: Erros nos outros campos
- [ ] **Resultado esperado**: Foco no próximo campo com erro (email)

#### Teste 7.3: Submit com dados válidos
- [ ] Preencher todos os campos corretamente
- [ ] Clicar em "Criar Conta"
- [ ] **Resultado esperado**: Botão mostra loading spinner
- [ ] **Resultado esperado**: Texto muda para "Criando conta..."
- [ ] **Resultado esperado**: Todos os campos desabilitados
- [ ] **Resultado esperado**: Toast de sucesso
- [ ] **Resultado esperado**: Redirecionamento para `/verificar-email?email=...`

#### Teste 7.4: Submit com email duplicado
- [ ] Usar email já cadastrado
- [ ] Preencher outros campos corretamente
- [ ] Clicar em "Criar Conta"
- [ ] **Resultado esperado**: Toast de erro
- [ ] **Resultado esperado**: Mensagem sobre email já cadastrado
- [ ] **Resultado esperado**: Foco volta para campo de email
- [ ] **Resultado esperado**: Email é selecionado

---

## 🎨 Testes Visuais

### 8. Toggle Mostrar/Ocultar Senha

#### Teste 8.1: Campo senha
- [ ] Digitar senha
- [ ] Clicar no ícone do olho
- [ ] **Resultado esperado**: Senha visível em texto plano
- [ ] **Resultado esperado**: Ícone muda para olho cortado
- [ ] Clicar novamente
- [ ] **Resultado esperado**: Senha volta a ser ocultada

#### Teste 8.2: Campo confirmar senha
- [ ] Mesmo comportamento do campo de senha
- [ ] **Resultado esperado**: Funciona independentemente

### 9. Ícones de Status

#### Teste 9.1: Ícones dinâmicos
- [ ] Campo inválido tocado: AlertCircle vermelho
- [ ] Campo válido tocado: CheckCircle2 verde
- [ ] Campo não tocado: sem ícone

#### Teste 9.2: Posicionamento
- [ ] Ícones sempre alinhados à direita
- [ ] Não sobrepõem o texto digitado
- [ ] Visíveis mesmo com texto longo

### 10. Bordas Coloridas

#### Teste 10.1: Cores por estado
- [ ] Neutro: borda cinza padrão
- [ ] Erro + tocado: borda vermelha
- [ ] Válido + tocado: borda verde

### 11. Estados de Loading

#### Teste 11.1: Durante cadastro
- [ ] Spinner animado no botão
- [ ] Texto "Criando conta..."
- [ ] Botão desabilitado
- [ ] Todos os campos desabilitados
- [ ] Não é possível editar campos

---

## ♿ Testes de Acessibilidade

### 12. Navegação por Teclado

#### Teste 12.1: Ordem de tab
- [ ] Tab: nome → email → senha → confirmar → botão
- [ ] Shift+Tab: ordem reversa funciona

#### Teste 12.2: Submit com Enter
- [ ] Preencher dados
- [ ] Pressionar Enter (sem clicar no botão)
- [ ] **Resultado esperado**: Formulário submetido

### 13. ARIA e Screen Readers

#### Teste 13.1: Labels associados
- [ ] Cada campo tem Label com htmlFor correto
- [ ] ID do input corresponde ao htmlFor

#### Teste 13.2: Descrição de erros
- [ ] Campo com erro tem `aria-describedby` apontando para mensagem
- [ ] Mensagem tem ID único

#### Teste 13.3: Estado de erro
- [ ] Campo com erro tem `aria-invalid="true"`
- [ ] Campo válido tem `aria-invalid="false"`

#### Teste 13.4: Indicador de força
- [ ] PasswordStrength tem `role="status"`
- [ ] Tem `aria-live="polite"` para anunciar mudanças

#### Teste 13.5: AutoComplete
- [ ] Nome: `autocomplete="name"`
- [ ] Email: `autocomplete="email"`
- [ ] Senha: `autocomplete="new-password"`
- [ ] Confirmar: `autocomplete="new-password"`

---

## 📱 Testes de Responsividade

### 14. Mobile (< 640px)

#### Teste 14.1: Layout mobile
- [ ] Formulário ocupa largura adequada
- [ ] Botões touch-friendly (mín 44x44px)
- [ ] Texto legível sem zoom
- [ ] Indicador de força não quebra layout

#### Teste 14.2: Teclado virtual
- [ ] Email: teclado com @
- [ ] Senha: teclado apropriado
- [ ] Nome: teclado com caps

### 15. Tablet (640-1024px)

#### Teste 15.1: Layout adaptado
- [ ] Espaçamentos adequados
- [ ] Indicador de força bem posicionado

### 16. Desktop (> 1024px)

#### Teste 16.1: Layout desktop
- [ ] Formulário não muito largo
- [ ] Elementos bem espaçados
- [ ] Hover states funcionam

---

## 🔒 Testes de Segurança

### 17. Proteção de Dados

#### Teste 17.1: Senha oculta por padrão
- [ ] Input type="password"
- [ ] Valor não visível no DevTools
- [ ] Apenas visível ao clicar no toggle

#### Teste 17.2: Validação robusta
- [ ] Regex de email rejeita inválidos
- [ ] Regex de nome rejeita caracteres perigosos
- [ ] Senha requer complexidade mínima

#### Teste 17.3: Mensagens de erro seguras
- [ ] Não revela se email já existe (até tentar criar)
- [ ] Erros genéricos quando apropriado

---

## 🧪 Testes de Integração

### 18. Fluxo Completo

#### Teste 18.1: Usuário novo feliz
- [ ] Acessar /registro
- [ ] Preencher todos os campos corretamente
- [ ] Submeter formulário
- [ ] Receber toast de sucesso
- [ ] Redirecionar para /verificar-email
- [ ] Ver mensagem de verificação

#### Teste 18.2: Usuário já autenticado
- [ ] Fazer login
- [ ] Tentar acessar /registro
- [ ] **Resultado esperado**: Redirecionamento automático para /

### 19. Integração com PasswordStrength

#### Teste 19.1: Sincronização
- [ ] Digitar senha fraca
- [ ] **Resultado esperado**: Indicador atualiza em tempo real
- [ ] **Resultado esperado**: Requisitos atualizam dinamicamente
- [ ] Atingir todos os requisitos
- [ ] **Resultado esperado**: Barra completa verde

---

## ✅ Resumo de Aceitação

**A Fase 4 está COMPLETA quando:**

- [ ] ✅ Validações de nome funcionando (letras apenas, 3-100 chars)
- [ ] ✅ Validações de email funcionando
- [ ] ✅ Validações de senha forte funcionando
- [ ] ✅ Indicador de força atualiza em tempo real
- [ ] ✅ Lista de requisitos visível e funcional
- [ ] ✅ Confirmação de senha validando corretamente
- [ ] ✅ Revalidação ao mudar senha principal
- [ ] ✅ Validação em tempo real (onBlur + onChange)
- [ ] ✅ Feedback visual completo (ícones + bordas + mensagens)
- [ ] ✅ Auto-foco funcionando (inicial + após erros)
- [ ] ✅ Cadastro funcional criando usuário
- [ ] ✅ Email de verificação enviado
- [ ] ✅ Redirecionamento correto
- [ ] ✅ Mensagens de erro amigáveis
- [ ] ✅ Loading states visíveis
- [ ] ✅ Acessibilidade WCAG AAA completa
- [ ] ✅ Responsivo em todos os tamanhos
- [ ] ✅ 0 erros de linter
- [ ] ✅ TypeScript 100%

---

## 📸 Capturas Recomendadas

Para documentação, tirar prints de:
1. Estado inicial (campos vazios)
2. Validação de nome (erro + sucesso)
3. Validação de email (erro + sucesso)
4. Indicador de força em diferentes níveis:
   - Muito fraca (vermelho)
   - Fraca (laranja)
   - Média (amarelo)
   - Forte (azul)
   - Muito forte (verde completo)
5. Lista de requisitos com itens cumpridos
6. Confirmação de senha (erro de não coincidência)
7. Estado de loading (durante cadastro)
8. Mobile view
9. Tablet view
10. Desktop view

---

## 🎓 Casos de Uso Reais

### Cenário 1: Usuário Inexperiente
- [ ] Tenta senha simples → Sistema rejeita e ensina
- [ ] Vê requisitos em tempo real
- [ ] Aprende a criar senha forte

### Cenário 2: Usuário Apressado
- [ ] Tenta submeter rápido
- [ ] Sistema mostra erros claramente
- [ ] Foco automático facilita correção

### Cenário 3: Usuário com Deficiência Visual
- [ ] Usa screen reader
- [ ] Todos os campos anunciados corretamente
- [ ] Erros lidos em voz alta
- [ ] Navegação por teclado fluida

---

**Data de criação**: 2025-10-22  
**Fase**: 4 - RegisterForm  
**Status**: Pronto para testes  
**Testador**: Marcos Rocha

