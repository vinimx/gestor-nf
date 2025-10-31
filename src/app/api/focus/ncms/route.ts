import { NextRequest, NextResponse } from 'next/server';
import { getEmpresaFocusConfig } from '@/lib/services/empresaService';

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

    const empresaId = searchParams.get('empresa_id');
    
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

    // Construir URLs (tentar múltiplas variações como na FASE 2)
    const buildCandidates = (base: string) => [
      `${base}/v2/ncms`,
      `${base}/v2/ncms/`,
    ];

    let url = '';
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
    if (limit > 0) queryParams.append('limit', limit.toString());
    if (offset > 0) queryParams.append('offset', offset.toString());

    const hosts: Array<{ env: 'homologacao' | 'producao'; url: string }> = [
      { env: environment, url: baseUrl },
      { env: environment === 'producao' ? 'homologacao' : 'producao', url: environment === 'producao' ? 'https://homologacao.focusnfe.com.br' : 'https://api.focusnfe.com.br' },
    ];

    let data: any = null;
    let lastErrorText = '';
    let lastStatus = 0;
    let usedEnv: 'homologacao' | 'producao' = environment;

    console.log('[NCM] Tentando buscar da API FOCUS NFE...');

    outer: for (const host of hosts) {
      const endpoints = buildCandidates(host.url);
      for (let baseUrlCandidate of endpoints) {
        const queryString = queryParams.toString();
        const fullUrl = queryString ? `${baseUrlCandidate}?${queryString}` : baseUrlCandidate;
        
        console.log(`[NCM] Tentando: ${fullUrl}`);

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(apiToken + ':').toString('base64')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'gestor-nf/1.0 (+https://localhost)'
          },
          next: { revalidate: 0 }
        });

        if (!response.ok) {
          lastStatus = response.status;
          const errorText = await response.text();
          lastErrorText = errorText;
          
          // Não retornar 401 imediatamente - tentar todos os hosts primeiro
          if (response.status === 401) {
            console.warn(`[NCM] Token inválido (401) no ambiente ${host.env}, tentando próximo...`);
            // Continuar para tentar próximo host/ambiente
            continue;
          }
          
          console.warn(`[NCM] Erro ${response.status}, tentando próximo endpoint...`);
          continue;
        }

        try {
          data = await response.json();
          if (data && Array.isArray(data)) {
            usedEnv = host.env;
            console.log(`[NCM] Sucesso! Recebidos ${data.length} NCMs do ambiente ${usedEnv}`);
            break outer;
          }
        } catch (e) {
          console.warn('[NCM] Resposta não é JSON válido, tentando próximo...');
          continue;
        }
      }
    }

    if (!data || !Array.isArray(data)) {
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
      
      // Sem empresaId: retornar dados locais como fallback
      return NextResponse.json({
        success: true,
        data: getNCMsLocais(codigo, descricao, limit, offset),
        totalCount: 3,
        source: 'local_fallback',
        error: `API FOCUS NFE retornou ${lastStatus}: ${lastErrorText}`
      });
    }

    // Extrair totalCount se disponível (Focus NFE pode retornar em headers)
    const totalCount = data.length; // Default: usar tamanho do array

    return NextResponse.json({
      success: true,
      data: data,
      totalCount: totalCount,
      source: 'focus_nfe',
      environment_used: usedEnv
    });

  } catch (error) {
    console.error('[NCM] Erro no proxy:', error);
    
    // Se empresaId presente, não retornar dados locais
    const empresaId = new URL(request.url).searchParams.get('empresa_id');
    if (empresaId) {
      return NextResponse.json(
        {
          success: false,
          error: { codigo: 'ERRO_REDE', mensagem: error instanceof Error ? error.message : 'Erro de conexão com a API FOCUS NFE' }
        },
        { status: 500 }
      );
    }
    
    // Sem empresaId: retornar dados locais como fallback
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
