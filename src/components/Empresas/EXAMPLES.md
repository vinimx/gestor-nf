# 📚 Exemplos de Uso - Componentes de Empresas

Este documento contém exemplos práticos de como utilizar os componentes de empresas em diferentes cenários.

---

## 1. 🎯 Uso Básico - Página Completa

O jeito mais simples de usar o sistema completo:

```tsx
// src/app/empresas/page.tsx
import { GerenciadorEmpresas } from "@/components/Empresas";

export default function EmpresasPage() {
  return (
    <div className="container mx-auto py-8">
      <GerenciadorEmpresas />
    </div>
  );
}
```

**O que você ganha:**
- ✅ Listagem completa
- ✅ Busca e filtros
- ✅ Paginação
- ✅ CRUD completo
- ✅ Validações
- ✅ Toasts

---

## 2. 🔧 Uso Avançado - Controle Manual

Quando você precisa de mais controle sobre o fluxo:

```tsx
"use client";

import { useState } from "react";
import { ListaEmpresas, ModalEmpresa } from "@/components/Empresas";
import { Empresa } from "@/types/models";

export default function EmpresasCustomPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);

  const handleNovaEmpresa = () => {
    setEmpresaSelecionada(null);
    setModalOpen(true);
  };

  const handleEditarEmpresa = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEmpresaSelecionada(null);
    // Adicionar lógica customizada aqui
    console.log("Empresa salva com sucesso!");
  };

  return (
    <div className="container mx-auto py-8">
      <ListaEmpresas
        onNovaEmpresa={handleNovaEmpresa}
        onEditarEmpresa={handleEditarEmpresa}
      />

      <ModalEmpresa
        open={modalOpen}
        onOpenChange={setModalOpen}
        empresa={empresaSelecionada}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
```

---

## 3. 📝 Formulário Standalone

Usar apenas o formulário sem modal:

```tsx
"use client";

import { FormEmpresa } from "@/components/Empresas";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useRouter } from "next/navigation";

export default function NovaEmpresaPage() {
  const router = useRouter();
  const { createEmpresa } = useEmpresas();

  const handleSubmit = async (data: any) => {
    try {
      await createEmpresa(data);
      router.push("/empresas");
    } catch (error) {
      console.error("Erro ao criar empresa:", error);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-3xl font-bold">Cadastrar Nova Empresa</h1>
      
      <div className="rounded-lg border bg-card p-6">
        <FormEmpresa
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
```

---

## 4. 🎨 Customização de Estilos

Personalize a aparência dos componentes:

```tsx
import { ListaEmpresas } from "@/components/Empresas";

export default function EmpresasCustomStylePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header customizado */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Minhas Empresas
          </h1>
          <p className="text-lg text-gray-600">
            Gerencie todas as suas empresas em um só lugar
          </p>
        </div>

        {/* Componente com wrapper customizado */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <ListaEmpresas
            onNovaEmpresa={() => {/* ... */}}
            onEditarEmpresa={() => {/* ... */}}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 5. 🔄 Integração com Estado Global

Usando com Context API ou Zustand:

```tsx
// store/empresaStore.ts
import { create } from "zustand";
import { Empresa } from "@/types/models";

interface EmpresaStore {
  empresas: Empresa[];
  setEmpresas: (empresas: Empresa[]) => void;
  addEmpresa: (empresa: Empresa) => void;
  updateEmpresa: (id: string, empresa: Partial<Empresa>) => void;
  removeEmpresa: (id: string) => void;
}

export const useEmpresaStore = create<EmpresaStore>((set) => ({
  empresas: [],
  setEmpresas: (empresas) => set({ empresas }),
  addEmpresa: (empresa) =>
    set((state) => ({ empresas: [...state.empresas, empresa] })),
  updateEmpresa: (id, empresa) =>
    set((state) => ({
      empresas: state.empresas.map((e) =>
        e.id === id ? { ...e, ...empresa } : e
      ),
    })),
  removeEmpresa: (id) =>
    set((state) => ({
      empresas: state.empresas.filter((e) => e.id !== id),
    })),
}));

// Componente
import { GerenciadorEmpresas } from "@/components/Empresas";
import { useEmpresaStore } from "@/store/empresaStore";

export default function EmpresasWithStorePage() {
  const empresas = useEmpresaStore((state) => state.empresas);
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          Total de empresas no sistema: <strong>{empresas.length}</strong>
        </p>
      </div>
      
      <GerenciadorEmpresas />
    </div>
  );
}
```

---

## 6. 📊 Dashboard com Cards

Integrar com dashboard e estatísticas:

```tsx
"use client";

import { GerenciadorEmpresas } from "@/components/Empresas";
import { useEmpresas } from "@/hooks/useEmpresas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, XCircle } from "lucide-react";

export default function DashboardEmpresasPage() {
  const { empresas, pagination } = useEmpresas();

  const empresasAtivas = empresas.filter((e) => e.ativo).length;
  const empresasInativas = empresas.filter((e) => !e.ativo).length;

  return (
    <div className="container mx-auto space-y-8 py-8">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Empresas
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {empresasAtivas}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativas</CardTitle>
            <XCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">
              {empresasInativas}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gerenciador */}
      <GerenciadorEmpresas />
    </div>
  );
}
```

---

## 7. 🔍 Busca Externa

Sincronizar busca com URL params:

```tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ListaEmpresas } from "@/components/Empresas";
import { Input } from "@/components/ui/input";

export default function EmpresasSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Busca externa */}
      <div className="mb-6">
        <Input
          placeholder="Buscar empresas..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Lista filtra automaticamente */}
      <ListaEmpresas
        onNovaEmpresa={() => {/* ... */}}
        onEditarEmpresa={() => {/* ... */}}
      />
    </div>
  );
}
```

---

## 8. 🔐 Com Permissões

Controle de acesso baseado em roles:

```tsx
"use client";

import { GerenciadorEmpresas } from "@/components/Empresas";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export default function EmpresasProtectedPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Você precisa estar logado para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Apenas admins podem gerenciar empresas
  if (user.role !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para gerenciar empresas.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <GerenciadorEmpresas />
    </div>
  );
}
```

---

## 9. 📱 Mobile Optimized

Versão otimizada para mobile:

```tsx
"use client";

import { GerenciadorEmpresas } from "@/components/Empresas";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function EmpresasMobilePage() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="min-h-screen">
      {/* Header Mobile */}
      {isMobile && (
        <header className="sticky top-0 z-10 border-b bg-background px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Empresas</h1>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                {/* Menu mobile */}
                <nav className="flex flex-col gap-4">
                  <a href="/empresas">Empresas</a>
                  <a href="/notas">Notas Fiscais</a>
                  <a href="/relatorios">Relatórios</a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>
      )}

      {/* Conteúdo */}
      <div className={isMobile ? "px-4 py-6" : "container mx-auto py-8"}>
        <GerenciadorEmpresas />
      </div>
    </div>
  );
}
```

---

## 10. 🧪 Com Testing

Exemplo de como testar:

```tsx
// __tests__/empresas.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FormEmpresa } from "@/components/Empresas";
import "@testing-library/jest-dom";

describe("FormEmpresa", () => {
  it("deve renderizar o formulário", () => {
    render(<FormEmpresa onSubmit={jest.fn()} />);
    
    expect(screen.getByLabelText(/Nome da Empresa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CNPJ/i)).toBeInTheDocument();
  });

  it("deve validar CNPJ inválido", async () => {
    const onSubmit = jest.fn();
    render(<FormEmpresa onSubmit={onSubmit} />);
    
    const cnpjInput = screen.getByLabelText(/CNPJ/i);
    fireEvent.change(cnpjInput, { target: { value: "12345678000100" } });
    
    const nomeInput = screen.getByLabelText(/Nome da Empresa/i);
    fireEvent.change(nomeInput, { target: { value: "Empresa Teste" } });
    
    const submitButton = screen.getByText(/Cadastrar/i);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/CNPJ inválido/i)).toBeInTheDocument();
    });
    
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("deve aplicar máscara no CNPJ", () => {
    render(<FormEmpresa onSubmit={jest.fn()} />);
    
    const cnpjInput = screen.getByLabelText(/CNPJ/i) as HTMLInputElement;
    fireEvent.change(cnpjInput, { target: { value: "12345678000190" } });
    
    expect(cnpjInput.value).toBe("12.345.678/0001-90");
  });
});
```

---

## 💡 Dicas Adicionais

### Performance

```tsx
// Lazy load do componente
import dynamic from "next/dynamic";

const GerenciadorEmpresas = dynamic(
  () => import("@/components/Empresas").then((mod) => mod.GerenciadorEmpresas),
  {
    loading: () => <div>Carregando empresas...</div>,
    ssr: false,
  }
);
```

### Validação Customizada

```tsx
import { FormEmpresa } from "@/components/Empresas";

const handleSubmit = async (data: any) => {
  // Validação adicional customizada
  if (data.nome.toLowerCase().includes("teste")) {
    throw new Error("Nome não pode conter 'teste'");
  }
  
  await salvarEmpresa(data);
};

<FormEmpresa onSubmit={handleSubmit} />
```

### Formatação de Dados

```tsx
import { maskCNPJ } from "@/lib/masks";

// Exibir CNPJ formatado em qualquer lugar
const cnpjFormatado = maskCNPJ(empresa.cnpj);
```

---

**🎉 Com esses exemplos, você pode implementar o sistema de empresas de várias formas diferentes, adaptando às suas necessidades específicas!**

