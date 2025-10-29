import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');
    const descricao = searchParams.get('descricao');
    const capitulo = searchParams.get('capitulo');
    const posicao = searchParams.get('posicao');
    const subposicao1 = searchParams.get('subposicao1');
    const subposicao2 = searchParams.get('subposicao2');
    const item1 = searchParams.get('item1');
    const item2 = searchParams.get('item2');
    const limit = parseInt(searchParams.get('limit') || '50'); // FOCUS NFE retorna 50 por padrão
    const offset = parseInt(searchParams.get('offset') || '0');

    const apiToken = process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN;
    const environment = process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT || 'homologacao';
    
    // Se não há token, retornar dados locais
    if (!apiToken) {
      console.warn('Token FOCUS NFE não configurado, usando dados locais');
      return NextResponse.json({
        success: true,
        data: getNCMsLocais(codigo, descricao, limit, offset),
        totalCount: 3,
        source: 'local'
      });
    }

    // URL base conforme documentação FOCUS NFE
    const baseUrl = environment === 'homologacao' 
      ? 'https://homologacao.focusnfe.com.br' 
      : 'https://api.focusnfe.com.br';

    let url = `${baseUrl}/v2/ncms`;
    const queryParams = new URLSearchParams();
    
    // Parâmetros conforme documentação FOCUS NFE
    if (codigo) queryParams.append('codigo', codigo);
    if (descricao) queryParams.append('descricao', descricao);
    if (capitulo) queryParams.append('capitulo', capitulo);
    if (posicao) queryParams.append('posicao', posicao);
    if (subposicao1) queryParams.append('subposicao1', subposicao1);
    if (subposicao2) queryParams.append('subposicao2', subposicao2);
    if (item1) queryParams.append('item1', item1);
    if (item2) queryParams.append('item2', item2);
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
        data: getNCMsLocais(codigo, descricao, limit, offset),
        totalCount: 3,
        source: 'local_fallback',
        error: `API FOCUS NFE retornou ${response.status}: ${errorText}`
      });
    }

    const data = await response.json();
    const totalCount = response.headers.get('X-Total-Count');

    console.log(`API FOCUS NFE retornou ${data.length} NCMs, total: ${totalCount}`);

    return NextResponse.json({
      success: true,
      data: data,
      totalCount: totalCount ? parseInt(totalCount) : data.length,
      source: 'focus_nfe'
    });

  } catch (error) {
    console.error('Erro no proxy NCM:', error);
    // Retornar dados locais em caso de erro
    return NextResponse.json({
      success: true,
      data: getNCMsLocais(),
      totalCount: 3,
      source: 'local_fallback',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

function getNCMsLocais(codigo?: string | null, descricao?: string | null, limit: number = 20, offset: number = 0) {
  const ncmsLocais = [
    {
      codigo: '85171200',
      descricao_completa: 'Telefones celulares e outros equipamentos de comunicação',
      capitulo: '85',
      posicao: '17',
      subposicao1: '1',
      subposicao2: '2',
      item1: '0',
      item2: '0',
      valid: true
    },
    {
      codigo: '84713000',
      descricao_completa: 'Máquinas de processamento de dados e suas unidades',
      capitulo: '84',
      posicao: '71',
      subposicao1: '3',
      subposicao2: '0',
      item1: '0',
      item2: '0',
      valid: true
    },
    {
      codigo: '90049090',
      descricao_completa: 'Óculos para correção, proteção ou outros fins, e artigos semelhantes',
      capitulo: '90',
      posicao: '04',
      subposicao1: '9',
      subposicao2: '0',
      item1: '9',
      item2: '0',
      valid: true
    }
  ];

  let resultados = ncmsLocais;

  // Aplicar filtros
  if (codigo) {
    resultados = resultados.filter(ncm => 
      ncm.codigo.includes(codigo)
    );
  }

  if (descricao) {
    resultados = resultados.filter(ncm => 
      ncm.descricao_completa.toLowerCase().includes(descricao.toLowerCase())
    );
  }

  // Aplicar paginação
  const startIndex = offset;
  const endIndex = startIndex + limit;
  resultados = resultados.slice(startIndex, endIndex);

  return resultados;
}
