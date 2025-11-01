/**
 * Utilitários de Formatação Numérica - Padrão Brasileiro
 * FASE 3: Gestão de Produtos
 * 
 * Funções para formatação e parsing de valores monetários e percentuais
 * seguindo o padrão brasileiro (vírgula como separador decimal).
 */

/**
 * Formata número para formato monetário brasileiro
 * 
 * @param valor - Valor numérico
 * @param casasDecimais - Número de casas decimais (padrão: 2)
 * @returns String formatada (ex: "1.234,56")
 * 
 * @example
 * formatarValorMonetario(1234.56)  // "1.234,56"
 * formatarValorMonetario(100)      // "100,00"
 * formatarValorMonetario(0.5, 4)   // "0,5000"
 */
export function formatarValorMonetario(
  valor: number | string | undefined | null, 
  casasDecimais: number = 2
): string {
  if (valor === undefined || valor === null || valor === '') {
    return '';
  }

  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  if (isNaN(numero)) {
    return '';
  }

  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  });
}

/**
 * Formata número para formato de alíquota percentual
 * 
 * @param valor - Valor numérico
 * @param casasDecimais - Número de casas decimais (padrão: 2)
 * @returns String formatada (ex: "12,50")
 * 
 * @example
 * formatarAliquota(12.5)     // "12,50"
 * formatarAliquota(0.1234, 4) // "0,1234"
 */
export function formatarAliquota(
  valor: number | string | undefined | null,
  casasDecimais: number = 2
): string {
  return formatarValorMonetario(valor, casasDecimais);
}

/**
 * Remove formatação e converte para número
 * Aceita tanto ponto quanto vírgula como separador decimal
 * 
 * @param valorFormatado - String com formatação
 * @returns Número ou undefined se inválido
 * 
 * @example
 * parseValorBrasileiro("1.234,56")  // 1234.56
 * parseValorBrasileiro("1234.56")   // 1234.56
 * parseValorBrasileiro("1234,56")   // 1234.56
 * parseValorBrasileiro("12,5")      // 12.5
 */
export function parseValorBrasileiro(
  valorFormatado: string | undefined | null
): number | undefined {
  if (!valorFormatado || valorFormatado.trim() === '') {
    return undefined;
  }

  // Remover espaços
  let valor = valorFormatado.trim();

  // Detectar formato: se tem ponto E vírgula, é formato brasileiro (1.234,56)
  const temPontoEVirgula = valor.includes('.') && valor.includes(',');
  
  if (temPontoEVirgula) {
    // Formato brasileiro: remover pontos (milhares) e trocar vírgula por ponto
    valor = valor.replace(/\./g, '').replace(',', '.');
  } else if (valor.includes(',')) {
    // Só tem vírgula: trocar por ponto
    valor = valor.replace(',', '.');
  }
  // Se só tem ponto, já está no formato correto

  const numero = parseFloat(valor);
  
  return isNaN(numero) ? undefined : numero;
}

/**
 * Normaliza input durante digitação
 * Remove caracteres inválidos mantendo apenas números, vírgula e ponto
 * 
 * @param input - String digitada
 * @returns String normalizada
 * 
 * @example
 * normalizarInput("12abc,5")  // "12,5"
 * normalizarInput("1.234,56") // "1.234,56"
 */
export function normalizarInput(input: string): string {
  if (!input) return '';
  
  // Permitir apenas números, vírgula, ponto e espaços
  return input.replace(/[^\d.,\s]/g, '');
}

/**
 * Valida se o valor está dentro do range permitido
 * 
 * @param valor - Valor a validar
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns true se válido
 */
export function validarRange(
  valor: number | undefined,
  min: number = 0,
  max: number = Number.MAX_VALUE
): boolean {
  if (valor === undefined) return true; // Valores undefined são válidos (opcional)
  return valor >= min && valor <= max;
}

/**
 * Formata valor monetário com símbolo R$
 * 
 * @param valor - Valor numérico
 * @returns String formatada com R$ (ex: "R$ 1.234,56")
 */
export function formatarMoeda(valor: number | undefined | null): string {
  if (valor === undefined || valor === null) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Formata percentual com símbolo %
 * 
 * @param valor - Valor numérico
 * @param casasDecimais - Casas decimais (padrão: 2)
 * @returns String formatada com % (ex: "12,50%")
 */
export function formatarPercentual(
  valor: number | undefined | null,
  casasDecimais: number = 2
): string {
  if (valor === undefined || valor === null) {
    return '0,00%';
  }

  return formatarAliquota(valor, casasDecimais) + '%';
}

/**
 * Detecta se está digitando um número válido
 * Usado para validação em tempo real
 */
export function isNumeroValido(input: string): boolean {
  if (!input || input.trim() === '') return false;
  
  const numero = parseValorBrasileiro(input);
  return numero !== undefined && !isNaN(numero);
}

/**
 * Formata valor durante digitação (sem perder o cursor)
 * Apenas remove caracteres inválidos
 */
export function formatarDuranteDigitacao(input: string): string {
  return normalizarInput(input);
}

/**
 * Formata valor ao perder foco (formatação completa)
 */
export function formatarAoPerderFoco(
  input: string,
  tipo: 'monetario' | 'aliquota',
  casasDecimais?: number
): string {
  const numero = parseValorBrasileiro(input);
  
  if (numero === undefined) {
    return '';
  }

  const decimais = casasDecimais ?? (tipo === 'monetario' ? 2 : 2);
  return formatarValorMonetario(numero, decimais);
}

