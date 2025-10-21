interface NotaFiscal {
  id: number;
  empresaId: number; // FK para Empresa
  competenciaId: number; // FK para Competencia
  tipo: "entrada" | "saida" | "servico";
  numeroNf: string;
  serie: string;
  chaveAcesso?: string; // opcional
  dataEmissao: Date;
  valorTotal: number;
  emitente: string;
  cnpjEmitente: string;
  tomador?: string; // opcional, se for serviço
  cnpjTomador?: string; // opcional, se for serviço
  placaVeiculo?: string; // opcional
  criadoEm: Date;
  atualizadoEm: Date;
}
