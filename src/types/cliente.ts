export interface Cliente {
  id: string;
  empresa_id: string;
  tipo: 'FISICA' | 'JURIDICA';
  nome_razao_social: string;
  cpf_cnpj: string;
  inscricao_estadual?: string;
  email?: string;
  telefone?: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClienteCreate {
  empresa_id: string;
  tipo: 'FISICA' | 'JURIDICA';
  nome_razao_social: string;
  cpf_cnpj: string;
  inscricao_estadual?: string;
  email?: string;
  telefone?: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  ativo?: boolean;
}

export interface ClienteUpdate {
  tipo?: 'FISICA' | 'JURIDICA';
  nome_razao_social?: string;
  cpf_cnpj?: string;
  inscricao_estadual?: string;
  email?: string;
  telefone?: string;
  endereco?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  ativo?: boolean;
}

export interface ClienteQuery {
  search?: string;
  tipo?: 'FISICA' | 'JURIDICA';
  ativo?: boolean;
  limit: number;
  offset: number;
  sort: string;
  order: 'asc' | 'desc';
}

export interface ClienteResponse {
  data: Cliente[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    totalPages: number;
    currentPage: number;
  };
}
