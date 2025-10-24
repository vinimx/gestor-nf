"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ListaProdutos } from "@/components/Empresa/Produtos/ListaProdutos";
import { ModalProduto } from "@/components/Empresa/Produtos/ModalProduto";
import { Produto, ProdutoCreate, ProdutoUpdate, ProdutoQuery } from "@/types/produto";
import { useToast } from "@/hooks/useToast";

export default function ProdutosPage() {
  const params = useParams();
  const empresaId = params.id as string;
  const { toast } = useToast();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [produtoParaEditar, setProdutoParaEditar] = useState<Produto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [query, setQuery] = useState<ProdutoQuery>({
    search: "",
    tipo: undefined,
    ativo: undefined,
    limit: 20,
    offset: 0,
    sort: "nome",
    order: "asc",
  });

  const handleNovoProduto = () => {
    setProdutoParaEditar(null);
    setModalOpen(true);
  };

  const handleEditarProduto = (produto: Produto) => {
    setProdutoParaEditar(produto);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setProdutoParaEditar(null);
    // Força refresh da lista após criar/editar
    setRefreshKey((prev) => prev + 1);
  };

  const handleSubmitProduto = async (data: Partial<Produto>) => {
    try {
      if (produtoParaEditar) {
        // Atualizar produto existente
        const response = await fetch(`/api/empresa/${empresaId}/produtos/${produtoParaEditar.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
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
          headers: {
            'Content-Type': 'application/json',
          },
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

      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro ao salvar produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduto = async (produto: Produto) => {
    try {
      const response = await fetch(`/api/empresa/${empresaId}/produtos/${produto.id}`, {
        method: 'DELETE',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <p className="text-gray-600">Gerencie os produtos e serviços da empresa</p>
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
      />

      {/* Modal de Produto */}
      <ModalProduto
        open={modalOpen}
        onOpenChange={setModalOpen}
        produto={produtoParaEditar}
        onSuccess={handleCloseModal}
        onSubmit={handleSubmitProduto}
      />
    </div>
  );
}
