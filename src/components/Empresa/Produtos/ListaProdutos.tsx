"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package, 
  Wrench,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Produto, ProdutoQuery } from "@/types/produto";

interface ListaProdutosProps {
  empresaId: string;
  query: ProdutoQuery;
  onNovoProduto: () => void;
  onEditarProduto: (produto: Produto) => void;
  onExcluirProduto: (produto: Produto) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string, order: "asc" | "desc") => void;
  onPageChange: (offset: number) => void;
  onStatusChange: (status: "all" | "active" | "inactive") => void;
  onTipoChange: (tipo: "all" | "PRODUTO" | "SERVICO") => void;
}

export function ListaProdutos({
  empresaId,
  query,
  onNovoProduto,
  onEditarProduto,
  onExcluirProduto,
  onSearchChange,
  onSortChange,
  onPageChange,
  onStatusChange,
  onTipoChange,
}: ListaProdutosProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: query.limit,
    offset: query.offset,
    hasMore: false,
    totalPages: 0,
    currentPage: 1,
  });

  const fetchProdutos = async () => {
    if (!empresaId) return;

    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (query.search) searchParams.set("search", query.search);
      if (query.tipo) searchParams.set("tipo", query.tipo);
      if (query.ativo !== undefined) searchParams.set("ativo", query.ativo.toString());
      searchParams.set("limit", query.limit.toString());
      searchParams.set("offset", query.offset.toString());
      searchParams.set("sort", query.sort);
      searchParams.set("order", query.order);

      const response = await fetch(`/api/empresa/${empresaId}/produtos?${searchParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar produtos');
      }

      const data = await response.json();
      setProdutos(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [empresaId, query]);

  const handleDelete = async (produto: Produto) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) {
      onExcluirProduto(produto);
    }
  };

  const getStatusBadge = (ativo: boolean) => {
    return (
      <Badge variant={ativo ? "default" : "secondary"}>
        {ativo ? "Ativo" : "Inativo"}
      </Badge>
    );
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'PRODUTO' ? (
      <Package className="h-4 w-4" />
    ) : (
      <Wrench className="h-4 w-4" />
    );
  };

  const getTipoLabel = (tipo: string) => {
    return tipo === 'PRODUTO' ? 'Produto' : 'Serviço';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Carregando produtos..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar produtos"
        message={error}
        onRetry={fetchProdutos}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão Novo Produto */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Lista de Produtos ({pagination.total})
          </h2>
        </div>
        <Button
          onClick={onNovoProduto}
          className="flex items-center gap-2"
          style={{
            background: "var(--cor-primaria)",
            color: "#fff",
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos..."
              value={query.search || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tipo */}
          <Select
            value={query.tipo || "all"}
            onValueChange={onTipoChange}
          >
            <option value="all">Todos os tipos</option>
            <option value="PRODUTO">Produto</option>
            <option value="SERVICO">Serviço</option>
          </Select>

          {/* Status */}
          <Select
            value={query.ativo === undefined ? "all" : query.ativo ? "active" : "inactive"}
            onValueChange={onStatusChange}
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </Select>

          {/* Ordenação */}
          <Select
            value={`${query.sort}-${query.order}`}
            onValueChange={(value) => {
              const [sort, order] = value.split('-');
              onSortChange(sort, order as "asc" | "desc");
            }}
          >
            <option value="nome-asc">Nome A-Z</option>
            <option value="nome-desc">Nome Z-A</option>
            <option value="valor_unitario-desc">Maior Preço</option>
            <option value="valor_unitario-asc">Menor Preço</option>
            <option value="created_at-desc">Mais recentes</option>
            <option value="created_at-asc">Mais antigos</option>
          </Select>
        </div>
      </Card>

      {/* Lista de Produtos */}
      {produtos.length === 0 ? (
        <EmptyState
          title="Nenhum produto encontrado"
          description="Comece criando seu primeiro produto."
          action={{
            label: "Novo Produto",
            onClick: onNovoProduto,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtos.map((produto) => (
            <Card key={produto.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Header do Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTipoIcon(produto.tipo)}
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {produto.nome}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getTipoLabel(produto.tipo)} • {produto.codigo}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(produto.ativo)}
                </div>

                {/* Informações do Produto */}
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Preço:</span>
                    <span className="ml-2 text-gray-600 font-semibold">
                      {formatCurrency(produto.valor_unitario)}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Unidade:</span>
                    <span className="ml-2 text-gray-600">{produto.unidade_medida}</span>
                  </div>
                  
                  {produto.codigo_ncm && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">NCM:</span>
                      <span className="ml-2 text-gray-600">{produto.codigo_ncm}</span>
                    </div>
                  )}
                  
                  {produto.codigo_cfop && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">CFOP:</span>
                      <span className="ml-2 text-gray-600">{produto.codigo_cfop}</span>
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">ICMS:</span>
                    <span className="ml-2 text-gray-600">{produto.aliquota_icms}%</span>
                  </div>
                </div>

                {/* Descrição */}
                {produto.descricao && (
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {produto.descricao}
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditarProduto(produto)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(produto)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {query.offset + 1} a {Math.min(query.offset + query.limit, pagination.total)} de {pagination.total} produtos
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(0)}
              disabled={query.offset === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(0, query.offset - query.limit))}
              disabled={query.offset === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-gray-700">
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(query.offset + query.limit)}
              disabled={!pagination.hasMore}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((pagination.totalPages - 1) * query.limit)}
              disabled={!pagination.hasMore}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
