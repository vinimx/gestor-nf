# 📧 Templates de Email - Supabase

Templates HTML profissionais para os emails de autenticação do Supabase, seguindo o design do Gestor NF.

---

## 🎨 Cores do Projeto

```css
--cor-primaria: #2563eb (azul)
--cor-secundaria: #10b981 (verde)
--cor-texto: #2c3e50 (cinza escuro)
--cor-fundo: #f8f9fa (cinza claro)
--cor-borda: #e5e7eb (cinza)
```

---

## 📩 1. Confirmação de Email (Signup)

### Como Configurar no Supabase:
1. Acesse: `Authentication > Email Templates > Confirm signup`
2. Cole o template abaixo
3. Salve

### Template HTML:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu email - Gestor NF</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2c3e50;
      background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
      padding: 40px 20px;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
      padding: 40px 30px;
      text-align: center;
    }
    
    .logo-container {
      margin-bottom: 20px;
    }
    
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      backdrop-filter: blur(10px);
    }
    
    .header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .header p {
      color: rgba(255, 255, 255, 0.95);
      font-size: 14px;
      margin: 8px 0 0 0;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 18px;
      color: #2c3e50;
      margin-bottom: 20px;
      font-weight: 500;
    }
    
    .message {
      font-size: 16px;
      color: #64748b;
      line-height: 1.8;
      margin-bottom: 30px;
    }
    
    .button-container {
      text-align: center;
      margin: 40px 0;
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 48px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
      transition: all 0.3s ease;
    }
    
    .button:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6);
      transform: translateY(-2px);
    }
    
    .divider {
      margin: 30px 0;
      border: none;
      border-top: 1px solid #e5e7eb;
    }
    
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #2563eb;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    
    .info-box p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
    
    .alternative-link {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .alternative-link p {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 10px;
    }
    
    .alternative-link code {
      display: block;
      background: #ffffff;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      font-size: 12px;
      color: #2563eb;
      word-break: break-all;
      font-family: 'Courier New', monospace;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer p {
      font-size: 13px;
      color: #94a3b8;
      margin: 8px 0;
    }
    
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    .social-links {
      margin-top: 20px;
    }
    
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 12px;
    }
    
    @media only screen and (max-width: 600px) {
      body {
        padding: 20px 10px;
      }
      
      .container {
        border-radius: 12px;
      }
      
      .header,
      .content,
      .footer {
        padding: 30px 20px;
      }
      
      .header h1 {
        font-size: 24px;
      }
      
      .button {
        padding: 14px 32px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo-container">
        <div class="logo">📝</div>
      </div>
      <h1>Gestor NF</h1>
      <p>Escritório Ranicont</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <p class="greeting">Olá! 👋</p>
      
      <p class="message">
        Obrigado por criar sua conta no <strong>Gestor NF</strong>! Estamos muito felizes em tê-lo conosco.
      </p>
      
      <p class="message">
        Para começar a usar o sistema, precisamos confirmar seu endereço de email. Clique no botão abaixo para ativar sua conta:
      </p>
      
      <!-- Button -->
      <div class="button-container">
        <a href="{{ .ConfirmationURL }}" class="button">
          ✓ Confirmar Email
        </a>
      </div>
      
      <!-- Info Box -->
      <div class="info-box">
        <p>
          <strong>⏱️ Este link expira em 24 horas.</strong><br>
          Por segurança, confirme seu email o mais rápido possível.
        </p>
      </div>
      
      <hr class="divider">
      
      <!-- Alternative Link -->
      <div class="alternative-link">
        <p><strong>Botão não funciona?</strong> Copie e cole o link abaixo no seu navegador:</p>
        <code>{{ .ConfirmationURL }}</code>
      </div>
      
      <p class="message" style="margin-top: 30px; font-size: 14px;">
        Se você não criou uma conta no Gestor NF, ignore este email com segurança.
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Gestor NF - Escritório Ranicont</strong></p>
      <p>Sistema de Gerenciamento de Notas Fiscais</p>
      
      <div style="margin-top: 20px;">
        <p style="font-size: 12px;">
          Dúvidas? Entre em contato: 
          <a href="mailto:contato@ranicont.com.br">contato@ranicont.com.br</a>
        </p>
      </div>
      
      <p style="margin-top: 20px; font-size: 11px; color: #cbd5e1;">
        © 2025 Gestor NF. Todos os direitos reservados.<br>
        Desenvolvido por Marcos Rocha
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 🔑 2. Recuperação de Senha (Password Reset)

### Como Configurar no Supabase:
1. Acesse: `Authentication > Email Templates > Reset Password`
2. Cole o template abaixo
3. Salve

### Template HTML:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - Gestor NF</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2c3e50;
      background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
      padding: 40px 20px;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .header {
      background: linear-gradient(135deg, #dc2626 0%, #f97316 100%);
      padding: 40px 30px;
      text-align: center;
    }
    
    .logo-container {
      margin-bottom: 20px;
    }
    
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      backdrop-filter: blur(10px);
    }
    
    .header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .header p {
      color: rgba(255, 255, 255, 0.95);
      font-size: 14px;
      margin: 8px 0 0 0;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 18px;
      color: #2c3e50;
      margin-bottom: 20px;
      font-weight: 500;
    }
    
    .message {
      font-size: 16px;
      color: #64748b;
      line-height: 1.8;
      margin-bottom: 30px;
    }
    
    .button-container {
      text-align: center;
      margin: 40px 0;
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 48px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
      transition: all 0.3s ease;
    }
    
    .button:hover {
      background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
      box-shadow: 0 6px 20px rgba(220, 38, 38, 0.6);
      transform: translateY(-2px);
    }
    
    .divider {
      margin: 30px 0;
      border: none;
      border-top: 1px solid #e5e7eb;
    }
    
    .warning-box {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    
    .warning-box p {
      font-size: 14px;
      color: #991b1b;
      margin: 0;
    }
    
    .alternative-link {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .alternative-link p {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 10px;
    }
    
    .alternative-link code {
      display: block;
      background: #ffffff;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      font-size: 12px;
      color: #dc2626;
      word-break: break-all;
      font-family: 'Courier New', monospace;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer p {
      font-size: 13px;
      color: #94a3b8;
      margin: 8px 0;
    }
    
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    @media only screen and (max-width: 600px) {
      body {
        padding: 20px 10px;
      }
      
      .container {
        border-radius: 12px;
      }
      
      .header,
      .content,
      .footer {
        padding: 30px 20px;
      }
      
      .header h1 {
        font-size: 24px;
      }
      
      .button {
        padding: 14px 32px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo-container">
        <div class="logo">🔐</div>
      </div>
      <h1>Redefinir Senha</h1>
      <p>Gestor NF - Escritório Ranicont</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <p class="greeting">Olá! 👋</p>
      
      <p class="message">
        Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Gestor NF</strong>.
      </p>
      
      <p class="message">
        Se foi você quem solicitou, clique no botão abaixo para criar uma nova senha:
      </p>
      
      <!-- Button -->
      <div class="button-container">
        <a href="{{ .ConfirmationURL }}" class="button">
          🔑 Redefinir Senha
        </a>
      </div>
      
      <!-- Warning Box -->
      <div class="warning-box">
        <p>
          <strong>⏱️ Este link expira em 1 hora.</strong><br>
          Por segurança, redefina sua senha o mais rápido possível.
        </p>
      </div>
      
      <hr class="divider">
      
      <!-- Alternative Link -->
      <div class="alternative-link">
        <p><strong>Botão não funciona?</strong> Copie e cole o link abaixo no seu navegador:</p>
        <code>{{ .ConfirmationURL }}</code>
      </div>
      
      <p class="message" style="margin-top: 30px; font-size: 14px; background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
        <strong>⚠️ Não solicitou esta alteração?</strong><br>
        Se você não pediu para redefinir sua senha, ignore este email com segurança. Sua conta permanece protegida.
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Gestor NF - Escritório Ranicont</strong></p>
      <p>Sistema de Gerenciamento de Notas Fiscais</p>
      
      <div style="margin-top: 20px;">
        <p style="font-size: 12px;">
          Dúvidas? Entre em contato: 
          <a href="mailto:contato@ranicont.com.br">contato@ranicont.com.br</a>
        </p>
      </div>
      
      <p style="margin-top: 20px; font-size: 11px; color: #cbd5e1;">
        © 2025 Gestor NF. Todos os direitos reservados.<br>
        Desenvolvido por Marcos Rocha
      </p>
    </div>
  </div>
</body>
</html>
```

---

## ✉️ 3. Mudança de Email (Email Change)

### Como Configurar no Supabase:
1. Acesse: `Authentication > Email Templates > Change Email Address`
2. Cole o template abaixo
3. Salve

### Template HTML:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmar Mudança de Email - Gestor NF</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2c3e50;
      background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%);
      padding: 40px 20px;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .header {
      background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
      padding: 40px 30px;
      text-align: center;
    }
    
    .logo-container {
      margin-bottom: 20px;
    }
    
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      backdrop-filter: blur(10px);
    }
    
    .header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .header p {
      color: rgba(255, 255, 255, 0.95);
      font-size: 14px;
      margin: 8px 0 0 0;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 18px;
      color: #2c3e50;
      margin-bottom: 20px;
      font-weight: 500;
    }
    
    .message {
      font-size: 16px;
      color: #64748b;
      line-height: 1.8;
      margin-bottom: 30px;
    }
    
    .button-container {
      text-align: center;
      margin: 40px 0;
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 48px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
      transition: all 0.3s ease;
    }
    
    .button:hover {
      background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.6);
      transform: translateY(-2px);
    }
    
    .info-box {
      background: #faf5ff;
      border-left: 4px solid #7c3aed;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    
    .info-box p {
      font-size: 14px;
      color: #5b21b6;
      margin: 0;
    }
    
    .divider {
      margin: 30px 0;
      border: none;
      border-top: 1px solid #e5e7eb;
    }
    
    .alternative-link {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .alternative-link p {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 10px;
    }
    
    .alternative-link code {
      display: block;
      background: #ffffff;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      font-size: 12px;
      color: #7c3aed;
      word-break: break-all;
      font-family: 'Courier New', monospace;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer p {
      font-size: 13px;
      color: #94a3b8;
      margin: 8px 0;
    }
    
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    @media only screen and (max-width: 600px) {
      body {
        padding: 20px 10px;
      }
      
      .container {
        border-radius: 12px;
      }
      
      .header,
      .content,
      .footer {
        padding: 30px 20px;
      }
      
      .header h1 {
        font-size: 24px;
      }
      
      .button {
        padding: 14px 32px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo-container">
        <div class="logo">📧</div>
      </div>
      <h1>Confirmar Novo Email</h1>
      <p>Gestor NF - Escritório Ranicont</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <p class="greeting">Olá! 👋</p>
      
      <p class="message">
        Recebemos uma solicitação para alterar o email da sua conta no <strong>Gestor NF</strong>.
      </p>
      
      <p class="message">
        Para confirmar este novo endereço de email, clique no botão abaixo:
      </p>
      
      <!-- Button -->
      <div class="button-container">
        <a href="{{ .ConfirmationURL }}" class="button">
          ✓ Confirmar Novo Email
        </a>
      </div>
      
      <!-- Info Box -->
      <div class="info-box">
        <p>
          <strong>⏱️ Este link expira em 24 horas.</strong><br>
          Por segurança, confirme seu novo email o mais rápido possível.
        </p>
      </div>
      
      <hr class="divider">
      
      <!-- Alternative Link -->
      <div class="alternative-link">
        <p><strong>Botão não funciona?</strong> Copie e cole o link abaixo no seu navegador:</p>
        <code>{{ .ConfirmationURL }}</code>
      </div>
      
      <p class="message" style="margin-top: 30px; font-size: 14px;">
        Se você não solicitou esta alteração, entre em contato com nosso suporte imediatamente.
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Gestor NF - Escritório Ranicont</strong></p>
      <p>Sistema de Gerenciamento de Notas Fiscais</p>
      
      <div style="margin-top: 20px;">
        <p style="font-size: 12px;">
          Dúvidas? Entre em contato: 
          <a href="mailto:contato@ranicont.com.br">contato@ranicont.com.br</a>
        </p>
      </div>
      
      <p style="margin-top: 20px; font-size: 11px; color: #cbd5e1;">
        © 2025 Gestor NF. Todos os direitos reservados.<br>
        Desenvolvido por Marcos Rocha
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 📋 Checklist de Configuração no Supabase

### 1. Acessar Templates
- [ ] Login no Supabase Dashboard
- [ ] Selecionar projeto
- [ ] Ir em `Authentication` → `Email Templates`

### 2. Configurar Cada Template
- [ ] **Confirm signup**: Colar template 1
- [ ] **Reset Password**: Colar template 2
- [ ] **Change Email Address**: Colar template 3
- [ ] **Magic Link**: (opcional, usar template similar)

### 3. Personalizar (Opcional)
- [ ] Adicionar logo real (substituir emoji)
- [ ] Ajustar cores se necessário
- [ ] Adicionar email de contato real
- [ ] Adicionar links de redes sociais

### 4. Testar
- [ ] Criar conta teste → Verificar email de confirmação
- [ ] Solicitar reset de senha → Verificar email
- [ ] Mudar email → Verificar email
- [ ] Verificar em múltiplos clientes (Gmail, Outlook, etc)

---

## 🎨 Características dos Templates

### Design:
- ✅ Responsivos (mobile-first)
- ✅ Gradientes modernos
- ✅ Bordas arredondadas
- ✅ Sombras suaves
- ✅ Emojis para clareza visual
- ✅ Cores do branding

### UX:
- ✅ Botão principal destacado
- ✅ Link alternativo (caso botão não funcione)
- ✅ Avisos de expiração claros
- ✅ Mensagens de segurança
- ✅ Instruções claras

### Cores por Template:
- **Confirmação**: Azul/Verde (padrão do site)
- **Reset Senha**: Vermelho/Laranja (urgência)
- **Mudança Email**: Roxo/Azul (ação)

### Acessibilidade:
- ✅ Fontes legíveis
- ✅ Contraste adequado
- ✅ Botões grandes (touch-friendly)
- ✅ Suporte a dark mode (alguns clients)

---

## 🔧 Como Adicionar Logo Real

Se quiser substituir o emoji pela logo PNG:

```html
<!-- Substituir -->
<div class="logo">📝</div>

<!-- Por -->
<img src="https://seu-dominio.com/logo.png" alt="Gestor NF" style="width: 80px; height: 80px;">
```

**Importante**: A logo precisa estar hospedada em URL pública (não pode ser local).

---

## 📱 Preview nos Clientes

### Gmail
- ✅ Gradientes suportados
- ✅ Bordas arredondadas
- ✅ Botões funcionam

### Outlook
- ⚠️ Gradientes podem não funcionar (fallback para cor sólida)
- ✅ Resto funciona normalmente

### Apple Mail
- ✅ Suporte completo
- ✅ Melhor renderização

### Outros
- ✅ Todos têm fallback para link alternativo
- ✅ Design funciona mesmo sem CSS

---

**Status**: Pronto para uso  
**Data**: 2025-10-22  
**Versão**: 1.0.0

