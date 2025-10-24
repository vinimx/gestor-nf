"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getSupabase } from "@/lib/supabaseClient";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  User, 
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Cliente, ClienteQuery } from "@/types/cliente";
import { maskCPFCNPJ } from "@/lib/masks/clienteMasks";

interface ListaClientesProps {
  empresaId: string;
  query: ClienteQuery;
  onNovaCliente: () => void;
  onEditarCliente: (cliente: Cliente) => void;
  onExcluirCliente: (cliente: Cliente) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string, order: "asc" | "desc") => void;
  onPageChange: (offset: number) => void;
  onStatusChange: (status: "all" | "active" | "inactive") => void;
  onTipoChange: (tipo: "all" | "FISICA" | "JURIDICA") => void;
}

export function ListaClientes({
  empresaId,
  query,
  onNovaCliente,
  onEditarCliente,
  onExcluirCliente,
  onSearchChange,
  onSortChange,
  onPageChange,
  onStatusChange,
  onTipoChange,
}: ListaClientesProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
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

  const fetchClientes = async () => {
    if (!empresaId) return;

    try {
      setLoading(true);
      setError(null);

      // Obter token de autenticação
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const searchParams = new URLSearchParams();
      if (query.search) searchParams.set("search", query.search);
      if (query.tipo) searchParams.set("tipo", query.tipo);
      if (query.ativo !== undefined) searchParams.set("ativo", query.ativo.toString());
      searchParams.set("limit", query.limit.toString());
      searchParams.set("offset", query.offset.toString());
      searchParams.set("sort", query.sort);
      searchParams.set("order", query.order);

      const response = await fetch(`/api/empresa/${empresaId}/clientes?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar clientes');
      }

      const data = await response.json();
      setClientes(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [empresaId, query]);

  const handleDelete = async (cliente: Cliente) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome_razao_social}"?`)) {
      onExcluirCliente(cliente);
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
    return tipo === 'FISICA' ? (
      <User className="h-4 w-4" />
    ) : (
      <Building2 className="h-4 w-4" />
    );
  };

  const getTipoLabel = (tipo: string) => {
    return tipo === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Carregando clientes..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar clientes"
        message={error}
        onRetry={fetchClientes}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com botão Novo Cliente */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Lista de Clientes ({pagination.total})
          </h2>
        </div>
        <Button
          onClick={onNovaCliente}
          className="flex items-center gap-2 bg-gradient-to-r from-[var(--cor-primaria)] to-[var(--anexo-1-hover)] hover:from-[var(--anexo-1-hover)] hover:to-[var(--cor-primaria)] text-white border-0 shadow-[var(--sombra-destaque)]"
          style={{
            background: "var(--cor-primaria)",
            color: "#fff",
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4 border-2 border-[var(--cor-primaria)]/20 shadow-[var(--sombra-destaque)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar clientes..."
              value={query.search || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

              {/* Tipo */}
              <select
                value={query.tipo || "all"}
                onChange={(e) => onTipoChange(e.target.value as "all" | "FISICA" | "JURIDICA")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">Todos os tipos</option>
                <option value="FISICA">Pessoa Física</option>
                <option value="JURIDICA">Pessoa Jurídica</option>
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
                <option value="nome_razao_social-asc">Nome A-Z</option>
                <option value="nome_razao_social-desc">Nome Z-A</option>
                <option value="created_at-desc">Mais recentes</option>
                <option value="created_at-asc">Mais antigos</option>
              </select>
        </div>
      </Card>

      {/* Lista de Clientes */}
      {clientes.length === 0 ? (
        <EmptyState
          title="Nenhum cliente encontrado"
          description="Comece criando seu primeiro cliente."
          action={{
            icon: Plus,
            className: "bg-gradient-to-r from-[var(--cor-primaria)] to-[var(--anexo-1-hover)] hover:from-[var(--anexo-1-hover)] hover:to-[var(--cor-primaria)] text-white border-0 shadow-[var(--sombra-destaque)]",
            label: "Novo Cliente",
            onClick: onNovaCliente,
            }}
          />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientes.map((cliente) => (
                <Card key={cliente.id} className="p-4 border-2 border-[var(--cor-primaria)]/10 hover:border-[var(--cor-primaria)]/30 hover:shadow-[var(--sombra-destaque)] transition-all duration-300">
              <div className="space-y-4">
                {/* Header do Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTipoIcon(cliente.tipo)}
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {cliente.nome_razao_social}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getTipoLabel(cliente.tipo)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(cliente.ativo)}
                </div>

                {/* Informações do Cliente */}
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">CPF/CNPJ:</span>
                    <span className="ml-2 text-gray-600">
                      {maskCPFCNPJ(cliente.cpf_cnpj, cliente.tipo)}
                    </span>
                  </div>
                  
                  {cliente.email && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-600">{cliente.email}</span>
                    </div>
                  )}
                  
                  {cliente.telefone && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Telefone:</span>
                      <span className="ml-2 text-gray-600">{cliente.telefone}</span>
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Endereço:</span>
                    <span className="ml-2 text-gray-600">
                      {cliente.endereco.cidade}, {cliente.endereco.uf}
                    </span>
                  </div>
                </div>

                    {/* Ações */}
                    <div className="flex gap-2 pt-2 border-t border-[var(--cor-primaria)]/10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditarCliente(cliente)}
                        className="flex-1 border-[var(--cor-primaria)]/20 text-[var(--cor-primaria)] hover:bg-[var(--cor-primaria)]/10 hover:border-[var(--cor-primaria)]/40"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(cliente)}
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
            Mostrando {query.offset + 1} a {Math.min(query.offset + query.limit, pagination.total)} de {pagination.total} clientes
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
