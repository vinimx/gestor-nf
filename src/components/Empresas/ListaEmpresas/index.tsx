"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { useEmpresas } from "@/hooks/useEmpresas";
import { Empresa } from "@/types/models";
import { AlertTriangle, Building2, Loader2, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { Filtros } from "./Filtros";
import { ItemEmpresa } from "./ItemEmpresa";
import { Paginacao } from "./Paginacao";
import { SkeletonListaEmpresas } from "./SkeletonEmpresa";

interface ListaEmpresasProps {
  onNovaEmpresa: () => void;
  onEditarEmpresa: (empresa: Empresa) => void;
}

export function ListaEmpresas({
  onNovaEmpresa,
  onEditarEmpresa,
}: ListaEmpresasProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState({
    search: "",
    limit: 9,
    offset: 0,
    sort: "nome",
    order: "asc" as "asc" | "desc",
    ativo: undefined as boolean | undefined,
  });

  const {
    empresas,
    loading,
    error,
    pagination,
    deleteEmpresa,
    fetchEmpresas,
  } = useEmpresas(query);

  const [empresaParaExcluir, setEmpresaParaExcluir] = useState<Empresa | null>(
    null
  );
  const [excluindo, setExcluindo] = useState(false);

  const handleSearchChange = useCallback((search: string) => {
    setQuery((prev) => ({ ...prev, search, offset: 0 }));
  }, []);

  const handleSortChange = useCallback(
    (sort: string, order: "asc" | "desc") => {
      setQuery((prev) => ({ ...prev, sort, order, offset: 0 }));
    },
    []
  );

  const handlePageChange = useCallback((offset: number) => {
    setQuery((prev) => ({ ...prev, offset }));
  }, []);

  const handleStatusChange = useCallback((status: "all" | "active" | "inactive") => {
    setQuery((prev) => ({
      ...prev,
      ativo: status === "all" ? undefined : status === "active",
      offset: 0,
    }));
  }, []);

  const handleDelete = async () => {
    if (!empresaParaExcluir) return;

    setExcluindo(true);
    try {
      await deleteEmpresa(empresaParaExcluir.id);
      toast({
        title: "Empresa excluída",
        description: `${empresaParaExcluir.nome} foi removida com sucesso.`,
        variant: "default",
      });
      setEmpresaParaExcluir(null);
      fetchEmpresas();
    } catch (error) {
      toast({
        title: "Erro ao excluir empresa",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Empresas</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie as empresas cadastradas no sistema
          </p>
        </div>
        <Button 
          onClick={onNovaEmpresa}
          aria-label="Cadastrar nova empresa"
          className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Nova Empresa
        </Button>
      </div>

      {/* Filtros */}
      <Filtros
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onStatusChange={handleStatusChange}
        defaultSearch={query.search}
        defaultSort={query.sort}
        defaultOrder={query.order}
        defaultStatus={
          query.ativo === undefined ? "all" : query.ativo ? "active" : "inactive"
        }
      />

      {/* Conteúdo */}
      {loading ? (
        <SkeletonListaEmpresas count={query.limit} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <p className="font-medium">Erro ao carregar empresas</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button 
            onClick={() => fetchEmpresas()} 
            variant="outline"
            aria-label="Tentar carregar empresas novamente"
          >
            Tentar novamente
          </Button>
        </div>
      ) : empresas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-16">
          <Building2 className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium">Nenhuma empresa encontrada</p>
            <p className="text-sm text-muted-foreground">
              {query.search
                ? "Tente ajustar os filtros de busca"
                : "Comece cadastrando uma nova empresa"}
            </p>
          </div>
          {!query.search && (
            <Button onClick={onNovaEmpresa}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Primeira Empresa
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Grid de Empresas */}
          <div 
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            role="list"
            aria-label="Lista de empresas cadastradas"
          >
            {empresas.map((empresa) => (
              <ItemEmpresa
                key={empresa.id}
                empresa={empresa}
                onEdit={onEditarEmpresa}
                onDelete={setEmpresaParaExcluir}
              />
            ))}
          </div>

          {/* Paginação */}
          {pagination && pagination.total > query.limit && (
            <Paginacao
              total={pagination.total}
              limit={query.limit}
              offset={query.offset}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Dialog
        open={!!empresaParaExcluir}
        onOpenChange={(open) => !open && setEmpresaParaExcluir(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a empresa{" "}
              <strong>{empresaParaExcluir?.nome}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmpresaParaExcluir(null)}
              disabled={excluindo}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={excluindo}
            >
              {excluindo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

