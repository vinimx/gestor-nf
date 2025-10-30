"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ListaProdutos } from "@/components/Empresa/Produtos/ListaProdutos";
import { ModalProdutoV2 } from "@/components/Empresa/Produtos/ModalProdutoV2";
import { ModalCategoria } from "@/components/Empresa/Produtos/ModalCategoria";
import { Produto, ProdutoCreate, ProdutoUpdate, ProdutoQuery, CategoriaProduto, CategoriaProdutoCreate, CategoriaProdutoUpdate } from "@/types/produto";
import { useToast } from "@/hooks/useToast";
import { getSupabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Tag, Settings, Package } from "lucide-react";

export default function ProdutosPage() {
  const params = useParams();
  const empresaId = params.id as string;
  const { toast } = useToast();
  
  const [modalProdutoOpen, setModalProdutoOpen] = useState(false);
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [produtoParaEditar, setProdutoParaEditar] = useState<Produto | null>(null);
  const [categoriaParaEditar, setCategoriaParaEditar] = useState<CategoriaProduto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const isPageVisible = useRef(true);
  
  const [query, setQuery] = useState<ProdutoQuery>({
    search: "",
    tipo: undefined,
    categoria_id: undefined,
    ativo: undefined,
    limit: 20,
    offset: 0,
    sort: "nome",
    order: "asc",
  });

  const handleNovoProduto = () => {
    setProdutoParaEditar(null);
    setModalProdutoOpen(true);
  };

  const handleEditarProduto = (produto: Produto) => {
    setProdutoParaEditar(produto);
    setModalProdutoOpen(true);
  };

  const handleCloseModalProduto = () => {
    setModalProdutoOpen(false);
    setProdutoParaEditar(null);
    // Força refresh da lista após criar/editar
    setRefreshKey((prev) => prev + 1);
  };

  const handleNovaCategoria = () => {
    setCategoriaParaEditar(null);
    setModalCategoriaOpen(true);
  };

  const handleEditarCategoria = (categoria: CategoriaProduto) => {
    setCategoriaParaEditar(categoria);
    setModalCategoriaOpen(true);
  };

  const handleCloseModalCategoria = () => {
    setModalCategoriaOpen(false);
    setCategoriaParaEditar(null);
    // Força refresh da lista após criar/editar
    setRefreshKey((prev) => prev + 1);
  };

  const handleSubmitProduto = async (data: Partial<Produto>) => {
    try {
      // Obter token de autenticação
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      if (produtoParaEditar) {
        // Atualizar produto existente
        const response = await fetch(`/api/empresa/${empresaId}/produtos/${produtoParaEditar.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao atualizar produto');
        }

        toast({
          title: "Produto atualizado!",
          description: `${data.nome} foi atualizado com sucesso.`,
          variant: "default",
        });
      } else {
        // Criar novo produto
        const response = await fetch(`/api/empresa/${empresaId}/produtos`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...data,
            empresa_id: empresaId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao criar produto');
        }

        toast({
          title: "Produto criado!",
          description: `${data.nome} foi cadastrado com sucesso.`,
          variant: "default",
        });
      }

      handleCloseModalProduto();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro ao salvar produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleSubmitCategoria = async (data: Partial<CategoriaProduto>) => {
    try {
      // Obter token de autenticação
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      if (categoriaParaEditar) {
        // Atualizar categoria existente
        const response = await fetch(`/api/empresa/${empresaId}/categorias-produtos/${categoriaParaEditar.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao atualizar categoria');
        }

        toast({
          title: "Categoria atualizada!",
          description: `${data.nome} foi atualizada com sucesso.`,
          variant: "default",
        });
      } else {
        // Criar nova categoria
        const response = await fetch(`/api/empresa/${empresaId}/categorias-produtos`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...data,
            empresa_id: empresaId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao criar categoria');
        }

        toast({
          title: "Categoria criada!",
          description: `${data.nome} foi cadastrada com sucesso.`,
          variant: "default",
        });
      }

      handleCloseModalCategoria();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro ao salvar categoria",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduto = async (produto: Produto) => {
    try {
      // Obter token de autenticação
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/empresa/${empresaId}/produtos/${produto.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir produto');
      }

      toast({
        title: "Produto excluído",
        description: `${produto.nome} foi removido com sucesso.`,
        variant: "default",
      });

      // Força refresh da lista
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro ao excluir produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleSearchChange = (search: string) => {
    setQuery(prev => ({ ...prev, search, offset: 0 }));
  };

  const handleSortChange = (sort: string, order: "asc" | "desc") => {
    setQuery(prev => ({ ...prev, sort, order, offset: 0 }));
  };

  const handlePageChange = (offset: number) => {
    setQuery(prev => ({ ...prev, offset }));
  };

  const handleStatusChange = (status: "all" | "active" | "inactive") => {
    setQuery(prev => ({
      ...prev,
      ativo: status === "all" ? undefined : status === "active",
      offset: 0,
    }));
  };

  const handleTipoChange = (tipo: "all" | "PRODUTO" | "SERVICO") => {
    setQuery(prev => ({
      ...prev,
      tipo: tipo === "all" ? undefined : tipo,
      offset: 0,
    }));
  };

  const handleCategoriaChange = (categoria: "all" | string) => {
    setQuery(prev => ({
      ...prev,
      categoria_id: categoria === "all" ? undefined : categoria,
      offset: 0,
    }));
  };

  // Controlar visibilidade da página para evitar refresh desnecessários
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisible.current = !document.hidden;
    };

    const handleFocus = () => {
      isPageVisible.current = true;
    };

    const handleBlur = () => {
      isPageVisible.current = false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <div className="bg-[var(--background-color)] p-3">
      {/* Header com gradiente */}
      <div className="mb-3">
        <div className="bg-gradient-to-r from-[var(--cor-primaria)] to-[var(--cor-secundaria)] rounded-2xl p-3 text-white shadow-[var(--sombra-destaque)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Produtos</h1>
              <p className="text-white/90">Gerencie os produtos e serviços da empresa</p>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="mb-4 flex gap-2">
        <Button
          onClick={handleNovaCategoria}
          variant="outline"
          className="flex items-center gap-2 border-[var(--cor-primaria)]/20 text-[var(--cor-primaria)] hover:bg-[var(--cor-primaria)]/10 hover:border-[var(--cor-primaria)]/40"
        >
          <Tag className="h-4 w-4" />
          Gerenciar Categorias
        </Button>
      </div>

      {/* Lista de Produtos */}
      <ListaProdutos
        key={refreshKey}
        empresaId={empresaId}
        query={query}
        onNovoProduto={handleNovoProduto}
        onEditarProduto={handleEditarProduto}
        onExcluirProduto={handleDeleteProduto}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onStatusChange={handleStatusChange}
        onTipoChange={handleTipoChange}
        onCategoriaChange={handleCategoriaChange}
      />

      {/* Modal de Produto */}
      <ModalProdutoV2
        open={modalProdutoOpen}
        onOpenChange={setModalProdutoOpen}
        produto={produtoParaEditar || undefined}
        onSuccess={handleCloseModalProduto}
        onSubmit={handleSubmitProduto}
        empresaId={empresaId}
      />

      {/* Modal de Categoria */}
      <ModalCategoria
        open={modalCategoriaOpen}
        onOpenChange={setModalCategoriaOpen}
        categoria={categoriaParaEditar || undefined}
        onSuccess={handleCloseModalCategoria}
        onSubmit={handleSubmitCategoria}
      />
    </div>
  );
}