# 📦 Componentes de Empresas

Sistema completo de gerenciamento de empresas com CRUD, validações, máscaras e integração com ViaCEP.

---

## 🚀 Uso Rápido

### Implementação Completa

```tsx
import { GerenciadorEmpresas } from "@/components/Empresas";

export default function EmpresasPage() {
  return (
    <div className="container mx-auto py-8">
      <GerenciadorEmpresas />
    </div>
  );
}
```

Isso incluirá automaticamente:
- ✅ Listagem de empresas
- ✅ Busca e filtros
- ✅ Paginação
- ✅ Formulário de cadastro/edição
- ✅ Modal de confirmação de exclusão
- ✅ Toasts de feedback

---

## 🧩 Componentes Individuais

### FormEmpresa

Formulário completo com validação, máscaras e integração ViaCEP.

```tsx
import { FormEmpresa } from "@/components/Empresas";

<FormEmpresa
  empresa={empresaParaEditar} // opcional
  onSubmit={async (data) => {
    // Salvar empresa
    await salvarEmpresa(data);
  }}
  onCancel={() => {
    // Fechar modal ou navegar
  }}
/>
```

**Props:**
- `empresa?: Empresa | null` - Empresa para edição (se null/undefined, cria nova)
- `onSubmit: (data: Partial<Empresa>) => Promise<void>` - Callback ao submeter
- `onCancel?: () => void` - Callback ao cancelar

**Funcionalidades:**
- ✅ Máscara de CNPJ, CEP e Telefone
- ✅ Validação de CNPJ com dígito verificador
- ✅ Busca automática de endereço por CEP
- ✅ Validação em tempo real
- ✅ Feedback visual de erros
- ✅ Loading state durante submissão

---

### ListaEmpresas

Listagem completa com busca, filtros e paginação.

```tsx
import { ListaEmpresas } from "@/components/Empresas";

<ListaEmpresas
  onNovaEmpresa={() => {
    // Abrir modal de criação
  }}
  onEditarEmpresa={(empresa) => {
    // Abrir modal de edição
  }}
/>
```

**Props:**
- `onNovaEmpresa: () => void` - Callback ao clicar em "Nova Empresa"
- `onEditarEmpresa: (empresa: Empresa) => void` - Callback ao editar

**Funcionalidades:**
- ✅ Busca por nome ou CNPJ com debounce
- ✅ Ordenação por nome, CNPJ ou data
- ✅ Paginação (9 itens por página)
- ✅ Grid responsivo (1/2/3 colunas)
- ✅ Empty states informativos
- ✅ Modal de confirmação de exclusão
- ✅ Atualização automática após ações

---

### ModalEmpresa

Modal wrapper para o formulário de empresa.

```tsx
import { ModalEmpresa } from "@/components/Empresas";

const [open, setOpen] = useState(false);
const [empresa, setEmpresa] = useState<Empresa | null>(null);

<ModalEmpresa
  open={open}
  onOpenChange={setOpen}
  empresa={empresa}
  onSuccess={() => {
    // Callback após sucesso
    setOpen(false);
    atualizarLista();
  }}
/>
```

**Props:**
- `open: boolean` - Estado de abertura do modal
- `onOpenChange: (open: boolean) => void` - Callback de mudança de estado
- `empresa?: Empresa | null` - Empresa para edição
- `onSuccess?: () => void` - Callback após salvar com sucesso

---

## 🛠️ Utilitários

### Máscaras (`src/lib/masks.ts`)

```tsx
import { maskCNPJ, maskCEP, maskPhone, unmask, validateCNPJ } from "@/lib/masks";

// Formatar
const cnpjFormatado = maskCNPJ("12345678000190"); // "12.345.678/0001-90"
const cepFormatado = maskCEP("01310100"); // "01310-100"
const telefoneFormatado = maskPhone("11999999999"); // "(11) 99999-9999"

// Remover formatação
const apenasNumeros = unmask("12.345.678/0001-90"); // "12345678000190"

// Validar
const cnpjValido = validateCNPJ("12.345.678/0001-90"); // true/false
```

### ViaCEP (`src/lib/viaCep.ts`)

```tsx
import { buscarCEP } from "@/lib/viaCep";

const endereco = await buscarCEP("01310100");

if (endereco) {
  console.log(endereco.logradouro); // "Avenida Paulista"
  console.log(endereco.bairro); // "Bela Vista"
  console.log(endereco.localidade); // "São Paulo"
  console.log(endereco.uf); // "SP"
}
```

---

## 📋 Tipos

### Empresa

```tsx
interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  inscricao_estadual?: string | null;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
  } | null;
  telefone?: string | null;
  email?: string | null;
  created_at?: string;
  updated_at?: string;
  ativo?: boolean;
}
```

---

## 🎨 Customização

### Estilos

Todos os componentes utilizam Tailwind CSS e podem ser customizados via:

1. **Classes do Tailwind:** Sobrescrever com `className` prop
2. **CSS Variables:** Modificar cores no `globals.css`
3. **Componentes UI:** Editar `src/components/ui/`

### Exemplo de Customização

```tsx
// Mudar cor do badge de status ativo
<Badge variant="success">Ativo</Badge>

// Customizar card
<ItemEmpresa
  empresa={empresa}
  className="hover:shadow-xl" // classe adicional
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

## 🔌 Integração com Hooks

### useEmpresas

O hook `useEmpresas` já está integrado nos componentes, mas você pode usá-lo diretamente:

```tsx
import { useEmpresas } from "@/hooks/useEmpresas";

const {
  empresas,
  loading,
  error,
  pagination,
  fetchEmpresas,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  getEmpresa,
} = useEmpresas({
  search: "Empresa",
  limit: 10,
  offset: 0,
  sort: "nome",
  order: "asc",
});
```

### useToast

Sistema de notificações já integrado:

```tsx
import { useToast } from "@/hooks/useToast";

const { toast } = useToast();

toast({
  title: "Sucesso!",
  description: "Empresa criada com sucesso",
  variant: "default", // ou "destructive"
});
```

---

## ♿ Acessibilidade

Todos os componentes seguem as diretrizes WCAG 2.1 AA:

- ✅ Labels associados a inputs
- ✅ Atributos ARIA adequados
- ✅ Navegação por teclado
- ✅ Contraste de cores adequado
- ✅ Screen reader friendly
- ✅ Focus visible

### Atalhos de Teclado

- `Tab` - Navegar entre campos
- `Enter` - Submeter formulário
- `Esc` - Fechar modal
- `Space` - Selecionar em dropdowns

---

## 🧪 Testabilidade

Os componentes são projetados para serem facilmente testáveis:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { FormEmpresa } from "@/components/Empresas";

test("valida CNPJ inválido", async () => {
  const onSubmit = jest.fn();
  
  render(<FormEmpresa onSubmit={onSubmit} />);
  
  const cnpjInput = screen.getByLabelText(/CNPJ/i);
  fireEvent.change(cnpjInput, { target: { value: "12345678000100" } });
  
  const submitButton = screen.getByText(/Cadastrar/i);
  fireEvent.click(submitButton);
  
  expect(screen.getByText(/CNPJ inválido/i)).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});
```

---

## 📱 Responsividade

### Breakpoints

- **Mobile:** < 640px - 1 coluna
- **Tablet:** 640px - 768px - 2 colunas
- **Desktop:** > 1024px - 3 colunas

### Exemplo de Comportamento

```tsx
// Mobile
<div className="grid grid-cols-1 gap-4">
  {/* Cards em coluna única */}
</div>

// Tablet
<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
  {/* Cards em 2 colunas */}
</div>

// Desktop
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Cards em 3 colunas */}
</div>
```

---

## 🔧 Troubleshooting

### Erro: "CNPJ já cadastrado"

O sistema valida CNPJ único no backend. Verifique se a empresa já existe antes de criar.

### Erro ao buscar CEP

Certifique-se de que:
1. O CEP tem 8 dígitos
2. A API ViaCEP está acessível
3. O CEP existe na base dos Correios

### Máscara não funciona

Verifique se o componente está recebendo o valor correto e se a função `onChange` está sendo chamada.

---

## 📚 Referências

- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zod](https://zod.dev/)
- [ViaCEP](https://viacep.com.br/)

---

**Desenvolvido com ❤️ seguindo as melhores práticas de React e Next.js**

