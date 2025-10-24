"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Produto, ProdutoCreate, ProdutoUpdate, ProdutoQuery, ProdutoResponse } from "@/types/produto";

export function useProdutos(empresaId: string, query: ProdutoQuery) {
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

  const supabase = getSupabase();

  const fetchProdutos = useCallback(async () => {
    if (!empresaId) return;

    try {
      setLoading(true);
      setError(null);

      let supabaseQuery = supabase
        .from('produtos')
        .select('*', { count: 'exact' })
        .eq('empresa_id', empresaId);

      // Aplicar filtros
      if (query.search) {
        supabaseQuery = supabaseQuery.or(
          `nome.ilike.%${query.search}%,codigo.ilike.%${query.search}%,descricao.ilike.%${query.search}%`
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

      setProdutos(data || []);
      
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
      console.error('Erro ao buscar produtos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [empresaId, query, supabase]);

  const createProduto = async (produtoData: ProdutoCreate): Promise<Produto> => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert([produtoData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Atualizar lista local
      setProdutos(prev => [data, ...prev]);
      setPagination(prev => ({
        ...prev,
        total: prev.total + 1,
      }));

      return data;
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      throw err;
    }
  };

  const updateProduto = async (id: string, produtoData: ProdutoUpdate): Promise<Produto> => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .update(produtoData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Atualizar lista local
      setProdutos(prev => 
        prev.map(produto => 
          produto.id === id ? data : produto
        )
      );

      return data;
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      throw err;
    }
  };

  const deleteProduto = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      // Atualizar lista local
      setProdutos(prev => prev.filter(produto => produto.id !== id));
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
      }));
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      throw err;
    }
  };

  const getProduto = async (id: string): Promise<Produto | null> => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Produto não encontrado
        }
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      console.error('Erro ao buscar produto:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  return {
    produtos,
    loading,
    error,
    pagination,
    createProduto,
    updateProduto,
    deleteProduto,
    getProduto,
    fetchProdutos,
  };
}
