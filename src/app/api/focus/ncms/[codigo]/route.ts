import { NextRequest, NextResponse } from 'next/server';
import { getEmpresaFocusConfig } from '@/lib/services/empresaService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  // Capturar empresaId antes do try para usar no catch
  const { searchParams } = new URL(request.url);
  const empresaId = searchParams.get('empresa_id');
  
  try {
    const { codigo } = await params;

    if (!codigo || !/^\d{8}$/.test(codigo)) {
      return NextResponse.json(
        { success: false, error: 'Código NCM inválido' },
        { status: 400 }
      );
    }
    
    // Carregar token/env: empresa -> fallback .env (mesmo padrão da FASE 2)
    let apiToken = process.env.NEXT_PUBLIC_FOCUS_NFE_TOKEN || '';
    let environment = (process.env.NEXT_PUBLIC_FOCUS_NFE_ENVIRONMENT as 'homologacao' | 'producao') || 'homologacao';
    
    if (empresaId) {
      try {
        const empresaConfig = await getEmpresaFocusConfig(empresaId);
        if (empresaConfig?.focus_nfe_token && empresaConfig.focus_nfe_ativo) {
          apiToken = empresaConfig.focus_nfe_token;
          environment = empresaConfig.focus_nfe_environment;
          console.log(`[NCM] Usando token FOCUS NFE da empresa ${empresaId} (${environment})`);
        } else {
          console.warn(`[NCM] Empresa ${empresaId} sem token ativo. Usando token global/env.`);
        }
      } catch (e) {
        console.warn('[NCM] Falha ao obter config da empresa. Usando token global/env.');
      }
    }
    
    // Se não há token, retornar erro (se empresaId presente) ou dados locais (sem empresaId)
    if (!apiToken) {
      if (empresaId) {
        return NextResponse.json(
          {
            success: false,
            error: { codigo: 'TOKEN_INDISPONIVEL', mensagem: 'Token FOCUS NFE não configurado' }
          },
          { status: 400 }
        );
      }
      console.warn('[NCM] Token FOCUS NFE não configurado, usando dados locais');
      const ncmLocal = getNCMIndividualLocal(codigo);
      if (ncmLocal) {
        return NextResponse.json({
          success: true,
          data: ncmLocal,
          source: 'local'
        });
      }
      return NextResponse.json(
        { success: false, error: 'NCM não encontrado' },
        { status: 404 }
      );
    }

    // Tentar ambos os ambientes
    const hosts: Array<{ env: 'homologacao' | 'producao'; url: string }> = [
      { env: environment, url: environment === 'homologacao' ? 'https://homologacao.focusnfe.com.br' : 'https://api.focusnfe.com.br' },
      { env: environment === 'producao' ? 'homologacao' : 'producao', url: environment === 'producao' ? 'https://homologacao.focusnfe.com.br' : 'https://api.focusnfe.com.br' },
    ];

    let data: any = null;
    let lastErrorText = '';
    let lastStatus = 0;

    for (const host of hosts) {
      const url = `${host.url}/v2/ncms/${codigo}`;
      console.log(`[NCM] Tentando buscar NCM individual: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(apiToken + ':').toString('base64')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        lastStatus = response.status;
        lastErrorText = await response.text();
        
        if (response.status === 401) {
          console.warn(`[NCM] Token inválido (401) no ambiente ${host.env}, tentando próximo...`);
          continue;
        }
        
        console.warn(`[NCM] Erro ${response.status}, tentando próximo ambiente...`);
        continue;
      }

      try {
        data = await response.json();
        console.log(`[NCM] Sucesso! NCM encontrado no ambiente ${host.env}`);
        break;
      } catch (e) {
        console.warn('[NCM] Resposta não é JSON válido, tentando próximo...');
        continue;
      }
    }

    if (!data) {
      console.error('[NCM] Erro Focus NFe (última tentativa):', lastStatus, lastErrorText);
      
      // Se 401 após tentar todos os hosts, token está inválido
      if (lastStatus === 401) {
        const mensagemErro = empresaId
          ? 'Token FOCUS NFE inválido. Configure um token válido na empresa ou no sistema.'
          : 'Token FOCUS NFE não configurado ou inválido. Configure NEXT_PUBLIC_FOCUS_NFE_TOKEN no .env ou configure token na empresa.';
        
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              codigo: 'NAO_AUTORIZADO', 
              mensagem: mensagemErro 
            } 
          }, 
          { status: 401 }
        );
      }
      
      // Se empresaId presente, não retornar dados locais
      if (empresaId) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              codigo: 'ERRO_API', 
              mensagem: lastErrorText || 'Erro ao conectar com a API Focus NFe. Verifique sua conexão.' 
            } 
          }, 
          { status: lastStatus || 502 }
        );
      }
      
      // Sem empresaId: tentar dados locais como fallback
      const ncmLocal = getNCMIndividualLocal(codigo);
      if (ncmLocal) {
        return NextResponse.json({
          success: true,
          data: ncmLocal,
          source: 'local_fallback',
          error: `API FOCUS NFE retornou ${lastStatus}: ${lastErrorText}`
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'NCM não encontrado' },
        { status: lastStatus || 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      source: 'focus_nfe'
    });

  } catch (error) {
    console.error('[NCM] Erro no proxy individual:', error);
    
    // Se empresaId presente, não retornar dados locais
    const { codigo } = await params;
    
    if (empresaId) {
      return NextResponse.json(
        {
          success: false,
          error: { codigo: 'ERRO_REDE', mensagem: error instanceof Error ? error.message : 'Erro de conexão com a API FOCUS NFE' }
        },
        { status: 500 }
      );
    }
    
    // Sem empresaId: tentar dados locais como fallback
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
