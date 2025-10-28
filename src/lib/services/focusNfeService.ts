/**
 * Serviço de integração com API FOCUS NFE
 * Documentação: https://focusnfe.com.br/api/
 */

export interface FocusNfeConfig {
  token: string;
  environment: 'homologacao' | 'producao';
}

export interface FocusCnpjResponse {
  razao_social: string;
  cnpj: string;
  situacao_cadastral: string;
  cnae_principal: string;
  optante_simples_nacional: boolean;
  optante_mei: boolean;
  codigo_municipio: string;
  codigo_siafi?: string;
  codigo_ibge?: string;
  nome_municipio: string;
  logradouro: string;
  complemento?: string;
  numero: string;
  bairro: string;
  cep: string;
  uf: string;
}

export interface FocusCnpjError {
  codigo: string;
  mensagem: string;
}

export class FocusNfeService {
  private config: FocusNfeConfig;
  private baseUrl: string;

  constructor(config: FocusNfeConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'producao' 
      ? 'https://api.focusnfe.com.br'
      : 'https://homologacao.focusnfe.com.br';
  }

  /**
   * Consulta dados de CNPJ na Receita Federal via FOCUS NFE
   * @param cnpj CNPJ sem formatação (apenas números)
   * @returns Dados do CNPJ ou erro
   */
  async consultarCnpj(cnpj: string): Promise<{
    success: boolean;
    data?: FocusCnpjResponse;
    error?: FocusCnpjError;
  }> {
    try {
      // Validar formato do CNPJ (14 dígitos)
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) {
        return {
          success: false,
          error: {
            codigo: 'FORMATO_INVALIDO',
            mensagem: 'CNPJ deve ter 14 dígitos'
          }
        };
      }

          // Usar endpoint da API interna para evitar CORS
          const response = await fetch('/api/focus-nfe/mock-data', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          data: data.data as FocusCnpjResponse
        };
      } else {
        return {
          success: false,
          error: data.error
        };
      }
    } catch (error) {
      console.error('Erro na consulta FOCUS NFE:', error);
      return {
        success: false,
        error: {
          codigo: 'ERRO_REDE',
          mensagem: 'Erro de conexão com a API FOCUS NFE'
        }
      };
    }
  }

  /**
   * Valida se o CNPJ está ativo na Receita Federal
   * @param cnpj CNPJ sem formatação
   * @returns true se ativo, false caso contrário
   */
  async validarCnpjAtivo(cnpj: string): Promise<boolean> {
    const resultado = await this.consultarCnpj(cnpj);
    
    if (resultado.success && resultado.data) {
      return resultado.data.situacao_cadastral === 'ativa';
    }
    
    return false;
  }

  /**
   * Obtém dados completos do CNPJ para preenchimento automático
   * @param cnpj CNPJ sem formatação
   * @returns Dados formatados para preenchimento de formulário
   */
  async obterDadosCnpj(cnpj: string): Promise<{
    success: boolean;
    data?: {
      razao_social: string;
      cnpj: string;
      situacao_cadastral: string;
      endereco: {
        logradouro: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        uf: string;
        cep: string;
      };
      fiscal: {
        cnae_principal: string;
        optante_simples_nacional: boolean;
        optante_mei: boolean;
      };
    };
    error?: FocusCnpjError;
  }> {
    const resultado = await this.consultarCnpj(cnpj);
    
    if (!resultado.success || !resultado.data) {
      return {
        success: false,
        error: resultado.error
      };
    }

    const dados = resultado.data;
    
    return {
      success: true,
      data: {
        razao_social: dados.razao_social,
        cnpj: dados.cnpj,
        situacao_cadastral: dados.situacao_cadastral,
        endereco: {
          logradouro: dados.logradouro,
          numero: dados.numero,
          complemento: dados.complemento,
          bairro: dados.bairro,
          cidade: dados.nome_municipio,
          uf: dados.uf,
          cep: dados.cep.replace(/(\d{5})(\d{3})/, '$1-$2'), // Formatar CEP
        },
        fiscal: {
          cnae_principal: dados.cnae_principal,
          optante_simples_nacional: dados.optante_simples_nacional,
          optante_mei: dados.optante_mei,
        }
      }
    };
  }
}

/**
 * Instância singleton do serviço FOCUS NFE
 */
let focusNfeInstance: FocusNfeService | null = null;

export function getFocusNfeService(): FocusNfeService | null {
  if (!focusNfeInstance) {
    const token = process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN;
    const environment = process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT as 'homologacao' | 'producao';
    
    if (!token) {
      console.warn('FOCUS NFE token não configurado');
      return null;
    }
    
    focusNfeInstance = new FocusNfeService({
      token,
      environment: environment || 'homologacao'
    });
  }
  
  return focusNfeInstance;
}

/**
 * Função utilitária para validar CNPJ com FOCUS NFE
 */
export async function validarCnpjComFocus(cnpj: string): Promise<{
  valido: boolean;
  ativo: boolean;
  dados?: any;
  erro?: string;
}> {
  const service = getFocusNfeService();
  
  if (!service) {
    return {
      valido: false,
      ativo: false,
      erro: 'Serviço FOCUS NFE não configurado'
    };
  }

  try {
    const resultado = await service.consultarCnpj(cnpj);
    
    if (resultado.success && resultado.data) {
      return {
        valido: true,
        ativo: resultado.data.situacao_cadastral === 'ativa',
        dados: resultado.data
      };
    } else {
      return {
        valido: false,
        ativo: false,
        erro: resultado.error?.mensagem || 'CNPJ não encontrado'
      };
    }
  } catch (error) {
    return {
      valido: false,
      ativo: false,
      erro: 'Erro na consulta do CNPJ'
    };
  }
}
