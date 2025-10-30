// Empresa
export interface Empresa {
  id: string; // uuid
  nome: string;
  cnpj: string;
  inscricao_estadual?: string | null;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
  } | null;
  telefone?: string | null;
  email?: string | null;
  
  // Configurações FOCUS NFE
  focus_nfe_token?: string | null;
  focus_nfe_environment?: 'homologacao' | 'producao';
  focus_nfe_ativo?: boolean;
  focus_nfe_ultima_validacao?: string | null;
  focus_nfe_erro_validacao?: string | null;
  
  created_at?: string;
  updated_at?: string;
  ativo?: boolean;
}

// User (perfil)
export interface UserProfile {
  id: string; // uuid (auth user id)
  email: string;
  nome?: string | null;
  role: "admin" | "accountant" | "viewer";
  empresa_id?: string | null; // vínculo opcional
  created_at?: string;
}

// NotaFiscal
export interface NotaFiscal {
  id: string;
  empresa_id: string; // quem registra/no sistema
  fornecedor_id?: string | null; // se for outra empresa cadastrada
  tipo: "entrada" | "saida";
  chave_acesso?: string | null; // NFe chave
  numero: string;
  serie?: string | null;
  data_emissao: string; // ISO
  data_entrada?: string | null;
  valor_total: number;
  base_calculo?: number;
  imposto_total?: number;
  arquivo_xml?: string | null; // storage path
  arquivo_pdf?: string | null; // storage path
  status?: "importado" | "pendente" | "cancelado";
  created_at?: string;
  updated_at?: string;
}

// ItemDaNotaFiscal
export interface ItemDaNotaFiscal {
  id: string;
  nota_id: string;
  descricao: string;
  ncm?: string | null;
  quantidade: number;
  unidade?: string | null;
  valor_unitario: number;
  valor_total: number;
  cfop?: string | null;
  aliquota_icms?: number | null;
}

// ImpostoNota
export interface ImpostoNota {
  id: string;
  nota_id: string;
  tipo: "ICMS" | "IPI" | "PIS" | "COFINS" | "ISS" | string;
  base_calculo: number;
  aliquota: number;
  valor: number;
  created_at?: string;
}

// Competencia
export interface Competencia {
  id: string;
  empresa_id: string;
  mes: number;
  ano: number;
  status: "aberta" | "fechada";
  created_at?: string;
  updated_at?: string;
}




