// Tipos para gestão de produtos e serviços
// FASE 3: Gestão de Produtos/Serviços

export interface Produto {
  id: string;
  empresa_id: string;
  categoria_id?: string;
  codigo: string;
  nome: string;
  descricao?: string;
  tipo: 'PRODUTO' | 'SERVICO';
  unidade: 'UN' | 'KG' | 'L' | 'M' | 'M2' | 'M3' | 'PC' | 'CX' | 'DZ';
  preco_venda: number;
  custo?: number;
  quantidade: number;
  
  // Dados fiscais obrigatórios
  ncm: string;
  cfop_saida: string;
  cfop_entrada: string;
  
  // Impostos
  aliquota_icms: number;
  aliquota_ipi: number;
  aliquota_pis: number;
  aliquota_cofins: number;
  aliquota_ibs_cbs?: number; // Reforma Tributária
  
  // Observações (aparece na nota fiscal)
  observacoes?: string;
  
  // Configurações ICMS
  icms_situacao_tributaria: string;
  icms_origem: string;
  icms_modalidade_base_calculo: string;
  icms_reducao_base_calculo: number;
  
  // Configurações IPI
  ipi_codigo_enquadramento?: string;
  ipi_situacao_tributaria: string;
  
  // Configurações PIS/COFINS
  pis_situacao_tributaria: string;
  cofins_situacao_tributaria: string;
  
  // Status e controle
  ativo: boolean;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  categoria?: CategoriaProduto;
}

export interface CategoriaProduto {
  id: string;
  empresa_id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProdutoCreate {
  categoria_id?: string;
  codigo: string;
  nome: string;
  descricao?: string;
  tipo: 'PRODUTO' | 'SERVICO';
  unidade: 'UN' | 'KG' | 'L' | 'M' | 'M2' | 'M3' | 'PC' | 'CX' | 'DZ';
  preco_venda: number;
  custo?: number;
  quantidade?: number;
  ncm: string;
  cfop_saida: string;
  cfop_entrada: string;
  aliquota_icms: number;
  aliquota_ipi?: number;
  aliquota_pis?: number;
  aliquota_cofins?: number;
  aliquota_ibs_cbs?: number; // Reforma Tributária
  observacoes?: string; // Observações do produto (aparece na nota fiscal)
  icms_situacao_tributaria?: string;
  icms_origem?: string;
  icms_modalidade_base_calculo?: string;
  icms_reducao_base_calculo?: number;
  ipi_codigo_enquadramento?: string;
  ipi_situacao_tributaria?: string;
  pis_situacao_tributaria?: string;
  cofins_situacao_tributaria?: string;
  ativo?: boolean;
}

export interface ProdutoUpdate extends Partial<ProdutoCreate> {
  id: string;
}

export interface ProdutoQuery {
  search?: string;
  tipo?: 'PRODUTO' | 'SERVICO';
  categoria_id?: string;
  ativo?: boolean;
  limit: number;
  offset: number;
  sort: string;
  order: 'asc' | 'desc';
}

export interface ProdutoResponse {
  data: Produto[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    totalPages: number;
    currentPage: number;
  };
}

export interface CategoriaProdutoCreate {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface CategoriaProdutoUpdate extends Partial<CategoriaProdutoCreate> {
  id: string;
}

// Tipos para integração com FOCUS NFE
export interface FocusProdutoData {
  codigo_produto: string;
  descricao: string;
  unidade_comercial: string;
  unidade_tributavel: string;
  valor_bruto: number;
  codigo_ncm: string;
  cfop: string;
  inclui_no_total: number;
  icms_situacao_tributaria: string;
  icms_aliquota: number;
  icms_origem: string;
  icms_modalidade_base_calculo: string;
  icms_reducao_base_calculo?: number;
  ipi_codigo_enquadramento?: string;
  ipi_situacao_tributaria?: string;
  ipi_aliquota?: number;
  pis_situacao_tributaria?: string;
  pis_aliquota_porcentual?: number;
  cofins_situacao_tributaria?: string;
  cofins_aliquota_porcentual?: number;
  // Campos adicionais para compatibilidade
  ncm: string;
  cfop_saida: string;
  cfop_entrada: string;
  aliquota_icms: number;
}

// Configurações padrão para impostos
export const IMPOSTOS_DEFAULT = {
  ICMS: {
    situacao_tributaria: '00',
    origem: '0',
    modalidade_base_calculo: '0',
    reducao_base_calculo: 0,
  },
  IPI: {
    situacao_tributaria: '00',
    codigo_enquadramento: '',
  },
  PIS: {
    situacao_tributaria: '01',
  },
  COFINS: {
    situacao_tributaria: '01',
  },
} as const;

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
] as const;

// Tipos de produto
export const TIPOS_PRODUTO = [
  { value: 'PRODUTO', label: 'Produto' },
  { value: 'SERVICO', label: 'Serviço' },
] as const;

// Tipos para integração FOCUS NFE
export interface FocusNCMData {
  codigo: string;
  descricao_completa: string;
  capitulo: string;
  posicao: string;
  subposicao1: string;
  subposicao2: string;
  item1: string;
  item2: string;
  valid: boolean;
}

export interface FocusCFOPData {
  codigo: string;
  descricao: string;
  valid: boolean;
  tipo: 'ENTRADA' | 'SAIDA';
}

export interface FocusCSTData {
  codigo: string;
  descricao: string;
  tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS';
  aplicavel: boolean;
}

// Tipos para Nota Fiscal
export interface ItemNotaFiscal {
  id?: string;
  produto_id?: string;
  codigo_produto: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  valor_desconto?: number;
  observacoes?: string; // Observações do produto
  aliquota_icms: number;
  base_calculo_icms: number;
  valor_icms: number;
  aliquota_ipi?: number;
  base_calculo_ipi?: number;
  valor_ipi?: number;
  aliquota_pis?: number;
  base_calculo_pis?: number;
  valor_pis?: number;
  aliquota_cofins?: number;
  base_calculo_cofins?: number;
  valor_cofins?: number;
  aliquota_ibs_cbs?: number; // Reforma Tributária
  base_calculo_ibs_cbs?: number;
  valor_ibs_cbs?: number;
}