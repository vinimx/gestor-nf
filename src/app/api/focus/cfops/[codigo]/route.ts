import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { codigo: string } }
) {
  try {
    const { codigo } = params;

    if (!codigo || !/^\d{4}$/.test(codigo)) {
      return NextResponse.json(
        { success: false, error: 'Código CFOP inválido' },
        { status: 400 }
      );
    }

    const apiToken = process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN;
    const environment = process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT || 'homologacao';
    
    // Se não há token, retornar dados locais
    if (!apiToken) {
      console.warn('Token FOCUS NFE não configurado, usando dados locais');
      const cfopLocal = getCFOPIndividualLocal(codigo);
      if (cfopLocal) {
        return NextResponse.json({
          success: true,
          data: cfopLocal,
          source: 'local'
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'CFOP não encontrado' },
          { status: 404 }
        );
      }
    }

    const baseUrl = environment === 'homologacao' 
      ? 'https://homologacao.focusnfe.com.br' 
      : 'https://api.focusnfe.com.br';

    const url = `${baseUrl}/v2/cfops/${codigo}`;

    console.log('Chamando API FOCUS NFE para CFOP individual:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(apiToken + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API FOCUS NFE:', response.status, errorText);
      // Tentar dados locais em caso de erro
      const cfopLocal = getCFOPIndividualLocal(codigo);
      if (cfopLocal) {
        return NextResponse.json({
          success: true,
          data: cfopLocal,
          source: 'local_fallback',
          error: `API FOCUS NFE retornou ${response.status}: ${errorText}`
        });
      }
      return NextResponse.json(
        { success: false, error: 'CFOP não encontrado' },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('API FOCUS NFE retornou CFOP individual:', data);

    return NextResponse.json({
      success: true,
      data: data,
      source: 'focus_nfe'
    });

  } catch (error) {
    console.error('Erro no proxy CFOP individual:', error);
    // Tentar dados locais em caso de erro
    const cfopLocal = getCFOPIndividualLocal(params.codigo);
    if (cfopLocal) {
      return NextResponse.json({
        success: true,
        data: cfopLocal,
        source: 'local_fallback',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function getCFOPIndividualLocal(codigo: string) {
  const cfopsLocais: Record<string, any> = {
    '5101': {
      codigo: '5101',
      descricao: '5101 - Venda de produção do estabelecimento',
      valid: true,
      tipo: 'SAIDA'
    },
    '5102': {
      codigo: '5102',
      descricao: '5102 - Venda de mercadoria adquirida ou recebida de terceiros',
      valid: true,
      tipo: 'SAIDA'
    },
    '5103': {
      codigo: '5103',
      descricao: '5103 - Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento',
      valid: true,
      tipo: 'SAIDA'
    },
    '1101': {
      codigo: '1101',
      descricao: '1101 - Compra para industrialização',
      valid: true,
      tipo: 'ENTRADA'
    },
    '1102': {
      codigo: '1102',
      descricao: '1102 - Compra para comercialização',
      valid: true,
      tipo: 'ENTRADA'
    },
    '1103': {
      codigo: '1103',
      descricao: '1103 - Compra para industrialização de produto sujeito ao regime de substituição tributária',
      valid: true,
      tipo: 'ENTRADA'
    },
    '2151': {
      codigo: '2151',
      descricao: '2151 - Transferência p/ industrialização ou produção rural',
      valid: true,
      tipo: 'ENTRADA'
    },
    '2152': {
      codigo: '2152',
      descricao: '2152 - Transferência p/ comercialização',
      valid: true,
      tipo: 'ENTRADA'
    }
  };

  return cfopsLocais[codigo] || null;
}
