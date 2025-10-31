import { useState, useCallback } from 'react';
import { FipeMarca, FipeModelo, FipeAno, FipeValor } from '@/lib/services/fipeService';

interface UseFipeReturn {
  // Estados
  marcas: FipeMarca[];
  modelos: FipeModelo[];
  anos: FipeAno[];
  valorFipe: FipeValor | null;
  loadingMarcas: boolean;
  loadingModelos: boolean;
  loadingAnos: boolean;
  loadingConsulta: boolean;
  error: string | null;

  // Funções
  buscarMarcas: (tipoVeiculo: 'carros' | 'motos' | 'caminhoes') => Promise<void>;
  buscarModelos: (tipoVeiculo: 'carros' | 'motos' | 'caminhoes', marcaCodigo: string) => Promise<void>;
  buscarAnos: (tipoVeiculo: 'carros' | 'motos' | 'caminhoes', marcaCodigo: string, modeloCodigo: string) => Promise<void>;
  consultarValor: (tipoVeiculo: 'carros' | 'motos' | 'caminhoes', marcaCodigo: string, modeloCodigo: string, anoCodigo: string) => Promise<void>;
  limpar: () => void;
}

export function useFipe(): UseFipeReturn {
  const [marcas, setMarcas] = useState<FipeMarca[]>([]);
  const [modelos, setModelos] = useState<FipeModelo[]>([]);
  const [anos, setAnos] = useState<FipeAno[]>([]);
  const [valorFipe, setValorFipe] = useState<FipeValor | null>(null);
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [loadingAnos, setLoadingAnos] = useState(false);
  const [loadingConsulta, setLoadingConsulta] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarMarcas = useCallback(async (tipoVeiculo: 'carros' | 'motos' | 'caminhoes') => {
    try {
      setLoadingMarcas(true);
      setError(null);
      setModelos([]);
      setAnos([]);
      setValorFipe(null);

      const url = `/api/fipe/marcas?tipo=${tipoVeiculo}`;
      console.log('[useFipe] Buscando marcas na URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[useFipe] Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[useFipe] Resposta de erro:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      console.log('[useFipe] Dados recebidos (completo):', data);
      console.log('[useFipe] data.success:', data.success);
      console.log('[useFipe] data.data:', data.data);
      console.log('[useFipe] data.data é array?', Array.isArray(data.data));
      console.log('[useFipe] data.data.length:', data.data?.length);

      if (!data.success) {
        throw new Error(data.error || 'Erro ao buscar marcas');
      }

      const marcasData = data.data || [];
      console.log('[useFipe] Marcas para setar:', marcasData);
      console.log('[useFipe] Primeira marca exemplo:', marcasData[0]);
      
      // Verificar estrutura dos dados
      if (marcasData.length > 0) {
        console.log('[useFipe] Estrutura da primeira marca:', {
          codigo: marcasData[0].codigo,
          nome: marcasData[0].nome,
          keys: Object.keys(marcasData[0])
        });
      }
      
      setMarcas(marcasData);
    } catch (err: any) {
      console.error('Erro ao buscar marcas FIPE:', err);
      setError(err.message || 'Erro ao buscar marcas');
      setMarcas([]);
    } finally {
      setLoadingMarcas(false);
    }
  }, []);

  const buscarModelos = useCallback(async (tipoVeiculo: 'carros' | 'motos' | 'caminhoes', marcaCodigo: string) => {
    try {
      setLoadingModelos(true);
      setError(null);
      setAnos([]);
      setValorFipe(null);

      const response = await fetch(`/api/fipe/modelos?tipo=${tipoVeiculo}&marca=${marcaCodigo}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao buscar modelos');
      }

      setModelos(data.data?.modelos || []);
    } catch (err: any) {
      console.error('Erro ao buscar modelos FIPE:', err);
      setError(err.message || 'Erro ao buscar modelos');
      setModelos([]);
    } finally {
      setLoadingModelos(false);
    }
  }, []);

  const buscarAnos = useCallback(async (tipoVeiculo: 'carros' | 'motos' | 'caminhoes', marcaCodigo: string, modeloCodigo: string) => {
    try {
      setLoadingAnos(true);
      setError(null);
      setValorFipe(null);

      const response = await fetch(`/api/fipe/anos?tipo=${tipoVeiculo}&marca=${marcaCodigo}&modelo=${modeloCodigo}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao buscar anos');
      }

      setAnos(data.data || []);
    } catch (err: any) {
      console.error('Erro ao buscar anos FIPE:', err);
      setError(err.message || 'Erro ao buscar anos');
      setAnos([]);
    } finally {
      setLoadingAnos(false);
    }
  }, []);

  const consultarValor = useCallback(async (tipoVeiculo: 'carros' | 'motos' | 'caminhoes', marcaCodigo: string, modeloCodigo: string, anoCodigo: string) => {
    try {
      setLoadingConsulta(true);
      setError(null);

      const response = await fetch(`/api/fipe/consultar?tipo=${tipoVeiculo}&marca=${marcaCodigo}&modelo=${modeloCodigo}&ano=${anoCodigo}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao consultar valor FIPE');
      }

      setValorFipe(data.data);
    } catch (err: any) {
      console.error('Erro ao consultar valor FIPE:', err);
      setError(err.message || 'Erro ao consultar valor FIPE');
      setValorFipe(null);
    } finally {
      setLoadingConsulta(false);
    }
  }, []);

  const limpar = useCallback(() => {
    setMarcas([]);
    setModelos([]);
    setAnos([]);
    setValorFipe(null);
    setError(null);
  }, []);

  return {
    marcas,
    modelos,
    anos,
    valorFipe,
    loadingMarcas,
    loadingModelos,
    loadingAnos,
    loadingConsulta,
    error,
    buscarMarcas,
    buscarModelos,
    buscarAnos,
    consultarValor,
    limpar,
  };
}

