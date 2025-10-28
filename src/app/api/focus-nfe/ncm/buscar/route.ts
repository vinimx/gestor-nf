import { NextRequest, NextResponse } from 'next/server';

// Mock de dados NCM mais completo
const mockNCMs: Record<string, { codigo: string; descricao: string; unidade: string; valid: boolean }> = {
  '12345678': { codigo: '12345678', descricao: 'Produtos de informática e equipamentos de processamento de dados', unidade: 'UN', valid: true },
  '12345679': { codigo: '12345679', descricao: 'Produtos eletrônicos e componentes', unidade: 'UN', valid: true },
  '12345680': { codigo: '12345680', descricao: 'Produtos de telecomunicações', unidade: 'UN', valid: true },
  '12345681': { codigo: '12345681', descricao: 'Produtos de automação industrial', unidade: 'UN', valid: true },
  '12345682': { codigo: '12345682', descricao: 'Produtos de energia e equipamentos elétricos', unidade: 'UN', valid: true },
  '12345683': { codigo: '12345683', descricao: 'Produtos de iluminação e luminárias', unidade: 'UN', valid: true },
  '12345684': { codigo: '12345684', descricao: 'Produtos de segurança e monitoramento', unidade: 'UN', valid: true },
  '12345685': { codigo: '12345685', descricao: 'Produtos de entretenimento e áudio/vídeo', unidade: 'UN', valid: true },
  '12345686': { codigo: '12345686', descricao: 'Produtos de escritório e mobiliário', unidade: 'UN', valid: true },
  '12345687': { codigo: '12345687', descricao: 'Produtos de limpeza e manutenção', unidade: 'UN', valid: true },
  '12345688': { codigo: '12345688', descricao: 'Produtos de construção e materiais', unidade: 'UN', valid: true },
  '12345689': { codigo: '12345689', descricao: 'Produtos de jardinagem e paisagismo', unidade: 'UN', valid: true },
  '12345690': { codigo: '12345690', descricao: 'Produtos de esporte e lazer', unidade: 'UN', valid: true },
  '12345691': { codigo: '12345691', descricao: 'Produtos de saúde e bem-estar', unidade: 'UN', valid: true },
  '12345692': { codigo: '12345692', descricao: 'Produtos de alimentação e bebidas', unidade: 'UN', valid: true },
  '12345693': { codigo: '12345693', descricao: 'Produtos de vestuário e acessórios', unidade: 'UN', valid: true },
  '12345694': { codigo: '12345694', descricao: 'Produtos de calçados e couro', unidade: 'UN', valid: true },
  '12345695': { codigo: '12345695', descricao: 'Produtos de cosméticos e higiene', unidade: 'UN', valid: true },
  '12345696': { codigo: '12345696', descricao: 'Produtos de decoração e artesanato', unidade: 'UN', valid: true },
  '12345697': { codigo: '12345697', descricao: 'Produtos de brinquedos e jogos', unidade: 'UN', valid: true },
  '12345698': { codigo: '12345698', descricao: 'Produtos de livros e material didático', unidade: 'UN', valid: true },
  '12345699': { codigo: '12345699', descricao: 'Produtos de papelaria e escritório', unidade: 'UN', valid: true },
  '12345700': { codigo: '12345700', descricao: 'Produtos de ferramentas e equipamentos', unidade: 'UN', valid: true }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!query) {
      return NextResponse.json({
        success: true,
        data: Object.values(mockNCMs).slice(0, 10)
      });
    }
    
    // Buscar NCMs que contenham o código ou descrição
    const results = Object.values(mockNCMs).filter(ncm => 
      ncm.codigo.includes(query) || 
      ncm.descricao.toLowerCase().includes(query.toLowerCase())
    );
    
    return NextResponse.json({
      success: true,
      data: results.slice(0, 20) // Limitar a 20 resultados
    });
  } catch (error) {
    console.error('Erro ao buscar NCMs:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
