export interface Produto {
  id: string;
  empresa_id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  tipo: 'PRODUTO' | 'SERVICO';
  unidade_medida: string;
  valor_unitario: number;
  codigo_ncm?: string;
  codigo_cfop?: string;
  aliquota_icms: number;
  aliquota_ipi: number;
  aliquota_pis: number;
  aliquota_cofins: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProdutoCreate {
  empresa_id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  tipo: 'PRODUTO' | 'SERVICO';
  unidade_medida: string;
  valor_unitario: number;
  codigo_ncm?: string;
  codigo_cfop?: string;
  aliquota_icms?: number;
  aliquota_ipi?: number;
  aliquota_pis?: number;
  aliquota_cofins?: number;
  ativo?: boolean;
}

export interface ProdutoUpdate {
  codigo?: string;
  nome?: string;
  descricao?: string;
  tipo?: 'PRODUTO' | 'SERVICO';
  unidade_medida?: string;
  valor_unitario?: number;
  codigo_ncm?: string;
  codigo_cfop?: string;
  aliquota_icms?: number;
  aliquota_ipi?: number;
  aliquota_pis?: number;
  aliquota_cofins?: number;
  ativo?: boolean;
}

export interface ProdutoQuery {
  search?: string;
  tipo?: 'PRODUTO' | 'SERVICO';
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
