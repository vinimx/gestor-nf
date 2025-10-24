"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Cliente, ClienteCreate, ClienteUpdate, ClienteQuery, ClienteResponse } from "@/types/cliente";

export function useClientes(empresaId: string, query: ClienteQuery) {
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

  const supabase = getSupabase();

  const fetchClientes = useCallback(async () => {
    if (!empresaId) return;

    try {
      setLoading(true);
      setError(null);

      let supabaseQuery = supabase
        .from('clientes')
        .select('*', { count: 'exact' })
        .eq('empresa_id', empresaId);

      // Aplicar filtros
      if (query.search) {
        supabaseQuery = supabaseQuery.or(
          `nome_razao_social.ilike.%${query.search}%,cpf_cnpj.ilike.%${query.search}%,email.ilike.%${query.search}%`
        );
      }

      if (query.tipo) {
        supabaseQuery = supabaseQuery.eq('tipo', query.tipo);
      }

      if (query.ativo !== undefined) {
        supabaseQuery = supabaseQuery.eq('ativo', query.ativo);
      }

      // Aplicar ordenação
      supabaseQuery = supabaseQuery.order(query.sort, {
        ascending: query.order === 'asc',
      });

      // Aplicar paginação
      supabaseQuery = supabaseQuery.range(
        query.offset,
        query.offset + query.limit - 1
      );

      const { data, error: fetchError, count } = await supabaseQuery;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setClientes(data || []);
      
      const total = count || 0;
      const totalPages = Math.ceil(total / query.limit);
      const currentPage = Math.floor(query.offset / query.limit) + 1;

      setPagination({
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < total,
        totalPages,
        currentPage,
      });
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [empresaId, query, supabase]);

  const createCliente = async (clienteData: ClienteCreate): Promise<Cliente> => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([clienteData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Atualizar lista local
      setClientes(prev => [data, ...prev]);
      setPagination(prev => ({
        ...prev,
        total: prev.total + 1,
      }));

      return data;
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
      throw err;
    }
  };

  const updateCliente = async (id: string, clienteData: ClienteUpdate): Promise<Cliente> => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Atualizar lista local
      setClientes(prev => 
        prev.map(cliente => 
          cliente.id === id ? data : cliente
        )
      );

      return data;
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      throw err;
    }
  };

  const deleteCliente = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      // Atualizar lista local
      setClientes(prev => prev.filter(cliente => cliente.id !== id));
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
      }));
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      throw err;
    }
  };

  const getCliente = async (id: string): Promise<Cliente | null> => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Cliente não encontrado
        }
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      console.error('Erro ao buscar cliente:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return {
    clientes,
    loading,
    error,
    pagination,
    createCliente,
    updateCliente,
    deleteCliente,
    getCliente,
    fetchClientes,
  };
}
