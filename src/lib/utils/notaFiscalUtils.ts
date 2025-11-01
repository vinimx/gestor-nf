/**
 * Utilitários para geração de Nota Fiscal
 * FASE 5: Criação de Notas Fiscais
 */

import { ItemNotaFiscal } from '@/types/produto';

/**
 * Gera observações automaticamente a partir dos produtos incluídos na nota fiscal
 * 
 * Esta função concatena as observações de cada produto que possui o campo observacoes preenchido,
 * formatando-as de forma legível para serem incluídas no campo de observações da nota fiscal.
 * 
 * @param itens - Array de itens da nota fiscal
 * @returns String formatada com as observações ou string vazia se não houver observações
 * 
 * @example
 * ```ts
 * const itens = [
 *   { descricao: 'Produto A', observacoes: 'Lote 123' },
 *   { descricao: 'Produto B', observacoes: 'Validade 01/2025' }
 * ];
 * 
 * const obs = gerarObservacoesNota(itens);
 * // Retorna: "Produto A: Lote 123\nProduto B: Validade 01/2025"
 * ```
 */
export function gerarObservacoesNota(itens: ItemNotaFiscal[]): string {
  if (!itens || itens.length === 0) {
    return '';
  }

  const observacoesItens = itens
    .filter(item => item.observacoes && item.observacoes.trim() !== '')
    .map(item => `${item.descricao}: ${item.observacoes}`)
    .join('\n');
  
  return observacoesItens;
}

/**
 * Combina observações gerais da nota com observações dos produtos
 * 
 * @param observacoesGerais - Observações gerais da nota fiscal
 * @param itens - Array de itens da nota fiscal
 * @returns String formatada com todas as observações
 * 
 * @example
 * ```ts
 * const obs = combinarObservacoes('Nota de devolução', itens);
 * // Retorna: "Nota de devolução\n\nProduto A: Lote 123"
 * ```
 */
export function combinarObservacoes(
  observacoesGerais: string | undefined,
  itens: ItemNotaFiscal[]
): string {
  const observacoesProdutos = gerarObservacoesNota(itens);
  
  // Combinar observações gerais e dos produtos
  const partes = [
    observacoesGerais?.trim(),
    observacoesProdutos
  ].filter(Boolean); // Remove valores vazios/undefined
  
  return partes.join('\n\n');
}

/**
 * Calcula o total de IBS/CBS para todos os itens da nota
 * 
 * @param itens - Array de itens da nota fiscal
 * @returns Valor total de IBS/CBS
 * 
 * @example
 * ```ts
 * const total = calcularTotalIBSCBS(itens);
 * ```
 */
export function calcularTotalIBSCBS(itens: ItemNotaFiscal[]): number {
  if (!itens || itens.length === 0) {
    return 0;
  }

  return itens.reduce((total, item) => {
    if (item.valor_ibs_cbs) {
      return total + item.valor_ibs_cbs;
    }
    return total;
  }, 0);
}

/**
 * Calcula o valor de IBS/CBS para um item
 * 
 * @param valorBase - Valor base do item
 * @param aliquota - Alíquota de IBS/CBS (0-100)
 * @returns Valor de IBS/CBS calculado
 * 
 * @example
 * ```ts
 * const valor = calcularIBSCBS(1000, 12.5);
 * // Retorna: 125
 * ```
 */
export function calcularIBSCBS(valorBase: number, aliquota?: number): number {
  if (!aliquota || aliquota <= 0) {
    return 0;
  }
  
  return (valorBase * aliquota) / 100;
}

/**
 * Valida se as observações estão dentro do limite permitido
 * 
 * @param observacoes - String de observações
 * @param limite - Limite de caracteres (padrão: 500)
 * @returns true se válido, false se exceder o limite
 */
export function validarObservacoes(observacoes: string, limite: number = 500): boolean {
  if (!observacoes) {
    return true;
  }
  
  return observacoes.length <= limite;
}

