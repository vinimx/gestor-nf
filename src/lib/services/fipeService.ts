// Serviço para consulta à Tabela FIPE
// API: https://deividfortuna.github.io/fipe/v2/

export interface FipeMarca {
  codigo: string;
  nome: string;
}

export interface FipeModelo {
  codigo: string;
  nome: string;
}

export interface FipeAno {
  codigo: string;
  nome: string;
}

export interface FipeValor {
  TipoVeiculo: number;
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  SiglaCombustivel: string;
  DataConsulta: string;
}

// API FIPE - URL oficial v2
// Documentação: https://deividfortuna.github.io/fipe/v2/
// Base URL: https://fipe.parallelum.com.br/api/v2
// Endpoints usam inglês: cars/motorcycles/trucks, brands, models, years
const FIPE_API_BASE_URL = 'https://fipe.parallelum.com.br/api/v2';

export class FipeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = FIPE_API_BASE_URL;
  }

  /**
   * Lista todas as marcas de um tipo de veículo
   * A API usa: cars, motorcycles, trucks (em inglês)
   */
  private converterTipoVeiculo(tipoVeiculo: 'carros' | 'motos' | 'caminhoes'): 'cars' | 'motorcycles' | 'trucks' {
    const mapeamento: Record<'carros' | 'motos' | 'caminhoes', 'cars' | 'motorcycles' | 'trucks'> = {
      carros: 'cars',
      motos: 'motorcycles',
      caminhoes: 'trucks',
    };
    return mapeamento[tipoVeiculo];
  }

  async listarMarcas(tipoVeiculo: 'carros' | 'motos' | 'caminhoes'): Promise<FipeMarca[]> {
    try {
      const tipoIngles = this.converterTipoVeiculo(tipoVeiculo);
      // Formato: /{vehicleType}/brands
      const url = `${this.baseUrl}/${tipoIngles}/brands`;
      console.log('[FipeService] Consultando URL externa:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // No server-side, não usar cache
        cache: 'no-store',
      });

      console.log('[FipeService] Status da resposta:', response.status);
      console.log('[FipeService] URL da resposta:', response.url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[FipeService] Resposta de erro:', errorText);
        throw new Error(`Erro ao buscar marcas: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      console.log('[FipeService] Dados recebidos (raw):', JSON.stringify(data).substring(0, 500));
      console.log('[FipeService] Tipo dos dados:', typeof data);
      console.log('[FipeService] É array?', Array.isArray(data));
      
      if (Array.isArray(data)) {
        console.log('[FipeService] Primeiro item (original):', data[0]);
        console.log('[FipeService] Total de marcas:', data.length);
        
        // A API retorna { code, name } mas esperamos { codigo, nome }
        // Converter para o formato esperado
        const marcasConvertidas = data.map((item: any) => ({
          codigo: String(item.code || item.codigo || item.id || ''),
          nome: item.name || item.nome || ''
        }));
        
        console.log('[FipeService] Primeiro item (convertido):', marcasConvertidas[0]);
        return marcasConvertidas;
      }
      
      // Se não for array, pode ser um objeto com propriedades diferentes
      console.warn('[FipeService] Formato inesperado, retornando array vazio');
      return [];
    } catch (error: any) {
      console.error('[FipeService] Erro detalhado ao listar marcas FIPE:', error);
      console.error('[FipeService] Mensagem:', error.message);
      console.error('[FipeService] Stack:', error.stack);
      throw error;
    }
  }

  /**
   * Lista modelos de uma marca específica
   */
  async listarModelos(
    tipoVeiculo: 'carros' | 'motos' | 'caminhoes',
    marcaCodigo: string
  ): Promise<{ modelos: FipeModelo[] }> {
    try {
      const tipoIngles = this.converterTipoVeiculo(tipoVeiculo);
      // Formato: /{vehicleType}/brands/{brandId}/models
      const url = `${this.baseUrl}/${tipoIngles}/brands/${marcaCodigo}/models`;
      console.log('[FipeService] Consultando modelos:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar modelos: ${response.status}`);
      }

      const data = await response.json();
      console.log('[FipeService] Modelos recebidos (raw):', JSON.stringify(data).substring(0, 500));
      
      // A API pode retornar { modelos: [...] } ou array direto
      let modelosArray: any[] = [];
      if (data.modelos && Array.isArray(data.modelos)) {
        modelosArray = data.modelos;
      } else if (Array.isArray(data)) {
        modelosArray = data;
      }
      
      // Converter de { code, name } para { codigo, nome }
      const modelosConvertidos = modelosArray.map((item: any) => ({
        codigo: String(item.code || item.codigo || item.id || ''),
        nome: item.name || item.nome || ''
      }));
      
      console.log('[FipeService] Modelos convertidos:', modelosConvertidos.length);
      return { modelos: modelosConvertidos };
    } catch (error) {
      console.error('Erro ao listar modelos FIPE:', error);
      throw error;
    }
  }

  /**
   * Lista anos de um modelo específico
   */
  async listarAnos(
    tipoVeiculo: 'carros' | 'motos' | 'caminhoes',
    marcaCodigo: string,
    modeloCodigo: string
  ): Promise<FipeAno[]> {
    try {
      const tipoIngles = this.converterTipoVeiculo(tipoVeiculo);
      // Formato: /{vehicleType}/brands/{brandId}/models/{modelId}/years
      const url = `${this.baseUrl}/${tipoIngles}/brands/${marcaCodigo}/models/${modeloCodigo}/years`;
      console.log('[FipeService] Consultando anos:', url);
      const response = await fetch(url,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar anos: ${response.status}`);
      }

      const data = await response.json();
      console.log('[FipeService] Anos recebidos (raw):', JSON.stringify(data).substring(0, 500));
      
      if (!Array.isArray(data)) {
        console.warn('[FipeService] Anos não é array, retornando vazio');
        return [];
      }
      
      // Converter de { code, name } para { codigo, nome }
      const anosConvertidos = data.map((item: any) => ({
        codigo: String(item.code || item.codigo || item.id || ''),
        nome: item.name || item.nome || ''
      }));
      
      console.log('[FipeService] Anos convertidos:', anosConvertidos.length);
      return anosConvertidos;
    } catch (error) {
      console.error('Erro ao listar anos FIPE:', error);
      throw error;
    }
  }

  /**
   * Consulta valor FIPE de um veículo específico
   */
  async consultarValor(
    tipoVeiculo: 'carros' | 'motos' | 'caminhoes',
    marcaCodigo: string,
    modeloCodigo: string,
    anoCodigo: string
  ): Promise<FipeValor> {
    try {
      const tipoIngles = this.converterTipoVeiculo(tipoVeiculo);
      // Formato: /{vehicleType}/brands/{brandId}/models/{modelId}/years/{yearId}
      const url = `${this.baseUrl}/${tipoIngles}/brands/${marcaCodigo}/models/${modeloCodigo}/years/${anoCodigo}`;
      console.log('[FipeService] Consultando valor FIPE:', url);
      const response = await fetch(url,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao consultar valor FIPE: ${response.status}`);
      }

      const data = await response.json();
      console.log('[FipeService] Valor FIPE recebido (raw):', JSON.stringify(data).substring(0, 500));
      console.log('[FipeService] Estrutura do valor:', Object.keys(data));
      
      // Garantir que o valor retornado tenha a estrutura esperada
      // A API pode retornar { Valor, Marca, Modelo, ... } ou { price, brand, model, ... }
      const valorFormatado: FipeValor = {
        TipoVeiculo: data.TipoVeiculo || data.type || 0,
        Valor: data.Valor || data.price || data.value || '',
        Marca: data.Marca || data.brand || data.marca || '',
        Modelo: data.Modelo || data.model || data.modelo || '',
        AnoModelo: data.AnoModelo || data.year || data.anoModelo || data.yearId || 0,
        Combustivel: data.Combustivel || data.fuel || data.combustivel || '',
        CodigoFipe: data.CodigoFipe || data.code || data.codigoFipe || '',
        MesReferencia: data.MesReferencia || data.monthReference || data.mesReferencia || '',
        SiglaCombustivel: data.SiglaCombustivel || data.fuelAcronym || data.siglaCombustivel || '',
        DataConsulta: data.DataConsulta || data.consultDate || data.dataConsulta || new Date().toISOString(),
      };
      
      console.log('[FipeService] Valor formatado:', valorFormatado);
      return valorFormatado;
    } catch (error) {
      console.error('Erro ao consultar valor FIPE:', error);
      throw error;
    }
  }
}

export const fipeService = new FipeService();

