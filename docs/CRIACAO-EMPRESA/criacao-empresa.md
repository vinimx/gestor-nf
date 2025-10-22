# 🧩 Análise do Projeto Atual — Fases de Desenvolvimento

---

## 🩵 FASE 1 — Preparação e Arquitetura

### 🏗️ Tecnologias e Arquitetura
O projeto apresenta uma estrutura sólida e moderna, utilizando:

- **Frontend:** Next.js 15 + React 19 + TypeScript  
- **Estilização:** Tailwind CSS (utility-first)  
- **Backend:** Next.js API Routes com Supabase  
- **Validação:** Zod em todas as camadas  
- **Segurança:** RLS (Row Level Security) no Supabase com controle por roles  

---

### ✅ O que já está implementado

#### 🔧 Backend Completo
- API REST funcional (`/api/empresas`)
- Validação de dados com **Zod**
- Tratamento de erros robusto
- Suporte a **paginação e filtros**

#### ⚙️ Camada de Dados
- Hook customizado `useEmpresas` com **CRUD completo**
- Sanitização de strings vazias
- Gestão de estado de loading e error

#### 🗄️ Banco de Dados
- Tabela **empresas** normalizada  
- Validação de **CNPJ único**
- Índices para **performance**
- **RLS configurado** (apenas admins podem criar empresas)

---

## 🩷 FASE 2 — Estruturação da Interface (Frontend Base)

### 💼 Proposta de Implementação da Interface de Cadastro

#### 🧱 Arquitetura da Solução
Criação da interface modular, reutilizável e escalável:

src/components/Empresas/
├── FormEmpresa/
│ ├── index.tsx # Formulário principal
│ ├── CamposEndereco.tsx # Subcomponente para endereço
│ └── validacao.ts # Validação client-side
├── ListaEmpresas/
│ ├── index.tsx # Container da lista
│ ├── ItemEmpresa.tsx # Card/linha de empresa
│ ├── Filtros.tsx # Barra de busca e filtros
│ └── Paginacao.tsx # Controles de paginação
└── ModalEmpresa/
└── index.tsx # Wrapper do modal

markdown
Copiar código

---

### ✨ Características Principais
A interface será construída com base em três pilares principais:

1. 🧠 **Formulário Inteligente com Validação em Tempo Real**  
2. 📋 **Listagem com Recursos Avançados**  
3. 💡 **UX Moderna e Intuitiva**

---

## 💙 FASE 3 — Desenvolvimento do Formulário Inteligente (`FormEmpresa`)

**Objetivo:** Criar um formulário reativo e validado em tempo real.

### 🧠 Principais Recursos
- Validação client-side com **Zod** (mesmo schema do backend)  
- Máscaras automáticas:
  - CNPJ → `00.000.000/0000-00`
  - CEP → `00000-000`
  - Telefone → `(00) 00000-0000`
- Busca automática de endereço via **API ViaCEP**
- Feedback visual campo a campo
- Estados de **loading**, **success**, **error**
- Prevenção de submissão duplicada

```ts
// Exemplo da integração ViaCEP
const buscarCEP = async (cep: string) => {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const data = await response.json();
  // Preencher logradouro, bairro, cidade, uf automaticamente
};
ts
Copiar código
// Validação real de CNPJ com dígito verificador
const validarCNPJ = (cnpj: string): boolean => {
  // Implementar algoritmo de validação de CNPJ
  // Verificar dígitos verificadores
};
💚 FASE 4 — Desenvolvimento da Listagem (ListaEmpresas)
Objetivo: Exibir empresas com filtros, busca e paginação.

📋 Recursos
Busca em tempo real (nome e CNPJ)

Filtros: ativo/inativo, ordenação

Paginação (já implementada no backend)

Cards responsivos com ações rápidas

Badges de status (ativo/inativo)

Empty states informativos

Atualização automática após CRUD

💛 FASE 5 — Experiência do Usuário (UX / UI)
💡 Padrões e Recursos
Toasts e notificações para ações de sucesso/erro

Confirmação de exclusão com modal

Skeleton loaders durante carregamentos

Animações suaves (Tailwind transitions)

Mobile-first e acessível (ARIA, navegação por teclado)

🔁 Fluxo de Cadastro Proposto
Usuário clica em “Nova Empresa”

Modal/Drawer abre com formulário

Preenche dados com validação em tempo real

Preenche CEP → busca endereço

Sistema valida CNPJ

Submete formulário

Backend valida novamente

Retorna sucesso/erro

Lista atualiza automaticamente

Feedback visual ao usuário

🧡 FASE 6 — Componentização e Reutilização
🧱 Componentes UI
Já existentes:

✅ Button — src/components/ui/button.tsx

✅ Input — src/components/ui/input.tsx

✅ DropdownMenu — src/components/ui/dropdown-menu.tsx

A serem criados:

🆕 Select — Dropdown de UF

🆕 Modal/Dialog — Formulário de empresa

🆕 Card — Exibição de empresas

🆕 Badge — Status (ativo/inativo)

🆕 Toast — Notificações

❤️ FASE 7 — Segurança e Boas Práticas
🛡️ Máscaras e Sanitização
CNPJ, CEP e telefone com máscara automática

Remover espaços e normalizar entradas

⚖️ Validação em Múltiplas Camadas
Client-side: feedback imediato

API Route: validação com Zod

Database: constraints + RLS

🚨 Tratamento de Erros
409 Conflict — CNPJ duplicado

400 Bad Request — Validação falhou

502 Bad Gateway — Erro de conexão

403 Forbidden — Permissão negada

⚔️ Proteções
Debounce em buscas

Prevenção de double-submit

Optimistic updates com rollback

💜 FASE 8 — Performance e Acessibilidade
⚡ Performance
Mobile: Lista em cards verticais

Tablet: Grid de 2 colunas

Desktop: Grid/tabela de 3 colunas

♿ Acessibilidade (A11y)
Labels descritivos

ARIA attributes

Navegação por teclado (Tab, Enter, Esc)

Contraste WCAG AA

Compatível com screen readers

🩶 FASE 9 — Finalização e Entrega
🔍 Revisões Finais
Testar fluxo completo de cadastro/edição/exclusão

Validar responsividade e UX

Verificar integração ViaCEP e validação de CNPJ

Revisar mensagens de erro e feedbacks visuais

Garantir cobertura completa de validações e segurança