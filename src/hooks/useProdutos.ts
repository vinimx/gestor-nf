"use client";

import { useState, useEffect, useCallback } from "react";
import { Produto, ProdutoCreate, ProdutoUpdate, ProdutoQuery, CategoriaProduto, CategoriaProdutoCreate, CategoriaProdutoUpdate } from "@/types/produto";
import { useToast } from "@/hooks/useToast";

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

  const { toast } = useToast();

  const fetchProdutos = useCallback(async () => {
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
      if (query.search) searchParams.set("search", query.search);
      if (query.tipo) searchParams.set("tipo", query.tipo);
      if (query.categoria_id) searchParams.set("categoria_id", query.categoria_id);
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar produtos');
      }

      const data = await response.json();
      setProdutos(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error('Erro ao buscar produtos:', err);
      setError(err.message || 'Erro ao carregar produtos');
      toast({
        title: "Erro ao carregar produtos",
        description: err.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [empresaId, query, toast]);

  const createProduto = useCallback(async (data: ProdutoCreate) => {
    try {
      const { getSupabase } = await import("@/lib/supabaseClient");
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/empresa/${empresaId}/produtos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar produto');
      }

      const produto = await response.json();
      await fetchProdutos(); // Refresh da lista
      return produto;
    } catch (err: any) {
      console.error('Erro ao criar produto:', err);
      toast({
        title: "Erro ao criar produto",
        description: err.message || "Erro desconhecido",
        variant: "destructive",
      });
      throw err;
    }
  }, [empresaId, fetchProdutos, toast]);

  const updateProduto = useCallback(async (id: string, data: ProdutoUpdate) => {
    try {
      const { getSupabase } = await import("@/lib/supabaseClient");
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/empresa/${empresaId}/produtos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar produto');
      }

      const produto = await response.json();
      await fetchProdutos(); // Refresh da lista
      return produto;
    } catch (err: any) {
      console.error('Erro ao atualizar produto:', err);
      toast({
        title: "Erro ao atualizar produto",
        description: err.message || "Erro desconhecido",
        variant: "destructive",
      });
      throw err;
    }
  }, [empresaId, fetchProdutos, toast]);

  const deleteProduto = useCallback(async (id: string) => {
    try {
      const { getSupabase } = await import("@/lib/supabaseClient");
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/empresa/${empresaId}/produtos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir produto');
      }

      await fetchProdutos(); // Refresh da lista
    } catch (err: any) {
      console.error('Erro ao excluir produto:', err);
      toast({
        title: "Erro ao excluir produto",
        description: err.message || "Erro desconhecido",
        variant: "destructive",
      });
      throw err;
    }
  }, [empresaId, fetchProdutos, toast]);

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
    refetch: fetchProdutos,
  };
}

export function useCategoriasProdutos(empresaId: string) {
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchCategorias = useCallback(async () => {
    if (!empresaId) return;

    try {
      setLoading(true);
      setError(null);

      const { getSupabase } = await import("@/lib/supabaseClient");
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/empresa/${empresaId}/categorias-produtos?ativo=true&order=nome`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar categorias');
      }

      const data = await response.json();
      // Suportar ambos os formatos: { success, data } ou array direto
      if (Array.isArray(data)) {
        setCategorias(data);
      } else if (data.data && Array.isArray(data.data)) {
        setCategorias(data.data);
      } else {
        setCategorias([]);
      }
    } catch (err: any) {
      console.error('Erro ao buscar categorias:', err);
      setError(err.message || 'Erro ao carregar categorias');
      toast({
        title: "Erro ao carregar categorias",
        description: err.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [empresaId, toast]);

  const createCategoria = useCallback(async (data: CategoriaProdutoCreate) => {
    try {
      const { getSupabase } = await import("@/lib/supabaseClient");
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/empresa/${empresaId}/categorias-produtos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar categoria');
      }

      const categoria = await response.json();
      await fetchCategorias(); // Refresh da lista
      return categoria;
    } catch (err: any) {
      console.error('Erro ao criar categoria:', err);
      toast({
        title: "Erro ao criar categoria",
        description: err.message || "Erro desconhecido",
        variant: "destructive",
      });
      throw err;
    }
  }, [empresaId, fetchCategorias, toast]);

  const updateCategoria = useCallback(async (id: string, data: CategoriaProdutoUpdate) => {
    try {
      const { getSupabase } = await import("@/lib/supabaseClient");
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/empresa/${empresaId}/categorias-produtos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar categoria');
      }

      const categoria = await response.json();
      await fetchCategorias(); // Refresh da lista
      return categoria;
    } catch (err: any) {
      console.error('Erro ao atualizar categoria:', err);
      toast({
        title: "Erro ao atualizar categoria",
        description: err.message || "Erro desconhecido",
        variant: "destructive",
      });
      throw err;
    }
  }, [empresaId, fetchCategorias, toast]);

  const deleteCategoria = useCallback(async (id: string) => {
    try {
      const { getSupabase } = await import("@/lib/supabaseClient");
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/empresa/${empresaId}/categorias-produtos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir categoria');
      }

      await fetchCategorias(); // Refresh da lista
    } catch (err: any) {
      console.error('Erro ao excluir categoria:', err);
      toast({
        title: "Erro ao excluir categoria",
        description: err.message || "Erro desconhecido",
        variant: "destructive",
      });
      throw err;
    }
  }, [empresaId, fetchCategorias, toast]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return {
    categorias,
    loading,
    error,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    refetch: fetchCategorias,
  };
}