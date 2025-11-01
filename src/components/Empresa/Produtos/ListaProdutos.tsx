"use client";

import { useState, useEffect } from "react";
import { useProdutos, useCategoriasProdutos } from "@/hooks/useProdutos";
import { Produto, ProdutoQuery, CategoriaProduto, CategoriaProdutoCreate, CategoriaProdutoUpdate } from "@/types/produto";
import { ModalCategoria } from "./ModalCategoria";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  Wrench,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Tag,
  Settings
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
  onCategoriaChange: (categoria: "all" | string) => void;
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
  onCategoriaChange,
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

  const { categorias, loading: categoriasLoading } = useCategoriasProdutos(empresaId);

  const fetchProdutos = async () => {
    if (!empresaId) return;

    try {
      setLoading(true);
      setError(null);

      // Obter token de autenticação
      const { getSupabase } = await import("@/lib/supabaseClient");
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const searchParams = new URLSearchParams();
      if (query.search && query.search.trim() !== '') searchParams.set("search", query.search);
      if (query.tipo && query.tipo !== 'all') searchParams.set("tipo", query.tipo);
      if (query.categoria_id && query.categoria_id !== 'all') searchParams.set("categoria_id", query.categoria_id);
      if (query.ativo !== undefined) searchParams.set("ativo", query.ativo.toString());
      searchParams.set("limit", query.limit.toString());
      searchParams.set("offset", query.offset.toString());
      searchParams.set("sort", query.sort);
      searchParams.set("order", query.order);

      const response = await fetch(`/api/empresa/${empresaId}/produtos?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        let errorData: any = {};
        try {
          // Tentar parsear JSON apenas se houver conteúdo
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch (parseError) {
          console.error('[ListaProdutos] Erro ao parsear resposta:', parseError);
        }
        
        console.error('[ListaProdutos] Erro da API:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        const errorMessage = errorData.message || errorData.error || `Erro ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setProdutos(data.data || []);
      setPagination(data.pagination || {
        total: 0,
        limit: query.limit,
        offset: query.offset,
        hasMore: false,
        totalPages: 0,
        currentPage: 1,
      });
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

  const getCategoriaNome = (categoriaId?: string) => {
    if (!categoriaId) return 'Sem categoria';
    const categoria = categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nome : 'Categoria não encontrada';
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
    <div className="space-y-4">
      {/* Header com botão Novo Produto */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Lista de Produtos ({pagination.total})
          </h2>
        </div>
        <Button
          onClick={onNovoProduto}
          className="flex items-center gap-2 bg-gradient-to-r from-[var(--cor-primaria)] to-[var(--anexo-1-hover)] hover:from-[var(--anexo-1-hover)] hover:to-[var(--cor-primaria)] text-white border-0 shadow-[var(--sombra-destaque)]"
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
      <Card className="p-4 border-2 border-[var(--cor-primaria)]/20 shadow-[var(--sombra-destaque)]">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <select
            value={query.tipo || "all"}
            onChange={(e) => onTipoChange(e.target.value as "all" | "PRODUTO" | "SERVICO")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="all">Todos os tipos</option>
            <option value="PRODUTO">Produto</option>
            <option value="SERVICO">Serviço</option>
          </select>

          {/* Categoria */}
          <select
            value={query.categoria_id || "all"}
            onChange={(e) => onCategoriaChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="all">Todas as categorias</option>
            {categoriasLoading ? (
              <option value="loading" disabled>Carregando...</option>
            ) : (
              categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))
            )}
          </select>

          {/* Status */}
          <select
            value={query.ativo === undefined ? "all" : query.ativo ? "active" : "inactive"}
            onChange={(e) => onStatusChange(e.target.value as "all" | "active" | "inactive")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>

          {/* Ordenação */}
          <select
            value={`${query.sort}-${query.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              onSortChange(sort, order as "asc" | "desc");
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="nome-asc">Nome A-Z</option>
            <option value="nome-desc">Nome Z-A</option>
            <option value="preco_venda-desc">Maior preço</option>
            <option value="preco_venda-asc">Menor preço</option>
            <option value="created_at-desc">Mais recentes</option>
            <option value="created_at-asc">Mais antigos</option>
          </select>
        </div>
      </Card>

      {/* Lista de Produtos */}
      {produtos.length === 0 ? (
        <EmptyState
          title="Nenhum produto encontrado"
          description="Comece criando seu primeiro produto."
          action={{
            icon: Plus,
            label: "Novo Produto",
            onClick: onNovoProduto,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {produtos.map((produto) => (
            <Card key={produto.id} className="p-4 border-2 border-[var(--cor-primaria)]/10 hover:border-[var(--cor-primaria)]/30 hover:shadow-[var(--sombra-destaque)] transition-all duration-300">
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
                        {getTipoLabel(produto.tipo)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(produto.ativo)}
                </div>

                {/* Informações do Produto */}
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Código:</span>
                    <span className="ml-2 text-gray-600">{produto.codigo}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Preço:</span>
                    <span className="ml-2 font-semibold text-green-600">
                      {formatCurrency(produto.preco_venda)}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Categoria:</span>
                    <span className="ml-2 text-gray-600">{getCategoriaNome(produto.categoria_id)}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">NCM:</span>
                    <span className="ml-2 text-gray-600">{produto.ncm || 'N/A'}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">CFOP Saída:</span>
                    <span className="ml-2 text-gray-600">{produto.cfop_saida}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">ICMS:</span>
                    <span className="ml-2 text-gray-600">{produto.aliquota_icms}%</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-2 border-t border-[var(--cor-primaria)]/10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditarProduto(produto)}
                    className="flex-1 border-[var(--cor-primaria)]/20 text-[var(--cor-primaria)] hover:bg-[var(--cor-primaria)]/10 hover:border-[var(--cor-primaria)]/40"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(produto)}
                    className="border-[var(--destructive)]/20 text-[var(--destructive)] hover:bg-[var(--destructive)]/10 hover:border-[var(--destructive)]/40"
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
            
            <span className="text-sm text-gray-700 px-2">
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