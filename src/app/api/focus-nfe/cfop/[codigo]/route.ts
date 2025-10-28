import { NextRequest, NextResponse } from 'next/server';

// Mock de dados CFOP para desenvolvimento
const mockCFOPs: Record<string, { codigo: string; descricao: string; valid: boolean }> = {
  '1101': {
    codigo: '1101',
    descricao: 'Compra para industrialização',
    valid: true
  },
  '1102': {
    codigo: '1102',
    descricao: 'Compra para comercialização',
    valid: true
  },
  '1111': {
    codigo: '1111',
    descricao: 'Compra para industrialização de produto importado',
    valid: true
  },
  '1112': {
    codigo: '1112',
    descricao: 'Compra para comercialização de produto importado',
    valid: true
  },
  '1113': {
    codigo: '1113',
    descricao: 'Compra para industrialização de produto importado sob regime de drawback',
    valid: true
  },
  '1114': {
    codigo: '1114',
    descricao: 'Compra para comercialização de produto importado sob regime de drawback',
    valid: true
  },
  '1115': {
    codigo: '1115',
    descricao: 'Compra para industrialização de produto importado sob regime de drawback',
    valid: true
  },
  '1116': {
    codigo: '1116',
    descricao: 'Compra para comercialização de produto importado sob regime de drawback',
    valid: true
  },
  '1117': {
    codigo: '1117',
    descricao: 'Compra para industrialização de produto importado sob regime de drawback',
    valid: true
  },
  '1118': {
    codigo: '1118',
    descricao: 'Compra para comercialização de produto importado sob regime de drawback',
    valid: true
  },
  '1119': {
    codigo: '1119',
    descricao: 'Compra para industrialização de produto importado sob regime de drawback',
    valid: true
  },
  '1120': {
    codigo: '1120',
    descricao: 'Compra para comercialização de produto importado sob regime de drawback',
    valid: true
  },
  '5101': {
    codigo: '5101',
    descricao: 'Venda para industrialização',
    valid: true
  },
  '5102': {
    codigo: '5102',
    descricao: 'Venda para comercialização',
    valid: true
  },
  '5103': {
    codigo: '5103',
    descricao: 'Venda para industrialização de produto importado',
    valid: true
  },
  '5104': {
    codigo: '5104',
    descricao: 'Venda para comercialização de produto importado',
    valid: true
  },
  '5105': {
    codigo: '5105',
    descricao: 'Venda para industrialização de produto importado sob regime de drawback',
    valid: true
  },
  '5106': {
    codigo: '5106',
    descricao: 'Venda para comercialização de produto importado sob regime de drawback',
    valid: true
  },
  '5107': {
    codigo: '5107',
    descricao: 'Venda para industrialização de produto importado sob regime de drawback',
    valid: true
  },
  '5108': {
    codigo: '5108',
    descricao: 'Venda para comercialização de produto importado sob regime de drawback',
    valid: true
  },
  '5109': {
    codigo: '5109',
    descricao: 'Venda para industrialização de produto importado sob regime de drawback',
    valid: true
  },
  '5110': {
    codigo: '5110',
    descricao: 'Venda para comercialização de produto importado sob regime de drawback',
    valid: true
  },
  '5111': {
    codigo: '5111',
    descricao: 'Venda para industrialização de produto importado sob regime de drawback',
    valid: true
  },
  '5112': {
    codigo: '5112',
    descricao: 'Venda para comercialização de produto importado sob regime de drawback',
    valid: true
  },
  '5113': {
    codigo: '5113',
    descricao: 'Venda para industrialização de produto importado sob regime de drawback',
    valid: true
  },
  '5114': {
    codigo: '5114',
    descricao: 'Venda para comercialização de produto importado sob regime de drawback',
    valid: true
  },
  '5115': {
    codigo: '5115',
    descricao: 'Venda para industrialização de produto importado sob regime de drawback',
    valid: true
  },
  '5116': {
    codigo: '5116',
    descricao: 'Venda para comercialização de produto importado sob regime de drawback',
    valid: true
  },
  '5117': {
    codigo: '5117',
    descricao: 'Venda para industrialização de produto importado sob regime de drawback',
    valid: true
  },
  '5118': {
    codigo: '5118',
    descricao: 'Venda para comercialização de produto importado sob regime de drawback',
    valid: true
  },
  '5119': {
    codigo: '5119',
    descricao: 'Venda para industrialização de produto importado sob regime de drawback',
    valid: true
  },
  '5120': {
    codigo: '5120',
    descricao: 'Venda para comercialização de produto importado sob regime de drawback',
    valid: true
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cfopData = mockCFOPs[codigo];
    
    if (!cfopData) {
      return NextResponse.json({
        success: false,
        error: 'CFOP não encontrado'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: cfopData
    });
  } catch (error) {
    console.error('Erro ao consultar CFOP:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}