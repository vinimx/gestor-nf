"use client";

import { useState, useEffect } from "react";
import { Empresa } from "@/types/models";

interface EmpresaQuery {
  search?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "asc" | "desc";
  ativo?: boolean;
}

interface EmpresaResponse {
  data: Empresa[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function useEmpresas(query: EmpresaQuery = {}) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<
    EmpresaResponse["pagination"] | null
  >(null);

  const fetchEmpresas = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (query.search) params.append("search", query.search);
      if (query.limit) params.append("limit", query.limit.toString());
      if (query.offset) params.append("offset", query.offset.toString());
      if (query.sort) params.append("sort", query.sort);
      if (query.order) params.append("order", query.order);
      if (query.ativo !== undefined) params.append("ativo", query.ativo.toString());

      const response = await fetch(`/api/empresas?${params.toString()}`);

      let json: any = null;
      try {
        json = await response.json();
      } catch (e) {
        // resposta não-JSON
        if (!response.ok)
          throw new Error("Erro ao buscar empresas (resposta inválida)");
        throw e;
      }

      if (!response.ok) {
        const message = json?.error || "Erro ao buscar empresas";
        throw new Error(message);
      }

      // Se o backend retornou offline dev fallback, respeitar
      if (json?.offline) {
        setEmpresas([]);
        setPagination(
          json.pagination || {
            total: 0,
            limit: params.get("limit") ? Number(params.get("limit")) : 10,
            offset: 0,
            hasMore: false,
          }
        );
        setError(json.warning || "Serviço de dados indisponível (modo dev)");
        return;
      }

      const result: EmpresaResponse = json;
      setEmpresas(result.data || []);
      setPagination(result.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, [query.search, query.limit, query.offset, query.sort, query.order, query.ativo]);

  const createEmpresa = async (
    data: Omit<Empresa, "id" | "created_at" | "updated_at">
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Sanitizar payload: converter strings vazias para undefined
      const sanitizeEmptyStrings = (obj: any): any => {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj === "string") {
          const s = obj.trim();
          return s === "" ? undefined : s;
        }
        if (Array.isArray(obj)) return obj.map(sanitizeEmptyStrings);
        if (typeof obj === "object") {
          const out: any = {};
          for (const key of Object.keys(obj)) {
            out[key] = sanitizeEmptyStrings(obj[key]);
          }
          return out;
        }
        return obj;
      };

      const payload = sanitizeEmptyStrings(data);

      const response = await fetch("/api/empresas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.error || "Erro ao criar empresa";
        const details = errorData.details;
        const err = new Error(message);
        (err as any).details = details;
        throw err;
      }

      const newEmpresa = await response.json();
      setEmpresas((prev) => [newEmpresa, ...prev]);
      return newEmpresa;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEmpresa = async (id: string, data: Partial<Empresa>) => {
    setLoading(true);
    setError(null);

    try {
      const sanitizeEmptyStrings = (obj: any): any => {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj === "string") {
          const s = obj.trim();
          return s === "" ? undefined : s;
        }
        if (Array.isArray(obj)) return obj.map(sanitizeEmptyStrings);
        if (typeof obj === "object") {
          const out: any = {};
          for (const key of Object.keys(obj)) {
            out[key] = sanitizeEmptyStrings(obj[key]);
          }
          return out;
        }
        return obj;
      };

      const payload = sanitizeEmptyStrings(data);

      const response = await fetch(`/api/empresas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.error || "Erro ao atualizar empresa";
        const details = errorData.details;
        const err = new Error(message);
        (err as any).details = details;
        throw err;
      }

      const updatedEmpresa = await response.json();
      setEmpresas((prev) =>
        prev.map((emp) => (emp.id === id ? updatedEmpresa : emp))
      );
      return updatedEmpresa;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEmpresa = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/empresas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir empresa");
      }

      setEmpresas((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEmpresa = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/empresas/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao buscar empresa");
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    empresas,
    loading,
    error,
    pagination,
    fetchEmpresas,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
    getEmpresa,
  };
}



