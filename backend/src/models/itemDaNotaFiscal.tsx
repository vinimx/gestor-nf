interface ItemDaNotaFiscal {
  id: number;
  notaFiscalId: number; // FK para NotaFiscal
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}
