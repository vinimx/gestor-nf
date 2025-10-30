import { z } from 'zod';

export const clienteSchema = z.object({
  tipo: z.enum(['FISICA', 'JURIDICA']),
  nome_razao_social: z.string().min(1, 'Nome/Razão Social é obrigatório').max(255),
  cpf_cnpj: z.string().min(1, 'CPF/CNPJ é obrigatório'),
  inscricao_estadual: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.object({
    logradouro: z.string().min(1, 'Logradouro é obrigatório'),
    numero: z.string().min(1, 'Número é obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    uf: z.string().length(2, 'UF deve ter 2 caracteres'),
    cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  }),
  ativo: z.boolean().default(true),
});

export const clienteQuerySchema = z.object({
  search: z.string().optional(),
  tipo: z.enum(['FISICA', 'JURIDICA']).optional(),
  // Converter strings "true"/"false" corretamente para boolean
  ativo: z
    .preprocess((v) => {
      if (typeof v === 'string') {
        if (v.toLowerCase() === 'true') return true;
        if (v.toLowerCase() === 'false') return false;
      }
      return v;
    }, z.boolean())
    .optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort: z.string().default('nome_razao_social'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export const clienteCreateSchema = clienteSchema.extend({
  empresa_id: z.string().uuid('ID da empresa inválido'),
});

export const clienteUpdateSchema = clienteSchema.partial();

// Funções de validação de CPF/CNPJ
export function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  if (cpfLimpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(10))) return false;
  
  return true;
}

export function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  
  if (cnpjLimpo.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;
  
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  let digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
}

export function validarCPFCNPJ(cpfCnpj: string, tipo: 'FISICA' | 'JURIDICA'): boolean {
  if (tipo === 'FISICA') {
    return validarCPF(cpfCnpj);
  } else {
    return validarCNPJ(cpfCnpj);
  }
}
