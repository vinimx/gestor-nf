import { NextRequest, NextResponse } from 'next/server';

// CSTs de ICMS
const cstsICMS = [
  { codigo: '00', descricao: 'Tributada integralmente', tipo: 'ICMS' },
  { codigo: '10', descricao: 'Tributada e com cobrança do ICMS por substituição tributária', tipo: 'ICMS' },
  { codigo: '20', descricao: 'Com redução de base de cálculo', tipo: 'ICMS' },
  { codigo: '30', descricao: 'Isenta ou não tributada e com cobrança do ICMS por substituição tributária', tipo: 'ICMS' },
  { codigo: '40', descricao: 'Isenta', tipo: 'ICMS' },
  { codigo: '41', descricao: 'Não tributada', tipo: 'ICMS' },
  { codigo: '50', descricao: 'Suspensão', tipo: 'ICMS' },
  { codigo: '51', descricao: 'Diferimento', tipo: 'ICMS' },
  { codigo: '60', descricao: 'ICMS cobrado anteriormente por substituição tributária', tipo: 'ICMS' },
  { codigo: '70', descricao: 'Com redução de base de cálculo e cobrança do ICMS por substituição tributária', tipo: 'ICMS' },
  { codigo: '90', descricao: 'Outras', tipo: 'ICMS' }
];

// CSTs de IPI
const cstsIPI = [
  { codigo: '00', descricao: 'Entrada com recuperação de crédito', tipo: 'IPI' },
  { codigo: '01', descricao: 'Entrada tributada com alíquota básica', tipo: 'IPI' },
  { codigo: '02', descricao: 'Entrada tributada com alíquota por unidade de produto', tipo: 'IPI' },
  { codigo: '03', descricao: 'Entrada tributada com alíquota por unidade de produto', tipo: 'IPI' },
  { codigo: '04', descricao: 'Entrada tributada com alíquota por unidade de produto', tipo: 'IPI' },
  { codigo: '05', descricao: 'Entrada tributada com alíquota por unidade de produto', tipo: 'IPI' },
  { codigo: '49', descricao: 'Outras entradas', tipo: 'IPI' },
  { codigo: '50', descricao: 'Saída tributada', tipo: 'IPI' },
  { codigo: '51', descricao: 'Saída tributada com alíquota por unidade de produto', tipo: 'IPI' },
  { codigo: '52', descricao: 'Saída tributada com alíquota por unidade de produto', tipo: 'IPI' },
  { codigo: '53', descricao: 'Saída tributada com alíquota por unidade de produto', tipo: 'IPI' },
  { codigo: '54', descricao: 'Saída tributada com alíquota por unidade de produto', tipo: 'IPI' },
  { codigo: '55', descricao: 'Saída tributada com alíquota por unidade de produto', tipo: 'IPI' },
  { codigo: '99', descricao: 'Outras saídas', tipo: 'IPI' }
];

// CSTs de PIS
const cstsPIS = [
  { codigo: '01', descricao: 'Operação tributável com alíquota básica', tipo: 'PIS' },
  { codigo: '02', descricao: 'Operação tributável com alíquota diferenciada', tipo: 'PIS' },
  { codigo: '03', descricao: 'Operação tributável com alíquota por unidade de medida de produto', tipo: 'PIS' },
  { codigo: '04', descricao: 'Operação tributável monofásica - revenda a alíquota zero', tipo: 'PIS' },
  { codigo: '05', descricao: 'Operação tributável por substituição tributária', tipo: 'PIS' },
  { codigo: '06', descricao: 'Operação tributável a alíquota zero', tipo: 'PIS' },
  { codigo: '07', descricao: 'Operação isenta da contribuição', tipo: 'PIS' },
  { codigo: '08', descricao: 'Operação sem incidência da contribuição', tipo: 'PIS' },
  { codigo: '09', descricao: 'Operação com suspensão da contribuição', tipo: 'PIS' },
  { codigo: '49', descricao: 'Outras operações de saída', tipo: 'PIS' },
  { codigo: '50', descricao: 'Operação com direito a crédito - vinculada exclusivamente a receita tributada no mercado interno', tipo: 'PIS' },
  { codigo: '51', descricao: 'Operação com direito a crédito - vinculada exclusivamente a receita não tributada no mercado interno', tipo: 'PIS' },
  { codigo: '52', descricao: 'Operação com direito a crédito - vinculada exclusivamente a receita de exportação', tipo: 'PIS' },
  { codigo: '53', descricao: 'Operação com direito a crédito - vinculada a receitas tributadas e não-tributadas no mercado interno', tipo: 'PIS' },
  { codigo: '54', descricao: 'Operação com direito a crédito - vinculada a receitas tributadas no mercado interno e de exportação', tipo: 'PIS' },
  { codigo: '55', descricao: 'Operação com direito a crédito - vinculada a receitas não-tributadas no mercado interno e de exportação', tipo: 'PIS' },
  { codigo: '56', descricao: 'Operação com direito a crédito - vinculada exclusivamente a receita de tributada no mercado interno', tipo: 'PIS' },
  { codigo: '60', descricao: 'Crédito presumido - operação de aquisição vinculada exclusivamente a receita tributada no mercado interno', tipo: 'PIS' },
  { codigo: '61', descricao: 'Crédito presumido - operação de aquisição vinculada exclusivamente a receita não-tributada no mercado interno', tipo: 'PIS' },
  { codigo: '62', descricao: 'Crédito presumido - operação de aquisição vinculada exclusivamente a receita de exportação', tipo: 'PIS' },
  { codigo: '63', descricao: 'Crédito presumido - operação de aquisição vinculada a receitas tributadas e não-tributadas no mercado interno', tipo: 'PIS' },
  { codigo: '64', descricao: 'Crédito presumido - operação de aquisição vinculada a receitas tributadas no mercado interno e de exportação', tipo: 'PIS' },
  { codigo: '65', descricao: 'Crédito presumido - operação de aquisição vinculada a receitas não-tributadas no mercado interno e de exportação', tipo: 'PIS' },
  { codigo: '66', descricao: 'Crédito presumido - operação de aquisição vinculada exclusivamente a receita de tributada no mercado interno', tipo: 'PIS' },
  { codigo: '67', descricao: 'Crédito presumido - outras operações', tipo: 'PIS' },
  { codigo: '70', descricao: 'Operação de aquisição sem direito a crédito', tipo: 'PIS' },
  { codigo: '71', descricao: 'Operação de aquisição com isenção', tipo: 'PIS' },
  { codigo: '72', descricao: 'Operação de aquisição com suspensão', tipo: 'PIS' },
  { codigo: '73', descricao: 'Operação de aquisição a alíquota zero', tipo: 'PIS' },
  { codigo: '74', descricao: 'Operação de aquisição sem incidência da contribuição', tipo: 'PIS' },
  { codigo: '75', descricao: 'Operação de aquisição por substituição tributária', tipo: 'PIS' },
  { codigo: '98', descricao: 'Outras operações de entrada', tipo: 'PIS' },
  { codigo: '99', descricao: 'Outras operações', tipo: 'PIS' }
];

// CSTs de COFINS
const cstsCOFINS = [
  { codigo: '01', descricao: 'Operação tributável com alíquota básica', tipo: 'COFINS' },
  { codigo: '02', descricao: 'Operação tributável com alíquota diferenciada', tipo: 'COFINS' },
  { codigo: '03', descricao: 'Operação tributável com alíquota por unidade de medida de produto', tipo: 'COFINS' },
  { codigo: '04', descricao: 'Operação tributável monofásica - revenda a alíquota zero', tipo: 'COFINS' },
  { codigo: '05', descricao: 'Operação tributável por substituição tributária', tipo: 'COFINS' },
  { codigo: '06', descricao: 'Operação tributável a alíquota zero', tipo: 'COFINS' },
  { codigo: '07', descricao: 'Operação isenta da contribuição', tipo: 'COFINS' },
  { codigo: '08', descricao: 'Operação sem incidência da contribuição', tipo: 'COFINS' },
  { codigo: '09', descricao: 'Operação com suspensão da contribuição', tipo: 'COFINS' },
  { codigo: '49', descricao: 'Outras operações de saída', tipo: 'COFINS' },
  { codigo: '50', descricao: 'Operação com direito a crédito - vinculada exclusivamente a receita tributada no mercado interno', tipo: 'COFINS' },
  { codigo: '51', descricao: 'Operação com direito a crédito - vinculada exclusivamente a receita não-tributada no mercado interno', tipo: 'COFINS' },
  { codigo: '52', descricao: 'Operação com direito a crédito - vinculada exclusivamente a receita de exportação', tipo: 'COFINS' },
  { codigo: '53', descricao: 'Operação com direito a crédito - vinculada a receitas tributadas e não-tributadas no mercado interno', tipo: 'COFINS' },
  { codigo: '54', descricao: 'Operação com direito a crédito - vinculada a receitas tributadas no mercado interno e de exportação', tipo: 'COFINS' },
  { codigo: '55', descricao: 'Operação com direito a crédito - vinculada a receitas não-tributadas no mercado interno e de exportação', tipo: 'COFINS' },
  { codigo: '56', descricao: 'Operação com direito a crédito - vinculada exclusivamente a receita de tributada no mercado interno', tipo: 'COFINS' },
  { codigo: '60', descricao: 'Crédito presumido - operação de aquisição vinculada exclusivamente a receita tributada no mercado interno', tipo: 'COFINS' },
  { codigo: '61', descricao: 'Crédito presumido - operação de aquisição vinculada exclusivamente a receita não-tributada no mercado interno', tipo: 'COFINS' },
  { codigo: '62', descricao: 'Crédito presumido - operação de aquisição vinculada exclusivamente a receita de exportação', tipo: 'COFINS' },
  { codigo: '63', descricao: 'Crédito presumido - operação de aquisição vinculada a receitas tributadas e não-tributadas no mercado interno', tipo: 'COFINS' },
  { codigo: '64', descricao: 'Crédito presumido - operação de aquisição vinculada a receitas tributadas no mercado interno e de exportação', tipo: 'COFINS' },
  { codigo: '65', descricao: 'Crédito presumido - operação de aquisição vinculada a receitas não-tributadas no mercado interno e de exportação', tipo: 'COFINS' },
  { codigo: '66', descricao: 'Crédito presumido - operação de aquisição vinculada exclusivamente a receita de tributada no mercado interno', tipo: 'COFINS' },
  { codigo: '67', descricao: 'Crédito presumido - outras operações', tipo: 'COFINS' },
  { codigo: '70', descricao: 'Operação de aquisição sem direito a crédito', tipo: 'COFINS' },
  { codigo: '71', descricao: 'Operação de aquisição com isenção', tipo: 'COFINS' },
  { codigo: '72', descricao: 'Operação de aquisição com suspensão', tipo: 'COFINS' },
  { codigo: '73', descricao: 'Operação de aquisição a alíquota zero', tipo: 'COFINS' },
  { codigo: '74', descricao: 'Operação de aquisição sem incidência da contribuição', tipo: 'COFINS' },
  { codigo: '75', descricao: 'Operação de aquisição por substituição tributária', tipo: 'COFINS' },
  { codigo: '98', descricao: 'Outras operações de entrada', tipo: 'COFINS' },
  { codigo: '99', descricao: 'Outras operações', tipo: 'COFINS' }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') as 'ICMS' | 'IPI' | 'PIS' | 'COFINS' | null;
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let results: any[] = [];
    
    if (!tipo) {
      // Retornar todos os CSTs
      results = [...cstsICMS, ...cstsIPI, ...cstsPIS, ...cstsCOFINS];
    } else {
      // Filtrar por tipo
      switch (tipo) {
        case 'ICMS':
          results = cstsICMS;
          break;
        case 'IPI':
          results = cstsIPI;
          break;
        case 'PIS':
          results = cstsPIS;
          break;
        case 'COFINS':
          results = cstsCOFINS;
          break;
        default:
          results = [];
      }
    }
    
    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Erro ao buscar CSTs:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
