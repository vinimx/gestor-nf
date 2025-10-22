# Gestor de Notas Fiscais

Sistema completo para gerenciamento de empresas, notas fiscais, itens e impostos com upload de XML/PDF, parsing automático de NFe e autenticação via Supabase.

## 🚀 Funcionalidades

### MVP Implementado

- ✅ CRUD completo para Empresas, Notas Fiscais, Itens e Impostos
- ✅ Upload e armazenamento de arquivos XML/PDF no Supabase Storage
- ✅ Importação automática de XML NFe com parsing completo
- ✅ Autenticação e autorização com Supabase Auth (roles: admin, accountant, viewer)
- ✅ Row Level Security (RLS) no Supabase
- ✅ API REST completa via Next.js App Router
- ✅ Validação de entrada com Zod
- ✅ Front-end integrado com PainelAdmin
- ✅ Parser robusto de XML NFe
- ✅ Interface moderna e responsiva

### Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Banco de Dados**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Autenticação**: Supabase Auth
- **Validação**: Zod
- **Parser XML**: fast-xml-parser

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Git

## 🛠️ Configuração

### 1. Clone o repositório

\`\`\`bash
git clone <repository-url>
cd gestor-nf
\`\`\`

### 2. Instale as dependências

\`\`\`bash
npm install
\`\`\`

### 3. Configure o Supabase

#### 3.1 Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e as chaves de API

#### 3.2 Executar migrações

1. Acesse o SQL Editor no Supabase Dashboard
2. Execute o conteúdo do arquivo \`supabase/migrations/001_initial_schema.sql\`

#### 3.3 Configurar Storage

1. No Supabase Dashboard, vá para Storage
2. Crie os buckets:
   - \`nf-xml\` (para arquivos XML)
   - \`nf-pdf\` (para arquivos PDF)
   - \`profile-avatars\` (para avatars de usuários)

#### 3.4 Configurar políticas de Storage

Execute no SQL Editor:
\`\`\`sql
-- Políticas para nf-xml
CREATE POLICY "Users can upload XML files" ON storage.objects
FOR INSERT WITH CHECK (
bucket_id = 'nf-xml' AND
auth.role() = 'authenticated'
);

CREATE POLICY "Users can view XML files" ON storage.objects
FOR SELECT USING (
bucket_id = 'nf-xml' AND
auth.role() = 'authenticated'
);

-- Políticas para nf-pdf
CREATE POLICY "Users can upload PDF files" ON storage.objects
FOR INSERT WITH CHECK (
bucket_id = 'nf-pdf' AND
auth.role() = 'authenticated'
);

CREATE POLICY "Users can view PDF files" ON storage.objects
FOR SELECT USING (
bucket_id = 'nf-pdf' AND
auth.role() = 'authenticated'
);
\`\`\`

### 4. Configure as variáveis de ambiente

Crie o arquivo \`.env.local\` na raiz do projeto:

\`\`\`env

# Supabase Configuration

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# App Configuration

NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

**Importante**: Substitua os valores pelas suas credenciais reais do Supabase.

### 5. Execute o projeto

\`\`\`bash
npm run dev
\`\`\`

O sistema estará disponível em \`http://localhost:3000\`

## 📁 Estrutura do Projeto

\`\`\`
gestor-nf/
├── src/
│ ├── app/
│ │ ├── api/ # API Routes
│ │ │ ├── empresas/ # CRUD empresas
│ │ │ ├── notas/ # CRUD notas fiscais
│ │ │ │ ├── import-xml/ # Importação XML
│ │ │ │ └── [id]/ # Operações por ID
│ │ │ └── upload/ # Upload de arquivos
│ │ ├── globals.css
│ │ ├── layout.tsx
│ │ └── page.tsx
│ ├── components/
│ │ ├── Admin/
│ │ │ ├── MenuNav/ # Menu de navegação
│ │ │ └── PainelAdmin/ # Painel principal
│ │ ├── ui/ # Componentes UI
│ │ └── UploadXML/ # Componente de upload
│ ├── hooks/
│ │ ├── useAuth.ts # Hook de autenticação
│ │ ├── useEmpresas.ts # Hook para empresas
│ │ └── useNotas.ts # Hook para notas fiscais
│ ├── lib/
│ │ ├── auth.ts # Utilitários de autenticação
│ │ ├── nfeParser.ts # Parser de XML NFe
│ │ ├── supabaseClient.ts # Cliente Supabase
│ │ ├── supabaseAdmin.ts # Cliente admin Supabase
│ │ └── validations.ts # Schemas Zod
│ └── types/
│ └── models.ts # Interfaces TypeScript
├── supabase/
│ └── migrations/
│ └── 001_initial_schema.sql
└── README.md
\`\`\`

## 🔧 API Endpoints

### Empresas

- \`GET /api/empresas\` - Listar empresas (com filtros e paginação)
- \`POST /api/empresas\` - Criar empresa
- \`GET /api/empresas/[id]\` - Buscar empresa por ID
- \`PUT /api/empresas/[id]\` - Atualizar empresa
- \`DELETE /api/empresas/[id]\` - Excluir empresa

### Notas Fiscais

- \`GET /api/notas\` - Listar notas fiscais (com filtros e paginação)
- \`POST /api/notas\` - Criar nota fiscal
- \`GET /api/notas/[id]\` - Buscar nota fiscal por ID
- \`PUT /api/notas/[id]\` - Atualizar nota fiscal
- \`DELETE /api/notas/[id]\` - Excluir nota fiscal
- \`POST /api/notas/import-xml\` - Importar nota fiscal via XML
- \`GET /api/notas/import-xml\` - Preview de informações do XML

### Upload

- \`POST /api/upload\` - Upload de arquivos para Storage
- \`GET /api/upload\` - Obter URL assinada para upload direto

## 🔐 Autenticação e Autorização

O sistema implementa autenticação completa com Supabase Auth, incluindo login, registro, recuperação de senha, proteção de rotas e controle de acesso baseado em roles.

### Funcionalidades de Autenticação

- ✅ **Login** com email e senha
- ✅ **Registro** de novos usuários com validação
- ✅ **Recuperação de senha** via email
- ✅ **Redefinição de senha** com token seguro
- ✅ **Verificação de email** após registro
- ✅ **Logout** com limpeza de sessão
- ✅ **Proteção de rotas** (middleware + AuthGuard)
- ✅ **Controle de acesso** baseado em roles
- ✅ **Sessão persistente** entre reloads
- ✅ **Toast notifications** para feedback
- ✅ **Validação em tempo real** nos formulários

### Roles de Usuário

O sistema possui 3 níveis de acesso:

| Role | Descrição | Permissões |
|------|-----------|------------|
| **admin** | Administrador | Acesso total ao sistema, gerencia usuários e empresas |
| **accountant** | Contador | Gerencia notas fiscais da sua empresa |
| **viewer** | Visualizador | Apenas visualização, sem edição |

### Proteção de Rotas

**Defesa em Camadas**:

1. **Middleware (Servidor)**: Verifica sessão antes da página carregar
2. **AuthGuard (Cliente)**: Proteção adicional no React
3. **RLS (Banco de Dados)**: Políticas de segurança no Supabase

**Rotas Públicas** (sem autenticação):
- `/login` - Página de login
- `/registro` - Registro de novos usuários
- `/recuperar-senha` - Recuperação de senha
- `/redefinir-senha` - Redefinição com token
- `/verificar-email` - Confirmação de email

**Rotas Protegidas** (requer autenticação):
- `/` - Dashboard principal
- `/empresas` - Gestão de empresas

**Rotas Admin** (requer role admin):
- `/admin/*` - Área administrativa
- `/usuarios/*` - Gerenciamento de usuários

### Row Level Security (RLS)

O sistema implementa RLS no Supabase para garantir que:

- ✅ Usuários só acessem dados da sua empresa
- ✅ Admins tenham acesso a todas as empresas
- ✅ Contadores possam gerenciar notas da sua empresa
- ✅ Visualizadores tenham apenas acesso de leitura
- ✅ Políticas aplicadas automaticamente em todas as queries

### Como Fazer Login

1. Acesse `http://localhost:3000/login`
2. Use as credenciais de teste ou crie uma conta
3. Após login, você será redirecionado para o dashboard
4. Seu avatar com iniciais aparecerá no canto superior direito

### Como Criar um Usuário Admin

Execute no SQL Editor do Supabase:

\`\`\`sql
-- 1. Criar usuário no Auth
-- Faça isso pelo Supabase Dashboard > Authentication > Add User

-- 2. Atualizar role para admin
UPDATE users_profile 
SET role = 'admin' 
WHERE email = 'seu-email@exemplo.com';
\`\`\`

### Documentação Completa

Para documentação detalhada sobre autenticação:

- 📖 **[Guia do Desenvolvedor](docs/AUTENTICACAO/AUTH-DEVELOPER-GUIDE.md)** - Como usar o sistema de auth
- 🏗️ **[Documentação Técnica](docs/AUTENTICACAO/AUTH-TECHNICAL.md)** - Arquitetura e fluxos
- 📋 **[Planejamento](docs/AUTENTICACAO/PLANEJAMENTO-AUTENTICACAO.md)** - Fases de implementação
- 🔄 **[Fluxos](docs/AUTENTICACAO/FLUXOS.md)** - Diagramas de fluxo

## 📊 Parser de XML NFe

O sistema inclui um parser robusto que:

- ✅ Valida XML NFe
- ✅ Extrai chave de acesso, número, série
- ✅ Processa itens da nota
- ✅ Calcula impostos (ICMS, IPI, PIS, COFINS)
- ✅ Suporta diferentes versões de NFe
- ✅ Trata erros de parsing graciosamente

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Variáveis de ambiente no Vercel

- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
- \`SUPABASE_SERVICE_ROLE_KEY\`
- \`NEXT_PUBLIC_APP_URL\`

## 🧪 Testes

Para executar os testes:
\`\`\`bash
npm test
\`\`\`

## 📝 Próximos Passos

### Funcionalidades Avançadas

- [ ] Import em lote de XML (ZIP)
- [ ] Relatórios exportáveis (CSV/Excel)
- [ ] Dashboard com KPIs fiscais
- [ ] Integração com sistemas de contabilidade
- [ ] OCR para PDFs
- [ ] Multi-tenant completo

### Melhorias Técnicas

- [ ] Testes E2E com Playwright
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento com Sentry
- [ ] Cache Redis
- [ ] Rate limiting

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo \`LICENSE\` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:

- Abra uma issue no GitHub
- Consulte a documentação do Supabase
- Verifique os logs do console do navegador

---

**Desenvolvido por Marcos Rocha**
