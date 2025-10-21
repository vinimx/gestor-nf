interface ImpostoNota {
  id: number;
  notaFiscalId: number; // FK para NotaFiscal
  icms: number;
  pis: number;
  cofins: number;
  ir: number;
  csll: number;
  issqn: number;
  credito_icms: number;
}
