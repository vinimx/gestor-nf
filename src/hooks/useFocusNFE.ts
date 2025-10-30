'use client';

import { useState, useCallback } from 'react';
import { focusProdutoService, createFocusProdutoService } from '@/lib/services/focusProdutoService';

interface NCMItem {
  codigo: string;
  descricao_completa: string;
  capitulo: string;
  posicao: string;
  subposicao1: string;
  subposicao2: string;
  item1: string;
  item2: string;
  valid: boolean;
}

interface CFOPItem {
  codigo: string;
  descricao: string;
  valid: boolean;
  tipo: 'ENTRADA' | 'SAIDA';
}

interface CSTItem {
  codigo: string;
  descricao: string;
  tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS';
  aplicavel: boolean;
}

interface UseFocusNFEReturn {
  // Estados de loading
  loadingNCM: boolean;
  loadingCFOP: boolean;
  loadingCST: boolean;
  
  // Estados de erro
  errorNCM: string | null;
  errorCFOP: string | null;
  errorCST: string | null;
  
  // Funções de busca
  buscarNCMs: (params: {
    codigo?: string;
    descricao?: string;
    capitulo?: string;
    posicao?: string;
    subposicao1?: string;
    subposicao2?: string;
    item1?: string;
    item2?: string;
    offset?: number;
    limit?: number;
  }) => Promise<NCMItem[]>;
  
  buscarCFOPs: (params: {
    codigo?: string;
    descricao?: string;
    offset?: number;
    limit?: number;
  }) => Promise<CFOPItem[]>;
  
  buscarCSTs: (tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS') => Promise<CSTItem[]>;
  
  // Funções de consulta individual
  consultarNCM: (codigo: string) => Promise<NCMItem | null>;
  consultarCFOP: (codigo: string) => Promise<CFOPItem | null>;
  
  // Função de validação
  validarProduto: (produtoData: any) => Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;
}

export function useFocusNFE(empresaId?: string): UseFocusNFEReturn {
  const [loadingNCM, setLoadingNCM] = useState(false);
  const [loadingCFOP, setLoadingCFOP] = useState(false);
  const [loadingCST, setLoadingCST] = useState(false);
  
  const [errorNCM, setErrorNCM] = useState<string | null>(null);
  const [errorCFOP, setErrorCFOP] = useState<string | null>(null);
  const [errorCST, setErrorCST] = useState<string | null>(null);

  const buscarNCMs = useCallback(async (params: {
    codigo?: string;
    descricao?: string;
    capitulo?: string;
    posicao?: string;
    subposicao1?: string;
    subposicao2?: string;
    item1?: string;
    item2?: string;
    offset?: number;
    limit?: number;
  }): Promise<NCMItem[]> => {
    try {
      setLoadingNCM(true);
      setErrorNCM(null);
      
      const service = empresaId ? createFocusProdutoService(empresaId) : focusProdutoService;
      const response = await service.buscarNCMs(params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setErrorNCM(response.error || 'Erro ao buscar NCMs');
        return [];
      }
    } catch (error) {
      const errorMessage = 'Erro na busca de NCMs';
      setErrorNCM(errorMessage);
      console.error(errorMessage, error);
      return [];
    } finally {
      setLoadingNCM(false);
    }
  }, []);

  const buscarCFOPs = useCallback(async (params: {
    codigo?: string;
    descricao?: string;
    offset?: number;
    limit?: number;
  }): Promise<CFOPItem[]> => {
    try {
      setLoadingCFOP(true);
      setErrorCFOP(null);
      
      const service = empresaId ? createFocusProdutoService(empresaId) : focusProdutoService;
      const response = await service.buscarCFOPs(params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setErrorCFOP(response.error || 'Erro ao buscar CFOPs');
        return [];
      }
    } catch (error) {
      const errorMessage = 'Erro na busca de CFOPs';
      setErrorCFOP(errorMessage);
      console.error(errorMessage, error);
      return [];
    } finally {
      setLoadingCFOP(false);
    }
  }, []);

  const buscarCSTs = useCallback(async (tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS'): Promise<CSTItem[]> => {
    try {
      setLoadingCST(true);
      setErrorCST(null);
      
      const service = empresaId ? createFocusProdutoService(empresaId) : focusProdutoService;
      const response = await service.buscarCSTs(tipo);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setErrorCST(response.error || 'Erro ao buscar CSTs');
        return [];
      }
    } catch (error) {
      const errorMessage = 'Erro na busca de CSTs';
      setErrorCST(errorMessage);
      console.error(errorMessage, error);
      return [];
    } finally {
      setLoadingCST(false);
    }
  }, []);

  const consultarNCM = useCallback(async (codigo: string): Promise<NCMItem | null> => {
    try {
      setLoadingNCM(true);
      setErrorNCM(null);
      
      const service = empresaId ? createFocusProdutoService(empresaId) : focusProdutoService;
      const response = await service.consultarNCM(codigo);
      
      if (response.success && response.data && response.data.length > 0) {
        return response.data[0];
      } else {
        setErrorNCM(response.error || 'NCM não encontrado');
        return null;
      }
    } catch (error) {
      const errorMessage = 'Erro ao consultar NCM';
      setErrorNCM(errorMessage);
      console.error(errorMessage, error);
      return null;
    } finally {
      setLoadingNCM(false);
    }
  }, []);

  const consultarCFOP = useCallback(async (codigo: string): Promise<CFOPItem | null> => {
    try {
      setLoadingCFOP(true);
      setErrorCFOP(null);
      
      const service = empresaId ? createFocusProdutoService(empresaId) : focusProdutoService;
      const response = await service.consultarCFOP(codigo);
      
      if (response.success && response.data && response.data.length > 0) {
        return response.data[0];
      } else {
        setErrorCFOP(response.error || 'CFOP não encontrado');
        return null;
      }
    } catch (error) {
      const errorMessage = 'Erro ao consultar CFOP';
      setErrorCFOP(errorMessage);
      console.error(errorMessage, error);
      return null;
    } finally {
      setLoadingCFOP(false);
    }
  }, []);

  const validarProduto = useCallback(async (produtoData: any): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> => {
    try {
      const service = empresaId ? createFocusProdutoService(empresaId) : focusProdutoService;
      const response = await service.validarProduto(produtoData);
      
      if (response.success && response.data) {
        return {
          valid: response.data.valid,
          errors: response.data.errors || [],
          warnings: response.data.warnings || []
        };
      } else {
        return {
          valid: false,
          errors: [response.error || 'Erro na validação'],
          warnings: []
        };
      }
    } catch (error) {
      console.error('Erro na validação do produto:', error);
      return {
        valid: false,
        errors: ['Erro na validação do produto'],
        warnings: []
      };
    }
  }, []);

  return {
    loadingNCM,
    loadingCFOP,
    loadingCST,
    errorNCM,
    errorCFOP,
    errorCST,
    buscarNCMs,
    buscarCFOPs,
    buscarCSTs,
    consultarNCM,
    consultarCFOP,
    validarProduto
  };
}