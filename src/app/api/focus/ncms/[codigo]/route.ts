import { NextRequest, NextResponse } from 'next/server';
import { getEmpresaFocusConfig } from '@/lib/services/empresaService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;

    if (!codigo || !/^\d{8}$/.test(codigo)) {
      return NextResponse.json(
        { success: false, error: 'Código NCM inválido' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresa_id');
    
    // Buscar configuração FOCUS NFE da empresa
    let apiToken = process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN;
    let environment = process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT || 'homologacao';
    
    if (empresaId) {
      const empresaConfig = await getEmpresaFocusConfig(empresaId);
      if (empresaConfig?.focus_nfe_token && empresaConfig.focus_nfe_ativo) {
        apiToken = empresaConfig.focus_nfe_token;
        environment = empresaConfig.focus_nfe_environment;
        console.log(`Usando token FOCUS NFE da empresa ${empresaId} (${environment})`);
      } else {
        console.warn(`Empresa ${empresaId} não tem token FOCUS NFE configurado ou ativo`);
      }
    }
    
    // Se não há token, retornar dados locais
    if (!apiToken) {
      console.warn('Token FOCUS NFE não configurado, usando dados locais');
      const ncmLocal = getNCMIndividualLocal(codigo);
      if (ncmLocal) {
        return NextResponse.json({
          success: true,
          data: ncmLocal,
          source: 'local'
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'NCM não encontrado' },
          { status: 404 }
        );
      }
    }

    const baseUrl = environment === 'homologacao' 
      ? 'https://homologacao.focusnfe.com.br' 
      : 'https://api.focusnfe.com.br';

    const url = `${baseUrl}/v2/ncms/${codigo}`;

    console.log('Chamando API FOCUS NFE para NCM individual:', url);

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
      const ncmLocal = getNCMIndividualLocal(codigo);
      if (ncmLocal) {
        return NextResponse.json({
          success: true,
          data: ncmLocal,
          source: 'local_fallback',
          error: `API FOCUS NFE retornou ${response.status}: ${errorText}`
        });
      }
      return NextResponse.json(
        { success: false, error: 'NCM não encontrado' },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('API FOCUS NFE retornou NCM individual:', data);

    return NextResponse.json({
      success: true,
      data: data,
      source: 'focus_nfe'
    });

  } catch (error) {
    console.error('Erro no proxy NCM individual:', error);
    // Tentar dados locais em caso de erro
    const { codigo } = await params;
    const ncmLocal = getNCMIndividualLocal(codigo);
    if (ncmLocal) {
      return NextResponse.json({
        success: true,
        data: ncmLocal,
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

function getNCMIndividualLocal(codigo: string) {
  const ncmsLocais: Record<string, any> = {
    '85171200': {
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
    '84713000': {
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
    '90049090': {
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
  };

  return ncmsLocais[codigo] || null;
}
