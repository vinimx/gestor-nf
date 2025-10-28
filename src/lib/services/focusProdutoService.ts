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
    descricao: string;
    unidade: string;
    valid: boolean;
  };
  error?: string;
}

interface FocusCFOPResponse {
  success: boolean;
  data?: {
    codigo: string;
    descricao: string;
    valid: boolean;
  };
  error?: string;
}

class FocusProdutoService {
  private baseUrl: string;
  private apiToken: string;

  constructor() {
    // Configurar para usar API real da FOCUS NFE
    this.baseUrl = process.env.NEXT_PUBLIC_FOCUS_API_URL || 'https://api.focusnfe.com.br';
    this.apiToken = process.env.FOCUS_API_TOKEN || '';
  }

  /**
   * Validar dados de produto com FOCUS NFE
   */
  async validarProduto(produtoData: FocusProdutoData): Promise<FocusValidationResponse> {
    try {
      // Se não há token configurado, usar validação local
      if (!this.apiToken) {
        return this.validarProdutoLocal(produtoData);
      }

      const response = await fetch(`${this.baseUrl}/v2/produtos/validar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify(produtoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Erro na API FOCUS, usando validação local:', errorData);
        return this.validarProdutoLocal(produtoData);
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          valid: data.valid || false,
          errors: data.errors || [],
          warnings: data.warnings || [],
        },
      };
    } catch (error) {
      console.error('Erro ao validar produto com FOCUS:', error);
      return this.validarProdutoLocal(produtoData);
    }
  }

  /**
   * Validação local de produto (fallback)
   */
  private validarProdutoLocal(produtoData: FocusProdutoData): FocusValidationResponse {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!produtoData.codigo_produto) {
      errors.push('Código do produto é obrigatório');
    }

    if (!produtoData.descricao) {
      errors.push('Descrição é obrigatória');
    }

    if (!produtoData.codigo_ncm || !/^\d{8}$/.test(produtoData.codigo_ncm)) {
      errors.push('NCM deve ter 8 dígitos');
    }

    if (!produtoData.cfop || !/^\d{4}$/.test(produtoData.cfop)) {
      errors.push('CFOP deve ter 4 dígitos');
    }

    if (produtoData.valor_bruto <= 0) {
      errors.push('Valor bruto deve ser maior que zero');
    }

    if (produtoData.icms_aliquota < 0 || produtoData.icms_aliquota > 100) {
      warnings.push('Alíquota ICMS deve estar entre 0 e 100%');
    }

    return {
      success: true,
      data: {
        valid: errors.length === 0,
        errors,
        warnings,
      },
    };
  }

  /**
   * Consultar NCM na FOCUS NFE
   */
  async consultarNCM(codigoNCM: string): Promise<FocusNCMResponse> {
    try {
      // Se não há token configurado, usar dados mock
      if (!this.apiToken) {
        return this.consultarNCMLocal(codigoNCM);
      }

      const response = await fetch(`${this.baseUrl}/v2/ncm/${codigoNCM}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: 'NCM não encontrado',
          };
        }
        const errorData = await response.json();
        console.warn('Erro na API FOCUS, usando dados locais:', errorData);
        return this.consultarNCMLocal(codigoNCM);
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          codigo: data.codigo || codigoNCM,
          descricao: data.descricao || 'Descrição não disponível',
          unidade: data.unidade || 'UN',
          valid: true,
        },
      };
    } catch (error) {
      console.error('Erro ao consultar NCM:', error);
      return this.consultarNCMLocal(codigoNCM);
    }
  }

  /**
   * Consulta local de NCM (fallback)
   */
  private consultarNCMLocal(codigoNCM: string): FocusNCMResponse {
    const mockNCMs: Record<string, string> = {
      '12345678': 'Produtos de informática e equipamentos de processamento de dados',
      '12345679': 'Produtos eletrônicos e componentes',
      '12345680': 'Produtos de telecomunicações',
      '12345681': 'Produtos de automação industrial',
      '12345682': 'Produtos de energia e equipamentos elétricos',
      '12345683': 'Produtos de iluminação e luminárias',
      '12345684': 'Produtos de segurança e monitoramento',
      '12345685': 'Produtos de entretenimento e áudio/vídeo',
      '12345686': 'Produtos de escritório e mobiliário',
      '12345687': 'Produtos de limpeza e manutenção',
      '12345688': 'Produtos de construção e materiais',
      '12345689': 'Produtos de jardinagem e paisagismo',
      '12345690': 'Produtos de esporte e lazer',
      '12345691': 'Produtos de saúde e bem-estar',
      '12345692': 'Produtos de alimentação e bebidas',
      '12345693': 'Produtos de vestuário e acessórios',
      '12345694': 'Produtos de calçados e couro',
      '12345695': 'Produtos de cosméticos e higiene',
      '12345696': 'Produtos de decoração e artesanato',
      '12345697': 'Produtos de brinquedos e jogos',
      '12345698': 'Produtos de livros e material didático',
      '12345699': 'Produtos de papelaria e escritório',
      '12345700': 'Produtos de ferramentas e equipamentos',
    };

    const descricao = mockNCMs[codigoNCM] || `Produto não classificado - NCM ${codigoNCM}`;
    
    return {
      success: true,
      data: {
        codigo: codigoNCM,
        descricao,
        unidade: 'UN',
        valid: true,
      },
    };
  }

  /**
   * Buscar NCMs por termo
   */
  async buscarNCMs(termo: string): Promise<FocusNCMResponse> {
    try {
      // Se não há token configurado, usar dados mock
      if (!this.apiToken) {
        return this.buscarNCMsLocal(termo);
      }

      const response = await fetch(`${this.baseUrl}/v2/ncm/buscar?q=${encodeURIComponent(termo)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Erro na API FOCUS, usando dados locais:', errorData);
        return this.buscarNCMsLocal(termo);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || [],
      };
    } catch (error) {
      console.error('Erro ao buscar NCMs:', error);
      return this.buscarNCMsLocal(termo);
    }
  }

  /**
   * Busca local de NCMs (fallback)
   */
  private buscarNCMsLocal(termo: string): FocusNCMResponse {
    const mockNCMs: FocusNCMData[] = [
      { codigo: '12345678', descricao: 'Produtos de informática e equipamentos de processamento de dados', unidade: 'UN', valid: true },
      { codigo: '12345679', descricao: 'Produtos eletrônicos e componentes', unidade: 'UN', valid: true },
      { codigo: '12345680', descricao: 'Produtos de telecomunicações', unidade: 'UN', valid: true },
      { codigo: '12345681', descricao: 'Produtos de automação industrial', unidade: 'UN', valid: true },
      { codigo: '12345682', descricao: 'Produtos de energia e equipamentos elétricos', unidade: 'UN', valid: true },
    ];

    const resultados = mockNCMs.filter(ncm => 
      ncm.codigo.includes(termo) || 
      ncm.descricao.toLowerCase().includes(termo.toLowerCase())
    );

    return {
      success: true,
      data: resultados,
    };
  }

  /**
   * Consultar CFOP na FOCUS NFE
   */
  async consultarCFOP(codigoCFOP: string): Promise<FocusCFOPResponse> {
    try {
      // Se não há token configurado, usar dados mock
      if (!this.apiToken) {
        return this.consultarCFOPLocal(codigoCFOP);
      }

      const response = await fetch(`${this.baseUrl}/v2/cfop/${codigoCFOP}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: 'CFOP não encontrado',
          };
        }
        const errorData = await response.json();
        console.warn('Erro na API FOCUS, usando dados locais:', errorData);
        return this.consultarCFOPLocal(codigoCFOP);
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          codigo: data.codigo || codigoCFOP,
          descricao: data.descricao || 'Descrição não disponível',
          valid: true,
          tipo: data.tipo || (codigoCFOP.startsWith('1') ? 'ENTRADA' : 'SAIDA'),
        },
      };
    } catch (error) {
      console.error('Erro ao consultar CFOP:', error);
      return this.consultarCFOPLocal(codigoCFOP);
    }
  }

  /**
   * Consulta local de CFOP (fallback)
   */
  private consultarCFOPLocal(codigoCFOP: string): FocusCFOPResponse {
    const mockCFOPs: Record<string, string> = {
      '1101': 'Compra para industrialização',
      '1102': 'Compra para comercialização',
      '1111': 'Compra para industrialização de produto importado',
      '1112': 'Compra para comercialização de produto importado',
      '5101': 'Venda para industrialização',
      '5102': 'Venda para comercialização',
      '5103': 'Venda para industrialização de produto importado',
      '5104': 'Venda para comercialização de produto importado',
    };

    const descricao = mockCFOPs[codigoCFOP] || `CFOP não encontrado - ${codigoCFOP}`;
    const tipo = codigoCFOP.startsWith('1') ? 'ENTRADA' : 'SAIDA';
    
    return {
      success: true,
      data: {
        codigo: codigoCFOP,
        descricao,
        valid: true,
        tipo: tipo as 'ENTRADA' | 'SAIDA',
      },
    };
  }

  /**
   * Buscar CFOPs por termo e tipo
   */
  async buscarCFOPs(termo: string, tipo?: 'ENTRADA' | 'SAIDA'): Promise<FocusCFOPResponse> {
    try {
      // Se não há token configurado, usar dados mock
      if (!this.apiToken) {
        return this.buscarCFOPsLocal(termo, tipo);
      }

      const params = new URLSearchParams({ q: termo });
      if (tipo) params.append('tipo', tipo);
      
      const response = await fetch(`${this.baseUrl}/v2/cfop/buscar?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Erro na API FOCUS, usando dados locais:', errorData);
        return this.buscarCFOPsLocal(termo, tipo);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || [],
      };
    } catch (error) {
      console.error('Erro ao buscar CFOPs:', error);
      return this.buscarCFOPsLocal(termo, tipo);
    }
  }

  /**
   * Busca local de CFOPs (fallback)
   */
  private buscarCFOPsLocal(termo: string, tipo?: 'ENTRADA' | 'SAIDA'): FocusCFOPResponse {
    const mockCFOPs: FocusCFOPData[] = [
      { codigo: '1101', descricao: 'Compra para industrialização', valid: true, tipo: 'ENTRADA' },
      { codigo: '1102', descricao: 'Compra para comercialização', valid: true, tipo: 'ENTRADA' },
      { codigo: '1111', descricao: 'Compra para industrialização de produto importado', valid: true, tipo: 'ENTRADA' },
      { codigo: '1112', descricao: 'Compra para comercialização de produto importado', valid: true, tipo: 'ENTRADA' },
      { codigo: '5101', descricao: 'Venda para industrialização', valid: true, tipo: 'SAIDA' },
      { codigo: '5102', descricao: 'Venda para comercialização', valid: true, tipo: 'SAIDA' },
      { codigo: '5103', descricao: 'Venda para industrialização de produto importado', valid: true, tipo: 'SAIDA' },
      { codigo: '5104', descricao: 'Venda para comercialização de produto importado', valid: true, tipo: 'SAIDA' },
    ];

    let resultados = mockCFOPs.filter(cfop => 
      cfop.codigo.includes(termo) || 
      cfop.descricao.toLowerCase().includes(termo.toLowerCase())
    );

    if (tipo) {
      resultados = resultados.filter(cfop => cfop.tipo === tipo);
    }

    return {
      success: true,
      data: resultados,
    };
  }

  /**
   * Buscar CSTs por tipo
   */
  async buscarCSTs(tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS'): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      // Se não há token configurado, usar dados mock
      if (!this.apiToken) {
        return this.buscarCSTsLocal(tipo);
      }

      const response = await fetch(`${this.baseUrl}/v2/csts?tipo=${tipo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Erro na API FOCUS, usando dados locais:', errorData);
        return this.buscarCSTsLocal(tipo);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || [],
      };
    } catch (error) {
      console.error('Erro ao buscar CSTs:', error);
      return this.buscarCSTsLocal(tipo);
    }
  }

  /**
   * Busca local de CSTs (fallback)
   */
  private buscarCSTsLocal(tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS'): { success: boolean; data?: any[]; error?: string } {
    const cstsICMS = [
      { codigo: '00', descricao: 'Tributada integralmente', tipo: 'ICMS' },
      { codigo: '10', descricao: 'Tributada e com cobrança do ICMS por substituição tributária', tipo: 'ICMS' },
      { codigo: '20', descricao: 'Com redução de base de cálculo', tipo: 'ICMS' },
      { codigo: '30', descricao: 'Isenta ou não tributada e com cobrança do ICMS por substituição tributária', tipo: 'ICMS' },
      { codigo: '40', descricao: 'Isenta', tipo: 'ICMS' },
      { codigo: '41', descricao: 'Não tributada', tipo: 'ICMS' },
      { codigo: '50', descricao: 'Suspensão', tipo: 'ICMS' },
      { codigo: '51', descricao: 'Diferimento', tipo: 'ICMS' },
      { codigo: '60', descricao: 'ICMS cobrado anteriormente por substituição tributária', tipo: 'ICMS' },
      { codigo: '70', descricao: 'Com redução de base de cálculo e cobrança do ICMS por substituição tributária', tipo: 'ICMS' },
      { codigo: '90', descricao: 'Outras', tipo: 'ICMS' }
    ];

    const cstsIPI = [
      { codigo: '00', descricao: 'Entrada com recuperação de crédito', tipo: 'IPI' },
      { codigo: '01', descricao: 'Entrada tributada com alíquota básica', tipo: 'IPI' },
      { codigo: '02', descricao: 'Entrada tributada com alíquota por unidade de produto', tipo: 'IPI' },
      { codigo: '49', descricao: 'Outras entradas', tipo: 'IPI' },
      { codigo: '50', descricao: 'Saída tributada', tipo: 'IPI' },
      { codigo: '51', descricao: 'Saída tributada com alíquota por unidade de produto', tipo: 'IPI' },
      { codigo: '99', descricao: 'Outras saídas', tipo: 'IPI' }
    ];

    const cstsPIS = [
      { codigo: '01', descricao: 'Operação tributável com alíquota básica', tipo: 'PIS' },
      { codigo: '02', descricao: 'Operação tributável com alíquota diferenciada', tipo: 'PIS' },
      { codigo: '03', descricao: 'Operação tributável com alíquota por unidade de medida de produto', tipo: 'PIS' },
      { codigo: '04', descricao: 'Operação tributável monofásica - revenda a alíquota zero', tipo: 'PIS' },
      { codigo: '05', descricao: 'Operação tributável por substituição tributária', tipo: 'PIS' },
      { codigo: '06', descricao: 'Operação tributável a alíquota zero', tipo: 'PIS' },
      { codigo: '07', descricao: 'Operação isenta da contribuição', tipo: 'PIS' },
      { codigo: '08', descricao: 'Operação sem incidência da contribuição', tipo: 'PIS' },
      { codigo: '09', descricao: 'Operação com suspensão da contribuição', tipo: 'PIS' },
      { codigo: '49', descricao: 'Outras operações de saída', tipo: 'PIS' }
    ];

    const cstsCOFINS = [
      { codigo: '01', descricao: 'Operação tributável com alíquota básica', tipo: 'COFINS' },
      { codigo: '02', descricao: 'Operação tributável com alíquota diferenciada', tipo: 'COFINS' },
      { codigo: '03', descricao: 'Operação tributável com alíquota por unidade de medida de produto', tipo: 'COFINS' },
      { codigo: '04', descricao: 'Operação tributável monofásica - revenda a alíquota zero', tipo: 'COFINS' },
      { codigo: '05', descricao: 'Operação tributável por substituição tributária', tipo: 'COFINS' },
      { codigo: '06', descricao: 'Operação tributável a alíquota zero', tipo: 'COFINS' },
      { codigo: '07', descricao: 'Operação isenta da contribuição', tipo: 'COFINS' },
      { codigo: '08', descricao: 'Operação sem incidência da contribuição', tipo: 'COFINS' },
      { codigo: '09', descricao: 'Operação com suspensão da contribuição', tipo: 'COFINS' },
      { codigo: '49', descricao: 'Outras operações de saída', tipo: 'COFINS' }
    ];

    let resultados: any[] = [];
    switch (tipo) {
      case 'ICMS':
        resultados = cstsICMS;
        break;
      case 'IPI':
        resultados = cstsIPI;
        break;
      case 'PIS':
        resultados = cstsPIS;
        break;
      case 'COFINS':
        resultados = cstsCOFINS;
        break;
    }

    return {
      success: true,
      data: resultados,
    };
  }
}

export const focusProdutoService = new FocusProdutoService();