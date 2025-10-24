import { z } from 'zod';

export const produtoSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório').max(50),
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  descricao: z.string().optional(),
  tipo: z.enum(['PRODUTO', 'SERVICO']),
  unidade_medida: z.string().min(1, 'Unidade de medida é obrigatória').max(10),
  valor_unitario: z.coerce.number().min(0, 'Valor unitário deve ser positivo'),
  codigo_ncm: z.string().optional(),
  codigo_cfop: z.string().optional(),
  aliquota_icms: z.coerce.number().min(0).max(100, 'Alíquota ICMS inválida').default(0),
  aliquota_ipi: z.coerce.number().min(0).max(100, 'Alíquota IPI inválida').default(0),
  aliquota_pis: z.coerce.number().min(0).max(100, 'Alíquota PIS inválida').default(0),
  aliquota_cofins: z.coerce.number().min(0).max(100, 'Alíquota COFINS inválida').default(0),
  ativo: z.boolean().default(true),
});

export const produtoQuerySchema = z.object({
  search: z.string().optional(),
  tipo: z.enum(['PRODUTO', 'SERVICO']).optional(),
  ativo: z.boolean().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort: z.string().default('nome'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export const produtoCreateSchema = produtoSchema.extend({
  empresa_id: z.string().uuid('ID da empresa inválido'),
});

export const produtoUpdateSchema = produtoSchema.partial();

// Validações específicas para códigos fiscais
export function validarNCM(ncm: string): boolean {
  if (!ncm) return true; // NCM é opcional
  const ncmLimpo = ncm.replace(/\D/g, '');
  return ncmLimpo.length === 8;
}

export function validarCFOP(cfop: string): boolean {
  if (!cfop) return true; // CFOP é opcional
  const cfopLimpo = cfop.replace(/\D/g, '');
  return cfopLimpo.length === 4;
}

// Unidades de medida válidas
export const UNIDADES_MEDIDA = [
  { value: 'UN', label: 'Unidade' },
  { value: 'KG', label: 'Quilograma' },
  { value: 'L', label: 'Litro' },
  { value: 'M', label: 'Metro' },
  { value: 'M2', label: 'Metro Quadrado' },
  { value: 'M3', label: 'Metro Cúbico' },
  { value: 'PC', label: 'Peça' },
  { value: 'CX', label: 'Caixa' },
  { value: 'DZ', label: 'Dúzia' },
  { value: 'HR', label: 'Hora' },
  { value: 'DIA', label: 'Dia' },
  { value: 'MES', label: 'Mês' },
] as const;

// Tipos de produto/serviço
export const TIPOS_PRODUTO = [
  { value: 'PRODUTO', label: 'Produto' },
  { value: 'SERVICO', label: 'Serviço' },
] as const;
