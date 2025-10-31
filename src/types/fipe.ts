// Tipos para integração com API Tabela FIPE
// Fundação Instituto de Pesquisas Econômicas

export interface FipeMarca {
  codigo: string;
  nome: string;
}

export interface FipeModelo {
  codigo: string;
  nome: string;
}

export interface FipeAno {
  codigo: string;
  nome: string;
}

export interface FipeConsulta {
  tipoVeiculo: 'carros' | 'motos' | 'caminhoes';
  marca: FipeMarca;
  modelo: FipeModelo;
  ano: FipeAno;
  valor: string;
  mesReferencia: string;
  codigoFipe: string;
  siglaCombustivel: string;
  dataConsulta: string;
}

export interface FipeConsultaRequest {
  tipoVeiculo?: 'carros' | 'motos' | 'caminhoes';
  marcaCodigo?: string;
  modeloCodigo?: string;
  anoCodigo?: string;
}

export interface FipeConsultaResponse {
  success: boolean;
  data?: FipeConsulta;
  error?: string;
}

