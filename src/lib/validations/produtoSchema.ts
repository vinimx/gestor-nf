import { z } from 'zod';

// Schema para categoria de produto
export const categoriaProdutoSchema = z.object({
  nome: z.string()
    .min(1, 'Nome da categoria é obrigatório')
    .max(100, 'Nome da categoria deve ter no máximo 100 caracteres'),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

export const categoriaProdutoUpdateSchema = categoriaProdutoSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
});

// Schema para produto
export const produtoSchema = z.object({
  categoria_id: z.string().uuid('Categoria inválida').optional(),
  codigo: z.string()
    .min(1, 'Código é obrigatório')
    .max(50, 'Código deve ter no máximo 50 caracteres'),
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  descricao: z.string().optional(),
  tipo: z.enum(['PRODUTO', 'SERVICO'], {
    errorMap: () => ({ message: 'Tipo deve ser PRODUTO ou SERVICO' })
  }),
  unidade: z.enum(['UN', 'KG', 'L', 'M', 'M2', 'M3', 'PC', 'CX', 'DZ'], {
    errorMap: () => ({ message: 'Unidade inválida' })
  }),
  preco_venda: z.coerce.number()
    .min(0, 'Preço de venda deve ser positivo')
    .max(999999999.99, 'Preço de venda muito alto'),
  custo: z.coerce.number()
    .min(0, 'Custo deve ser positivo')
    .max(999999999.99, 'Custo muito alto')
    .optional(),
  
  // Dados fiscais obrigatórios
  ncm: z.string()
    .regex(/^\d{8}$/, 'NCM deve ter exatamente 8 dígitos'),
  cfop_saida: z.string()
    .regex(/^\d{4}$/, 'CFOP de saída deve ter 4 dígitos'),
  cfop_entrada: z.string()
    .regex(/^\d{4}$/, 'CFOP de entrada deve ter 4 dígitos'),
  
  // Impostos
  aliquota_icms: z.coerce.number()
    .min(0, 'Alíquota ICMS deve ser positiva')
    .max(100, 'Alíquota ICMS não pode ser maior que 100%'),
  aliquota_ipi: z.coerce.number()
    .min(0, 'Alíquota IPI deve ser positiva')
    .max(100, 'Alíquota IPI não pode ser maior que 100%'),
  aliquota_pis: z.coerce.number()
    .min(0, 'Alíquota PIS deve ser positiva')
    .max(100, 'Alíquota PIS não pode ser maior que 100%'),
  aliquota_cofins: z.coerce.number()
    .min(0, 'Alíquota COFINS deve ser positiva')
    .max(100, 'Alíquota COFINS não pode ser maior que 100%'),
  
  // Configurações ICMS
  icms_situacao_tributaria: z.string()
    .length(2, 'Situação tributária ICMS deve ter 2 dígitos')
    .default('00'),
  cst_icms: z.string()
    .regex(/^\d{2}$/, 'CST ICMS deve ter 2 dígitos')
    .optional(),
  icms_origem: z.string()
    .length(1, 'Origem ICMS deve ter 1 dígito')
    .default('0'),
  icms_modalidade_base_calculo: z.string()
    .length(2, 'Modalidade base cálculo ICMS deve ter 2 dígitos')
    .default('0'),
  icms_reducao_base_calculo: z.coerce.number()
    .min(0, 'Redução base cálculo ICMS deve ser positiva')
    .max(100, 'Redução base cálculo ICMS não pode ser maior que 100%')
    .default(0),
  
  // Configurações IPI
  ipi_codigo_enquadramento: z.string()
    .max(3, 'Código enquadramento IPI deve ter no máximo 3 caracteres'),
  cst_ipi: z.string()
    .regex(/^\d{2}$/, 'CST IPI deve ter 2 dígitos')
    .optional(),
  ipi_situacao_tributaria: z.string()
    .length(2, 'Situação tributária IPI deve ter 2 dígitos')
    .default('00'),
  
  // Configurações PIS/COFINS
  pis_situacao_tributaria: z.string()
    .length(2, 'Situação tributária PIS deve ter 2 dígitos')
    .default('01'),
  cst_pis: z.string()
    .regex(/^\d{2}$/, 'CST PIS deve ter 2 dígitos')
    .optional(),
  cofins_situacao_tributaria: z.string()
    .length(2, 'Situação tributária COFINS deve ter 2 dígitos')
    .default('01'),
  cst_cofins: z.string()
    .regex(/^\d{2}$/, 'CST COFINS deve ter 2 dígitos')
    .optional(),
  
  ativo: z.boolean().default(true),
});

export const produtoUpdateSchema = produtoSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
});

// Schema para query de produtos
export const produtoQuerySchema = z.object({
  search: z.string().optional(),
  tipo: z.enum(['PRODUTO', 'SERVICO']).optional(),
  categoria_id: z.string().uuid().optional(),
  ativo: z.boolean().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort: z.string().default('nome'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

// Validações específicas para FOCUS NFE
export const focusProdutoSchema = z.object({
  codigo_produto: z.string().min(1, 'Código do produto é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  unidade_comercial: z.string().min(1, 'Unidade comercial é obrigatória'),
  unidade_tributavel: z.string().min(1, 'Unidade tributável é obrigatória'),
  valor_bruto: z.coerce.number().min(0, 'Valor bruto deve ser positivo'),
  codigo_ncm: z.string().regex(/^\d{8}$/, 'NCM deve ter 8 dígitos'),
  cfop: z.string().regex(/^\d{4}$/, 'CFOP deve ter 4 dígitos'),
  inclui_no_total: z.number().min(0).max(1).default(1),
  icms_situacao_tributaria: z.string().length(2),
  icms_aliquota: z.coerce.number().min(0).max(100),
  icms_origem: z.string().length(1),
  icms_modalidade_base_calculo: z.string().length(2),
  icms_reducao_base_calculo: z.coerce.number().min(0).max(100).optional(),
  ipi_codigo_enquadramento: z.string().max(3).optional(),
  ipi_situacao_tributaria: z.string().length(2).optional(),
  ipi_aliquota: z.coerce.number().min(0).max(100).optional(),
  pis_situacao_tributaria: z.string().length(2).optional(),
  pis_aliquota_porcentual: z.coerce.number().min(0).max(100).optional(),
  cofins_situacao_tributaria: z.string().length(2).optional(),
  cofins_aliquota_porcentual: z.coerce.number().min(0).max(100).optional(),
});

// Função para converter produto para formato FOCUS NFE
export function produtoToFocusFormat(produto: any): z.infer<typeof focusProdutoSchema> {
  return {
    codigo_produto: produto.codigo,
    descricao: produto.nome,
    unidade_comercial: produto.unidade,
    unidade_tributavel: produto.unidade,
    valor_bruto: produto.preco_venda,
    codigo_ncm: produto.ncm,
    cfop: produto.cfop_saida,
    inclui_no_total: 1,
    icms_situacao_tributaria: produto.icms_situacao_tributaria,
    icms_aliquota: produto.aliquota_icms,
    icms_origem: produto.icms_origem,
    icms_modalidade_base_calculo: produto.icms_modalidade_base_calculo,
    icms_reducao_base_calculo: produto.icms_reducao_base_calculo,
    ipi_codigo_enquadramento: produto.ipi_codigo_enquadramento,
    ipi_situacao_tributaria: produto.ipi_situacao_tributaria,
    ipi_aliquota: produto.aliquota_ipi || 0,
    pis_situacao_tributaria: produto.pis_situacao_tributaria,
    pis_aliquota_porcentual: produto.aliquota_pis || 0,
    cofins_situacao_tributaria: produto.cofins_situacao_tributaria,
    cofins_aliquota_porcentual: produto.aliquota_cofins || 0,
  };
}

// Validação de NCM
export function validarNCM(ncm: string): boolean {
  const ncmRegex = /^\d{8}$/;
  return ncmRegex.test(ncm);
}

// Validação de CFOP
export function validarCFOP(cfop: string): boolean {
  const cfopRegex = /^\d{4}$/;
  return cfopRegex.test(cfop);
}

// Validação de alíquotas
export function validarAliquota(aliquota: number): boolean {
  return aliquota >= 0 && aliquota <= 100;
}