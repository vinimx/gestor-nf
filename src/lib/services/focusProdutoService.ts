// Serviço para integração com FOCUS NFE - Validação de Produtos
// FASE 3: Gestão de Produtos/Serviços

import { FocusProdutoData } from "@/types/produto";

interface FocusValidationResponse {
  success: boolean;
  data?: {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  };
  error?: string;
}

interface FocusNCMResponse {
  success: boolean;
  data?: {
    codigo: string;
    descricao_completa: string;
    capitulo: string;
    posicao: string;
    subposicao1: string;
    subposicao2: string;
    item1: string;
    item2: string;
    valid: boolean;
  }[];
  totalCount?: number;
  source?: 'focus_nfe' | 'local' | 'local_fallback';
  error?: string;
}

interface FocusCFOPResponse {
  success: boolean;
  data?: {
    codigo: string;
    descricao: string;
    valid: boolean;
    tipo: 'ENTRADA' | 'SAIDA';
  }[];
  totalCount?: number;
  source?: 'focus_nfe' | 'local' | 'local_fallback';
  error?: string;
}

interface FocusCSTResponse {
  success: boolean;
  data?: {
    codigo: string;
    descricao: string;
    tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS';
    aplicavel: boolean;
  }[];
  error?: string;
}

interface FocusSearchParams {
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
}

interface FocusCFOPSearchParams {
  codigo?: string;
  descricao?: string;
  offset?: number;
  limit?: number;
}

class FocusProdutoService {
  private baseUrl: string;
  private apiToken: string;
  private environment: string;
  private useApi: boolean;
  private empresaId?: string;

  constructor(empresaId?: string) {
    this.empresaId = empresaId;
    this.baseUrl = process.env.NEXT_PUBLIC_FOCUS_API_URL || 'https://api.focusnfe.com.br';
    this.environment = process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT || 'homologacao';
    this.apiToken = process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN || '';
    
    // Ajustar URL base conforme ambiente
    if (this.environment === 'homologacao') {
      this.baseUrl = 'https://homologacao.focusnfe.com.br';
    }
    
    // Priorizar API real da FOCUS NFE quando token estiver configurado
    this.useApi = !!this.apiToken;
    
    console.log('FocusProdutoService configurado:', {
      empresaId: this.empresaId,
      environment: this.environment,
      baseUrl: this.baseUrl,
      hasToken: !!this.apiToken,
      useApi: this.useApi
    });
  }

  // ===== VALIDAÇÃO DE PRODUTOS =====
  async validarProduto(produtoData: FocusProdutoData): Promise<FocusValidationResponse> {
    try {
      // Validação local primeiro
      const validacaoLocal = this.validarProdutoLocal(produtoData);
      if (!validacaoLocal.success) {
        return validacaoLocal;
      }

      // Se API configurada e habilitada, validar via FOCUS NFE
      if (this.useApi && this.apiToken) {
        try {
      const response = await fetch(`${this.baseUrl}/v2/produtos/validar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(this.apiToken + ':')}`
            },
            body: JSON.stringify(produtoData)
          });

          if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: {
          valid: data.valid || false,
          errors: data.errors || [],
                warnings: data.warnings || []
              }
            };
          }
        } catch (error) {
          console.warn('Erro na validação via API FOCUS NFE:', error);
        }
      }

      return validacaoLocal;
    } catch (error) {
      return {
        success: false,
        error: 'Erro na validação do produto'
      };
    }
  }

  private validarProdutoLocal(produtoData: any): FocusValidationResponse {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validações básicas
    if (!produtoData.ncm || produtoData.ncm.length !== 8) {
      errors.push('NCM deve ter 8 dígitos');
    }

    if (!produtoData.cfop_saida || produtoData.cfop_saida.length !== 4) {
      errors.push('CFOP de saída deve ter 4 dígitos');
    }

    if (!produtoData.cfop_entrada || produtoData.cfop_entrada.length !== 4) {
      errors.push('CFOP de entrada deve ter 4 dígitos');
    }

    if (produtoData.aliquota_icms < 0 || produtoData.aliquota_icms > 100) {
      errors.push('Alíquota ICMS deve estar entre 0 e 100%');
    }

    return {
      success: errors.length === 0,
      data: {
        valid: errors.length === 0,
        errors,
        warnings
      }
    };
  }

  // ===== CONSULTA DE NCM =====
  async consultarNCM(codigoNCM: string): Promise<FocusNCMResponse> {
    try {
      if (this.useApi && this.apiToken) {
        try {
          // Tentar usar API route local primeiro (para evitar CORS)
          const url = this.empresaId 
            ? `/api/focus/ncms/${codigoNCM}?empresa_id=${this.empresaId}`
            : `/api/focus/ncms/${codigoNCM}`;
          
          const response = await fetch(url, {
        method: 'GET',
        headers: {
              'Content-Type': 'application/json',
            }
      });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
          return {
                success: true,
                data: [{
                  codigo: result.data.codigo,
                  descricao_completa: result.data.descricao_completa,
                  capitulo: result.data.capitulo,
                  posicao: result.data.posicao,
                  subposicao1: result.data.subposicao1,
                  subposicao2: result.data.subposicao2,
                  item1: result.data.item1,
                  item2: result.data.item2,
                  valid: true
                }]
              };
            }
          }
        } catch (error) {
          console.warn('Erro na consulta NCM via API route:', error);
        }
      }

      return this.consultarNCMLocal(codigoNCM);
    } catch (error) {
      return {
        success: false,
        error: 'Erro na consulta do NCM'
      };
    }
  }

  private consultarNCMLocal(codigoNCM: string): FocusNCMResponse {
    // Base de dados local simplificada para fallback
    const ncmsLocais: Record<string, any> = {
      '85171200': {
        codigo: '85171200',
        descricao_completa: 'Telefones celulares e outros equipamentos de comunicação',
        capitulo: '85',
        posicao: '17',
        subposicao1: '1',
        subposicao2: '2',
        item1: '0',
        item2: '0',
        valid: true
      },
      '84713000': {
        codigo: '84713000',
        descricao_completa: 'Máquinas de processamento de dados e suas unidades',
        capitulo: '84',
        posicao: '71',
        subposicao1: '3',
        subposicao2: '0',
        item1: '0',
        item2: '0',
        valid: true
      }
    };

    const ncm = ncmsLocais[codigoNCM];
    if (ncm) {
    return {
      success: true,
        data: [ncm]
      };
    }
    
    return {
      success: false,
      error: 'NCM não encontrado'
    };
  }

  async buscarNCMs(params: FocusSearchParams): Promise<FocusNCMResponse> {
    try {
      if (this.useApi && this.apiToken) {
        try {
          const queryParams = new URLSearchParams();
          
          if (params.codigo) queryParams.append('codigo', params.codigo);
          if (params.descricao) queryParams.append('descricao', params.descricao);
          if (params.capitulo) queryParams.append('capitulo', params.capitulo);
          if (params.posicao) queryParams.append('posicao', params.posicao);
          if (params.subposicao1) queryParams.append('subposicao1', params.subposicao1);
          if (params.subposicao2) queryParams.append('subposicao2', params.subposicao2);
          if (params.item1) queryParams.append('item1', params.item1);
          if (params.item2) queryParams.append('item2', params.item2);
          if (params.offset) queryParams.append('offset', params.offset.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());
          if (this.empresaId) queryParams.append('empresa_id', this.empresaId);

          console.log('FocusProdutoService: Buscando NCMs via API route...');

          // Usar API route local para evitar CORS
          const response = await fetch(`/api/focus/ncms?${queryParams}`, {
        method: 'GET',
        headers: {
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              console.log(`FocusProdutoService: Recebidos ${result.data.length} NCMs da fonte ${result.source}`);
              return {
                success: true,
                data: result.data.map((item: any) => ({
                  codigo: item.codigo,
                  descricao_completa: item.descricao_completa,
                  capitulo: item.capitulo,
                  posicao: item.posicao,
                  subposicao1: item.subposicao1,
                  subposicao2: item.subposicao2,
                  item1: item.item1,
                  item2: item.item2,
                  valid: true
                })),
                totalCount: result.totalCount,
                source: result.source
              };
            } else if (this.empresaId && result?.error) {
              return { success: false, error: result.error } as any;
            }
          } else {
            console.warn('FocusProdutoService: Erro na resposta da API route NCM:', response.status);
          }
        } catch (error) {
          console.warn('FocusProdutoService: Erro na busca NCM via API route:', error);
        }
      } else {
        console.log('FocusProdutoService: Usando dados locais (API não configurada)');
      }

      return this.buscarNCMsLocal(params);
    } catch (error) {
      console.error('FocusProdutoService: Erro na busca de NCMs:', error);
      return {
        success: false,
        error: 'Erro na busca de NCMs'
      };
    }
  }

  private buscarNCMsLocal(params: FocusSearchParams): FocusNCMResponse {
    // Base de dados local para fallback
    const ncmsLocais = [
      {
        codigo: '85171200',
        descricao_completa: 'Telefones celulares e outros equipamentos de comunicação',
        capitulo: '85',
        posicao: '17',
        subposicao1: '1',
        subposicao2: '2',
        item1: '0',
        item2: '0',
        valid: true
      },
      {
        codigo: '84713000',
        descricao_completa: 'Máquinas de processamento de dados e suas unidades',
        capitulo: '84',
        posicao: '71',
        subposicao1: '3',
        subposicao2: '0',
        item1: '0',
        item2: '0',
        valid: true
      },
      {
        codigo: '90049090',
        descricao_completa: 'Óculos para correção, proteção ou outros fins, e artigos semelhantes',
        capitulo: '90',
        posicao: '04',
        subposicao1: '9',
        subposicao2: '0',
        item1: '9',
        item2: '0',
        valid: true
      }
    ];

    let resultados = ncmsLocais;

    // Aplicar filtros
    if (params.codigo) {
      resultados = resultados.filter(ncm => 
        ncm.codigo.includes(params.codigo!)
      );
    }

    if (params.descricao) {
      resultados = resultados.filter(ncm => 
        ncm.descricao_completa.toLowerCase().includes(params.descricao!.toLowerCase())
      );
    }

    if (params.capitulo) {
      resultados = resultados.filter(ncm => 
        ncm.capitulo === params.capitulo
      );
    }

    return {
      success: true,
      data: resultados,
      totalCount: resultados.length
    };
  }

  // ===== CONSULTA DE CFOP =====
  async consultarCFOP(codigoCFOP: string): Promise<FocusCFOPResponse> {
    try {
      if (this.useApi && this.apiToken) {
        try {
          // Usar API route local para evitar CORS
          const url = this.empresaId 
            ? `/api/focus/cfops/${codigoCFOP}?empresa_id=${this.empresaId}`
            : `/api/focus/cfops/${codigoCFOP}`;
          
          const response = await fetch(url, {
        method: 'GET',
        headers: {
              'Content-Type': 'application/json',
            }
      });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
          return {
                success: true,
                data: [{
                  codigo: result.data.codigo,
                  descricao: result.data.descricao,
                  valid: true,
                  tipo: this.determinarTipoCFOP(result.data.codigo)
                }]
              };
            }
          }
        } catch (error) {
          console.warn('Erro na consulta CFOP via API route:', error);
        }
      }

      return this.consultarCFOPLocal(codigoCFOP);
    } catch (error) {
      return {
        success: false,
        error: 'Erro na consulta do CFOP'
      };
    }
  }

  private consultarCFOPLocal(codigoCFOP: string): FocusCFOPResponse {
    // Base de dados local para fallback
    const cfopsLocais: Record<string, any> = {
      '5101': {
        codigo: '5101',
        descricao: '5101 - Venda de produção do estabelecimento',
        valid: true,
        tipo: 'SAIDA' as const
      },
      '5102': {
        codigo: '5102',
        descricao: '5102 - Venda de mercadoria adquirida ou recebida de terceiros',
        valid: true,
        tipo: 'SAIDA' as const
      },
      '1101': {
        codigo: '1101',
        descricao: '1101 - Compra para industrialização',
        valid: true,
        tipo: 'ENTRADA' as const
      },
      '1102': {
        codigo: '1102',
        descricao: '1102 - Compra para comercialização',
        valid: true,
        tipo: 'ENTRADA' as const
      }
    };

    const cfop = cfopsLocais[codigoCFOP];
    if (cfop) {
    return {
      success: true,
        data: [cfop]
      };
    }
    
    return {
      success: false,
      error: 'CFOP não encontrado'
    };
  }

  async buscarCFOPs(params: FocusCFOPSearchParams): Promise<FocusCFOPResponse> {
    try {
      if (this.useApi && this.apiToken) {
        try {
          const queryParams = new URLSearchParams();
          
          if (params.codigo) queryParams.append('codigo', params.codigo);
          if (params.descricao) queryParams.append('descricao', params.descricao);
          if (params.offset) queryParams.append('offset', params.offset.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());
          if (this.empresaId) queryParams.append('empresa_id', this.empresaId);

          console.log('FocusProdutoService: Buscando CFOPs via API route...');

          // Usar API route local para evitar CORS
          const response = await fetch(`/api/focus/cfops?${queryParams}`, {
        method: 'GET',
        headers: {
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              console.log(`FocusProdutoService: Recebidos ${result.data.length} CFOPs da fonte ${result.source}`);
              return {
                success: true,
                data: result.data.map((item: any) => ({
                  codigo: item.codigo,
                  descricao: item.descricao,
                  valid: true,
                  tipo: this.determinarTipoCFOP(item.codigo)
                })),
                totalCount: result.totalCount,
                source: result.source
              };
            } else if (this.empresaId && result?.error) {
              return { success: false, error: result.error } as any;
            }
          } else {
            console.warn('FocusProdutoService: Erro na resposta da API route CFOP:', response.status);
          }
        } catch (error) {
          console.warn('FocusProdutoService: Erro na busca CFOP via API route:', error);
        }
      } else {
        console.log('FocusProdutoService: Usando dados locais (API não configurada)');
      }

      return this.buscarCFOPsLocal(params);
    } catch (error) {
      console.error('FocusProdutoService: Erro na busca de CFOPs:', error);
      return {
        success: false,
        error: 'Erro na busca de CFOPs'
      };
    }
  }

  private buscarCFOPsLocal(params: FocusCFOPSearchParams): FocusCFOPResponse {
    // Base de dados local para fallback
    const cfopsLocais = [
      {
        codigo: '5101',
        descricao: '5101 - Venda de produção do estabelecimento',
        valid: true,
        tipo: 'SAIDA' as const
      },
      {
        codigo: '5102',
        descricao: '5102 - Venda de mercadoria adquirida ou recebida de terceiros',
        valid: true,
        tipo: 'SAIDA' as const
      },
      {
        codigo: '5103',
        descricao: '5103 - Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento',
        valid: true,
        tipo: 'SAIDA' as const
      },
      {
        codigo: '1101',
        descricao: '1101 - Compra para industrialização',
        valid: true,
        tipo: 'ENTRADA' as const
      },
      {
        codigo: '1102',
        descricao: '1102 - Compra para comercialização',
        valid: true,
        tipo: 'ENTRADA' as const
      },
      {
        codigo: '1103',
        descricao: '1103 - Compra para industrialização de produto sujeito ao regime de substituição tributária',
        valid: true,
        tipo: 'ENTRADA' as const
      },
      {
        codigo: '2151',
        descricao: '2151 - Transferência p/ industrialização ou produção rural',
        valid: true,
        tipo: 'ENTRADA' as const
      },
      {
        codigo: '2152',
        descricao: '2152 - Transferência p/ comercialização',
        valid: true,
        tipo: 'ENTRADA' as const
      }
    ];

    let resultados = cfopsLocais;

    // Aplicar filtros
    if (params.codigo) {
      resultados = resultados.filter(cfop => 
        cfop.codigo.includes(params.codigo!)
      );
    }

    if (params.descricao) {
      resultados = resultados.filter(cfop => 
        cfop.descricao.toLowerCase().includes(params.descricao!.toLowerCase())
      );
    }

    return {
      success: true,
      data: resultados,
      totalCount: resultados.length
    };
  }

  private determinarTipoCFOP(codigo: string): 'ENTRADA' | 'SAIDA' {
    const primeiroDigito = codigo.charAt(0);
    return ['1', '2', '3'].includes(primeiroDigito) ? 'ENTRADA' : 'SAIDA';
  }

  // ===== CONSULTA DE CST =====
  async buscarCSTs(tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS'): Promise<FocusCSTResponse> {
    try {
      // CSTs são baseados em legislação, não há API específica da FOCUS NFE
        return this.buscarCSTsLocal(tipo);
    } catch (error) {
      return {
        success: false,
        error: 'Erro na busca de CSTs'
      };
    }
  }

  private buscarCSTsLocal(tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS'): FocusCSTResponse {
    const cstsPorTipo: Record<string, any[]> = {
      ICMS: [
        { codigo: '00', descricao: '00 - Tributada integralmente', aplicavel: true },
        { codigo: '10', descricao: '10 - Tributada e com cobrança do ICMS por substituição tributária', aplicavel: true },
        { codigo: '20', descricao: '20 - Com redução de base de cálculo', aplicavel: true },
        { codigo: '30', descricao: '30 - Isenta ou não tributada e com cobrança do ICMS por substituição tributária', aplicavel: true },
        { codigo: '40', descricao: '40 - Isenta', aplicavel: true },
        { codigo: '41', descricao: '41 - Não tributada', aplicavel: true },
        { codigo: '50', descricao: '50 - Suspensão', aplicavel: true },
        { codigo: '51', descricao: '51 - Diferimento', aplicavel: true },
        { codigo: '60', descricao: '60 - ICMS cobrado anteriormente por substituição tributária', aplicavel: true },
        { codigo: '70', descricao: '70 - Com redução de base de cálculo e cobrança do ICMS por substituição tributária', aplicavel: true },
        { codigo: '90', descricao: '90 - Outras', aplicavel: true },
        // CSOSN (Simples Nacional)
        { codigo: '101', descricao: '101 - Tributada com permissão de crédito', aplicavel: true },
        { codigo: '102', descricao: '102 - Tributada sem permissão de crédito', aplicavel: true },
        { codigo: '103', descricao: '103 - Isenção do ICMS para faixa de receita bruta', aplicavel: true },
        { codigo: '201', descricao: '201 - Tributada com ST e com permissão de crédito', aplicavel: true },
        { codigo: '202', descricao: '202 - Tributada com ST sem permissão de crédito', aplicavel: true },
        { codigo: '203', descricao: '203 - Isenção do ICMS para faixa de receita bruta e com ST', aplicavel: true },
        { codigo: '300', descricao: '300 - Imune', aplicavel: true },
        { codigo: '400', descricao: '400 - Não tributada', aplicavel: true },
        { codigo: '500', descricao: '500 - ICMS cobrado anteriormente por ST ou por antecipação', aplicavel: true },
        { codigo: '900', descricao: '900 - Outros', aplicavel: true }
      ],
      IPI: [
        { codigo: '00', descricao: '00 - Entrada com recuperação de crédito', aplicavel: true },
        { codigo: '01', descricao: '01 - Entrada tributada com alíquota básica', aplicavel: true },
        { codigo: '02', descricao: '02 - Entrada tributada com alíquota diferenciada', aplicavel: true },
        { codigo: '03', descricao: '03 - Entrada tributada com alíquota por unidade de medida de produto', aplicavel: true },
        { codigo: '04', descricao: '04 - Entrada tributada com alíquota por unidade de medida de produto', aplicavel: true },
        { codigo: '05', descricao: '05 - Entrada sem tributação', aplicavel: true },
        { codigo: '49', descricao: '49 - Outras entradas', aplicavel: true },
        { codigo: '50', descricao: '50 - Saída tributada', aplicavel: true },
        { codigo: '51', descricao: '51 - Saída tributável com alíquota por unidade de medida de produto', aplicavel: true },
        { codigo: '52', descricao: '52 - Saída tributável com alíquota por unidade de medida de produto', aplicavel: true },
        { codigo: '53', descricao: '53 - Saída tributável com alíquota por unidade de medida de produto', aplicavel: true },
        { codigo: '54', descricao: '54 - Saída não tributada', aplicavel: true },
        { codigo: '55', descricao: '55 - Saída isenta', aplicavel: true },
        { codigo: '99', descricao: '99 - Outras saídas', aplicavel: true }
      ],
      PIS: [
        { codigo: '01', descricao: '01 - Operação tributável (base de cálculo = valor da operação alíquota normal (cumulativo/não cumulativo))', aplicavel: true },
        { codigo: '02', descricao: '02 - Operação tributável (base de cálculo = valor da operação (alíquota diferenciada))', aplicavel: true },
        { codigo: '03', descricao: '03 - Operação tributável (base de cálculo = quantidade vendida × alíquota por unidade de produto)', aplicavel: true },
        { codigo: '04', descricao: '04 - Operação tributável (tributação monofásica (alíquota zero))', aplicavel: true },
        { codigo: '05', descricao: '05 - Operação tributável (substituição tributária)', aplicavel: true },
        { codigo: '06', descricao: '06 - Operação tributável (alíquota zero)', aplicavel: true },
        { codigo: '07', descricao: '07 - Operação isenta da contribuição', aplicavel: true },
        { codigo: '08', descricao: '08 - Operação sem incidência da contribuição', aplicavel: true },
        { codigo: '09', descricao: '09 - Operação com suspensão da contribuição', aplicavel: true },
        { codigo: '49', descricao: '49 - Outras operações de saída', aplicavel: true },
        { codigo: '50', descricao: '50 - Operação com direito a crédito - vinculada exclusivamente a receita tributada no mercado interno', aplicavel: true },
        { codigo: '51', descricao: '51 - Operação com direito a crédito - vinculada exclusivamente a receita não tributada no mercado interno', aplicavel: true },
        { codigo: '52', descricao: '52 - Operação com direito a crédito - vinculada exclusivamente a receita de exportação', aplicavel: true },
        { codigo: '53', descricao: '53 - Operação com direito a crédito - vinculada a receitas tributadas e não-tributadas no mercado interno', aplicavel: true },
        { codigo: '54', descricao: '54 - Operação com direito a crédito - vinculada a receitas tributadas no mercado interno e de exportação', aplicavel: true },
        { codigo: '55', descricao: '55 - Operação com direito a crédito - vinculada a receitas não-tributadas no mercado interno e de exportação', aplicavel: true },
        { codigo: '56', descricao: '56 - Operação com direito a crédito - vinculada a receitas tributadas e não-tributadas no mercado interno, e de exportação', aplicavel: true },
        { codigo: '60', descricao: '60 - Crédito presunto - operação de aquisição vinculada exclusivamente a receita tributada no mercado interno', aplicavel: true },
        { codigo: '61', descricao: '61 - Crédito presunto - operação de aquisição vinculada exclusivamente a receita não-tributada no mercado interno', aplicavel: true },
        { codigo: '62', descricao: '62 - Crédito presunto - operação de aquisição vinculada exclusivamente a receita de exportação', aplicavel: true },
        { codigo: '63', descricao: '63 - Crédito presunto - operação de aquisição vinculada a receitas tributadas e não-tributadas no mercado interno', aplicavel: true },
        { codigo: '64', descricao: '64 - Crédito presunto - operação de aquisição vinculada a receitas tributadas no mercado interno e de exportação', aplicavel: true },
        { codigo: '65', descricao: '65 - Crédito presunto - operação de aquisição vinculada a receitas não-tributadas no mercado interno e de exportação', aplicavel: true },
        { codigo: '66', descricao: '66 - Crédito presunto - operação de aquisição vinculada a receitas tributadas e não-tributadas no mercado interno, e de exportação', aplicavel: true },
        { codigo: '67', descricao: '67 - Crédito presunto - outras operações', aplicavel: true },
        { codigo: '70', descricao: '70 - Operação de aquisição sem direito a crédito', aplicavel: true },
        { codigo: '71', descricao: '71 - Operação de aquisição com isenção', aplicavel: true },
        { codigo: '72', descricao: '72 - Operação de aquisição com suspensão', aplicavel: true },
        { codigo: '73', descricao: '73 - Operação de aquisição a alíquota zero', aplicavel: true },
        { codigo: '74', descricao: '74 - Operação de aquisição sem incidência da contribuição', aplicavel: true },
        { codigo: '75', descricao: '75 - Operação de aquisição por substituição tributária', aplicavel: true },
        { codigo: '98', descricao: '98 - Outras operações de entrada', aplicavel: true },
        { codigo: '99', descricao: '99 - Outras operações', aplicavel: true }
      ],
      COFINS: [
        { codigo: '01', descricao: '01 - Operação tributável (base de cálculo = valor da operação alíquota normal (cumulativo/não cumulativo))', aplicavel: true },
        { codigo: '02', descricao: '02 - Operação tributável (base de cálculo = valor da operação (alíquota diferenciada))', aplicavel: true },
        { codigo: '03', descricao: '03 - Operação tributável (base de cálculo = quantidade vendida × alíquota por unidade de produto)', aplicavel: true },
        { codigo: '04', descricao: '04 - Operação tributável (tributação monofásica (alíquota zero))', aplicavel: true },
        { codigo: '05', descricao: '05 - Operação tributável (substituição tributária)', aplicavel: true },
        { codigo: '06', descricao: '06 - Operação tributável (alíquota zero)', aplicavel: true },
        { codigo: '07', descricao: '07 - Operação isenta da contribuição', aplicavel: true },
        { codigo: '08', descricao: '08 - Operação sem incidência da contribuição', aplicavel: true },
        { codigo: '09', descricao: '09 - Operação com suspensão da contribuição', aplicavel: true },
        { codigo: '49', descricao: '49 - Outras operações de saída', aplicavel: true },
        { codigo: '50', descricao: '50 - Operação com direito a crédito - vinculada exclusivamente a receita tributada no mercado interno', aplicavel: true },
        { codigo: '51', descricao: '51 - Operação com direito a crédito - vinculada exclusivamente a receita não tributada no mercado interno', aplicavel: true },
        { codigo: '52', descricao: '52 - Operação com direito a crédito - vinculada exclusivamente a receita de exportação', aplicavel: true },
        { codigo: '53', descricao: '53 - Operação com direito a crédito - vinculada a receitas tributadas e não-tributadas no mercado interno', aplicavel: true },
        { codigo: '54', descricao: '54 - Operação com direito a crédito - vinculada a receitas tributadas no mercado interno e de exportação', aplicavel: true },
        { codigo: '55', descricao: '55 - Operação com direito a crédito - vinculada a receitas não-tributadas no mercado interno e de exportação', aplicavel: true },
        { codigo: '56', descricao: '56 - Operação com direito a crédito - vinculada a receitas tributadas e não-tributadas no mercado interno, e de exportação', aplicavel: true },
        { codigo: '60', descricao: '60 - Crédito presunto - operação de aquisição vinculada exclusivamente a receita tributada no mercado interno', aplicavel: true },
        { codigo: '61', descricao: '61 - Crédito presunto - operação de aquisição vinculada exclusivamente a receita não-tributada no mercado interno', aplicavel: true },
        { codigo: '62', descricao: '62 - Crédito presunto - operação de aquisição vinculada exclusivamente a receita de exportação', aplicavel: true },
        { codigo: '63', descricao: '63 - Crédito presunto - operação de aquisição vinculada a receitas tributadas e não-tributadas no mercado interno', aplicavel: true },
        { codigo: '64', descricao: '64 - Crédito presunto - operação de aquisição vinculada a receitas tributadas no mercado interno e de exportação', aplicavel: true },
        { codigo: '65', descricao: '65 - Crédito presunto - operação de aquisição vinculada a receitas não-tributadas no mercado interno e de exportação', aplicavel: true },
        { codigo: '66', descricao: '66 - Crédito presunto - operação de aquisição vinculada a receitas tributadas e não-tributadas no mercado interno, e de exportação', aplicavel: true },
        { codigo: '67', descricao: '67 - Crédito presunto - outras operações', aplicavel: true },
        { codigo: '70', descricao: '70 - Operação de aquisição sem direito a crédito', aplicavel: true },
        { codigo: '71', descricao: '71 - Operação de aquisição com isenção', aplicavel: true },
        { codigo: '72', descricao: '72 - Operação de aquisição com suspensão', aplicavel: true },
        { codigo: '73', descricao: '73 - Operação de aquisição a alíquota zero', aplicavel: true },
        { codigo: '74', descricao: '74 - Operação de aquisição sem incidência da contribuição', aplicavel: true },
        { codigo: '75', descricao: '75 - Operação de aquisição por substituição tributária', aplicavel: true },
        { codigo: '98', descricao: '98 - Outras operações de entrada', aplicavel: true },
        { codigo: '99', descricao: '99 - Outras operações', aplicavel: true }
      ]
    };

    return {
      success: true,
      data: cstsPorTipo[tipo] || []
    };
  }
}

export const focusProdutoService = new FocusProdutoService();

// Função para criar instância com empresa específica
export function createFocusProdutoService(empresaId?: string): FocusProdutoService {
  return new FocusProdutoService(empresaId);
}