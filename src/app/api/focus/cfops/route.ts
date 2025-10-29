import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');
    const descricao = searchParams.get('descricao');
    const limit = parseInt(searchParams.get('limit') || '50'); // FOCUS NFE retorna 50 por padrão
    const offset = parseInt(searchParams.get('offset') || '0');

    const apiToken = process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN;
    const environment = process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT || 'homologacao';
    
    // Se não há token, retornar dados locais
    if (!apiToken) {
      console.warn('Token FOCUS NFE não configurado, usando dados locais');
      return NextResponse.json({
        success: true,
        data: getCFOPsLocais(codigo, descricao, limit, offset),
        totalCount: 8,
        source: 'local'
      });
    }

    // URL base conforme documentação FOCUS NFE
    const baseUrl = environment === 'homologacao' 
      ? 'https://homologacao.focusnfe.com.br' 
      : 'https://api.focusnfe.com.br';

    let url = `${baseUrl}/v2/cfops`;
    const queryParams = new URLSearchParams();
    
    // Parâmetros conforme documentação FOCUS NFE
    if (codigo) queryParams.append('codigo', codigo);
    if (descricao) queryParams.append('descricao', descricao);
    if (offset > 0) queryParams.append('offset', offset.toString());
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    console.log('Chamando API FOCUS NFE:', url);

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
      // Retornar dados locais em caso de erro
      return NextResponse.json({
        success: true,
        data: getCFOPsLocais(codigo, descricao, limit, offset),
        totalCount: 8,
        source: 'local_fallback',
        error: `API FOCUS NFE retornou ${response.status}: ${errorText}`
      });
    }

    const data = await response.json();
    const totalCount = response.headers.get('X-Total-Count');

    console.log(`API FOCUS NFE retornou ${data.length} CFOPs, total: ${totalCount}`);

    return NextResponse.json({
      success: true,
      data: data,
      totalCount: totalCount ? parseInt(totalCount) : data.length,
      source: 'focus_nfe'
    });

  } catch (error) {
    console.error('Erro no proxy CFOP:', error);
    // Retornar dados locais em caso de erro
    return NextResponse.json({
      success: true,
      data: getCFOPsLocais(),
      totalCount: 8,
      source: 'local_fallback',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

function getCFOPsLocais(codigo?: string | null, descricao?: string | null, limit: number = 20, offset: number = 0) {
  const cfopsLocais = [
    {
      codigo: '5101',
      descricao: '5101 - Venda de produção do estabelecimento',
      valid: true,
      tipo: 'SAIDA'
    },
    {
      codigo: '5102',
      descricao: '5102 - Venda de mercadoria adquirida ou recebida de terceiros',
      valid: true,
      tipo: 'SAIDA'
    },
    {
      codigo: '5103',
      descricao: '5103 - Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento',
      valid: true,
      tipo: 'SAIDA'
    },
    {
      codigo: '1101',
      descricao: '1101 - Compra para industrialização',
      valid: true,
      tipo: 'ENTRADA'
    },
    {
      codigo: '1102',
      descricao: '1102 - Compra para comercialização',
      valid: true,
      tipo: 'ENTRADA'
    },
    {
      codigo: '1103',
      descricao: '1103 - Compra para industrialização de produto sujeito ao regime de substituição tributária',
      valid: true,
      tipo: 'ENTRADA'
    },
    {
      codigo: '2151',
      descricao: '2151 - Transferência p/ industrialização ou produção rural',
      valid: true,
      tipo: 'ENTRADA'
    },
    {
      codigo: '2152',
      descricao: '2152 - Transferência p/ comercialização',
      valid: true,
      tipo: 'ENTRADA'
    }
  ];

  let resultados = cfopsLocais;

  // Aplicar filtros
  if (codigo) {
    resultados = resultados.filter(cfop => 
      cfop.codigo.includes(codigo)
    );
  }

  if (descricao) {
    resultados = resultados.filter(cfop => 
      cfop.descricao.toLowerCase().includes(descricao.toLowerCase())
    );
  }

  // Aplicar paginação
  const startIndex = offset;
  const endIndex = startIndex + limit;
  resultados = resultados.slice(startIndex, endIndex);

  return resultados;
}
