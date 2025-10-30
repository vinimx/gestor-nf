"use client";

import { useState, useEffect, useRef } from "react";
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
  refreshSignal?: number; // usado para forçar recarga sem remontar
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
  refreshSignal,
}: ListaClientesProps) {
  const getSignature = () => {
    return `${empresaId}|${query.search || ''}|${query.tipo || ''}|${query.limit}|${query.offset}|${query.sort}|${query.order}|${refreshSignal ?? 0}`;
  };

  // Hidrata a partir do cache de sessão para evitar "refresh" visual ao trocar de aba/remount
  const initialCache = (() => {
    try {
      const signature = getSignature();
      const cacheKey = `clientes_cache_${signature}`;
      const raw = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached?.ts && Array.isArray(cached.data)) {
          return cached;
        }
      }
    } catch {}
    return null;
  })();

  const [clientes, setClientes] = useState<Cliente[]>(initialCache?.data || []);
  const [loading, setLoading] = useState(!initialCache);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>(query.search || "");
  const skipNextRefetchOnFocusRef = useRef(false);
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas para evitar refresh em troca de aba
  const hasMountedRef = useRef(false);
  const [pagination, setPagination] = useState({
    total: initialCache?.pagination?.total || 0,
    limit: query.limit,
    offset: query.offset,
    hasMore: initialCache?.pagination?.hasMore || false,
    totalPages: initialCache?.pagination?.totalPages || 0,
    currentPage: initialCache?.pagination?.currentPage || 1,
  });

  const fetchClientes = async () => {
    if (!empresaId) return;

    try {
      // Evita flicker: só mostra loading se não há dados
      if (clientes.length === 0) setLoading(true);
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

      // Persistir no cache de sessão
      try {
        const signature = getSignature();
        const cacheKey = `clientes_cache_${signature}`;
        const payload = {
          ts: Date.now(),
          data: data.data,
          pagination: data.pagination,
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(payload));
      } catch {}
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  // getSignature movido para o topo para uso no cache inicial

  // Debounce da busca para evitar refresh a cada tecla
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== (query.search || "")) {
        onSearchChange(searchValue);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // Sincroniza valor local quando filtro externo mudar (ex.: limpar filtros)
  useEffect(() => {
    setSearchValue(query.search || "");
  }, [query.search]);

  // Carrega apenas uma vez (ou via botão Atualizar). Não reage a mudanças automáticas.
  useEffect(() => {
    // Se a aba foi ocultada anteriormente, marcamos para pular o próximo fetch ao voltar
    try {
      const signature = getSignature();
      const skipKey = 'clientes_skip_on_visible';
      const handleVisibility = () => {
        try {
          if (document.hidden) {
            sessionStorage.setItem(skipKey, signature);
          }
        } catch {}
      };
      const handleBlur = () => {
        try {
          sessionStorage.setItem(skipKey, signature);
        } catch {}
      };
      document.addEventListener('visibilitychange', handleVisibility);
      window.addEventListener('blur', handleBlur);
      // Cleanup
      return () => {
        document.removeEventListener('visibilitychange', handleVisibility);
        window.removeEventListener('blur', handleBlur);
      };
    } catch {}
  }, []);

  // Atualização automática somente para filtros: busca, tipo, ordenação e paginação
  useEffect(() => {
    fetchClientes();
  }, [
    query.search,
    query.tipo,
    query.sort,
    query.order,
    query.offset,
  ]);

  useEffect(() => {
    // Primeiro tenta cache
    try {
      const signature = getSignature();
      const skipKey = 'clientes_skip_on_visible';
      // Se marcado para pular e temos cache, usa cache e não busca
      const shouldSkip = sessionStorage.getItem(skipKey) === signature;
      const cacheKey = `clientes_cache_${signature}`;
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached?.ts && Date.now() - cached.ts < CACHE_TTL_MS && Array.isArray(cached.data)) {
          setClientes(cached.data);
          if (cached.pagination) setPagination(cached.pagination);
          setLoading(false);
          if (shouldSkip) {
            try { sessionStorage.removeItem(skipKey); } catch {}
            return; // não buscar se voltamos de outra aba
          }
          return; // cache válido já exibido
        }
      }
      if (shouldSkip) {
        // Se pediu para pular mas não há cache válido, seguimos para buscar normalmente
        try { sessionStorage.removeItem(skipKey); } catch {}
      }
    } catch {}

    // Sem cache válido: faz apenas o primeiro fetch (não repetirá em troca de aba)
    fetchClientes();
  }, []);

  // Não reagimos a focus/visibility (sem listeners aqui)

  const handleDelete = async (cliente: Cliente) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome_razao_social}"?`)) {
      onExcluirCliente(cliente);
    }
  };

  // Badge de status removido

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
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchClientes}
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading}
            title="Atualizar lista (manual)"
          >
            {/* ícone de refresh simples usando SVG para evitar dependência */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0114.13-3.36L23 10"></path>
              <path d="M20.49 15a9 9 0 01-14.13 3.36L1 14"></path>
            </svg>
            {loading ? 'Atualizando...' : 'Atualizar'}
          </Button>
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
      </div>

      {/* Filtros */}
      <Card className="p-4 border-2 border-[var(--cor-primaria)]/20 shadow-[var(--sombra-destaque)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar clientes..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
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

              {/* Status removido */}

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
            label: "Novo Cliente",
            onClick: onNovaCliente,
            }}
          />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {clientes.map((cliente) => (
                <Card key={cliente.id} className="p-4 sm:p-5 md:p-6 min-h-[180px] md:min-h-[200px] h-full border-2 border-[var(--cor-primaria)]/10 hover:border-[var(--cor-primaria)]/30 hover:shadow-[var(--sombra-destaque)] transition-all duration-300">
              <div className="space-y-4 h-full flex flex-col">
                {/* Header do Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTipoIcon(cliente.tipo)}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 break-words whitespace-normal">
                        {cliente.nome_razao_social}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {getTipoLabel(cliente.tipo)}
                      </p>
                    </div>
                  </div>
                  {/* Status removido do card */}
                </div>

                {/* Informações do Cliente */}
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">CPF/CNPJ:</span>
                    <span className="ml-2 text-gray-600 break-words whitespace-normal">
                      {maskCPFCNPJ(cliente.cpf_cnpj, cliente.tipo)}
                    </span>
                  </div>
                  
                  {cliente.email && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-600 break-words whitespace-normal">{cliente.email}</span>
                    </div>
                  )}
                  
                  {cliente.telefone && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Telefone:</span>
                      <span className="ml-2 text-gray-600 break-words whitespace-normal">{cliente.telefone}</span>
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Endereço:</span>
                    <span className="ml-2 text-gray-600 break-words whitespace-normal">
                      {cliente.endereco.cidade}, {cliente.endereco.uf}
                    </span>
                  </div>
                </div>

                    {/* Ações */}
                    <div className="flex gap-2 pt-2 border-t border-[var(--cor-primaria)]/10 mt-auto">
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
