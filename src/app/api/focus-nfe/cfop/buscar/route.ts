import { NextRequest, NextResponse } from 'next/server';

// Mock de dados CFOP mais completo
const mockCFOPs: Record<string, { codigo: string; descricao: string; valid: boolean; tipo: 'ENTRADA' | 'SAIDA' }> = {
  // CFOPs de Entrada
  '1101': { codigo: '1101', descricao: 'Compra para industrialização', valid: true, tipo: 'ENTRADA' },
  '1102': { codigo: '1102', descricao: 'Compra para comercialização', valid: true, tipo: 'ENTRADA' },
  '1111': { codigo: '1111', descricao: 'Compra para industrialização de produto importado', valid: true, tipo: 'ENTRADA' },
  '1112': { codigo: '1112', descricao: 'Compra para comercialização de produto importado', valid: true, tipo: 'ENTRADA' },
  '1113': { codigo: '1113', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1114': { codigo: '1114', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1115': { codigo: '1115', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1116': { codigo: '1116', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1117': { codigo: '1117', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1118': { codigo: '1118', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1119': { codigo: '1119', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1120': { codigo: '1120', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1121': { codigo: '1121', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1122': { codigo: '1122', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1123': { codigo: '1123', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1124': { codigo: '1124', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1125': { codigo: '1125', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1126': { codigo: '1126', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1127': { codigo: '1127', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1128': { codigo: '1128', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1129': { codigo: '1129', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1130': { codigo: '1130', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1131': { codigo: '1131', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1132': { codigo: '1132', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1133': { codigo: '1133', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1134': { codigo: '1134', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1135': { codigo: '1135', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1136': { codigo: '1136', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1137': { codigo: '1137', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1138': { codigo: '1138', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1139': { codigo: '1139', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1140': { codigo: '1140', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1141': { codigo: '1141', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1142': { codigo: '1142', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1143': { codigo: '1143', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1144': { codigo: '1144', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1145': { codigo: '1145', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1146': { codigo: '1146', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1147': { codigo: '1147', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1148': { codigo: '1148', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1149': { codigo: '1149', descricao: 'Compra para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  '1150': { codigo: '1150', descricao: 'Compra para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'ENTRADA' },
  
  // CFOPs de Saída
  '5101': { codigo: '5101', descricao: 'Venda para industrialização', valid: true, tipo: 'SAIDA' },
  '5102': { codigo: '5102', descricao: 'Venda para comercialização', valid: true, tipo: 'SAIDA' },
  '5103': { codigo: '5103', descricao: 'Venda para industrialização de produto importado', valid: true, tipo: 'SAIDA' },
  '5104': { codigo: '5104', descricao: 'Venda para comercialização de produto importado', valid: true, tipo: 'SAIDA' },
  '5105': { codigo: '5105', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5106': { codigo: '5106', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5107': { codigo: '5107', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5108': { codigo: '5108', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5109': { codigo: '5109', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5110': { codigo: '5110', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5111': { codigo: '5111', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5112': { codigo: '5112', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5113': { codigo: '5113', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5114': { codigo: '5114', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5115': { codigo: '5115', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5116': { codigo: '5116', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5117': { codigo: '5117', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5118': { codigo: '5118', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5119': { codigo: '5119', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5120': { codigo: '5120', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5121': { codigo: '5121', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5122': { codigo: '5122', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5123': { codigo: '5123', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5124': { codigo: '5124', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5125': { codigo: '5125', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5126': { codigo: '5126', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5127': { codigo: '5127', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5128': { codigo: '5128', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5129': { codigo: '5129', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5130': { codigo: '5130', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5131': { codigo: '5131', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5132': { codigo: '5132', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5133': { codigo: '5133', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5134': { codigo: '5134', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5135': { codigo: '5135', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5136': { codigo: '5136', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5137': { codigo: '5137', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5138': { codigo: '5138', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5139': { codigo: '5139', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5140': { codigo: '5140', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5141': { codigo: '5141', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5142': { codigo: '5142', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5143': { codigo: '5143', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5144': { codigo: '5144', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5145': { codigo: '5145', descricao: 'Venda para industrialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5146': { codigo: '5146', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5147': { codigo: '5147', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5148': { codigo: '5148', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5149': { codigo: '5149', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' },
  '5150': { codigo: '5150', descricao: 'Venda para comercialização de produto importado sob regime de drawback', valid: true, tipo: 'SAIDA' }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const tipo = searchParams.get('tipo') as 'ENTRADA' | 'SAIDA' | null;
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let results = Object.values(mockCFOPs);
    
    // Filtrar por tipo se especificado
    if (tipo) {
      results = results.filter(cfop => cfop.tipo === tipo);
    }
    
    // Buscar CFOPs que contenham o código ou descrição
    if (query) {
      results = results.filter(cfop => 
        cfop.codigo.includes(query) || 
        cfop.descricao.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    return NextResponse.json({
      success: true,
      data: results.slice(0, 20) // Limitar a 20 resultados
    });
  } catch (error) {
    console.error('Erro ao buscar CFOPs:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
