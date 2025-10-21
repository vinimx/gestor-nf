import { z } from "zod";

// Schema para Empresa
export const empresaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  // Transform formatted or raw CNPJ into digits-only and validate length
  cnpj: z
    .string()
    .transform((val) => val.replace(/\D/g, ""))
    .refine((v) => v.length === 14, { message: "CNPJ deve conter 14 dígitos" }),
  inscricao_estadual: z.string().optional(),
  endereco: z
    .object({
      logradouro: z.string().optional(),
      numero: z.string().optional(),
      complemento: z.string().optional(),
      bairro: z.string().optional(),
      cidade: z.string().optional(),
      uf: z.string().min(2).max(2).optional(),
      cep: z
        .string()
        .regex(/^\d{5}-?\d{3}$/, "CEP deve estar no formato 00000-000")
        .optional(),
    })
    .optional(),
  telefone: z.string().optional(),
  // Aceitar email vazio como undefined para não falhar quando campo vier como "" do form
  email: z.preprocess((val) => {
    if (typeof val === "string") {
      const s = val.trim();
      return s === "" ? undefined : s;
    }
    return val;
  }, z.string().email("Email inválido").optional()),
  ativo: z.boolean().optional().default(true),
});

// Schema para UserProfile
export const userProfileSchema = z.object({
  email: z.string().email("Email inválido"),
  nome: z.string().optional(),
  role: z.enum(["admin", "accountant", "viewer"]),
  empresa_id: z.string().uuid().optional(),
});

// Schema para NotaFiscal
export const notaFiscalSchema = z.object({
  empresa_id: z.string().uuid("ID da empresa deve ser um UUID válido"),
  fornecedor_id: z.string().uuid().optional(),
  tipo: z.enum(["entrada", "saida"]),
  chave_acesso: z.string().optional(),
  numero: z.string().min(1, "Número da nota é obrigatório"),
  serie: z.string().optional(),
  data_emissao: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  data_entrada: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .optional(),
  valor_total: z.number().positive("Valor total deve ser positivo"),
  base_calculo: z.number().optional(),
  imposto_total: z.number().optional(),
  arquivo_xml: z.string().optional(),
  arquivo_pdf: z.string().optional(),
  status: z
    .enum(["importado", "pendente", "cancelado"])
    .optional()
    .default("pendente"),
});

// Schema para ItemDaNotaFiscal
export const itemNotaFiscalSchema = z.object({
  nota_id: z.string().uuid("ID da nota deve ser um UUID válido"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  ncm: z.string().optional(),
  quantidade: z.number().positive("Quantidade deve ser positiva"),
  unidade: z.string().optional(),
  valor_unitario: z.number().positive("Valor unitário deve ser positivo"),
  valor_total: z.number().positive("Valor total deve ser positivo"),
  cfop: z.string().optional(),
  aliquota_icms: z.number().optional(),
});

// Schema para ImpostoNota
export const impostoNotaSchema = z.object({
  nota_id: z.string().uuid("ID da nota deve ser um UUID válido"),
  tipo: z.string().min(1, "Tipo do imposto é obrigatório"),
  base_calculo: z.number().nonnegative("Base de cálculo deve ser não negativa"),
  aliquota: z.number().nonnegative("Alíquota deve ser não negativa"),
  valor: z.number().nonnegative("Valor do imposto deve ser não negativo"),
});

// Schema para Competencia
export const competenciaSchema = z.object({
  empresa_id: z.string().uuid("ID da empresa deve ser um UUID válido"),
  mes: z.number().min(1).max(12, "Mês deve estar entre 1 e 12"),
  ano: z.number().min(2020).max(2030, "Ano deve estar entre 2020 e 2030"),
  status: z.enum(["aberta", "fechada"]).default("aberta"),
});

// Schemas para queries/filtros
export const empresaQuerySchema = z.object({
  // Normalizar possíveis nulls/undefined e aplicar defaults
  search: z.preprocess(
    (v) => (v === null ? undefined : v),
    z.string().optional()
  ),
  // Preprocess para transformar strings inválidas em undefined (assim o default do schema será aplicado)
  limit: z.preprocess((v) => {
    if (v === null || v === undefined) return undefined;
    if (typeof v === "string") {
      const s = v.trim();
      if (s === "") return undefined;
      const n = Number(s);
      return Number.isFinite(n) ? n : undefined;
    }
    return v;
  }, z.number().min(1).max(100).default(10)),
  offset: z.preprocess((v) => {
    if (v === null || v === undefined) return undefined;
    if (typeof v === "string") {
      const s = v.trim();
      if (s === "") return undefined;
      const n = Number(s);
      return Number.isFinite(n) ? n : undefined;
    }
    return v;
  }, z.number().min(0).default(0)),
  sort: z.preprocess(
    (v) => (v === null ? undefined : v),
    z.enum(["nome", "cnpj", "created_at"]).default("nome")
  ),
  order: z.preprocess(
    (v) => (v === null ? undefined : v),
    z.enum(["asc", "desc"]).default("asc")
  ),
  ativo: z.preprocess((v) => {
    if (v === null || v === undefined) return undefined;
    if (typeof v === "string") {
      return v === "true" ? true : v === "false" ? false : undefined;
    }
    return v;
  }, z.boolean().optional()),
});

export const notaFiscalQuerySchema = z.object({
  empresa_id: z.string().uuid().optional(),
  data_inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  data_fim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  chave: z.string().optional(),
  tipo: z.enum(["entrada", "saida"]).optional(),
  status: z.enum(["importado", "pendente", "cancelado"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Tipos inferidos dos schemas
export type EmpresaInput = z.infer<typeof empresaSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type NotaFiscalInput = z.infer<typeof notaFiscalSchema>;
export type ItemNotaFiscalInput = z.infer<typeof itemNotaFiscalSchema>;
export type ImpostoNotaInput = z.infer<typeof impostoNotaSchema>;
export type CompetenciaInput = z.infer<typeof competenciaSchema>;
export type EmpresaQuery = z.infer<typeof empresaQuerySchema>;
export type NotaFiscalQuery = z.infer<typeof notaFiscalQuerySchema>;



