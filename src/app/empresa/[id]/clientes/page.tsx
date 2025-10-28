"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ListaClientes } from "@/components/Empresa/Clientes/ListaClientes";
import { ModalCliente } from "@/components/Empresa/Clientes/ModalCliente";
import { Cliente, ClienteCreate, ClienteUpdate, ClienteQuery } from "@/types/cliente";
import { useToast } from "@/hooks/useToast";
import { getSupabase } from "@/lib/supabaseClient";

export default function ClientesPage() {
  const params = useParams();
  const empresaId = params.id as string;
  const { toast } = useToast();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const isPageVisible = useRef(true);
  
  const [query, setQuery] = useState<ClienteQuery>({
    search: "",
    tipo: undefined,
    ativo: undefined,
    limit: 20,
    offset: 0,
    sort: "nome_razao_social",
    order: "asc",
  });

  const handleNovaCliente = () => {
    setClienteParaEditar(null);
    setModalOpen(true);
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteParaEditar(cliente);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setClienteParaEditar(null);
    // Força refresh da lista após criar/editar
    setRefreshKey((prev) => prev + 1);
  };

  const handleSubmitCliente = async (data: Partial<Cliente>) => {
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

      if (clienteParaEditar) {
        // Atualizar cliente existente
        const response = await fetch(`/api/empresa/${empresaId}/clientes/${clienteParaEditar.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao atualizar cliente');
        }

        toast({
          title: "Cliente atualizado!",
          description: `${data.nome_razao_social} foi atualizado com sucesso.`,
          variant: "default",
        });
      } else {
        // Criar novo cliente
        const response = await fetch(`/api/empresa/${empresaId}/clientes`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...data,
            empresa_id: empresaId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao criar cliente');
        }

        toast({
          title: "Cliente criado!",
          description: `${data.nome_razao_social} foi cadastrado com sucesso.`,
          variant: "default",
        });
      }

      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: "Erro ao salvar cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCliente = async (cliente: Cliente) => {
    try {
      // Obter token de autenticação
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/empresa/${empresaId}/clientes/${cliente.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir cliente');
      }

      toast({
        title: "Cliente excluído",
        description: `${cliente.nome_razao_social} foi removido com sucesso.`,
        variant: "default",
      });

      // Força refresh da lista
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast({
        title: "Erro ao excluir cliente",
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

  const handleTipoChange = (tipo: "all" | "FISICA" | "JURIDICA") => {
    setQuery(prev => ({
      ...prev,
      tipo: tipo === "all" ? undefined : tipo,
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
              <h1 className="text-2xl font-bold mb-1">Clientes</h1>
              <p className="text-white/90">Gerencie os clientes da empresa</p>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <ListaClientes
        key={refreshKey}
        empresaId={empresaId}
        query={query}
        onNovaCliente={handleNovaCliente}
        onEditarCliente={handleEditarCliente}
        onExcluirCliente={handleDeleteCliente}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onStatusChange={handleStatusChange}
        onTipoChange={handleTipoChange}
      />

      {/* Modal de Cliente */}
      <ModalCliente
        open={modalOpen}
        onOpenChange={setModalOpen}
        cliente={clienteParaEditar}
        onSuccess={handleCloseModal}
        onSubmit={handleSubmitCliente}
      />
    </div>
  );
}
