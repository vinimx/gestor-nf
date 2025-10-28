/**
 * Serviço de validação híbrido para CPF/CNPJ
 * Combina validação matemática local com API FOCUS NFE para CNPJ
 */

import { validarCPF, validarCNPJ } from './clienteSchema';
import { validarCnpjComFocus } from '../services/focusNfeService';

export interface ValidationResult {
  valido: boolean;
  ativo?: boolean;
  dados?: any;
  erro?: string;
  fonte: 'local' | 'api' | 'hibrido';
}

export interface ValidationOptions {
  usarApi?: boolean;
  timeout?: number;
  fallbackLocal?: boolean;
}

export class CPFCNPJValidationService {
  private options: ValidationOptions;

  constructor(options: ValidationOptions = {}) {
    this.options = {
      usarApi: true,
      timeout: 5000, // 5 segundos
      fallbackLocal: true,
      ...options
    };
  }

  /**
   * Valida CPF (apenas validação matemática local)
   * @param cpf CPF com ou sem formatação
   * @returns Resultado da validação
   */
  async validarCPF(cpf: string): Promise<ValidationResult> {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) {
      return {
        valido: false,
        erro: 'CPF deve ter 11 dígitos',
        fonte: 'local'
      };
    }

    const valido = validarCPF(cpf);
    
    return {
      valido,
      erro: valido ? undefined : 'CPF inválido',
      fonte: 'local'
    };
  }

  /**
   * Valida CNPJ com estratégia híbrida
   * 1. Tenta validação via API FOCUS NFE
   * 2. Se falhar, usa validação matemática local
   * @param cnpj CNPJ com ou sem formatação
   * @returns Resultado da validação
   */
  async validarCNPJ(cnpj: string): Promise<ValidationResult> {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
      return {
        valido: false,
        erro: 'CNPJ deve ter 14 dígitos',
        fonte: 'local'
      };
    }

    // Primeiro: validação matemática local (rápida)
    const validoLocal = validarCNPJ(cnpj);
    
    if (!validoLocal) {
      return {
        valido: false,
        erro: 'CNPJ inválido',
        fonte: 'local'
      };
    }

    // Se não deve usar API, retorna validação local
    if (!this.options.usarApi) {
      return {
        valido: true,
        fonte: 'local'
      };
    }

    // Segundo: tentar validação via API FOCUS NFE
    try {
      const resultadoApi = await this.validarComTimeout(
        () => validarCnpjComFocus(cnpjLimpo),
        this.options.timeout!
      );

      if (resultadoApi.valido) {
        return {
          valido: true,
          ativo: resultadoApi.ativo,
          dados: resultadoApi.dados,
          fonte: 'api'
        };
      } else {
        // Se API falhou mas validação local passou, usar local como fallback
        if (this.options.fallbackLocal) {
          return {
            valido: true,
            erro: `CNPJ válido (API indisponível: ${resultadoApi.erro})`,
            fonte: 'hibrido'
          };
        } else {
          return {
            valido: false,
            erro: resultadoApi.erro,
            fonte: 'api'
          };
        }
      }
    } catch (error) {
      // Timeout ou erro de rede
      if (this.options.fallbackLocal) {
        return {
          valido: true,
          erro: 'CNPJ válido (API indisponível)',
          fonte: 'hibrido'
        };
      } else {
        return {
          valido: false,
          erro: 'Erro na validação do CNPJ',
          fonte: 'api'
        };
      }
    }
  }

  /**
   * Valida CPF ou CNPJ baseado no tipo
   * @param documento CPF ou CNPJ
   * @param tipo Tipo do documento
   * @returns Resultado da validação
   */
  async validarDocumento(
    documento: string, 
    tipo: 'FISICA' | 'JURIDICA'
  ): Promise<ValidationResult> {
    if (tipo === 'FISICA') {
      return this.validarCPF(documento);
    } else {
      return this.validarCNPJ(documento);
    }
  }

  /**
   * Obtém dados completos do CNPJ via API FOCUS NFE
   * @param cnpj CNPJ sem formatação
   * @returns Dados completos do CNPJ
   */
  async obterDadosCnpj(cnpj: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
      return {
        success: false,
        error: 'CNPJ deve ter 14 dígitos'
      };
    }

    try {
      const { getFocusNfeService } = await import('../services/focusNfeService');
      const service = getFocusNfeService();
      
      if (!service) {
        return {
          success: false,
          error: 'Serviço FOCUS NFE não configurado'
        };
      }

      const resultado = await this.validarComTimeout(
        () => service.obterDadosCnpj(cnpjLimpo),
        this.options.timeout!
      );

      return resultado;
    } catch (error) {
      return {
        success: false,
        error: 'Erro na consulta do CNPJ'
      };
    }
  }

  /**
   * Executa função com timeout
   * @param fn Função a ser executada
   * @param timeout Timeout em milissegundos
   * @returns Resultado da função ou erro de timeout
   */
  private async validarComTimeout<T>(
    fn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), timeout);
      })
    ]);
  }
}

/**
 * Instância singleton do serviço de validação
 */
let validationServiceInstance: CPFCNPJValidationService | null = null;

export function getValidationService(): CPFCNPJValidationService {
  if (!validationServiceInstance) {
    validationServiceInstance = new CPFCNPJValidationService({
      usarApi: process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN ? true : false,
      timeout: 5000,
      fallbackLocal: true
    });
  }
  
  return validationServiceInstance;
}

/**
 * Funções utilitárias para uso direto
 */
export async function validarCPFCompleto(cpf: string): Promise<ValidationResult> {
  const service = getValidationService();
  return service.validarCPF(cpf);
}

export async function validarCNPJCompleto(cnpj: string): Promise<ValidationResult> {
  const service = getValidationService();
  return service.validarCNPJ(cnpj);
}

export async function validarDocumentoCompleto(
  documento: string, 
  tipo: 'FISICA' | 'JURIDICA'
): Promise<ValidationResult> {
  const service = getValidationService();
  return service.validarDocumento(documento, tipo);
}

export async function obterDadosCnpjCompleto(cnpj: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const service = getValidationService();
  return service.obterDadosCnpj(cnpj);
}
